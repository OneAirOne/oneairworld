import { useTranslation } from "react-i18next";

const TECH = ["Unity", "C#"];

function TechChip({ label }: { label: string }) {
  return (
    <span className="inline-block bg-brand-primary/10 border border-brand-primary/20 text-brand-primary/80 text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">
      {label}
    </span>
  );
}

const GIFS = [
  { src: "/assets/samurail-ball/fire.gif",        labelKey: "fire" },
  { src: "/assets/samurail-ball/double_jump.gif", labelKey: "doubleJump" },
  { src: "/assets/samurail-ball/front_hit.gif",   labelKey: "frontHit" },
];

export default function SamuraiBallContent() {
  const { t } = useTranslation("projects");
  return (
    <>
      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16">
        <p className="text-brand-primary text-xs font-semibold tracking-widest uppercase mb-4">
          {t("samurai-ball.page.kicker")}
        </p>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          {t("samurai-ball.name")}
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mb-4">
          {t("samurai-ball.page.hero")}
        </p>
        <p className="text-slate-500 text-sm mb-4">
          {t("samurai-ball.page.collab")}
        </p>
        <div className="flex flex-wrap gap-2">
          {TECH.map((tech) => <TechChip key={tech} label={tech} />)}
        </div>
      </section>

      {/* ── Fight video ── */}
      <section className="max-w-4xl mx-auto px-6 pb-8">
        <div className="relative w-full rounded-xl overflow-hidden border border-slate-700 bg-brand-surface">
          <video
            src="/assets/samurail-ball/fight-ex.mp4"
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
        <div className="border-t border-brand-surface pt-16">
          <h2 className="text-2xl font-semibold mb-2">{t("samurai-ball.page.modelingTitle")}</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-xl">
            {t("samurai-ball.page.modelingText")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {GIFS.map(({ src, labelKey }) => {
              const label = t(`samurai-ball.page.gifs.${labelKey}`);
              return (
                <div
                  key={src}
                  className="rounded-lg overflow-hidden border border-slate-700 bg-brand-surface group"
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
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Making-off ── */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="border-t border-brand-surface pt-16">
          <h2 className="text-2xl font-semibold mb-8">{t("samurai-ball.page.makingOffTitle")}</h2>
          <div className="relative w-full rounded-xl overflow-hidden border border-slate-700 bg-brand-surface">
            <video
              src="/assets/samurail-ball/make-in-off-samurai-ball.mp4"
              autoPlay
              playsInline
              loop
              controls
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* ── Steam CTA ── */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="border-t border-brand-surface pt-16 flex flex-col items-center text-center gap-4">
          <p className="text-slate-400 text-sm">{t("samurai-ball.page.steamCta")}</p>
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-600 text-slate-400 text-sm cursor-not-allowed select-none">
            <svg className="w-5 h-5 opacity-50" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.186.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0z"/>
            </svg>
            {t("samurai-ball.page.steamBadge")}
          </span>
        </div>
      </section>
    </>
  );
}
