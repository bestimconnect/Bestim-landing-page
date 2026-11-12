"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

// A native <dialog>: Esc, focus trap and the dim backdrop come from the browser.
// The server decides when it exists (URL params); closing it navigates to closeHref.
export function Modal({ title, closeHref, closeLabel, children, drawer }: { title: string; closeHref: string; closeLabel: string; children: ReactNode; drawer?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      onClose={() => router.replace(closeHref)}
      onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
      className={`${drawer ? "m-0 ms-auto h-dvh max-h-dvh w-[min(36rem,100vw)] rounded-none rounded-s-[28px]" : "m-auto max-h-[calc(100dvh-2rem)] w-[min(34rem,calc(100vw-2rem))] rounded-[28px]"} overflow-y-auto border-0 bg-d-card p-0 text-d-ink shadow-[0_24px_48px_-16px_rgb(34_46_41/0.28)] backdrop:bg-d-panel/55`}
    >
      <div className="p-6 md:p-7">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-[22px] font-extrabold">{title}</h2>
          <button type="button" onClick={() => ref.current?.close()} aria-label={closeLabel} className="rounded-full p-1.5 text-d-muted hover:bg-d-paper">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
