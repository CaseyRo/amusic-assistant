/**
 * How the always-on-top mini player is shown (spec: mini-player-window).
 * - document-pip: Chromium's document picture-in-picture, the real UI on top
 * - video-pip: Safari's video picture-in-picture of a drawn frame
 * - popup: a plain window, which cannot stay on top
 */
export type MiniHost = "document-pip" | "video-pip" | "popup";

/** Why the popup was chosen, for the one-time hint. */
export type MiniHint = "insecure" | "not-on-top";

export interface MiniHostEnv {
  documentPip: boolean;
  videoPip: boolean;
  secure: boolean;
}

export interface MiniHostChoice {
  host: MiniHost;
  hint?: MiniHint;
}

export function pickMiniHost(env: MiniHostEnv): MiniHostChoice {
  if (env.documentPip) return { host: "document-pip" };
  if (env.videoPip) return { host: "video-pip" };
  // Chromium withholds document picture-in-picture from plain http
  return { host: "popup", hint: env.secure ? "not-on-top" : "insecure" };
}

export function detectMiniHostEnv(win: Window = window): MiniHostEnv {
  return {
    documentPip: "documentPictureInPicture" in win,
    videoPip: !!win.document.pictureInPictureEnabled,
    secure: win.isSecureContext,
  };
}
