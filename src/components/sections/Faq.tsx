import { Plus } from "lucide-react";
import { Reveal } from "@/components/Motion";
import { SectionHeading } from "@/components/SectionHeading";
import type { Dictionary } from "@/lib/i18n";

// Native <details>: opens and closes without any JavaScript.
export function Faq({ dict }: { dict: Dictionary }) {
  const t = dict.faq;
  return (
    <section id="faq" className="px-4 py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr_2fr]">
        <Reveal>
          <SectionHeading {...t} className="text-start" />
        </Reveal>
        <Reveal delay={0.1} className="space-y-3">
          {t.items.map((item) => (
            <details key={item.q} className="group rounded-metric border border-line/70 bg-white px-6 shadow-card">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-paper transition-all duration-300 group-open:rotate-45 group-open:bg-lime">
                  <Plus className="size-4" />
                </span>
              </summary>
              <p className="pb-6 leading-7 text-muted">{item.a}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
