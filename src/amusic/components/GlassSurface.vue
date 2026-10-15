<template>
  <component :is="as" class="am-glass" :data-tone="tone">
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
/**
 * Liquid-glass surface: translucent fill that blurs what is behind it, a light
 * rim and an inner highlight. Falls back to an opaque tint where the browser
 * cannot blur (spec: now-playing-fullscreen, "Liquid-glass controls").
 */
interface Props {
  /** "app" sits on app surfaces and follows the theme; "backdrop" sits on artwork and is always light-on-dark */
  tone?: "app" | "backdrop";
  as?: string;
}

withDefaults(defineProps<Props>(), { tone: "app", as: "div" });
</script>

<style scoped>
.am-glass {
  background: var(--am-glass-fill);
  /* unprefixed only: the minifier keeps one of a hand-written pair */
  backdrop-filter: var(--am-glass-blur);
  border: 1px solid var(--am-glass-rim);
  box-shadow:
    inset 0 1px 0 var(--am-glass-highlight),
    0 0 0 0.5px var(--am-glass-hairline),
    var(--am-glass-shadow);
}

.am-glass[data-tone="backdrop"] {
  color: #fff;
  background: linear-gradient(
    180deg,
    rgb(255 255 255 / 0.24),
    var(--am-glass-dark-fill)
  );
  border-color: var(--am-glass-dark-rim);
  box-shadow:
    inset 0 1px 0 var(--am-glass-dark-highlight),
    0 12px 30px rgb(0 0 0 / 0.3);
}

@supports not (backdrop-filter: blur(1px)) {
  .am-glass {
    background: var(--am-glass-fallback);
  }
  .am-glass[data-tone="backdrop"] {
    background: var(--am-glass-dark-fallback);
  }
}
</style>
