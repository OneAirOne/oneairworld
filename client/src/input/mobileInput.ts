/**
 * Shared singleton holding the current touch/virtual-joystick input state.
 * UIScene writes into it each frame; Player.handleInput() reads from it.
 */
export const mobileInput = {
  left: false,
  right: false,
  up: false,
  down: false,
  space: false,
};
