const TECH = ["React", "Zustand", "Go", "Kubernetes", "PostgreSQL"];

function TechChip({ label }: { label: string }) {
  return (
    <span className="inline-block bg-brand/10 border border-brand/20 text-brand/80 text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">
      {label}
    </span>
  );
}

export default function ActimicroContent() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-20">
        <p className="text-brand text-xs font-semibold tracking-widest uppercase mb-4">
          Réalisation professionnelle · Everblix · 2019 – 2026
        </p>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          Actimicro
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mb-6">
          Capteur de mesure de l'activité microbiologique des sols. Placée directement
          en plein champ, la cloche de mesure enregistre automatiquement toutes les
          quatre heures trois indicateurs clés — concentration en CO₂, température
          et humidité du sol — pour permettre aux agriculteurs d'adapter leurs
          pratiques et d'optimiser leurs rendements.
        </p>

        {/* Objet connecté */}
        <div className="flex flex-col items-center gap-2 my-8">
          <div className="w-80 rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
            <img
              src="/assets/actimicro/actimicro-objet.webp"
              alt="Actimicro — capteur de mesure en plein champ"
              className="w-full object-cover"
            />
          </div>
          <p className="text-xs text-slate-500">Cloche de mesure déployée en champ</p>
        </div>
      </section>

      {/* ── Application web ── */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="border-t border-slate-800 pt-16">
          <h2 className="text-2xl font-semibold mb-2">Application de supervision</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-4 max-w-xl">
            L'application web centralise la gestion de la flotte de capteurs déployés.
            Elle permet de visualiser en temps réel les mesures remontées par chaque
            dispositif, d'accéder à l'historique des données sur plusieurs saisons,
            de recevoir des alertes sur les événements notables et de consulter des
            rapports réguliers sur les indicateurs de vitalité des sols. Les commandes
            peuvent être envoyées aux capteurs pour les mettre à jour ou les reconfigurer
            à distance.
          </p>
          <div className="flex flex-wrap gap-2 mb-8">
            {TECH.map((t) => (
              <TechChip key={t} label={t} />
            ))}
          </div>
          <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
            <img
              src="/assets/actimicro/actimicro-web.webp"
              alt="Actimicro — application web de supervision"
              className="w-full object-cover"
            />
          </div>
          <p className="text-xs text-slate-500 mt-3 text-center">
            Dashboard de supervision Actimicro
          </p>
        </div>
      </section>
    </>
  );
}
