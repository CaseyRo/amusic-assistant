# Spec Delta

## Purpose

An always-on-top mini player that keeps the current track and its controls in front of other apps, using the best mechanism each browser offers.

## ADDED Requirements

### Requirement: Mini player in Chromium browsers
In browsers that support document picture-in-picture (Chrome, Edge, Arc, Opera, recent versions), the user SHALL be able to open a mini player window. The window stays above other applications and shows:
- the artwork
- title, artist and room
- the quality indicator
- a progress line
- previous, play/pause and next controls on a glass strip

#### Scenario: Open the mini player
- **WHEN** the user activates the mini player action in Chrome
- **THEN** a small always-on-top window opens showing the current track with working controls

#### Scenario: Controls act on the active player
- **WHEN** the user presses next in the mini player window
- **THEN** the active player skips to the next track, and the main window reflects it

### Requirement: Mini player stays in sync
The mini player SHALL reflect changes of track, play state, progress, artwork and active player, whether those changes come from the main window or from other clients.

#### Scenario: Track changed elsewhere
- **WHEN** the track is changed from another device
- **THEN** the mini player window updates its artwork, title and progress without user action

#### Scenario: Active player switched
- **WHEN** the user switches the active player in the main window
- **THEN** the mini player follows the newly active player

### Requirement: Mini player lifecycle
Closing the mini player window SHALL leave the main app unchanged. Opening it again SHALL reuse the current state. Reloading or closing the main tab SHALL close the mini player window.

#### Scenario: Close and reopen
- **WHEN** the user closes the mini player window and opens it again
- **THEN** it shows the current track immediately

### Requirement: Safari fallback
In browsers without document picture-in-picture but with video picture-in-picture (Safari), the mini player action SHALL open a picture-in-picture window showing the artwork with the title and artist. Play/pause, next and previous SHALL work through the system media controls.

#### Scenario: Safari on macOS
- **WHEN** the user activates the mini player action in Safari
- **THEN** a floating picture-in-picture window shows the current artwork and title and stays above other apps

#### Scenario: Track changes in Safari picture-in-picture
- **WHEN** the track changes while the Safari picture-in-picture window is open
- **THEN** the window updates to the new artwork and title

### Requirement: Firefox and other browsers fallback
In browsers with neither capability (Firefox), the mini player action SHALL open a compact popup window with the mini player. The UI SHALL state that it cannot stay on top in this browser.

#### Scenario: Firefox
- **WHEN** the user activates the mini player action in Firefox
- **THEN** a small popup window with the mini player opens, and a one-time hint explains it cannot stay on top in this browser

### Requirement: Insecure origins fall back
When the app is served over plain HTTP (not localhost), where browsers withhold picture-in-picture, the mini player action SHALL use the popup fallback. It SHALL explain that serving the app over HTTPS enables the always-on-top window.

#### Scenario: Chrome over plain HTTP
- **WHEN** the user activates the mini player action in Chrome on an `http://` tailnet address
- **THEN** the popup mini player opens and a hint explains that HTTPS enables the always-on-top window

### Requirement: Entry point visibility
The mini player action SHALL appear in the floating bar and the fullscreen more-menu on desktop and tablet layouts. It SHALL NOT appear on phone layouts or where no mechanism is available.

#### Scenario: Phone
- **WHEN** the layout is phone portrait
- **THEN** no mini player action is shown
