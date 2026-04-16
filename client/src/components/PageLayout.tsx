import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BurgerMenu } from "../features/game/components/BurgerMenu";

interface Props {
  children: React.ReactNode;
}

export default function PageLayout({ children }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  React.useEffect(() => {
    document.getElementById("root")?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }, [pathname]);

  React.useEffect(() => {
    const root = document.getElementById("root");
    const prev = root?.style.position ?? "";
    if (root) {
      root.style.position = "relative";
      root.style.inset = "auto";
      root.style.pointerEvents = "auto";
      root.style.overflowY = "auto";
    }
    document.documentElement.style.height = "auto";
    document.body.style.height = "auto";
    return () => {
      if (root) {
        root.style.position = prev;
        root.style.inset = "0";
        root.style.pointerEvents = "none";
        root.style.overflowY = "";
      }
      document.documentElement.style.height = "100%";
      document.body.style.height = "100%";
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <header className="fixed top-0 left-0 right-0 z-10 px-6 py-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-400 text-sm hover:text-white transition-colors"
        >
          ← Retour
        </button>
        <BurgerMenu centered />
      </header>
      <main className="pt-[53px]">{children}</main>
    </div>
  );
}
