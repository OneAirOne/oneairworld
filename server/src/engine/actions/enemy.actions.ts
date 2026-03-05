import Matter from "matter-js";

import { Anim, DIRECTION, ENEMY_VELOCITY } from "../../../../shared/types";
import { Enemy as EnemyState } from "../../rooms/schema/Enemy";
import { Enemy } from "../bodies/enemy.body";
import { GameState } from "../../rooms/schema";
import { ENEMY_CONFIG } from "../../../../shared/shared.config";
import { SERVER_CONFIG } from "../../server.config";

const DIRECTIONS = [
  DIRECTION.UP,
  DIRECTION.DOWN,
  DIRECTION.LEFT,
  DIRECTION.RIGHT,
];

function getRandomDirection(): DIRECTION {
  return DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
}

function directionToAnim(dir: DIRECTION): Anim {
  switch (dir) {
    case DIRECTION.UP:
      return Anim.UP;
    case DIRECTION.DOWN:
      return Anim.DOWN;
    case DIRECTION.LEFT:
      return Anim.LEFT;
    case DIRECTION.RIGHT:
      return Anim.RIGHT;
  }
}

function directionToVelocity(dir: DIRECTION): { x: number; y: number } {
  switch (dir) {
    case DIRECTION.UP:
      return { x: 0, y: -ENEMY_VELOCITY };
    case DIRECTION.DOWN:
      return { x: 0, y: ENEMY_VELOCITY };
    case DIRECTION.LEFT:
      return { x: -ENEMY_VELOCITY, y: 0 };
    case DIRECTION.RIGHT:
      return { x: ENEMY_VELOCITY, y: 0 };
  }
}

export function processEnemyAI(
  body: Enemy,
  enemyState: EnemyState,
  deltaTime: number,
  gameState: GameState
) {
  // Don't override direction while hit animation is playing
  const isHitAnim =
    enemyState.anim === Anim.HIT_UP ||
    enemyState.anim === Anim.HIT_DOWN ||
    enemyState.anim === Anim.HIT_LEFT ||
    enemyState.anim === Anim.HIT_RIGHT;

  if (isHitAnim) {
    body.hitAnimTimer -= deltaTime;
    if (body.hitAnimTimer <= 0) {
      enemyState.anim = directionToAnim(enemyState.direction as DIRECTION);
    }
  }

  // --- Proximity detection: aggro nearest player in range ---
  if (!body.targetPlayerId) {
    const ex = body.getBody().position.x;
    const ey = body.getBody().position.y;
    let closestDist = Infinity;
    let closestId: string | null = null;

    gameState.players.forEach((player, id) => {
      const dx = player.x - ex;
      const dy = player.y - ey;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < ENEMY_CONFIG.AGGRO_RADIUS && dist < closestDist) {
        closestDist = dist;
        closestId = id;
      }
    });

    if (closestId) {
      body.targetPlayerId = closestId;
      body.loseAggroTimer = 0;
    }
  }

  // --- Leash check: lose aggro when player stays out of range ---
  if (body.targetPlayerId) {
    const target = gameState.players.get(body.targetPlayerId);
    if (!target) {
      body.targetPlayerId = null;
      body.loseAggroTimer = 0;
    } else {
      const ex = body.getBody().position.x;
      const ey = body.getBody().position.y;
      const dx = target.x - ex;
      const dy = target.y - ey;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > ENEMY_CONFIG.AGGRO_RADIUS) {
        body.loseAggroTimer += deltaTime;
        if (body.loseAggroTimer >= SERVER_CONFIG.loseAggroDelay) {
          body.targetPlayerId = null;
          body.loseAggroTimer = 0;
        }
      } else {
        body.loseAggroTimer = 0;
      }
    }
  }

  if (!isHitAnim) {
    if (body.targetPlayerId) {
      // Follow target
      const target = gameState.players.get(body.targetPlayerId);
      if (target) {
        const dx = target.x - body.getBody().position.x;
        const dy = target.y - body.getBody().position.y;
        const dir =
          Math.abs(dx) > Math.abs(dy)
            ? dx > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT
            : dy > 0 ? DIRECTION.DOWN : DIRECTION.UP;

        enemyState.direction = dir;
        enemyState.anim = directionToAnim(dir);
      }
    } else {
      // Random wandering
      body.tickTimer(deltaTime);
      if (body.wantsNewDirection) {
        const newDir = getRandomDirection();
        enemyState.direction = newDir;
        enemyState.anim = directionToAnim(newDir);
        body.wantsNewDirection = false;
      }
    }
  }

  const vel = directionToVelocity(enemyState.direction as DIRECTION);
  Matter.Body.setVelocity(body.getBody(), vel);
}
