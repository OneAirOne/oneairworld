import * as React from "react";
import { Link } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

export default function PageLayout({ children }: Props) {
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
      <header className="px-6 py-4 border-b border-slate-800">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 text-sm hover:text-white transition-colors"
        >
          ← Retour au monde
        </Link>
      </header>
      <main>{children}</main>
    </div>
  );
}
