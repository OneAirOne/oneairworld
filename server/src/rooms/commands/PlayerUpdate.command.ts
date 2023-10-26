import { Command } from "@colyseus/command";
import { Client } from "colyseus";

import { Game } from "../Game.room";

import { PLAYER_VELOCITY, type InputPayload } from "../../../../shared/types";

interface Payload {
  client: Client;
  data: InputPayload;
}

export class PlayerUpdateCommand extends Command<Game, Payload> {
  execute(payload: Payload) {
    const { client, data } = payload;

    const player = this.state.players.get(client.sessionId);

    if (!player) return;

    if (data.left) {
      player.x -= PLAYER_VELOCITY;
      player.anim = "Left";
    } else if (data.right) {
      player.x += PLAYER_VELOCITY;
      player.anim = "Right";
    }

    if (data.up) {
      player.y -= PLAYER_VELOCITY;
      player.anim = "Up";
    } else if (data.down) {
      player.y += PLAYER_VELOCITY;
      player.anim = "Down";
    }
  }
}
