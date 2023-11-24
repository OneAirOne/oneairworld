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

    // Enqueue input to user input buffer
    player.inputQueue.push(data);
  }
}
