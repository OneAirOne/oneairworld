import Matter from "matter-js";
const fs = require("fs");

import { COLLISION_CATEGORY } from "../../engine.config";
import {
  TiledInfoObject,
  TiledLayer,
  TiledObjectType,
  TiledRoomObject,
  COLLIDE_LAYERS,
} from "../../../../../shared/map.config";

const COLLISION_OFFSET_X = 0.5;
const MAP_NAME = "map";

const MAP_CONFIG = {
  isStatic: true,
  collisionFilter: {
    category: COLLISION_CATEGORY.WALL,
    mask: COLLISION_CATEGORY.PLAYER | COLLISION_CATEGORY.ENEMY,
  },
};

type TileRefOnTileset = number;

// Check the .tmx file in Tiled software to view thoses data
interface TiledData {
  name: TiledLayer;
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

/**
 * Read the world tilemap and create collide bodies
 */
export function createMap(world: Matter.World) {
  let map: any;

  try {
    const tilemapFile = `${__dirname}/${MAP_NAME}.json`;

    map = JSON.parse(fs.readFileSync(tilemapFile, "utf8"));
  } catch (e) {
    console.error(e);

    return;
  }

  let tileWidth = map.tilewidth;
  let tileHeight = map.tileheight;

  let tileByID: any = {};

  // Check collide property of the sprite and create a map with this result
  map?.tilesets?.forEach((tileset: any) => {
    tileset?.tiles?.forEach((tile: any) => {
      let isCollide = false;
      if (tile) {
        const collideProperty = tile?.properties.find(
          (property: any) => property.name === "collide"
        );
        // if (tile.id === 30367) {
        //   console.log(collideProperty);
        // }
        if (collideProperty) {
          isCollide = collideProperty.value;
          // if (tile.id === 30367) {
          //   console.log({ isCollide });
          // }
        }
        tileByID[tile.id] = isCollide;
      }
    });
  });

  map.layers.forEach((layer: TiledData) => {
    // TODO: use collide custom propertie from tiled
    const hasCollision = COLLIDE_LAYERS.includes(layer.name);

    if (hasCollision) {
      let layerWidth = layer.width;

      layer?.data?.forEach((tiledData: TileRefOnTileset, index: number) => {
        let tileX = (index % layerWidth) + COLLISION_OFFSET_X;
        let tileY = index / layerWidth;

        // TODO: find a way to eveluate collide property
        const isCollide = tileByID[tiledData];
        // if (isCollide) {
        //   console.log("hit", isCollide);
        // }
        if (tiledData > 0) {
          Matter.World.addBody(
            world,
            Matter.Bodies.rectangle(
              tileX * tileWidth,
              tileY * tileHeight,
              tileWidth,
              tileHeight,
              MAP_CONFIG
            )
          );
        }
      });
    }
    if (layer.name === TiledLayer.COLLIDE_ABOVE_PLAYER) {
      console.log("Create layer wall");
    }
  });
}

/**
 * Get all spawn points from the "spawn" layer in Tiled
 */
export function getSpawnPoints(): { x: number; y: number }[] {
  let map: any;

  try {
    const tilemapFile = `${__dirname}/${MAP_NAME}.json`;
    map = JSON.parse(fs.readFileSync(tilemapFile, "utf8"));
  } catch (e) {
    console.error(e);
    return [];
  }

  const spawnLayer = map.layers.find(
    (layer: TiledData) => layer.name === TiledLayer.SPAWN
  );

  if (!spawnLayer || !spawnLayer.objects) return [];

  return spawnLayer.objects.map((obj: TiledObject) => ({
    x: obj.x,
    y: obj.y,
  }));
}

interface ObjectInfo {
  start: {
    x: number;
    y: number;
  };
}
/**
 * Get objet name "info" from Tiled
 */
export function getTiledInfos() {
  let map: any;
  let result: ObjectInfo = {
    start: {
      x: 0,
      y: 0,
    },
  };

  try {
    const tilemapFile = `${__dirname}/${MAP_NAME}.json`;

    map = JSON.parse(fs.readFileSync(tilemapFile, "utf8"));
  } catch (e) {
    console.error(e);

    return;
  }

  map.layers.forEach((layer: TiledData) => {
    if (layer.name === TiledLayer.INFO) {
      const infos = layer.objects as TiledInfoObject[];
      const start = infos.find((info) => info.name === TiledObjectType.START);
      if (start) {
        result.start.x = start.x;
        result.start.y = start.y;
      }
    }
  });

  return result;
}
