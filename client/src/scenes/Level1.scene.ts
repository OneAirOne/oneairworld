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
  Anim,
} from "../../../shared/types";
import { getIddleAnim } from "../../../shared/helpers";

export class SceneLevel1 extends Phaser.Scene {
  private network!: Network;
  private players = new Map<string, Player>();
  private myPlayer!: Player;
  private cursorKeys!: Phaser.Types.Input.Keyboard.CursorKeys;
  private lastAnim: Anim = Anim.IDDLE_DOWN;

  remoteRef: Phaser.GameObjects.Rectangle | null = null;

  debugFPS: Phaser.GameObjects.Text | null = null;

  // local input
  inputPayload: InputPayload = {
    left: false,
    right: false,
    up: false,
    down: false,
    tick: undefined,
  };

  currentTick: number = 0;

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
    this.debugFPS = this.add.text(4, 4, "", { color: "#ff0000" });

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
    console.log("[scene] join ", this.network.sessionId, sessionId);

    const newPlayer = new Player(
      this,
      player.x,
      player.y,
      player.texture,
      sessionId
    );

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
    console.log("Create world ", myPlayer);

    // Setup physics parameters
    this.matter.world.setBounds(
      0,
      0,
      sharedConfig.WORLD_WIDTH,
      sharedConfig.WORLD_HEIGHT,
      1
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
    // this.remoteRef.setStrokeStyle(1, 0xff0000);
    this.remoteRef.setOrigin(0.5, 0.5);
  }

  /**
   * Call when networks update events are triggered
   */
  handlePlayerUpdated(field: string, value: number | string, id: string) {
    if (id === this.network.sessionId && !!this.myPlayer) {
      this.myPlayer.update(field, value);
    } else {
      const player = this.players.get(id);

      if (!player) return;

      player.update(field, value);
    }
  }

  debug() {
    this.players.forEach((player) => {
      console.log("---------------------");
      console.log(`[${player.playerId}] x:${player.x} y:${player.y}`);
    });
    console.log("---------------------");
    console.log(
      `[my player ${this.myPlayer.playerId}] x:${this.myPlayer.x} y:${this.myPlayer.y}`
    );
  }

  /**
   * Update the scene, call at every tick
   * Client-side re-renders at every 16.6ms (60fps).
   * Credits: https://learn.colyseus.io/phaser/2-linear-interpolation
   */

  elapsedTime = 0;
  fixedTimeStep = 1000 / 60;
  update(time: number, delta: number): void {
    if (!this.myPlayer) return;

    this.elapsedTime += delta;

    while (this.elapsedTime >= this.fixedTimeStep) {
      this.elapsedTime -= this.fixedTimeStep;
      this.fixedTick(time, this.fixedTimeStep);
    }

    if (this.debugFPS) {
      this.debugFPS.text = `Frame rate: ${this.game.loop.actualFps}`;
    }
  }

  fixedTick(_time: number, _delta: number) {
    this.currentTick++;
    this.debug();

    this.inputPayload.left = this.cursorKeys.left.isDown;
    this.inputPayload.right = this.cursorKeys.right.isDown;
    this.inputPayload.up = this.cursorKeys.up.isDown;
    this.inputPayload.down = this.cursorKeys.down.isDown;
    this.inputPayload.tick = this.currentTick;

    // Send input to the server at every tick
    this.network.updatePlayer(this.inputPayload);

    // TODO : share with server
    // Predict my player
    if (this.inputPayload.left) {
      this.myPlayer?.update(Anim.LEFT, PLAYER_VELOCITY);
    }
    if (this.inputPayload.right) {
      this.myPlayer?.update(Anim.RIGHT, PLAYER_VELOCITY);
    }
    if (this.inputPayload.up) {
      this.myPlayer?.update(Anim.UP, PLAYER_VELOCITY);
    }
    if (this.inputPayload.down) {
      this.myPlayer?.update(Anim.DOWN, PLAYER_VELOCITY);
    }

    // Check for the iddle anim
    const iddleAnim = getIddleAnim(this.inputPayload, this.myPlayer.lastAnim);

    if (iddleAnim) {
      this?.myPlayer.updateAnim(iddleAnim);
    }

    // LERP other players
    this.players.forEach((player) => {
      const serverX = player?.getData(SpriteData.SERVER_X);
      const serverY = player?.getData(SpriteData.SERVER_Y);
      const serverAnim = player?.getData(SpriteData.SERVER_ANIM);

      if (serverX) {
        player.updatePositionX(serverX);
      }
      if (serverY) {
        player.updatePositionY(serverY);
      }
      if (serverAnim) {
        player.updateAnim(serverAnim);
      }
    });
  }
}
