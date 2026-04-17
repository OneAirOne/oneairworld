import Phaser from "phaser";

// Services
import { Network } from "services/Network";
import ComponentService from "services/Component.service";

// Characters
import { createAnim, anims, Player, Enemy } from "characters";
import { Arrow, ARROW_ANIM_KEYS } from "../characters/Arrow";

// Others
import { SCENES } from "./scene.config";
import { createSpeakingBubble, buildTilesets, showSceneTitle, renderCollisionDebug, renderDebugZones, loadPoiZones, type PoiZone } from "./game.helpers";
import { ROAD_MAP_CONFIG } from "./road.config";
import CLIENT_CONFIG, { SERVER_DATA } from "client.config";

// Components
import {
  ClickOnMeComponent,
  DebugPlayer,
  UiBarComponent,
} from "components/phaser";

// Dialogue
import { DialogueManager } from "../dialogue/DialogueManager";
import { DialogueInputHandler } from "../dialogue/DialogueInputHandler";
import { phaserEvents, PhaserEvent } from "../events/eventManager";

// Shared
import type { IPlayer, IEnemy, IArrow, ICoin, IPotion } from "../../../shared/types";
import { Anim, Zone } from "../../../shared/types";
import { ROAD_SCENE_LAYERS, ROAD_POI_ZONES, TiledLayer, TiledObjectType } from "./road.config";
import { SHARED_CONFIG, ENEMY_CONFIG, POTION_CONFIG, getCharCombatConfig, PNJ_LIST } from "../../../shared/shared.config";
import { INTERIORS } from "./interior.config";
import { PlayerManager } from "./playerManager";

const ROBOT_INTERACTION_RADIUS = 50;

export class Road extends Phaser.Scene {
  private network!: Network;
  private playerManager!: PlayerManager;
  private components!: ComponentService;

  private get myPlayer(): Player { return this.playerManager?.myPlayer; }
  private get players(): Map<string, Player> { return this.playerManager?.players ?? new Map(); }
  private enemyDebugGraphics!: Phaser.GameObjects.Graphics;
  private enemies = new Map<string, Enemy>();
  private arrows = new Map<string, Arrow>();
  private coins = new Map<string, Phaser.GameObjects.Sprite>();
  private potions = new Map<string, Phaser.GameObjects.Sprite>();
  private interactivePnjs: { sprite: Phaser.GameObjects.Sprite; bubble: Phaser.GameObjects.Text; dialogueId: string }[] = [];
  private dialogueManager = new DialogueManager();
  private dialogueInput!: DialogueInputHandler;
  private _pnjCooldown = false;
  private _introCompleted = false;
  private _myCoins = 0;
  private _wendyAutoOpened = false;
  private _poiZones: PoiZone[] = [];
  private _activePoi: PoiZone | null = null;

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

    // Stop receiving arrow events while interior is active (arrows belong to the interior scene)
    this.events.on(Phaser.Scenes.Events.PAUSE, () => {
      this.dialogueInput.unregister();
      this.network.offArrowJoin(this.handleArrowJoin, this);
      this.network.offArrowUpdated(this.handleArrowUpdated, this);
      this.network.offArrowLeft(this.handleArrowLeft, this);
    });

