import Matter from "matter-js";

import { COLLISION_CATEGORY } from "../config";
import { sharedConfig } from "../../../../shared/config";

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
      sharedConfig.WORLD_WIDTH / 2,
      0,
      sharedConfig.WORLD_WIDTH,
      sharedConfig.WORLD_WALL_SIZE,
      {
        ...WALL_CONFIG,
        label: "wall-top",
      }
    ),
    // Bottom wall
    Matter.Bodies.rectangle(
      sharedConfig.WORLD_WIDTH / 2,
      sharedConfig.WORLD_HEIGHT,
      sharedConfig.WORLD_WIDTH,
      sharedConfig.WORLD_WALL_SIZE,
      { ...WALL_CONFIG, label: "wall-bottom" }
    ),
    // Right wall
    Matter.Bodies.rectangle(
      sharedConfig.WORLD_WIDTH,
      sharedConfig.WORLD_HEIGHT / 2,
      sharedConfig.WORLD_WALL_SIZE,
      sharedConfig.WORLD_HEIGHT,
      { ...WALL_CONFIG, label: "wall-right" }
    ),
    // Left wall
    Matter.Bodies.rectangle(
      0,
      sharedConfig.WORLD_HEIGHT / 2,
      sharedConfig.WORLD_WALL_SIZE,
      sharedConfig.WORLD_HEIGHT,
      { ...WALL_CONFIG, label: "wall-left" }
    ),
  ];

  Matter.World.add(world, walls);
}
