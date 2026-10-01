import { ArrowUpLeft, ArrowUpRight, BadgeCheck, BellRing, Truck } from "lucide-react";
import Image from "next/image";
import { Reveal } from "@/components/Motion";
import { SectionHeading } from "@/components/SectionHeading";
import type { Dictionary, Locale } from "@/lib/i18n";
import { site } from "@/lib/site";

// Same order as dict.connect.points.
const icons = [BadgeCheck, Truck, BellRing];

// The B2B block: sends workshops and fleet owners to bestim-connect.com.
export function Connect({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.connect;
  const Arrow = lang === "ar" ? ArrowUpLeft : ArrowUpRight;
  return (
    <section id="business" className="px-2 md:px-4">
      <div className="relative overflow-hidden rounded-screen bg-teal px-5 py-16 text-white md:px-12 md:py-24">
        <span aria-hidden className="absolute -end-32 -top-32 size-96 rounded-full bg-lime/25 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <Reveal>
            {/* Bestim Connect lockup: the wordmark + the lime CONNECT tag.
                Replace with the official logo file once it's in public/brand/. */}
            <div className="flex items-center gap-2.5" dir="ltr">
              <Image src="/brand/logo-word-inverse.png" alt="Bestim" width={900} height={198} className="h-8 w-auto" />
              <span className="-skew-x-12 rounded-md bg-lime px-2.5 py-1 text-sm font-bold text-ink italic">
                <span className="inline-block skew-x-12">CONNECT</span>
              </span>
            </div>
            <SectionHeading title1={t.title1} title2={t.title2} body={t.body} onDark className="mt-4 text-start" />
            <a
              href={site.connectUrl}
              target="_blank"
              rel="noopener"
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-lime px-7 py-4 font-semibold text-ink shadow-glow transition-transform hover:-translate-y-0.5"
            >
              {t.cta}
              <Arrow className="size-5" />
            </a>
          </Reveal>

          <ul className="space-y-4">
            {t.points.map((point, i) => {
              const Icon = icons[i];
              return (
                <li key={point.title}>
                  <Reveal
                    delay={i * 0.08}
                    className="flex items-start gap-4 rounded-metric border border-white/15 bg-white/10 p-6 backdrop-blur-sm"
                  >
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-lime text-ink">
                      <Icon className="size-5" />
                    </span>
                    <span>
                      <span className="block text-lg font-semibold">{point.title}</span>
                      <span className="mt-1 block leading-7 text-white opacity-75">{point.body}</span>
                    </span>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
