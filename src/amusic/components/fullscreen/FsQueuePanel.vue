<template>
  <!-- The queue, re-templated over upstream's useFullscreenQueue (virtualised
       rows, paging, drag reorder, item menus); only the look is ours. -->
  <div
    ref="queueScrollRef"
    class="fs-queue"
    :style="`--queue-title-size: ${queueTitleFontSize}; --queue-subtitle-size: ${queueSubtitleFontSize};`"
  >
    <div v-if="queueEnded" class="fs-queue__note">{{ $t("queue_ended") }}</div>
    <div v-if="!totalItems" class="fs-queue__note">{{ $t("queue_empty") }}</div>
    <div
      v-else
      class="fs-queue__virt"
      :class="{ 'fs-queue__virt--dragging': isDragging }"
      :style="{ height: `${totalSize}px` }"
    >
      <div
        v-for="row in virtualRows"
        :key="row.index"
        :ref="measureRow"
        :data-index="row.index"
        class="fs-queue__row"
        :style="{
          transform: `translateY(${row.vItem.start + rowOffset(row.index)}px)`,
        }"
      >
        <div v-if="row.divider" class="fs-queue__divider">
          <span>{{ $t(row.divider) }}</span>
          <span
            v-if="row.divider === 'up_next' && upNextCount"
            class="fs-queue__count"
            >{{ upNextCount }}</span
          >
        </div>
        <QueueModeBanner v-if="row.divider === 'up_next'" />
        <QueueListItem
          v-if="row.item"
          :item="row.item"
          :state="row.state"
          :is-playing="playerActive"
          :dragging="draggingIndex === row.index"
          :marquee-sync="hoveredMarqueeSync"
          :request-badge-color="requestBadgeColor"
          :boost-badge-color="boostBadgeColor"
          @menu="(e: Event) => openQueueItemMenu(e, row.index)"
          @dragstart="(e: PointerEvent) => startItemDrag(e, row.index)"
        />
        <div v-else class="fs-queue__skeleton"></div>
        <!-- audiobook chapters of the playing item -->
        <div
          v-if="
            row.state === 'playing' &&
            row.item?.media_item?.metadata?.chapters?.length
          "
          class="fs-queue__chapters"
        >
          <button
            v-for="chapter in row.item.media_item.metadata.chapters"
            :key="chapter.position"
            type="button"
            class="fs-queue__chapter"
            :data-active="chapter.position === activeChapterPosition"
            @click.stop="chapterClicked(row.item.media_item, chapter)"
          >
            <span>{{ chapter.name }}</span>
            <span v-if="chapter.end">{{
              formatDuration(chapter.end - chapter.start)
            }}</span>
          </button>
        </div>
      </div>
      <div
        v-if="isDragging && draggedItem"
        class="fs-queue__ghost"
        :style="{ transform: `translateY(${ghostY}px)` }"
      >
        <QueueListItem
          :item="draggedItem"
          state="upcoming"
          :is-playing="playerActive"
          :dragging="true"
          :marquee-sync="hoveredMarqueeSync"
          :request-badge-color="requestBadgeColor"
          :boost-badge-color="boostBadgeColor"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useIntervalFn } from "@vueuse/core";
import { computed, ref } from "vue";
import { resolveActiveElapsedTime } from "@/helpers/activeElapsedTime";
import { resolveCurrentChapter } from "@/helpers/chapters";
import { formatDuration } from "@/helpers/utils";
import QueueListItem from "@/layouts/default/PlayerOSD/QueueListItem.vue";
import QueueModeBanner from "@/layouts/default/PlayerOSD/QueueModeBanner.vue";
import { useFullscreenQueue } from "@/layouts/default/PlayerOSD/useFullscreenQueue";
import { store } from "@/plugins/store";

// the panel only exists while the queue shows, so lyrics are never on top of it
const {
  queueScrollRef,
  virtualRows,
  totalItems,
  upNextCount,
  queueEnded,
  totalSize,
  measureRow,
  playerActive,
  hoveredMarqueeSync,
  requestBadgeColor,
  boostBadgeColor,
  queueTitleFontSize,
  queueSubtitleFontSize,
  openQueueItemMenu,
  chapterClicked,
  startItemDrag,
  draggingIndex,
  isDragging,
  draggedItem,
  ghostY,
  rowOffset,
} = useFullscreenQueue(ref(false));

// tick once a second only while the playing item has chapters
const tick = ref(0);
const chapters = computed(
  () => store.curQueueItem?.media_item?.metadata?.chapters,
);
useIntervalFn(() => chapters.value?.length && tick.value++, 1000);
const activeChapterPosition = computed(() => {
  void tick.value;
  return resolveCurrentChapter(
    chapters.value,
    resolveActiveElapsedTime(),
    store.activePlayer?.current_media?.duration,
  )?.chapter.position;
});
</script>

<style scoped>
.fs-queue {
  --text-color: #fff;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  color: #fff;
  mask-image: linear-gradient(
    to bottom,
    transparent 0,
    #000 4%,
    #000 92%,
    transparent 100%
  );
}

.fs-queue__note {
  padding: 24px 8px;
  font-size: 15px;
  font-weight: 600;
  color: rgb(255 255 255 / 0.6);
}

.fs-queue__virt {
  position: relative;
  width: 100%;
}

.fs-queue__row,
.fs-queue__ghost {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.fs-queue__virt--dragging .fs-queue__row {
  transition: transform 0.18s cubic-bezier(0.2, 0, 0, 1);
}

.fs-queue__ghost {
  z-index: 3;
  pointer-events: none;
}

.fs-queue__divider {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 18px 8px 8px;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.fs-queue__count {
  font-size: 13px;
  font-weight: 600;
  color: rgb(255 255 255 / 0.55);
}

.fs-queue__skeleton {
  height: 60px;
  margin: 6px 8px;
  border-radius: 8px;
  background: rgb(255 255 255 / 0.08);
}

.fs-queue__chapters {
  display: flex;
  flex-direction: column;
  padding: 0 8px 8px 64px;
}

.fs-queue__chapter {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 13px;
  color: rgb(255 255 255 / 0.72);
  text-align: left;
}

.fs-queue__chapter[data-active="true"] {
  background: rgb(255 255 255 / 0.14);
  color: #fff;
  font-weight: 600;
}
</style>
