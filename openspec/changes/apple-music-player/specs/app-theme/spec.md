# Spec Delta

## Purpose

The app-wide look outside the player surfaces: neutral surfaces, an accent colour that follows the music, and the platform's own typeface.

## ADDED Requirements

### Requirement: Neutral surfaces
App surfaces (content background, sidebar, cards, dialogs) SHALL use neutral colours: pure white and light greys in light mode, near-black and dark greys in dark mode. They SHALL NOT be tinted by the accent.

#### Scenario: Light mode library
- **WHEN** the library is shown in light mode
- **THEN** the content background is white and the sidebar a light neutral grey

### Requirement: Accent follows the artwork
The app's accent colour SHALL be derived from the current track's artwork palette. It is used for the app's wordmark, the active navigation item, primary buttons, progress fills, toggles and links. When nothing is playing, the accent SHALL be a fixed fallback colour.

#### Scenario: Track with a pink cover
- **WHEN** a track whose palette is dominated by pink is playing
- **THEN** the wordmark, the active sidebar item, primary buttons and progress fills use a pink accent

#### Scenario: Nothing playing
- **WHEN** the active player has nothing loaded
- **THEN** the accent is the fixed fallback colour

### Requirement: Accent stays legible
The derived accent SHALL be adjusted in lightness so that accent-coloured text, and text on accent fills, meet WCAG AA contrast against the current theme's surfaces.

#### Scenario: Very pale artwork
- **WHEN** the artwork's dominant colour is pale yellow in light mode
- **THEN** the accent is darkened until accent text on white meets AA contrast

### Requirement: Accent changes smoothly
When the accent changes because the track changed, the change SHALL transition over a short duration rather than snapping. When the user prefers reduced motion, it SHALL change instantly.

#### Scenario: Track change
- **WHEN** playback moves to a track with a different palette
- **THEN** accent-coloured elements transition to the new colour

### Requirement: Platform typeface
The whole app SHALL use the platform's system typeface where one is available (San Francisco on Apple devices, Segoe UI on Windows). It SHALL fall back to a bundled Inter where the system typeface is not suitable. The bundled font SHALL be served by the app itself, with no third-party font requests.

#### Scenario: iPad
- **WHEN** the app is opened on an iPad
- **THEN** text renders in the system San Francisco typeface

#### Scenario: Linux browser
- **WHEN** the app is opened on Linux
- **THEN** text renders in the bundled Inter, loaded from the app's own origin
