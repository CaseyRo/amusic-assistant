<template>
  <div class="fs-title" :data-size="size">
    <slot name="thumb"></slot>
    <div class="fs-title__text">
      <div class="fs-title__title">{{ title }}</div>
      <div class="fs-title__subtitle">{{ subtitle }}</div>
    </div>
    <GlassSurface tone="backdrop" class="fs-title__btn">
      <FavoriteMenuBtn icon-class="size-4" />
    </GlassSurface>
    <GlassSurface
      as="button"
      tone="backdrop"
      class="fs-title__btn"
      :aria-label="$t('tooltip.more_options')"
      @click.stop="emit('more', $event)"
    >
      <EllipsisIcon class="size-4" />
    </GlassSurface>
  </div>
</template>

<script setup lang="ts">
import { EllipsisIcon } from "@lucide/vue";
import FavoriteMenuBtn from "@/layouts/default/PlayerOSD/PlayerControlBtn/FavoriteMenuBtn.vue";
import GlassSurface from "@/amusic/components/GlassSurface.vue";

withDefaults(
  defineProps<{
    title: string;
    subtitle: string;
    size?: "large" | "compact";
  }>(),
  { size: "large" },
);
const emit = defineEmits<{ more: [event: Event] }>();
</script>

<style scoped>
.fs-title {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  color: #fff;
}

.fs-title__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.fs-title__title,
.fs-title__subtitle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fs-title__title {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 28px;
}

.fs-title__subtitle {
  font-size: 18px;
  font-weight: 500;
  line-height: 24px;
  color: rgb(255 255 255 / 0.68);
}

.fs-title[data-size="compact"] .fs-title__title {
  font-size: 19px;
  line-height: 24px;
}

.fs-title[data-size="compact"] .fs-title__subtitle {
  font-size: 15px;
  line-height: 20px;
}

.fs-title__btn {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  /* + 2px so the rim does not eat into the touch target */
  width: max(34px, calc(var(--am-target) + 2px));
  height: max(34px, calc(var(--am-target) + 2px));
  border-radius: 999px;
  color: #fff;
  cursor: pointer;
}

/* FavoriteMenuBtn is a ghost button; let the glass circle be the shape */
.fs-title__btn :deep(button) {
  /* !important: the shadcn button carries !important size utilities */
  width: 100% !important;
  height: 100% !important;
  color: #fff !important;
  background: transparent !important;
}
</style>
