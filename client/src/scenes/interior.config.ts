import { Zone } from "../../../shared/types";

export interface InteriorTileset {
  name: string;
  path: string;
}

export interface InteriorConfig {
  /** Phaser cache key for the tilemap JSON */
  mapKey: string;
  mapPath: string;
  tilesets: InteriorTileset[];
  /** Where the player appears when entering */
  playerSpawn: { x: number; y: number };
  /** Where the player reappears in Road after exiting */
  returnSpawn: { x: number; y: number };
  /** Optional label shown as the room title */
  label?: string;
}

export const INTERIORS: Partial<Record<Zone, InteriorConfig>> = {
  [Zone.INTERIOR_OLD_HOUSE]: {
    mapKey: "interior-ghost",
    mapPath: "assets/map/interior-ghost.json",
    tilesets: [
      { name: "interior-jap", path: "assets/map/interior-jap.png" },
    ],
    playerSpawn: { x: 128, y: 200 },
    returnSpawn: { x: 0, y: 0 },
    label: "Repaire du fantôme",
  },
  [Zone.INTERIOR_GAME_ROOM]: {
    mapKey: "interior-robot",
    mapPath: "assets/map/interior-robot.json",
    tilesets: [
      { name: "interior-jap", path: "assets/map/interior-jap.png" },
    ],
    playerSpawn: { x: 128, y: 200 },
    returnSpawn: { x: 0, y: 0 },
    label: "Robot's lab",
  },
};
