import Image from "next/image";
import type { ReactNode } from "react";

// A CSS phone frame around app screenshots (390x844).
// Size it from outside with a width (w-72) or a height (h-[56svh] w-auto).
// Pass `children` instead of `src` to stack several screens (see HowItWorks).
export function Phone({
  src,
  alt = "",
  className = "",
  priority,
  children,
}: {
  src?: string;
  alt?: string;
  className?: string;
  priority?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      className={`relative aspect-[390/844] rounded-[13%/6%] bg-ink p-[2.6%] shadow-float ring-1 ring-white/10 ${className}`}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[11%/5.2%] bg-paper">
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 70vw, 340px"
            priority={priority}
            className="object-cover"
          />
        ) : (
          children
        )}
        {/* Dynamic island */}
        <span className="absolute top-[1.6%] left-1/2 h-[3.4%] w-[30%] -translate-x-1/2 rounded-full bg-ink" />
      </div>
    </div>
  );
}

export const screen = (lang: string, name: string) => `/screens/${lang}/${name}.png`;
