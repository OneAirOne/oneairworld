export enum TiledLayer {
  GROUND = "ground",
  WALL = "wall",
  STUFF_ABOVE_PLAYER_WITH_COLLISION = "stuff_above_player_with_collision",
  STUFF_ABOVE_PLAYER_WITHOUT_COLLISON = "stuff_above_player_without_collision",
  STUFF_UNDER_PLAYER = "stuff_under_player",
  ANIMATED = "animated",
  ABOVE = "above",
  BEHIND = "behind",
  INFO = "info",
}

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
