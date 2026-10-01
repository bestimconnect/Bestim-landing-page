import { Car, Gauge, Motorbike, Timer, Tractor, Truck } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";

// Same order as dict.strip.
const icons = [Car, Motorbike, Truck, Tractor, Gauge, Timer];

// An endless moving strip of the vehicle types Bestim supports.
export function VehicleStrip({ dict }: { dict: Dictionary }) {
  const items = dict.strip.map((label, i) => ({ label, Icon: icons[i] }));
  return (
    <section className="overflow-hidden py-6 [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
      {/* The list is repeated so the loop has no seam; the copies are hidden from screen readers. */}
      <div className="flex w-max animate-marquee">
        {[0, 1, 2, 3].map((copy) => (
          <ul key={copy} aria-hidden={copy > 0} className="flex shrink-0">
            {items.map(({ label, Icon }) => (
              <li key={label} className="flex items-center gap-3 px-8 text-lg font-medium text-muted opacity-80">
                <Icon className="size-6" strokeWidth={1.75} />
                {label}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
