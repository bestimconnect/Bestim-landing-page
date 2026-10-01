"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Phone, screen } from "@/components/Phone";
import { SectionHeading } from "@/components/SectionHeading";
import type { Dictionary, Locale } from "@/lib/i18n";

// Same order as dict.how.steps.
const shots = ["voice", "review", "reminders"];

// The section is three screens tall. Its content stays pinned while you scroll
// through it, and the scroll position picks which of the three steps is active.
export function HowItWorks({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.how;
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(Math.min(2, Math.floor(v * 3))));

  const card = (i: number) => (
    <div
      className={`rounded-metric border p-6 text-start transition-all duration-500 ${
        active === i ? "border-lime/70 bg-white/[0.08]" : "border-white/10 bg-white/[0.03] opacity-50"
      }`}
    >
      <p className="text-sm font-semibold text-lime">
        {t.stepLabel} {i + 1}
      </p>
      <h3 className="mt-1.5 text-xl font-semibold">{t.steps[i].title}</h3>
      <p className="mt-2 leading-7 text-paper/70">{t.steps[i].body}</p>
    </div>
  );

  return (
    <section id="how" ref={ref} className="relative mx-2 h-[300svh] rounded-screen bg-ink text-paper md:mx-4">
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center gap-6 overflow-clip px-4 pt-24 pb-6 md:gap-10">
        <SectionHeading {...t} onDark />
        <div className="grid w-full max-w-6xl items-center gap-5 md:grid-cols-[1fr_auto_1fr] md:gap-12">
          <div className="hidden md:block">{card(1)}</div>
          <Phone className="mx-auto h-[42svh] w-auto md:h-[54svh]">
            {shots.map((name, i) => (
              <Image
                key={name}
                src={screen(lang, name)}
                alt={t.steps[i].alt}
                fill
                sizes="300px"
                className={`object-cover transition-opacity duration-500 ${active === i ? "" : "opacity-0"}`}
              />
            ))}
          </Phone>
          <div className="hidden gap-28 md:grid">
            {card(0)}
            {card(2)}
          </div>
          {/* Phones: one card slot under the phone, the active step fades in. */}
          <div className="grid md:hidden">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`col-start-1 row-start-1 transition-opacity duration-500 ${active === i ? "" : "opacity-0"}`}
              >
                {card(i)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
