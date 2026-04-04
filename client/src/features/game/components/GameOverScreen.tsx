import * as React from "react";
import { phaserEvents, PhaserEvent } from "../../../events/eventManager";

export function GameOverScreen() {
  const [visible, setVisible] = React.useState(false);
  const [fading, setFading] = React.useState(false);

  React.useEffect(() => {
    const onGameOver = () => {
      setFading(false);
      setVisible(true);
    };
    phaserEvents.on(PhaserEvent.GAME_OVER, onGameOver);
    return () => { phaserEvents.off(PhaserEvent.GAME_OVER, onGameOver); };
  }, []);

  const restart = React.useCallback(() => {
    if (fading) return;
    setFading(true);
    phaserEvents.emit(PhaserEvent.GAME_OVER_RESTART);
    setTimeout(() => {
      setVisible(false);
      setFading(false);
    }, 1200);
  }, [fading]);

  React.useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Enter") restart(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, restart]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black pointer-events-auto transition-opacity duration-1000"
      style={{ opacity: fading ? 0 : 1 }}
      onClick={restart}
    >
      <h1 className="text-white font-bold tracking-widest uppercase mb-10"
        style={{ fontSize: "clamp(3rem, 10vw, 6rem)" }}
      >
        Game Over
      </h1>
      <p className="text-slate-400 text-sm animate-bounce">
        Appuyer sur Entrée
      </p>
    </div>
  );
}
