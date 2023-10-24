import { Schema, type } from "@colyseus/schema";

import type { IPlayer } from "../../../../shared/types";

export class Player extends Schema implements IPlayer {
  @type("string") name = "";
  @type("number") x = 150;
  @type("number") y = 100;
  @type("string") anim = "";
}
