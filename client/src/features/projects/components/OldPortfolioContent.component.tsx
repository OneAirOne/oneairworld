const TECH = ["JavaScript"];

function TechChip({ label }: { label: string }) {
  return (
    <span className="inline-block bg-brand-primary/10 border border-brand-primary/20 text-brand-primary/80 text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">
      {label}
    </span>
  );
}

export default function OldPortfolioContent() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16">
        <p className="text-brand-primary text-xs font-semibold tracking-widest uppercase mb-4">
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
        <p className="text-slate-500 text-sm mb-4">
          Développé en sortie d'Epitech
        </p>
        <div className="flex flex-wrap gap-2">
          {TECH.map((t) => <TechChip key={t} label={t} />)}
        </div>
      </section>

      {/* ── Video ── */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="relative w-full rounded-xl overflow-hidden border border-slate-700 bg-brand-surface">
          <video
            src="/assets/old-portfolio/old-portfolio.mp4"
            autoPlay
            playsInline
            muted
            loop
            controls
            className="w-full"
          />
        </div>
      </section>

      {/* ── Visit CTA ── */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="border-t border-brand-surface pt-16 flex flex-col items-center text-center gap-4">
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
