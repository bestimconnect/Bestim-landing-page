import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";

// A real iPhone 16 Pro frame (public/device/iphone-16-pro.png, Apple's product
// bezel, 1406x2822 with a transparent 1206x2622 screen at 100,100) with an app
// screenshot placed behind the screen opening.
// Size it from outside with a width (w-72) or a height (h-[56svh] w-auto).
// Pass `children` instead of `src` to stack several screens (see HowItWorks).
export function Phone({
  src,
  alt = "",
  className = "",
  priority,
  children,
}: {
  src?: StaticImageData;
  alt?: string;
  className?: string;
  priority?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={`relative aspect-[1406/2822] drop-shadow-[0_28px_36px_rgb(34_46_41/0.28)] ${className}`}>
      {/* The screen opening, as a share of the frame image. */}
      <div className="absolute top-[3.54%] left-[7.11%] h-[92.92%] w-[85.78%] overflow-hidden rounded-[15.5%/7.1%] bg-paper">
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
      </div>
      <Image
        src="/device/iphone-16-pro.png"
        alt=""
        fill
        sizes="(max-width: 768px) 80vw, 400px"
        priority={priority}
        className="pointer-events-none"
      />
    </div>
  );
}
