import * as React from "react";
import { Link } from "react-router-dom";

// Components
import LaunchButton from "./lauchButton.component";
import { CharacterSelectModal } from "./CharacterSelectModal.component";
import { BurgerMenu } from "./BurgerMenu.component";

// Others
import phaserGame from "Game";
import { BootScene, SCENES } from "scenes";
import { phaserEvents, PhaserEvent } from "../../../events/eventManager";

// Shared
import { Characters } from "../../../../../shared/types";

const FADE_DURATION = 500;

export function StartGame() {
  const [visible, setVisible] = React.useState(true);
  const [fading, setFading] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const mail = "gilberterwan@gmail.com";

  const handleLaunch = React.useCallback(() => {
    setShowModal(true);
  }, []);

  const handleCharacterSelect = React.useCallback(async (character: Characters) => {
    setShowModal(false);
    setLoading(true);
    try {
      const bootScene = phaserGame.scene.keys[SCENES.BOOT] as BootScene;
      await Promise.all([
        bootScene.network.joinOrCreatePublic({ name: "Erwan", texture: character }),
        bootScene.waitForPreload(),
      ]);
      bootScene.launchGame();
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
    setFading(true);
    setTimeout(() => {
      setVisible(false);
phaserEvents.emit(PhaserEvent.GAME_STARTED);
    }, FADE_DURATION);
  }, []);

  if (!visible) return null;

  return (
    <div
        className="absolute inset-0 z-10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center pointer-events-auto overflow-hidden"
        style={{ transition: `opacity ${FADE_DURATION}ms ease`, opacity: fading ? 0 : 1 }}
      >
      <BurgerMenu />
      <div className="max-w-lg w-full px-8">

        {/* Avatar */}
        <div className="flex justify-center mb-8 animate-float">
          <img
            src="assets/avatar.jpg"
            className="w-24 h-24 rounded-full ring-2 ring-white/20 shadow-[0_0_30px_8px_rgba(255,255,255,0.25)]"
          />
        </div>

        {/* Text */}
        <div
          className="mb-10 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <h1 className="text-4xl font-bold text-white tracking-tight mb-4">
            Hey,
          </h1>
       
          <p className="text-slate-400 text-base leading-relaxed mb-4">
            moi c'est <span className="text-white font-semibold">Erwan</span> — Software engineer. J'aime créer des expériences digitales interactives.
          </p>

          <p className="text-slate-400 text-base leading-relaxed mb-4">
            Bienvenue dans mon <span className="text-white font-semibold">CV jouable</span>.
          </p>

          <p className="text-slate-400 text-base leading-relaxed">
            Curieux de savoir comment c'est fait ? Jetez un œil au projet{" "}
            <Link
              to="/projets/oneair-world"
              className="text-white font-semibold hover:text-slate-300 transition-colors duration-200"
            >
              OneairWorld
            </Link>.
          </p>

          <p className="text-slate-400 text-base leading-relaxed mt-4">
            Une question, une collaboration ?{" "}
            <a
              href="mailto:gilberterwan@gmail.com"
              className="text-white font-semibold hover:text-slate-300 transition-colors duration-200"
            >
              gilberterwan@gmail.com
            </a>
          </p>
        </div>

        {/* Button / loading */}
        <div
          className="flex justify-center opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          {loading ? (
            <div className="flex items-center gap-3 text-slate-400 text-sm">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Chargement du monde…
            </div>
          ) : (
            <LaunchButton onClick={handleLaunch} />
          )}
        </div>

      </div>

      {showModal && <CharacterSelectModal onSelect={handleCharacterSelect} onClose={() => setShowModal(false)} />}
    </div>
  );
}
