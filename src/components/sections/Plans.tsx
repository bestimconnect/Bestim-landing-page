import { Reveal } from "@/components/Motion";
import { SectionHeading } from "@/components/SectionHeading";
import type { Dictionary, Locale } from "@/lib/i18n";
import { getPlans, planLines } from "@/lib/plans";
import { PlansCards, type PlanCard } from "./PlansCards";

// Plan cards (decisions Q121). Names, prices, the badge and every line come from the plans table, so the dashboard controls them.
// A paid plan without a price says "Coming soon" (the store-badge wording); price 0 = free.
export async function Plans({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const plans = await getPlans();
  if (!plans.length) return null;
  const t = dict.plans;
  const ar = lang === "ar";
  const name = (i: number) => (ar ? plans[i].name_ar : plans[i].name_en);
  const cards: PlanCard[] = plans.map((p, i) => {
    const lines = planLines(t, p, plans[i - 1]);
    return {
      id: p.id, name: name(i), desc: ar ? p.desc_ar : p.desc_en, popular: p.is_popular,
      monthly: p.price_monthly, yearly: p.price_yearly,
      caption: i > 0 ? t[lines.length ? "everything" : "same"].replace("{plan}", name(i - 1)) : t.includes,
      lines,
    };
  });
  const l = { free: t.free, perMonth: t.perMonth, perYear: t.perYear, popular: t.popular, monthly: t.monthly, yearly: t.yearly, save: t.save, soon: dict.store.soon, cta: dict.nav.download };

  return (
    <section id="plans" className="scroll-mt-24 px-4 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal><SectionHeading {...t} /></Reveal>
        <PlansCards cards={cards} href={`/${lang}#download`} l={l} />
        <p className="mt-8 text-center text-sm text-muted">{t.note}</p>
      </div>
    </section>
  );
}
