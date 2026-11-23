"use client";

import { X } from "lucide-react";
import { useRef, useState } from "react";
import { SubmitButton } from "./Pending";
import { searchUsers, sendPush } from "./push-actions";
import { btnLime, Field, input } from "./ui";

type Picked = { id: string; name: string; email: string };
type Labels = Record<"title_ar" | "body_ar" | "title_en" | "body_en" | "audience" | "all" | "selected" | "search" | "none" | "confirm" | "send" | "hintEn" | "tap" | "screen" | "link" | "linkPh", string> & { screens: Record<string, string> };
type Tap = "none" | "screen" | "link";

// The compose form: Arabic text (required), English text (optional), everyone or chosen users. Chosen users are looked up by
// name or email and kept as tags (hidden inputs named "user"). Sending to everyone needs the box that shows the user count.
export function ComposeForm({ l, total }: { l: Labels; total: number }) {
  const [audience, setAudience] = useState<"all" | "selected">("selected"); // starts on the safe choice
  const [picked, setPicked] = useState<Picked[]>([]);
  const [hits, setHits] = useState<Picked[]>([]);
  const [tap, setTap] = useState<Tap>("none");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const search = (q: string) => {
    clearTimeout(timer.current);
    if (q.trim().length < 2) return setHits([]);
    timer.current = setTimeout(async () => setHits(await searchUsers(q)), 250);
  };
  return (
    <form action={sendPush} className="grid max-w-2xl gap-4">
      <Field label={l.title_ar}><input name="title_ar" required maxLength={100} dir="rtl" className={input} /></Field>
      <Field label={l.body_ar}><textarea name="body_ar" required maxLength={500} rows={3} dir="rtl" className={`${input} h-auto py-3`} /></Field>
      <p className="-mb-2 text-[13px] text-d-muted">{l.hintEn}</p>
      <Field label={l.title_en}><input name="title_en" maxLength={100} dir="ltr" className={input} /></Field>
      <Field label={l.body_en}><textarea name="body_en" maxLength={500} rows={3} dir="ltr" className={`${input} h-auto py-3`} /></Field>

      <fieldset className="grid gap-3 rounded-3xl border border-d-line p-4">
        <legend className="px-2 text-[13px] font-semibold">{l.tap}</legend>
        <div className="flex flex-wrap gap-2">
          {(["none", "screen", "link"] as const).map((a) => (
            <label key={a} className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold ${tap === a ? "border-transparent bg-d-ink text-white" : "border-d-line bg-d-card"}`}>
              <input type="radio" name="action" value={a} checked={tap === a} onChange={() => setTap(a)} className="sr-only" />
              {l[a === "none" ? "none" : a]}
            </label>
          ))}
        </div>
        {tap === "screen" && (
          <select name="screen" required className={input} defaultValue="">
            <option value="" disabled>—</option>
            {Object.entries(l.screens).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        )}
        {tap === "link" && <input name="link" type="url" required maxLength={300} placeholder={l.linkPh} dir="ltr" pattern="https://.*" className={input} />}
      </fieldset>

      <fieldset className="grid gap-3 rounded-3xl border border-d-line p-4">
        <legend className="px-2 text-[13px] font-semibold">{l.audience}</legend>
        <div className="flex gap-2">
          {(["selected", "all"] as const).map((a) => (
            <label key={a} className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold ${audience === a ? "border-transparent bg-d-ink text-white" : "border-d-line bg-d-card"}`}>
              <input type="radio" name="audience" value={a} checked={audience === a} onChange={() => setAudience(a)} className="sr-only" />
              {a === "all" ? l.all : l.selected}
            </label>
          ))}
        </div>
        {audience === "selected" ? (
          <div className="grid gap-2">
            <input type="search" placeholder={l.search} onChange={(e) => search(e.target.value)} className={input} />
            {hits.length > 0 && (
              <ul className="grid gap-1 rounded-2xl border border-d-line p-1">
                {hits.filter((h) => !picked.some((p) => p.id === h.id)).map((h) => (
                  <li key={h.id}>
                    <button type="button" onClick={() => { setPicked([...picked, h]); setHits([]); }} className="w-full rounded-xl px-3 py-2 text-start text-sm hover:bg-d-paper">
                      {h.name || "—"} <span className="text-d-muted" dir="ltr">{h.email}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-2">
              {picked.length === 0 && <span className="text-sm text-d-muted">{l.none}</span>}
              {picked.map((p) => (
                <span key={p.id} className="inline-flex items-center gap-1.5 rounded-full bg-d-mint px-3 py-1.5 text-sm font-semibold">
                  <input type="hidden" name="user" value={p.id} />
                  {p.name || p.email}
                  <button type="button" aria-label="×" onClick={() => setPicked(picked.filter((x) => x.id !== p.id))}><X size={14} aria-hidden /></button>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <label className="flex items-start gap-2 rounded-2xl bg-d-blush px-4 py-3 text-sm font-semibold">
            <input type="checkbox" name="confirm" value="1" required className="mt-1" />
            {l.confirm.replace("{n}", String(total))}
          </label>
        )}
      </fieldset>
      <SubmitButton className={`${btnLime} justify-self-start`}>{l.send}</SubmitButton>
    </form>
  );
}
