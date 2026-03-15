import CLIENT_CONFIG from "client.config";

export interface TilesetConfig {
  name: string;
  path: string;
}

export interface MapConfig {
  mapKey: string;
  mapPath: string;
  tilesets: TilesetConfig[];
}

export const ROAD_MAP_CONFIG: MapConfig = {
  mapKey: CLIENT_CONFIG.MAP.TILE_MAP.NAME,
  mapPath: CLIENT_CONFIG.MAP.TILE_MAP.PAHT,
  tilesets: [
    { name: CLIENT_CONFIG.MAP.TILE_SETS.LOGOS.NAME,        path: CLIENT_CONFIG.MAP.TILE_SETS.LOGOS.PATH        },
    { name: CLIENT_CONFIG.MAP.TILE_SETS.MODERN_CITY.NAME,  path: CLIENT_CONFIG.MAP.TILE_SETS.MODERN_CITY.PATH  },
    { name: CLIENT_CONFIG.MAP.TILE_SETS.CITY_JAP.NAME,     path: CLIENT_CONFIG.MAP.TILE_SETS.CITY_JAP.PATH     },
    { name: CLIENT_CONFIG.MAP.TILE_SETS.INTERIOR_JAP.NAME, path: CLIENT_CONFIG.MAP.TILE_SETS.INTERIOR_JAP.PATH },
    { name: CLIENT_CONFIG.MAP.TILE_SETS.RURAL_JAP.NAME,    path: CLIENT_CONFIG.MAP.TILE_SETS.RURAL_JAP.PATH    },
    { name: CLIENT_CONFIG.MAP.TILE_SETS.TEST.NAME,         path: CLIENT_CONFIG.MAP.TILE_SETS.TEST.PATH         },
  ],
};
