import Phaser from "phaser";

// declare module "phaser-animated-tiles" {
//   export interface Tilemap extends Phaser.Tilemaps.Tilemap {
//     createDynamicLayer: any;
//     animatedTiles: any;
//   }
//   type createDynamicLayer = any;

//   const plugin: any;

//   export default plugin;
// }
declare module "phaser-animated-tiles/src/plugin/main" {
  export interface Tilemap extends Phaser.Tilemaps.Tilemap {
    createDynamicLayer: any;
    animatedTiles: any;
  }
  type createDynamicLayer = any;

  const plugin: any;

  export default plugin;
}
