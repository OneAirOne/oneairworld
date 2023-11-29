import Phaser from "phaser";

// Services
import { Network } from "services/Network";
import ComponentService from "services/Component.service";

// Characters
import { createAnim, onairAnimsConfig, Player } from "characters";

// Others
import { SCENES } from "./scene.config";
import GAME_CONFIG, { SERVER_DATA } from "client.config";

// Components
import { ClickOnMeComponent, UiBarComponent } from "components/phaser";

// Shared
import type { IPlayer } from "../../../shared/types";
import { TiledLayer, TiledObjectType } from "../../../shared/map.config";

export class GameScene extends Phaser.Scene {
  private network!: Network;
  private players = new Map<string, Player>();
  private myPlayer!: Player;
  private components!: ComponentService;

  private lastServerX: number = 0;
  private lastServerY: number = 0;

  debugFPS: Phaser.GameObjects.Text | null = null;
  debugPlayer: Phaser.GameObjects.Text | null = null;
  sceneMap!: Phaser.Tilemaps.Tilemap;
  rooms: Phaser.GameObjects.GameObject[] = [];

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
    this.sceneMap = this.make.tilemap({
      key: GAME_CONFIG.MAP.TILEMAP.NAME,
    });
    console.log("tilemap", this.sceneMap);

    const CITY_JAP = this.sceneMap.addTilesetImage(
      GAME_CONFIG.MAP.TILESETS.CITY_JAP.NAME,
      GAME_CONFIG.MAP.TILESETS.CITY_JAP.NAME
    );
    const MODERN_CITY = this.sceneMap.addTilesetImage(
      GAME_CONFIG.MAP.TILESETS.MODERN_CITY.NAME,
      GAME_CONFIG.MAP.TILESETS.MODERN_CITY.NAME
    );

    // Create all map layers
    this.sceneMap.createLayer(TiledLayer.GROUND, CITY_JAP);
    this.sceneMap.createLayer(TiledLayer.WALL, CITY_JAP);
    this.sceneMap.createLayer(TiledLayer.STUFF, CITY_JAP);
    this.sceneMap
      .createLayer(TiledLayer.ABOVE_PLAYER, MODERN_CITY)
      .setDepth(50);

    // Analyse map objects
    this.sceneMap.findObject(TiledLayer.OBJECTS, (object) => {
      if (object.type === TiledObjectType.ROOM) {
        this.rooms.push(object);
      }
    });

    // @ts-ignore (PhaserAnimatedTiles types not defined)
    // this.animatedTiles.init(this.sceneMap);
  }

  /**
   * Create and initialize the scene
   */
  create(data: { network: Network }) {
    this.displayMap();

    // Debug
    this.debugFPS = this.add
      .text(190, 0, "", {
        fontSize: "9px",
        padding: { x: 5, y: 5 },
        backgroundColor: "#000000",
        color: "#ffffff",
      })
      .setResolution(12);

    this.debugPlayer = this.add
      .text(0, 0, "", {
        fontSize: "9px",
        padding: { x: 5, y: 5 },
        backgroundColor: "#000000",
        color: "#ffffff",
      })
      .setResolution(12);

    // UI
    this.scene.run(SCENES.UI);

    const { network } = data;

    console.log("Create Game scene", network.sessionId);

    if (!network) {
      throw new Error("Network instance is missing");
    } else {
      this.network = network;
    }

    // Create Oneair animation
    createAnim(onairAnimsConfig, 10, this);

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

      // Setup camera
      this.cameras.main.setZoom(2);
      this.cameras.main.startFollow(this.myPlayer, true);
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
    if (this.debugPlayer) {
      this.debugPlayer.text = `
ServerX ${this.lastServerX.toFixed(2)}, ClientX ${this.myPlayer.x.toFixed(2)}
ServerY ${this.lastServerY.toFixed(2)} ClientY ${this.myPlayer.y.toFixed(2)}
Player ID : ${this.myPlayer.id}
`;
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

  /**
   * Update the scene, call at every tick
   * Client-side re-renders at every 16.6ms (60fps).
   * Credits: https://learn.colyseus.io/phaser/2-linear-interpolation
   */
  update(_time: number, delta: number) {
    if (!this.myPlayer) return;

    if (this.debugFPS) {
      this.debugFPS.text = `Frame rate: ${this.game.loop.actualFps.toFixed(2)}`;
    }

    const inputs = this.myPlayer.handleInput();

    // Send input to the server at every tick
    this.network.updatePlayer(inputs);

    // LERP  players
    this.updateOtherPlayers();
    this.updateMyPlayers();
  }

  lateUpdate(_time: number, delta: number) {
    // Update components
    this.components.update(delta);
  }
}
