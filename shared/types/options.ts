import { Characters, IPlayer } from "./player";

export interface Options {
  name: IPlayer["name"];
  texture: Characters;
  x?: number;
  y?: number;
  color?: string;
}

export interface OptionsResponse {
  name: string;
  texture: string;
  x: number;
  y: number;
}
