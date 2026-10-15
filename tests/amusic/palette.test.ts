import Color from "color";
import { describe, expect, it } from "vitest";
import {
  fromServerPalette,
  generatedPalette,
  legibleAccent,
  scrimFor,
} from "@/amusic/palette";

describe("generatedPalette", () => {
  it("gives the same palette for the same album", () => {
    expect(generatedPalette("library://album/42")).toEqual(
      generatedPalette("library://album/42"),
    );
  });

  it("gives different albums different palettes", () => {
    const seeds = Array.from({ length: 20 }, (_, i) => `library://album/${i}`);
    const primaries = new Set(seeds.map((s) => generatedPalette(s).primary));
    expect(primaries.size).toBeGreaterThan(15);
  });
});

describe("fromServerPalette", () => {
  it("returns null without a primary colour", () => {
    expect(fromServerPalette(null)).toBeNull();
    expect(
      fromServerPalette({
        primary: null,
        accent: null,
        background_dark: null,
        background_light: null,
        on_dark: null,
        on_light: null,
      }),
    ).toBeNull();
  });

  it("maps primary, accent and dark background", () => {
    expect(
      fromServerPalette({
        primary: [255, 79, 109],
        accent: [255, 181, 71],
        background_dark: [18, 59, 42],
        background_light: null,
        on_dark: null,
        on_light: null,
      }),
    ).toEqual({ primary: "#FF4F6D", accent: "#FFB547", deep: "#123B2A" });
  });
});

describe("scrimFor", () => {
  const white = Color("#fff");

  it.each(["#FFFFFF", "#FFF1A8", "#FF7A59", "#0E4F5C"])(
    "keeps white text at AA over %s",
    (primary) => {
      const palette = { primary, accent: primary, deep: "#000000" };
      const alpha = scrimFor(palette);
      const behind = Color(primary).mix(Color("#000"), alpha);
      expect(white.contrast(behind)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it("adds no scrim to already-dark artwork", () => {
    expect(
      scrimFor({ primary: "#14121A", accent: "#14121A", deep: "#000" }),
    ).toBe(0);
  });
});

describe("legibleAccent", () => {
  it("darkens a pale accent until it reads on white", () => {
    const accent = legibleAccent("#FFF1A8", "#FFFFFF");
    expect(Color(accent).contrast(Color("#FFFFFF"))).toBeGreaterThanOrEqual(
      4.5,
    );
  });

  it("lightens a dark accent until it reads on near-black", () => {
    const accent = legibleAccent("#3B1020", "#121212");
    expect(Color(accent).contrast(Color("#121212"))).toBeGreaterThanOrEqual(
      4.5,
    );
  });

  it("leaves an accent that already reads untouched", () => {
    expect(legibleAccent("#B01E3C", "#FFFFFF")).toBe("#B01E3C");
  });
});
