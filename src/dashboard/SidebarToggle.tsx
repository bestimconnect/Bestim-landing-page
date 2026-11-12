"use client";

import { ChevronsLeft } from "lucide-react";

// Collapses the sidebar by flipping data-collapsed on the <aside> (every child restyles from it through CSS)
// and remembers the choice in a cookie, which Shell reads so the page never flashes the wrong width.
export function SidebarToggle({ collapse, expand }: { collapse: string; expand: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        const aside = e.currentTarget.closest("aside");
        if (!aside) return;
        const next = aside.dataset.collapsed !== "true";
        aside.dataset.collapsed = String(next);
        document.cookie = `dash_nav=${next ? "collapsed" : "open"}; path=/dashboard; max-age=31536000; samesite=lax`;
      }}
      className="hidden size-9 shrink-0 items-center justify-center rounded-full text-[#c9d3cd] transition-colors hover:bg-white/10 hover:text-white md:flex"
    >
      <ChevronsLeft size={18} strokeWidth={1.8} aria-hidden="true" className="rtl:rotate-180 group-data-[collapsed=true]:rotate-180 group-data-[collapsed=true]:rtl:rotate-0" />
      <span className="sr-only group-data-[collapsed=true]:hidden">{collapse}</span>
      <span className="sr-only hidden group-data-[collapsed=true]:inline">{expand}</span>
    </button>
  );
}
