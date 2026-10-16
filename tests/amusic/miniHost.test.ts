import { describe, expect, it } from "vitest";
import { detectMiniHostEnv, pickMiniHost } from "@/amusic/miniHost";

describe("pickMiniHost", () => {
  it("prefers document picture-in-picture (Chromium)", () => {
    expect(
      pickMiniHost({ documentPip: true, videoPip: true, secure: true }),
    ).toEqual({ host: "document-pip" });
  });

  it("falls back to video picture-in-picture (Safari)", () => {
    expect(
      pickMiniHost({ documentPip: false, videoPip: true, secure: true }),
    ).toEqual({ host: "video-pip" });
  });

  it("opens a popup that cannot stay on top (Firefox)", () => {
    expect(
      pickMiniHost({ documentPip: false, videoPip: false, secure: true }),
    ).toEqual({ host: "popup", hint: "not-on-top" });
  });

  it("points to https when plain http withholds picture-in-picture", () => {
    expect(
      pickMiniHost({ documentPip: false, videoPip: false, secure: false }),
    ).toEqual({ host: "popup", hint: "insecure" });
  });

  it("keeps Safari's video picture-in-picture over plain http", () => {
    expect(
      pickMiniHost({ documentPip: false, videoPip: true, secure: false }),
    ).toEqual({ host: "video-pip" });
  });
});

describe("detectMiniHostEnv", () => {
  it("reads the features from the window", () => {
    const win = {
      documentPictureInPicture: {},
      document: { pictureInPictureEnabled: false },
      isSecureContext: true,
    } as unknown as Window;
    expect(detectMiniHostEnv(win)).toEqual({
      documentPip: true,
      videoPip: false,
      secure: true,
    });
  });
});
