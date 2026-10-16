import type { Player } from "@/plugins/api/interfaces";

/**
 * The picker's room list: upstream's ordered rooms, with the members of the
 * active room's group put back right below it. Upstream hides rooms synced to
 * another, but the picker must show them as grouped so they can be removed
 * again (spec: output-picker, "Grouping from the picker").
 */
export function withActiveGroupMembers(
  rooms: Player[],
  active: Player | undefined,
  players: Record<string, Player>,
): Player[] {
  if (!active) return rooms;
  const listed = new Set(rooms.map((room) => room.player_id));
  const members = active.group_members
    .filter((id) => id !== active.player_id && !listed.has(id))
    .map((id) => players[id])
    .filter((player): player is Player => !!player);
  if (!members.length) return rooms;
  const at = rooms.findIndex((room) => room.player_id === active.player_id);
  return [...rooms.slice(0, at + 1), ...members, ...rooms.slice(at + 1)];
}
