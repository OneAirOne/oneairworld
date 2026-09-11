import * as React from "react";
import { Link } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
            {t("startGame.greeting")}
          </h1>

          <p className="text-slate-400 text-base leading-relaxed mb-4">
            <Trans
              i18nKey="startGame.intro1"
              components={{ bold: <span className="text-white font-semibold" /> }}
            />
          </p>

          <p className="text-slate-400 text-base leading-relaxed mb-4">
            <Trans
              i18nKey="startGame.intro2"
              components={{ bold: <span className="text-white font-semibold" /> }}
            />
          </p>

          <p className="text-slate-400 text-base leading-relaxed">
            <Trans
              i18nKey="startGame.intro3"
              components={{
                link: (
                  <Link
                    to="/projets/oneair-world"
                    className="text-white font-semibold hover:text-slate-300 transition-colors duration-200"
                  />
                ),
              }}
            />
          </p>

          <p className="text-slate-400 text-base leading-relaxed mt-4">
            <Trans
              i18nKey="startGame.intro4"
              values={{ email: mail }}
              components={{
                mail: (
                  <a
                    href={`mailto:${mail}`}
                    className="text-white font-semibold hover:text-slate-300 transition-colors duration-200"
                  />
                ),
              }}
            />
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
              {t("startGame.loading")}
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
