export const SERVER_CONFIG = {
  debug: false,
  latency: 0,
  enemyInitialCount: 3,
  enemySpawnChance: 0.7,
  enemySpawnRadius: 150, // px around player spawn point
  loseAggroDelay: 3000, // ms out of aggro radius before enemy stops following

  room: {
    // Max simultaneous players per room. Once reached, Colyseus'
    // `joinOrCreate` automatically spins up a new room instead of
    // overloading this one (see https://docs.colyseus.io/server/room/#maxclients-number).
    maxClients: 5,
    // Max lifetime of a room, in days. Past this, the room is gracefully
    // disconnected/disposed so a fresh one is created for future players —
    // keeps long-lived state (players, enemies, coins...) from growing
    // unbounded on a room that never naturally empties out.
    maxLifetimeDays: 3,
    // How often (ms) to check whether a room exceeded its max lifetime.
    lifetimeCheckIntervalMs: 60 * 60 * 1000, // 1 hour
  },
};
