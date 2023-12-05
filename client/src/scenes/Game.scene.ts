import Phaser from "phaser";

// Services
import { Network } from "services/Network";
import ComponentService from "services/Component.service";

// Characters
import { createAnim, anims, Player } from "characters";

// Others
import { SCENES } from "./scene.config";
import CLIENT_CONFIG, { SERVER_DATA } from "client.config";

// Components
import {
  ClickOnMeComponent,
  DebugPlayer,
  UiBarComponent,
} from "components/phaser";

// Shared
import type { IPlayer } from "../../../shared/types";
import {
  GAME_SCENE_LAYERS,
  TiledLayer,
  TiledObjectType,
} from "../../../shared/map.config";
import { SHARED_CONFIG } from "../../../shared/shared.config";

export class GameScene extends Phaser.Scene {
  private network!: Network;
  private players = new Map<string, Player>();
  private myPlayer!: Player;
  private components!: ComponentService;

  sceneMap!: Phaser.Tilemaps.Tilemap;
  lastServerX: number = 0;
  lastServerY: number = 0;

  constructor() {
    super(SCENES.GAME);
  }

  init() {
    // Create components service
    this.components = new ComponentService();

    // Destroy all components of components services on scene shutdown
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.components.destroy();
      this.scene.stop(SCENES.UI);
    });

    // Update component after the scene loop
    this.events.on(Phaser.Scenes.Events.POST_UPDATE, this.lateUpdate, this);
  }

  /**
   * Call before scene creation
   */
  preload() {}

  displayMap() {
    // Create Tilemap
    this.sceneMap = this.make.tilemap({
      key: CLIENT_CONFIG.MAP.TILEMAP.NAME,
    });

    // Create Tilesets
    const CITY_JAP = this.sceneMap.addTilesetImage(
      CLIENT_CONFIG.MAP.TILESETS.CITY_JAP.NAME,
      CLIENT_CONFIG.MAP.TILESETS.CITY_JAP.NAME
    );
    const MODERN_CITY = this.sceneMap.addTilesetImage(
      CLIENT_CONFIG.MAP.TILESETS.MODERN_CITY.NAME,
      CLIENT_CONFIG.MAP.TILESETS.MODERN_CITY.NAME
    );
    const ARCADE = this.sceneMap.addTilesetImage(
      CLIENT_CONFIG.MAP.TILESETS.MODERN_CITY.NAME,
      CLIENT_CONFIG.MAP.TILESETS.MODERN_CITY.NAME
    );
    const INTERIOR_JAP = this.sceneMap.addTilesetImage(
      CLIENT_CONFIG.MAP.TILESETS.INTERIOR_JAP.NAME,
      CLIENT_CONFIG.MAP.TILESETS.INTERIOR_JAP.NAME
    );

    const TiledSets = [MODERN_CITY, CITY_JAP, ARCADE, INTERIOR_JAP];

    // Create layers
    GAME_SCENE_LAYERS.forEach((layer) => {
      const phaserLayer = this.sceneMap.createLayer(layer.name, TiledSets);

      const debugGraphics = this.add
        .graphics()
        .setAlpha(0.7)
        .setDepth(CLIENT_CONFIG.DEBUG_LAYER);

      if (layer?.depth && layer?.depth > 0) {
        phaserLayer.setDepth(this.players.size + layer.depth);
      }

      if (CLIENT_CONFIG.DEBUG) {
        // Debug collision UNDER GREEN
        if (layer.name === TiledLayer.COLLIDE_UNDER_PLAYER) {
          phaserLayer.setCollisionByProperty({ collide: true });
          phaserLayer.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(139, 233, 40, 255),
            faceColor: new Phaser.Display.Color(40, 39, 37, 255),
          });
        }

        // Debug collision ABOVE YELLOW
        if (layer.name === TiledLayer.COLLIDE_ABOVE_PLAYER) {
          phaserLayer.setCollisionByProperty({ collide: true });
          phaserLayer.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243, 234, 40, 255),
            faceColor: new Phaser.Display.Color(40, 39, 37, 255),
          });
        }
      }
    });

    // Analyse map objects
    this.sceneMap.findObject(TiledLayer.INFO, (object) => {
      if (object.type === TiledObjectType.START) {
        console.log("Start position ", object.type);
      }
    });

    // @ts-ignore (PhaserAnimatedTiles types not defined)
    // this.animatedTiles.init(this.sceneMap);
  }

  /**
   * Create and initialize the scene
   */
  create(data: { network: Network }) {
    // Fade in
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    this.displayMap();

    // UI
    this.scene.run(SCENES.UI);

    const { network } = data;

    console.log("Create Game scene", network.sessionId);

    if (!network) {
      throw new Error("Network instance is missing");
    } else {
      this.network = network;
    }

    // Create animations
    createAnim(anims.animOneAir, 10, this);
    createAnim(anims.animFluppy, 10, this);

    // Register network event listener
    this.registerNetworkListeners();
  }

  /**
   * Initialize scene network listeners
   */
  registerNetworkListeners() {
    this.network.onPlayerJoin(this.handleJoinPLayer, this);
    this.network.onPlayerUpdated(this.handleProcessServerUpdates, this);
    this.network.onPlayerLeft(this.handleLeftPlayer, this);
  }

  /**
   * Call when networks left events are triggered
   */
  handleLeftPlayer(sessionId: string) {
    console.log("player left room 1", sessionId);

    const player = this.players.get(sessionId);
    if (!player) return;
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

    this.components.addComponent(newPlayer, new UiBarComponent());
    this.components.addComponent(newPlayer, new ClickOnMeComponent());

    if (sessionId === this.network.sessionId) {
      this.myPlayer = newPlayer;

      if (CLIENT_CONFIG.DEBUG) {
        this.components.addComponent(
          this.myPlayer,
          new DebugPlayer(this.scene.get(SCENES.UI))
        );
      }
    } else {
      console.log("[scene] NEW PLAYER");
      this.players.set(sessionId, newPlayer);
    }

    // Set my player on top of others
    this?.myPlayer?.setDepth(this.players.size);
  }

  /**
   * Call when networks update events are triggered
   */
  handleProcessServerUpdates(
    field: string,
    value: number | string,
    id: string
  ) {
    if (id === this.network.sessionId && !!this.myPlayer) {
      this.myPlayer.update(field, value);
    } else {
      const player = this.players.get(id);

      if (!player) return;

      player.update(field, value);
    }
  }

  /**
   * Update my player
   */
  updateMyPlayers() {
    const serverX = this.myPlayer?.getData(SERVER_DATA.X);
    const serverY = this.myPlayer?.getData(SERVER_DATA.Y);
    const serverAnim = this.myPlayer?.getData(SERVER_DATA.ANIM);
    const serverLife = this.myPlayer?.getData(SERVER_DATA.LIFE);
    const serverIsCollided = this.myPlayer?.getData(SERVER_DATA.IS_COLLIDED);

    this.lastServerX = serverX;
    this.lastServerY = serverY;

    if (serverX) {
      this.myPlayer.lerpPositionX(serverX);
    }
    if (serverY) {
      this.myPlayer.lerpPositionY(serverY);
    }
    if (serverAnim) {
      this.myPlayer.updateAnim(serverAnim);
    }
    if (serverLife >= 0) {
      this.myPlayer.updateLife(serverLife);
    }
    if (serverIsCollided) {
      this.myPlayer.updateIsCollided(serverLife);
    }
  }

  /**
   * Update other players using LERP
   */
  updateOtherPlayers() {
    this.players.forEach((player) => {
      const serverX = player?.getData(SERVER_DATA.X);
      const serverY = player?.getData(SERVER_DATA.Y);
      const serverAnim = player?.getData(SERVER_DATA.ANIM);
      const serverLife = player?.getData(SERVER_DATA.LIFE);

      if (serverX) {
        player.lerpPositionX(serverX);
      }
      if (serverY) {
        player.lerpPositionY(serverY);
      }
      if (serverAnim) {
        player.updateAnim(serverAnim);
      }
      if (serverLife >= 0) {
        player.updateLife(serverLife);
      }
    });
  }

  setupCamera() {
    const camera = this.cameras.main;

    camera.setBounds(
      0,
      0,
      SHARED_CONFIG.CAMERA_MAX_WIDTH,
      SHARED_CONFIG.CAMERA_MAX_HEIGHT
    );
    camera.startFollow(this.myPlayer, true);
    this.cameras.main.setZoom(2);
  }

  /**
   * Update the scene, call at every tick
   * Client-side re-renders at every 16.6ms (60fps).
   * Credits: https://learn.colyseus.io/phaser/2-linear-interpolation
   */
  update(_time: number, delta: number) {
    if (!this.myPlayer) return;

    // CAMERA
    this.setupCamera();

    // INPUTS
    const inputs = this.myPlayer.handleInput();

    // SEND INPUT TO BACKEND
    this.network.updatePlayer(inputs);

    // LERP MY PLAYER
    this.updateOtherPlayers();

    // LERP OTHER PLAYERS
    this.updateMyPlayers();
  }

  /**
   * Update components after Game loop update
   */
  lateUpdate(_time: number, delta: number) {
    // Update components
    this.components.update(delta);
  }
}
