import { Anim, DIRECTION } from "../../../../shared/types";
import { GameState } from "../../rooms/schema";
import { COLLISION_CATEGORY } from "../engine.config";

import { SERVER_CONFIG } from "../../server.config";

/**
 * Log collision data
 */
function logCollision(
  bodyA: Matter.Body,
  bodyB: Matter.Body,
  gameState: GameState
) {
  const playerStateA = gameState.players.get(bodyA.label);
  const playerStateB = gameState.players.get(bodyB.label);

  console.log("------------------------------------------");

  if (playerStateA) {
    console.log(
      "A",
      bodyA.label,
      playerStateA.direction,
      playerStateA.isAttacking,
      bodyA.collisionFilter.category
    );
  }

  if (playerStateB) {
    console.log(
      "B",
      bodyB.label,
      playerStateB.direction,
      playerStateB.isAttacking,
      bodyB.collisionFilter.category
    );
  }
}

/**
 * Handle player hitbox hitting enemy hurtbox
 */
export function collisionPlayerEnemy(
  bodyA: Matter.Body,
  bodyB: Matter.Body,
  gameState: GameState
): { enemyId: string; playerId: string } | null {
  const hitBody =
    bodyA.collisionFilter.category === COLLISION_CATEGORY.HIT_BOX ? bodyA : bodyB;
  const hurtBody =
    bodyA.collisionFilter.category === COLLISION_CATEGORY.HURT_BOX ? bodyA : bodyB;

  const playerState = gameState.players.get(hitBody.label);
  const enemyState = gameState.enemies.get(hurtBody.label);

  if (!playerState || !enemyState) return null;
  if (!playerState.isAttacking || enemyState.isDead) return null;

  enemyState.decreaseLife();

  // Knockback: push enemy in the opposite direction of the attack
  const knockbackDirection: Record<DIRECTION, DIRECTION> = {
    [DIRECTION.UP]: DIRECTION.DOWN,
    [DIRECTION.DOWN]: DIRECTION.UP,
    [DIRECTION.LEFT]: DIRECTION.RIGHT,
    [DIRECTION.RIGHT]: DIRECTION.LEFT,
  };

  enemyState.isCollided = true;
  enemyState.collisionDirection = knockbackDirection[playerState.direction as DIRECTION];

  // Hit animation based on attacker direction (same convention as player-player)
  if (playerState.direction === DIRECTION.UP) enemyState.anim = Anim.HIT_DOWN;
  if (playerState.direction === DIRECTION.DOWN) enemyState.anim = Anim.HIT_UP;
  if (playerState.direction === DIRECTION.LEFT) enemyState.anim = Anim.HIT_RIGHT;
  if (playerState.direction === DIRECTION.RIGHT) enemyState.anim = Anim.HIT_LEFT;

  return { enemyId: hurtBody.label, playerId: hitBody.label };
}

/**
 * Excute collision operations on the two bodies
 */
export function collisionPlayers(
  bodyA: Matter.Body,
  bodyB: Matter.Body,
  gameState: GameState
) {
  const playerStateA = gameState.players.get(bodyA.label);
  const playerStateB = gameState.players.get(bodyB.label);

  if (SERVER_CONFIG.debug) {
    logCollision(bodyA, bodyB, gameState);
  }

  const haveStates = playerStateA && playerStateB;

  if (!haveStates) return;

  // BODY A
  if (playerStateA?.isAttacking) {
    if (SERVER_CONFIG.debug) {
      console.log("🔥 player A attacking", bodyA.position);
    }

    playerStateB.decreaseLife();
    playerStateB.isCollided = true;

    if (playerStateA.direction === DIRECTION.UP) {
      playerStateB.collisionDirection = DIRECTION.DOWN;
    }
    if (playerStateA.direction === DIRECTION.DOWN) {
      playerStateB.collisionDirection = DIRECTION.UP;
    }
    if (playerStateA.direction === DIRECTION.LEFT) {
      playerStateB.collisionDirection = DIRECTION.RIGHT;
    }
    if (playerStateA.direction === DIRECTION.RIGHT) {
      playerStateB.collisionDirection = DIRECTION.LEFT;
    }
  }

  if (playerStateB.isCollided) {
    if (playerStateA.direction === DIRECTION.UP) {
      playerStateB.anim = Anim.HIT_DOWN;
    }
    if (playerStateA.direction === DIRECTION.DOWN) {
      playerStateB.anim = Anim.HIT_UP;
    }
    if (playerStateA.direction === DIRECTION.LEFT) {
      playerStateB.anim = Anim.HIT_RIGHT;
    }
    if (playerStateA.direction === DIRECTION.RIGHT) {
      playerStateB.anim = Anim.HIT_LEFT;
    }
  }

  // BODY B
  if (playerStateB?.isAttacking) {
    if (SERVER_CONFIG.debug) {
      console.log("🔥 player B attacking", bodyB.position);
    }

    playerStateA.decreaseLife();
    playerStateA.isCollided = true;

    if (playerStateB.direction === DIRECTION.UP) {
      playerStateA.collisionDirection = DIRECTION.DOWN;
    }
    if (playerStateB.direction === DIRECTION.DOWN) {
      playerStateA.collisionDirection = DIRECTION.UP;
    }
    if (playerStateB.direction === DIRECTION.LEFT) {
      playerStateA.collisionDirection = DIRECTION.RIGHT;
    }
    if (playerStateB.direction === DIRECTION.RIGHT) {
      playerStateA.collisionDirection = DIRECTION.LEFT;
    }
  }

  if (playerStateA.isCollided) {
    if (playerStateB.direction === DIRECTION.UP) {
      playerStateA.anim = Anim.HIT_DOWN;
    }
    if (playerStateB.direction === DIRECTION.DOWN) {
      playerStateA.anim = Anim.HIT_UP;
    }
    if (playerStateB.direction === DIRECTION.LEFT) {
      playerStateA.anim = Anim.HIT_RIGHT;
    }
    if (playerStateB.direction === DIRECTION.RIGHT) {
      playerStateA.anim = Anim.HIT_LEFT;
    }
  }
}
