import { ref } from "vue";

/**
 * The panel the fullscreen player should open on, set by whoever opens it
 * (the glass bar's lyrics and queue actions) and consumed once on open.
 * Kept here rather than in upstream's store.
 */
export const requestedFullscreenPanel = ref<"none" | "lyrics" | "queue" | null>(
  null,
);
