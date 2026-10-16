import { useMutationObserver, usePreferredReducedMotion } from "@vueuse/core";
import Color from "color";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { appAccent } from "@/amusic/palette";
import { useNowPlayingPalette } from "@/amusic/composables/useNowPlayingPalette";

const TRANSITION_MS = 600;
type RGB = [number, number, number];

/**
 * Drives the app accent from the playing track's artwork (spec: app-theme).
 * Writes --am-accent (+ an "r,g,b" twin for Vuetify) on <html>; theme.css maps
 * them onto Vuetify's and Tailwind's primary tokens. Tweened rather than CSS
 * transitioned, because Vuetify needs the comma triplet, which CSS cannot
 * interpolate.
 */
export function useArtworkAccent() {
  const root = document.documentElement;
  const dark = ref(root.classList.contains("dark"));
  useMutationObserver(
    root,
    () => (dark.value = root.classList.contains("dark")),
    { attributes: true, attributeFilter: ["class"] },
  );

  const { palette } = useNowPlayingPalette();
  const target = computed(() => appAccent(palette.value, dark.value));
  const reducedMotion = usePreferredReducedMotion();

  let current: RGB | null = null;
  let frame = 0;

  function write(rgb: RGB, onAccent: string) {
    const color = Color.rgb(rgb);
    root.style.setProperty("--am-accent", color.hex());
    root.style.setProperty("--am-accent-rgb", rgb.map(Math.round).join(","));
    root.style.setProperty("--am-on-accent", onAccent);
    root.style.setProperty(
      "--am-on-accent-rgb",
      Color(onAccent).rgb().array().join(","),
    );
    current = rgb;
  }

  watch(
    target,
    ({ accent, onAccent }) => {
      cancelAnimationFrame(frame);
      const to = Color(accent).rgb().array() as RGB;
      const from = current;
      if (!from || reducedMotion.value === "reduce") {
        write(to, onAccent);
        return;
      }
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / TRANSITION_MS);
        const ease = 1 - (1 - t) ** 3;
        write(from.map((c, i) => c + (to[i] - c) * ease) as RGB, onAccent);
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    },
    { immediate: true },
  );

  onBeforeUnmount(() => cancelAnimationFrame(frame));
}
