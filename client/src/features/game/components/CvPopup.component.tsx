import * as React from "react";
import { phaserEvents, PhaserEvent } from "../../../events/eventManager";

export function CvPopup() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onOpen = () => setOpen(true);
    phaserEvents.on(PhaserEvent.CV_POPUP_OPEN, onOpen);
    return () => { phaserEvents.off(PhaserEvent.CV_POPUP_OPEN, onOpen); };
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      phaserEvents.emit(PhaserEvent.CV_POPUP_CLOSE);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 pointer-events-auto"
      onClick={() => setOpen(false)}
    >
      <div
        className="relative flex flex-col bg-white rounded shadow-2xl overflow-hidden"
        style={{ width: "90vw", maxWidth: 800, height: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-3 py-2 bg-gray-900">
          <a
            href="/assets/cv-erwan-gilbert.pdf"
            download="cv-erwan-gilbert.pdf"
            className="text-white text-sm hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            ⬇ Télécharger
          </a>
          <button
            className="bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-black/90"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>
        <iframe
          src="/assets/cv-erwan-gilbert.pdf"
          className="flex-1 w-full border-0"
          title="CV d'Erwan Gilbert"
        />
      </div>
    </div>
  );
}
