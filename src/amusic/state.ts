import { ref, shallowRef } from "vue";
import { store } from "@/plugins/store";

/**
 * The panel the fullscreen player should open on, set by whoever opens it
 * (the glass bar's lyrics and queue actions) and consumed once on open.
 * Kept here rather than in upstream's store.
 */
export const requestedFullscreenPanel = ref<"none" | "lyrics" | "queue" | null>(
  null,
);

/** The control that last opened the output picker, which it anchors to. */
export const pickerTrigger = shallowRef<HTMLElement | null>(null);

/** Opens the output picker anchored to the clicked control (spec: output-picker). */
export function openPicker(event: Event) {
  pickerTrigger.value = event.currentTarget as HTMLElement | null;
  store.showPlayersMenu = true;
}

/** Anchors to the opening control while it is on screen, else to `fallback`. */
export function triggerAnchor(fallback: {
  getBoundingClientRect: () => DOMRect;
}) {
  return {
    getBoundingClientRect: () => {
      const trigger = pickerTrigger.value;
      return trigger?.isConnected && trigger.offsetParent
        ? trigger.getBoundingClientRect()
        : fallback.getBoundingClientRect();
    },
  };
}
