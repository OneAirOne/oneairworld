import Phaser from "phaser";

// Network
import { Network } from "services/Network";

// Characters
import { createCharacterAnims, onairAnimsConfig, Player } from "characters";

// Others
import { SCENES } from "./scene.config";
import gameConfig, { SpriteData } from "game.config";
import { sharedConfig } from "../../../shared/config";

// Shared
import {
  PLAYER_VELOCITY,
  type InputPayload,
  type IPlayer,
} from "../../../shared/types";

export class SceneLevel1 extends Phaser.Scene {
  network!: Network;
  remoteRef: Phaser.GameObjects.Rectangle | null = null;
  private players = new Map<string, Player>();
  myPlayer!: Player;
  private cursorKeys!: Phaser.Types.Input.Keyboard.CursorKeys;

  // local input
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

  /**
   * Call before scene creation
   */
  preload() {
    // Set up keyboard
    this.cursorKeys = this.input.keyboard.createCursorKeys();
  }

  /**
   * Create and initialize the scene
   */
  create(data: { network: Network }) {
    const { network } = data;

    console.log("Create Game scene", network.sessionId);

    if (!network) {
      throw new Error("Network instance is missing");
    } else {
      this.network = network;
    }

    // Create Oneair animation
    createCharacterAnims(onairAnimsConfig, 10, this.anims);

    // Register network event listener
    this.registerNetworkListeners();
  }

  /**
   * Initialize scene network listeners
   */
  registerNetworkListeners() {
    this.network.onPlayerJoin(this.handleJoinPLayer, this);
    this.network.onPlayerUpdated(this.handlePlayerUpdated, this);
    this.network.onPlayerLeft(this.handleLeftPlayer, this);
  }

  /**
   * Call when networks left events are triggered
   */
  handleLeftPlayer(sessionId: string) {
    console.log("player left room 1", sessionId);

    const player = this.players.get(sessionId);
    if (!player) return;
    // TODO: check why the ref is not destroy
    player.destroy();
  }

  /**
   * Call when networks join events are triggered
   */
  handleJoinPLayer(player: IPlayer, sessionId: string) {
    const newPlayer = new Player(
      this,
      player.x,
      player.y,
      player.texture,
      sessionId
    );
    console.log("[scene] join ", this.network.sessionId, sessionId);

    if (sessionId === this.network.sessionId) {
      this.createWorld(newPlayer);
    } else {
      console.log("[scene] NEW PLAYER");
      this.players.set(sessionId, newPlayer);
    }
  }

  /**
   * Create physic world and add my player
   */
  createWorld(myPlayer: Player) {
    // Setup physics parameters
    this.matter.world.setBounds(
      0,
      0,
      sharedConfig.WORLD_WIDTH,
      sharedConfig.WORLD_HEIGHT,
      20
    );

    // Register player
    this.myPlayer = myPlayer;

    // Setup camera
    this.cameras.main.setZoom(2);
    this.cameras.main.startFollow(this.myPlayer, true);

    // Add remote ref to visualize server position
    this.remoteRef = this.add.rectangle(
      sharedConfig.WORLD_WIDTH / 2,
      sharedConfig.WORLD_HEIGHT / 2,
      sharedConfig.SPRITE_SIZE,
      sharedConfig.SPRITE_SIZE
    );
    this.remoteRef.setStrokeStyle(1, 0xff0000);
    this.remoteRef.setOrigin(0.5, 0.5);
  }

  /**
   * Call when networks update events are triggered
   */
  handlePlayerUpdated(field: string, value: number | string, id: string) {
    console.log("[scene] update", id);

    if (id === this.network.sessionId && !!this.myPlayer) {
      console.log(field);

      this.myPlayer.update(field, value);
    } else {
      const player = this.players.get(id);
      console.log("Update other player ", field, value);

      if (!player) return;
      player.update(field, value);
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

    // Predict my player
    if (this.inputPayload.left) {
      this.myPlayer?.update("left", PLAYER_VELOCITY);
    }
    if (this.inputPayload.right) {
      this.myPlayer?.update("right", PLAYER_VELOCITY);
    }
    if (this.inputPayload.up) {
      this.myPlayer?.update("up", PLAYER_VELOCITY);
    }
    if (this.inputPayload.down) {
      this.myPlayer?.update("down", PLAYER_VELOCITY);
    }

    // LERP other players
    this.players.forEach((player) => {
      const serverX = player?.getData(SpriteData.SERVER_X);
      const serverY = player?.getData(SpriteData.SERVER_Y);
      if (serverX) {
        player.updatePositionX(serverX);
      }
      if (serverY) {
        player.updatePositionY(serverY);
      }
    });
  }
}
