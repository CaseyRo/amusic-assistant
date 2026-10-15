# Spec Delta

## Purpose

Choosing where music plays, in the style of Apple's AirPlay output picker: rooms as rows, showing what each room is playing, its volume and its quality, with grouping one tap away.

## ADDED Requirements

### Requirement: Picker presentation per layout
The output picker SHALL open as a glass bottom sheet in phone layouts and as a glass popover anchored to the control that opened it in tablet and desktop layouts.

#### Scenario: Phone
- **WHEN** the user taps the room control in phone portrait
- **THEN** a glass bottom sheet slides up with the room list

#### Scenario: Desktop
- **WHEN** the user clicks the room chip in the glass bar on desktop
- **THEN** a glass popover opens above the chip, and the page behind stays visible

### Requirement: Room rows
Each available room SHALL be a row showing:
- the room name and its device icon
- the artwork, title and artist of what that room is playing (or "Not playing")
- the room's quality badge when it is playing

The active room SHALL be marked with a checkmark.

#### Scenario: Another room is playing
- **WHEN** the picker opens while the kitchen plays a different track
- **THEN** the kitchen row shows that track's artwork and title and its quality badge

### Requirement: Selecting a room
Tapping a room row SHALL make it the active player and close the picker. The bar and fullscreen SHALL then follow that room.

#### Scenario: Switch room
- **WHEN** the user taps the "Bedroom" row
- **THEN** Bedroom becomes the active player and the picker closes

### Requirement: Per-room volume
Each powered room row SHALL include a volume slider that sets that room's volume directly, without changing the active room.

#### Scenario: Adjust another room's volume
- **WHEN** the user drags the Kitchen row's slider while Living room is active
- **THEN** Kitchen's volume changes and Living room remains the active room

### Requirement: Grouping from the picker
Rooms that can join the active room SHALL show a round checkmark control. Toggling it SHALL add that room to, or remove it from, the active room's group. Rooms that cannot group with the active room SHALL show no such control.

#### Scenario: Add a room to the group
- **WHEN** the user taps the checkmark control on "Gardenshed" while "Kitchen" is active
- **THEN** Gardenshed joins Kitchen's group and both rows show as grouped

#### Scenario: Incompatible room
- **WHEN** a room cannot group with the active room's provider
- **THEN** its row has no grouping control

### Requirement: Finding rooms
When more than eight rooms are listed, the picker SHALL offer a search field. Rooms that are playing SHALL be listed before idle ones.

#### Scenario: Many rooms
- **WHEN** twelve rooms are available
- **THEN** a search field is shown, and playing rooms are listed first
