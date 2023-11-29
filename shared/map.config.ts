export enum TiledLayer {
  GROUND = "ground",
  WALL = "wall",
  STUFF = "stuff",
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
