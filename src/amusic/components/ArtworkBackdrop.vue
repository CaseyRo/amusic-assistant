<template>
  <!-- spec: now-playing-fullscreen, "Artwork-tinted backdrop". Each palette
       gets its own layer; the new one fades in over the old, so a track change
       crossfades instead of snapping. Purely decorative. -->
  <div class="am-backdrop" aria-hidden="true">
    <TransitionGroup name="am-backdrop-fade">
      <div
        v-for="layer in layers"
        :key="layer.key"
        class="am-backdrop__layer"
        :style="{ backgroundColor: layer.palette.deep }"
      >
        <div
          class="am-backdrop__field am-backdrop__field--a"
          :style="{ background: layer.palette.primary }"
        ></div>
        <div
          class="am-backdrop__field am-backdrop__field--b"
          :style="{ background: layer.palette.accent }"
        ></div>
        <div
          class="am-backdrop__field am-backdrop__field--c"
          :style="{ background: layer.palette.deep }"
        ></div>
        <div
          class="am-backdrop__scrim"
          :style="{ opacity: scrimFor(layer.palette) }"
        ></div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { type AmPalette, scrimFor } from "@/amusic/palette";

const props = defineProps<{ palette: AmPalette | null }>();

const FALLBACK: AmPalette = {
  primary: "#3A3A44",
  accent: "#24242C",
  deep: "#121216",
};

// keyed by colour, so only a real palette change starts a crossfade
const layers = computed(() => {
  const palette = props.palette ?? FALLBACK;
  return [{ key: Object.values(palette).join(), palette }];
});
</script>

<style scoped>
.am-backdrop {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.am-backdrop__layer {
  position: absolute;
  inset: 0;
}

/* blurred once and never animated: only the bar, dock and toggles blur live */
.am-backdrop__field {
  position: absolute;
  border-radius: 50%;
  filter: blur(min(14vmax, 160px));
}

.am-backdrop__field--a {
  left: -15%;
  top: -10%;
  width: 70vmax;
  height: 70vmax;
  opacity: 0.75;
}

.am-backdrop__field--b {
  right: -20%;
  top: 30%;
  width: 60vmax;
  height: 60vmax;
  opacity: 0.55;
}

.am-backdrop__field--c {
  left: -10%;
  bottom: -30%;
  width: 60vmax;
  height: 60vmax;
  opacity: 0.9;
}

.am-backdrop__scrim {
  position: absolute;
  inset: 0;
  background: #000;
}

.am-backdrop-fade-enter-active,
.am-backdrop-fade-leave-active {
  transition: opacity 900ms ease;
}

.am-backdrop-fade-enter-from,
.am-backdrop-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .am-backdrop-fade-enter-active,
  .am-backdrop-fade-leave-active {
    transition: none;
  }
}
</style>
