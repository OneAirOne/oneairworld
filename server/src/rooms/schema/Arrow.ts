import { Schema, type } from "@colyseus/schema";
import { DIRECTION } from "../../../../shared/types";

export class Arrow extends Schema {
  @type("string") id = "";
  @type("number") x = 0;
  @type("number") y = 0;
  @type("string") direction: string = DIRECTION.DOWN;
  @type("string") ownerId = "";
}
