import { Schema, type } from "@colyseus/schema";

import { sharedConfig } from "../../../../shared/config";

import { Characters, type IPlayer } from "../../../../shared/types";

import { ANIM_START } from "../../constants";

export class Player extends Schema implements IPlayer {
  @type("string") name = "";
  @type("number") x = sharedConfig.WORLD_WIDTH / 2;
  @type("number") y = sharedConfig.WORLD_HEIGHT / 2;
  @type("string") anim = ANIM_START;
  @type("string") texture = Characters.ONEAIR;

  inputQueue: any[] = [];
}
