# Spec Delta

## Purpose

Shows how good the current stream is wherever the track is shown, using Music Assistant's quality tiers, and leads to the full signal path on demand.

## ADDED Requirements

### Requirement: Quality badge uses MA's tiers
The quality indicator SHALL show Music Assistant's tier label (`LQ`, `SQ`, `HQ` or `HR`) in that tier's colour, followed by a short format summary when known (for example `FLAC 44.1` or `MP3 192`). It SHALL be hidden when the tier is unknown.

#### Scenario: Lossless stream
- **WHEN** the active stream resolves to the lossless tier from a FLAC 44.1 kHz source
- **THEN** the badge reads `HQ` in the lossless tier colour with `FLAC 44.1` beside it

#### Scenario: Unknown quality
- **WHEN** the stream's quality tier is unknown
- **THEN** no badge is shown and no empty space is reserved for it

### Requirement: Badge placement
The badge SHALL appear centred under the scrubber in fullscreen (all layouts), inside the floating bar's centre display, and in the mini player.

#### Scenario: Fullscreen on desktop
- **WHEN** fullscreen is open on desktop with a known quality tier
- **THEN** the badge sits centred between the elapsed and remaining times

### Requirement: Badge opens the signal path
Activating the badge SHALL open Music Assistant's existing audio signal-path details for the active player.

#### Scenario: Inspect quality
- **WHEN** the user taps the `LQ` badge
- **THEN** the signal-path details open, showing source format, processing and output

### Requirement: Grouped playback shows a range
When the active player is a group whose members output at different tiers, the badge SHALL show the tier range (for example `LQ-HQ`).

#### Scenario: Mixed group
- **WHEN** a group plays to one member at lossless and another at low quality
- **THEN** the badge reads `LQ-HQ`

### Requirement: Per-room quality in the player picker
The player picker SHALL show each playing room's quality badge beside it, so the user can see where quality drops before choosing a room.

#### Scenario: Comparing rooms
- **WHEN** the player picker opens while two rooms play at different tiers
- **THEN** each room row shows its own tier badge
