import Phaser from "phaser";

// Services
import { Network } from "services/Network";
import ComponentService from "services/Component.service";

// Characters
import { createAnim, anims, Player, Enemy } from "characters";

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
import type { IPlayer, IEnemy } from "../../../shared/types";
import { Anim } from "../../../shared/types";
import {
  GAME_SCENE_LAYERS,
  TiledLayer,
  TiledObjectType,
} from "../../../shared/map.config";
import { SHARED_CONFIG, COMBAT_CONFIG, ENEMY_CONFIG } from "../../../shared/shared.config";

export class GameScene extends Phaser.Scene {
  private network!: Network;
  private players = new Map<string, Player>();
  private myPlayer!: Player;
  private components!: ComponentService;
  private enemyDebugGraphics!: Phaser.GameObjects.Graphics;
  private enemies = new Map<string, Enemy>();

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
      key: CLIENT_CONFIG.MAP.TILE_MAP.NAME,
    });

    // Create Tilesets
    const LOGOS = this.sceneMap.addTilesetImage(
      CLIENT_CONFIG.MAP.TILE_SETS.LOGOS.NAME,
      CLIENT_CONFIG.MAP.TILE_SETS.LOGOS.NAME
    );
    const MODERN_CITY = this.sceneMap.addTilesetImage(
      CLIENT_CONFIG.MAP.TILE_SETS.MODERN_CITY.NAME,
      CLIENT_CONFIG.MAP.TILE_SETS.MODERN_CITY.NAME
    );
    const CITY_JAP = this.sceneMap.addTilesetImage(
      CLIENT_CONFIG.MAP.TILE_SETS.CITY_JAP.NAME,
      CLIENT_CONFIG.MAP.TILE_SETS.CITY_JAP.NAME
    );
    const INTERIOR_JAP = this.sceneMap.addTilesetImage(
      CLIENT_CONFIG.MAP.TILE_SETS.INTERIOR_JAP.NAME,
      CLIENT_CONFIG.MAP.TILE_SETS.INTERIOR_JAP.NAME
    );
    const RURAL_JAP = this.sceneMap.addTilesetImage(
      CLIENT_CONFIG.MAP.TILE_SETS.RURAL_JAP.NAME,
      CLIENT_CONFIG.MAP.TILE_SETS.RURAL_JAP.NAME
    );
    const ARCADE = this.sceneMap.addTilesetImage(
      CLIENT_CONFIG.MAP.TILE_SETS.MODERN_CITY.NAME,
      CLIENT_CONFIG.MAP.TILE_SETS.MODERN_CITY.NAME
    );
    const OSAKA = this.sceneMap.addTilesetImage(
      CLIENT_CONFIG.MAP.TILE_SETS.RURAL_JAP.NAME,
      CLIENT_CONFIG.MAP.TILE_SETS.RURAL_JAP.NAME
    );
    const TEST = this.sceneMap.addTilesetImage(
      CLIENT_CONFIG.MAP.TILE_SETS.TEST.NAME,
      CLIENT_CONFIG.MAP.TILE_SETS.TEST.NAME
    );

    const tileSets = [
      LOGOS,
      MODERN_CITY,
      CITY_JAP,
      INTERIOR_JAP,
      RURAL_JAP,
      ARCADE,
      OSAKA,
      TEST,
    ];

    // Create layers
    GAME_SCENE_LAYERS.forEach((layer) => {
      const phaserLayer = this.sceneMap.createLayer(
        layer.name,
        tileSets as Phaser.Tilemaps.Tileset[]
      );

      const debugGraphics = this.add
        .graphics()
        .setAlpha(0.7)
        .setDepth(CLIENT_CONFIG.DEBUG_LAYER);

      if (layer?.depth && layer?.depth > 0) {
        phaserLayer!.setDepth(this.players.size + layer.depth);
      }

      if (CLIENT_CONFIG.DEBUG) {
        // Debug collision UNDER GREEN
        if (layer.name === TiledLayer.COLLIDE_UNDER_PLAYER) {
          phaserLayer!.setCollisionByProperty({ collide: true });
          phaserLayer!.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(139, 233, 40, 255),
            faceColor: new Phaser.Display.Color(40, 39, 37, 255),
          });
        }

        // Debug collision ABOVE YELLOW
        if (layer.name === TiledLayer.COLLIDE_ABOVE_PLAYER) {
          phaserLayer!.setCollisionByProperty({ collide: true });
          phaserLayer!.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243, 234, 40, 255),
            faceColor: new Phaser.Display.Color(40, 39, 37, 255),
          });
        }
      }
    });

    // Analyse map objects
    // @ts-ignore
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
    createAnim(anims.animOneAir, 10, this, CLIENT_CONFIG.CHARACTERS.NAME);
    createAnim(anims.animFluppy, 10, this, CLIENT_CONFIG.CHARACTERS.NAME);
    createAnim(anims.animSlime, 10, this, CLIENT_CONFIG.CHARACTERS.SLIME.NAME);

    // Debug graphics for enemies
    this.enemyDebugGraphics = this.add.graphics().setDepth(CLIENT_CONFIG.DEBUG_LAYER);

    // Register network event listener
    this.registerNetworkListeners();

    // Sync enemies already in state (spawned before scene was ready)
    this.network.getEnemies()?.forEach((enemy: IEnemy, id: string) => {
      this.handleEnemyJoin(enemy, id);
    });
  }

  /**
   * Initialize scene network listeners
   */
  registerNetworkListeners() {
    this.network.onPlayerJoin(this.handleJoinPLayer, this);
    this.network.onPlayerUpdated(this.handleProcessServerUpdates, this);
    this.network.onPlayerLeft(this.handleLeftPlayer, this);
    this.network.onEnemyJoin(this.handleEnemyJoin, this);
    this.network.onEnemyUpdated(this.handleEnemyUpdated, this);
    this.network.onEnemyLeft(this.handleEnemyLeft, this);
  }

  handleEnemyJoin(enemy: IEnemy, id: string) {
    console.log(`[Scene] enemy joined id=${id} x=${enemy.x} y=${enemy.y}`);

    const newEnemy = new Enemy(this, enemy.x, enemy.y, enemy.texture, id);
    this.enemies.set(id, newEnemy);
  }

  handleEnemyUpdated(field: string, value: number | string, id: string) {
    const enemy = this.enemies.get(id);
    if (!enemy) return;
    enemy.update(field, value);
  }

  handleEnemyLeft(id: string) {
    console.log(`[Scene] enemy left id=${id}`);
    const enemy = this.enemies.get(id);
    if (enemy) enemy.destroy();
    this.enemies.delete(id);
  }

  private updateEnemies() {
    this.enemies.forEach((enemy) => {
      const serverX = enemy.getData(SERVER_DATA.X);
      const serverY = enemy.getData(SERVER_DATA.Y);
      const serverAnim = enemy.getData(SERVER_DATA.ANIM);

      if (serverX) enemy.lerpPositionX(serverX);
      if (serverY) enemy.lerpPositionY(serverY);
      if (serverAnim) enemy.updateAnim(serverAnim);
    });
  }

  private drawEnemyDebug() {
    this.enemyDebugGraphics.clear();

    const hs = COMBAT_CONFIG.HURT_BOX_SIZE / 2;
    const hbs = COMBAT_CONFIG.HIT_BOX_SIZE / 2;
    const offset = COMBAT_CONFIG.HIT_BOX_OFFSET;

    this.enemies.forEach((enemy) => {
      // Hurtbox — blue, centered on body
      this.enemyDebugGraphics.lineStyle(1, 0x4444ff, 1);
      this.enemyDebugGraphics.strokeRect(
        enemy.x - hs, enemy.y - hs,
        COMBAT_CONFIG.HURT_BOX_SIZE, COMBAT_CONFIG.HURT_BOX_SIZE
      );

      // Aggro radius — yellow circle
      this.enemyDebugGraphics.lineStyle(1, 0xffee00, 0.4);
      this.enemyDebugGraphics.strokeCircle(enemy.x, enemy.y, ENEMY_CONFIG.AGGRO_RADIUS);

      // Attack range — orange circle
      this.enemyDebugGraphics.lineStyle(1, 0xff8800, 0.8);
      this.enemyDebugGraphics.strokeCircle(enemy.x, enemy.y, ENEMY_CONFIG.ATTACK_RANGE);

      // Attack hitbox — red, visible only when attacking
      const currentAnim = enemy.getData(SERVER_DATA.ANIM) as string;
      const isAttacking =
        currentAnim === Anim.ATTACK_UP || currentAnim === Anim.ATTACK_DOWN ||
        currentAnim === Anim.ATTACK_LEFT || currentAnim === Anim.ATTACK_RIGHT;

      if (isAttacking) {
        let hx = enemy.x;
        let hy = enemy.y;
        if (currentAnim === Anim.ATTACK_UP)    hy -= offset;
        if (currentAnim === Anim.ATTACK_DOWN)  hy += offset;
        if (currentAnim === Anim.ATTACK_LEFT)  hx -= offset;
        if (currentAnim === Anim.ATTACK_RIGHT) hx += offset;

        this.enemyDebugGraphics.lineStyle(2, 0xff2222, 1);
        this.enemyDebugGraphics.strokeRect(
          hx - hbs, hy - hbs,
          COMBAT_CONFIG.HIT_BOX_SIZE, COMBAT_CONFIG.HIT_BOX_SIZE
        );
      }
    });

    // Player hitbox — red, only visible when attacking
    if (this.myPlayer && this.myPlayer.getData(SERVER_DATA.IS_ATTACKING)) {
      const offset = COMBAT_CONFIG.HIT_BOX_OFFSET;
      const hbs = COMBAT_CONFIG.HIT_BOX_SIZE / 2;
      let hx = this.myPlayer.x;
      let hy = this.myPlayer.y;

      switch (this.myPlayer.lastAnim) {
        case Anim.UP: case Anim.IDDLE_UP: case Anim.ATTACK_UP:
          hy -= offset; break;
        case Anim.DOWN: case Anim.IDDLE_DOWN: case Anim.ATTACK_DOWN:
          hy += offset; break;
        case Anim.LEFT: case Anim.IDDLE_LEFT: case Anim.ATTACK_LEFT:
          hx -= offset; break;
        case Anim.RIGHT: case Anim.IDDLE_RIGHT: case Anim.ATTACK_RIGHT:
          hx += offset; break;
      }

      this.enemyDebugGraphics.lineStyle(1, 0xff2222, 1);
      this.enemyDebugGraphics.strokeRect(
        hx - hbs, hy - hbs,
        COMBAT_CONFIG.HIT_BOX_SIZE, COMBAT_CONFIG.HIT_BOX_SIZE
      );
    }
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
  update(_time: number, _delta: number) {
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

    // UPDATE ENEMIES
    this.updateEnemies();

    // DEBUG: draw enemy bounding boxes
    if (CLIENT_CONFIG.DEBUG) {
      this.drawEnemyDebug();
    }
  }

  /**
   * Update components after Game loop update
   */
  lateUpdate(_time: number, delta: number) {
    // Update components
    this.components.update(delta);
  }
}
