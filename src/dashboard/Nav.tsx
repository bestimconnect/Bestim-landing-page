"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Client component only so the current page can be highlighted.
export type NavItem = { href: string; label: string; icon: ReactNode; exact?: boolean } | { heading: string };
export function Nav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <ul className="flex gap-1 overflow-x-auto md:flex-col">
      {items.map((item) => {
        if ("heading" in item) {
          return (
            <li key={item.heading} className="px-4 pb-1 pt-3 text-xs font-semibold text-[#93a39a] max-md:hidden md:group-data-[collapsed=true]:mx-3 md:group-data-[collapsed=true]:mt-2 md:group-data-[collapsed=true]:border-t md:group-data-[collapsed=true]:border-white/10 md:group-data-[collapsed=true]:p-0">
              <span className="md:group-data-[collapsed=true]:hidden">{item.heading}</span>
            </li>
          );
        }
        const { href, label, icon, exact } = item;
        const active = exact || href === "/dashboard" ? pathname === href : pathname.startsWith(href);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              title={label}
              className={`flex items-center gap-3 whitespace-nowrap rounded-full px-4 py-2.5 text-[15px] transition-colors md:py-3 md:group-data-[collapsed=true]:justify-center md:group-data-[collapsed=true]:px-0 ${
                active ? "bg-lime font-bold text-ink" : "font-medium text-[#c9d3cd] hover:text-white"
              }`}
            >
              <span className="max-md:hidden">{icon}</span>
              <span className="md:group-data-[collapsed=true]:hidden">{label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
