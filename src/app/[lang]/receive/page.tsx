import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReceiveOpen } from "@/components/ReceiveOpen";
import { StoreBadges } from "@/components/StoreBadges";
import { alternates, getDictionary, hasLocale } from "@/lib/i18n";

// Where a shared-vehicle link lands (WhatsApp tap or a camera scan). Static page:
// the token is read in the browser by ReceiveOpen. Not in the sitemap.
export async function generateMetadata({ params }: PageProps<"/[lang]/receive">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = (await getDictionary(lang)).receive;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: alternates(lang, "/receive"),
    robots: { index: false },
  };
}

export default async function ReceivePage({ params }: PageProps<"/[lang]/receive">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = dict.receive;
  return (
    <article className="mx-auto max-w-3xl px-4 pt-36 pb-16 md:pt-44">
      <h1 className="text-4xl leading-[1.25] font-bold md:text-5xl">{t.title}</h1>
      <ReceiveOpen body={t.body} open={t.open} invalid={t.invalid} />

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">{t.noApp}</h2>
        <StoreBadges dict={dict} className="mt-6" />
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">{t.stepsTitle}</h2>
        <ol className="mt-3 list-decimal space-y-2 ps-6 leading-8 text-muted marker:text-teal">
          {t.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
    </article>
  );
}
