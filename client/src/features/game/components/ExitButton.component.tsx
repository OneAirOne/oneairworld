import * as React from "react";
import { phaserEvents, PhaserEvent } from "../../../events/eventManager";

export function ExitButton() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onGameStarted = () => setVisible(true);
    const onGameOver = () => setVisible(false);
    // After a restart the game resumes — bring the button back after the
    // GameOverScreen has finished fading (1200ms transition defined there).
    const onRestart = () => setTimeout(() => setVisible(true), 1300);
    phaserEvents.on(PhaserEvent.GAME_STARTED, onGameStarted);
    phaserEvents.on(PhaserEvent.GAME_OVER, onGameOver);
    phaserEvents.on(PhaserEvent.GAME_OVER_RESTART, onRestart);
    return () => {
      phaserEvents.off(PhaserEvent.GAME_STARTED, onGameStarted);
      phaserEvents.off(PhaserEvent.GAME_OVER, onGameOver);
      phaserEvents.off(PhaserEvent.GAME_OVER_RESTART, onRestart);
    };
  }, []);

  const handleExit = React.useCallback(() => {
    // Full reload: closes the WebSocket (server removes the player on disconnect)
    // and resets the app back to the StartGame screen.
    window.location.href = "/";
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-5 left-5 z-20 pointer-events-auto">
      <button
        onClick={handleExit}
        className="group rounded-xl border-0 p-0 cursor-pointer outline-offset-4 bg-brand-shadow"
      >
        <span className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-brand-primary -translate-y-1 will-change-transform transition-transform duration-[250ms] group-hover:-translate-y-[6px] group-active:-translate-y-0.5">
          ← Sortir
        </span>
      </button>
    </div>
  );
}
