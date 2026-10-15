import { describe, expect, it } from "vitest";
import { classifyLayout } from "@/amusic/composables/useAmusicLayout";

// every size named in the adaptive-player-layout spec scenarios
describe("classifyLayout", () => {
  it.each([
    [844, 390, "phone-landscape"],
    [390, 844, "phone-portrait"],
    [820, 1180, "tablet-portrait"],
    [900, 650, "tablet-portrait"],
    [1180, 820, "tablet-landscape"],
    [1366, 1024, "tablet-landscape"],
    [1440, 900, "desktop"],
    [3440, 1440, "desktop"],
    // boundaries
    [599, 900, "phone-portrait"],
    [600, 900, "tablet-portrait"],
    [999, 700, "tablet-portrait"],
    [1000, 700, "tablet-landscape"],
    [1367, 900, "desktop"],
    [1440, 499, "phone-landscape"],
    [400, 499, "phone-portrait"],
  ])("%ix%i is %s", (width, height, expected) => {
    expect(classifyLayout(width, height)).toBe(expected);
  });
});