    // Fade back in + restore local player when returning from an interior scene
    this.events.on(Phaser.Scenes.Events.RESUME, () => {
      this.dialogueInput.register(this);
      // Reset dialogue state and block PNJ detection briefly
      this.dialogueManager.leaveZone();
      this._pnjCooldown = true;
      this.time.delayedCall(1200, () => { this._pnjCooldown = false; });
      this.myPlayer?.setVisible(true);
      // Snap player to last known road position so there's no lerp slide-in
      if (this.myPlayer && this.lastServerX && this.lastServerY) {
        this.myPlayer.x = this.lastServerX;
        this.myPlayer.y = this.lastServerY;
        this.myPlayer.setData(SERVER_DATA.X, this.lastServerX);
        this.myPlayer.setData(SERVER_DATA.Y, this.lastServerY);
      }
      this.network.onArrowJoin(this.handleArrowJoin, this);
      this.network.onArrowUpdated(this.handleArrowUpdated, this);
      this.network.onArrowLeft(this.handleArrowLeft, this);
      this.cameras.main.fadeIn(400, 0, 0, 0);
      showSceneTitle(this, "OneairWorld");
    });
  }

  /**
   * Call before scene creation
   */
  preload() {}

  displayMap() {
    // Create Tilemap
    this.sceneMap = this.make.tilemap({ key: ROAD_MAP_CONFIG.mapKey });

    // Create Tilesets from config
    const tileSets = buildTilesets(this.sceneMap, ROAD_MAP_CONFIG.tilesets);

    // Create layers
    ROAD_SCENE_LAYERS.forEach((layer) => {
      const phaserLayer = this.sceneMap.createLayer(
        layer.name,
        tileSets as Phaser.Tilemaps.Tileset[]
      );

      if (!phaserLayer) {
        console.warn(`[Road] createLayer returned null for layer: ${layer.name}`);
        return;
      }

      if (layer?.depth && layer?.depth > 0) {
        phaserLayer.setDepth((this.players?.size ?? 0) + layer.depth);
      }

      renderCollisionDebug(this, phaserLayer, layer.name, CLIENT_CONFIG.DEBUG_LAYER);
    });

    // Analyse map objects
    // @ts-ignore
    this.sceneMap.findObject(TiledLayer.INFO, (object) => {
      if (object.type === TiledObjectType.START) {
        console.log("Start position ", object.type);
      }
    });

    // @ts-ignore (PhaserAnimatedTiles types not defined)
    this.animatedTiles.init(this.sceneMap);
  }

  /**
   * Create and initialize the scene
   */
  create(data: { network: Network }) {
    // Black screen immediately — nothing visible until the player and camera are ready
    this.cameras.main.fadeOut(0, 0, 0, 0);

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

    this.playerManager = new PlayerManager(this, () => this.network.sessionId, {
      isInCurrentZone: (zone) => zone === Zone.ROAD,
      onMyPlayerCreated: (player) => {
        this.components.addComponent(player, new UiBarComponent());
        this.components.addComponent(player, new ClickOnMeComponent());
        if (CLIENT_CONFIG.DEBUG) {
          this.components.addComponent(player, new DebugPlayer(this.scene.get(SCENES.UI)));
        }
        // Camera must be configured (zoom + follow) BEFORE fading in,
        // so the very first visible frame is already the correct framing.
        this.setupCamera();
        this.cameras.main.fadeIn(1200, 0, 0, 0);
        showSceneTitle(this, "OneairWorld");
        // Auto-trigger ghost intro dialogue on the next frame (movement blocked by _introCompleted)
        this._pnjCooldown = true;
        this.time.delayedCall(0, () => {
          const introId = this.sys.game.device.input.touch ? "ghost_intro" : "ghost_intro_pc";
          this.dialogueManager.enterZone(introId);
          this.dialogueManager.open();
          phaserEvents.once(PhaserEvent.DIALOGUE_CLOSE, () => {
            this.dialogueManager.leaveZone();
            this._pnjCooldown = false;
            this._introCompleted = true;
          });
        });
      },
      onOtherPlayerCreated: (player) => {
        this.components.addComponent(player, new UiBarComponent());
        this.components.addComponent(player, new ClickOnMeComponent());
      },
    });

    // Create animations
    createAnim(anims.animOneAir,  10, this, CLIENT_CONFIG.CHARACTERS.NAME);
    createAnim(anims.animTimothee, 10, this, CLIENT_CONFIG.CHARACTERS.TIMOTHEE.NAME);
    createAnim(anims.animLink,    10, this, CLIENT_CONFIG.CHARACTERS.NAME);

    // Arrow anims (1 frame per direction)
    for (const [dir, key] of Object.entries(ARROW_ANIM_KEYS)) {
      this.anims.create({
        key,
        frames: this.anims.generateFrameNames(CLIENT_CONFIG.CHARACTERS.NAME, {
          prefix: `link/arrow/${dir.toLowerCase()}/`,
          start: 1, end: 1, zeroPad: 4, suffix: ".png",
        }),
        frameRate: 1,
        repeat: -1,
      });
    }
    createAnim(anims.animFluppy, 10, this, CLIENT_CONFIG.CHARACTERS.NAME);
    createAnim(anims.animSlime, 10, this, CLIENT_CONFIG.CHARACTERS.SLIME.NAME);

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

    // John idle animation (looping)
    const johnAnim = anims.animJohn.IDLE;
    this.anims.create({
      key: johnAnim.key,
      frames: this.anims.generateFrameNames(CLIENT_CONFIG.CHARACTERS.JOHN.NAME, {
        start: johnAnim.start,
        end: johnAnim.end,
        zeroPad: johnAnim.zeroPad,
        prefix: johnAnim.prefix,
        suffix: johnAnim.suffix,
      }),
      frameRate: 6,
      repeat: -1,
    });

    // Wendy idle animation (looping)
    const wendyAnim = anims.animWendy.IDLE;
    this.anims.create({
      key: wendyAnim.key,
      frames: this.anims.generateFrameNames(CLIENT_CONFIG.CHARACTERS.WENDY.NAME, {
        start: wendyAnim.start,
        end: wendyAnim.end,
        zeroPad: wendyAnim.zeroPad,
        prefix: wendyAnim.prefix,
        suffix: wendyAnim.suffix,
      }),
      frameRate: 6,
      repeat: -1,
    });

    // Ghost idle animation (looping)
    const ghostAnim = anims.animGhost.IDLE;
    this.anims.create({
      key: ghostAnim.key,
      frames: this.anims.generateFrameNames(CLIENT_CONFIG.CHARACTERS.GHOST.NAME, {
        start: ghostAnim.start,
        end: ghostAnim.end,
        zeroPad: ghostAnim.zeroPad,
        prefix: ghostAnim.prefix,
        suffix: ghostAnim.suffix,
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

    // Blue coin animation
    this.anims.create({
      key: "coin-spin",
      frames: this.anims.generateFrameNames(CLIENT_CONFIG.ITEMS.BLUE_COIN.NAME, {
        start: 0, end: 14, zeroPad: 3, prefix: "tile", suffix: ".png",
      }),
      frameRate: 10,
      repeat: -1,
    });

    // ── Resolve PNJ anim keys (client-side only) ──────────────────────────────
    const PNJ_ANIM_KEYS: Record<string, string> = {
      [CLIENT_CONFIG.CHARACTERS.GHOST.NAME]:  ghostAnim.key,
      [CLIENT_CONFIG.CHARACTERS.DINO.NAME]:   dinoAnim.key,
      [CLIENT_CONFIG.CHARACTERS.ROBOT.NAME]:  robotAnim.key,
      [CLIENT_CONFIG.CHARACTERS.WENDY.NAME]:  wendyAnim.key,
      [CLIENT_CONFIG.CHARACTERS.JOHN.NAME]:   johnAnim.key,
    };

    // @ts-ignore
    this.sceneMap.findObject("info", (obj) => {
      const tiledObj = obj as unknown as { x: number; y: number; name: string };
      for (const pnj of PNJ_LIST) {
        if (tiledObj.name !== pnj.spawnPoint || !pnj.visible) continue;
        const sprite = this.add.sprite(tiledObj.x + pnj.offsetX, tiledObj.y + pnj.offsetY, pnj.atlasKey ?? pnj.texture);
        sprite.setDepth(1);
        sprite.play(PNJ_ANIM_KEYS[pnj.texture]);
        if (pnj.dialogueId) {
          const isTouch = this.sys.game.device.input.touch;
          const dialogueId = (!isTouch && pnj.dialogueIdDesktop) ? pnj.dialogueIdDesktop : pnj.dialogueId;
          const bubble = createSpeakingBubble(this, sprite, pnj.bubbleOffsetX ?? 10, pnj.bubbleOffsetY ?? 14);
          this.interactivePnjs.push({ sprite, bubble, dialogueId, bodyOffsetX: pnj.bodyOffsetX, bodyOffsetY: pnj.bodyOffsetY });
        }
      }
    });
    this._poiZones = loadPoiZones(this.sceneMap, ROAD_POI_ZONES);
    this._activePoi = null;
    renderDebugZones(this, this.interactivePnjs, ROBOT_INTERACTION_RADIUS, [], this._poiZones);

    this.dialogueInput = new DialogueInputHandler(
      this.dialogueManager,
      (action) => {
        if (action === "open_linkedin") {
          // On desktop: call directly (user-activation is preserved).
          // On mobile: UIScene handles it via a native touchend listener instead,
          // because Phaser's rAF loop breaks the user-activation context.
          if (!this.sys.game.device.input.touch) {
            window.open("https://fr.linkedin.com/in/erwan-gilbert-b184241b", "_blank", "noopener,noreferrer");
          }
        }

        if (action === "open_github") {
          if (!this.sys.game.device.input.touch) {
            window.open("https://github.com/OneAirOne", "_blank", "noopener,noreferrer");
          }
        }

        if (action === "restore_life") {
          this.network.restoreLife();
        }

        if (action === "buy_boost") {
          this.network.buyBoost();
        }

        // enter_interior:<zone>
        if (action.startsWith("enter_interior:")) {
          const zone = action.split(":")[1] as Zone;
          if (INTERIORS[zone]) {
            this.dialogueManager.close();
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
              this.network.setZone(zone);
              this.myPlayer?.setVisible(false);
              this.scene.launch(SCENES.INTERIOR, {
                zone,
                playerTexture: this.myPlayer?.characterId ?? CLIENT_CONFIG.ACTIVE_PLAYER,
                network: this.network,
              });
              this.scene.pause(SCENES.GAME);
            });
          }
        }
      },
    );
    this.dialogueInput.register(this);

    // POI zones with actions — Enter (desktop) or mobile interact button
    this.input.keyboard!.on("keydown-ENTER", () => {
      if (this._activePoi?.action && !this.dialogueManager.isOpen()) {
        this._handlePoiAction(this._activePoi.action);
      }
    });
    phaserEvents.on(PhaserEvent.MOBILE_INTERACT, () => {
      if (this._activePoi?.action && !this.dialogueManager.isOpen()) {
        this._handlePoiAction(this._activePoi.action);
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

    phaserEvents.on(PhaserEvent.CV_POPUP_CLOSE, () => {
      this.network.setSpeaking(false);
      this.myPlayer?.hideSpeakingBubble();
    });

    phaserEvents.on(PhaserEvent.GAME_OVER_RESTART, () => {
      this.cameras.main.fadeOut(0, 0, 0, 0);
      this.network.restoreLife();
    });

    // Debug graphics for enemies
    this.enemyDebugGraphics = this.add.graphics().setDepth(CLIENT_CONFIG.DEBUG_LAYER);

    // Register network event listener
    this.registerNetworkListeners();

    // Sync players already in state (joined before scene was ready — production race condition)
    this.network.getPlayers()?.forEach((player, id) => {
      this.handleJoinPLayer(player, id);
    });

    // Sync enemies already in state (spawned before scene was ready)
    this.network.getEnemies()?.forEach((enemy: IEnemy, id: string) => {
      this.handleEnemyJoin(enemy, id);
    });

    // Sync coins already in state
    this.network.getCoins()?.forEach((coin: ICoin, id: string) => {
      this.handleCoinJoin(coin, id);
    });

    // Sync potions already in state
    this.network.getPotions()?.forEach((potion: IPotion, id: string) => {
      this.handlePotionJoin(potion, id);
    });

    // Safety net: in production the initial Colyseus state patch can arrive after create() runs.
    // Retry every 500 ms until the local player is confirmed created (max 10 s).
    const playerRetry = this.time.addEvent({
      delay: 500,
      repeat: 19,
      callback: () => {
        if (this.myPlayer) { playerRetry.remove(); return; }
        console.warn("[Road] local player not yet created — retrying sync…");
        this.network.getPlayers()?.forEach((player, id) => this.handleJoinPLayer(player, id));
      },
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
    this.network.onArrowJoin(this.handleArrowJoin, this);
    this.network.onArrowUpdated(this.handleArrowUpdated, this);
    this.network.onArrowLeft(this.handleArrowLeft, this);
    phaserEvents.on(PhaserEvent.COIN_JOINED, this.handleCoinJoin, this);
    phaserEvents.on(PhaserEvent.COIN_LEFT, this.handleCoinLeft, this);
    phaserEvents.on(PhaserEvent.POTION_JOINED, this.handlePotionJoin, this);
    phaserEvents.on(PhaserEvent.POTION_LEFT, this.handlePotionLeft, this);
  }

  handleEnemyJoin(enemy: IEnemy, id: string) {
    console.log(`[Scene] enemy joined id=${id} x=${enemy.x} y=${enemy.y}`);

    const newEnemy = new Enemy(this, enemy.x, enemy.y, enemy.texture, id);
    if (enemy.anim) newEnemy.updateAnim(enemy.anim as Anim);
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
    if (enemy) {
      enemy.destroy();
      phaserEvents.emit(PhaserEvent.SLIME_KILLED);
    }
    this.enemies.delete(id);
  }

  handleArrowJoin(arrow: IArrow, id: string) {
    const sprite = new Arrow(this, arrow.x, arrow.y, arrow.direction);
    this.arrows.set(id, sprite);
  }

  handleArrowUpdated(field: string, value: number | string, id: string) {
    const arrow = this.arrows.get(id);
    if (!arrow) return;
    if (field === "x") arrow.x = value as number;
    if (field === "y") arrow.y = value as number;
  }

  handleArrowLeft(id: string) {
    const arrow = this.arrows.get(id);
    if (arrow) arrow.destroy();
    this.arrows.delete(id);
  }

  handleCoinJoin(coin: ICoin, id: string) {
    const sprite = this.add.sprite(coin.x, coin.y, CLIENT_CONFIG.ITEMS.BLUE_COIN.NAME);
    sprite.setDepth(1);
    sprite.play("coin-spin");
    this.coins.set(id, sprite);
  }

  handleCoinLeft(id: string) {
    const sprite = this.coins.get(id);
    if (sprite) sprite.destroy();
    this.coins.delete(id);
  }

  handlePotionJoin(potion: IPotion, id: string) {
    const sprite = this.add.sprite(potion.x, potion.y, CLIENT_CONFIG.ITEMS.POTION.NAME);
    sprite.setScale(0.9);
    sprite.setDepth(1);
    this.potions.set(id, sprite);
  }

  handlePotionLeft(id: string) {
    const sprite = this.potions.get(id);
    if (sprite) sprite.destroy();
    this.potions.delete(id);
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

    const enemyCc  = getCharCombatConfig("oneair"); // enemies always use default
    const hurtHalf = enemyCc.hurtBoxW / 2;
    const hitHalf  = enemyCc.hitBoxSize / 2;

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
        enemyCc.hurtBoxW, enemyCc.hurtBoxW
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
        enemyCc.hitBoxSize, enemyCc.hitBoxSize
      );
    });

    // Player HIT_BOX — green when attacking
    if (this.myPlayer) {
      const pCc        = getCharCombatConfig(CLIENT_CONFIG.ACTIVE_PLAYER);
      const pHitHalf   = pCc.hitBoxSize / 2;
      const pHurtHalfW = pCc.hurtBoxW / 2;
      const pHurtHalfH = pCc.hurtBoxH / 2;

      let hx = this.myPlayer.x;
      let hy = this.myPlayer.y;
      const isAttacking = this.myPlayer.getData(SERVER_DATA.IS_ATTACKING);

      switch (this.myPlayer.lastAnim) {
        case Anim.UP: case Anim.IDDLE_UP: case Anim.ATTACK_UP:
          hy -= pCc.hitBoxOffsetUp; break;
        case Anim.DOWN: case Anim.IDDLE_DOWN: case Anim.ATTACK_DOWN:
          hy += pCc.hitBoxOffsetDown; break;
        case Anim.LEFT: case Anim.IDDLE_LEFT: case Anim.ATTACK_LEFT:
          hx -= pCc.hitBoxOffsetLeft; hy += pCc.hitBoxOffsetLRY; break;
        case Anim.RIGHT: case Anim.IDDLE_RIGHT: case Anim.ATTACK_RIGHT:
          hx += pCc.hitBoxOffsetRight; hy += pCc.hitBoxOffsetLRY; break;
      }

      // Player HIT_BOX — green (attack zone)
      this.enemyDebugGraphics.lineStyle(2, 0x00ff44, isAttacking ? 1 : 0.2);
      this.enemyDebugGraphics.strokeRect(
        hx - pHitHalf, hy - pHitHalf,
        pCc.hitBoxSize, pCc.hitBoxSize
      );

      // Player HURT_BOX — cyan
      this.enemyDebugGraphics.lineStyle(2, 0x00ffff, 1);
      this.enemyDebugGraphics.strokeRect(
        this.myPlayer.x - pHurtHalfW,
        this.myPlayer.y + pCc.hurtBoxOffsetY - pHurtHalfH,
        pCc.hurtBoxW, pCc.hurtBoxH
      );
    }
  }

  handleLeftPlayer(sessionId: string) {
    this.playerManager.handleLeave(sessionId);
  }

  handleJoinPLayer(player: IPlayer, sessionId: string) {
    this.playerManager.handleJoin(player, sessionId);
  }

  handleProcessServerUpdates(field: string, value: number | string, id: string) {
    if (field === SERVER_DATA.ZONE && id !== this.network.sessionId) {
      if (value === Zone.ROAD) {
        const p = this.network.getPlayers()?.get(id);
        if (p) this.playerManager.handleJoin(p, id);
      } else {
        this.playerManager.handleLeave(id);
      }
      return;
    }
    if (field === SERVER_DATA.COINS && id === this.network.sessionId) {
      this._myCoins = value as number;
      phaserEvents.emit(PhaserEvent.COIN_COLLECTED, value as number);
    }
    if (field === SERVER_DATA.IS_DEAD && id === this.network.sessionId) {
      if (!!value) {
        this.myPlayer?.setVisible(false);
        this.myPlayer?.hideSpeakingBubble();
        phaserEvents.emit(PhaserEvent.GAME_OVER);
      } else {
        // Snap to server position before revealing to avoid lerp slide
        const sx = this.myPlayer?.getData(SERVER_DATA.X);
        const sy = this.myPlayer?.getData(SERVER_DATA.Y);
        if (this.myPlayer && sx && sy) {
          this.myPlayer.x = sx;
          this.myPlayer.y = sy;
        }
        this.myPlayer?.setVisible(true);
        this.cameras.main.fadeIn(1200, 0, 0, 0);
      }
    }
    this.playerManager.handleUpdate(field, value, id);
  }

  updateMyPlayers() {
    this.playerManager.updateMyPlayer((serverX, serverY) => {
      this.lastServerX = serverX;
      this.lastServerY = serverY;
      const serverIsCollided = this.myPlayer?.getData(SERVER_DATA.IS_COLLIDED);
      if (serverIsCollided) this.myPlayer.updateIsCollided(serverIsCollided);
    });
  }

  updateOtherPlayers() {
    this.playerManager.updateOtherPlayers();
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

    // INPUTS — blocked while dialogue is open or intro not yet completed
    const inputs = (this.dialogueManager.isOpen() || !this._introCompleted)
      ? { left: false, right: false, up: false, down: false, space: false, sprint: false }
      : this.myPlayer.handleInput();

    // SEND INPUT TO BACKEND
    this.network.updatePlayer(inputs);

    // LERP MY PLAYER
    this.updateOtherPlayers();

    // LERP OTHER PLAYERS
    this.updateMyPlayers();

    // UPDATE ENEMIES
    this.updateEnemies();

    // PNJ interaction zones (skipped during cooldown after returning from interior)
    let nearestPnj: typeof this.interactivePnjs[0] | null = null;
    for (const pnj of this.interactivePnjs) {
      const dist = Phaser.Math.Distance.Between(
        this.myPlayer.x, this.myPlayer.y,
        pnj.sprite.x, pnj.sprite.y
      );
      const inZone = !this._pnjCooldown && dist <= ROBOT_INTERACTION_RADIUS;
      pnj.bubble.setVisible(inZone);
      if (inZone) nearestPnj = pnj;
    }
    if (nearestPnj) {
      const dialogueId = nearestPnj.dialogueId === "dino"
        ? (this._myCoins >= POTION_CONFIG.BOOST_PRICE ? "dino" : "dino_broke")
        : nearestPnj.dialogueId;
      this.dialogueManager.enterZone(dialogueId);
      if (nearestPnj.dialogueId === "wendy" && !this._wendyAutoOpened) {
        this._wendyAutoOpened = true;
        this.dialogueManager.open();
      }
    } else if (!this._pnjCooldown) {
      this.dialogueManager.leaveZone();
    }

    // POI zones — text overlay on proximity, optional Enter action
    let nearestPoi: PoiZone | null = null;
    for (const zone of this._poiZones) {
      const dist = Phaser.Math.Distance.Between(this.myPlayer.x, this.myPlayer.y, zone.x, zone.y);
      if (dist <= zone.radius) { nearestPoi = zone; break; }
    }
    if (nearestPoi !== this._activePoi) {
      this._activePoi = nearestPoi;
      if (nearestPoi) {
        const isTouch = this.sys.game.device.input.touch;
        const hint = (isTouch && nearestPoi.textMobile) ? nearestPoi.textMobile : nearestPoi.text;
        if (nearestPoi.action) phaserEvents.emit(PhaserEvent.POI_ACTION_ENTER);
        phaserEvents.emit(PhaserEvent.POI_ENTER, hint);
      } else {
        phaserEvents.emit(PhaserEvent.POI_ACTION_LEAVE);
        phaserEvents.emit(PhaserEvent.POI_LEAVE);
      }
    }

    // DEBUG: draw enemy bounding boxes
    if (CLIENT_CONFIG.DEBUG) {
      this.drawEnemyDebug();
    }
  }

  private _handlePoiAction(action: string) {
    if (action === "open_cv") {
      this.network.setSpeaking(true);
      this.myPlayer?.showSpeakingBubble();
      phaserEvents.emit(PhaserEvent.CV_POPUP_OPEN);
      return;
    }

    const LINK_URLS: Record<string, string> = {
      open_linkedin: "https://fr.linkedin.com/in/erwan-gilbert-b184241b",
      open_github:   "https://github.com/OneAirOne",
    };
    const url = LINK_URLS[action];
    if (url) {
      this.network.setSpeaking(true);
      this.myPlayer?.showSpeakingBubble();

      // Clear speaking state when player comes back to the tab
      const onVisible = () => {
        if (document.visibilityState === "visible") {
          this.network.setSpeaking(false);
          this.myPlayer?.hideSpeakingBubble();
          document.removeEventListener("visibilitychange", onVisible);
        }
      };
      document.addEventListener("visibilitychange", onVisible);

      if (this.sys.game.device.input.touch) {
        phaserEvents.emit(PhaserEvent.URL_PENDING, url);
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
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
