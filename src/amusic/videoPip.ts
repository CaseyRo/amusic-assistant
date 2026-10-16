import { watch, type WatchStopHandle } from "vue";
import { getMediaImageUrl } from "@/helpers/utils";
import api from "@/plugins/api";
import { PlaybackState } from "@/plugins/api/interfaces";
import { store } from "@/plugins/store";
import { generatedPalette } from "@/amusic/palette";
import { coverSeed } from "@/amusic/composables/useNowPlayingPalette";

/**
 * Safari's stay-on-top window (spec: mini-player-window, "Safari fallback"):
 * the artwork and title drawn onto a canvas, streamed into a muted video that
 * goes picture-in-picture. Its play/pause and the system media keys drive the
 * active player; the frame is redrawn whenever the track changes.
 */
const SIZE = 512;
const FRAME_RATE = 2;
const TEXT_PAD = 32;
// long enough for the stream to deliver a frame at FRAME_RATE
const FRAME_SETTLE_MS = 600;

let video: HTMLVideoElement | null = null;
// the streamed canvas only produces frames when painted, so a timer repaints it
// from `composed`, which is drawn once per track
let canvas: HTMLCanvasElement | null = null;
let composed: HTMLCanvasElement | null = null;
let ticker: ReturnType<typeof setInterval> | undefined;
let stops: WatchStopHandle[] = [];
// set while we move the video ourselves, so its events are not read as the user's
let syncing = false;
// bumped per redraw, so only the latest artwork request draws
let drawToken = 0;

function activeId() {
  return store.activePlayer?.player_id;
}

function drawText(ctx: CanvasRenderingContext2D) {
  const media = store.activePlayer?.current_media;
  const shade = ctx.createLinearGradient(0, SIZE * 0.5, 0, SIZE);
  shade.addColorStop(0, "rgb(0 0 0 / 0)");
  shade.addColorStop(1, "rgb(0 0 0 / 0.8)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, SIZE * 0.5, SIZE, SIZE * 0.5);
  ctx.fillStyle = "#fff";
  ctx.font = "700 34px -apple-system, system-ui, sans-serif";
  ctx.fillText(
    media?.title ?? store.activePlayer?.name ?? "",
    TEXT_PAD,
    SIZE - 70,
    SIZE - 2 * TEXT_PAD,
  );
  ctx.fillStyle = "rgb(255 255 255 / 0.8)";
  ctx.font = "500 24px -apple-system, system-ui, sans-serif";
  ctx.fillText(media?.artist ?? "", TEXT_PAD, SIZE - 34, SIZE - 2 * TEXT_PAD);
}

function drawGenerated(ctx: CanvasRenderingContext2D) {
  const media = store.activePlayer?.current_media;
  const p = generatedPalette(media ? coverSeed(media) : "idle");
  const fill = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  fill.addColorStop(0, p.primary);
  fill.addColorStop(0.55, p.accent);
  fill.addColorStop(1, p.deep);
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

// a paused video keeps showing the frame it last decoded, so after drawing
// while paused, play it for a moment to pick the new frame up
function refreshFrame() {
  if (!video?.paused) return;
  syncing = true;
  const done = () => {
    // the player may have started meanwhile; then the video should run too
    if (store.activePlayer?.playback_state !== PlaybackState.PLAYING) {
      video?.pause();
    }
    syncing = false;
  };
  video.play().then(() => setTimeout(done, FRAME_SETTLE_MS), done);
}

function paint() {
  if (composed) canvas?.getContext("2d")?.drawImage(composed, 0, 0);
}

function redraw() {
  const ctx = composed?.getContext("2d");
  if (!ctx) return;
  drawGenerated(ctx);
  drawText(ctx);
  paint();
  refreshFrame();
  const url = store.activePlayer?.current_media?.image_url;
  if (!url) return;
  const token = ++drawToken;
  // fetched rather than loaded as an <img crossorigin>: Safari reuses the copy
  // the bar already loaded without CORS, fails the image and leaves only the
  // generated cover. A fetched blob never taints the canvas.
  fetch(getMediaImageUrl(url), { mode: "cors" })
    .then((response) =>
      response.ok ? response.blob() : Promise.reject(response.status),
    )
    .then((blob) => createImageBitmap(blob))
    .then((bitmap) => {
      // a slow image from the previous track must not cover the new one
      if (token !== drawToken) return;
      ctx.drawImage(bitmap, 0, 0, SIZE, SIZE);
      bitmap.close();
      drawText(ctx);
      paint();
      refreshFrame();
    })
    // the generated cover drawn above stays as the fallback
    .catch(() => undefined);
}

function mirrorPlayState() {
  if (!video) return;
  syncing = true;
  const playing = store.activePlayer?.playback_state === PlaybackState.PLAYING;
  const done = () => (syncing = false);
  if (playing) video.play().then(done, done);
  else {
    video.pause();
    done();
  }
}

/** Builds the hidden video up front: requestPictureInPicture needs it ready inside the click. */
export function prepareVideoPip() {
  if (video) return;
  canvas = document.createElement("canvas");
  composed = document.createElement("canvas");
  for (const c of [canvas, composed]) {
    c.width = SIZE;
    c.height = SIZE;
  }
  video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.className = "am-video-pip";
  video.srcObject = canvas.captureStream(FRAME_RATE);
  document.body.append(video);

  // the window's own play/pause button acts on the player
  video.addEventListener("play", () => {
    const id = activeId();
    if (!syncing && id) api.playerCommandPlay(id);
  });
  video.addEventListener("pause", () => {
    const id = activeId();
    if (!syncing && id) api.playerCommandPause(id);
  });

  redraw();
  ticker = setInterval(paint, 1000 / FRAME_RATE);
  stops = [
    // one string, so it only fires when the track really changes: an array
    // is new on every player update, and each redraw first paints the
    // generated cover, so the artwork never got to stay
    watch(
      () =>
        [
          store.activePlayer?.player_id,
          store.activePlayer?.current_media?.uri,
          store.activePlayer?.current_media?.image_url,
        ].join("|"),
      redraw,
    ),
    watch(() => store.activePlayer?.playback_state, mirrorPlayState, {
      immediate: true,
    }),
  ];
}

export async function openVideoPip(onClose: () => void) {
  prepareVideoPip();
  if (!video) return;
  navigator.mediaSession?.setActionHandler("nexttrack", () => {
    const id = activeId();
    if (id) api.playerCommandNext(id);
  });
  navigator.mediaSession?.setActionHandler("previoustrack", () => {
    const id = activeId();
    if (id) api.playerCommandPrevious(id);
  });
  video.addEventListener("leavepictureinpicture", onClose, { once: true });
  await video.requestPictureInPicture();
}

export function disposeVideoPip() {
  stops.forEach((stop) => stop());
  stops = [];
  clearInterval(ticker);
  if (document.pictureInPictureElement === video) {
    void document.exitPictureInPicture();
  }
  video?.remove();
  video = null;
  canvas = null;
  composed = null;
}
