import Phaser from "phaser";

// Services
import { Network } from "services/Network";
import ComponentService from "services/Component.service";

// Characters
import { createAnim, anims, Player, Enemy } from "characters";

// Others
import { SCENES } from "./scene.config";
import { createSpeakingBubble } from "./game.helpers";
import CLIENT_CONFIG, { SERVER_DATA } from "client.config";

// Components
import {
  ClickOnMeComponent,
  DebugPlayer,
  UiBarComponent,
} from "components/phaser";

// Dialogue
import { DialogueManager } from "../dialogue/DialogueManager";
import { phaserEvents, PhaserEvent } from "../events/eventManager";

// Shared
import type { IPlayer, IEnemy } from "../../../shared/types";
import { Anim } from "../../../shared/types";
import {
  GAME_SCENE_LAYERS,
  TiledLayer,
  TiledObjectType,
} from "../../../shared/map.config";
import { SHARED_CONFIG, COMBAT_CONFIG, ENEMY_CONFIG } from "../../../shared/shared.config";

const ROBOT_INTERACTION_RADIUS = 50;

export class GameScene extends Phaser.Scene {
  private network!: Network;
  private players = new Map<string, Player>();
  private myPlayer!: Player;
  private components!: ComponentService;
  private enemyDebugGraphics!: Phaser.GameObjects.Graphics;
  private enemies = new Map<string, Enemy>();
  private robotSprite: Phaser.GameObjects.Sprite | null = null;
  private robotBubble: Phaser.GameObjects.Text | null = null;
  private dialogueManager = new DialogueManager();

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

    // Wizard idle animation (looping)
    const wizardAnim = anims.animWizard.IDLE;
    this.anims.create({
      key: wizardAnim.key,
      frames: this.anims.generateFrameNames(CLIENT_CONFIG.CHARACTERS.WIZARD.NAME, {
        start: wizardAnim.start,
        end: wizardAnim.end,
        zeroPad: wizardAnim.zeroPad,
        prefix: wizardAnim.prefix,
        suffix: wizardAnim.suffix,
      }),
      frameRate: 6,
      repeat: -1,
    });

    // Dino idle animation (looping)
    const dinoAnim = anims.animDino.IDLE;
    this.anims.create({
      key: dinoAnim.key,
      frames: this.anims.generateFrameNames(CLIENT_CONFIG.CHARACTERS.DINO.NAME, {
        start: dinoAnim.start,
        end: dinoAnim.end,
        zeroPad: dinoAnim.zeroPad,
        prefix: dinoAnim.prefix,
        suffix: dinoAnim.suffix,
      }),
      frameRate: 6,
      repeat: -1,
    });

    // Robot idle animation (looping)
    const robotAnim = anims.animRobot.IDLE;
    this.anims.create({
      key: robotAnim.key,
      frames: this.anims.generateFrameNames(CLIENT_CONFIG.CHARACTERS.ROBOT.NAME, {
        start: robotAnim.start,
        end: robotAnim.end,
        zeroPad: robotAnim.zeroPad,
        prefix: robotAnim.prefix,
        suffix: robotAnim.suffix,
      }),
      frameRate: 6,
      repeat: -1,
    });

    // Spawn wizard + dino at pnj1, robot at pnj2
    // @ts-ignore
    this.sceneMap.findObject("info", (obj) => {
      const tiledObj = obj as unknown as { x: number; y: number; name: string };
      if (tiledObj.name === "pnj1") {
        const wizard = this.add.sprite(tiledObj.x, tiledObj.y, CLIENT_CONFIG.CHARACTERS.WIZARD.NAME);
        wizard.setDepth(1);
        wizard.play(wizardAnim.key);

        const dino = this.add.sprite(tiledObj.x + 20, tiledObj.y, CLIENT_CONFIG.CHARACTERS.DINO.NAME);
        dino.setDepth(1);
        dino.play(dinoAnim.key);
      }
      if (tiledObj.name === "pnj2") {
        const robot = this.add.sprite(tiledObj.x, tiledObj.y, CLIENT_CONFIG.CHARACTERS.ROBOT.NAME);
        robot.setDepth(1);
        robot.play(robotAnim.key);
        this.robotSprite = robot;

        this.robotBubble = createSpeakingBubble(this, robot, 10, 14);
      }
    });

    // Dialogue keyboard controls + speaking state sync
    this.input.keyboard!.on("keydown-ENTER", () => {
      if (this.dialogueManager.isOpen()) {
        this.dialogueManager.confirm();
      } else if (this.dialogueManager.isInZone()) {
        this.dialogueManager.open();
      }
    });

    this.input.keyboard!.on("keydown-UP", () => {
      if (this.dialogueManager.isOpen()) this.dialogueManager.navigateUp();
    });
    this.input.keyboard!.on("keydown-DOWN", () => {
      if (this.dialogueManager.isOpen()) this.dialogueManager.navigateDown();
    });
    this.input.keyboard!.on("keydown-ESC", () => {
      if (this.dialogueManager.isOpen()) this.dialogueManager.close();
    });
    // Mobile dialogue controls (mirror keyboard shortcuts)
    phaserEvents.on(PhaserEvent.MOBILE_INTERACT, () => {
      if (this.dialogueManager.isOpen()) {
        this.dialogueManager.confirm();
      } else if (this.dialogueManager.isInZone()) {
        this.dialogueManager.open();
      }
    });
    phaserEvents.on(PhaserEvent.MOBILE_NAV_UP,  () => { if (this.dialogueManager.isOpen()) this.dialogueManager.navigateUp(); });
    phaserEvents.on(PhaserEvent.MOBILE_NAV_DOWN, () => { if (this.dialogueManager.isOpen()) this.dialogueManager.navigateDown(); });
    phaserEvents.on(PhaserEvent.MOBILE_CLOSE,   () => { if (this.dialogueManager.isOpen()) this.dialogueManager.close(); });

