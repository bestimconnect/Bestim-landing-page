import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { setLang } from "./actions";
import { deleteRow, toggleActive } from "./catalog-actions";
import { imageUrl } from "./catalog";
import type { DashDict, DashLang } from "./i18n";
import { PendingLink, SubmitButton } from "./Pending";

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
// Every table has a fixed height (`height` overrides the default): the rows scroll inside it and the header stays put.
// `footer` goes under the table (the Pager).
export const Table = ({ children, title, height, footer }: { children: ReactNode; title?: string; height?: string; footer?: ReactNode }) => (
  <>
    <div className="overflow-hidden rounded-metric border border-d-line bg-d-card shadow-card">
      {title && <h2 className="px-5 pb-3 pt-5 text-lg font-bold">{title}</h2>}
      <div className={`overflow-auto ${height ?? (title ? "h-96" : "h-[calc(125dvh-24rem)] min-h-80")}`}>
        <table className="w-full text-start text-sm">{children}</table>
      </div>
    </div>
    {footer}
  </>
);
export const th = "sticky top-0 z-20 whitespace-nowrap bg-d-paper px-5 py-3.5 text-start text-[13px] font-semibold text-d-muted";
export const td = "whitespace-nowrap border-t border-d-line px-5 py-3.5";

// Switches Arabic <-> English without any JavaScript (a form + a server action).
export function LangToggle({ lang, className = "" }: { lang: DashLang; className?: string }) {
  const other = lang === "ar" ? "en" : "ar";
  return (
    <form action={setLang}>
      <input type="hidden" name="lang" value={other} />
      <SubmitButton lang={other} className={className}>
        {other === "ar" ? "العربية" : "English"}
      </SubmitButton>
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
      <SubmitButton spinner={false} role="switch" aria-checked={on} aria-label={label} className={track}>{knob}</SubmitButton>
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
      {err && <Flash tone="err" className="mb-0">{errs[err] ?? errs.save}</Flash>}
      <fieldset disabled={!edit} className="m-0 flex min-w-0 flex-col gap-3.5 border-0 p-0">{children}</fieldset>
      {edit ? (
        <>
          <div className="mt-1 flex gap-2.5">
            <SubmitButton className={`${btnLime} flex-1`}>{t.catalog.save}</SubmitButton>
            <PendingLink href={list} replace spinner={false} className={btnLine}>{t.catalog.cancel}</PendingLink>
          </div>
          {del && id && (
            <details className="text-sm">
              <summary className="cursor-pointer font-semibold text-d-danger">{t.catalog.delete}</summary>
              <p className="mt-2 text-d-muted">{t.catalog.deleteHint}</p>
              <SubmitButton
                formAction={delAction ?? deleteRow}
                formNoValidate
                className="mt-2 h-11 rounded-full border border-[#f3c3ce] bg-d-blush px-5 font-semibold text-d-danger"
              >
                {t.catalog.deleteConfirm}
              </SubmitButton>
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

// Row actions as icons: a floating pill pinned to the end of the row, visible while the row is hovered or focused
// (always visible on touch screens). The row needs className="group/row".
export const iconBtn = "inline-flex size-8 items-center justify-center rounded-full text-d-muted hover:bg-d-paper hover:text-d-ink";
export const ActionsTh = ({ label }: { label: string }) => (
  <th className={`${th} end-0 w-0 !bg-transparent p-0`}><span className="sr-only">{label}</span></th>
);
export const ActionsTd = ({ children }: { children: ReactNode }) => (
  <td className="sticky end-0 w-0 border-t border-d-line p-0">
    <div className="pointer-events-none absolute end-2 top-1/2 z-10 flex -translate-y-1/2 items-center gap-0.5 rounded-full border border-d-line bg-d-card p-1 opacity-0 shadow-card transition-opacity focus-within:pointer-events-auto focus-within:opacity-100 group-hover/row:pointer-events-auto group-hover/row:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100">
      {children}
    </div>
  </td>
);

// ─── Shared page pieces (the same look on every dashboard page) ───

// A saved / error message under the page title. `err` is the red one and is announced to screen readers as an alert.
export const Flash = ({ tone = "ok", children, className = "mb-5" }: { tone?: "ok" | "err"; children: ReactNode; className?: string }) =>
  tone === "err" ? (
    <p role="alert" className={`${className} rounded-2xl bg-d-blush px-4 py-3 text-sm font-semibold text-d-danger`}>{children}</p>
  ) : (
    <p role="status" className={`${className} rounded-2xl bg-d-mint px-4 py-3 text-sm font-semibold`}>{children}</p>
  );

export const InfoBanner = ({ children }: { children: ReactNode }) => (
  <p className="mb-5 rounded-2xl bg-d-sky px-4.5 py-3 text-sm leading-6">{children}</p>
);

export const EmptyState = ({ children }: { children: ReactNode }) => (
  <p className="rounded-3xl border border-dashed border-d-line px-6 py-10 text-center text-d-muted">{children}</p>
);

// The search box with its button. `hidden` carries the other URL params (like the tab) through the search.
export function SearchBar({ q, placeholder, button, hidden = {} }: { q: string; placeholder: string; button: string; hidden?: Record<string, string> }) {
  return (
    <form className="flex min-w-0 flex-1 gap-2 sm:max-w-xl" role="search">
      {Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <label className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-full border border-d-line bg-d-card px-5 text-d-muted focus-within:border-d-teal">
        <Search size={18} strokeWidth={1.9} aria-hidden="true" className="shrink-0" />
        <input name="q" defaultValue={q} placeholder={placeholder} aria-label={placeholder} className="min-w-0 flex-1 bg-transparent text-d-ink outline-none placeholder:text-d-muted" />
      </label>
      <SubmitButton className="h-12 shrink-0 rounded-full bg-lime px-6 font-semibold text-ink shadow-glow">{button}</SubmitButton>
    </form>
  );
}

// One row: search (or filters) on the start side, action buttons on the end side. Order is kept in Arabic too.
export const Toolbar = ({ children, actions }: { children?: ReactNode; actions?: ReactNode }) => (
  <div className="mb-5 flex items-center gap-3 rtl:flex-row-reverse">
    {children}
    {actions && <div className="ms-auto flex shrink-0 items-center gap-2">{actions}</div>}
  </div>
);

// The big "Add something" button (a link that opens a modal).
export const AddButton = ({ href, children }: { href: string; children: ReactNode }) => (
  <PendingLink href={href} className={`${btnLime} inline-flex items-center gap-2 whitespace-nowrap`}>{children}</PendingLink>
);

// Pill tabs under the page title: users / admins, parts categories, logs. `items[].href` should keep other params.
export function TabNav({ label, items }: { label: string; items: { href: string; label: string; active: boolean }[] }) {
  return (
    <nav className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label={label}>
      {items.map((i) => (
        <PendingLink
          key={i.href}
          role="tab"
          aria-selected={i.active}
          href={i.href}
          spinner={false}
          className={`rounded-full px-6 py-2.5 text-[15px] font-bold ${i.active ? "bg-lime text-ink shadow-glow" : "border border-d-line bg-d-card text-d-muted"}`}
        >
          {i.label}
        </PendingLink>
      ))}
    </nav>
  );
}

// ─── Loading placeholders (loading.tsx files) ───
export const Skeleton = ({ className = "" }: { className?: string }) => (
  <div aria-hidden="true" className={`animate-pulse rounded-2xl bg-d-line motion-reduce:animate-none ${className}`} />
);
export const SkeletonTable = ({ rows = 8 }: { rows?: number }) => (
  <div aria-hidden="true" className="overflow-hidden rounded-metric border border-d-line bg-d-card shadow-card">
    <div className="h-12 bg-d-paper" />
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="flex items-center gap-4 border-t border-d-line px-5 py-4">
        <Skeleton className="size-9 shrink-0 rounded-full" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="hidden h-4 w-1/5 sm:block" />
        <Skeleton className="hidden h-4 w-1/6 md:block" />
      </div>
    ))}
  </div>
);
