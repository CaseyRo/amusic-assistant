# Spec Delta

## Purpose

The floating glass player bar: a compact pane that hovers over the content on tablet and desktop layouts instead of a full-width strip pinned to the bottom of the screen.

## ADDED Requirements

### Requirement: Bar floats over content on tablet and desktop layouts
In tablet portrait, tablet landscape and desktop, the player bar SHALL be a rounded glass pane, inset from the screen edges and centred within the content area. Its width SHALL be capped, and content SHALL scroll beneath it, visibly blurred.

#### Scenario: Scrolling a library
- **WHEN** the user scrolls the album grid on desktop
- **THEN** albums pass beneath the bar and show through it blurred

#### Scenario: Last row reachable
- **WHEN** the user scrolls to the end of any list or grid
- **THEN** the final items can be scrolled clear of the bar and are fully visible

### Requirement: Clicks pass around the bar
Only the bar's own pane SHALL capture pointer input. The space beside it SHALL remain interactive for the content underneath.

#### Scenario: Clicking content beside the bar
- **WHEN** the user clicks an album that is visible to the left of the bar
- **THEN** the album opens

### Requirement: Bar layout
The bar SHALL show three groups:
- left: shuffle, previous, play/pause, next, repeat
- centre: a display with artwork thumbnail, title, artist and album, the quality indicator, and a hairline progress line along its bottom edge
- right: lyrics, queue, volume and the current room

#### Scenario: Track playing
- **WHEN** a track is playing on desktop
- **THEN** the centre display shows its artwork, title, and artist and album, with the progress line advancing

#### Scenario: Nothing playing
- **WHEN** the active player has nothing loaded
- **THEN** the centre display shows the player name and an idle state, and transport controls that cannot act are disabled

### Requirement: Bar degrades gracefully when narrow
When the bar's capped width cannot fit all three groups, it SHALL drop shuffle and repeat first, then album text, and SHALL keep play/pause, title and the room control.

#### Scenario: Portrait tablet
- **WHEN** the layout is tablet portrait at 820px wide
- **THEN** shuffle and repeat are hidden before anything else and play/pause remains

### Requirement: Opening fullscreen from the bar
Activating the centre display's artwork or title SHALL open the fullscreen player. Activating the lyrics or queue action SHALL open fullscreen with that panel shown.

#### Scenario: Open lyrics from the bar
- **WHEN** the user clicks the lyrics action in the bar
- **THEN** fullscreen opens with lyrics showing

### Requirement: Phone layouts keep the floating card
In phone portrait and phone landscape, the upstream floating mini card SHALL remain the bar. It SHALL use the same glass treatment and SHALL tap through to fullscreen.

#### Scenario: Phone
- **WHEN** the layout is phone portrait
- **THEN** the compact floating card is shown above the bottom navigation, rendered as glass
