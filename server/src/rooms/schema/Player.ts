import { Schema, type } from "@colyseus/schema";

import { sharedConfig } from "../../../../shared/config";

import type { IPlayer } from "../../../../shared/types";

export class Player extends Schema implements IPlayer {
  @type("string") name = "";
  @type("number") x = sharedConfig.WORLD_WIDTH / 2;
  @type("number") y = sharedConfig.WORLD_HEIGHT / 2;
  @type("string") anim = "";
}
