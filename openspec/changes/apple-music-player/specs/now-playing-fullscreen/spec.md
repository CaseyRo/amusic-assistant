# Spec Delta

## Purpose

The fullscreen now-playing experience: artwork-tinted depth, liquid-glass controls, and lyrics and queue arranged to suit each layout from `adaptive-player-layout`.

## ADDED Requirements

### Requirement: Artwork-tinted backdrop
The fullscreen player SHALL render its background as a heavily blurred colour field derived from the current artwork's palette, and SHALL transition smoothly to the new palette when the track changes.

#### Scenario: Track with artwork
- **WHEN** a track with artwork is playing in fullscreen
- **THEN** the background is a soft blurred field in that artwork's colours with no hard edges

#### Scenario: Track change
- **WHEN** playback moves to a track with different artwork
- **THEN** the background crossfades to the new palette instead of switching abruptly

### Requirement: Readable text over any backdrop
All text and controls over the backdrop SHALL meet WCAG AA contrast (4.5:1 for body text, 3:1 for large text and icons), whatever the artwork palette, including very light artwork.

#### Scenario: Very light artwork
- **WHEN** the artwork is predominantly white
- **THEN** titles, lyrics and controls remain legible at AA contrast

### Requirement: Liquid-glass controls
Floating controls in fullscreen (dock, view toggle, round icon buttons, room chip) SHALL be translucent glass surfaces: they blur what is behind them and have a light rim and inner highlight. Where the browser cannot blur backgrounds, they SHALL fall back to an opaque tinted surface.

#### Scenario: Browser supports background blur
- **WHEN** the browser supports backdrop blur
- **THEN** controls show the backdrop through a frosted glass surface

#### Scenario: Browser lacks background blur
- **WHEN** the browser does not support backdrop blur
- **THEN** controls render on an opaque tinted surface and stay fully legible

### Requirement: Phone portrait layout
In phone portrait, fullscreen SHALL stack these from top to bottom:
- a grabber
- large artwork
- title and artist, with favourite and more actions
- the scrubber with the quality indicator
- the transport
- volume
- a glass dock with lyrics, output and queue

Swiping down on the player SHALL close it.

#### Scenario: Default phone view
- **WHEN** fullscreen opens in phone portrait with lyrics and queue closed
- **THEN** the artwork fills the width within side margins and all controls are visible without scrolling

#### Scenario: Swipe to close
- **WHEN** the user swipes down on the fullscreen player in phone portrait
- **THEN** the fullscreen player closes and the bar remains

### Requirement: Artwork collapses when a panel opens on tall layouts
In phone portrait and tablet portrait, opening lyrics or the queue SHALL shrink the artwork into a header row (thumbnail, title, artist, more). The panel SHALL take the space the artwork occupied, and the transport SHALL stay visible.

#### Scenario: Open lyrics on a phone
- **WHEN** the user taps lyrics in the dock in phone portrait
- **THEN** the artwork animates into a header thumbnail and the lyrics fill the body above the controls

#### Scenario: Open the queue on a portrait tablet
- **WHEN** the user taps the queue in tablet portrait
- **THEN** the artwork collapses into the header and the queue fills the body, with the controls still visible

### Requirement: Two-column layout on wide layouts
In tablet landscape and desktop, fullscreen SHALL place the artwork and controls in a left column and lyrics or the queue in a right column. A glass Lyrics / Up next toggle SHALL switch between them.

#### Scenario: Desktop with lyrics
- **WHEN** fullscreen opens on desktop and the track has lyrics
- **THEN** the artwork and controls sit on the left and the lyrics on the right

#### Scenario: Switch to the queue
- **WHEN** the user selects Up next in the toggle
- **THEN** the right column shows the queue in place of the lyrics, and the left column is unchanged

#### Scenario: Landscape tablet keeps the transport on screen
- **WHEN** fullscreen is shown at 1180×820px
- **THEN** the play/pause control is fully visible without scrolling

### Requirement: Phone landscape layout
In phone landscape, fullscreen SHALL show the artwork on the left and the controls on the right. Opening lyrics or the queue SHALL replace the artwork, and the page SHALL NOT scroll.

#### Scenario: Phone turned sideways
- **WHEN** fullscreen is shown at 844×390px
- **THEN** the artwork and all transport controls are visible without scrolling

### Requirement: Desktop stage is bounded
On desktop, the fullscreen content SHALL be centred within a maximum stage width, so it does not stretch across very wide screens.

#### Scenario: Ultra-wide monitor
- **WHEN** fullscreen is shown at 3440×1440px
- **THEN** the artwork and lyrics columns stay within the bounded stage, centred, with the backdrop filling the rest

### Requirement: Synced lyrics presentation
When synced lyrics are available, the current line SHALL be shown in full contrast. Past lines SHALL be dimmed, and upcoming lines SHALL be progressively dimmed and blurred the further they are from the current line. The current line SHALL stay in view as playback advances.

#### Scenario: Line advances
- **WHEN** playback reaches the next synced line
- **THEN** that line becomes full contrast and scrolls into the reading position, and the previous line dims

#### Scenario: Unsynced lyrics
- **WHEN** only plain lyrics are available
- **THEN** they are shown as a scrollable text block without per-line highlighting

### Requirement: No-lyrics state
When a track has no lyrics, the lyrics control SHALL show as unavailable, and opening the lyrics panel SHALL show a short message instead of an empty area. On wide layouts the right column SHALL default to the queue.

#### Scenario: Track without lyrics on desktop
- **WHEN** fullscreen opens on desktop for a track with no lyrics
- **THEN** the right column shows the queue and the Lyrics option in the toggle is marked unavailable

### Requirement: No-artwork state
When a track has no artwork, the player SHALL show a generated cover: a colour gradient derived deterministically from the album or track identity, with the title set as type on it. The backdrop SHALL be derived from that cover.

#### Scenario: Local file without a cover
- **WHEN** a NAS file with no embedded or folder artwork plays
- **THEN** the artwork area shows a generated gradient cover with the title, never a grey placeholder or speaker icon

#### Scenario: Same album, same cover
- **WHEN** two tracks from the same album without artwork play one after the other
- **THEN** both show the same generated cover

### Requirement: Output selection from fullscreen
The fullscreen player SHALL show the current room (player or group name) as a control. On touch layouts it is in the dock; on wide layouts it sits beside volume. Activating it SHALL open the player picker.

#### Scenario: Change room
- **WHEN** the user taps the room control in fullscreen
- **THEN** the player picker opens, scoped to choosing where playback goes
