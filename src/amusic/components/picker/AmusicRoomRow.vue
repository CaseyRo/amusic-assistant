<template>
  <!-- spec: output-picker, "Room rows". One room: what it plays, its quality,
       its place in the active room's group, and its own volume. -->
  <div
    class="am-room"
    :data-player-id="player.player_id"
    :data-active="isActive || undefined"
  >
    <div class="am-room__head">
      <button
        type="button"
        class="am-room__main"
        :aria-current="isActive ? 'true' : undefined"
        @click="emit('select', player)"
      >
        <AmusicCover
          v-if="media"
          class="am-room__art"
          :image-url="media.image_url"
          :seed="seed"
          :radius="8"
          :show-title="false"
        />
        <span v-else class="am-room__art am-room__art--icon">
          <PlayerIcon :icon="player.icon" :size="20" />
        </span>
        <span class="am-room__text">
          <span class="am-room__name">{{ name }}</span>
          <span class="am-room__subtitle">{{ subtitle }}</span>
        </span>
      </button>

      <AmusicQualityBadge
        v-if="streaming"
        :player="player"
        :show-format="false"
      />

      <!-- the active room is checked; rooms that can join it get a toggle;
           the empty slot keeps the column aligned for the rest -->
      <span v-if="isActive" class="am-room__check" data-on="true">
        <CheckIcon class="size-3.5" />
      </span>
      <button
        v-else-if="groupable"
        type="button"
        class="am-room__check"
        :data-on="grouped || undefined"
        :aria-pressed="grouped"
        :aria-label="
          $t(grouped ? 'amusic_group_remove' : 'amusic_group_add', [name])
        "
        @click="toggleGroup"
      >
        <CheckIcon v-if="grouped" class="size-3.5" />
      </button>
      <span v-else class="am-room__check am-room__check--none"></span>
    </div>

    <div v-if="showVolume" class="am-room__volume">
      <PlayerVolume :player="player" :icon-size="16" :enable-popout="false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckIcon } from "@lucide/vue";
import { computed } from "vue";
import { toast } from "vue-sonner";
import PlayerIcon from "@/components/PlayerIcon.vue";
import {
  canBeGroupMember,
  canEditPlayerGroup,
  getPlayerDisplayName,
} from "@/helpers/players";
import PlayerVolume from "@/layouts/default/PlayerOSD/PlayerVolume.vue";
import { api } from "@/plugins/api";
import { PlaybackState, type Player } from "@/plugins/api/interfaces";
import { $t } from "@/plugins/i18n";
import { store } from "@/plugins/store";
import AmusicCover from "@/amusic/components/AmusicCover.vue";
import AmusicQualityBadge from "@/amusic/components/AmusicQualityBadge.vue";
import { coverSeed } from "@/amusic/composables/useNowPlayingPalette";

const props = defineProps<{ player: Player }>();
const emit = defineEmits<{ select: [player: Player] }>();

const name = computed(() => getPlayerDisplayName(props.player));
const isActive = computed(
  () => store.activePlayerId === props.player.player_id,
);
// as upstream's PlayerCard: a powered room shows what it has loaded, whatever
// its state; the quality badge only while it is actually streaming
const media = computed(() =>
  props.player.powered !== false && props.player.current_media?.title
    ? props.player.current_media
    : null,
);
const streaming = computed(
  () =>
    props.player.playback_state === PlaybackState.PLAYING ||
    props.player.playback_state === PlaybackState.PAUSED,
);
const seed = computed(() => (media.value ? coverSeed(media.value) : ""));
const subtitle = computed(() => {
  if (props.player.needs_setup) return $t("settings.setup_required");
  if (!media.value) return $t("amusic_not_playing");
  return [media.value.title, media.value.artist].filter(Boolean).join(" · ");
});
const showVolume = computed(
  () => props.player.powered !== false && !props.player.needs_setup,
);

// spec: "Grouping from the picker" - only rooms the active room can take in
const leader = computed(() => store.activePlayer);
const grouped = computed(
  () => !!leader.value?.group_members.includes(props.player.player_id),
);
const groupable = computed(() => {
  const active = leader.value;
  if (!active || !canEditPlayerGroup(active)) return false;
  const { player } = props;
  if (!canBeGroupMember(player) || player.needs_setup || !player.available) {
    return false;
  }
  return (
    grouped.value || active.can_group_with.includes(props.player.player_id)
  );
});

async function toggleGroup() {
  const active = leader.value;
  if (!active) return;
  const id = [props.player.player_id];
  const joining = !grouped.value;
  try {
    await api.playerCommandSetMembers(
      active.player_id,
      joining ? id : undefined,
      joining ? undefined : id,
    );
    toast.success(
      $t(joining ? "amusic_group_added" : "amusic_group_removed", [name.value]),
    );
  } catch (error) {
    toast.error($t("amusic_group_failed"), {
      description: error instanceof Error ? error.message : String(error),
    });
  }
}
</script>

<style scoped>
.am-room {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 14px;
}

.am-room[data-active] {
  background: color-mix(in srgb, var(--am-accent, #d1532f) 8%, transparent);
}

.am-room__head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.am-room__main {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 12px;
  min-width: 0;
  text-align: left;
}

.am-room__art {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}

.am-room__art--icon {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(var(--v-theme-on-surface), 0.07);
  color: rgba(var(--v-theme-on-surface), 0.62);
}

.am-room__text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.am-room__name,
.am-room__subtitle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.am-room__name {
  font-size: 15px;
  font-weight: 600;
  line-height: 18px;
}

[data-active] .am-room__name {
  font-weight: 700;
}

.am-room__subtitle {
  font-size: 13px;
  line-height: 16px;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

/* the round control, a fixed lane so rows line up */
.am-room__check {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 2px solid rgba(var(--v-theme-on-surface), 0.28);
  color: var(--am-on-accent, #fff);
}

.am-room__check[data-on] {
  border-color: transparent;
  background: var(--am-accent, #d1532f);
}

.am-room__check--none {
  border-color: transparent;
}

/* the circle stays small; its hit area grows to the touch target */
button.am-room__check::before {
  content: "";
  position: absolute;
  inset: calc((26px - var(--am-target)) / 2);
}

.am-room__volume {
  padding-left: 56px;
}
</style>
