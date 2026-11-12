"use client";

import { useActionState } from "react";
import { createKey } from "./team-actions";
import { btnLime, input } from "./ui";

type S = { key?: string; error?: string } | null;
type Labels = { label: string; def: string; make: string; fresh: string; full: string; error: string };

// Makes a key and shows it once, with the full connector address and the Claude Code command ready to copy.
export function KeyMaker({ url, t }: { url: string; t: Labels }) {
  const [s, act, pending] = useActionState<S, FormData>(createKey, null);
  return (
    <div>
      <form action={act} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          {t.label}
          <input name="label" defaultValue={t.def} maxLength={60} className={`${input} w-64`} />
        </label>
        <button disabled={pending} className={btnLime}>{t.make}</button>
      </form>
      {s?.error && <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{t.error}</p>}
      {s?.key && (
        <div className="mt-4 flex flex-col gap-3">
          <p className="text-sm font-semibold">{t.fresh}</p>
          <p dir="ltr" className="select-all break-all rounded-2xl bg-d-paper px-4 py-3 text-start font-mono text-sm">{s.key}</p>
          <p className="text-sm font-semibold">{t.full}</p>
          <p dir="ltr" className="select-all break-all rounded-2xl bg-d-paper px-4 py-3 text-start font-mono text-xs">{`${url}?key=${s.key}`}</p>
          <p dir="ltr" className="select-all break-all rounded-2xl bg-d-paper px-4 py-3 text-start font-mono text-xs">{`claude mcp add --transport http bestim-team ${url} --header "Authorization: Bearer ${s.key}"`}</p>
        </div>
      )}
    </div>
  );
}
