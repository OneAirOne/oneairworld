import Matter from "matter-js";

import { COLLISION_CATEGORY } from "../engine.config";
import { SHARED_CONFIG } from "../../../../shared/shared.config";

const WALL_CONFIG = {
  isStatic: true,
  collisionFilter: {
    category: COLLISION_CATEGORY.WALL,
  },
};

export function createWall(world: Matter.World) {
  const walls = [
    // Top wall
    Matter.Bodies.rectangle(
      SHARED_CONFIG.WORLD_WIDTH / 2,
      0,
      SHARED_CONFIG.WORLD_WIDTH,
      SHARED_CONFIG.WORLD_WALL_SIZE,
      {
        ...WALL_CONFIG,
        label: "wall-top",
      }
    ),
    // Bottom wall
    Matter.Bodies.rectangle(
      SHARED_CONFIG.WORLD_WIDTH / 2,
      SHARED_CONFIG.WORLD_HEIGHT,
      SHARED_CONFIG.WORLD_WIDTH,
      SHARED_CONFIG.WORLD_WALL_SIZE,
      { ...WALL_CONFIG, label: "wall-bottom" }
    ),
    // Right wall
    Matter.Bodies.rectangle(
      SHARED_CONFIG.WORLD_WIDTH,
      SHARED_CONFIG.WORLD_HEIGHT / 2,
      SHARED_CONFIG.WORLD_WALL_SIZE,
      SHARED_CONFIG.WORLD_HEIGHT,
      { ...WALL_CONFIG, label: "wall-right" }
    ),
    // Left wall
    Matter.Bodies.rectangle(
      0,
      SHARED_CONFIG.WORLD_HEIGHT / 2,
      SHARED_CONFIG.WORLD_WALL_SIZE,
      SHARED_CONFIG.WORLD_HEIGHT,
      { ...WALL_CONFIG, label: "wall-left" }
    ),
  ];

  Matter.World.add(world, walls);
}