    phaserEvents.on(PhaserEvent.DIALOGUE_ACTION, (action: string) => {
      if (action === "open_linkedin") {
        const url = "https://fr.linkedin.com/in/erwan-gilbert-b184241b";
        // window.open is blocked on mobile (user-activation lost in Phaser's rAF loop)
        // so we fall back to same-tab navigation on touch devices
        if (this.sys.game.device.input.touch) {
          window.location.href = url;
        } else {
          window.open(url, "_blank", "noopener,noreferrer");
        }
      }
    });

    phaserEvents.on(PhaserEvent.DIALOGUE_OPEN, () => {
      this.network.setSpeaking(true);
      this.myPlayer?.showSpeakingBubble();
    });

    phaserEvents.on(PhaserEvent.DIALOGUE_CLOSE, () => {
      this.network.setSpeaking(false);
      this.myPlayer?.hideSpeakingBubble();
    });

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
      if (enemy.isDead) return;

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

    const hurtHalf = COMBAT_CONFIG.HURT_BOX_SIZE / 2;
    const hitHalf  = COMBAT_CONFIG.HIT_BOX_SIZE / 2;
    const offset   = COMBAT_CONFIG.HIT_BOX_OFFSET;

    this.enemies.forEach((enemy) => {
      const ex = enemy.x;
      const ey = enemy.y;

      // Aggro radius — yellow
      this.enemyDebugGraphics.lineStyle(1, 0xffee00, 0.3);
      this.enemyDebugGraphics.strokeCircle(ex, ey, ENEMY_CONFIG.AGGRO_RADIUS);

      // Attack trigger range — orange (distance at which enemy deals damage)
      this.enemyDebugGraphics.lineStyle(1, 0xff8800, 0.8);
      this.enemyDebugGraphics.strokeCircle(ex, ey, ENEMY_CONFIG.ATTACK_RANGE);

      // Enemy HURT_BOX — blue (where player hits land)
      this.enemyDebugGraphics.lineStyle(2, 0x4488ff, 1);
      this.enemyDebugGraphics.strokeRect(
        ex - hurtHalf, ey - hurtHalf,
        COMBAT_CONFIG.HURT_BOX_SIZE, COMBAT_CONFIG.HURT_BOX_SIZE
      );

      // Enemy HIT_BOX — red, follows direction (slime jumps toward player)
      const currentAnim = enemy.getData(SERVER_DATA.ANIM) as string;
      const isAttacking =
        currentAnim === Anim.ATTACK_UP || currentAnim === Anim.ATTACK_DOWN ||
        currentAnim === Anim.ATTACK_LEFT || currentAnim === Anim.ATTACK_RIGHT;

      // Hitbox centered on enemy
      this.enemyDebugGraphics.lineStyle(2, 0xff2222, isAttacking ? 1 : 0.3);
      this.enemyDebugGraphics.strokeRect(
        ex - hitHalf, ey - hitHalf,
        COMBAT_CONFIG.HIT_BOX_SIZE, COMBAT_CONFIG.HIT_BOX_SIZE
      );
    });

    // Player HIT_BOX — green when attacking
    if (this.myPlayer) {
      let hx = this.myPlayer.x;
      let hy = this.myPlayer.y;
      const isAttacking = this.myPlayer.getData(SERVER_DATA.IS_ATTACKING);

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

      // Player HIT_BOX — green (attack zone)
      this.enemyDebugGraphics.lineStyle(2, 0x00ff44, isAttacking ? 1 : 0.2);
      this.enemyDebugGraphics.strokeRect(
        hx - hitHalf, hy - hitHalf,
        COMBAT_CONFIG.HIT_BOX_SIZE, COMBAT_CONFIG.HIT_BOX_SIZE
      );

      // Player HURT_BOX — cyan (damage-receiving zone, always centered)
      this.enemyDebugGraphics.lineStyle(2, 0x00ffff, 1);
      this.enemyDebugGraphics.strokeRect(
        this.myPlayer.x - hitHalf, this.myPlayer.y - hitHalf,
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

    // INPUTS — blocked while dialogue is open
    const inputs = this.dialogueManager.isOpen()
      ? { left: false, right: false, up: false, down: false, space: false }
      : this.myPlayer.handleInput();

    // SEND INPUT TO BACKEND
    this.network.updatePlayer(inputs);

    // LERP MY PLAYER
    this.updateOtherPlayers();

    // LERP OTHER PLAYERS
    this.updateMyPlayers();

    // UPDATE ENEMIES
    this.updateEnemies();

    // Robot interaction zone
    if (this.robotSprite && this.robotBubble) {
      const dist = Phaser.Math.Distance.Between(
        this.myPlayer.x, this.myPlayer.y,
        this.robotSprite.x, this.robotSprite.y
      );
      const inZone = dist <= ROBOT_INTERACTION_RADIUS;
      this.robotBubble.setVisible(inZone);
      if (inZone) {
        this.dialogueManager.enterZone("robot");
      } else {
        this.dialogueManager.leaveZone();
      }
    }

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
