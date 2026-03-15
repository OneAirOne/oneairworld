import { Client, Room } from "colyseus.js";
import { DataChange } from "@colyseus/schema";

// Shared
import { RoomType } from "../../../shared/types/room";

// Events
import { phaserEvents, Event } from "events";

import {
  IGameState,
  IPlayer,
  IEnemy,
  IArrow,
  Message,
  InputPayload,
  LauchOptions,
} from "../../../shared/types";

export class Network {
  private client: Client;
  private room?: Room<IGameState>;
  private lobby!: Room;

  sessionId!: string;

  constructor() {
    const endpoint = import.meta.env.VITE_COLYSEUS_URL ?? `ws://${window.location.hostname}:2567`;
    this.client = new Client(endpoint);
    this.joinLobbyRoom().then(() => {
      // TODO : store in local store
    });
  }

  /**
   * Join Colyseus' built-in LobbyRoom, which automatically notifies
   * connected clients whenever rooms with "realtime listing" have updates
   */
  async joinLobbyRoom() {
    console.log("Joined the lobby room ... store in store");
    this.lobby = await this.client.joinOrCreate(RoomType.LOBBY);

    this.lobby.onMessage("rooms", (_rooms) => {
      // TODO : store in local store
    });

    this.lobby.onMessage("+", (_update) => {
      // TODO : store in local store
    });

    this.lobby.onMessage("-", (_roomId) => {
      // TODO : store in local store
    });
  }

  /**
   * Join or create a room
   */
  async joinOrCreatePublic(lauchOptions?: LauchOptions) {
    this.room = await this.client.joinOrCreate(RoomType.PUBLIC, lauchOptions);
    this.initialize();
  }

  /**
   * Set up all network listeners before the game starts
   */
  initialize() {
    if (!this.room) return;

    console.log("Initialize service Network ...");

    this.lobby.leave();
    this.sessionId = this.room.sessionId;
    // TODO : save session id in store

    // Add a new instance to the player MapSchema
    this.room.state.players.onAdd = (player: IPlayer, sessionId: string) => {
      console.log("A player has joined! Their unique session id is", sessionId);

      phaserEvents.emit(Event.PLAYER_JOINED, player, sessionId);

      // Track changes on every child object inside the players MapSchema
      (player as any).onChange = (changes: DataChange<any>[]) => {
        changes.forEach((change) => {
          const { field, value } = change;
          // if (field !== "tick") {
          //   console.log("[Network] update ", field, value);
          // }

          phaserEvents.emit(Event.PLAYER_UPDATED, field, value, sessionId);
        });
      };
    };

    /**
     * Remove player from the playes MapSchema
     */
    this.room.state.players.onRemove = (player: IPlayer, key: string) => {
      console.log("player left the rooom ", player, key);

      phaserEvents.emit(Event.PLAYER_LEFT, key);
      // TODO : remove player from the store + display message
    };

    /**
     * Debug: track enemy state
     */
    this.room.state.enemies.onAdd = (enemy: IEnemy, id: string) => {
      console.log(`[Enemy] added id=${id} x=${enemy.x} y=${enemy.y} texture=${enemy.texture}`);

      phaserEvents.emit(Event.ENEMY_JOINED, enemy, id);

      (enemy as any).onChange = (changes: DataChange<any>[]) => {
        changes.forEach(({ field, value }) => {
          phaserEvents.emit(Event.ENEMY_UPDATED, field, value, id);
        });
      };
    };

    this.room.state.enemies.onRemove = (_enemy: IEnemy, id: string) => {
      console.log(`[Enemy] removed id=${id}`);
      phaserEvents.emit(Event.ENEMY_LEFT, id);
    };

    this.room.state.arrows.onAdd = (arrow: IArrow, id: string) => {
      phaserEvents.emit(Event.ARROW_JOINED, arrow, id);
      (arrow as any).onChange = (changes: any[]) => {
        changes.forEach(({ field, value }) => {
          phaserEvents.emit(Event.ARROW_UPDATED, field, value, id);
        });
      };
    };

    this.room.state.arrows.onRemove = (_arrow: IArrow, id: string) => {
      phaserEvents.emit(Event.ARROW_LEFT, id);
    };

    /**
     * When the server sends room data
     */
    this.room.onMessage(Message.SEND_ROOM_DATA, (content) => {
      console.log("[Network] onMessage ", Message.SEND_ROOM_DATA, content);
      // TODO : store room data in store
    });
  }

  /**
   * Send player name to Colyseus server
   */
  updatePlayerName(currentName: string) {
    this.room?.send(Message.UPDATE_PLAYER_NAME, { name: currentName });
  }

  /**
   * Send player updates to Colyseus server
   */
  updatePlayer(payload: InputPayload) {
    this.room?.send(Message.UPDATE_PLAYER, payload);
  }

  /**
   * Notify server that local player is speaking (or stopped)
   */
  setSpeaking(isSpeaking: boolean) {
    this.room?.send(Message.UPDATE_PLAYER_SPEAKING, { isSpeaking });
  }

  setZone(zone: string) {
    this.room?.send(Message.UPDATE_PLAYER_ZONE, { zone });
  }

  /**
   * Register event listener and call back function when a player updated
   */
  onPlayerUpdated(
    callback: (field: string, value: number | string, key: string) => void,
    context?: any
  ) {
    phaserEvents.on(Event.PLAYER_UPDATED, callback, context);
  }

  onPlayerJoin(
    callback: (player: IPlayer, sessionId: string) => void,
    context?: any
  ) {
    phaserEvents.on(Event.PLAYER_JOINED, callback, context);
  }

  onPlayerLeft(callback: (sessionId: string) => void, context?: any) {
    phaserEvents.on(Event.PLAYER_LEFT, callback, context);
  }

  onEnemyJoin(callback: (enemy: IEnemy, id: string) => void, context?: any) {
    phaserEvents.on(Event.ENEMY_JOINED, callback, context);
  }

  onEnemyUpdated(
    callback: (field: string, value: number | string, id: string) => void,
    context?: any
  ) {
    phaserEvents.on(Event.ENEMY_UPDATED, callback, context);
  }

  onEnemyLeft(callback: (id: string) => void, context?: any) {
    phaserEvents.on(Event.ENEMY_LEFT, callback, context);
  }

  onArrowJoin(callback: (arrow: IArrow, id: string) => void, context?: any) {
    phaserEvents.on(Event.ARROW_JOINED, callback, context);
  }

  onArrowUpdated(callback: (field: string, value: number | string, id: string) => void, context?: any) {
    phaserEvents.on(Event.ARROW_UPDATED, callback, context);
  }

  onArrowLeft(callback: (id: string) => void, context?: any) {
    phaserEvents.on(Event.ARROW_LEFT, callback, context);
  }

  getEnemies(): IGameState["enemies"] | undefined {
    return this.room?.state.enemies;
  }
}

let NetworkSingleton: any = null;

function getNetwork() {
  if (!NetworkSingleton) {
    NetworkSingleton = new Network();
  }

  return NetworkSingleton;
}

export default getNetwork();
