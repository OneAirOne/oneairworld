import { Room, Client } from "colyseus";
import { Dispatcher } from "@colyseus/command";
import bcrypt from "bcrypt";

// Schemas
import { GameState } from "./schema/GameState";
import { Player } from "./schema/Player";

// Commands
import { PlayerUpdateCommand } from "./commands";

// Shared
import { Message, IRoomData, InputPayload } from "../../../shared/types";

/**
 * Game room
 *
 * Manage the game state
 * Colyseus sends state updates to the client at every 50ms (20fps)
 */
export class Game extends Room<GameState> {
  private dispatcher = new Dispatcher(this);
  private name: string;
  private password: string | null = null;

  /**
   * Create the room and all messages dispatcher
   * according to the "command pattern"
   *
   * Credit: https://0-13-x.docs.colyseus.io/best-practices/command-pattern/
   */
  async onCreate(options: IRoomData) {
    const { name, password, autoDispose } = options;
    this.name = name;
    this.password = password;
    this.autoDispose = autoDispose;

    let hasPassword = false;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hasPassword = true;
    }
    this.setMetadata({ name, hasPassword });

    this.setState(new GameState());

    this.onMessage(Message.UPDATE_PLAYER, (client, data: InputPayload) => {
      this.dispatcher.dispatch(new PlayerUpdateCommand(), {
        client,
        data,
      });
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    const player = new Player();

    player.x = 0;
    player.y = 0;

    this.state.players.set(client.sessionId, player);

    client.send(Message.SEND_ROOM_DATA, {
      id: this.roomId,
      name: this.name,
    });
  }

  onLeave(client: Client, consented: boolean) {
    if (this.state.players.has(client.sessionId)) {
      this.state.players.delete(client.sessionId);
    }
  }

  onDispose() {
    console.log("[GAME] onDispose");
  }
}
