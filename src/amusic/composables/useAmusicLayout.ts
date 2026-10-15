import { useElementSize } from "@vueuse/core";
import { computed, type MaybeRefOrGetter, toValue } from "vue";

export type AmusicLayout =
  | "phone-portrait"
  | "phone-landscape"
  | "tablet-portrait"
  | "tablet-landscape"
  | "desktop";

/**
 * Which player layout fits a box of this size. Shape only: the device type and
 * touch input never decide it (spec: adaptive-player-layout). First match wins.
 */
export function classifyLayout(width: number, height: number): AmusicLayout {
  if (height < 500 && width > height) return "phone-landscape";
  if (width < 600) return "phone-portrait";
  if (width < 1000) return "tablet-portrait";
  if (width <= 1366) return "tablet-landscape";
  return "desktop";
}

export const isPhoneLayout = (layout: AmusicLayout) =>
  layout === "phone-portrait" || layout === "phone-landscape";

/** Tall layouts collapse the artwork into a header when a panel opens. */
export const isStackedLayout = (layout: AmusicLayout) =>
  layout === "phone-portrait" || layout === "tablet-portrait";

/**
 * Tracks the layout of an element, re-evaluated on every resize or rotation.
 * Without an element it measures the window, which is what fills it anyway
 * for the fullscreen player.
 */
export function useAmusicLayout(
  target?: MaybeRefOrGetter<HTMLElement | null | undefined>,
) {
  const element = computed(() => toValue(target) ?? document.documentElement);
  const { width, height } = useElementSize(element);
  return computed(() => classifyLayout(width.value, height.value));
}
