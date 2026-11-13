"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, type ButtonHTMLAttributes, type ComponentProps, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

// Loading feedback for the whole dashboard: a spinner, buttons that lock while their form runs,
// links that ignore repeat clicks while the page loads, and a thin progress bar at the top.

export const Spinner = ({ className = "" }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={`inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-current border-e-transparent motion-reduce:animate-none ${className}`}
  />
);

// A submit button that is unclickable while its form is working. Keeps its size: the label fades, the spinner sits on top.
// Must be inside the <form> (useFormStatus reads the nearest one). `spinner={false}` for tiny controls like switches.
export function SubmitButton({ children, className = "", spinner = true, disabled, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { spinner?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      {...rest}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={`relative ${className} ${pending ? "cursor-wait opacity-80" : ""} disabled:cursor-not-allowed`}
    >
      <span className={pending && spinner ? "invisible inline-flex items-center gap-[inherit]" : "inline-flex items-center gap-[inherit]"}>{children}</span>
      {pending && spinner && <Spinner className="absolute inset-0 m-auto" />}
    </button>
  );
}

// Reports when its Link stops being pending (a Link's status can only be read from a child).
function Watch({ onDone }: { onDone: () => void }) {
  const { pending } = useLinkStatus();
  const [was, setWas] = useState(false);
  if (pending !== was) {
    setWas(pending);
    if (was && !pending) onDone();
  }
  return pending ? <Spinner className="ms-2 size-3.5" /> : null;
}

// A link that shows a small spinner while the next page loads and ignores clicks until it is there.
export function PendingLink({ children, className = "", onClick, spinner = true, ...rest }: ComponentProps<typeof Link> & { children: ReactNode; spinner?: boolean }) {
  const key = `${usePathname()}?${useSearchParams()}`;
  const [from, setFrom] = useState<string | null>(null);
  const busy = from === key; // the page changed: no longer busy
  useEffect(() => {
    if (from === null) return;
    const id = setTimeout(() => setFrom(null), 6000); // safety: never stay locked
    return () => clearTimeout(id);
  }, [from]);
  return (
    <Link
      {...rest}
      aria-disabled={busy || undefined}
      className={`${className} ${busy ? "pointer-events-none opacity-80" : ""}`}
      onClick={(e) => {
        if (busy) return e.preventDefault();
        onClick?.(e);
        if (!e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey) setFrom(key);
      }}
    >
      {children}
      {spinner && <Watch onDone={() => setFrom(null)} />}
    </Link>
  );
}

// A thin bar across the top while a link is loading. Starts on a click on any internal dashboard link and ends when the
// address changes (or after a few seconds). Forms don't use it: their own button shows the spinner.
export function TopBar() {
  const key = `${usePathname()}?${useSearchParams()}`;
  const [from, setFrom] = useState<string | null>(null);
  useEffect(() => {
    const click = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !url.pathname.startsWith("/dashboard")) return;
      if (url.pathname + url.search === location.pathname + location.search) return;
      setFrom(`${url.pathname}?${url.searchParams}`.replace(/\?$/, "?"));
    };
    document.addEventListener("click", click, true);
    return () => document.removeEventListener("click", click, true);
  }, []);
  useEffect(() => {
    if (from === null) return;
    const id = setTimeout(() => setFrom(null), 8000);
    return () => clearTimeout(id);
  }, [from]);
  // The bar is on from the click until the address becomes the one we were heading for (or the safety timer).
  if (from !== null && from === key) setFrom(null); // arrived: forget the target so later navigations don't light the bar
  const on = from !== null && from !== key;
  return on ? <div aria-hidden="true" className="dash-topbar fixed inset-x-0 top-0 z-[60] h-0.75 bg-lime shadow-glow" /> : null;
}
