import { Room, Client } from "colyseus";
import { Dispatcher } from "@colyseus/command";
import bcrypt from "bcrypt";

// Schemas
import { GameState } from "./schema/GameState";

// Commands
import { PlayerUpdateCommand } from "./commands";

import { GameEngine } from "../Game.engine";

// Shared
import {
  Message,
  IRoomData,
  InputPayload,
  LauchOptions,
} from "../../../shared/types";

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

  private engine: GameEngine = null;

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

    this.engine = new GameEngine(this.state);

    this.onMessage(Message.UPDATE_PLAYER, (client, data: InputPayload) => {
      this.dispatcher.dispatch(new PlayerUpdateCommand(), {
        client,
        data,
      });
    });

    // Game loop
    this.setSimulationInterval((deltaTime) => this.update(deltaTime));
  }

  update(deltaTime: number) {
    this.state.players.forEach((player, sessionId) => {
      let input: InputPayload;

      // Dequeue player inputs
      while ((input = player.inputQueue.shift())) {
        this.engine.processAction(sessionId, input, deltaTime);
      }
    });

    this.engine.update(deltaTime);
  }

  /**
   * Call when a new player join a room
   */
  onJoin(client: Client, lauchOptions: LauchOptions) {
    console.log(client.sessionId, "joined!", lauchOptions);

    this.engine.addPlayer(client.sessionId, lauchOptions);

    client.send(Message.SEND_ROOM_DATA, {
      id: this.roomId,
      name: this.name,
    });
  }

  /**
   * Call when a player leave the room
   */
  onLeave(client: Client, consented: boolean) {
    this.engine.removePLayer(client.sessionId);
  }

  /**
   * Call when a player dispose
   */
  onDispose() {
    console.log("[GAME] onDispose");
  }
}
