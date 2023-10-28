import { Room, Client } from "colyseus";
import { Dispatcher } from "@colyseus/command";
import bcrypt from "bcrypt";

// Schemas
import { GameState } from "./schema/GameState";
import { Player } from "./schema/Player";

// Commands
import { PlayerUpdateCommand } from "./commands";

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
        elapsedTime -= this.fixedTimeStep;
        this.fixedTick(this.fixedTimeStep);
      }
    });
  }

  fixedTick(deltaTime: number) {
    this.state.players.forEach((player) => {
      let input: InputPayload;

      // Dequeue player inputs
      while ((input = player.inputQueue.shift())) {
        if (input.left) {
          player.x -= PLAYER_VELOCITY;
          player.anim = Anim.LEFT;
        } else if (input.right) {
          player.x += PLAYER_VELOCITY;
          player.anim = Anim.RIGHT;
        }

        if (input.up) {
          player.y -= PLAYER_VELOCITY;
          player.anim = Anim.UP;
        } else if (input.down) {
          player.y += PLAYER_VELOCITY;
          player.anim = Anim.DOWN;
        }

        // Check for the iddle anim
        const movePayload = {
          up: input.up,
          down: input.down,
          left: input.left,
          right: input.right,
        };

        for (const [key, value] of Object.entries(movePayload)) {
          if (value) {
            this.lastAnim = (key.charAt(0).toUpperCase() +
              key.slice(1)) as Anim;
          }
        }

        const iddleAnim = getIddleAnim(input, this.lastAnim);

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

    const player = new Player();

    // Set player with client options
    player.name = lauchOptions.name;
    player.texture = lauchOptions.texture;

    this.state.players.set(client.sessionId, player);

    client.send(Message.SEND_ROOM_DATA, {
      id: this.roomId,
      name: this.name,
    });
  }

  /**
   * Call when a player leave the room
   */
  onLeave(client: Client, consented: boolean) {
    if (this.state.players.has(client.sessionId)) {
      this.state.players.delete(client.sessionId);
    }
  }

  /**
   * Call when a player dispose
   */
  onDispose() {
    console.log("[GAME] onDispose");
  }
}
