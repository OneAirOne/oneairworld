import Matter from "matter-js";

import { COLLISION_CATEGORY } from "../engine.config";

const WALL_CONFIG = {
  isStatic: true,
  collisionFilter: {
    category: COLLISION_CATEGORY.WALL,
  },
};

export function createRectangle(
  world: Matter.World,
  x: number,
  y: number,
  width: number,
  height: number,
  wallSize?: number
) {
  const WALL_SIZE = wallSize ?? 1;
  const walls = [
    // Top wall
    Matter.Bodies.rectangle(x, y, width, WALL_SIZE, {
      ...WALL_CONFIG,
      label: "wall-top",
    }),
    // Bottom wall
    Matter.Bodies.rectangle(width / 2, height, width, WALL_SIZE, {
      ...WALL_CONFIG,
      label: "wall-bottom",
    }),
    // Right wall
    Matter.Bodies.rectangle(width, height / 2, WALL_SIZE, height, {
      ...WALL_CONFIG,
      label: "wall-right",
    }),
    // Left wall
    Matter.Bodies.rectangle(0, height / 2, WALL_SIZE, height, {
      ...WALL_CONFIG,
      label: "wall-left",
    }),
  ];

  Matter.World.add(world, walls);
}
