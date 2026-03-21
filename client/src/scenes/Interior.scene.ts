import Phaser from "phaser";
import { SCENES } from "./scene.config";
import { INTERIORS, INTERIOR_SCENE_LAYERS } from "./interior.config";
import { Network } from "../services/Network";
import { Zone } from "../../../shared/types";
import { SERVER_DATA } from "client.config";
import { Player } from "../characters/player";
import { PlayerManager } from "./playerManager";
import { Arrow } from "../characters/Arrow";
import type { IArrow } from "../../../shared/types";
import ComponentService from "../services/Component.service";
import { UiBarComponent } from "../components/phaser";
import { showSceneTitle } from "./game.helpers";
import { DialogueManager } from "../dialogue/DialogueManager";
import { phaserEvents, PhaserEvent } from "../events/eventManager";

const RETURN_INTERACTION_RADIUS = 24;
const RETURN_DIALOGUE_ID = "exit_interior";

interface InitData {
  zone: Zone;
  playerTexture: string;
  network: Network;
}

export class InteriorScene extends Phaser.Scene {
  private _zone!: Zone;
  private _playerTexture!: string;
  private _network!: Network;
  private _playerManager!: PlayerManager;
  private _onJoin!: Function;
  private _onUpdate!: Function;
  private _onLeave!: Function;
  private _arrows = new Map<string, Arrow>();
  private _onArrowJoin!: Function;
  private _onArrowUpdated!: Function;
  private _onArrowLeft!: Function;
  private _components!: ComponentService;
  private _dialogueManager = new DialogueManager();
  private _returnPoint: { x: number; y: number } | null = null;
  private _inReturnZone = false;

  private get _player(): Player { return this._playerManager?.myPlayer; }

  constructor() {
    super(SCENES.INTERIOR);
  }

  init(data: InitData) {
    this._zone = data.zone;
    this._playerTexture = data.playerTexture;
    this._network = data.network;
  }

  preload() {
    const config = INTERIORS[this._zone];
    if (!config) return;

    if (!this.cache.tilemap.has(config.mapKey)) {
      this.load.tilemapTiledJSON(config.mapKey, config.mapPath);
    }
    config.tilesets.forEach((ts) => {
      if (!this.textures.exists(ts.name)) {
        this.load.image(ts.name, ts.path);
      }
    });
  }

  create() {

    this._components = new ComponentService();
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => this._components.destroy());
    this.events.on(Phaser.Scenes.Events.POST_UPDATE, (_time: number, delta: number) => this._components.update(delta));

    // PlayerManager — shows other players in the same interior zone
    this._playerManager = new PlayerManager(this, () => this._network.sessionId, {
      isInCurrentZone: (zone) => zone === this._zone,
      onOtherPlayerCreated: (player) => {
        this._components.addComponent(player, new UiBarComponent());
      },
    });

    this._onJoin   = (p: any, id: string) => this._playerManager.handleJoin(p, id);
    this._onLeave  = (id: string) => this._playerManager.handleLeave(id);

    // Handle zone changes: create sprite when entering, remove when leaving
    this._onUpdate = (field: string, value: any, id: string) => {
      if (field === SERVER_DATA.ZONE && id !== this._network.sessionId) {
        if (value === this._zone) {
          const p = this._network.getPlayers()?.get(id);
          if (p) this._playerManager.handleJoin(p, id);
        } else {
          this._playerManager.handleLeave(id);
        }
        return;
      }
      this._playerManager.handleUpdate(field, value, id);
    };

    this._onArrowJoin = (arrow: IArrow, id: string) => {
      const sprite = new Arrow(this, arrow.x, arrow.y, arrow.direction);
      this._arrows.set(id, sprite);
    };
    this._onArrowUpdated = (field: string, value: number | string, id: string) => {
      const arrow = this._arrows.get(id);
      if (!arrow) return;
      if (field === "x") arrow.x = value as number;
      if (field === "y") arrow.y = value as number;
    };
    this._onArrowLeft = (id: string) => {
      const arrow = this._arrows.get(id);
      if (arrow) arrow.destroy();
      this._arrows.delete(id);
    };

    this._network.onPlayerJoin(this._onJoin as any);
    this._network.onPlayerUpdated(this._onUpdate as any);
    this._network.onPlayerLeft(this._onLeave as any);
    this._network.onArrowJoin(this._onArrowJoin as any);
    this._network.onArrowUpdated(this._onArrowUpdated as any);
    this._network.onArrowLeft(this._onArrowLeft as any);

    // TODO: Create helpers to use in every scene
    // Dialogue keyboard controls
    this.input.keyboard!.on("keydown-ENTER", () => {
      if (this._dialogueManager.isOpen()) {
        this._dialogueManager.confirm();
      } else if (this._dialogueManager.isInZone()) {
        this._dialogueManager.open();
      }
    });
    this.input.keyboard!.on("keydown-UP",   () => { if (this._dialogueManager.isOpen()) this._dialogueManager.navigateUp(); });
    this.input.keyboard!.on("keydown-DOWN", () => { if (this._dialogueManager.isOpen()) this._dialogueManager.navigateDown(); });
    this.input.keyboard!.on("keydown-ESC",  () => {
      if (this._dialogueManager.isOpen()) this._dialogueManager.close();
      else this._exit();
    });

