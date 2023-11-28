import { DIRECTION } from "../../../../shared/types";
import { GameState } from "../../rooms/schema";

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

export function collisionPlayers(
  bodyA: Matter.Body,
  bodyB: Matter.Body,
  gameState: GameState
) {
  const playerStateA = gameState.players.get(bodyA.label);
  const playerStateB = gameState.players.get(bodyB.label);

  logCollision(bodyA, bodyB, gameState);

  const haveStates = playerStateA && playerStateB;

  if (!haveStates) return;

  // BODY A
  if (playerStateA?.isAttacking) {
    console.log("🔥 player A attacking", bodyA.position);

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

  // BODY B
  if (playerStateB?.isAttacking) {
    console.log("🔥 player B attacking", bodyB.position);

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
}
