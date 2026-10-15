# Design

## Context

See proposal.md for motivation. The relevant current state of the code:

- **Layout flag.** `store.mobileLayout` (`src/plugins/store.ts:96`) is true for phone-sized screens and for every tablet user agent. Dozens of upstream components read it, so changing what it means would ripple through the whole app.
- **Fullscreen player.** `PlayerFullscreen.vue` (~1,800 lines) is mounted from `PlayerTrackDetails.vue`. It already has lyrics (`LyricsViewer` with LRC sync), the virtualised queue (`useFullscreenQueue`), the visualizer, volume, the player picker, and a palette gradient built from `current_media.palette`.
  - Its responsive behaviour is five unrelated `@media` widths, plus `$vuetify.display.mdAndUp`.
- **Player bar.** `Player.vue` and `Footer.vue` render it. The desktop bar has a three-column grid with heavily tuned breakpoint CSS.
  - The glass spike (commit 1530676b) wrapped that grid in a translucent pane, which is not the target layout.
- **Quality and media session.** The quality logic is in `useStreamQuality.ts` (tiers, labels, colours, ranges) and `QualityDetailsBtn.vue`, which opens `AudioProcessingDetails`. Format details (sample rate, codec) are already resolved in `useAudioProcessingDetails.ts`. Media Session wiring exists in `helpers/mediaSession.ts` and `App.vue`.
- **Fork maintenance.** Upstream changes these files continually (hundreds of commits per month), so every line we edit in an upstream file becomes merge cost.
- **Tests.** Vitest tests live in `tests/`.

## Goals / Non-Goals

**Goals:**
- Upstream merges stay cheap: new UI goes in fork-owned files, and upstream files only get small, `amusic:`-marked mount points.
- One layout classification that every player surface reads.
- Reuse MA's data and behaviour (lyrics sync, queue, quality, picker, media session). Only presentation is rebuilt.

**Non-Goals:**
- Restyling the rest of the app (library, settings, navigation).
- Native desktop-app always-on-top. Only the browser mechanisms are in scope.
- Changes to the server or its API.
- Sending any of this upstream, for now.

## Decisions

### 1. Fork-owned components under `src/amusic/`, mounted behind small switches
New code goes in `src/amusic/`: `components/` (fullscreen stage, glass bar, mini player, glass primitives, quality badge wrapper), `composables/` (layout class, artwork backdrop, picture-in-picture) and `styles/` (glass tokens).

Upstream files get only a mount switch:
- `PlayerTrackDetails.vue` renders `AmusicFullscreen` in place of `PlayerFullscreen`.
- `Footer.vue` renders `AmusicGlassBar` on non-phone layouts.

*Alternative:* restyle `PlayerFullscreen.vue` in place. Rejected, because it is 1,800 lines of upstream churn and every merge would conflict.

*Trade-off:* we wrap and re-compose upstream sub-components (`LyricsViewer`, `QueueListItem`, `PlayerTimeline`, `PlayerVolume`, the transport buttons, `QualityDetailsBtn`). Changes to their props upstream can break us, but those failures are compile errors, not silent drift.

### 2. Layout classification is a composable plus container queries
`useAmusicLayout()` observes the stage element with a `ResizeObserver` and returns `phone-portrait | phone-landscape | tablet-portrait | tablet-landscape | desktop`, using the ordered rules in the `adaptive-player-layout` spec. The value is set as `data-layout` on the stage.

- CSS styles off `data-layout`, plus `@container` queries for fine sizing inside each layout.
- Pointer affordances come from `(pointer: coarse)` media queries, kept separate from layout.
- `store.mobileLayout` is left untouched for upstream components. Only fork components read the new value.

*Alternative:* redefine `store.mobileLayout`. Rejected, because it changes upstream behaviour everywhere at once.

*Why measure the element and not the window:* fullscreen and the bar sit in different boxes (the sidebar takes width), and the measured box is what actually has to fit.

### 3. Backdrop from the server palette, blur in CSS
Use `current_media.palette` (already provided by the server, and `paletteFromServer` already exists) to place three or four large, heavily blurred colour fields. The new track's fields are layered on top and faded in, so a track change crossfades rather than snaps.

- **Contrast:** a dark scrim, whose strength depends on the palette's lightness, keeps text at WCAG AA.
- **Generated covers:** when there is no artwork, a deterministic gradient is hashed from the album id (falling back to the track uri). The same palette then feeds the backdrop.

