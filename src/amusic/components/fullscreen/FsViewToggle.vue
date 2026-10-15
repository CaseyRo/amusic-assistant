<template>
  <!-- spec: now-playing-fullscreen - Lyrics / Up next on wide layouts -->
  <GlassSurface tone="backdrop" class="fs-toggle" role="tablist">
    <button
      type="button"
      role="tab"
      class="fs-toggle__opt"
      :aria-selected="panel === 'lyrics'"
      :disabled="!lyricsAvailable"
      :title="lyricsAvailable ? undefined : $t('lyrics_unavailable_song')"
      @click="emit('select', 'lyrics')"
    >
      {{ $t("lyrics") }}
    </button>
    <button
      type="button"
      role="tab"
      class="fs-toggle__opt"
      :aria-selected="panel === 'queue'"
      @click="emit('select', 'queue')"
    >
      {{ $t("up_next") }}
    </button>
  </GlassSurface>
</template>

<script setup lang="ts">
import GlassSurface from "@/amusic/components/GlassSurface.vue";
import type { FsPanel } from "./FsDock.vue";

defineProps<{ panel: FsPanel; lyricsAvailable: boolean }>();
const emit = defineEmits<{ select: [panel: "lyrics" | "queue"] }>();
</script>

<style scoped>
.fs-toggle {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 22px;
}

.fs-toggle__opt {
  height: max(34px, var(--am-target));
  padding: 0 16px;
  border-radius: 18px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}

.fs-toggle__opt[aria-selected="true"] {
  background: rgb(255 255 255 / 0.92);
  color: #111;
  font-weight: 700;
}

.fs-toggle__opt:disabled {
  opacity: 0.4;
  text-decoration: line-through;
}
</style>
