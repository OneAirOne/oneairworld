import { useTranslation } from "react-i18next";

const STACK = [
  { label: "Colyseus",  descKey: "colyseus" },
  { label: "Matter.js", descKey: "matter" },
  { label: "Phaser 3",  descKey: "phaser" },
  { label: "React",     descKey: "react" },
  { label: "Tailwind",  descKey: "tailwind" },
  { label: "Docker",    descKey: "docker" },
];

export default function OneAirWorldContent() {
  const { t } = useTranslation("projects");
  return (
    <>
      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16">
        <p className="text-brand-primary text-xs font-semibold tracking-widest uppercase mb-4">
          {t("oneair-world.page.kicker")}
        </p>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          {t("oneair-world.name")}
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mb-4">
          {t("oneair-world.page.hero")}
        </p>
        <p className="text-slate-500 text-sm mb-4">
          {t("oneair-world.page.subCaption")}
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
          {t("oneair-world.page.videoCaption")}
        </p>
      </section>

      {/* ── Stack ── */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="border-t border-brand-surface pt-16">
          <h2 className="text-2xl font-semibold mb-8">{t("oneair-world.page.stackTitle")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
            {STACK.map(({ label, descKey }) => (
              <div key={label} className="rounded-lg border border-slate-700 bg-brand-surface/50 px-5 py-4">
                <p className="text-white font-semibold text-sm mb-1">{label}</p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {t(`oneair-world.page.stack.${descKey}`)}
                </p>
              </div>
            ))}
          </div>

          {/* Architecture schema */}
          <h3 className="text-lg font-semibold mb-4">{t("oneair-world.page.architectureTitle")}</h3>
          <div className="rounded-xl overflow-hidden border border-slate-700 bg-brand-surface">
            <img
              src="/assets/oneair-world/architecture.png"
              alt={t("oneair-world.page.architectureAlt")}
              className="w-full object-contain"
            />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="border-t border-brand-surface pt-16 flex flex-col items-center text-center gap-4">
          <p className="text-slate-400 text-sm">{t("oneair-world.page.ctaText")}</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-500 text-slate-300 text-sm hover:border-white hover:text-white transition-colors"
          >
            {t("oneair-world.page.ctaLink")}
          </a>
        </div>
      </section>
    </>
  );
}
