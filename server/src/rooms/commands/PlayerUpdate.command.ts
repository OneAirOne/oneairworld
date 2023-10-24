import { Command } from "@colyseus/command";
import { Client } from "colyseus";

import { Game } from "../Game.room";

import type { InputPayload } from "../../../../shared/types";

interface Payload {
  client: Client;
  data: InputPayload;
}

export class PlayerUpdateCommand extends Command<Game, Payload> {
  execute(payload: Payload) {
    const { client, data } = payload;

    const player = this.state.players.get(client.sessionId);
    const velocity = 2;
    console.log("position ", player.x, player.y);

    if (!player) return;

    if (data.left) {
      player.x -= velocity;
      player.anim = "Left";
    } else if (data.right) {
      player.x += velocity;
      player.anim = "Right";
    }

    if (data.up) {
      player.y -= velocity;
      player.anim = "Up";
    } else if (data.down) {
      player.y += velocity;
      player.anim = "Down";
    }
  }
}
