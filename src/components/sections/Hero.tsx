import { Check, Droplet, Mic, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import { Parallax } from "@/components/Motion";
import { Phone, screen } from "@/components/Phone";
import { StoreBadges } from "@/components/StoreBadges";
import type { Dictionary, Locale } from "@/lib/i18n";

// A small white card that floats beside the hero phone.
function FloatCard({
  icon,
  tint,
  title,
  sub,
}: {
  icon: ReactNode;
  tint: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex w-max max-w-64 items-center gap-3 rounded-metric bg-white p-3.5 pe-5 text-start shadow-float">
      <span className={`grid size-11 shrink-0 place-items-center rounded-full ${tint}`}>{icon}</span>
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-muted">{sub}</span>
      </span>
    </div>
  );
}

export function Hero({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.hero;
  return (
    <section className="relative overflow-clip px-4 pt-36 pb-20 md:pt-44">
      {/* Soft brand glow behind the phone */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-72 -z-10 mx-auto h-[760px] max-w-5xl rounded-full bg-[radial-gradient(closest-side,rgb(211_245_61/0.6),rgb(8_115_111/0.12)_62%,transparent)] blur-2xl"
      />

      {/* The hero enters with a CSS animation (not Reveal) so it shows before any JavaScript loads. */}
      <div className="mx-auto max-w-4xl animate-rise text-center">
        <p className="inline-flex items-center gap-2.5 rounded-full border border-line bg-white px-4 py-1.5 text-sm text-muted">
          <span className="size-2 rounded-full bg-teal ring-4 ring-teal/15" />
          {t.eyebrow}
        </p>
        <h1 className="mt-6 text-balance text-[2.5rem] leading-[1.2] font-bold md:text-6xl md:leading-[1.18]">
          <span className="block">{t.title1}</span>
          <span className="block text-muted/55">{t.title2}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted">{t.body}</p>
        <StoreBadges dict={dict} className="mt-10 justify-center" />
      </div>

      <div className="relative mx-auto mt-16 w-fit">
        <Phone
          src={screen(lang, "home")}
          alt={t.phoneAlt}
          priority
          className="w-64 animate-rise [animation-delay:150ms] md:w-80"
        />

        {/* Floating cards: positions use start/end, so they mirror in Arabic. */}
        <Parallax distance={-50} className="absolute -top-7 -start-6 scale-90 md:top-24 md:-start-56 md:scale-100">
          <FloatCard
            tint="bg-amber"
            icon={<Droplet className="size-5 text-ink" />}
            title={t.reminderTitle}
            sub={t.reminderSub}
          />
        </Parallax>
        <Parallax distance={-90} className="absolute top-72 -end-60 hidden md:block">
          <FloatCard
            tint="bg-sky"
            icon={<TrendingUp className="size-5 text-ink" />}
            title={t.expenseValue}
            sub={t.expenseLabel}
          />
        </Parallax>
        <Parallax distance={-70} className="absolute -end-6 -bottom-6 scale-90 md:bottom-44 md:end-auto md:-start-52 md:scale-100">
          <FloatCard
            tint="bg-lime"
            icon={<Check className="size-5 text-ink" strokeWidth={2.5} />}
            title={t.savedTitle}
            sub={t.savedSub}
          />
        </Parallax>
        <Parallax distance={-40} className="absolute bottom-20 -end-72 hidden md:block">
          <div className="flex max-w-64 items-start gap-3 rounded-metric bg-ink p-4 text-start text-paper shadow-float">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-lime">
              <Mic className="size-4 text-ink" />
            </span>
            <span className="text-sm leading-6 font-medium">{t.voice}</span>
          </div>
        </Parallax>
      </div>
    </section>
  );
}
