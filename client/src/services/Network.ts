import { Client, Room } from "colyseus.js";
import { DataChange } from "@colyseus/schema";

// Shared
import { RoomType } from "../../../shared/types/room";

// Events
import { gameEvents, Events } from "events";

import type { IGameState } from "../../../shared/types/gameState";
import type { IPlayer } from "../../../shared/types/player";

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
      console.log("joined the lobby room ... store in store");
    });
  }

  /**
   * Join Colyseus' built-in LobbyRoom, which automatically notifies
   * connected clients whenever rooms with "realtime listing" have updates
   */
  async joinLobbyRoom() {
    this.lobby = await this.client.joinOrCreate(RoomType.LOBBY);

    this.lobby.onMessage("rooms", (rooms) => {
      // TODO : store in local store
      console.log({ rooms });
    });

    this.lobby.onMessage("+", ([roomId, room]) => {
      // TODO : store in local store
    });

    this.lobby.onMessage("-", (roomId) => {
      // TODO : store in local store
    });
  }

  /**
   * Join ar create a room
   */
  async joinOrCreatePublic() {
    this.room = await this.client.joinOrCreate(RoomType.PUBLIC);
    this.initialize();
  }

  /**
   * Set up all network listeners before the game starts
   */
  initialize() {
    if (!this.room) return;

    console.log("initialize ...");

    this.lobby.leave();
    this.sessionId = this.room.sessionId;
    // TODO : save session id in store

    // Add a new instance to the player MapSchema
    this.room.state.players.onAdd = (player: IPlayer, key: string) => {
      if (key === this.sessionId) return;

      // Track changes on every child object inside the players MapSchema
      player.onChange = (changes: DataChange<any>[]) => {
        console.log("[Network] changes ", changes);
        changes.forEach((change) => {
          const { field, value } = change;
          gameEvents.emit(Events.PLAYER_UPDATED, field, value, key);

          if (field === "name" && value !== "") {
            gameEvents.emit(Events.PLAYER_JOINED, player, key);
            // TODO : save new player in store + display message
          }
        });
      };
    };

    // Remove player from the playes MapSchema
    this.room.state.players.onRemove = (player: IPlayer, key: string) => {
      gameEvents.emit(Events.PLAYER_LEFT, key);
      // TODO : remove player from the store + display message
    };
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
