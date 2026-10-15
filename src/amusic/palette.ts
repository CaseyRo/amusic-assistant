import Color from "color";
import type { MediaItemPalette } from "@/plugins/api/interfaces";

/** The three colours every amusic surface derives from: a bright field, a second field and a deep base. */
export interface AmPalette {
  primary: string;
  accent: string;
  deep: string;
}

type RGB = [number, number, number];

const hex = (rgb: RGB) => Color.rgb(rgb).hex();

/** The server's artwork palette, or null when it carries too little to use. */
export function fromServerPalette(
  palette: MediaItemPalette | null | undefined,
): AmPalette | null {
  if (!palette?.primary) return null;
  const primary = hex(palette.primary);
  const accent = hex(palette.accent ?? palette.primary);
  const deep = hex(
    palette.background_dark ??
      (Color(primary).darken(0.7).rgb().array() as RGB),
  );
  return { primary, accent, deep };
}

/** FNV-1a: tiny, stable across runs and platforms. */
function hash(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * A cover palette for media without artwork. Same seed, same palette, so every
 * track of an album shares its generated cover (spec: now-playing-fullscreen).
 */
export function generatedPalette(seed: string): AmPalette {
  const h = hash(seed);
  const hue = h % 360;
  // the second hue sits 25-85 degrees away, so covers are two-tone but never clash
  const shift = 25 + ((h >>> 9) % 60);
  return {
    primary: Color.hsl(hue, 85, 62).hex(),
    accent: Color.hsl((hue + shift) % 360, 75, 52).hex(),
    deep: Color.hsl((hue + shift) % 360, 55, 16).hex(),
  };
}

/**
 * How dark a scrim the backdrop needs so white text over its brightest field
 * still meets WCAG AA (4.5:1). Pale artwork gets more, dark artwork almost none.
 */
export function scrimFor(palette: AmPalette, minContrast = 4.5): number {
  const white = Color("#fff");
  const brightest = [palette.primary, palette.accent]
    .map((c) => Color(c))
    .sort((a, b) => b.luminosity() - a.luminosity())[0];
  for (let alpha = 0; alpha <= 0.9; alpha += 0.05) {
    const behind = brightest.mix(Color("#000"), alpha);
    if (white.contrast(behind) >= minContrast) return Number(alpha.toFixed(2));
  }
  return 0.9;
}

/**
 * Darken or lighten an accent until it reaches AA against the surface it sits
 * on (spec: app-theme, "Accent stays legible"). Keeps hue and saturation.
 */
export function legibleAccent(
  accent: string,
  surface: string,
  minContrast = 4.5,
): string {
  let color = Color(accent);
  const towardsDark = Color(surface).isLight();
  for (let i = 0; i < 40 && color.contrast(Color(surface)) < minContrast; i++) {
    color = towardsDark ? color.darken(0.06) : color.lighten(0.06);
  }
  return color.hex();
}
