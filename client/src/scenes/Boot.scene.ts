import Phaser from "phaser";

// Network
import Network, { Network as NetworkType } from "services/Network";

// Others
import CLIENT_CONFIG from "client.config";
import { SCENES } from "./scene.config";

export class BootScene extends Phaser.Scene {
  private preloadComplete = false;
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

  loadAssets() {
    // Track any asset that fails to load — on Android Chrome this can happen
    // silently (timeout, WebGL texture limit, cold server) and causes a blank map.
    this.load.on("loaderror", (file: Phaser.Loader.File) => {
      console.error(`[Boot] Asset load error: ${file.key} (${file.url})`);
      this._loadErrors.push(file.key);
    });
    // Load Background
    this.load.image(
      CLIENT_CONFIG.BACKGROUND.BACKDROP.NAME,
      CLIENT_CONFIG.BACKGROUND.BACKDROP.PATH
    );
    this.load.atlas(
      CLIENT_CONFIG.BACKGROUND.CLOUD.NAME,
      CLIENT_CONFIG.BACKGROUND.CLOUD.SPRITE_SHEET_TEXTURE_PATH,
      CLIENT_CONFIG.BACKGROUND.CLOUD.SPRITE_SHEET_ATLAS_PATH
    );

    // Load Items
    this.load.image(
      CLIENT_CONFIG.ITEMS.HEART.NAME,
      CLIENT_CONFIG.ITEMS.HEART.PATH
    );
    this.load.image(
      CLIENT_CONFIG.ITEMS.HEART_FILLED.NAME,
      CLIENT_CONFIG.ITEMS.HEART_FILLED.PATH
    );

    // Load Tileset
    this.load.image(
      CLIENT_CONFIG.MAP.TILE_SETS.LOGOS.NAME,
      CLIENT_CONFIG.MAP.TILE_SETS.LOGOS.PATH
    );
    this.load.image(
      CLIENT_CONFIG.MAP.TILE_SETS.MODERN_CITY.NAME,
      CLIENT_CONFIG.MAP.TILE_SETS.MODERN_CITY.PATH
    );
    this.load.image(
      CLIENT_CONFIG.MAP.TILE_SETS.CITY_JAP.NAME,
      CLIENT_CONFIG.MAP.TILE_SETS.CITY_JAP.PATH
    );
    this.load.image(
      CLIENT_CONFIG.MAP.TILE_SETS.INTERIOR_JAP.NAME,
      CLIENT_CONFIG.MAP.TILE_SETS.INTERIOR_JAP.PATH
    );
    this.load.image(
      CLIENT_CONFIG.MAP.TILE_SETS.RURAL_JAP.NAME,
      CLIENT_CONFIG.MAP.TILE_SETS.RURAL_JAP.PATH
    );
    this.load.image(
      CLIENT_CONFIG.MAP.TILE_SETS.ARCADE.NAME,
      CLIENT_CONFIG.MAP.TILE_SETS.ARCADE.PATH
    );
    this.load.image(
      CLIENT_CONFIG.MAP.TILE_SETS.OSAKA.NAME,
      CLIENT_CONFIG.MAP.TILE_SETS.OSAKA.PATH
    );
    this.load.image(
      CLIENT_CONFIG.MAP.TILE_SETS.PUNK.NAME,
      CLIENT_CONFIG.MAP.TILE_SETS.PUNK.PATH
    );

    // Load Tilemap
    this.load.tilemapTiledJSON(
      CLIENT_CONFIG.MAP.TILE_MAP.NAME,
      CLIENT_CONFIG.MAP.TILE_MAP.PAHT
    );

    // Load characteres sprite-sheets
    this.load.atlas(
      CLIENT_CONFIG.CHARACTERS.NAME,
      CLIENT_CONFIG.CHARACTERS.SPRITE_SHEET_TEXTURE_PATH,
      CLIENT_CONFIG.CHARACTERS.SPRITE_SHEET_ATLAS_PATH
    );

    this.load.atlas(
      CLIENT_CONFIG.CHARACTERS.SLIME.NAME,
      CLIENT_CONFIG.CHARACTERS.SLIME.SPRITE_SHEET_TEXTURE_PATH,
      CLIENT_CONFIG.CHARACTERS.SLIME.SPRITE_SHEET_ATLAS_PATH
    );

    this.load.atlas(
      CLIENT_CONFIG.CHARACTERS.WIZARD.NAME,
      CLIENT_CONFIG.CHARACTERS.WIZARD.SPRITE_SHEET_TEXTURE_PATH,
      CLIENT_CONFIG.CHARACTERS.WIZARD.SPRITE_SHEET_ATLAS_PATH
    );

    this.load.atlas(
      CLIENT_CONFIG.CHARACTERS.ROBOT.NAME,
      CLIENT_CONFIG.CHARACTERS.ROBOT.SPRITE_SHEET_TEXTURE_PATH,
      CLIENT_CONFIG.CHARACTERS.ROBOT.SPRITE_SHEET_ATLAS_PATH
    );

    this.load.atlas(
      CLIENT_CONFIG.CHARACTERS.DINO.NAME,
      CLIENT_CONFIG.CHARACTERS.DINO.SPRITE_SHEET_TEXTURE_PATH,
      CLIENT_CONFIG.CHARACTERS.DINO.SPRITE_SHEET_ATLAS_PATH
    );

    this.load.atlas(
      CLIENT_CONFIG.CHARACTERS.TIMOTHEE.NAME,
      CLIENT_CONFIG.CHARACTERS.TIMOTHEE.SPRITE_SHEET_TEXTURE_PATH,
      CLIENT_CONFIG.CHARACTERS.TIMOTHEE.SPRITE_SHEET_ATLAS_PATH
    );

    this.load.atlas(
      CLIENT_CONFIG.CHARACTERS.GHOST.NAME,
      CLIENT_CONFIG.CHARACTERS.GHOST.SPRITE_SHEET_TEXTURE_PATH,
      CLIENT_CONFIG.CHARACTERS.GHOST.SPRITE_SHEET_ATLAS_PATH
    );

    this.load.atlas(
      CLIENT_CONFIG.CHARACTERS.WENDY.NAME,
      CLIENT_CONFIG.CHARACTERS.WENDY.SPRITE_SHEET_TEXTURE_PATH,
      CLIENT_CONFIG.CHARACTERS.WENDY.SPRITE_SHEET_ATLAS_PATH
    );

    this.load.atlas(
      CLIENT_CONFIG.CHARACTERS.JOHN.NAME,
      CLIENT_CONFIG.CHARACTERS.JOHN.SPRITE_SHEET_TEXTURE_PATH,
      CLIENT_CONFIG.CHARACTERS.JOHN.SPRITE_SHEET_ATLAS_PATH
    );

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
          this.preloadComplete = true;
          this.launchBackground();
        });
        this.load.start();
        return;
      }
      this.preloadComplete = true;
      this.launchBackground();
    });
  }

  /**
   * Re-queue a failed asset by its cache key.
   * Phaser's loader tracks by key so we re-add the original load call.
   */
  private _reloadByKey(key: string) {
    const { MAP, CHARACTERS } = CLIENT_CONFIG;
    const tilesets = [
      MAP.TILE_SETS.LOGOS, MAP.TILE_SETS.MODERN_CITY, MAP.TILE_SETS.CITY_JAP,
      MAP.TILE_SETS.INTERIOR_JAP, MAP.TILE_SETS.RURAL_JAP, MAP.TILE_SETS.ARCADE,
      MAP.TILE_SETS.OSAKA, MAP.TILE_SETS.PUNK,
    ];
    const ts = tilesets.find((t) => t.NAME === key);
    if (ts) { this.load.image(ts.NAME, ts.PATH); return; }

    if (key === MAP.TILE_MAP.NAME) {
      this.load.tilemapTiledJSON(MAP.TILE_MAP.NAME, MAP.TILE_MAP.PAHT); return;
    }

    const atlases = [
      [CHARACTERS.NAME,              CHARACTERS.SPRITE_SHEET_TEXTURE_PATH,          CHARACTERS.SPRITE_SHEET_ATLAS_PATH],
      [CHARACTERS.SLIME.NAME,        CHARACTERS.SLIME.SPRITE_SHEET_TEXTURE_PATH,    CHARACTERS.SLIME.SPRITE_SHEET_ATLAS_PATH],
      [CHARACTERS.WIZARD.NAME,       CHARACTERS.WIZARD.SPRITE_SHEET_TEXTURE_PATH,   CHARACTERS.WIZARD.SPRITE_SHEET_ATLAS_PATH],
      [CHARACTERS.ROBOT.NAME,        CHARACTERS.ROBOT.SPRITE_SHEET_TEXTURE_PATH,    CHARACTERS.ROBOT.SPRITE_SHEET_ATLAS_PATH],
      [CHARACTERS.DINO.NAME,         CHARACTERS.DINO.SPRITE_SHEET_TEXTURE_PATH,     CHARACTERS.DINO.SPRITE_SHEET_ATLAS_PATH],
      [CHARACTERS.TIMOTHEE.NAME,     CHARACTERS.TIMOTHEE.SPRITE_SHEET_TEXTURE_PATH, CHARACTERS.TIMOTHEE.SPRITE_SHEET_ATLAS_PATH],
      [CHARACTERS.GHOST.NAME,        CHARACTERS.GHOST.SPRITE_SHEET_TEXTURE_PATH,    CHARACTERS.GHOST.SPRITE_SHEET_ATLAS_PATH],
      [CHARACTERS.WENDY.NAME,        CHARACTERS.WENDY.SPRITE_SHEET_TEXTURE_PATH,    CHARACTERS.WENDY.SPRITE_SHEET_ATLAS_PATH],
      [CHARACTERS.JOHN.NAME,         CHARACTERS.JOHN.SPRITE_SHEET_TEXTURE_PATH,     CHARACTERS.JOHN.SPRITE_SHEET_ATLAS_PATH],
      [CLIENT_CONFIG.BACKGROUND.CLOUD.NAME, CLIENT_CONFIG.BACKGROUND.CLOUD.SPRITE_SHEET_TEXTURE_PATH, CLIENT_CONFIG.BACKGROUND.CLOUD.SPRITE_SHEET_ATLAS_PATH],
    ] as const;
    const atlas = atlases.find(([name]) => name === key);
    if (atlas) { this.load.atlas(atlas[0], atlas[1], atlas[2]); return; }

    console.warn(`[Boot] _reloadByKey: unknown key "${key}", cannot retry.`);
  }

  private launchBackground() {
    this.scene.start(SCENES.BACKGROUND);
  }

  launchGame() {
    if (!this.preloadComplete) return;

    this.scene.start(SCENES.GAME, {
      network: this.network,
    });
  }
}
