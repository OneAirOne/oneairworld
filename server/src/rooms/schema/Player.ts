import { Schema, type } from "@colyseus/schema";

import { sharedConfig } from "../../../../shared/config";

import { Characters, type IPlayer } from "../../../../shared/types";

export class Player extends Schema implements IPlayer {
  @type("string") name = "";
  @type("number") x = sharedConfig.WORLD_WIDTH / 2;
  @type("number") y = sharedConfig.WORLD_HEIGHT / 2;
  @type("string") anim = "IdleDown";
  @type("string") texture = Characters.ONEAIR;
  @type("number") tick: number;

  inputQueue: any[] = [];
}