*Alternative:* blur the artwork image itself with `filter: blur()` at full screen size. Rejected as the default, because a full-viewport blur is costly on low-end tablets and the palette gives the same feel. The blurred image may come back later as a desktop-only enhancement.

### 4. Liquid glass as a small primitive with a fallback
`GlassSurface.vue` provides the translucent fill, `backdrop-filter: blur() saturate()`, a 1px light rim and an inset highlight. All of it is driven by CSS custom properties, for light and dark grounds.

- Inside `@supports not (backdrop-filter: blur(1px))`, it switches to an opaque tinted fill.
- Unprefixed `backdrop-filter` only, per the existing minifier note in `Footer.vue`. Safari 18+ supports it unprefixed.

### 5. Glass bar replaces the spike; content runs under it
Revert the spike's edits to `Player.vue`. `AmusicGlassBar` is a new component with the Apple layout from the spec.

- `Footer.vue` keeps the transparent, click-through strip from the spike.
- `View.vue` drops the `v-main` bottom padding on non-phone layouts, and the content gets bottom padding of bar height plus gap. The last row can then scroll clear of the bar.
- The bar degrades by measured width (`@container`), not by viewport breakpoints.

### 6. Mini player: one component, three hosts
`AmusicMiniPlayer.vue` renders the mini UI. `useMiniPlayerWindow()` picks a host:

1. **Document picture-in-picture** (`'documentPictureInPicture' in window`). Request a window of 320×320, copy stylesheets into it, and `Teleport` the component into its body.
   - It runs in the same JS realm, so the store, api and reactivity just work.
   - The theme is mirrored by copying the `<html>` classes and Vuetify's theme class onto a wrapper.
2. **Video picture-in-picture** (`document.pictureInPictureEnabled`, Safari). Draw artwork and title onto a 512×512 canvas, `captureStream()` it into a muted `<video>`, then `requestPictureInPicture()`.
   - Redraw on track change.
   - Register Media Session play/pause/next/previous handlers through the existing helpers, so the window's system controls work.
3. **Popup** (anything else). `window.open('#/?frameless&amusicMini=1', …, 'width=340,height=360')`. The existing `frameless` mode renders only the mini player.

*Alternative for Safari:* a popup only. Rejected, because the user wants it to stay on top, and video picture-in-picture is the only stay-on-top mechanism Safari offers.

### 7. Quality badge wraps the existing logic
`AmusicQualityBadge` uses `useStreamQuality` and `useActiveAudioPath` for the tier and range, takes its format summary from the same audio-path data, and opens the same `AudioProcessingDetails` dialog as `QualityDetailsBtn`. There is no new quality logic.

For per-room badges in the picker, each room's audio path is resolved the same way. The picker gets a single `amusic:`-marked slot for this.

### 8. Testing
- Vitest unit tests for the pure parts:
  - layout classification, for every spec scenario's dimensions
  - generated-cover determinism
  - mini-player host selection, with feature flags stubbed
  - quality summary formatting
- Visual verification in the dev server at the five spec sizes, against the Paper artboards.

## Risks / Trade-offs

- **Upstream renames a re-composed sub-component or its props.** → `vue-tsc` fails at merge time. Keep the imports few and listed in `src/amusic/README.md`.
- **Many glass surfaces blurring over large areas stutter on low-end tablets.** → Blur only the bar, dock and toggles, never full-screen layers. The backdrop is static colour that is blurred once.
- **Document picture-in-picture needs a user gesture and only works in a secure context.** → The localhost dev server and HTTPS deployments qualify. Over plain `http://` on the tailnet (`music-assistant.onca-blenny.ts.net`), Chromium blocks it. → Detect it, show the popup fallback with a hint, and note that HTTPS (`tailscale serve`) unlocks it.
- **Canvas picture-in-picture in Safari does not take clicks.** → Control goes through the system media controls only. This is documented in the spec.
- **Server palette can be missing for some sources.** → Fall back to the generated-cover palette.

## Migration Plan

- Not breaking. Fork-owned components replace two mount points. To roll back, revert the mount switches.
- Merge upstream before starting (the fork is at upstream e076eec5), so the work begins on current code.

## Open Questions

- Tune the exact backdrop scrim strength and glass opacity per flavour against real covers from the NAS library during implementation. This does not change the specs or tasks.
