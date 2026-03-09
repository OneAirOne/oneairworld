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
  // Dialogue
  DIALOGUE_ZONE_ENTER = "dialogue-zone-enter",
  DIALOGUE_ZONE_LEAVE = "dialogue-zone-leave",
  DIALOGUE_OPEN = "dialogue-open",
  DIALOGUE_UPDATE = "dialogue-update",
  DIALOGUE_NAVIGATE = "dialogue-navigate",
  DIALOGUE_ACTION = "dialogue-action",
  DIALOGUE_CLOSE = "dialogue-close",
}
