export default function PepperAtelierContent() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16">
        <p className="text-brand text-xs font-semibold tracking-widest uppercase mb-4">
          Projet — Site vitrine e-commerce
        </p>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          Pepper Atelier
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mb-4">
          Site vitrine pour un artisan shaper de snowboards en bois. Pepper Atelier
          présente sa collection faite main, détaille le processus de fabrication
          planche par planche, et met en avant le savoir-faire artisanal derrière
          chaque modèle.
        </p>
        <p className="text-slate-500 text-sm">
          Vue · Vuex · Node.js · Express
        </p>
      </section>

      {/* ── Trailer ── */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="relative w-full rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
          <video
            src="/assets/pepper-atelier/trailer.mp4"
            autoPlay
            playsInline
            muted
            loop
            controls
            className="w-full"
          />
        </div>
      </section>

      {/* ── Architecture ── */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="border-t border-slate-800 pt-16">
          <h2 className="text-2xl font-semibold mb-2">Architecture</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xl">
            Le projet intègre un back-office permettant à l'artisan de gérer sa
            collection en autonomie — ajout, modification et suppression de planches
            sans toucher au code. L'accès est sécurisé par authentification.
          </p>

          {/* Admin screenshot */}
          <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-800 mb-12">
            <img
              src="/assets/pepper-atelier/admin.png"
              alt="Interface d'administration Pepper Atelier"
              className="w-full object-contain"
            />
          </div>

          {/* Schema */}
          <h3 className="text-lg font-semibold mb-4">Schéma d'architecture</h3>
          <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
            <img
              src="/assets/pepper-atelier/schema-architecture.png"
              alt="Schéma d'architecture Pepper Atelier"
              className="w-full object-contain"
            />
          </div>
        </div>
      </section>

      {/* ── Visit CTA ── */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="border-t border-slate-800 pt-16 flex flex-col items-center text-center gap-4">
          <p className="text-slate-400 text-sm">Envie de voir les planches ?</p>
          <a
            href="https://www.pepperatelier.com/home"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-500 text-slate-300 text-sm hover:border-white hover:text-white transition-colors"
          >
            Visiter Pepper Atelier →
          </a>
        </div>
      </section>
    </>
  );
}
