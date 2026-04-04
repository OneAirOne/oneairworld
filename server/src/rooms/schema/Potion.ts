import { Schema, type } from "@colyseus/schema";

export class Potion extends Schema {
  @type("string") id = "";
  @type("number") x = 0;
  @type("number") y = 0;
}
