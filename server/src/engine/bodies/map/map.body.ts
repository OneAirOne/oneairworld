import Matter from "matter-js";
const fs = require("fs");

import { COLLISION_CATEGORY } from "../../engine.config";
import { TiledLayer, TiledRoomObject } from "../../../../../shared/map.config";

const COLLISION_LAYERS = [
  TiledLayer.WALL,
  TiledLayer.ANIMATED,
  TiledLayer.STUFF,
];
const COLLISION_OFFSET_X = 0.5;
const MAP_NAME = "map";

const MAP_CONFIG = {
  isStatic: true,
  collisionFilter: {
    category: COLLISION_CATEGORY.WALL,
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

  map.layers.forEach((layer: TiledData) => {
    // TODO: use collide custom propertie from tiled
    const hasCollision = COLLISION_LAYERS.includes(layer.name);

    if (hasCollision) {
      let layerWidth = layer.width;
      let layerHeight = layer.height;

      console.log("Create collision layer", layerWidth, layerHeight);

      layer?.data?.forEach((tiledData: TileRefOnTileset, index: number) => {
        let tileX = (index % layerWidth) + COLLISION_OFFSET_X;
        let tileY = index / layerWidth;

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
    if (layer.name === TiledLayer.WALL) {
      console.log("Create layer wall");
    }
  });
}

/**
 * Get objets from Tiled
 */
export function getTiledObjects() {
  let map: any;
  let meta: TiledRoomObject[];

  try {
    const tilemapFile = `${__dirname}/${MAP_NAME}.json`;

    map = JSON.parse(fs.readFileSync(tilemapFile, "utf8"));
  } catch (e) {
    console.error(e);

    return;
  }

  map.layers.forEach((layer: TiledData) => {
    if (layer.name === TiledLayer.OBJECTS) {
      console.log(layer.objects);
      console.log(layer);

      meta = layer.objects as TiledRoomObject[];
    }
  });

  return meta;
}
