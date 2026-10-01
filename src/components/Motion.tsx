"use client";

// The page's animated "islands". Everything else is rendered on the server.
import {
  MotionConfig,
  animate,
  motion,
  useInView,
  useScroll,
  useTransform,
} from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

// Honors the visitor's "reduce motion" setting for every animation below.
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

// Fades and lifts its content in the first time it scrolls into view.
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.7, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

// Drifts its content vertically as the page scrolls past it.
// `distance` in px: negative moves up faster than the page, positive lags behind.
export function Parallax({
  children,
  className,
  distance = -60,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance]);
  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}

// Counts up to `to` when it scrolls into view. Latin digits in both languages.
export function CountUp({ to, className }: { to: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" });
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.6,
      ease,
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = Math.round(v).toLocaleString("en-US");
      },
    });
    return () => controls.stop();
  }, [inView, to]);
  // The final number is in the HTML, so it's right without JavaScript too.
  return (
    <span ref={ref} className={className}>
      {to.toLocaleString("en-US")}
    </span>
  );
}

// A chart bar that grows from the baseline when it scrolls into view.
export function Bar({
  height,
  className,
  delay = 0,
}: {
  height: string;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      style={{ height, originY: 1 }}
      initial={{ scaleY: 0 }}
      whileInView={{ scaleY: 1 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.8, ease, delay }}
    />
  );
}
