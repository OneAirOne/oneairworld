const GIFS = [
  { src: "/assets/samurail-ball/fire.gif",        label: "Boule de feu" },
  { src: "/assets/samurail-ball/double_jump.gif", label: "Double saut" },
  { src: "/assets/samurail-ball/front_hit.gif",   label: "Impact frontal" },
];

export default function SamuraiBallContent() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16">
        <p className="text-brand text-xs font-semibold tracking-widest uppercase mb-4">
          Projet — Jeu vidéo
        </p>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          Samurai Ball
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mb-4">
          Un jeu de combat en arène inspiré du genre Smash Bros, où réflexes et
          technique s'affrontent à chaque round. La gravité est au cœur du
          gameplay — la boule de feu projette les combattants dans les airs,
          ouvrant la voie à des échanges aériens aussi imprévisibles que
          spectaculaires.
        </p>
        <p className="text-slate-500 text-sm">
          Développé en collaboration avec un ami · Unity · C#
        </p>
      </section>

      {/* ── Video ── */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="relative w-full rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
          <video
            src="/assets/samurail-ball/make-in-off-samurai-ball.mp4"
            autoPlay
            playsInline
            muted
            loop
            controls
            className="w-full"
          />
        </div>
      </section>

      {/* ── 3D Modeling ── */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="border-t border-slate-800 pt-16">
          <h2 className="text-2xl font-semibold mb-2">Modélisation 3D</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-xl">
            Les personnages et environnements ont été modélisés et animés
            entièrement from scratch. Voici quelques aperçus des animations en
            action.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {GIFS.map(({ src, label }) => (
              <div
                key={src}
                className="rounded-lg overflow-hidden border border-slate-700 bg-slate-800 group"
              >
                <img
                  src={src}
                  alt={label}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <p className="text-xs text-slate-400 text-center py-2 px-3">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Steam CTA ── */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="border-t border-slate-800 pt-16 flex flex-col items-center text-center gap-4">
          <p className="text-slate-400 text-sm">Le jeu arrive bientôt sur Steam.</p>
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-600 text-slate-400 text-sm cursor-not-allowed select-none">
            <svg className="w-5 h-5 opacity-50" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.186.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0z"/>
            </svg>
            Prochainement sur Steam
          </span>
        </div>
      </section>
    </>
  );
}
