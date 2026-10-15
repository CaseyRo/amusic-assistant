# Proposal

## Why

Music Assistant's player is functional but flat. Its fullscreen view is one centred column stretched to every screen. On a landscape iPad the play button falls below the bottom edge, and tablets are always given the phone layout because touch input and layout are decided by one flag. The desktop bar is a full-width strip, and there is no way to keep playback controls in front of other apps. This fork exists to give the player the feel of Apple Music: artwork-tinted depth, liquid-glass controls, and layouts designed per form factor.

## What Changes

- **Fullscreen now playing** is rebuilt as an adaptive stage with a blurred-artwork backdrop and liquid-glass controls.
  - Phone, tablet and desktop get distinct layouts, chosen by the shape of the screen (width, height, orientation) instead of by device type.
  - Lyrics and the queue open beside the artwork on wide screens, and collapse the artwork into a header on tall ones.
  - Touch layouts get a glass dock (lyrics / output / queue). Wide layouts get a glass Lyrics / Up next toggle.
- **Floating glass player bar** replaces the full-width bottom bar on wide layouts.
  - Transport sits left, a centre display shows artwork, title, artist/album and hairline progress, and actions sit right (lyrics, queue, volume, room).
  - Content scrolls underneath it, blurred.
  - The spike already on `main` is reworked into this layout.
- **Always-on-top mini player** in a separate window that stays in front of other apps.
  - Chromium browsers (Chrome, Edge, Arc, Opera) get the full interactive mini player.
  - Safari gets a picture-in-picture fallback driven by system media controls.
  - Firefox gets a popup window.
  - Browsers without support never show the entry point.
- **Stream quality indicator**: MA's `LQ` / `SQ` / `HQ` / `HR` badge, in its tier colours, moves under the scrubber in fullscreen and into the bar's centre display. Tapping it opens the existing signal-path details. The player picker shows quality per room.
- **Output picker** is redesigned in the style of Apple's AirPlay picker: a glass sheet on phones and a popover on wider screens. Rooms are rows that show what each one is playing, its quality and its volume, with grouping toggles.
- **App theme**: neutral surfaces and an accent colour taken from the current artwork (with a fixed fallback), applied app-wide. The whole app uses the platform's system typeface, falling back to a bundled Inter.
- **Empty states** for tracks without artwork and without lyrics, so neither leaves a grey placeholder or a dead control.
- Fork hygiene: new code lives in fork-owned components, and edits to upstream files stay minimal and marked, so upstream merges stay cheap.

No server changes. No **BREAKING** changes to the server API or settings. The upstream mobile floating card stays as-is on phone layouts.

## Capabilities

### New Capabilities
- `adaptive-player-layout`: classifies the available space into phone / tablet / desktop layouts by shape and orientation, independently of touch input, for every player surface to consume.
- `now-playing-fullscreen`: the fullscreen now-playing experience, covering backdrop, artwork, lyrics, queue, controls, dock and toggle, plus the empty states.
- `floating-player-bar`: the floating glass player bar on wide layouts and how content flows beneath it.
- `mini-player-window`: the always-on-top mini player and its per-browser fallbacks.
- `output-picker`: choosing and grouping rooms, with per-room now-playing, volume and quality.
- `app-theme`: neutral surfaces, an accent derived from the artwork, and the platform typeface, app-wide.
- `stream-quality-indicator`: where and how stream quality is shown across player surfaces, and what tapping it does.

### Modified Capabilities
- None. No specs exist yet in this fork.

## Impact

- **Code:** `src/layouts/default/PlayerOSD/` (`PlayerFullscreen.vue`, `Player.vue`), `src/layouts/default/Footer.vue`, `src/layouts/default/View.vue`, `src/styles/global.css`, the player picker (`PlayerSelect.vue`), the theme setup (`src/plugins/vuetify.ts`, `src/styles/`, Tailwind theme variables) and the font loading in `vite.config.ts`, plus new fork-owned components. `store.mobileLayout` keeps its upstream meaning; the new layout classification sits alongside it.
- **Reused as-is:** the lyrics viewer, the queue composables, the quality tier logic, the browser media-session helpers, and the signal-path details.
- **Dependencies:** none new. Document Picture-in-Picture, Media Session and backdrop-filter are platform APIs.
- **Compatibility:** targets upstream frontend `main` against MA server 2.11 (schema ≥ 86). Verified against 2.11.0b5.
- **Design reference:** Paper file "amusic-assistant — player direction" (5 artboards). Mobbin references: Apple Music web fullscreen and lyrics, the web glass bar, and iOS now-playing states.
