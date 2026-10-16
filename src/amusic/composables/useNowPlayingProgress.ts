import { useIntervalFn } from "@vueuse/core";
import { computed, ref } from "vue";
import { resolveActiveElapsedTime } from "@/helpers/activeElapsedTime";
import { store } from "@/plugins/store";

const TICK_MS = 1000;

/** Percent of the active track played, on a coarse clock meant for hairlines. */
export function useNowPlayingProgress() {
  const tick = ref(0);
  useIntervalFn(() => tick.value++, TICK_MS);
  return computed(() => {
    void tick.value;
    const duration = store.activePlayer?.current_media?.duration;
    const elapsed = resolveActiveElapsedTime();
    if (!duration || elapsed == null) return 0;
    return Math.min(100, Math.max(0, (elapsed / duration) * 100));
  });
}
