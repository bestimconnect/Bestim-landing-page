import type { ReactNode } from "react";
import Link from "next/link";
import { setLang } from "./actions";
import { deleteRow, toggleActive } from "./catalog-actions";
import { imageUrl } from "./catalog";
import type { DashDict, DashLang } from "./i18n";

// The four soft colours (light + dark are set in globals.css). Cycled for avatars and cars.
const tints = ["bg-d-mint", "bg-d-sky", "bg-d-amber", "bg-d-blush"];
export const tint = (i: number) => tints[i % tints.length];
export type Tone = "mint" | "sky" | "amber" | "blush" | "paper";
const toneClass: Record<Tone, string> = {
  mint: "bg-d-mint",
  sky: "bg-d-sky",
  amber: "bg-d-amber",
  blush: "bg-d-blush",
  paper: "bg-d-paper",
};

// First letter of a name (or email) for avatars.
export const initial = (s: string) => ([...s.trim()][0] ?? "?").toUpperCase();

export const PageTitle = ({ children, sub }: { children: ReactNode; sub?: ReactNode }) => (
  <div className="mb-6 flex flex-wrap items-baseline gap-x-3">
    <h1 className="text-3xl font-extrabold md:text-4xl">{children}</h1>
    {sub && <span className="text-d-muted">{sub}</span>}
  </div>
);

export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <section className={`rounded-3xl border border-d-line bg-d-card p-6 shadow-card ${className}`}>{children}</section>
);

// A tinted tile: label, big number, small line. The text follows the theme so it reads on the dark tints too.
export const Tile = ({ tone, label, value, sub, small }: { tone: Tone; label: string; value: ReactNode; sub?: ReactNode; small?: boolean }) => (
  <section className={`${small ? "rounded-item p-4" : "rounded-3xl p-6"} ${toneClass[tone]}`}>
    <p className="text-sm font-medium text-d-muted">{label}</p>
    <p className={`mt-1 font-bold ${small ? "text-3xl" : "text-4xl"}`}>{value}</p>
    {sub && <p className="mt-1 text-sm text-d-muted">{sub}</p>}
  </section>
);

// A small pill label.
export const Chip = ({ tone = "paper", children }: { tone?: Tone; children: ReactNode }) => (
  <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${toneClass[tone]}`}>{children}</span>
);

export const Avatar = ({ text, className }: { text: string; className: string }) => (
  <span aria-hidden="true" className={`inline-flex shrink-0 items-center justify-center rounded-full font-extrabold ${className}`}>
    {initial(text)}
  </span>
);

// Tables scroll sideways on phones instead of squeezing.
export const Table = ({ children, title }: { children: ReactNode; title?: string }) => (
  <div className="overflow-hidden rounded-metric border border-d-line bg-d-card shadow-card">
    {title && <h2 className="px-5 pb-3 pt-5 text-lg font-bold">{title}</h2>}
    <div className="overflow-x-auto">
      <table className="w-full text-start text-sm">{children}</table>
    </div>
  </div>
);
export const th = "whitespace-nowrap bg-d-paper px-5 py-3.5 text-start text-[13px] font-semibold text-d-muted";
export const td = "whitespace-nowrap border-t border-d-line px-5 py-3.5";

// Switches Arabic <-> English without any JavaScript (a form + a server action).
export function LangToggle({ lang, className = "" }: { lang: DashLang; className?: string }) {
  const other = lang === "ar" ? "en" : "ar";
  return (
    <form action={setLang}>
      <input type="hidden" name="lang" value={other} />
      <button type="submit" lang={other} className={className}>
        {other === "ar" ? "العربية" : "English"}
      </button>
    </form>
  );
}

// ─── Catalog pages (cars, parts, car types) ───
export const input =
  "h-11 w-full rounded-2xl border border-d-line bg-d-paper px-3.5 text-[15px] outline-none focus:border-d-teal disabled:opacity-70";
export const btnLime = "h-12 rounded-full bg-lime px-6 text-[15px] font-bold text-ink shadow-glow";
export const btnLine = "inline-flex h-12 items-center justify-center rounded-full border border-d-line bg-d-card px-5 text-[15px] font-semibold";
export const btnSmall = "inline-flex h-10 items-center rounded-full border border-d-line bg-d-card px-5 text-sm font-semibold";

// The only <img> in the catalog pages: pictures come from Storage, so Next's image optimiser isn't needed.
export const Pic = ({ path, className = "" }: { path: string | null | undefined; className?: string }) => {
  const src = imageUrl(path);
  // eslint-disable-next-line @next/next/no-img-element
  return src ? <img src={src} alt="" loading="lazy" className={className} /> : null;
};

export const Field = ({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) => (
  <label className={`block text-[13px] font-semibold ${className}`}>
    {label}
    <span className="mt-1.5 block font-normal">{children}</span>
  </label>
);

// A switch that is really a tiny form: no JavaScript. Without edit rights it is only a picture of the state.
export function Switch({ table, id, on, back, label, edit }: { table: string; id: string; on: boolean; back: string; label: string; edit: boolean }) {
  const track = `relative inline-block h-5.5 w-9.5 shrink-0 rounded-full ${on ? "bg-d-teal" : "bg-d-line"}`;
  const knob = <span className={`absolute top-0.75 size-4 rounded-full bg-white ${on ? "start-0.75" : "end-0.75"}`} />;
  if (!edit) return <span className={track} role="img" aria-label={label}>{knob}</span>;
  return (
    <form action={toggleActive}>
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="to" value={on ? "0" : "1"} />
      <input type="hidden" name="back" value={back} />
      <button type="submit" role="switch" aria-checked={on} aria-label={label} className={track}>{knob}</button>
    </form>
  );
}

// One picture slot: preview, file picker, "remove" box.
export function PicField({ label, name, current, t, wide, tone = "bg-d-paper", disabled }: {
  label?: string; name: string; current: string | null | undefined; t: DashDict; wide?: boolean; tone?: string; disabled?: boolean;
}) {
  return (
    <div className="min-w-0 text-center text-xs">
      <div className={`flex items-center justify-center rounded-2xl border border-dashed border-[#b9c4be] ${tone} ${wide ? "h-36" : "h-24"}`}>
        <Pic path={current} className={`object-contain ${wide ? "max-h-28 max-w-[85%]" : "max-h-20 max-w-20"}`} />
      </div>
      {label && <p className="mt-1.5 font-semibold">{label}</p>}
      <input
        type="file"
        name={name}
        accept="image/png,image/webp,image/jpeg"
        disabled={disabled}
        aria-label={label ?? t.catalog.pickPicture}
        className="mt-2 block w-full text-xs file:me-2 file:rounded-full file:border-0 file:bg-d-mint file:px-3 file:py-1.5 file:text-xs file:font-semibold"
      />
      {current && !disabled && (
        <label className="mt-1.5 flex items-center justify-center gap-1.5 text-d-muted">
          <input type="checkbox" name={`rm_${name}`} />
          {t.catalog.removePicture}
        </label>
      )}
    </div>
  );
}

