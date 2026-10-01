"use client";

import { useInView, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Phone } from "@/components/Phone";
import { SectionHeading } from "@/components/SectionHeading";
import type { Dictionary, Locale } from "@/lib/i18n";
import { screen } from "@/screens";

// Same order as dict.how.steps.
const shots = ["voice", "review", "reminders"] as const;
const STEP_MS = 4500; // keep in step with --animate-progress in globals.css

// Three steps around one phone. The steps play by themselves while the section
// is on screen, and a tap on any step jumps to it. The page scrolls normally:
// nothing is pinned.
export function HowItWorks({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.how;
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const inView = useInView(ref, { amount: 0.4 });
  const reduced = useReducedMotion();
  const playing = inView && !reduced;

  // Restarts whenever the step changes, so a tap gets a full turn before moving on.
  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => setActive((a) => (a + 1) % shots.length), STEP_MS);
    return () => clearTimeout(id);
  }, [playing, active]);

  const card = (i: number) => (
    <button
      type="button"
      onClick={() => setActive(i)}
      aria-pressed={active === i}
      className={`relative block w-full cursor-pointer overflow-hidden rounded-metric border p-6 text-start transition-all duration-500 ${
        active === i
          ? "border-lime/70 bg-white/[0.08]"
          : "border-white/10 bg-white/[0.03] opacity-55 hover:opacity-90"
      }`}
    >
      <span className="block text-sm font-semibold text-lime">
        {t.stepLabel} {i + 1}
      </span>
      <span className="mt-1.5 block text-xl font-semibold">{t.steps[i].title}</span>
      <span className="mt-2 block leading-7 text-paper opacity-70">{t.steps[i].body}</span>
      {active === i && playing && (
        <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left animate-progress bg-lime rtl:origin-right" />
      )}
    </button>
  );

  return (
    <section id="how" ref={ref} className="mx-2 rounded-screen bg-ink px-4 py-20 text-paper md:mx-4 md:py-28">
      <SectionHeading {...t} onDark />
      <div className="mx-auto mt-12 grid max-w-6xl items-center gap-8 md:grid-cols-[1fr_auto_1fr] md:gap-12">
        <div className="hidden md:block">{card(1)}</div>
        <Phone className="mx-auto w-64 md:w-72">
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
        <div className="hidden gap-8 md:grid">
          {card(0)}
          {card(2)}
        </div>
        {/* Phones: the three steps as a list under the phone. */}
        <div className="grid gap-3 md:hidden">
          {card(0)}
          {card(1)}
          {card(2)}
        </div>
      </div>
    </section>
  );
}
