import Phaser from "phaser";

// Network
import Network, { Network as NetworkType } from "services/Network";

// Others
import GAME_CONFIG from "client.config";
import { SCENES } from "./scene.config";

export class BootScene extends Phaser.Scene {
  private preloadComplete = false;
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
    // Load Background
    this.load.image(
      GAME_CONFIG.BACKGROUND.BACKDROP.NAME,
      GAME_CONFIG.BACKGROUND.BACKDROP.PATH
    );
    this.load.atlas(
      GAME_CONFIG.BACKGROUND.CLOUD.NAME,
      GAME_CONFIG.BACKGROUND.CLOUD.SPRITE_SHEET_TEXTURE_PATH,
      GAME_CONFIG.BACKGROUND.CLOUD.SPRITE_SHEET_ATLAS_PATH
    );

    // Load Items
    this.load.image(GAME_CONFIG.ITEMS.HEART.NAME, GAME_CONFIG.ITEMS.HEART.PATH);
    this.load.image(
      GAME_CONFIG.ITEMS.HEART_FILLED.NAME,
      GAME_CONFIG.ITEMS.HEART_FILLED.PATH
    );

    // Load Tileset
    this.load.image(
      GAME_CONFIG.MAP.TILESETS.MODERN_CITY.NAME,
      GAME_CONFIG.MAP.TILESETS.MODERN_CITY.PATH
    );
    this.load.image(
      GAME_CONFIG.MAP.TILESETS.CITY_JAP.NAME,
      GAME_CONFIG.MAP.TILESETS.CITY_JAP.PATH
    );

    // Load Tilemap
    this.load.tilemapTiledJSON(
      GAME_CONFIG.MAP.TILEMAP.NAME,
      GAME_CONFIG.MAP.TILEMAP.PAHT
    );

    // Load characteres sprite-sheets
    this.load.atlas(
      GAME_CONFIG.CHARACTERS.NAME,
      GAME_CONFIG.CHARACTERS.SPRITE_SHEET_TEXTURE_PATH,
      GAME_CONFIG.CHARACTERS.SPRITE_SHEET_ATLAS_PATH
    );

    this.load.on("complete", () => {
      this.preloadComplete = true;
      this.launchBackground();
    });
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
