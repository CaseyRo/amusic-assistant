import { describe, expect, it } from "vitest";
import type { Player } from "@/plugins/api/interfaces";
import { withActiveGroupMembers } from "@/amusic/rooms";

const room = (player_id: string, group_members: string[] = []) =>
  ({ player_id, group_members }) as unknown as Player;

describe("withActiveGroupMembers", () => {
  const leader = room("shed", ["shed", "browser"]);
  const browser = room("browser");
  const kitchen = room("kitchen");
  const players = { shed: leader, browser, kitchen };

  it("puts hidden group members right below the active room", () => {
    expect(
      withActiveGroupMembers([leader, kitchen], leader, players).map(
        (r) => r.player_id,
      ),
    ).toEqual(["shed", "browser", "kitchen"]);
  });

  it("does not list a member twice", () => {
    expect(
      withActiveGroupMembers([leader, browser, kitchen], leader, players),
    ).toHaveLength(3);
  });

  it("leaves the list alone without an active room or group", () => {
    const rooms = [leader, kitchen];
    expect(withActiveGroupMembers(rooms, undefined, players)).toBe(rooms);
    expect(withActiveGroupMembers(rooms, kitchen, players)).toBe(rooms);
  });

  it("skips members the client does not know", () => {
    const ghost = room("shed", ["shed", "gone"]);
    expect(withActiveGroupMembers([ghost], ghost, players)).toHaveLength(1);
  });
});
