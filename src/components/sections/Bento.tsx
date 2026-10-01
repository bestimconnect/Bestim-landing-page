import { Check, Disc3, Droplet, UserRound, Wind } from "lucide-react";
import Image from "next/image";
import { Bar, CountUp, Parallax, Reveal } from "@/components/Motion";
import { Phone } from "@/components/Phone";
import { screen } from "@/screens";
import { SectionHeading } from "@/components/SectionHeading";
import type { Dictionary, Locale } from "@/lib/i18n";

const card = "h-full overflow-hidden rounded-nav border border-line/70 bg-white shadow-card";

// Demo chart: months 04..09, the same demo data as the app screenshots.
const bars = [38, 58, 86, 48, 68, 100];
// Same order as dict.bento.reminders.items.
const reminderLooks = [
  { Icon: Disc3, tint: "bg-blush text-coral" },
  { Icon: Droplet, tint: "bg-amber text-ink" },
  { Icon: Wind, tint: "bg-amber text-ink" },
];

export function Bento({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.bento;
  return (
    <section className="px-4 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading {...t} />
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-6">
          {/* Expenses */}
          <Reveal className="md:col-span-4">
            <div className={`${card} grid gap-8 p-7 md:grid-cols-2 md:p-9`}>
              <div>
                <h3 className="text-2xl font-semibold">{t.expenses.title}</h3>
                <p className="mt-2 leading-7 text-muted">{t.expenses.body}</p>
                <div className="mt-7 rounded-metric bg-ink p-5 text-paper">
                  <p className="text-sm text-paper opacity-70">{t.expenses.totalLabel}</p>
                  <CountUp to={52380} className="mt-1 block text-4xl font-bold" />
                  <p className="mt-1 text-sm text-paper opacity-70">{t.expenses.currency}</p>
                </div>
              </div>
              <div className="flex h-56 items-end gap-3 md:h-auto" dir="ltr" aria-hidden>
                {bars.map((h, i) => (
                  <div key={i} className="flex h-full flex-1 flex-col justify-end gap-2">
                    <Bar
                      height={`${h}%`}
                      delay={i * 0.08}
                      className={`rounded-field ${i === bars.length - 1 ? "bg-teal" : "bg-line"}`}
                    />
                    <span className="text-center text-xs text-muted">0{i + 4}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Reminders */}
          <Reveal delay={0.08} className="md:col-span-2">
            <div className={`${card} p-7`}>
              <h3 className="text-2xl font-semibold">{t.reminders.title}</h3>
              <p className="mt-2 leading-7 text-muted">{t.reminders.body}</p>
              <ul className="mt-6 space-y-3">
                {t.reminders.items.map((item, i) => {
                  const { Icon, tint } = reminderLooks[i];
                  return (
                    <li key={item.name} className="flex items-center gap-3 rounded-item bg-paper p-3">
                      <span className={`grid size-10 shrink-0 place-items-center rounded-full ${tint}`}>
                        <Icon className="size-5" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">{item.name}</span>
                        <span className="block text-xs text-muted">{item.sub}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>

          {/* Vehicles + share: a phone peeking from the bottom of the card */}
          {(["vehicles", "share"] as const).map((key, i) => (
            <Reveal key={key} delay={i * 0.08} className="md:col-span-2">
              <div className={`${card} relative flex flex-col p-7 pb-0`}>
                <h3 className="text-2xl font-semibold">{t[key].title}</h3>
                <p className="mt-2 leading-7 text-muted">{t[key].body}</p>
                {/* The phone sits on the card's bottom edge and is cut off by the card's own rounded corners. */}
                <div className="mt-auto h-72 pt-7">
                  {/* "vehicles" shows the home screen: the vehicle dashboard is already the hero. */}
                  <Phone src={screen(lang, key === "vehicles" ? "home" : key)} alt={t[key].alt} className="mx-auto w-60" />
                </div>
                {key === "share" && (
                  <Parallax distance={-14} className="absolute end-4 bottom-5">
                    {/* Same look as the hero's floating cards. The QR code is real: it opens bestim-eg.com. */}
                    <div className="flex items-center gap-3 rounded-metric bg-white p-2.5 pe-5 text-start shadow-float">
                      <span className="relative shrink-0 rounded-field bg-mint p-1.5">
                        <Image src="/brand/qr.svg" alt="" width={56} height={56} unoptimized className="size-14" />
                        <span className="absolute -end-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-lime ring-2 ring-white">
                          <Check className="size-3" strokeWidth={3} />
                        </span>
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">{t.share.scanTitle}</span>
                        <span className="block text-xs text-muted">{t.share.scanSub}</span>
                      </span>
                    </div>
                  </Parallax>
                )}
              </div>
            </Reveal>
          ))}

          {/* Guest mode */}
          <Reveal delay={0.16} className="md:col-span-2">
            <div className="relative h-full min-h-64 overflow-hidden rounded-nav bg-ink p-7 text-paper shadow-card">
              <span className="grid size-12 place-items-center rounded-full bg-lime text-ink">
                <UserRound className="size-5" />
              </span>
              <h3 className="mt-6 text-2xl font-semibold">{t.guest.title}</h3>
              <p className="mt-2 leading-7 text-paper opacity-70">{t.guest.body}</p>
              <span aria-hidden className="absolute -end-16 -bottom-20 size-56 rounded-full bg-lime/15 blur-2xl" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
