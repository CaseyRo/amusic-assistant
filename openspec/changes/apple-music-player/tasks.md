# Tasks

## 1. Baseline

- [ ] 1.1 Merge `upstream/main` into `main`, then verify that `pnpm install`, `pnpm build` and `pnpm test:run` all pass and that the dev server connects to the 2.11.0b5 server
- [ ] 1.2 Revert the glass spike's edits in `Player.vue` and the `.mediacontrols` glass styles, keeping the click-through footer strip and the `--glass-bar-*` tokens. Verify the desktop bar renders as upstream at 1440×900
- [ ] 1.3 Create `src/amusic/` (`components/`, `composables/`, `styles/`) with a `README.md` listing the upstream components we re-compose. Verify the folder exists and the README names each import

## 2. Layout classification

- [ ] 2.1 Implement `useAmusicLayout()` (ResizeObserver on a given element → one of the five layouts, using the spec's ordered rules) and verify that a Vitest table test covers every dimension in the `adaptive-player-layout` scenarios
- [ ] 2.2 Add coarse/fine pointer styles (44px minimum touch targets, hover only for fine pointers) as glass tokens in `src/amusic/styles/` and verify in DevTools touch emulation that controls are at least 44×44px at 1180×820

## 3. Glass and backdrop primitives

- [ ] 3.1 Build `GlassSurface.vue` (fill, blur, rim, highlight, light and dark variants, plus the `@supports` opaque fallback) and verify both paths by toggling backdrop-filter off in DevTools
- [ ] 3.2 Build `useArtworkBackdrop()` (server palette → blurred colour fields, crossfade on track change, lightness-adaptive scrim) and verify AA contrast with a near-white cover from the NAS library
- [ ] 3.3 Build the generated cover (a deterministic gradient from album id or track uri, with the title as type) and verify with a Vitest test that the same id gives the same palette and different ids differ

## 4. Quality badge

- [ ] 4.1 Build `AmusicQualityBadge` on `useStreamQuality` and `useActiveAudioPath` (tier label, tier colour, format summary, range for groups, hidden when unknown, tap opens `AudioProcessingDetails`). Verify with a Vitest test of the format-summary helper (`FLAC 44.1`, `MP3 192`, unknown → empty) and by tapping it on the playing NAS track
- [ ] 4.2 Add per-room badges to the player picker through one `amusic:`-marked slot and verify that two rooms at different tiers each show their own badge

## 5. Fullscreen now playing

- [ ] 5.1 Build the `AmusicFullscreen` stage shell (backdrop, `data-layout`, bounded desktop stage, swipe to close in phone portrait), mount it from `PlayerTrackDetails.vue` behind an `amusic:` switch, and verify it opens and closes from the bar on all five layouts
- [ ] 5.2 Build the artwork, title row, scrubber with the centred quality badge, transport and volume from upstream sub-components, and verify against the Paper phone and desktop artboards at 390×844 and 1440×900
- [ ] 5.3 Implement the phone portrait and tablet portrait stacks with a glass dock (lyrics / room / queue) and the artwork-to-header collapse when a panel opens. Verify at 390×844 and 820×1180 that the transport stays visible with lyrics and with the queue open
- [ ] 5.4 Implement the two-column tablet landscape and desktop layout with the glass Lyrics / Up next toggle. Verify at 1180×820 that play/pause is fully visible, and at 3440×1440 that the stage stays bounded
- [ ] 5.5 Implement phone landscape (artwork left, controls right, panels replace the artwork, no scroll) and verify at 844×390
- [ ] 5.6 Restyle the lyrics presentation (current line full contrast, distance-based dim and blur, unsynced fallback) by wrapping `LyricsViewer`, and verify with a track that has LRC lyrics and with one that has plain lyrics
- [ ] 5.7 Implement the no-lyrics and no-artwork states and verify with the NAS track "Like A Rolling Stone" (no cover, no lyrics): a generated cover, Lyrics marked unavailable, and the queue shown on desktop
- [ ] 5.8 Wire the room control to open the player picker and verify that switching rooms from fullscreen changes the active player
- [ ] 5.9 Verify rotation and resizing: resize from 1440 to 700 to 390 px wide during playback and confirm the layout switches without a reload and audio does not stop

## 6. Floating glass bar

- [ ] 6.1 Build `AmusicGlassBar` (transport · centre display with art, title, artist and album, badge and hairline progress · lyrics, queue, volume, room) and mount it from `Footer.vue` on non-phone layouts. Verify against the Paper library artboard at 1440×900
- [ ] 6.2 Make content flow beneath the bar (drop `v-main` bottom padding on non-phone layouts, content bottom padding of bar height plus gap) and verify that the last album row scrolls fully clear and that clicks beside the bar reach the content
- [ ] 6.3 Implement container-query degradation (drop shuffle and repeat, then album text) and verify at 820×1180 that play/pause, title and room remain
- [ ] 6.4 Wire the centre display, lyrics and queue actions to open fullscreen with the right panel, and verify each one
- [ ] 6.5 Give the phone floating card the glass treatment and verify at 390×844 that it still taps through to fullscreen
- [ ] 6.6 Verify the idle state: with nothing loaded, the bar shows the player name and disables the transport controls that cannot act

## 7. Mini player

- [ ] 7.1 Build `AmusicMiniPlayer.vue` (artwork, title, artist and room, badge, progress, glass transport strip) and verify it standalone through `#/?frameless&amusicMini=1`
- [ ] 7.2 Implement `useMiniPlayerWindow()` host selection (document PiP / video PiP / popup, insecure-origin fallback) and verify with a Vitest test that stubs each feature combination
- [ ] 7.3 Implement the document-PiP host (stylesheet copy, theme mirror, Teleport, close on unload) and verify in Chrome on localhost: the window stays on top, next skips, and a track change from another client updates it
- [ ] 7.4 Implement the Safari video-PiP host (canvas → stream → video, redraw on track change, Media Session handlers) and verify in Safari that the window floats, updates on track change, and that play/pause works from the system controls
- [ ] 7.5 Implement the popup host with its one-time "can't stay on top" hint (Firefox, and Chromium over plain HTTP), and verify in Firefox and in Chrome on the `http://` tailnet URL
- [ ] 7.6 Add the entry point to the glass bar and the fullscreen more-menu on non-phone layouts only, and verify that it is absent at 390×844

## 8. Integration

- [ ] 8.1 Run `pnpm lint:check`, `vue-tsc --noEmit` and `pnpm test:run` and verify all pass
- [ ] 8.2 Walk all five layouts plus the mini player on the live server with NAS music playing, and compare each against its Paper artboard. Record screenshots in the README and verify the README links them
- [ ] 8.3 Verify that `git diff upstream/main --stat -- src ':!src/amusic'` shows only `amusic:`-marked mount-point edits in upstream files

## Workflow follow-up

- Archive the change after review with `/opsx:archive`.
- Consider `tailscale serve` HTTPS for the MA host to unlock the Chromium always-on-top window outside localhost.
