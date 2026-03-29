import * as React from "react";

// Components
import LaunchButton from "./lauchButton";
import { CharacterSelectModal } from "./CharacterSelectModal";

// Others
import phaserGame from "Game";
import { BootScene, SCENES } from "scenes";

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
    setTimeout(() => setVisible(false), FADE_DURATION);
  }, []);

  if (!visible) return null;

  return (
    <div
        className="absolute inset-0 z-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center pointer-events-auto"
        style={{ transition: `opacity ${FADE_DURATION}ms ease`, opacity: fading ? 0 : 1 }}
      >
      <div className="max-w-lg w-full px-8">

        {/* Avatar */}
        <div className="flex justify-center mb-8 animate-float">
          <img
            src="assets/avatar.jpg"
            className="w-24 h-24 rounded-full ring-2 ring-brand/30"
          />
        </div>

        {/* Text */}
        <div
          className="mb-10 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <h1 className="text-4xl font-bold text-white mb-5 tracking-tight">
            Bonjour,
          </h1>

          <p className="text-slate-400 text-base leading-relaxed mb-4">
            Je m'appelle Erwan, développeur logiciel basé en France. J'aime
            concevoir des projets digitaux, en particulier les expériences
            immersives comme le jeu vidéo.
          </p>

          <p className="text-slate-400 text-base leading-relaxed mb-4">
            Pour toute demande ou collaboration, n'hésitez pas à me contacter
            à{" "}
            <a
              href={`mailto:${mail}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:text-brand/70 transition-colors duration-200 underline underline-offset-4"
            >
              {mail}
            </a>
          </p>

          <p className="text-slate-400 text-base leading-relaxed">
            Explorez mon showroom interactif pour découvrir mes projets, mon
            parcours… et peut-être croiser quelques monstres en chemin.
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

      {showModal && <CharacterSelectModal onSelect={handleCharacterSelect} />}
    </div>
  );
}
