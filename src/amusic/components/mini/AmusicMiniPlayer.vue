<template>
  <!-- spec: mini-player-window. Full-bleed artwork under a glass strip; it
       fills whatever window hosts it (picture-in-picture or popup). -->
  <div class="am-mini" :aria-label="$t('now_playing')" role="region">
    <AmusicCover
      v-if="media"
      class="am-mini__art"
      :image-url="media.image_url"
      :seed="seed"
      :title="media.title"
      :radius="0"
    />
    <div v-else class="am-mini__art am-mini__art--idle"></div>

    <GlassSurface tone="backdrop" class="am-mini__strip">
      <div class="am-mini__head">
        <div class="am-mini__text">
          <span class="am-mini__title">{{ title }}</span>
          <span class="am-mini__subtitle">{{ subtitle }}</span>
        </div>
        <AmusicQualityBadge tone="backdrop" :show-format="false" readonly />
      </div>
      <div class="am-mini__progress">
        <span :style="{ width: `${progress}%` }"></span>
      </div>
      <div class="am-mini__transport">
        <PreviousBtn
          :player="store.activePlayer"
          :player-queue="store.activePlayerQueue"
          :size="22"
        />
        <PlayBtn
          :player="store.activePlayer"
          :player-queue="store.activePlayerQueue"
          :icon="{ staticWidth: '40px', staticHeight: '40px' }"
          :size="24"
        />
        <NextBtn
          :player="store.activePlayer"
          :player-queue="store.activePlayerQueue"
          :size="22"
        />
      </div>
    </GlassSurface>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import NextBtn from "@/layouts/default/PlayerOSD/PlayerControlBtn/NextBtn.vue";
import PlayBtn from "@/layouts/default/PlayerOSD/PlayerControlBtn/PlayBtn.vue";
import PreviousBtn from "@/layouts/default/PlayerOSD/PlayerControlBtn/PreviousBtn.vue";
import { store } from "@/plugins/store";
import AmusicCover from "@/amusic/components/AmusicCover.vue";
import AmusicQualityBadge from "@/amusic/components/AmusicQualityBadge.vue";
import GlassSurface from "@/amusic/components/GlassSurface.vue";
import { coverSeed } from "@/amusic/composables/useNowPlayingPalette";
import { useNowPlayingProgress } from "@/amusic/composables/useNowPlayingProgress";

const media = computed(() => store.activePlayer?.current_media ?? null);
const seed = computed(() => (media.value ? coverSeed(media.value) : ""));
const title = computed(
  () => media.value?.title ?? store.activePlayer?.name ?? "",
);
const subtitle = computed(() =>
  [media.value?.artist, media.value ? store.activePlayer?.name : null]
    .filter(Boolean)
    .join(" · "),
);
const progress = useNowPlayingProgress();
</script>

<style scoped>
.am-mini {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #1c1c1e;
  color: #fff;
}

.am-mini__art {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  aspect-ratio: auto;
}

.am-mini__art--idle {
  background: linear-gradient(150deg, #3a3a3e, #1c1c1e);
}

.am-mini__strip {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 14px 12px;
  border-radius: 0;
  border-width: 1px 0 0;
}

/* a touch of shade so white type holds on pale artwork; scoped one level up
   so it outranks the glass tone's background shorthand */
.am-mini .am-mini__strip {
  background-color: rgb(0 0 0 / 0.22);
}

.am-mini__head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.am-mini__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.am-mini__title,
.am-mini__subtitle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.am-mini__title {
  font-size: 14px;
  font-weight: 700;
  line-height: 18px;
}

.am-mini__subtitle {
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  color: rgb(255 255 255 / 0.78);
}

.am-mini__progress {
  height: 3px;
  border-radius: 2px;
  background: rgb(255 255 255 / 0.3);
  overflow: hidden;
}

.am-mini__progress span {
  display: block;
  height: 100%;
  background: #fff;
  transition: width 1s linear;
}

.am-mini__transport {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  color: #fff;
}

.am-mini__transport :deep(button),
.am-mini__transport :deep([role="button"]) {
  min-width: 36px !important;
  min-height: 36px !important;
  color: #fff !important;
  /* upstream rests these at reduced opacity; on artwork they need full white */
  opacity: 1 !important;
}

.am-mini__transport :deep(.play-btn-icon) {
  background: transparent !important;
  color: #fff !important;
}

@media (prefers-reduced-motion: reduce) {
  .am-mini__progress span {
    transition: none;
  }
}
</style>
