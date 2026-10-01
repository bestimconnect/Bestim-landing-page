import { BellRing, ChartColumn, History, Mic, QrCode, WifiOff } from "lucide-react";
import { Reveal } from "@/components/Motion";
import { SectionHeading } from "@/components/SectionHeading";
import type { Dictionary } from "@/lib/i18n";

// Same order as dict.features.items.
const looks = [
  { Icon: Mic, tint: "bg-lime" },
  { Icon: BellRing, tint: "bg-amber" },
  { Icon: ChartColumn, tint: "bg-sky" },
  { Icon: History, tint: "bg-mint" },
  { Icon: QrCode, tint: "bg-blush" },
  { Icon: WifiOff, tint: "bg-line" },
];

export function Features({ dict }: { dict: Dictionary }) {
  const t = dict.features;
  return (
    <section id="features" className="px-4 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading {...t} />
        </Reveal>
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {t.items.map((item, i) => {
            const { Icon, tint } = looks[i];
            return (
              <li key={item.title}>
                <Reveal
                  delay={(i % 3) * 0.08}
                  className="h-full rounded-nav border border-line/70 bg-white p-7 shadow-card transition-transform duration-300 hover:-translate-y-1"
                >
                  <span className={`grid size-12 place-items-center rounded-full ${tint}`}>
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-6 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 leading-7 text-muted">{item.body}</p>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
