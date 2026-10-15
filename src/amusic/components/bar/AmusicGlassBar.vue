<template>
  <!-- spec: floating-player-bar. A strip pinned over the content area; only the
       pane inside takes clicks, so content beside it stays usable. -->
  <div class="am-bar-strip" :style="stripStyle">
    <GlassSurface
      id="player-bar"
      class="am-bar"
      role="region"
      :aria-label="$t('now_playing')"
    >
      <div class="am-bar__transport">
        <!-- wrapped: the buttons have several roots, so a class would not land -->
        <span class="am-bar__side">
          <ShuffleBtn
            :player="store.activePlayer"
            :player-queue="store.activePlayerQueue"
            :size="17"
          />
        </span>
        <PreviousBtn
          :player="store.activePlayer"
          :player-queue="store.activePlayerQueue"
          :size="22"
        />
        <PlayBtn
          :player="store.activePlayer"
          :player-queue="store.activePlayerQueue"
          :icon="{ staticWidth: '38px', staticHeight: '38px' }"
          :size="20"
        />
        <NextBtn
          :player="store.activePlayer"
          :player-queue="store.activePlayerQueue"
          :size="22"
        />
        <span class="am-bar__side">
          <RepeatBtn
            :player="store.activePlayer"
            :player-queue="store.activePlayerQueue"
            :size="17"
          />
        </span>
      </div>

      <!-- the "LCD": what is playing, with a hairline of progress at its foot -->
      <button
        type="button"
        class="am-bar__lcd"
        :aria-label="$t('now_playing')"
        @click="openFullscreen('none')"
      >
        <AmusicCover
          v-if="media"
          class="am-bar__art"
          :image-url="media.image_url"
          :seed="seed"
          :radius="6"
          :show-title="false"
        />
        <span class="am-bar__text">
          <span class="am-bar__title">{{ title }}</span>
          <span class="am-bar__subtitle">
            <span>{{ media?.artist }}</span>
            <span v-if="media?.album" class="am-bar__album">
              — {{ media.album }}</span
            >
          </span>
        </span>
        <AmusicQualityBadge class="am-bar__badge" :show-format="false" />
        <span
          class="am-bar__progress"
          :style="{ width: `${progress}%` }"
        ></span>
      </button>

      <div class="am-bar__actions">
        <button
          type="button"
          class="am-bar__action"
          :aria-label="$t('lyrics')"
          @click="openFullscreen('lyrics')"
        >
          <MessageSquareQuoteIcon class="size-[18px]" />
        </button>
        <button
          type="button"
          class="am-bar__action"
          :aria-label="$t('tooltip.toggle_queue')"
          @click="openFullscreen('queue')"
        >
          <ListIcon class="size-[18px]" />
        </button>
        <PlayerBarVolumeControl
          v-if="store.activePlayer"
          :player="store.activePlayer"
        />
        <button
          type="button"
          class="am-bar__room"
          :aria-label="$t('tooltip.select_player')"
          @click="store.showPlayersMenu = true"
        >
          <PlayerIcon :icon="store.activePlayer?.icon" :size="14" />
          <span>{{ roomLabel }}</span>
        </button>
      </div>
    </GlassSurface>
  </div>
</template>

<script setup lang="ts">
import { ListIcon, MessageSquareQuoteIcon } from "@lucide/vue";
import { useElementBounding, useIntervalFn } from "@vueuse/core";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import PlayerIcon from "@/components/PlayerIcon.vue";
import { resolveActiveElapsedTime } from "@/helpers/activeElapsedTime";
import NextBtn from "@/layouts/default/PlayerOSD/PlayerControlBtn/NextBtn.vue";
import PlayBtn from "@/layouts/default/PlayerOSD/PlayerControlBtn/PlayBtn.vue";
import PreviousBtn from "@/layouts/default/PlayerOSD/PlayerControlBtn/PreviousBtn.vue";
import RepeatBtn from "@/layouts/default/PlayerOSD/PlayerControlBtn/RepeatBtn.vue";
import ShuffleBtn from "@/layouts/default/PlayerOSD/PlayerControlBtn/ShuffleBtn.vue";
import PlayerBarVolumeControl from "@/layouts/default/PlayerOSD/PlayerBarVolumeControl.vue";
import { store } from "@/plugins/store";
import AmusicCover from "@/amusic/components/AmusicCover.vue";
import AmusicQualityBadge from "@/amusic/components/AmusicQualityBadge.vue";
import GlassSurface from "@/amusic/components/GlassSurface.vue";
import { coverSeed } from "@/amusic/composables/useNowPlayingPalette";
import { requestedFullscreenPanel } from "@/amusic/state";

const media = computed(() => store.activePlayer?.current_media ?? null);
const seed = computed(() => (media.value ? coverSeed(media.value) : ""));
// idle: the player's own name, so the bar always says where it would play
const title = computed(
  () => media.value?.title ?? store.activePlayer?.name ?? "",
);

