import Phaser from "phaser";

// Network
import Network, { Network as NetworkType } from "services/Network";

// Others
import CLIENT_CONFIG, { type AtlasAsset, type ImageAsset } from "client.config";
import { SCENES } from "./scene.config";

export class BootScene extends Phaser.Scene {
  private preloadComplete = false;
  private _pendingLaunch = false;
  private _preloadResolve?: () => void;
  private _loadErrors: string[] = [];
  network!: NetworkType;

  constructor() {
    super(SCENES.BOOT);
    this.init();
  }

  preload() {
    this.loadAssets();
    console.log("Preload boot scene ...");
  }

  create() {}

  private init() {
    this.network = Network;
  }

  private loadImage(cfg: ImageAsset) {
    this.load.image(cfg.NAME, cfg.PATH);
  }

  private loadAtlas(cfg: AtlasAsset) {
    this.load.atlas(cfg.NAME, cfg.SPRITE_SHEET_TEXTURE_PATH, cfg.SPRITE_SHEET_ATLAS_PATH);
  }

  loadAssets() {
    // Track any asset that fails to load — on Android Chrome this can happen
    // silently (timeout, WebGL texture limit, cold server) and causes a blank map.
    this.load.on("loaderror", (file: Phaser.Loader.File) => {
      console.error(`[Boot] Asset load error: ${file.key} (${file.url})`);
      this._loadErrors.push(file.key);
    });

    // Background
    this.loadImage(CLIENT_CONFIG.BACKGROUND.BACKDROP);
    this.loadAtlas(CLIENT_CONFIG.BACKGROUND.CLOUD);

    // Items
    this.loadImage(CLIENT_CONFIG.ITEMS.HEART);
    this.loadImage(CLIENT_CONFIG.ITEMS.HEART_FILLED);
    this.loadImage(CLIENT_CONFIG.ITEMS.POTION);
    this.loadAtlas(CLIENT_CONFIG.ITEMS.BLUE_COIN);

    // Tilesets
    Object.values(CLIENT_CONFIG.MAP.TILE_SETS).forEach((ts) => this.loadImage(ts));

    // Tilemap
    this.load.tilemapTiledJSON(CLIENT_CONFIG.MAP.TILE_MAP.NAME, CLIENT_CONFIG.MAP.TILE_MAP.PAHT);

    // Characters
    this.loadAtlas(CLIENT_CONFIG.CHARACTERS);
    const { SLIME, ROBOT, DINO, TIMOTHEE, GHOST, WENDY, JOHN } = CLIENT_CONFIG.CHARACTERS;
    [SLIME, ROBOT, DINO, TIMOTHEE, GHOST, WENDY, JOHN].forEach((c) => this.loadAtlas(c));

    this.load.on("complete", () => {
      if (this._loadErrors.length > 0) {
        console.warn(`[Boot] ${this._loadErrors.length} asset(s) failed: [${this._loadErrors.join(", ")}] — retrying…`);
        // Re-queue only the failed files and try once more
        this._loadErrors.forEach((key) => this._reloadByKey(key));
        this._loadErrors = [];
        this.load.once("complete", () => {
          if (this._loadErrors.length > 0) {
            console.error("[Boot] Retry failed for:", this._loadErrors.join(", "), "— launching anyway.");
          }
          this._onPreloadDone();
        });
        this.load.start();
        return;
      }
      this._onPreloadDone();
    });
  }

  /**
   * Re-queue a failed asset by its cache key.
   * Phaser's loader tracks by key so we re-add the original load call.
   */
  private _reloadByKey(key: string) {
    const { MAP, CHARACTERS, BACKGROUND, ITEMS } = CLIENT_CONFIG;

    const images: ImageAsset[] = [
      ...Object.values(MAP.TILE_SETS),
      BACKGROUND.BACKDROP,
      ITEMS.HEART,
      ITEMS.HEART_FILLED,
      ITEMS.POTION,
    ];
    const img = images.find((a) => a.NAME === key);
    if (img) { this.loadImage(img); return; }

    if (key === MAP.TILE_MAP.NAME) {
      this.load.tilemapTiledJSON(MAP.TILE_MAP.NAME, MAP.TILE_MAP.PAHT); return;
    }

    const { SLIME, ROBOT, DINO, TIMOTHEE, GHOST, WENDY, JOHN } = CHARACTERS;
    const atlases: AtlasAsset[] = [
      CHARACTERS, SLIME, ROBOT, DINO, TIMOTHEE, GHOST, WENDY, JOHN,
      BACKGROUND.CLOUD,
      ITEMS.BLUE_COIN,
    ];
    const atlas = atlases.find((a) => a.NAME === key);
    if (atlas) { this.loadAtlas(atlas); return; }

    console.warn(`[Boot] _reloadByKey: unknown key "${key}", cannot retry.`);
  }

  /** Resolves when all assets are loaded. Instant if already done. */
  waitForPreload(): Promise<void> {
    if (this.preloadComplete) return Promise.resolve();
    return new Promise((resolve) => { this._preloadResolve = resolve; });
  }

  private _onPreloadDone() {
    this.preloadComplete = true;
    this._preloadResolve?.();
    this._preloadResolve = undefined;
    if (this._pendingLaunch) {
      this.scene.start(SCENES.GAME, { network: this.network });
    } else {
      this.scene.start(SCENES.BACKGROUND);
    }
  }

  launchGame() {
    if (!this.preloadComplete) {
      this._pendingLaunch = true;
      return;
    }
    this.scene.start(SCENES.GAME, { network: this.network });
  }
}
