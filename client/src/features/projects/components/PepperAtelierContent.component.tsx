import { useTranslation } from "react-i18next";

const TECH = ["Vue", "Vuex", "Node.js", "Express"];

function TechChip({ label }: { label: string }) {
  return (
    <span className="inline-block bg-brand-primary/10 border border-brand-primary/20 text-brand-primary/80 text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">
      {label}
    </span>
  );
}

export default function PepperAtelierContent() {
  const { t } = useTranslation("projects");
  return (
    <>
      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16">
        <p className="text-brand-primary text-xs font-semibold tracking-widest uppercase mb-4">
          {t("pepper-atelier-snowboard.page.kicker")}
        </p>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          {t("pepper-atelier-snowboard.page.title")}
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mb-4">
          {t("pepper-atelier-snowboard.page.hero")}
        </p>
        <p className="text-slate-500 text-sm mb-4">
          {t("pepper-atelier-snowboard.page.subCaption")}
        </p>
        <div className="flex flex-wrap gap-2">
          {TECH.map((tech) => <TechChip key={tech} label={tech} />)}
        </div>
      </section>

      {/* ── Trailer ── */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="relative w-full rounded-xl overflow-hidden border border-slate-700 bg-brand-surface">
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
        <div className="border-t border-brand-surface pt-16">
          <h2 className="text-2xl font-semibold mb-2">{t("pepper-atelier-snowboard.page.archTitle")}</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xl">
            {t("pepper-atelier-snowboard.page.archText")}
          </p>

          {/* Admin screenshot */}
          <div className="rounded-xl overflow-hidden border border-slate-700 bg-brand-surface mb-12">
            <img
              src="/assets/pepper-atelier/admin.png"
              alt={t("pepper-atelier-snowboard.page.adminAlt")}
              className="w-full object-contain"
            />
          </div>

          {/* Schema */}
          <h3 className="text-lg font-semibold mb-4">{t("pepper-atelier-snowboard.page.schemaTitle")}</h3>
          <div className="rounded-xl overflow-hidden border border-slate-700 bg-brand-surface">
            <img
              src="/assets/pepper-atelier/schema-architecture.png"
              alt={t("pepper-atelier-snowboard.page.schemaAlt")}
              className="w-full object-contain"
            />
          </div>
        </div>
      </section>

      {/* ── Visit CTA ── */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="border-t border-brand-surface pt-16 flex flex-col items-center text-center gap-4">
          <p className="text-slate-400 text-sm">{t("pepper-atelier-snowboard.page.ctaText")}</p>
          <a
            href="https://www.pepperatelier.com/home"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-500 text-slate-300 text-sm hover:border-white hover:text-white transition-colors"
          >
            {t("pepper-atelier-snowboard.page.ctaLink")}
          </a>
        </div>
      </section>
    </>
  );
}
