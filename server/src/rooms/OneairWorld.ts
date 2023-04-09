import { Room, Client } from "colyseus";
import { MyRoomState } from "./schema/MyRoomState";

export class OneairWorld extends Room<MyRoomState> {
  onCreate(options: any) {
    this.setState(new MyRoomState());
    console.log("CREATE", options);

    this.onMessage("type", (client, message) => {
      //
      // handle "type" message
      //
      console.log("MESSAGE", client, message);
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
