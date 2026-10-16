# amusic

Fork-owned player UI for amusic-assistant. Everything here is ours; upstream
files only get small mount switches marked with `amusic:` comments, so
upstream merges stay cheap (see `openspec/changes/apple-music-player/design.md`).

- `components/` — fullscreen stage, glass bar, mini player, output picker, glass primitives
- `composables/` — layout class, artwork backdrop and accent, picture-in-picture host
- `styles/` — glass tokens, theme overrides

## Upstream components we re-compose

If upstream renames or changes the props of any of these, `vue-tsc` fails on
merge. Check here first.

| Upstream                                                                      | Used for                                               |
| ----------------------------------------------------------------------------- | ------------------------------------------------------ |
| `src/components/LyricsViewer.vue`                                             | synced lyrics                                          |
| `src/layouts/default/PlayerOSD/QueueListItem.vue`, `useFullscreenQueue.ts`    | queue panel                                            |
| `src/layouts/default/PlayerOSD/PlayerTimeline.vue`                            | scrubber                                               |
| `src/layouts/default/PlayerOSD/PlayerVolume.vue`                              | volume                                                 |
| `src/layouts/default/PlayerOSD/PlayerControlBtn/*`                            | transport buttons                                      |
| `src/components/QualityDetailsBtn.vue`, `src/composables/useStreamQuality.ts` | quality badge                                          |
| `src/composables/useOrderedPlayers.ts`, `src/helpers/players.ts`              | output picker                                          |
| `src/layouts/default/PlayerOSD/PlayerBarVolumeControl.vue`                    | glass bar volume                                       |
| `src/helpers/player_menu_items.ts`                                            | fullscreen more-menu                                   |
| `api.playerCommand*`                                                          | Safari mini player (video picture-in-picture) controls |

## Upstream mount points

`git grep -n "amusic:" -- src ':!src/amusic'` lists every edit we make to upstream files.