// The form inside a modal: hidden fields, red banner, fieldset (disabled for viewers), save / cancel / delete.
export function CatalogForm({ action, list, here, id, edit, err, t, del, delAction, children }: {
  action: (f: FormData) => Promise<void>; list: string; here: string; id?: string; edit: boolean; err: string; t: DashDict;
  del?: string; delAction?: (f: FormData) => Promise<void>; children: ReactNode;
}) {
  const errs = t.catalog.err as Record<string, string>;
  return (
    <form action={action} className="flex flex-col gap-3.5">
      <input type="hidden" name="list" value={list} />
      <input type="hidden" name="here" value={here} />
      {id && <input type="hidden" name="id" value={id} />}
      {del && <input type="hidden" name="table" value={del} />}
      {err && <p role="alert" className="rounded-2xl bg-d-blush px-4 py-3 text-sm font-semibold text-d-danger">{errs[err] ?? errs.save}</p>}
      <fieldset disabled={!edit} className="m-0 flex min-w-0 flex-col gap-3.5 border-0 p-0">{children}</fieldset>
      {edit ? (
        <>
          <div className="mt-1 flex gap-2.5">
            <button type="submit" className={`${btnLime} flex-1`}>{t.catalog.save}</button>
            <Link href={list} replace className={btnLine}>{t.catalog.cancel}</Link>
          </div>
          {del && id && (
            <details className="text-sm">
              <summary className="cursor-pointer font-semibold text-d-danger">{t.catalog.delete}</summary>
              <p className="mt-2 text-d-muted">{t.catalog.deleteHint}</p>
              <button
                type="submit"
                formAction={delAction ?? deleteRow}
                formNoValidate
                className="mt-2 h-11 rounded-full border border-[#f3c3ce] bg-d-blush px-5 font-semibold text-d-danger"
              >
                {t.catalog.deleteConfirm}
              </button>
            </details>
          )}
        </>
      ) : (
        <p className="text-sm text-d-muted">{t.catalog.viewOnly}</p>
      )}
    </form>
  );
}

export const VisibleBox = ({ on, label }: { on: boolean; label: string }) => (
  <label className="flex items-center justify-between text-sm font-semibold">
    {label}
    <input type="checkbox" name="is_active" defaultChecked={on} className="size-5 accent-d-teal" />
  </label>
);
