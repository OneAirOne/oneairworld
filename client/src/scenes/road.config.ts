import CLIENT_CONFIG from "client.config";
import type { PoiZoneConfig } from "./game.helpers";

export enum TiledLayer {
  INFO                 = "info",
  SPAWN                = "spawn",
  ABOVE                = "above",
  COLLIDE_ABOVE_PLAYER = "collide_above_player",
  COLLIDE_UNDER_PLAYER = "collide_under_player",
  STUFF_ABOVE_PLAYER   = "stuff_above_player",
  STUFF_UNDER_PLAYER   = "stuff_under_player",
  BEHIND_STUFF         = "behind_stuff",
  ANIMATED             = "animated",
  ANIMATED_UNDER_PLAYER = "animated_under_player",
  BEHIND               = "behind",
  GROUND               = "ground",
}

export enum TiledObjectType {
  START = "start",
}

export interface TilesetConfig {
  name: string;
  path: string;
}

export interface MapConfig {
  mapKey: string;
  mapPath: string;
  tilesets: TilesetConfig[];
}

export interface LayerConfig {
  name: TiledLayer;
  depth?: number;
}

export const ROAD_SCENE_LAYERS: LayerConfig[] = [
  { name: TiledLayer.BEHIND },
  { name: TiledLayer.GROUND },
  { name: TiledLayer.BEHIND_STUFF,         depth: 1 },
  { name: TiledLayer.STUFF_UNDER_PLAYER },
  { name: TiledLayer.COLLIDE_UNDER_PLAYER },
  { name: TiledLayer.STUFF_ABOVE_PLAYER,   depth: 1 },
  { name: TiledLayer.COLLIDE_ABOVE_PLAYER, depth: 2 },
  { name: TiledLayer.ABOVE,                depth: 3 },
  { name: TiledLayer.ANIMATED,             depth: 10 },
];

export const ROAD_POI_ZONES: PoiZoneConfig[] = [
  {
    spawnPoint: "maisonErwan",
    text: "Appuyer sur Entrée pour voir le CV d'Erwan",
    textMobile: "Appuyer sur l'icône 💬 pour voir le CV d'Erwan",
    action: "open_cv",
    radius: 30,
  },
  {
    spawnPoint: "linkLinkedin",
    text: "Appuyer sur Entrée pour ouvrir le LinkedIn d'Erwan",
    textMobile: "Appuyer sur l'icône 💬 pour ouvrir le LinkedIn d'Erwan",
    action: "open_linkedin",
    radius: 50,
  },
  {
    spawnPoint: "linkGithub",
    text: "Appuyer sur Entrée pour ouvrir le GitHub d'Erwan",
    textMobile: "Appuyer sur l'icône 💬 pour ouvrir le GitHub d'Erwan",
    action: "open_github",
    radius: 30,
  },
  {
    spawnPoint: "samuraiBall",
    text: "Cette affiche est celle d'un jeu développé par Erwan avec un ami — rends-toi à la salle d'arcade pour en savoir plus !",
    radius: 40,
  },
  {
    spawnPoint: "isComming",
    text: "Rien à voir ici pour le moment… mais ça ne devrait pas tarder à changer !",
    radius: 40,
  },
  {
    spawnPoint: "notHere",
    text: "Je crois que je suis en train de m'égarer... Je devrais peut-être aller voir cette salle d'arcade.",
    radius: 30,
  },
  {
    spawnPoint: "doorClose",
    text: "Ça m'a l'air fermé...",
    radius: 30,
  },
  {
    spawnPoint: "tooLow",
    text: "Il n'y a rien d'intéressant à voir en bas.",
    radius: 30,
  },
];

export const ROAD_MAP_CONFIG: MapConfig = {
  mapKey: CLIENT_CONFIG.MAP.TILE_MAP.NAME,
  mapPath: CLIENT_CONFIG.MAP.TILE_MAP.PAHT,
  tilesets: [
    { name: CLIENT_CONFIG.MAP.TILE_SETS.LOGOS.NAME,        path: CLIENT_CONFIG.MAP.TILE_SETS.LOGOS.PATH        },
    { name: CLIENT_CONFIG.MAP.TILE_SETS.MODERN_CITY.NAME,  path: CLIENT_CONFIG.MAP.TILE_SETS.MODERN_CITY.PATH  },
    { name: CLIENT_CONFIG.MAP.TILE_SETS.CITY_JAP.NAME,     path: CLIENT_CONFIG.MAP.TILE_SETS.CITY_JAP.PATH     },
    { name: CLIENT_CONFIG.MAP.TILE_SETS.INTERIOR_JAP.NAME, path: CLIENT_CONFIG.MAP.TILE_SETS.INTERIOR_JAP.PATH },
    { name: CLIENT_CONFIG.MAP.TILE_SETS.RURAL_JAP.NAME,    path: CLIENT_CONFIG.MAP.TILE_SETS.RURAL_JAP.PATH    },
    { name: CLIENT_CONFIG.MAP.TILE_SETS.ARCADE.NAME,       path: CLIENT_CONFIG.MAP.TILE_SETS.ARCADE.PATH       },
    { name: CLIENT_CONFIG.MAP.TILE_SETS.OSAKA.NAME,        path: CLIENT_CONFIG.MAP.TILE_SETS.OSAKA.PATH        },
    { name: CLIENT_CONFIG.MAP.TILE_SETS.PUNK.NAME,         path: CLIENT_CONFIG.MAP.TILE_SETS.PUNK.PATH         },
  ],
};
