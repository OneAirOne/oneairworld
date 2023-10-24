import Phaser from "phaser";

// Network
import { Network } from "services/Network";

// Characters
import { createCharacterAnims, onairAnimsConfig, Player } from "characters";

// Others
import { SCENES } from "./scene.config";
import type { InputPayload } from "../../../shared/types";
import { SpriteData, WORLD_HEIGHT, WORLD_WIDTH } from "game.config";

export class SceneLevel1 extends Phaser.Scene {
  network!: Network;
  myPlayer!: Player;
  remoteRef: Phaser.GameObjects.Rectangle | null = null;
  private otherPlayerMap = new Map<string, Player>();
  private cursorKeys!: Phaser.Types.Input.Keyboard.CursorKeys;

  // local input  ache
  inputPayload: InputPayload = {
    left: false,
    right: false,
    up: false,
    down: false,
    anim: "Down",
  };

  constructor() {
    super(SCENES.GAME);
  }

  preload() {
    // Set up keyboard
    this.cursorKeys = this.input.keyboard.createCursorKeys();
  }

  create(data: { network: Network }) {
    console.log("Create Game scene", data);

    if (!data.network) {
      throw new Error("Network instance is missing");
    } else {
      this.network = data.network;
    }

    // Create Oneair animation
    createCharacterAnims(onairAnimsConfig, 10, this.anims);

    this.matter.world.setBounds(0, 0, 300, 200, 32);

    this.myPlayer = new Player(
      this,
      150,
      100,
      "oneair",
      this.network.sessionId
    );

    // Setup camera
    this.cameras.main.setZoom(2);
    this.cameras.main.startFollow(this.myPlayer, true);

    // Register network event listener
    this.network.onPlayerUpdated(this.handlePlayerUpdated, this);

    // Add remote ref to visualize server position
    this.remoteRef = this.add.rectangle(150, 100, 12, 12);
    this.remoteRef.setStrokeStyle(1, 0xff0000);
    this.remoteRef.setOrigin(0.5, 0.5);
  }

  /**
   * Call when networks events are triggered
   */
  handlePlayerUpdated(field: string, value: number | string, id: string) {
    if (id === this.myPlayer.playerId) {
      this.myPlayer.update(field, value);
      // console.log("handlePlayerUpdated", field, value);
    } else {
      // TODO : update other player (call internal setData)
    }
  }

  /**
   * Update the scene, call at every tick
   * Client-side re-renders at every 16.6ms (60fps).
   */
  update(time: number, delta: number): void {
    this.inputPayload.left = this.cursorKeys.left.isDown;
    this.inputPayload.right = this.cursorKeys.right.isDown;
    this.inputPayload.up = this.cursorKeys.up.isDown;
    this.inputPayload.down = this.cursorKeys.down.isDown;

    // Send input to the server at every tick
    this.network.updatePlayer(this.inputPayload);

    const serverX = this.myPlayer.getData(SpriteData.SERVER_X);
    const serverY = this.myPlayer.getData(SpriteData.SERVER_Y);
    // console.log("[scene update] server", serverX, serverY);

    // Update client objects à every tick
    // Interpolate all players entities (except the current player)
    const velocity = 2;

    if (this.inputPayload.left) {
      this.myPlayer.x -= velocity;
    } else if (this.inputPayload.right) {
      this.myPlayer.x += velocity;
    }

    if (this.inputPayload.up) {
      this.myPlayer.y -= velocity;
    } else if (this.inputPayload.down) {
      this.myPlayer.y += velocity;
    }

    // if (serverX) {
    //   this.myPlayer.updatePositionX(serverX);
    // }
    // if (serverY) {
    //   this.myPlayer.updatePositionY(serverY);
    // }

    // console.log("[SCENE GAME] update", time);
  }
}
