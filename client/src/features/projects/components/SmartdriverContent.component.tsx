const TECH = ["React", "Electron", "Communication série"];

function TechChip({ label }: { label: string }) {
  return (
    <span className="inline-block bg-brand-primary/10 border border-brand-primary/20 text-brand-primary/80 text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">
      {label}
    </span>
  );
}

export default function SmartdriverContent() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-20">
        <p className="text-brand-primary text-xs font-semibold tracking-widest uppercase mb-4">
          Réalisation professionnelle · Everblix · 2019 – 2026
        </p>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          Smartdriver
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mb-6">
          Solution universelle pour le pilotage des moteurs. Le Smartdriver agit
          comme un traducteur de protocoles — il convertit les commandes entrantes
          dans le langage spécifique requis par chaque moteur ou actionneur,
          permettant de remplacer des équipements obsolètes sans modifier
          l'installation existante. Jusqu'à 6 modules de pilotage par boîtier,
          il s'adresse à la robotique industrielle, aux machines CNC, à
          l'automatisation de laboratoire et à l'instrumentation scientifique.
        </p>

        {/* Objet connecté */}
        <div className="flex flex-col items-center gap-2 my-8">
          <div className="w-80 rounded-xl overflow-hidden border border-slate-700 bg-brand-surface">
            <img
              src="/assets/smartdriver/smartdriver-objet.jpeg"
              alt="Smartdriver — boîtier de pilotage moteur"
              className="w-full object-cover"
            />
          </div>
          <p className="text-xs text-slate-500">Boîtier Smartdriver — jusqu'à 6 modules de pilotage</p>
        </div>
      </section>

      {/* ── Application desktop ── */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="border-t border-brand-surface pt-16">
          <h2 className="text-2xl font-semibold mb-2">Application de configuration</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-4 max-w-xl">
            Application desktop développée avec Electron permettant de configurer
            et tuner les modules Smartdriver via connexion USB. Elle offre une
            interface intuitive pour paramétrer les moteurs, envoyer des commandes
            directes via terminal série, effectuer des mises à jour firmware et
            monitorer l'état des axes en temps réel.
          </p>
          <div className="flex flex-wrap gap-2 mb-8">
            {TECH.map((t) => (
              <TechChip key={t} label={t} />
            ))}
          </div>
          <div className="rounded-xl overflow-hidden border border-slate-700 bg-brand-surface">
            <img
              src="/assets/smartdriver/smartdriver-web.webp"
              alt="Smartdriver — application de configuration"
              className="w-full object-cover"
            />
          </div>
          <p className="text-xs text-slate-500 mt-3 text-center">
            Interface de configuration et tuning Smartdriver
          </p>
        </div>
      </section>
    </>
  );
}
