import type { AudioFormat } from "@/plugins/api/interfaces";

const LOSSLESS = new Set([
  "flac",
  "alac",
  "wav",
  "aiff",
  "dsf",
  "wavpack",
  "ape",
]);

/**
 * Short format summary for the quality badge: sample rate for lossless
 * ("FLAC 44.1", "FLAC 24/96"), bit rate for lossy ("MP3 192"). Empty when the
 * format is unknown (spec: stream-quality-indicator).
 */
export function formatSummary(format: Partial<AudioFormat> | null | undefined) {
  if (!format) return "";
  // codec_type can be absent or "unknown" (not in the typed enum) for some providers
  const codecType = String(format.codec_type ?? "").toLowerCase();
  const codec = (
    codecType && codecType !== "unknown"
      ? codecType
      : String(format.content_type ?? "")
  ).toLowerCase();
  if (!codec || codec === "unknown") return "";
  const name = codec.toUpperCase();

  if (LOSSLESS.has(codec)) {
    const khz = (format.sample_rate ?? 0) / 1000;
    if (!khz) return name;
    const rate = Number.isInteger(khz) ? `${khz}` : khz.toFixed(1);
    return format.bit_depth && format.bit_depth > 16
      ? `${name} ${format.bit_depth}/${rate}`
      : `${name} ${rate}`;
  }

  // MA reports kbps, but some providers hand through bps
  const raw = format.bit_rate ?? 0;
  const kbps = raw > 10000 ? Math.round(raw / 1000) : Math.round(raw);
  return kbps ? `${name} ${kbps}` : name;
}