const roomLabel = computed(() => {
  const player = store.activePlayer;
  if (!player) return "";
  const extra = Math.max(0, (player.group_members?.length ?? 0) - 1);
  return extra ? `${player.name} +${extra}` : player.name;
});

// a hairline only needs a coarse clock
const tick = ref(0);
useIntervalFn(() => tick.value++, 1000);
const progress = computed(() => {
  void tick.value;
  const duration = media.value?.duration;
  const elapsed = resolveActiveElapsedTime();
  if (!duration || elapsed == null) return 0;
  return Math.min(100, Math.max(0, (elapsed / duration) * 100));
});

function openFullscreen(panel: "none" | "lyrics" | "queue") {
  if (!store.activePlayer) {
    store.showPlayersMenu = true;
    return;
  }
  requestedFullscreenPanel.value = panel;
  store.showFullscreenPlayer = true;
}

// centre over the content area, which the sidebar narrows
const inset = ref<HTMLElement | null>(null);
onMounted(() => {
  inset.value = document.querySelector<HTMLElement>(
    '[data-slot="sidebar-inset"]',
  );
  // lets tokens.css reserve room for the bar under the scrolling content
  document.documentElement.setAttribute("data-amusic-bar", "");
});
onBeforeUnmount(() =>
  document.documentElement.removeAttribute("data-amusic-bar"),
);
const { left, right } = useElementBounding(inset);
const stripStyle = computed(() =>
  inset.value
    ? { left: `${left.value}px`, width: `${right.value - left.value}px` }
    : { left: "0px", width: "100%" },
);
</script>

<style scoped>
.am-bar-strip {
  position: fixed;
  bottom: calc(
    var(--am-bar-gap) + var(--device-inset-bottom, 0px) +
      var(--am-bar-bottom-extra, 0px)
  );
  z-index: 1000;
  display: flex;
  justify-content: center;
  padding: 0 var(--am-bar-gap);
  pointer-events: none;
}

.am-bar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: var(--am-bar-max-width);
  height: var(--am-bar-height);
  padding: 0 8px 0 14px;
  border-radius: var(--am-bar-radius);
  container-type: inline-size;
  pointer-events: auto;
}

.am-bar__transport {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
}

.am-bar__side {
  display: flex;
  opacity: 0.7;
}

.am-bar__transport :deep(button),
.am-bar__transport :deep([role="button"]) {
  min-width: var(--am-target) !important;
  min-height: var(--am-target) !important;
}

.am-bar__lcd {
  position: relative;
  display: flex;
  flex: 1;
  align-items: center;
  gap: 10px;
  /* the title is what the bar is for; everything else gives way first */
  min-width: 150px;
  height: 44px;
  padding: 0 12px 0 4px;
  overflow: hidden;
  border-radius: 10px;
  background: color-mix(in srgb, var(--am-glass-fill-strong) 80%, transparent);
  border: 1px solid var(--am-glass-hairline);
  text-align: center;
  cursor: pointer;
}

.am-bar__art {
  width: 36px;
  flex-shrink: 0;
}

.am-bar__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  line-height: 1.25;
}

.am-bar__title,
.am-bar__subtitle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.am-bar__title {
  font-size: 13px;
  font-weight: 600;
}

.am-bar__subtitle {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.62);
}

.am-bar__badge {
  flex-shrink: 0;
}

.am-bar__progress {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 2px;
  background: rgb(var(--v-theme-primary));
  transition: width 1s linear;
}

.am-bar__actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 2px;
}

.am-bar__action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--am-target);
  height: var(--am-target);
  border-radius: 999px;
  color: rgba(var(--v-theme-on-surface), 0.78);
}

.am-bar__action:hover {
  background: rgba(var(--v-theme-on-surface), 0.06);
}

/* upstream's volume control is a labelled column button with several roots,
   so it is reached from the row; here it is just an icon */
.am-bar__actions :deep(.player-bar-volume-button) {
  width: var(--am-target) !important;
  height: var(--am-target) !important;
  padding: 0 !important;
  border-radius: 999px !important;
}

.am-bar__actions :deep(.player-bar-action-label) {
  display: none !important;
}

/* Apple's bar has a bare play glyph, no disc */
.am-bar__transport :deep(.play-btn-icon) {
  background: transparent !important;
  color: rgb(var(--v-theme-on-surface)) !important;
}

.am-bar__room {
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 150px;
  height: 34px;
  margin-left: 6px;
  padding: 0 12px;
  border-radius: 17px;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  font-size: 12px;
  font-weight: 600;
}

.am-bar__room span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* spec: degrade by the bar's own width - shuffle/repeat go first, then album */
@container (max-width: 760px) {
  .am-bar__side {
    display: none;
  }
}

@container (max-width: 640px) {
  .am-bar__album,
  .am-bar__badge {
    display: none;
  }

  .am-bar__room {
    max-width: 112px;
  }
}
</style>
