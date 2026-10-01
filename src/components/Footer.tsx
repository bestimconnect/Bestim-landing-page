import Image from "next/image";
import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import { LangSwitch } from "./LangSwitch";

export function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.footer;
  const columns = [
    {
      title: t.product,
      links: [
        [`/${lang}#features`, dict.nav.features],
        [`/${lang}#how`, dict.nav.how],
        [`/${lang}#business`, dict.nav.business],
        [`/${lang}#faq`, dict.nav.faq],
      ],
    },
    {
      title: t.legal,
      links: [
        [`/${lang}/privacy`, t.privacy],
        [`/${lang}/terms`, t.terms],
        [`/${lang}/support`, t.support],
        [`/${lang}/delete-account`, t.deleteAccount],
      ],
    },
  ];
  return (
    <footer className="px-4 pt-16 pb-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div>
            <Image src="/brand/logo-word.png" alt="Bestim" width={900} height={194} className="h-8 w-auto" />
            <p className="mt-4 text-muted">{t.tagline}</p>
          </div>
          <div className="flex gap-16">
            {columns.map((col) => (
              <div key={col.title}>
                <h2 className="text-sm font-semibold">{col.title}</h2>
                <ul className="mt-4 space-y-3 text-[15px] text-muted">
                  {col.links.map(([href, label]) => (
                    <li key={href}>
                      <Link href={href} className="transition-colors hover:text-ink">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-sm text-muted">
          <p>
            © 2026 Bestim · {t.rights}
          </p>
          <LangSwitch className="font-medium text-ink hover:underline" />
        </div>
      </div>
    </footer>
  );
}
