import Phaser from "phaser";

export const phaserEvents = new Phaser.Events.EventEmitter();

export enum PhaserEvent {
  MY_PLAYER_JOINED = "my-player-joined",
  PLAYER_JOINED = "player-joined",
  PLAYER_UPDATED = "player-updated",
  PLAYER_LEFT = "player-left",
  PLAYER_DISCONNECTED = "player-disconnected",
  ENEMY_JOINED = "enemy-joined",
  ENEMY_UPDATED = "enemy-updated",
  ENEMY_LEFT = "enemy-left",
  ARROW_JOINED = "arrow-joined",// TODO: merge with PLAYER_JOINED?
  ARROW_UPDATED = "arrow-updated",
  ARROW_LEFT = "arrow-left",
  // Dialogue
  DIALOGUE_ZONE_ENTER = "dialogue-zone-enter",
  DIALOGUE_ZONE_LEAVE = "dialogue-zone-leave",
  DIALOGUE_OPEN = "dialogue-open",
  DIALOGUE_UPDATE = "dialogue-update",
  DIALOGUE_NAVIGATE = "dialogue-navigate",
  DIALOGUE_ACTION = "dialogue-action",
  DIALOGUE_CLOSE = "dialogue-close",
  // Point of interest (proximity text, no action)
  POI_ENTER = "poi-enter",
  POI_LEAVE = "poi-leave",
  // Point of interest with direct action (no dialogue)
  POI_ACTION_ENTER = "poi-action-enter",
  POI_ACTION_LEAVE = "poi-action-leave",
  // URL to open on next user gesture (mobile)
  URL_PENDING = "url-pending",
  // Coins
  COIN_JOINED = "coin-joined",
  COIN_LEFT = "coin-left",
  COIN_COLLECTED = "coin-collected",
  // Potions
  POTION_JOINED = "potion-joined",
  POTION_LEFT = "potion-left",
  SPEED_BOOST_START = "speed-boost-start",
  SPEED_BOOST_END = "speed-boost-end",
  // Kill counter
  SLIME_KILLED = "slime-killed",
  // CV popup
  CV_POPUP_OPEN = "cv-popup-open",
  CV_POPUP_CLOSE = "cv-popup-close",
  // Game over
  GAME_OVER = "game-over",
  GAME_OVER_RESTART = "game-over-restart",
  // Project overlay
  PROJECT_OPEN = "project-open",
  PROJECT_CLOSE = "project-close",
  // Interior transitions
  ENTER_INTERIOR = "enter-interior",
  // Mobile touch actions (mirror keyboard shortcuts)
  MOBILE_INTERACT = "mobile-interact",
  MOBILE_NAV_UP = "mobile-nav-up",
  MOBILE_NAV_DOWN = "mobile-nav-down",
  MOBILE_CLOSE = "mobile-close",
}
