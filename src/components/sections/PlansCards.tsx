"use client";

import { Car, Check, Crown, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Reveal } from "@/components/Motion";

export type PlanCard = {
  id: string; name: string; desc: string; popular: boolean;
  monthly: number | null; yearly: number | null; caption: string; lines: string[];
};
type Labels = { free: string; perMonth: string; perYear: string; popular: string; monthly: string; yearly: string; save: string; soon: string; cta: string };

const ICONS = [Car, Zap, Crown];
const fmt = (n: number) => n.toLocaleString("en-US");

// Plan cards with a monthly / yearly switch (decisions Q121). The switch only shows when a paid plan has both prices.
export function PlansCards({ cards, href, l }: { cards: PlanCard[]; href: string; l: Labels }) {
  const canSwitch = cards.some((c) => c.monthly && c.yearly != null);
  const [yearly, setYearly] = useState(canSwitch);
  const on = canSwitch && yearly;

  const price = (c: PlanCard) => {
    if (c.monthly === 0) return <span className="text-5xl font-bold">{l.free}</span>;
    if (c.monthly == null) return <span className="inline-block rounded-full bg-lime px-4 py-1.5 text-sm font-semibold text-ink">{l.soon}</span>;
    const n = on && c.yearly != null ? c.yearly : c.monthly;
    const cut = c.yearly != null ? Math.round(100 - (c.yearly / (c.monthly * 12)) * 100) : 0;
    return (
      <>
        <span className="text-5xl font-bold">{fmt(n)}</span>
        <span className="ms-2 text-base opacity-65">{on && c.yearly != null ? l.perYear : l.perMonth}</span>
        {on && cut > 0 && <span className="ms-3 rounded-full bg-lime px-2.5 py-0.5 align-middle text-xs font-semibold text-ink">{l.save.replace("{n}", String(cut))}</span>}
      </>
    );
  };

  return (
    <>
      {canSwitch && (
        <div className="mt-8 flex items-center justify-center gap-4 text-[15px] font-medium">
          <span className={on ? "text-muted" : "text-ink"}>{l.monthly}</span>
          <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label={`${l.monthly} / ${l.yearly}`}
            onClick={() => setYearly(!yearly)}
            className="relative h-8 w-14 rounded-full bg-ink transition-colors"
          >
            <span
              className="absolute top-1 size-6 rounded-full bg-lime transition-[inset-inline-start] duration-200"
              style={{ insetInlineStart: on ? "calc(100% - 1.75rem)" : "0.25rem" }}
            />
          </button>
          <span className={on ? "text-ink" : "text-muted"}>{l.yearly}</span>
        </div>
      )}
      <div className="mt-12 flex flex-wrap items-stretch justify-center gap-6">
        {cards.map((c, i) => {
          const Icon = ICONS[i % ICONS.length];
          const dark = c.popular;
          return (
            <Reveal key={c.id} delay={i * 0.08} className="w-full md:w-[calc((100%-3rem)/3)]">
              <article className={`relative flex h-full flex-col gap-6 rounded-[28px] p-8 ${dark ? "bg-ink text-paper shadow-float" : "border border-line bg-white shadow-card"}`}>
                {dark && <span className="absolute end-6 top-6 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{l.popular}</span>}
                <div className="flex items-center gap-4">
                  <span className={`grid size-14 place-items-center rounded-2xl ${dark ? "bg-lime text-ink" : "bg-mint text-teal"}`}>
                    <Icon className="size-6" />
                  </span>
                  <h3 className="text-2xl font-bold">{c.name}</h3>
                </div>
                <p className={`min-h-12 text-[15px] leading-6 ${dark ? "opacity-70" : "text-muted"}`}>{c.desc}</p>
                <p>{price(c)}</p>
                <div>
                  <p className="mb-4 font-semibold">{c.caption}</p>
                  <ul className="space-y-3">
                    {c.lines.map((line) => (
                      <li key={line} className="flex items-start gap-3">
                        <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${dark ? "bg-lime text-ink" : "bg-teal text-white"}`}>
                          <Check className="size-3" strokeWidth={3} />
                        </span>
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href={href}
                  className={`mt-auto flex h-14 items-center justify-center rounded-full font-semibold transition-transform hover:-translate-y-0.5 ${dark ? "bg-lime text-ink shadow-glow" : "bg-ink text-paper"}`}
                >
                  {l.cta}
                </Link>
              </article>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}
