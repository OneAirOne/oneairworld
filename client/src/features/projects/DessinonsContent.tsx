export default function DessinonsContent() {
  return (
    <>
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16">
        <p className="text-brand text-xs font-semibold tracking-widest uppercase mb-4">
          Projet — Application collaborative
        </p>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          Dessinons
        </h1>
      </section>

      <section className="flex flex-col items-center justify-center px-6 pb-32 gap-10">
        {/* WIP pictogram */}
        <svg
          viewBox="0 0 120 120"
          className="w-36 h-36"
          fill="none"
          stroke="#475569"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Gear teeth — 8 rectangles rotated around center */}
          {Array.from({ length: 8 }).map((_, i) => (
            <rect
              key={i}
              x="55" y="14" width="10" height="16" rx="2"
              fill="#334155" stroke="none"
              transform={`rotate(${i * 45} 60 60)`}
            />
          ))}
          {/* Gear outer ring */}
          <circle cx="60" cy="60" r="22" strokeWidth="10" stroke="#334155" fill="none" />
          {/* Gear inner hole */}
          <circle cx="60" cy="60" r="10" fill="#0f172a" stroke="none" />
          <circle cx="60" cy="60" r="10" strokeWidth="2.5" />

          {/* Wrench — handle */}
          <line x1="30" y1="90" x2="72" y2="48" strokeWidth="7" stroke="#475569" />
          {/* Wrench — open head (two arcs) */}
          <path
            d="M72 48 a14 14 0 0 1 14 -14 a7 7 0 0 0 -7 -7 a14 14 0 0 0 -14 14 z"
            fill="#475569" stroke="none"
          />
          <circle cx="86" cy="34" r="10" strokeWidth="5" stroke="#475569" fill="none" />
          {/* Wrench — closed end nub */}
          <circle cx="28" cy="92" r="6" fill="#475569" stroke="none" />
        </svg>

        <div className="text-center">
          <p className="text-2xl font-semibold text-white mb-3">En cours de développement</p>
          <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
            Une application de dessin collaboratif en temps réel.<br />
            Revenez bientôt.
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-slate-600 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </section>
    </>
  );
}