    // Mobile dialogue controls
    phaserEvents.on(PhaserEvent.MOBILE_INTERACT, () => {
      if (this._dialogueManager.isOpen()) this._dialogueManager.confirm();
      else if (this._dialogueManager.isInZone()) this._dialogueManager.open();
    });
    phaserEvents.on(PhaserEvent.MOBILE_NAV_UP,   () => { if (this._dialogueManager.isOpen()) this._dialogueManager.navigateUp(); });
    phaserEvents.on(PhaserEvent.MOBILE_NAV_DOWN,  () => { if (this._dialogueManager.isOpen()) this._dialogueManager.navigateDown(); });
    phaserEvents.on(PhaserEvent.MOBILE_CLOSE,     () => { if (this._dialogueManager.isOpen()) this._dialogueManager.close(); });

    // Trigger exit when dialogue action fires
    phaserEvents.on(PhaserEvent.DIALOGUE_ACTION, (action: string) => {
      if (action === "exit_interior") this._exit();
    });

    const config = INTERIORS[this._zone];
    if (!config || !this.cache.tilemap.has(config.mapKey)) {
      this._createPlaceholder();
      return;
    }

    // Black background to hide the Road scene behind
    this.cameras.main.setBackgroundColor(0x000000);

    // --- Tilemap ---
    const map = this.make.tilemap({ key: config.mapKey });
    const tilesets = config.tilesets.map((ts) =>
      map.addTilesetImage(ts.name, ts.name)
    );
    INTERIOR_SCENE_LAYERS.forEach((layerConfig) => {
      const layer = map.createLayer(layerConfig.name, tilesets as Phaser.Tilemaps.Tileset[]);
      if (!layer) {
        console.warn(`[Interior] createLayer returned null for layer: ${layerConfig.name}`);
        return;
      }
      if (layerConfig.depth && layerConfig.depth > 0) {
        layer.setDepth(layerConfig.depth);
      }
    });

    // @ts-ignore (PhaserAnimatedTiles types not defined)
    this.animatedTiles.init(map);

    // --- Spawn + return points from "info" layer ---
    const infoLayer = map.getObjectLayer("info");
    const startObj  = infoLayer?.objects.find((o) => o.name === "start");
    const returnObj = infoLayer?.objects.find((o) => o.name === "return");
    const spawnX = startObj?.x ?? config.playerSpawn.x;
    const spawnY = startObj?.y ?? config.playerSpawn.y;

    if (returnObj) {
      this._returnPoint = { x: returnObj.x as number, y: returnObj.y as number };
    }

    // --- Local player ---
    const localPlayer = new Player(this, spawnX, spawnY, this._playerTexture, this._network.sessionId);
    this._playerManager.setMyPlayer(localPlayer);
    this._components.addComponent(localPlayer, new UiBarComponent());
    // Fade in now: player is already at correct spawn position
    this.cameras.main.fadeIn(400, 0, 0, 0);
    if (config.label) showSceneTitle(this, config.label);

    // --- Sync other players already in this zone ---
    this._network.getPlayers()?.forEach((player, id) => {
      if (player.zone === this._zone && id !== this._network.sessionId) {
        this._playerManager.handleJoin(player, id);
      }
    });

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(localPlayer, true);
    this.cameras.main.setZoom(2);
  }

  private _createPlaceholder() {
    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2;

    this.add.rectangle(cx, cy, this.cameras.main.width, this.cameras.main.height, 0x0d0d1a);

    this.add
      .text(cx, cy - 20, INTERIORS[this._zone]?.label ?? "Interior", {
        fontSize: "14px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(cx, cy + 10, "[ESC] Exit", {
        fontSize: "9px",
        color: "#ffffff66",
      })
      .setOrigin(0.5);
  }

  update() {
    if (!this._player) return;

    // Block inputs while dialogue is open
    const inputs = this._dialogueManager.isOpen()
      ? { left: false, right: false, up: false, down: false, space: false }
      : this._player.handleInput();
    this._network.updatePlayer(inputs);

    // Lerp players from server state
    this._playerManager.updateMyPlayer();
    this._playerManager.updateOtherPlayers();

    // Return-point proximity check — auto-open dialogue on enter, close on leave
    if (this._returnPoint) {
      const dist = Phaser.Math.Distance.Between(
        this._player.x, this._player.y,
        this._returnPoint.x, this._returnPoint.y,
      );
      const inZone = dist <= RETURN_INTERACTION_RADIUS;
      if (inZone && !this._inReturnZone) {
        this._inReturnZone = true;
        this._dialogueManager.enterZone(RETURN_DIALOGUE_ID);
        this._dialogueManager.open();
      } else if (!inZone && this._inReturnZone) {
        this._inReturnZone = false;
        this._dialogueManager.leaveZone();
      }
    }
  }

  private _exit() {
    // Close any open dialogue before leaving so UIScene doesn't keep it visible
    this._dialogueManager.close();

    // Remove network listeners before leaving to avoid stale callbacks in Road
    this._network?.offPlayerJoin(this._onJoin);
    this._network?.offPlayerUpdated(this._onUpdate);
    this._network?.offPlayerLeft(this._onLeave);
    this._network?.offArrowJoin(this._onArrowJoin);
    this._network?.offArrowUpdated(this._onArrowUpdated);
    this._network?.offArrowLeft(this._onArrowLeft);

    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this._network?.setZone(Zone.ROAD);
      this.scene.resume(SCENES.GAME);
      this.scene.stop(SCENES.INTERIOR);
    });
  }
}
