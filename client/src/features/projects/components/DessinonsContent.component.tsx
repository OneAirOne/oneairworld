export default function DessinonsContent() {
  return (
    <>
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16">
        <p className="text-brand-primary text-xs font-semibold tracking-widest uppercase mb-4">
          Projet — Application collaborative
        </p>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          Dessinons.io
        </h1>
      </section>

      <section className="flex flex-col items-center justify-center px-6 pb-32 gap-10">
        {/* Animated paintbrush on canvas */}
        <svg
          viewBox="0 0 120 120"
          className="w-40 h-40"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <style>{`
            @keyframes draw-stroke {
              0%   { stroke-dashoffset: 120; opacity: 0; }
              10%  { opacity: 1; }
              60%  { stroke-dashoffset: 0; opacity: 1; }
              85%  { opacity: 1; }
              100% { stroke-dashoffset: 0; opacity: 0; }
            }
            @keyframes brush-move {
              0%   { transform: translate(18px, 72px) rotate(-35deg); }
              60%  { transform: translate(72px, 38px) rotate(-35deg); }
              85%  { transform: translate(72px, 38px) rotate(-35deg); }
              100% { transform: translate(18px, 72px) rotate(-35deg); }
            }
            @keyframes brush-move2 {
              0%   { transform: translate(22px, 55px) rotate(-35deg); }
              60%  { transform: translate(65px, 75px) rotate(-35deg); }
              85%  { transform: translate(65px, 75px) rotate(-35deg); }
              100% { transform: translate(22px, 55px) rotate(-35deg); }
            }
            .stroke1 {
              stroke-dasharray: 120;
              stroke-dashoffset: 120;
              animation: draw-stroke 3s ease-in-out infinite;
            }
            .stroke2 {
              stroke-dasharray: 100;
              stroke-dashoffset: 100;
              animation: draw-stroke 3s ease-in-out 1.5s infinite;
            }
            .brush1 { animation: brush-move 3s ease-in-out infinite; }
            .brush2 { animation: brush-move2 3s ease-in-out 1.5s infinite; }
          `}</style>

          {/* Canvas frame */}
          <rect x="8" y="8" width="104" height="104" rx="6" ry="6"
            fill="#1e293b" stroke="#334155" strokeWidth="2" />

          {/* Canvas texture lines */}
          <line x1="8" y1="35" x2="112" y2="35" stroke="#243044" strokeWidth="0.8" />
          <line x1="8" y1="62" x2="112" y2="62" stroke="#243044" strokeWidth="0.8" />
          <line x1="8" y1="89" x2="112" y2="89" stroke="#243044" strokeWidth="0.8" />
          <line x1="35" y1="8" x2="35" y2="112" stroke="#243044" strokeWidth="0.8" />
          <line x1="62" y1="8" x2="62" y2="112" stroke="#243044" strokeWidth="0.8" />
          <line x1="89" y1="8" x2="89" y2="112" stroke="#243044" strokeWidth="0.8" />

          {/* Animated stroke 1 — blue curve */}
          <path
            className="stroke1"
            d="M20 75 Q45 30 75 40"
            stroke="#60a5fa"
            strokeWidth="3"
            fill="none"
          />

          {/* Animated stroke 2 — red curve */}
          <path
            className="stroke2"
            d="M25 55 Q50 90 68 78"
            stroke="#f0003c"
            strokeWidth="3"
            fill="none"
          />

          {/* Paintbrush 1 (follows stroke1) */}
          <g className="brush1">
            {/* Handle */}
            <rect x="-2" y="-22" width="4" height="18" rx="1" fill="#92400e" />
            {/* Ferrule */}
            <rect x="-2.5" y="-5" width="5" height="4" rx="0.5" fill="#94a3b8" />
            {/* Bristles */}
            <ellipse cx="0" cy="0" rx="3" ry="5" fill="#60a5fa" />
            <ellipse cx="0" cy="2" rx="2" ry="3" fill="#3b82f6" />
          </g>

          {/* Paintbrush 2 (follows stroke2) */}
          <g className="brush2">
            <rect x="-2" y="-22" width="4" height="18" rx="1" fill="#92400e" />
            <rect x="-2.5" y="-5" width="5" height="4" rx="0.5" fill="#94a3b8" />
            <ellipse cx="0" cy="0" rx="3" ry="5" fill="#f87171" />
            <ellipse cx="0" cy="2" rx="2" ry="3" fill="#ef4444" />
          </g>
        </svg>

        <div className="text-center">
          <p className="text-2xl font-semibold text-white mb-3">En cours de développement</p>
          <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
            POC réalisé pour tester les possibilités de collaboration en temps réel sur un canvas partagé, avec synchronisation des traits et des outils de dessin.
          </p>
        </div>
      </section>
    </>
  );
}
