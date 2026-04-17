import * as React from "react";
import { Link } from "react-router-dom";
import { PROJECTS } from "../../../config/projects.config";

const pro = PROJECTS.filter((p) => p.category === "professionnel");
const perso = PROJECTS.filter((p) => p.category === "personnel");

function MenuSection({ label, projects }: { label: string; projects: typeof PROJECTS }) {
  return (
    <div className="mb-6">
      <p className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-medium px-1">
        {label}
      </p>
      <nav className="flex flex-col gap-1">
        {projects.map((project) => (
          <Link
            key={project.id}
            to={project.url}
            className="group flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/60 group-hover:bg-brand-primary transition-colors duration-200 shrink-0" />
            <span className="text-sm font-medium">{project.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function BurgerMenu({ centered = false, side = "left", inline = false }: { centered?: boolean; side?: "left" | "right"; inline?: boolean }) {
  const [open, setOpen] = React.useState(false);

  const close = () => setOpen(false);

  const isLeft = side === "left";

  return (
    <>
      {/* Burger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu projets"
        className={`${inline ? "relative" : `absolute ${centered ? "top-1/2 -translate-y-1/2" : "top-5"} ${isLeft ? "left-5" : "right-5"}`} z-20 flex flex-col gap-1.5 p-2 rounded-md transition-colors pointer-events-auto`}
      >
        <span
          className={`block h-0.5 w-6 bg-brand-primary transition-all duration-300 origin-center ${open ? "rotate-45 translate-y-2" : ""}`}
        />
        <span
          className={`block h-0.5 w-6 bg-brand-primary transition-all duration-300 ${open ? "opacity-0" : ""}`}
        />
        <span
          className={`block h-0.5 w-6 bg-brand-primary transition-all duration-300 origin-center ${open ? "-rotate-45 -translate-y-2" : ""}`}
        />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-10 pointer-events-auto"
          onClick={close}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 h-screen w-72 z-20 bg-slate-900/95 backdrop-blur-sm flex flex-col pt-16 pb-8 px-6 pointer-events-auto transition-transform duration-300 ease-in-out overflow-y-auto ${isLeft ? "left-0 border-r border-slate-700/50" : "right-0 border-l border-slate-700/50"} ${open ? "translate-x-0" : isLeft ? "-translate-x-full" : "translate-x-full"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 pb-4 border-b border-slate-700/50" onClick={close}>
          <Link
            to="/"
            className="group flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/60 group-hover:bg-brand-primary transition-colors duration-200 shrink-0" />
            <span className="text-sm font-medium">Accueil</span>
          </Link>
        </div>

        <div onClick={close}>
          {pro.length > 0 && (
            <MenuSection label="Réalisations professionnelles" projects={pro} />
          )}

          {pro.length > 0 && perso.length > 0 && (
            <div className="border-t border-slate-800 mb-6" />
          )}

          {perso.length > 0 && (
            <MenuSection label="Projets personnels" projects={perso} />
          )}
        </div>

        <div className="border-t border-slate-800 mt-2 pt-6">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-medium px-1">
            CV
          </p>
          <a
            href="/assets/cv-erwan-gilbert.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200"
            onClick={close}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/60 group-hover:bg-brand-primary transition-colors duration-200 shrink-0" />
            <span className="text-sm font-medium">Voir mon CV</span>
          </a>
        </div>
      </div>
    </>
  );
}
