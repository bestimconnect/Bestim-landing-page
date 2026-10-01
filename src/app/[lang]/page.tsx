import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Bento } from "@/components/sections/Bento";
import { Connect } from "@/components/sections/Connect";
import { DownloadBand } from "@/components/sections/DownloadBand";
import { Faq } from "@/components/sections/Faq";
import { Features } from "@/components/sections/Features";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Trust } from "@/components/sections/Trust";
import { VehicleStrip } from "@/components/sections/VehicleStrip";
import { alternates, getDictionary, hasLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { alternates: alternates(lang) } : {};
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <>
      <Hero lang={lang} dict={dict} />
      <VehicleStrip dict={dict} />
      <Features dict={dict} />
      <HowItWorks lang={lang} dict={dict} />
      <Bento lang={lang} dict={dict} />
      <Trust lang={lang} dict={dict} />
      <Connect lang={lang} dict={dict} />
      <Faq dict={dict} />
      <DownloadBand lang={lang} dict={dict} />
    </>
  );
}
