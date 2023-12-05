export enum TiledLayer {
  INFO = "info",
  ABOVE = "above",
  COLLIDE_ABOVE_PLAYER = "collide_above_player",
  COLLIDE_UNDER_PLAYER = "collide_under_player",
  STUFF_ABOVE_PLAYER = "stuff_above_player",
  STUFF_UNDER_PLAYER = "stuff_under_player",
  BEHIND_STUFF = "behind_stuff",
  ANIMATED = "animated",
  BEHIND = "behind",
  GROUND = "ground",
}

interface LayerConfig {
  name: TiledLayer;
  depth?: number;
}

export const GAME_SCENE_LAYERS: LayerConfig[] = [
  {
    name: TiledLayer.BEHIND,
  },
  {
    name: TiledLayer.GROUND,
  },
  {
    name: TiledLayer.ANIMATED,
  },
  {
    name: TiledLayer.BEHIND_STUFF,
  },
  {
    name: TiledLayer.STUFF_UNDER_PLAYER,
  },
  {
    name: TiledLayer.COLLIDE_UNDER_PLAYER,
  },
  {
    name: TiledLayer.STUFF_ABOVE_PLAYER,
    depth: 1,
  },
  {
    name: TiledLayer.COLLIDE_ABOVE_PLAYER,
    depth: 2,
  },
  {
    name: TiledLayer.ABOVE,
    depth: 2,
  },
];

export const COLLIDE_LAYERS = [
  TiledLayer.COLLIDE_ABOVE_PLAYER,
  TiledLayer.COLLIDE_UNDER_PLAYER,
];

export enum TiledObjectType {
  START = "start",
}

export interface TiledRoomObject {
  name: string;
  type: string;
  height: number;
  id: number;
  properties: any[];
  rotation: number;
  visible: boolean;
  width: number;
  x: number;
  y: number;
}

export interface TiledInfoObject {
  name: string;
  type: string;
  height: number;
  id: number;
  properties: any[];
  rotation: number;
  visible: boolean;
  width: number;
  x: number;
  y: number;
}
