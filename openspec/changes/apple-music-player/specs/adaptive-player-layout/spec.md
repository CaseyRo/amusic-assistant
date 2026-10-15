# Spec Delta

## Purpose

Decides which player layout fits the space available, by its shape rather than the device type, so phones, tablets and desktops each get a layout designed for them.

## ADDED Requirements

### Requirement: Layout is chosen by shape
The system SHALL classify the player's available space into one of five layouts (phone portrait, phone landscape, tablet portrait, tablet landscape, desktop) using only the space's width, height and orientation. The device type and whether the device has touch input SHALL NOT affect the result.

#### Scenario: A touch tablet in landscape is not forced into the phone layout
- **WHEN** a touch tablet presents 1180×820px of space
- **THEN** the layout is tablet landscape, even though the device reports touch input

### Requirement: Classification order
The system SHALL apply these rules in order, and the first match wins:
1. Under 500px tall and wider than tall: phone landscape.
2. Under 600px wide: phone portrait.
3. Under 1000px wide: tablet portrait.
4. Up to 1366px wide: tablet landscape.
5. Anything wider: desktop.

#### Scenario: Short landscape screen
- **WHEN** the available space is 844×390px
- **THEN** the layout is phone landscape

#### Scenario: Narrow tall screen
- **WHEN** the available space is 390×844px
- **THEN** the layout is phone portrait

#### Scenario: Tablet held upright
- **WHEN** the available space is 820×1180px
- **THEN** the layout is tablet portrait

#### Scenario: Mid-size landscape window
- **WHEN** the available space is 900×650px
- **THEN** the layout is tablet portrait, because width decides before orientation once the space is at least 500px tall

#### Scenario: Tablet held sideways
- **WHEN** the available space is 1180×820px
- **THEN** the layout is tablet landscape

#### Scenario: Laptop screen
- **WHEN** the available space is 1440×900px
- **THEN** the layout is desktop

### Requirement: Layout follows resizes and rotation
The system SHALL re-evaluate the layout whenever the available space changes size or orientation, and SHALL apply the new layout without reloading or interrupting playback.

#### Scenario: Rotating a tablet
- **WHEN** a tablet showing the fullscreen player is rotated from portrait to landscape
- **THEN** the player switches to the tablet landscape layout and playback continues uninterrupted

#### Scenario: Resizing a desktop window
- **WHEN** a desktop browser window at 1440×900px is narrowed to 700px wide
- **THEN** the player switches through the layouts matching each size it passes through

### Requirement: Touch affordances follow the input type
The system SHALL size interactive targets for touch (at least 44×44px) when the primary pointer is coarse, and SHALL enable hover states only when the primary pointer is fine, independently of the chosen layout.

#### Scenario: Touch tablet in a wide layout
- **WHEN** the layout is tablet landscape and the primary pointer is coarse
- **THEN** every player control has a touch target of at least 44×44px

#### Scenario: Mouse on a narrow window
- **WHEN** the layout is phone portrait and the primary pointer is fine
- **THEN** controls show hover feedback
