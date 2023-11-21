import Phaser from 'phaser';

// Network
import { Network } from 'services/Network';

// Characters
import { createCharacterAnims, onairAnimsConfig, Player } from 'characters';

// Others
import { SCENES } from './scene.config';
import gameConfig, { SpriteData } from 'game.config';
import { sharedConfig } from '../../../shared/config';

// Shared
import { type InputPayload, type IPlayer, Anim } from '../../../shared/types';
import { getIddleAnim } from '../../../shared/helpers';

export class GameScene extends Phaser.Scene {
  private network!: Network;
  private players = new Map<string, Player>();
  private myPlayer!: Player;
  private cursorKeys!: Phaser.Types.Input.Keyboard.CursorKeys;
  private lastAnim: Anim = Anim.IDDLE_DOWN;

  private lastServerX: number = 0;
  private lastServerY: number = 0;

  remoteRef: Phaser.GameObjects.Rectangle | null = null;

  debugFPS: Phaser.GameObjects.Text | null = null;
  debugPlayer: Phaser.GameObjects.Text | null = null;

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
    this.debugFPS = this.add
      .text(190, 0, '', {
        fontSize: '10px',
        padding: { x: 5, y: 5 },
        backgroundColor: '#000000',
        color: '#ffffff',
      })
      .setResolution(10);

    const { network } = data;

    console.log('Create Game scene', network.sessionId);

    if (!network) {
      throw new Error('Network instance is missing');
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
    this.network.onPlayerUpdated(this.processServerUpdates, this);
    this.network.onRemoteRefUpdated(this.handleUpdateRemoteRef, this);
    this.network.onPlayerLeft(this.handleLeftPlayer, this);
  }

  /**
   * Call when networks left events are triggered
   */
  handleLeftPlayer(sessionId: string) {
    console.log('player left room 1', sessionId);

    const player = this.players.get(sessionId);
    if (!player) return;
    // TODO: check why the ref is not destroy
    player.destroy();
  }

  /**
   * Call when networks join events are triggered
   */
  handleJoinPLayer(player: IPlayer, sessionId: string) {
    console.log('[scene] join ', this.network.sessionId, sessionId);

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
      console.log('[scene] NEW PLAYER');
      this.players.set(sessionId, newPlayer);
    }
  }

  /**
   * Create physic world and add my player
   */
  createWorld(myPlayer: Player) {
    console.log('Create world ', myPlayer);

    // Setup physics parameters
    this.matter.world.setBounds(
      0,
      0,
      sharedConfig.WORLD_WIDTH,
      sharedConfig.WORLD_HEIGHT,
      1
    );

    this.matter.world.disableGravity();

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
    this?.remoteRef?.setStrokeStyle(1, 0xff0000);
    this?.remoteRef?.setOrigin(0.5, 0.5);
  }

  /**
   * Call when networks update ref events is triggered
   */
  handleUpdateRemoteRef(player: IPlayer) {
    if (this.remoteRef) {
      this.remoteRef.x = player.x;
      this.remoteRef.y = player.y;
    }
  }
  /**
   * Call when networks update events are triggered
   */
  processServerUpdates(field: string, value: number | string, id: string) {
    if (id === this.network.sessionId && !!this.myPlayer) {
      // Reconcile
      if (field === 'x' && this.remoteRef) {
        this.remoteRef.x = Number(value);
        this.lastServerX = Number(value);
      }
      if (field === 'y' && this.remoteRef) {
        this.remoteRef.y = Number(value);
        this.lastServerY = Number(value);
      }

      if (field !== 'tick') {
        console.log('field', field, value);
        console.log('me ', this.myPlayer.x);
      }
    } else {
      const player = this.players.get(id);

      if (!player) return;
      if (field !== 'tick') {
        console.log('other ', field, value);
      }

      player.update(field, value);
    }
    this.debugPlayer = this.add
      .text(
        0,
        0,
        `
ServerX ${this.lastServerX.toFixed(2)}, ClientX ${this.myPlayer.x.toFixed(2)}
ServerY ${this.lastServerY.toFixed(2)} ClientY ${this.myPlayer.y.toFixed(2)}
          `,
        {
          // fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
          fontSize: '10px',
          padding: { x: 5, y: 5 },
          backgroundColor: '#000000',
          color: '#ffffff',
        }
      )
      .setResolution(10);
  }

  /**
   * Update other players using LERP
   */
  updateOtherPlayers() {
    // const serverX = this.myPlayer?.getData(SpriteData.SERVER_X);
    // const serverY = this.myPlayer?.getData(SpriteData.SERVER_Y);
    // const serverAnim = this.myPlayer?.getData(SpriteData.SERVER_ANIM);

    // if (serverX) {
    //   this.myPlayer.lerpPositionX(serverX);
    // }
    // if (serverY) {
    //   this.myPlayer.lerpPositionY(serverY);
    // }
    // if (serverAnim) {
    //   this.myPlayer.updateAnim(serverAnim);
    // }

    this.players.forEach((player) => {
      const serverX = player?.getData(SpriteData.SERVER_X);
      const serverY = player?.getData(SpriteData.SERVER_Y);
      const serverAnim = player?.getData(SpriteData.SERVER_ANIM);

      if (serverX) {
        // player.x = serverX;
        player.lerpPositionX(serverX);
      }
      if (serverY) {
        // player.y = serverY;
        player.lerpPositionY(serverY);
      }
      if (serverAnim) {
        player.updateAnim(serverAnim);
      }
    });
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
      this.debugFPS.text = `Frame rate: ${this.game.loop.actualFps.toFixed(2)}`;
    }
  }

  fixedTick(_time: number, delta: number) {
    this.currentTick++;

    if (!this.myPlayer) return;

    this.inputPayload.left = this.cursorKeys.left.isDown;
    this.inputPayload.right = this.cursorKeys.right.isDown;
    this.inputPayload.up = this.cursorKeys.up.isDown;
    this.inputPayload.down = this.cursorKeys.down.isDown;
    this.inputPayload.tick = this.currentTick;

    // Send input to the server at every tick
    this.network.updatePlayer(this.inputPayload);

    // Apply prediction
    this.myPlayer.processAction(this.inputPayload, delta);

    // Check for the iddle anim
    const iddleAnim = getIddleAnim(this.inputPayload, this.myPlayer.lastAnim);

    if (iddleAnim) {
      this?.myPlayer.updateAnim(iddleAnim);
    }

    // LERP other players
    this.updateOtherPlayers();

    // if (this.inputPayload.left) {
    //   this.myPlayer.x -= PLAYER_VELOCITY * delta;
    //   this.myPlayer.updateAnim(Anim.LEFT);
    // } else if (this.inputPayload.right) {
    //   this.myPlayer.x += PLAYER_VELOCITY * delta;
    //   this.myPlayer.updateAnim(Anim.RIGHT);
    // }

    // if (this.inputPayload.up) {
    //   this.myPlayer.y -= PLAYER_VELOCITY * delta;
    //   this.myPlayer.updateAnim(Anim.UP);
    // } else if (this.inputPayload.down) {
    //   this.myPlayer.y += PLAYER_VELOCITY * delta;
    //   this.myPlayer.updateAnim(Anim.DOWN);
    // }
  }
}
