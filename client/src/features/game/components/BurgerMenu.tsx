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
            state={{ from: "game" }}
            className="group flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand/60 group-hover:bg-brand transition-colors duration-200 shrink-0" />
            <span className="text-sm font-medium">{project.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function BurgerMenu({ centered = false }: { centered?: boolean }) {
  const [open, setOpen] = React.useState(false);

  const close = () => setOpen(false);

  return (
    <>
      {/* Burger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu projets"
        className={`absolute ${centered ? "top-1/2 -translate-y-1/2" : "top-5"} right-5 z-20 flex flex-col gap-1.5 p-2 rounded-md text-slate-400 hover:text-white transition-colors pointer-events-auto`}
      >
        <span
          className={`block h-0.5 w-6 bg-current transition-all duration-300 origin-center ${open ? "rotate-45 translate-y-2" : ""}`}
        />
        <span
          className={`block h-0.5 w-6 bg-current transition-all duration-300 ${open ? "opacity-0" : ""}`}
        />
        <span
          className={`block h-0.5 w-6 bg-current transition-all duration-300 origin-center ${open ? "-rotate-45 -translate-y-2" : ""}`}
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
        className={`fixed top-0 right-0 h-screen w-72 z-20 bg-slate-900/95 backdrop-blur-sm border-l border-slate-700/50 flex flex-col pt-16 pb-8 px-6 pointer-events-auto transition-transform duration-300 ease-in-out overflow-y-auto ${open ? "translate-x-0" : "translate-x-full"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 pb-4 border-b border-slate-700/50" onClick={close}>
          <Link
            to="/"
            className="group flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand/60 group-hover:bg-brand transition-colors duration-200 shrink-0" />
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
      </div>
    </>
  );
}
