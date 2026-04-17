const STACK = [
  { label: "Colyseus",  desc: "Framework multijoueur backend — gestion des rooms et synchronisation d'état en temps réel" },
  { label: "Matter.js", desc: "Moteur physique côté serveur — collisions, vélocités, corps rigides" },
  { label: "Phaser 3",  desc: "Moteur de jeu frontend — rendu de la scène, animations, inputs" },
  { label: "React",     desc: "Interface utilisateur — overlays, dialogues, écrans hors-jeu" },
  { label: "Tailwind",  desc: "Styles des composants React" },
];

export default function OneAirWorldContent() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16">
        <p className="text-brand-primary text-xs font-semibold tracking-widest uppercase mb-4">
          Projet — Making-of
        </p>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          OneairWorld
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mb-4">
          Vous explorez en ce moment même le résultat. OneairWorld est un CV
          interactif multijoueur — un monde persistant où chaque visiteur évolue
          en temps réel aux côtés des autres. Les positions, actions et états des
          joueurs sont synchronisés via WebSocket à chaque frame.
        </p>
        <p className="text-slate-500 text-sm mb-4">
          Projet initié il y a 4 ans — plusieurs cycles de tests et de recherches de technologies.
        </p>
        <div className="flex flex-wrap gap-2">
          {STACK.map(({ label }) => (
            <span key={label} className="inline-block bg-brand-primary/10 border border-brand-primary/20 text-brand-primary/80 text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* ── Video ── */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div className="relative w-full rounded-xl overflow-hidden border border-slate-700 bg-brand-surface">
          <video
            src="/assets/oneair-world/making-off.mp4"
            autoPlay
            playsInline
            muted
            loop
            controls
            className="w-full"
          />
        </div>
        <p className="text-slate-500 text-sm mt-4 max-w-2xl">
          Les données de chaque joueur — position, direction, état — sont émises
          vers le serveur à chaque input et broadcastées à tous les clients
          connectés à la même room Colyseus. La physique (Matter.js) tourne
          exclusivement côté serveur&nbsp;: le client envoie des inputs, le serveur
          répond avec l'état autoritaire.
        </p>
      </section>

      {/* ── Stack ── */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="border-t border-brand-surface pt-16">
          <h2 className="text-2xl font-semibold mb-8">Stack technique</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
            {STACK.map(({ label, desc }) => (
              <div key={label} className="rounded-lg border border-slate-700 bg-brand-surface/50 px-5 py-4">
                <p className="text-white font-semibold text-sm mb-1">{label}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Architecture schema */}
          <h3 className="text-lg font-semibold mb-4">Schéma d'architecture</h3>
          <div className="rounded-xl overflow-hidden border border-slate-700 bg-brand-surface">
            <img
              src="/assets/oneair-world/architecture.png"
              alt="Schéma d'architecture OneairWorld"
              className="w-full object-contain"
            />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="border-t border-brand-surface pt-16 flex flex-col items-center text-center gap-4">
          <p className="text-slate-400 text-sm">Vous y êtes déjà — retournez explorer le monde.</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-500 text-slate-300 text-sm hover:border-white hover:text-white transition-colors"
          >
            Retourner sur l'accueil →
          </a>
        </div>
      </section>
    </>
  );
}
