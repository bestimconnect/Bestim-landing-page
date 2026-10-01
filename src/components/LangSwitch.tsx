"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Links to the same page in the other language.
export function LangSwitch({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const other = pathname.startsWith("/en") ? "ar" : "en";
  return (
    <Link
      href={pathname.replace(/^\/(ar|en)/, `/${other}`)}
      lang={other}
      className={className}
    >
      {other === "ar" ? "العربية" : "English"}
    </Link>
  );
}
