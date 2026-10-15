<template>
  <!-- spec: now-playing-fullscreen - the glass dock on touch layouts:
       lyrics, the current room (opens the output picker) and the queue -->
  <GlassSurface tone="backdrop" class="fs-dock" role="toolbar">
    <button
      type="button"
      class="fs-dock__btn"
      :data-active="panel === 'lyrics'"
      :disabled="!lyricsAvailable"
      :aria-label="$t('lyrics')"
      :aria-pressed="panel === 'lyrics'"
      @click="emit('toggle', 'lyrics')"
    >
      <MessageSquareQuoteIcon class="size-5.5" />
    </button>
    <button
      type="button"
      class="fs-dock__room"
      :aria-label="$t('tooltip.select_player')"
      @click="store.showPlayersMenu = true"
    >
      <PlayerIcon :icon="store.activePlayer?.icon" :size="16" />
      <span>{{ roomLabel }}</span>
    </button>
    <button
      type="button"
      class="fs-dock__btn"
      :data-active="panel === 'queue'"
      :aria-label="$t('tooltip.toggle_queue')"
      :aria-pressed="panel === 'queue'"
      @click="emit('toggle', 'queue')"
    >
      <ListIcon class="size-5.5" />
    </button>
  </GlassSurface>
</template>

<script setup lang="ts">
import { ListIcon, MessageSquareQuoteIcon } from "@lucide/vue";
import { computed } from "vue";
import PlayerIcon from "@/components/PlayerIcon.vue";
import { store } from "@/plugins/store";
import GlassSurface from "@/amusic/components/GlassSurface.vue";

export type FsPanel = "none" | "lyrics" | "queue";

defineProps<{ panel: FsPanel; lyricsAvailable: boolean }>();
const emit = defineEmits<{ toggle: [panel: Exclude<FsPanel, "none">] }>();

// "Kitchen +1" for a group, like the room chip in the designs
const roomLabel = computed(() => {
  const player = store.activePlayer;
  if (!player) return "";
  const extra = Math.max(0, (player.group_members?.length ?? 0) - 1);
  return extra ? `${player.name} +${extra}` : player.name;
});
</script>

<style scoped>
.fs-dock {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  width: min(340px, 100%);
  height: 58px;
  padding: 0 7px;
  border-radius: 29px;
}

.fs-dock__btn,
.fs-dock__room {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  border-radius: 22px;
  color: #fff;
  transition: background-color 0.2s ease;
}

.fs-dock__btn {
  width: 72px;
}

.fs-dock__btn:disabled {
  opacity: 0.35;
}

.fs-dock__btn[data-active="true"] {
  background: rgb(255 255 255 / 0.92);
  color: #111;
}

.fs-dock__room {
  gap: 8px;
  max-width: 160px;
  padding: 0 14px;
  font-size: 14px;
  font-weight: 700;
}

.fs-dock__room span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
