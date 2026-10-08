"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Links to the same page in the other language.
export function LangSwitch({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const other = pathname.startsWith("/en") ? "ar" : "en";
  const href = pathname.replace(/^\/(ar|en)/, `/${other}`);
  return (
    <Link
      href={href}
      // A shared-history link carries its token after "?": keep it when switching language.
      onClick={(e) => {
        if (!window.location.search) return;
        e.preventDefault();
        window.location.assign(href + window.location.search);
      }}
      lang={other}
      className={className}
    >
      {other === "ar" ? "العربية" : "English"}
    </Link>
  );
}
