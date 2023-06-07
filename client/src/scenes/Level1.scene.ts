import Phaser from "phaser";

// Network
import { Network } from "services/Network";

// Characters
import { createCharacterAnims, onairAnimsConfig, Player } from "characters";

// Others
import { SCENES } from "./scene.config";
import type { InputPayload } from "../../../shared/types";
import { SpriteData } from "game.config";

export class SceneLevel1 extends Phaser.Scene {
  network!: Network;
  myPlayer!: Player;
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
    this.cursorKeys = this.input.keyboard.createCursorKeys();
    createCharacterAnims(onairAnimsConfig, 10, this.anims);
  }

  create(data: { network: Network }) {
    console.log("Create Game scene", data);

    if (!data.network) {
      throw new Error("Network instance is missing");
    } else {
      this.network = data.network;
    }

    // Create Oneair animation
    console.log("ADD");

    this.myPlayer = new Player(this, 0, 0, "oneair", this.network.sessionId);

    this.cameras.main.setZoom(1.8);
    this.cameras.main.startFollow(this.myPlayer, true);

    // Register network event listener
    this.network.onPlayerUpdated(this.handlePlayerUpdated, this);
  }

  handlePlayerUpdated(field: string, value: number | string, id: string) {
    this.myPlayer.update(field, value);
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

    this.network.updatePlayer(this.inputPayload);

    const serverX = this.myPlayer.getData(SpriteData.SERVER_X);
    const serverY = this.myPlayer.getData(SpriteData.SERVER_Y);

    if (serverX) {
      this.myPlayer.updatePositionX(serverX);
    }
    if (serverY) {
      this.myPlayer.updatePositionY(serverY);
    }

    // console.log("[SCENE GAME] update", time);
  }
}
