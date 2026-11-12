"use client";

import { useState, useTransition, type ReactNode } from "react";
import { moveItem } from "./team-actions";

// Drag and drop between the board's status columns, with the browser's own drag events (no library).
// The cards and columns are drawn by the server; these two only add the dragging. A phone cannot drag,
// so every card keeps its status menu.
const TYPE = "application/x-team-item";

export function DragCard({ num, status, className, children }: { num: number; status: string; className: string; children: ReactNode }) {
  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(TYPE, `${num}|${status}`);
        e.dataTransfer.effectAllowed = "move";
      }}
      className={`${className} cursor-grab active:cursor-grabbing`}
    >
      {children}
    </li>
  );
}

export function DropColumn({ status, label, head, errs, children }: { status: string; label: string; head: ReactNode; errs: Record<string, string>; children: ReactNode }) {
  const [over, setOver] = useState(false);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  return (
    <section
      aria-label={label}
      aria-busy={pending}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes(TYPE)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const [num, from] = e.dataTransfer.getData(TYPE).split("|");
        if (!num || from === status) return;
        setErr("");
        start(async () => {
          const code = await moveItem(Number(num), status);
          if (code) setErr(errs[code] ?? errs.unavailable);
        });
      }}
      className={`w-72 shrink-0 rounded-3xl bg-d-paper p-3 transition-opacity ${over ? "ring-2 ring-d-teal" : ""} ${pending ? "opacity-60" : ""}`}
    >
      {head}
      {err && <p role="alert" className="mb-3 rounded-2xl bg-d-blush px-3 py-2 text-xs font-semibold text-d-danger">{err}</p>}
      <ul className="flex min-h-16 flex-col gap-3">{children}</ul>
    </section>
  );
}
