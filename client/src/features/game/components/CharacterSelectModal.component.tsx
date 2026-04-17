import * as React from "react";
import { Characters } from "../../../../../shared/types";
import { PLAYABLE_CHARACTERS, CharacterChoice } from "../config/characters.config";
import PushButton from "./PushButton.component";

interface Props {
  onSelect: (character: Characters) => void;
  onClose: () => void;
}

export function CharacterSelectModal({ onSelect, onClose }: Props) {
  const [selected, setSelected] = React.useState<Characters | null>(null);

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 pointer-events-auto"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >

        <h2 className="text-white text-2xl font-bold text-center mb-2">
          Choisissez votre personnage
        </h2>
        <p className="text-slate-400 text-sm text-center mb-8">
          Avec qui voulez-vous explorer ?
        </p>

        <div className="flex gap-4 justify-center mb-8">
          {PLAYABLE_CHARACTERS.map((c: CharacterChoice) => (
            <button
              key={c.key}
              onClick={() => setSelected(c.key)}
              className={[
                "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer bg-transparent",
                selected === c.key
                  ? "border-brand bg-brand-primary/10 scale-105"
                  : "border-slate-600 hover:border-slate-400",
              ].join(" ")}
            >
              <img src={c.gif} className="w-12 h-12 rounded-full object-cover" />
              <span className="text-white font-semibold text-sm">{c.name}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <PushButton disabled={!selected} onClick={() => selected && onSelect(selected)}>
            PLAY
          </PushButton>
        </div>
      </div>
    </div>
  );
}
