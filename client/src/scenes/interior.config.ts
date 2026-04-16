import { Zone } from "../../../shared/types";
import type { LayerConfig } from "./road.config";
import { TiledLayer } from "./road.config";
import type { PnjSpawnConfig, PoiZoneConfig } from "./game.helpers";
import { PROJECTS } from "../config/projects.config";

const ARCADE_PROJECTS = PROJECTS.filter((p) => p.category === "personnel");

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
  /** PNJs to spawn in this interior */
  pnjs?: PnjSpawnConfig[];
  /** Proximity zones that directly open a project (arcade machines, objects…) */
  poiZones?: PoiZoneConfig[];
}

export const INTERIOR_SCENE_LAYERS: LayerConfig[] = [
  { name: TiledLayer.BEHIND },
  { name: TiledLayer.GROUND },
  { name: TiledLayer.BEHIND_STUFF,          depth: 1 },
  { name: TiledLayer.STUFF_UNDER_PLAYER },
  { name: TiledLayer.COLLIDE_UNDER_PLAYER },
  { name: TiledLayer.ANIMATED_UNDER_PLAYER },  // above ground, below player (same depth 0, added before player)
  { name: TiledLayer.STUFF_ABOVE_PLAYER,    depth: 1 },
  { name: TiledLayer.COLLIDE_ABOVE_PLAYER,  depth: 2 },
  { name: TiledLayer.ABOVE,                 depth: 3 },
  { name: TiledLayer.ANIMATED,              depth: 10 },
];

export const INTERIORS: Partial<Record<Zone, InteriorConfig>> = {
  [Zone.INTERIOR_OLD_HOUSE]: {
    mapKey: "interior-ghost",
    mapPath: "/assets/map/interior-ghost.json",
    tilesets: [
      { name: "interior-jap", path: "/assets/map/interior-jap.png" },
    ],
    playerSpawn: { x: 128, y: 200 },
    returnSpawn: { x: 0, y: 0 },
    label: "Repaire du fantôme",
  },
  [Zone.INTERIOR_GAME_ROOM]: {
    mapKey: "interior-robot",
    mapPath: "/assets/map/interior-robot.json",
    tilesets: [
      { name: "interior-jap", path: "/assets/map/interior-jap.png" },
    ],
    playerSpawn: { x: 128, y: 200 },
    returnSpawn: { x: 0, y: 0 },
    label: "Robot's lab",
  },
  [Zone.INTERIOR_ARCADE]: {
    mapKey: "interior-arcade",
    mapPath: "/assets/map/interior-arcade.json",
    tilesets: [
      { name: "arcade",       path: "/assets/map/arcade.png" },
      { name: "interior-jap", path: "/assets/map/interior-jap.png" },
      { name: "logo",         path: "/assets/map/logos.png" },
    ],
    playerSpawn: { x: 128, y: 200 },
    returnSpawn: { x: 0, y: 0 },
    label: "Arcade",
    pnjs: [
      { spawnPoint: "pnj1_arcade", texture: "wendy", animKey: "wendyIdle", dialogueId: "wendy_arcade", bubbleOffsetX: 10, bubbleOffsetY: 15 },
    ],
    poiZones: ARCADE_PROJECTS.map((p, i) => ({
      spawnPoint:  `project${i + 1}`,
      text:        p.hintDesktop ?? `Entrée — voir «${p.name}»`,
      textMobile:  p.hintMobile  ?? `Voir «${p.name}»`,
      action:      `open_project:${p.id}`,
      radius:      30,
    })),
  },
};
