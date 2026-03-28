export default function OldPortfolioContent() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16">
        <p className="text-brand text-xs font-semibold tracking-widest uppercase mb-4">
          Projet — Portfolio interactif
        </p>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          Ancien portfolio
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mb-4">
          Développé en sortie d'Epitech, ce projet était déjà un concept de CV
          interactif — un monde à explorer pour découvrir mon parcours. Entièrement
          codé en JavaScript pur, sans framework ni moteur de jeu. La grande
          différence avec ce que vous explorez aujourd'hui&nbsp;: il n'était pas
          multijoueur. Chaque visiteur évoluait seul dans son propre monde.
        </p>
        <p className="text-slate-500 text-sm">
          JavaScript vanilla · Sortie d'Epitech
        </p>
      </section>

      {/* ── Video ── */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="relative w-full rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
          <video
            src="/assets/old-portfolio/old-portfolio.mov"
            autoPlay
            muted
            loop
            controls
            className="w-full"
          />
        </div>
      </section>

      {/* ── Visit CTA ── */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="border-t border-slate-800 pt-16 flex flex-col items-center text-center gap-4">
          <p className="text-slate-400 text-sm">
            Curieux de voir à quoi il ressemblait ?
          </p>
          <a
            href="https://old.erwangilbert.com/index"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-500 text-slate-300 text-sm hover:border-white hover:text-white transition-colors"
          >
            Visiter l'ancien portfolio →
          </a>
        </div>
      </section>
    </>
  );
}
