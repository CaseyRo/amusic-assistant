import { describe, expect, it } from "vitest";
import { formatSummary } from "@/amusic/quality";

describe("formatSummary", () => {
  it.each([
    [{ content_type: "flac", sample_rate: 44100, bit_depth: 16 }, "FLAC 44.1"],
    [{ content_type: "flac", sample_rate: 96000, bit_depth: 24 }, "FLAC 24/96"],
    [{ content_type: "mp3", bit_rate: 192 }, "MP3 192"],
    [{ content_type: "mp3", bit_rate: 320000 }, "MP3 320"],
    [{ content_type: "aac", codec_type: "unknown", bit_rate: 256 }, "AAC 256"],
    [{ content_type: "ogg" }, "OGG"],
    [{ content_type: "unknown" }, ""],
    [null, ""],
  ])("%o → %s", (format, expected) => {
    expect(formatSummary(format as never)).toBe(expected);
  });
});
