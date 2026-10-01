import { Check, Droplet, Mic, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import { Parallax } from "@/components/Motion";
import { Phone } from "@/components/Phone";
import { screen } from "@/screens";
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
    <section className="relative overflow-clip px-4 pt-28 pb-20 md:pt-32">
      {/* Soft brand glow behind the phones */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-52 -z-10 mx-auto h-[760px] max-w-6xl rounded-full bg-[radial-gradient(closest-side,rgb(211_245_61/0.6),rgb(8_115_111/0.12)_62%,transparent)] blur-2xl"
      />

      {/* The hero enters with a CSS animation (not Reveal) so it shows before any JavaScript loads. */}
      <div className="mx-auto max-w-5xl animate-rise text-center">
        <p className="inline-flex items-center gap-2.5 rounded-full border border-line bg-white px-4 py-1.5 text-sm text-muted">
          <span className="size-2 rounded-full bg-teal ring-4 ring-teal/15" />
          {t.eyebrow}
        </p>
        <h1 className="mt-5 text-balance text-[2.25rem] leading-[1.2] font-bold md:text-5xl lg:text-[3.5rem] rtl:leading-[1.45]">
          <span className="block">{t.title1}</span>
          <span className="block text-muted opacity-55">{t.title2}</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted">{t.body}</p>
        <StoreBadges dict={dict} className="mt-8 justify-center" />
      </div>

      {/* Three phones, fanned: the vehicle dashboard in front, expenses and the voice step behind.
          Positions use start/end and the tilt flips with rtl:, so the fan mirrors in Arabic. */}
      <div className="relative isolate mx-auto mt-12 w-fit">
        <Parallax distance={-24} className="absolute top-14 -start-44 -z-10 hidden md:block">
          <Phone
            src={screen(lang, "expenses")}
            priority
            className="w-64 -rotate-8 animate-rise [animation-delay:300ms] rtl:rotate-8"
          />
        </Parallax>
        <Parallax distance={-24} className="absolute top-14 -end-44 -z-10 hidden md:block">
          {/* Arabic has no "listening" capture (no Arabic recognition in the simulator), so it shows the review step. */}
          <Phone
            src={screen(lang, lang === "ar" ? "review" : "voice")}
            priority
            className="w-64 rotate-8 animate-rise [animation-delay:400ms] rtl:-rotate-8"
          />
        </Parallax>
        <Phone
          src={screen(lang, "vehicles")}
          alt={t.phoneAlt}
          priority
          className="w-72 animate-rise [animation-delay:150ms] md:w-[22rem]"
        />

        {/* Floating cards. Phones and tablets: two cards on the front phone's edges.
            Computers: all four, out on the edges of the side phones. */}
        <Parallax distance={-50} className="absolute top-8 -start-6 z-10 scale-90 lg:top-6 lg:-start-[21rem] lg:scale-100">
          <FloatCard
            tint="bg-amber"
            icon={<Droplet className="size-5 text-ink" />}
            title={t.reminderTitle}
            sub={t.reminderSub}
          />
        </Parallax>
        <Parallax distance={-90} className="absolute top-2 -end-[21rem] z-10 hidden lg:block">
          <FloatCard
            tint="bg-sky"
            icon={<TrendingUp className="size-5 text-ink" />}
            title={t.expenseValue}
            sub={t.expenseLabel}
          />
        </Parallax>
        <Parallax distance={-70} className="absolute -end-6 -bottom-6 z-10 scale-90 lg:bottom-36 lg:end-auto lg:-start-[20rem] lg:scale-100">
          <FloatCard
            tint="bg-lime"
            icon={<Check className="size-5 text-ink" strokeWidth={2.5} />}
            title={t.savedTitle}
            sub={t.savedSub}
          />
        </Parallax>
        <Parallax distance={-40} className="absolute bottom-24 -end-[23rem] z-10 hidden lg:block">
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
