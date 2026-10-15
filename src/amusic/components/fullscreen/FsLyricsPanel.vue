<template>
  <div class="fs-lyrics" :data-size="size">
    <!-- spec: now-playing-fullscreen, "No-lyrics state" - a message, not a void -->
    <div
      v-if="state === 'unavailable' || state === 'none'"
      class="fs-lyrics__none"
    >
      <MessageSquareOffIcon class="size-8" />
      <span>{{ $t("no_lyrics_available") }}</span>
    </div>
    <LyricsViewer
      v-else
      :media-item="store.curQueueItem?.media_item"
      :position="elapsedTime"
      :stream-details="store.curQueueItem?.streamdetails"
      text-color="#ffffff"
      :lyrics="lyrics.plain"
      :lrc-lyrics="lyrics.synced"
      :offset="offset"
      :external-loading="state === 'loading'"
    />
  </div>
</template>

<script setup lang="ts">
import { MessageSquareOffIcon } from "@lucide/vue";
import LyricsViewer from "@/components/LyricsViewer.vue";
import { store } from "@/plugins/store";
import type { LyricsState } from "@/amusic/composables/useNowPlayingLyrics";

withDefaults(
  defineProps<{
    lyrics: { plain: string | null; synced: string | null };
    state: LyricsState;
    elapsedTime: number | undefined;
    offset: number;
    size?: "large" | "compact";
  }>(),
  { size: "large" },
);
</script>

<style scoped>
.fs-lyrics {
  position: relative;
  height: 100%;
  min-height: 0;
  color: #fff;
  /* fade lines in and out at the panel edges instead of cutting them */
  mask-image: linear-gradient(
    to bottom,
    transparent 0,
    #000 12%,
    #000 82%,
    transparent 100%
  );
}

.fs-lyrics__none {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 100%;
  font-size: 17px;
  font-weight: 600;
  color: rgb(255 255 255 / 0.6);
}

/* spec: "Synced lyrics presentation" - current line full contrast, the rest
   dimmed and blurred by distance. Upstream hides distant lines; we keep them
   faintly visible, like Apple does. */
.fs-lyrics :deep(.lyrics-line) {
  font-size: clamp(28px, 3.1vw, 46px);
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.18;
  text-align: left;
  opacity: 0.42;
  filter: blur(1.2px);
  transition:
    opacity 0.45s ease,
    filter 0.45s ease;
}

.fs-lyrics :deep(.lyrics-line.lyrics-line--far) {
  opacity: 0.26;
  filter: blur(2.6px);
}

.fs-lyrics :deep(.lyrics-line.lyrics-line--hidden) {
  opacity: 0.14;
  filter: blur(4.5px);
}

.fs-lyrics :deep(.lyrics-line.active) {
  opacity: 1;
  filter: none;
}

/* unsynced lyrics: a plain readable block, no per-line treatment */
.fs-lyrics :deep(.static-lyrics .lyrics-line) {
  font-size: clamp(22px, 2.2vw, 30px);
  opacity: 0.9;
  filter: none;
}

.fs-lyrics[data-size="compact"] :deep(.lyrics-line) {
  font-size: clamp(26px, 6.5vw, 34px);
}

@media (prefers-reduced-motion: reduce) {
  .fs-lyrics :deep(.lyrics-line) {
    transition: none;
  }
}
</style>
