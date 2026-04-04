import Matter from "matter-js";
const fs = require("fs");

import { COLLISION_CATEGORY } from "../../engine.config";
import { TiledInfoObject } from "../../../../../shared/map.config";
import { Zone } from "../../../../../shared/types";
import { PNJ_LIST } from "../../../../../shared/shared.config";

// ── Zone configuration ────────────────────────────────────────────────────────

interface ZoneMapConfig {
  /** JSON map filename relative to this directory (undefined = no map yet) */
  mapFile?: string;
  collideLayers: string[];
}

const ZONE_CONFIG: Record<Zone, ZoneMapConfig> = {
  [Zone.ROAD]:               { mapFile: "road.json",             collideLayers: ["collide_above_player", "collide_under_player"] },
  [Zone.INTERIOR_ARCADE]:    { mapFile: "interior-arcade.json",  collideLayers: ["collide_above_player","collide_under_player"] },
  [Zone.INTERIOR_OLD_HOUSE]: {                                    collideLayers: ["collide_under_player"] },
  [Zone.INTERIOR_GAME_ROOM]: {                                    collideLayers: ["collide_under_player"] },
};

// ── Internal helpers ──────────────────────────────────────────────────────────

const COLLISION_OFFSET_X = 0.5;

const WALL_CONFIG = {
  isStatic: true,
  collisionFilter: {
    category: COLLISION_CATEGORY.WALL,
    mask: COLLISION_CATEGORY.PLAYER | COLLISION_CATEGORY.ENEMY | COLLISION_CATEGORY.ARROW_HIT_BOX,
  },
};

type TileRefOnTileset = number;

interface TiledData {
  name: string;
  width: number;
  height: number;
  data?: TileRefOnTileset[];
  objects?: TiledObject[];
}

interface TiledObject {
  height: number;
  id: number;
  name: string;
  properties: any[];
  rotation: number;
  type: string;
  visible: boolean;
  width: number;
  x: number;
  y: number;
}

function readMap(zone: Zone): any | null {
  const config = ZONE_CONFIG[zone];
  if (!config?.mapFile) return null;

  try {
    return JSON.parse(fs.readFileSync(`${__dirname}/${config.mapFile}`, "utf8"));
  } catch (e) {
    console.warn(`[createZone] No map file for zone "${zone}": ${config.mapFile}`);
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Read the zone tilemap and populate the world with collision bodies.
 */
export function createZone(zone: Zone, world: Matter.World): void {
  const map = readMap(zone);
  if (!map) return;

  const config    = ZONE_CONFIG[zone];
  const tileWidth  = map.tilewidth  as number;
  const tileHeight = map.tileheight as number;

  // Build tile-id → isCollide lookup from tileset properties
  const tileByID: Record<number, boolean> = {};
  map?.tilesets?.forEach((tileset: any) => {
    tileset?.tiles?.forEach((tile: any) => {
      if (!tile) return;
      const prop = tile?.properties?.find((p: any) => p.name === "collide");
      tileByID[tile.id] = prop ? prop.value : false;
    });
  });

  map.layers.forEach((layer: TiledData) => {
    if (!config.collideLayers.includes(layer.name)) return;

    const layerWidth = layer.width;
    layer?.data?.forEach((tileRef: TileRefOnTileset, index: number) => {
      if (tileRef <= 0) return;
      const col = index % layerWidth;
      const row = Math.floor(index / layerWidth);
      Matter.World.addBody(
        world,
        Matter.Bodies.rectangle(
          (col + COLLISION_OFFSET_X) * tileWidth,
          (row + 0.5) * tileHeight,
          tileWidth,
          tileHeight,
          WALL_CONFIG
        )
      );
    });
  });
}

const PNJ_BODY_SIZE = 14; // px — collision box width & height for each NPC

/**
 * Add static collision bodies for every visible PNJ in the zone.
 * Bodies are static (won't move on contact) and block players, enemies, and arrows.
 */
export function createPnjBodies(zone: Zone, world: Matter.World): void {
  if (zone !== Zone.ROAD) return; // PNJs only live on the road map
  const map = readMap(zone);
  if (!map) return;

  const infoLayer = map.layers.find((l: TiledData) => l.name === "info");
  if (!infoLayer?.objects) return;

  const spawnByName: Record<string, { x: number; y: number }> = {};
  for (const obj of infoLayer.objects as TiledObject[]) {
    spawnByName[obj.name] = { x: obj.x, y: obj.y };
  }

  for (const pnj of PNJ_LIST) {
    if (!pnj.visible) continue;
    const pos = spawnByName[pnj.spawnPoint];
    if (!pos) continue;

    Matter.World.addBody(
      world,
      Matter.Bodies.rectangle(
        pos.x + pnj.offsetX,
        pos.y + pnj.offsetY,
        PNJ_BODY_SIZE,
        PNJ_BODY_SIZE,
        { ...WALL_CONFIG, label: `pnj_${pnj.texture}` }
      )
    );
  }
}

/**
 * Get all spawn points from the "spawn" layer of the given zone's map.
 */
export function getSpawnPoints(zone: Zone): { x: number; y: number }[] {
  const map = readMap(zone);
  if (!map) return [];

  const spawnLayer = map.layers.find((l: TiledData) => l.name === "spawn");
  if (!spawnLayer?.objects) return [];

  return spawnLayer.objects.map((obj: TiledObject) => ({ x: obj.x, y: obj.y }));
}

/**
 * Get all "potion" point objects from the "info" layer of the given zone's map.
 */
export function getPotionSpawnPoints(zone: Zone): { x: number; y: number }[] {
  const map = readMap(zone);
  if (!map) return [];
  const infoLayer = map.layers.find((l: TiledData) => l.name === "info");
  if (!infoLayer?.objects) return [];
  return (infoLayer.objects as TiledObject[])
    .filter((o) => o.name === "potion")
    .map((o) => ({ x: o.x, y: o.y }));
}

/**
 * Get all "zone_spawn" rectangles from the "info" layer of the given zone's map.
 */
export function getCoinSpawnZones(zone: Zone): { x: number; y: number; width: number; height: number }[] {
  const map = readMap(zone);
  if (!map) return [];

  const infoLayer = map.layers.find((l: TiledData) => l.name === "info");
  if (!infoLayer?.objects) return [];

  return (infoLayer.objects as TiledObject[])
    .filter((o) => o.name === "zone_spawn")
    .map((o) => ({ x: o.x, y: o.y, width: o.width, height: o.height }));
}

/**
 * Get the "start" object from the "info" layer of the given zone's map.
 */
export function getTiledInfos(zone: Zone): { start: { x: number; y: number } } {
  const result = { start: { x: 0, y: 0 } };
  const map = readMap(zone);
  if (!map) return result;

  map.layers.forEach((layer: TiledData) => {
    if (layer.name !== "info") return;
    const start = (layer.objects as TiledInfoObject[])?.find((o) => o.name === "start");
    if (start) {
      result.start.x = start.x;
      result.start.y = start.y;
    }
  });

  return result;
}
