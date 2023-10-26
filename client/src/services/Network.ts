import { Client, Room } from "colyseus.js";
import { DataChange } from "@colyseus/schema";

// Shared
import { RoomType } from "../../../shared/types/room";

// Events
import { phaserEvents, Event } from "events";

import {
  IGameState,
  IPlayer,
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
    const protocol = window.location.protocol.replace("http", "ws");
    const endpoint = import.meta.env.PROD
      ? "TODO : define the endpoint"
      : `${protocol}//${window.location.hostname}:2567`;
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

    this.lobby.onMessage("rooms", (rooms) => {
      // TODO : store in local store
    });

    this.lobby.onMessage("+", ([roomId, room]) => {
      // TODO : store in local store
    });

    this.lobby.onMessage("-", (roomId) => {
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
      player.onChange = (changes: DataChange<any>[]) => {
        changes.forEach((change) => {
          const { field, value } = change;

          console.log("[Network] PLAYER_UPDATED", field, value);
          phaserEvents.emit(Event.PLAYER_UPDATED, field, value, sessionId);

          // if (field === "name" && value !== "") {
          //   console.log("[Network] PLAYER_JOINED", field, value);
          //   phaserEvents.emit(Event.PLAYER_JOINED, player, sessionId);
          //   // TODO : save new player in store + display message
          // }
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
}

let NetworkSingleton: any = null;

function getNetwork() {
  if (!NetworkSingleton) {
    NetworkSingleton = new Network();
  }

  return NetworkSingleton;
}

export default getNetwork();
