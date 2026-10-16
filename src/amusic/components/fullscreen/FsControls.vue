<template>
  <div class="fs-controls" :data-size="size">
    <!-- scrubber, with the quality badge centred between the time labels -->
    <div class="fs-controls__timeline">
      <PlayerTimeline :show-labels="true" color="#ffffff" />
      <div class="fs-controls__badge">
        <AmusicQualityBadge tone="backdrop" />
      </div>
    </div>

    <div class="fs-controls__transport">
      <div class="fs-controls__side">
        <ShuffleBtn
          v-if="showShuffleRepeat"
          :player="store.activePlayer"
          :player-queue="store.activePlayerQueue"
          :size="iconSide"
        />
      </div>
      <PreviousBtn
        :player="store.activePlayer"
        :player-queue="store.activePlayerQueue"
        :size="iconSkip"
      />
      <PlayBtn
        :player="store.activePlayer"
        :player-queue="store.activePlayerQueue"
        :icon="{ staticWidth: `${playSize}px`, staticHeight: `${playSize}px` }"
        :size="iconSkip + 2"
      />
      <NextBtn
        :player="store.activePlayer"
        :player-queue="store.activePlayerQueue"
        :size="iconSkip"
      />
      <div class="fs-controls__side">
        <RepeatBtn
          v-if="showShuffleRepeat"
          :player="store.activePlayer"
          :player-queue="store.activePlayerQueue"
          :size="iconSide"
        />
      </div>
    </div>

    <div v-if="store.activePlayer" class="fs-controls__volume">
      <PlayerVolume
        :player="store.activePlayer"
        width="100%"
        color="#ffffff"
        :prefer-group-volume="true"
        :allow-wheel="true"
      />
      <!-- wide layouts keep the room beside volume; touch layouts use the dock -->
      <GlassSurface
        v-if="showRoom"
        as="button"
        tone="backdrop"
        class="fs-controls__room"
        @click="openPicker"
      >
        <PlayerIcon :icon="store.activePlayer.icon" :size="14" />
        <span>{{ store.activePlayer.name }}</span>
      </GlassSurface>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import PlayerIcon from "@/components/PlayerIcon.vue";
import NextBtn from "@/layouts/default/PlayerOSD/PlayerControlBtn/NextBtn.vue";
import PlayBtn from "@/layouts/default/PlayerOSD/PlayerControlBtn/PlayBtn.vue";
import PreviousBtn from "@/layouts/default/PlayerOSD/PlayerControlBtn/PreviousBtn.vue";
import RepeatBtn from "@/layouts/default/PlayerOSD/PlayerControlBtn/RepeatBtn.vue";
import ShuffleBtn from "@/layouts/default/PlayerOSD/PlayerControlBtn/ShuffleBtn.vue";
import PlayerTimeline from "@/layouts/default/PlayerOSD/PlayerTimeline.vue";
import PlayerVolume from "@/layouts/default/PlayerOSD/PlayerVolume.vue";
import { store } from "@/plugins/store";
import { openPicker } from "@/amusic/state";
import AmusicQualityBadge from "@/amusic/components/AmusicQualityBadge.vue";
import GlassSurface from "@/amusic/components/GlassSurface.vue";

interface Props {
  /** "large" for phones/tablets, "compact" for the desktop left column */
  size?: "large" | "compact";
  showRoom?: boolean;
  showShuffleRepeat?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  size: "large",
  showRoom: false,
  showShuffleRepeat: true,
});

const iconSkip = computed(() => (props.size === "large" ? 34 : 28));
const iconSide = computed(() => (props.size === "large" ? 22 : 20));
const playSize = computed(() => (props.size === "large" ? 64 : 52));
</script>

<style scoped>
.fs-controls {
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  color: #fff;
}

/* PlayerTimeline hangs its time labels ~26px below its own box; reserve that
   room so the transport below never crowds them */
.fs-controls__timeline {
  position: relative;
  padding-bottom: 18px;
}

/* level with the time labels, centred between them */
.fs-controls__badge {
  position: absolute;
  left: 50%;
  top: 25px;
  transform: translateX(-50%);
}

.fs-controls__transport {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4%;
}

.fs-controls__side {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: var(--am-target);
  min-height: var(--am-target);
  opacity: 0.75;
}

/* spec: adaptive-player-layout, touch targets. Upstream sizes these buttons
   to their icons; give each at least the target size without changing looks. */
.fs-controls__transport :deep(button),
.fs-controls__transport :deep([role="button"]),
.fs-controls__volume :deep(button) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* !important: upstream's Icon writes its minimums as inline styles */
  min-width: var(--am-target) !important;
  min-height: var(--am-target) !important;
}

/* the play button sits straight on the backdrop, Apple style: no disc */
.fs-controls :deep(.play-btn-icon) {
  background: transparent !important;
  color: #fff !important;
}

.fs-controls__volume {
  display: flex;
  align-items: center;
  gap: 12px;
}

.fs-controls__room {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
  height: max(32px, var(--am-target));
  padding: 0 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

.fs-controls[data-size="compact"] {
  gap: 14px;
}
</style>
