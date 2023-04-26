import { Client, Room } from "colyseus.js";

import { OneairWorldState } from "../../../shared/types/oneairWorldState";
import { RoomType } from "../../../shared/types/roomType";

export class Network {
  private client: Client;
  private room?: Room<OneairWorldState>;
  private lobby!: Room;

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
   * method to join Colyseus' built-in LobbyRoom, which automatically notifies
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
