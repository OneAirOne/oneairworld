import { Room, Client } from "colyseus";
import { Dispatcher } from "@colyseus/command";
import bcrypt from "bcrypt";

// Schemas
import { GameState } from "./schema/GameState";
import { Player } from "./schema/Player";

// Commands
import { PlayerUpdateCommand } from "./commands";

// Shared
import { Message, IRoomData } from "../../../shared/types";

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
    console.log("[GAME] onCreate", options);
    const { name, password, autoDispose } = options;
    this.name = name;
    this.password = password;
    this.autoDispose = autoDispose;

    let hasPassword = false;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(password, salt);
      hasPassword = true;
    }
    this.setMetadata({ name, hasPassword });

    this.setState(new GameState());

    this.onMessage(
      Message.UPDATE_PLAYER,
      (client, message: { x: number; y: number; anim: string }) => {
        this.dispatcher.dispatch(new PlayerUpdateCommand(), {
          client,
          x: message.x,
          y: message.y,
          anim: message.anim,
        });
      }
    );
  }

  onJoin(client: Client, options: any) {
    console.log("[GAME] onJoin", options);
    this.state.players.set(client.sessionId, new Player());
    client.send(Message.SEND_ROOM_DATA, {
      id: this.roomId,
      name: this.name,
    });
  }

  onLeave(client: Client, consented: boolean) {
    console.log("[GAME] onLeave", client);
    if (this.state.players.has(client.sessionId)) {
      this.state.players.delete(client.sessionId);
    }
  }

  onDispose() {
    console.log("[GAME] onDispose");
  }
}
