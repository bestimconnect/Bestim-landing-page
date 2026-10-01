import Image from "next/image";
import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import { LangSwitch } from "./LangSwitch";

export function Header({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const links = [
    ["features", dict.nav.features],
    ["how", dict.nav.how],
    ["business", dict.nav.business],
    ["faq", dict.nav.faq],
  ];
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 rounded-full border border-line/70 bg-white/80 ps-5 pe-2.5 md:ps-6 shadow-card backdrop-blur-md">
        <Link href={`/${lang}`} aria-label={dict.nav.home} className="shrink-0">
          <Image src="/brand/logo-word.png" alt="Bestim" width={900} height={194} priority className="h-6 w-auto" />
        </Link>
        {/* ponytail: section links are hidden on phones (no hamburger); the page is one scroll. Add a menu if pages grow. */}
        <ul className="hidden items-center gap-8 text-[15px] text-muted md:flex">
          {links.map(([id, label]) => (
            <li key={id}>
              <Link href={`/${lang}#${id}`} className="transition-colors hover:text-ink">
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-1 whitespace-nowrap">
          <LangSwitch className="rounded-full px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-paper" />
          <Link
            href={`/${lang}#download`}
            className="rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-ink shadow-glow transition-transform hover:-translate-y-0.5"
          >
            {dict.nav.download}
          </Link>
        </div>
      </nav>
    </header>
  );
}
