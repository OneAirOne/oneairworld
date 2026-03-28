import Phaser from "phaser";
import { SCENES } from "./scene.config";
import { INTERIORS, INTERIOR_SCENE_LAYERS } from "./interior.config";
import { Network } from "../services/Network";
import { Zone } from "../../../shared/types";
import CLIENT_CONFIG, { SERVER_DATA } from "client.config";
import { Player } from "../characters/player";
import { PlayerManager } from "./playerManager";
import { Arrow } from "../characters/Arrow";
import type { IArrow, IPlayer } from "../../../shared/types";
import ComponentService from "../services/Component.service";
import { UiBarComponent } from "../components/phaser";
import { showSceneTitle, renderCollisionDebug, spawnInteractivePnjs, loadPoiZones, renderDebugZones, type InteractivePnj, type PoiZone } from "./game.helpers";
import { getProject } from "../config/projects.config";
import { phaserEvents, PhaserEvent } from "../events/eventManager";
import { DialogueManager } from "../dialogue/DialogueManager";
import { DialogueInputHandler } from "../dialogue/DialogueInputHandler";

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
  private _onJoin!: (p: IPlayer, id: string) => void;
  private _onUpdate!: (field: string, value: string | number | boolean, id: string) => void;
  private _onLeave!: (id: string) => void;
  private _arrows = new Map<string, Arrow>();
  private _onArrowJoin!: (arrow: IArrow, id: string) => void;
  private _onArrowUpdated!: (field: string, value: number | string, id: string) => void;
  private _onArrowLeft!: (id: string) => void;
  private _components!: ComponentService;
  private _dialogueManager = new DialogueManager();
  private _dialogueInput!: DialogueInputHandler;
  private _returnPoints: { x: number; y: number }[] = [];
  private _inReturnZone = false;
  private _interactivePnjs: InteractivePnj[] = [];
  private _poiZones: PoiZone[] = [];
  private _activePoi: PoiZone | null = null;
  private _pnjCooldown = false;
  private _onMobileInteractPoi!: () => void;

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
    this._inReturnZone = false;
    this._activePoi = null;
    this._exiting = false;

    // POI zone — keyboard Enter
    this.input.keyboard!.on("keydown-ENTER", () => {
      if (this._activePoi?.action && !this._dialogueManager.isOpen()) {
        this._handleAction(this._activePoi.action);
      }
    });

    // POI zone — mobile interact button
    this._onMobileInteractPoi = () => {
      if (this._activePoi?.action && !this._dialogueManager.isOpen()) {
        this._handleAction(this._activePoi.action);
      }
    };
    phaserEvents.on(PhaserEvent.MOBILE_INTERACT, this._onMobileInteractPoi);

    // Pause / resume — mirrors Road's pattern for nested scene launches (e.g. CV scene)
    this.events.on(Phaser.Scenes.Events.PAUSE, () => {
      this._dialogueInput?.unregister();
      phaserEvents.off(PhaserEvent.MOBILE_INTERACT, this._onMobileInteractPoi);
      if (this._activePoi) phaserEvents.emit(PhaserEvent.POI_ACTION_LEAVE);
    });
    this.events.on(Phaser.Scenes.Events.RESUME, () => {
      this._dialogueInput?.register(this);
      phaserEvents.on(PhaserEvent.MOBILE_INTERACT, this._onMobileInteractPoi);
      this._dialogueManager.leaveZone();
      this._pnjCooldown = true;
      this.time.delayedCall(800, () => { this._pnjCooldown = false; });
      // Restore server zone (we left it for a nested scene like CV)
      this._network?.setZone(this._zone);
      // Restore POI hint if still in zone
      if (this._activePoi) {
        const isTouch = this.sys.game.device.input.touch;
        const hint = (isTouch && this._activePoi.textMobile) ? this._activePoi.textMobile : this._activePoi.text;
        phaserEvents.emit(PhaserEvent.POI_ACTION_ENTER);
        phaserEvents.emit(PhaserEvent.POI_ENTER, hint);
      }
      this.cameras.main.fadeIn(400, 0, 0, 0);
    });

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this._components.destroy();
      phaserEvents.off(PhaserEvent.MOBILE_INTERACT, this._onMobileInteractPoi);
      if (this._activePoi) phaserEvents.emit(PhaserEvent.POI_ACTION_LEAVE);
      // Always clean up global listeners on shutdown regardless of how the scene exits
      this._dialogueInput?.unregister();
      this._dialogueManager.leaveZone();
    });
    this.events.on(Phaser.Scenes.Events.POST_UPDATE, (_time: number, delta: number) => this._components.update(delta));

    // PlayerManager — shows other players in the same interior zone
    this._playerManager = new PlayerManager(this, () => this._network.sessionId, {
      isInCurrentZone: (zone) => zone === this._zone,
      onOtherPlayerCreated: (player) => {
        this._components.addComponent(player, new UiBarComponent());
      },
    });

    this._onJoin   = (p: IPlayer, id: string) => this._playerManager.handleJoin(p, id);
    this._onLeave  = (id: string) => this._playerManager.handleLeave(id);

    // Handle zone changes: create sprite when entering, remove when leaving
    this._onUpdate = (field: string, value: string | number | boolean, id: string) => {
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

    this._network.onPlayerJoin(this._onJoin);
    this._network.onPlayerUpdated(this._onUpdate);
    this._network.onPlayerLeft(this._onLeave);
    this._network.onArrowJoin(this._onArrowJoin);
    this._network.onArrowUpdated(this._onArrowUpdated);
    this._network.onArrowLeft(this._onArrowLeft);

    this._dialogueInput = new DialogueInputHandler(
      this._dialogueManager,
      (action) => this._handleAction(action),
      () => this._exit(),
    );
    this._dialogueInput.register(this);

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

      renderCollisionDebug(this, layer, layerConfig.name, CLIENT_CONFIG.DEBUG_LAYER);
    });

    // @ts-ignore (PhaserAnimatedTiles types not defined)
    this.animatedTiles.init(map);

    // --- Spawn + return points from "info" layer ---
    const infoLayer = map.getObjectLayer("info");
    const startObj  = infoLayer?.objects.find((o) => o.name === "start");
    const spawnX = startObj?.x ?? config.playerSpawn.x;
    const spawnY = startObj?.y ?? config.playerSpawn.y;

    this._returnPoints = (infoLayer?.objects ?? [])
      .filter((o) => o.name === "return")
      .map((o) => ({ x: o.x as number, y: o.y as number }));

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

    // --- PNJs & POI zones ---
    this._pnjCooldown = false;
    this._interactivePnjs = config.pnjs ? spawnInteractivePnjs(this, map, config.pnjs) : [];
    this._poiZones = config.poiZones ? loadPoiZones(map, config.poiZones) : [];
    renderDebugZones(this, this._interactivePnjs, RETURN_INTERACTION_RADIUS, [], this._poiZones);

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

    // TODO: make a global function for any scenes that need to block input during dialogue, to avoid repeating this pattern
    // Block inputs while dialogue is open
    const inputs = this._dialogueManager.isOpen()
      ? { left: false, right: false, up: false, down: false, space: false, sprint: false }
      : this._player.handleInput();
    this._network.updatePlayer(inputs);

    // Lerp players from server state
    this._playerManager.updateMyPlayer();
    this._playerManager.updateOtherPlayers();

    // POI zones proximity check first — takes priority over PNJ zones
    let nearestPoi: PoiZone | null = null;
    for (const zone of this._poiZones) {
      const dist = Phaser.Math.Distance.Between(this._player.x, this._player.y, zone.x, zone.y);
      if (dist <= zone.radius) { nearestPoi = zone; break; }
    }
    if (nearestPoi !== this._activePoi) {
      this._activePoi = nearestPoi;
      if (nearestPoi) {
        const isTouch = this.sys.game.device.input.touch;
        const hint = (isTouch && nearestPoi.textMobile) ? nearestPoi.textMobile : nearestPoi.text;
        phaserEvents.emit(PhaserEvent.POI_ACTION_ENTER);
        phaserEvents.emit(PhaserEvent.POI_ENTER, hint);
      } else {
        phaserEvents.emit(PhaserEvent.POI_ACTION_LEAVE);
        phaserEvents.emit(PhaserEvent.POI_LEAVE);
      }
    }

    // PNJ proximity check (skipped when in a POI zone to avoid MOBILE_INTERACT conflict)
    let nearestPnj: InteractivePnj | null = null;
    for (const pnj of this._interactivePnjs) {
      const dist = Phaser.Math.Distance.Between(this._player.x, this._player.y, pnj.sprite.x, pnj.sprite.y);
      const inZone = !this._pnjCooldown && !nearestPoi && dist <= RETURN_INTERACTION_RADIUS;
      pnj.bubble.setVisible(inZone);
      if (inZone) nearestPnj = pnj;
    }

    // Return-point proximity check — auto-open dialogue on enter, close on leave
    const inReturnZone = this._returnPoints.some((pt) =>
      Phaser.Math.Distance.Between(this._player.x, this._player.y, pt.x, pt.y) <= RETURN_INTERACTION_RADIUS
    );
    if (inReturnZone && !this._inReturnZone) {
      this._inReturnZone = true;
      this._dialogueManager.enterZone(RETURN_DIALOGUE_ID);
      this._dialogueManager.open();
    } else if (!inReturnZone && this._inReturnZone) {
      this._inReturnZone = false;
      this._dialogueManager.leaveZone();
    }

    // PNJ zone takes priority; return-point manages its own state
    if (nearestPnj) {
      this._dialogueManager.enterZone(nearestPnj.dialogueId);
    } else if (!inReturnZone) {
      this._dialogueManager.leaveZone();
    }
  }

  private _handleAction(action: string) {
    if (action === "exit_interior") this._exit();
    if (action.startsWith("open_project:")) {
      const project = getProject(action.split(":")[1]);
      if (!project) return;
      phaserEvents.emit(PhaserEvent.PROJECT_OPEN, project.id);
    }
  }

  private _exiting = false;

  private _exit() {
    if (this._exiting) return;
    this._exiting = true;

    // Reset dialogue state + remove global listeners before returning to Road
    this._dialogueManager.leaveZone();
    this._dialogueInput.unregister();

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
