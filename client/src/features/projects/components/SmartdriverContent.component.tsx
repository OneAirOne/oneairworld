import { useTranslation } from "react-i18next";

const TECH = ["React", "Electron", "Communication série"];

function TechChip({ label }: { label: string }) {
  return (
    <span className="inline-block bg-brand-primary/10 border border-brand-primary/20 text-brand-primary/80 text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">
      {label}
    </span>
  );
}

export default function SmartdriverContent() {
  const { t } = useTranslation("projects");
  return (
    <>
      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-20">
        <p className="text-brand-primary text-xs font-semibold tracking-widest uppercase mb-4">
          {t("smartdriver.page.kicker")}
        </p>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          {t("smartdriver.name")}
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mb-6">
          {t("smartdriver.page.hero")}
        </p>

        {/* Objet connecté */}
        <div className="flex flex-col items-center gap-2 my-8">
          <div className="w-80 rounded-xl overflow-hidden border border-slate-700 bg-brand-surface">
            <img
              src="/assets/smartdriver/smartdriver-objet.jpeg"
              alt={t("smartdriver.page.heroImageAlt")}
              className="w-full object-cover"
            />
          </div>
          <p className="text-xs text-slate-500">{t("smartdriver.page.heroCaption")}</p>
        </div>
      </section>

      {/* ── Application desktop ── */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="border-t border-brand-surface pt-16">
          <h2 className="text-2xl font-semibold mb-2">{t("smartdriver.page.section2Title")}</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-4 max-w-xl">
            {t("smartdriver.page.section2Text")}
          </p>
          <div className="flex flex-wrap gap-2 mb-8">
            {TECH.map((tech) => (
              <TechChip key={tech} label={tech} />
            ))}
          </div>
          <div className="rounded-xl overflow-hidden border border-slate-700 bg-brand-surface">
            <img
              src="/assets/smartdriver/smartdriver-web.webp"
              alt={t("smartdriver.page.section2ImageAlt")}
              className="w-full object-cover"
            />
          </div>
          <p className="text-xs text-slate-500 mt-3 text-center">
            {t("smartdriver.page.section2Caption")}
          </p>
        </div>
      </section>
    </>
  );
}
