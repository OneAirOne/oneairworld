import { Command } from "@colyseus/command";
import { Client } from "colyseus";

import { Game } from "../Game";

interface Payload {
  client: Client;
  x: number;
  y: number;
  anim: string; // TODO : share anim names with the client inside /shared folder
}

export class PlayerUpdateCommand extends Command<Game, Payload> {
  execute(data: Payload) {
    const { client, x, y, anim } = data;

    const player = this.state.players.get(client.sessionId);

    if (!player) return;

    player.x = x;
    player.y = y;
    player.anim = anim;
  }
}
