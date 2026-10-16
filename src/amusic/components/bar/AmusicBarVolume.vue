<template>
  <!-- Apple Music's bar volume: a speaker at rest that grows, in place, into a
       glass pill with the slider; no panel. Hover opens it with a mouse, a tap
       on touch screens. -->
  <div
    ref="root"
    class="am-vol"
    :data-open="open || undefined"
    @pointerenter="onEnter"
    @pointerleave="onLeave"
    @focusout="onFocusOut"
    @keydown.esc="open = false"
  >
    <div v-if="open" class="am-vol__pill">
      <!-- upstream's slider: group volume, mute and wheel handling stay its own;
           its mute icon is moved to the right, where the speaker was -->
      <PlayerVolume
        :player="player"
        :show-volume-level="false"
        :prefer-group-volume="true"
        :enable-popout="false"
        :icon-size="18"
        allow-wheel
      />
    </div>
    <button
      v-else
      type="button"
      class="am-vol__speaker"
      :aria-label="$t('volume')"
      :aria-expanded="false"
      @click="open = true"
    >
      <component :is="volumeIcon" class="size-[18px]" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside, useTimeoutFn } from "@vueuse/core";
import { computed, ref } from "vue";
import { isPlayerGrouped } from "@/helpers/players";
import { getVolumeIconComponent } from "@/helpers/utils";
import PlayerVolume from "@/layouts/default/PlayerOSD/PlayerVolume.vue";
import type { Player } from "@/plugins/api/interfaces";

const props = defineProps<{ player: Player }>();

// a pointer that wanders off for a moment should not snap the pill shut
const CLOSE_DELAY_MS = 450;

const open = ref(false);
const root = ref<HTMLElement | null>(null);
const { start: closeSoon, stop: keepOpen } = useTimeoutFn(
  () => (open.value = false),
  CLOSE_DELAY_MS,
  { immediate: false },
);

function onEnter(event: PointerEvent) {
  if (event.pointerType !== "mouse") return;
  keepOpen();
  open.value = true;
}

function onLeave(event: PointerEvent) {
  if (event.pointerType === "mouse") closeSoon();
}

function onFocusOut(event: FocusEvent) {
  const next = event.relatedTarget as Node | null;
  if (!next || !root.value?.contains(next)) closeSoon();
}

onClickOutside(root, () => (open.value = false));

// same reading as upstream's bar control: the group's volume when grouped
const grouped = computed(() => isPlayerGrouped(props.player));
const level = computed(() =>
  Math.round(
    grouped.value
      ? (props.player.group_volume ?? 0)
      : (props.player.volume_level ?? 0),
  ),
);
const muted = computed(() =>
  grouped.value
    ? props.player.group_volume_muted === true
    : props.player.volume_muted === true,
);
const volumeIcon = computed(() =>
  getVolumeIconComponent(props.player, level.value, muted.value),
);
</script>

<style scoped>
.am-vol {
  position: relative;
  display: flex;
  justify-content: flex-end;
  width: var(--am-target);
  height: var(--am-target);
}

.am-vol__speaker {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 999px;
  color: rgba(var(--v-theme-on-surface), 0.78);
}

.am-vol__speaker:hover {
  background: rgba(var(--v-theme-on-surface), 0.06);
}

/* grows leftwards over its neighbours, anchored at the speaker's right edge */
.am-vol__pill {
  position: absolute;
  top: 50%;
  right: -4px;
  z-index: 2;
  display: flex;
  align-items: center;
  /* covers exactly the lyrics, queue and mini player buttons and itself */
  width: calc(4 * var(--am-target) + 14px);
  height: 40px;
  padding: 0 6px 0 16px;
  border-radius: 20px;
  background: var(--am-glass-fill-strong);
  backdrop-filter: var(--am-glass-blur);
  border: 1px solid var(--am-glass-rim);
  box-shadow:
    inset 0 1px 0 var(--am-glass-highlight),
    0 6px 18px rgb(0 0 0 / 0.12);
  transform: translateY(-50%);
  transform-origin: right center;
  animation: am-vol-grow 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.am-vol__pill :deep(.player-volume-wrapper),
.am-vol__pill :deep(.player-volume-container) {
  flex: 1;
  width: 100%;
}

/* slider first, speaker (upstream's mute button) last, as Apple has it */
.am-vol__pill :deep(.volume-prepend) {
  order: 2;
}

.am-vol__pill :deep(.volume-slider) {
  order: 1;
}

@keyframes am-vol-grow {
  from {
    opacity: 0;
    transform: translateY(-50%) scaleX(0.3);
  }
}

@media (prefers-reduced-motion: reduce) {
  .am-vol__pill {
    animation: none;
  }
}
</style>
