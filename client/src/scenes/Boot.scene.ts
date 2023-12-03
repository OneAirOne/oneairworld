import Phaser from "phaser";

// Network
import Network, { Network as NetworkType } from "services/Network";

// Others
import CLIENT_CONFIG from "client.config";
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
      CLIENT_CONFIG.MAP.TILESETS.MODERN_CITY.NAME,
      CLIENT_CONFIG.MAP.TILESETS.MODERN_CITY.PATH
    );
    this.load.image(
      CLIENT_CONFIG.MAP.TILESETS.CITY_JAP.NAME,
      CLIENT_CONFIG.MAP.TILESETS.CITY_JAP.PATH
    );
    this.load.image(
      CLIENT_CONFIG.MAP.TILESETS.ARCADE.NAME,
      CLIENT_CONFIG.MAP.TILESETS.ARCADE.PATH
    );
    this.load.image(
      CLIENT_CONFIG.MAP.TILESETS.INTERIOR_JAP.NAME,
      CLIENT_CONFIG.MAP.TILESETS.INTERIOR_JAP.PATH
    );

    // Load Tilemap
    this.load.tilemapTiledJSON(
      CLIENT_CONFIG.MAP.TILEMAP.NAME,
      CLIENT_CONFIG.MAP.TILEMAP.PAHT
    );

    // Load characteres sprite-sheets
    this.load.atlas(
      CLIENT_CONFIG.CHARACTERS.NAME,
      CLIENT_CONFIG.CHARACTERS.SPRITE_SHEET_TEXTURE_PATH,
      CLIENT_CONFIG.CHARACTERS.SPRITE_SHEET_ATLAS_PATH
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
