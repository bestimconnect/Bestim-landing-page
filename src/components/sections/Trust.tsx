import { Check, QrCode } from "lucide-react";
import { Parallax, Reveal } from "@/components/Motion";
import { Phone, screen } from "@/components/Phone";
import { SectionHeading } from "@/components/SectionHeading";
import type { Dictionary, Locale } from "@/lib/i18n";

export function Trust({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.trust;
  return (
    <section className="px-4 py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-2">
        <Reveal className="relative mx-auto w-fit">
          <span aria-hidden className="absolute inset-0 -z-10 scale-125 rounded-full bg-mint blur-3xl" />
          <Phone src={screen(lang, "record")} alt={t.alt} className="w-72 md:w-80" />
          <Parallax distance={-40} className="absolute bottom-24 -end-8 md:-end-24">
            <div className="flex w-max items-center gap-3 rounded-metric bg-white p-3.5 pe-5 shadow-float">
              <span className="grid size-11 place-items-center rounded-full bg-ink text-lime">
                <QrCode className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold">{t.chipTitle}</span>
                <span className="block text-xs text-muted">{t.chipSub}</span>
              </span>
            </div>
          </Parallax>
        </Reveal>

        <Reveal delay={0.1}>
          <SectionHeading {...t} className="text-start" />
          <ul className="mt-8 space-y-4">
            {t.points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-lg">
                <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-lime">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
