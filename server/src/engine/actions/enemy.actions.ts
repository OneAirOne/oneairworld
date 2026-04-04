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
    case DIRECTION.UP:    return Anim.UP;
    case DIRECTION.DOWN:  return Anim.DOWN;
    case DIRECTION.LEFT:  return Anim.LEFT;
    case DIRECTION.RIGHT: return Anim.RIGHT;
  }
}

function directionToAttackAnim(dir: DIRECTION): Anim {
  switch (dir) {
    case DIRECTION.UP:    return Anim.ATTACK_UP;
    case DIRECTION.DOWN:  return Anim.ATTACK_DOWN;
    case DIRECTION.LEFT:  return Anim.ATTACK_LEFT;
    case DIRECTION.RIGHT: return Anim.ATTACK_RIGHT;
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
  // --- Hit anim timer ---
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

  // --- Knockback: freeze AI, reset attack prep ---
  if (body.knockbackTimer > 0) {
    body.knockbackTimer = Math.max(0, body.knockbackTimer - deltaTime);
    if (enemyState.isPreparing) {
      enemyState.isPreparing = false;
      body.attackPrepTimer = 0;
    }
    return;
  }

  // --- Attack cooldown tick ---
  if (body.attackCooldown > 0) {
    body.attackCooldown = Math.max(0, body.attackCooldown - deltaTime);
  }

  // --- Attack preparation: enemy freezes and charges up before jumping ---
  if (enemyState.isPreparing) {
    body.attackPrepTimer -= deltaTime;
    Matter.Body.setVelocity(body.getBody(), { x: 0, y: 0 });
    if (body.attackPrepTimer <= 0) {
      // Commit target at launch time and start the lunge
      enemyState.isPreparing = false;
      enemyState.isAttacking = true;
      body.attackTimer = ENEMY_CONFIG.ATTACK_DURATION;
      body.attackCooldown = ENEMY_CONFIG.ATTACK_COOLDOWN;
      body.attackDamageDealt = false;
      body.attackOriginX = body.getBody().position.x;
      body.attackOriginY = body.getBody().position.y;
      const prepTarget = body.targetPlayerId ? gameState.players.get(body.targetPlayerId) : null;
      body.attackTargetX = prepTarget ? prepTarget.x : body.attackOriginX;
      body.attackTargetY = prepTarget ? prepTarget.y : body.attackOriginY;
      if (!isHitAnim) enemyState.anim = directionToAttackAnim(enemyState.direction as DIRECTION);
      Matter.Body.setVelocity(body.getBody(), { x: 0, y: 0 });
    }
    return;
  }

  // --- Ongoing attack: ease-in jump to landing point, then freeze ---
  if (enemyState.isAttacking) {
    body.attackTimer -= deltaTime;
    if (body.attackTimer <= 0) {
      enemyState.isAttacking = false;
      body.attackDamageDealt = false;
      Matter.Body.setPosition(body.getBody(), { x: body.attackTargetX, y: body.attackTargetY });
      Matter.Body.setVelocity(body.getBody(), { x: 0, y: 0 });
      if (!isHitAnim) {
        enemyState.anim = directionToAnim(enemyState.direction as DIRECTION);
      }
    } else if (body.attackTimer > ENEMY_CONFIG.ATTACK_DURATION * 0.6) {
      // First 40%: ease-in interpolation from origin to landing point (t²)
      const lunge_duration = ENEMY_CONFIG.ATTACK_DURATION * 0.4;
      const elapsed = ENEMY_CONFIG.ATTACK_DURATION - body.attackTimer;
      const t = Math.min(elapsed / lunge_duration, 1);
      const eased = t * t; // quadratic ease-in: slow takeoff → accelerates
      Matter.Body.setPosition(body.getBody(), {
        x: body.attackOriginX + (body.attackTargetX - body.attackOriginX) * eased,
        y: body.attackOriginY + (body.attackTargetY - body.attackOriginY) * eased,
      });
      Matter.Body.setVelocity(body.getBody(), { x: 0, y: 0 });
    } else {
      // Remaining 60%: freeze at landing point
      Matter.Body.setPosition(body.getBody(), { x: body.attackTargetX, y: body.attackTargetY });
      Matter.Body.setVelocity(body.getBody(), { x: 0, y: 0 });
    }
    return;
  }

  // --- Proximity detection: aggro nearest player in range ---
  if (!body.targetPlayerId) {
    const ex = body.getBody().position.x;
    const ey = body.getBody().position.y;
    let closestDist = Infinity;
    let closestId: string | null = null;

    gameState.players.forEach((player, id) => {
      if (player.isSpeaking) return;
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
    if (!target || target.isSpeaking) {
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
      const target = gameState.players.get(body.targetPlayerId);
      if (target) {
        const dx = target.x - body.getBody().position.x;
        const dy = target.y - body.getBody().position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const dir =
          Math.abs(dx) > Math.abs(dy)
            ? dx > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT
            : dy > 0 ? DIRECTION.DOWN : DIRECTION.UP;

        enemyState.direction = dir;

        // --- Enter prep phase if in range and cooldown ready ---
        if (dist <= ENEMY_CONFIG.ATTACK_RANGE && body.attackCooldown <= 0) {
          enemyState.isPreparing = true;
          body.attackPrepTimer = ENEMY_CONFIG.ATTACK_PREP_DURATION;
          enemyState.anim = directionToAnim(dir);
          Matter.Body.setVelocity(body.getBody(), { x: 0, y: 0 });
          return;
        } else {
          enemyState.anim = directionToAnim(dir);
        }
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
