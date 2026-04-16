import * as React from "react";
import { phaserEvents, PhaserEvent } from "../../../events/eventManager";
import SamuraiBallContent from "../../projects/SamuraiBallContent";
import OldPortfolioContent from "../../projects/OldPortfolioContent";
import PepperAtelierContent from "../../projects/PepperAtelierContent";
import DessinonsContent from "../../projects/DessinonsContent";
import OneAirWorldContent from "../../projects/OneAirWorldContent";

// TODO: make an enum
function ProjectContent({ projectId }: { projectId: string }) {
  switch (projectId) {
    case "samurai-ball":
      return <SamuraiBallContent />;
    case "old-portfolio":
      return <OldPortfolioContent />;
    case "pepper-atelier-snowboard":
      return <PepperAtelierContent />;
    case "oneair-world":
      return <OneAirWorldContent />;
    case "dessinons":
      return <DessinonsContent />;
    default:
      return (
        <div className="flex items-center justify-center h-full text-slate-400 text-sm">
          Projet bientôt disponible
        </div>
      );
  }
}

export function ProjectOverlay() {
  const [projectId, setProjectId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const onOpen = (id: string) => setProjectId(id);
    phaserEvents.on(PhaserEvent.PROJECT_OPEN, onOpen);
    return () => { phaserEvents.off(PhaserEvent.PROJECT_OPEN, onOpen); };
  }, []);

  React.useEffect(() => {
    if (!projectId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [projectId]);

  function close() {
    setProjectId(null);
    phaserEvents.emit(PhaserEvent.PROJECT_CLOSE);
  }

  if (!projectId) return null;

  return (
    <div
      className="fixed inset-0 z-[150] bg-slate-900 text-white font-sans overflow-y-auto"
      style={{ pointerEvents: "auto" }}
    >
      <header className="sticky top-0 z-10 px-6 py-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
        <button
          onClick={close}
          className="text-slate-400 text-sm hover:text-white transition-colors"
        >
          ← Retour
        </button>
      </header>
      <main>
        <ProjectContent projectId={projectId} />
      </main>
    </div>
  );
}
