import * as React from "react";

// Components
import LaunchButton from "./lauchButton";

// Others
import phaserGame from "Game";
import { BootScene, SCENES } from "scenes";

// Shared
import CLIENT_CONFIG from "client.config";

export function StartGame() {
  const [visible, setVisible] = React.useState(true);
  const mail = "gilberterwan@gmail.com";

  const handleLaunch = React.useCallback(async () => {
    try {
      const bootScene = phaserGame.scene.keys[SCENES.BOOT] as BootScene;
      bootScene.launchGame();
      await bootScene.network.joinOrCreatePublic({
        name: "Erwan",
        texture: CLIENT_CONFIG.ACTIVE_PLAYER,
      });
    } catch (error) {
      console.error(error);
    }
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center pointer-events-auto">
      <div className="max-w-lg w-full px-8">

        {/* Avatar */}
        <div className="flex justify-center mb-8 animate-float">
          <img
            src="assets/avatar.jpg"
            className="w-24 h-24 rounded-full ring-2 ring-purple-500/30"
          />
        </div>

        {/* Text */}
        <div
          className="mb-10 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <h1 className="text-4xl font-bold text-white mb-5 tracking-tight">
            Hi,
          </h1>

          <p className="text-slate-400 text-base leading-relaxed mb-4">
            I'm Erwan a software developer from France. I really enjoy working
            on digital projects, especially immersive experiences like gaming.
          </p>

          <p className="text-slate-400 text-base leading-relaxed mb-4">
            Do not hesitate to contact me for any requests or project inquiries
            at{" "}
            <a
              href={`mailto:${mail}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-pink-400 transition-colors duration-200 underline underline-offset-4"
            >
              {mail}
            </a>
          </p>

          <p className="text-slate-400 text-base leading-relaxed">
            If you want to see what I'm capable of or just kill some aliens,
            click on the button
          </p>
        </div>

        {/* Button */}
        <div
          className="flex justify-center opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          <LaunchButton onClick={handleLaunch} />
        </div>

      </div>
    </div>
  );
}
