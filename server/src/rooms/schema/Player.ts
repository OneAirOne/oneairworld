import { Schema, type } from "@colyseus/schema";

import type { IPlayer } from "../../../../shared/types";

export class Player extends Schema implements IPlayer {
  @type("string") name = "";
  @type("number") x = 705;
  @type("number") y = 500;
  @type("string") anim = "";
}
