<template>
  <div class="am-cover" :style="{ borderRadius: `${radius}px` }">
    <img
      v-if="imageUrl && !failed"
      :src="getMediaImageUrl(imageUrl)"
      :alt="title ?? ''"
      class="am-cover__img"
      @error="failed = true"
    />
    <!-- spec: now-playing-fullscreen, "No-artwork state" - never a grey box -->
    <div
      v-else
      class="am-cover__generated"
      :style="{
        background: `linear-gradient(150deg, ${generated.primary} 0%, ${generated.accent} 55%, ${generated.deep} 100%)`,
      }"
    >
      <span v-if="showTitle && title" class="am-cover__title">{{ title }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { getMediaImageUrl } from "@/helpers/utils";
import { generatedPalette } from "@/amusic/palette";

interface Props {
  imageUrl?: string | null;
  /** identity for the generated cover, see coverSeed() */
  seed: string;
  title?: string | null;
  radius?: number;
  /** set the title as type on generated covers; off for thumbnails */
  showTitle?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  imageUrl: null,
  title: null,
  radius: 12,
  showTitle: true,
});

const failed = ref(false);
watch(
  () => props.imageUrl,
  () => (failed.value = false),
);

const generated = computed(() => generatedPalette(props.seed));
</script>

<style scoped>
.am-cover {
  position: relative;
  overflow: hidden;
  aspect-ratio: 1;
  container-type: inline-size;
}

.am-cover__img,
.am-cover__generated {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.am-cover__generated {
  display: flex;
  align-items: flex-end;
  padding: 7cqi;
}

.am-cover__title {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: rgb(255 255 255 / 0.95);
  font-size: 11cqi;
  font-weight: 900;
  line-height: 0.95;
  letter-spacing: -0.04em;
  text-shadow: 0 1px 12px rgb(0 0 0 / 0.2);
}
</style>
