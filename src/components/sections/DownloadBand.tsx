import Image from "next/image";
import { Parallax, Reveal } from "@/components/Motion";
import { Phone } from "@/components/Phone";
import { screen } from "@/screens";
import { StoreBadges } from "@/components/StoreBadges";
import type { Dictionary, Locale } from "@/lib/i18n";

// The closing call to action: where every "Get the app" button lands.
export function DownloadBand({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.cta;
  return (
    <section id="download" className="px-2 pt-10 md:px-4 md:pt-24">
      {/* The clip lets the phone rise above the band but cuts it at the band's bottom edge. */}
      <div className="relative rounded-screen bg-ink text-paper [clip-path:inset(-12rem_0_0_0_round_0_0_32px_32px)]">
        <div aria-hidden className="absolute inset-0 overflow-hidden rounded-screen">
          <Image
            src="/brand/logo-word-inverse.png"
            alt=""
            width={900}
            height={198}
            className="absolute -bottom-10 start-1/2 w-[120%] max-w-none -translate-x-1/2 opacity-[0.04] rtl:translate-x-1/2"
          />
          <span className="absolute -end-24 top-1/2 size-[30rem] -translate-y-1/2 rounded-full bg-lime/20 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:px-12 md:py-0">
          <Reveal className="md:py-24">
            <p className="text-lime">{t.eyebrow}</p>
            <h2 className="mt-4 text-4xl leading-[1.25] font-bold md:text-5xl rtl:leading-[1.45]">
              <span className="block">{t.title1}</span>
              <span className="block text-paper/45">{t.title2}</span>
            </h2>
            <StoreBadges dict={dict} onDark className="mt-10" />
          </Reveal>
          <Parallax distance={-30} className="mx-auto -mb-40 md:-mt-16 md:-mb-28">
            <Phone src={screen(lang, "expenses")} alt={t.alt} className="w-64 rotate-6 md:w-80 rtl:-rotate-6" />
          </Parallax>
        </div>
      </div>
    </section>
  );
}
