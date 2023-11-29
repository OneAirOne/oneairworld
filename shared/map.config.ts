export enum TiledLayer {
  GROUND = "ground",
  WALL = "wall",
  STUFF_CITY_MODERN = "stuff_city_modern",
  STUFF_CITY_MODERN_ABOVE_PLAYER = "stuff_city_modern_above_player",
  STUFF_CITY_JAP = "stuff_city_jap",
  ANIMATED = "animated",
  OBJECTS = "objects",
  ABOVE_PLAYER = "above_player",
}

export enum TiledObjectType {
  ROOM = "room",
}

export interface TiledRoomObject {
  name: string;
  type: TiledObjectType.ROOM;
  height: number;
  id: number;
  properties: any[];
  rotation: number;
  visible: boolean;
  width: number;
  x: number;
  y: number;
}
