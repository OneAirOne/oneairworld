import { Room, Client } from "colyseus";
import { Dispatcher } from "@colyseus/command";
import bcrypt from "bcrypt";
import Matter from "matter-js";

// Schemas
import { GameState } from "./schema/GameState";
import { Player } from "./schema/Player";

// Commands
import { PlayerUpdateCommand } from "./commands";

import { GameEngine } from "../Game.engine";

// Shared
import {
  Message,
  IRoomData,
  InputPayload,
  LauchOptions,
  PLAYER_VELOCITY,
  Anim,
} from "../../../shared/types";
import { getIddleAnim } from "../../../shared/helpers";

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
  private lastAnim: Anim = Anim.IDDLE_DOWN;

  private engine: GameEngine = null;

  fixedTimeStep = 1000 / 60;

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

    // Fix the tick rate with the client
    let elapsedTime = 0;

    this.setSimulationInterval((deltaTime) => {
      elapsedTime += deltaTime;

      while (elapsedTime >= this.fixedTimeStep) {
        console.log(elapsedTime, this.fixedTimeStep);

        elapsedTime -= this.fixedTimeStep;

        this.update(this.fixedTimeStep);
        this.engine.update(deltaTime);
      }
    });

    // Game loop
    // this.setSimulationInterval((deltaTime) => this.update(deltaTime));
  }

  update(deltaTime: number) {
    this.state.players.forEach((player, sessionId) => {
      let input: InputPayload;

      // Dequeue player inputs
      while ((input = player.inputQueue.shift())) {
        this.engine.processAction(sessionId, input, deltaTime);

        // Check for the iddle anim
        const iddleAnim = getIddleAnim(input, player.anim as Anim);

        if (iddleAnim) {
          player.anim = iddleAnim;
        }
        player.tick = input.tick;
      }
    });
  }

  /**
   * Call when a new player join a room
   */
  onJoin(client: Client, lauchOptions: LauchOptions) {
    console.log(client.sessionId, "joined!", lauchOptions);

    // const player = new Player();

    // // Set player with client options
    // player.name = lauchOptions.name;
    // player.texture = lauchOptions.texture;

    // this.state.players.set(client.sessionId, player);

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
