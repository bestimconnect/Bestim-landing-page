import { ChevronDown, MessageSquare, Plus } from "lucide-react";
import Link from "next/link";
import { link, one } from "./catalog";
import { fmtDate, getDash } from "./i18n";
import { requireAdmin } from "./session";
import { setStatus } from "./team-actions";
import { AREA, call, CLOSED, OWNER, PLATFORM, SEVERITY, statusList, tone, type Kind, type TeamRow } from "./team";
import { Modal } from "./Modal";
import { DragCard, DropColumn } from "./TeamDnd";
import { ItemForm, Opts } from "./TeamForm";
import { btnLime, btnSmall, Chip, input, PageTitle } from "./ui";

type Sp = Record<string, string | string[] | undefined>;
export const Unavailable = ({ text }: { text: string }) => (
  <p role="alert" className="rounded-2xl bg-d-amber px-4 py-3 text-sm font-semibold">{text}</p>
);
export const ErrorBanner = ({ code, errs }: { code: string; errs: Record<string, string> }) =>
  code ? <p role="alert" className="mb-5 rounded-2xl bg-d-blush px-4 py-3 text-sm font-semibold text-d-danger">{errs[code] ?? errs.unavailable}</p> : null;

// A <select> and a button in a plain form: no JavaScript, no drag and drop.
export async function StatusMenu({ num, kind, status, back }: { num: number; kind: Kind; status: string; back: string }) {
  const { t } = await getDash();
  return (
    <form action={setStatus} className="flex gap-2">
      <input type="hidden" name="num" value={num} />
      <input type="hidden" name="here" value={back} />
      <select name="status" defaultValue={status} aria-label={t.team.list.moveTo} className="h-9 min-w-0 flex-1 rounded-full border border-d-line bg-d-paper px-3 text-xs outline-none focus:border-d-teal">
        <Opts list={statusList(kind)} t={t} />
      </select>
      <button type="submit" className="h-9 shrink-0 rounded-full border border-d-line bg-d-card px-4 text-xs font-semibold">{t.team.list.move}</button>
    </form>
  );
}

// `input` is full width; the filter bar needs fields that sit side by side, so drop that one class.
const filt = input.replace("w-full ", "");
// One list row: number, title, level, who, area, date. On phones it stacks.
const ROW = "grid items-center gap-x-4 gap-y-1 px-5 md:grid-cols-[3.5rem_minmax(0,1fr)_7rem_7rem_6rem_7rem]";
const FILTERS = ["status", "owner", "severity", "area", "platform", "q"] as const;

// The bugs and tasks pages are this one component: a board by status, or ?view=table. Filters live in the URL.
export async function TeamList({ kind, sp }: { kind: Kind; sp: Sp }) {
  const { supabase } = await requireAdmin();
  const { t, lang } = await getDash();
  const base = `/dashboard/team/${kind}s`;
  const v = t.team.v as Record<string, string>;
  const L = t.team.list;
  const cur: Record<string, string> = {};
  for (const k of FILTERS) cur[k] = one(sp[k]).slice(0, 100);
  const open = one(sp.open) === "1";
  const mine = one(sp.mine) === "1";
  const list = ["list", "table"].includes(one(sp.view)); // "table" is the old name of the list view
  const filters: Record<string, string | boolean> = Object.fromEntries(Object.entries(cur).filter(([, x]) => x));
  if (open) filters.open = true;
  if (mine) filters.mine = true;
  const here = link(base, { ...cur, open: open ? "1" : "", mine: mine ? "1" : "", view: list ? "list" : "" });
  const res = await call<TeamRow[]>(supabase, "team_list", { p_kind: kind, p_filters: filters, p_limit: 500 });
  const rows = res.data ?? [];
  const statuses = statusList(kind);
  const sub = `${rows.length} ${L.count}`;
  const drawer = one(sp.new) === kind; // the create form opens in a side drawer on this page

  return (
    <>
      <PageTitle sub={res.err ? undefined : sub}>{kind === "bug" ? L.bugs : L.tasks}</PageTitle>
      <ErrorBanner code={drawer ? "" : one(sp.err)} errs={t.team.err as Record<string, string>} />
      {drawer && (
        <Modal drawer title={kind === "bug" ? t.team.form.newBug : t.team.form.newTask} closeHref={here} closeLabel={t.team.form.cancel}>
          <ItemForm kind={kind} t={t} here={link(base, { ...cur, open: open ? "1" : "", mine: mine ? "1" : "", view: list ? "list" : "", new: kind })} cancel={here} err={one(sp.err)} />
        </Modal>
      )}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Link href={link(base, { ...cur, open: open ? "1" : "", mine: mine ? "1" : "", view: list ? "list" : "", new: kind })} scroll={false} className={`${btnLime} inline-flex items-center gap-2`}>
          <Plus size={18} aria-hidden="true" />{kind === "bug" ? L.newBug : L.newTask}
        </Link>
        <span className="flex gap-1 rounded-full bg-d-card p-1 text-sm font-semibold">
          {[false, true].map((tb) => (
            <Link key={String(tb)} href={link(base, { ...cur, open: open ? "1" : "", mine: mine ? "1" : "", view: tb ? "list" : "" })}
              aria-current={tb === list ? "page" : undefined} className={`rounded-full px-4 py-1.5 ${tb === list ? "bg-lime text-ink" : "text-d-muted"}`}>
              {tb ? L.table : L.board}
            </Link>
          ))}
        </span>
      </div>

      <form action={base} className="mb-6 flex flex-wrap items-end gap-3 rounded-3xl border border-d-line bg-d-card p-4 shadow-card">
        {list && <input type="hidden" name="view" value="list" />}
        <input name="q" defaultValue={cur.q} placeholder={L.search} aria-label={L.search} className={`${filt} w-full sm:w-56`} />
        <select name="status" defaultValue={cur.status} aria-label={t.team.f.status} className={`${filt}`}>
          <Opts list={statuses} t={t} blank={`${t.team.f.status}: ${L.all}`} />
        </select>
        {kind === "bug" ? (
          <>
            <select name="severity" defaultValue={cur.severity} aria-label={t.team.f.severity} className={`${filt}`}>
              <Opts list={SEVERITY} t={t} blank={`${t.team.f.severity}: ${L.all}`} />
            </select>
            <select name="platform" defaultValue={cur.platform} aria-label={t.team.f.platform} className={`${filt}`}>
              <Opts list={PLATFORM} t={t} blank={`${t.team.f.platform}: ${L.all}`} />
            </select>
          </>
        ) : (
          <select name="owner" defaultValue={cur.owner} aria-label={t.team.f.owner} className={`${filt}`}>
            <Opts list={OWNER} t={t} blank={`${t.team.f.owner}: ${L.all}`} />
          </select>
        )}
        <select name="area" defaultValue={cur.area} aria-label={t.team.f.area} className={`${filt}`}>
          <Opts list={AREA} t={t} blank={`${t.team.f.area}: ${L.all}`} />
        </select>
        <label className="flex h-11 items-center gap-2 text-sm"><input type="checkbox" name="open" value="1" defaultChecked={open} className="size-4 accent-d-teal" />{L.openOnly}</label>
        <label className="flex h-11 items-center gap-2 text-sm"><input type="checkbox" name="mine" value="1" defaultChecked={mine} className="size-4 accent-d-teal" />{L.mine}</label>
        <button type="submit" className={btnSmall}>{L.apply}</button>
        <Link href={list ? `${base}?view=list` : base} className="inline-flex h-10 items-center text-sm font-semibold text-d-muted">{L.reset}</Link>
      </form>

      {res.err ? (
        <Unavailable text={t.team.unavailable} />
      ) : list ? (
        rows.length === 0 ? <p className="text-d-muted">{L.empty}</p> : (
          <div className="flex flex-col gap-4">
            {statuses.map((s) => {
              const grp = rows.filter((r) => r.status === s);
              if (!grp.length) return null;
              return (
                <details key={s} open={!CLOSED.includes(s)} className="group rounded-3xl border border-d-line bg-d-card shadow-card">
                  <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
                    <ChevronDown size={18} aria-hidden="true" className="shrink-0 text-d-muted transition-transform group-open:rotate-0 -rotate-90 rtl:rotate-90 rtl:group-open:rotate-0" />
                    <Chip tone={tone(s)}>{v[s] ?? s}</Chip>
                    <span className="text-sm font-semibold text-d-muted">{grp.length}</span>
                  </summary>
                  <div className="border-t border-d-line">
                    <div className={`${ROW} py-2 text-xs font-semibold text-d-muted max-md:hidden`}>
                      <span>#</span><span>{t.team.f.title}</span>
                      <span>{kind === "bug" ? t.team.f.severity : t.team.f.priority}</span>
                      <span>{kind === "bug" ? t.team.f.platform : t.team.f.owner}</span>
                      <span>{t.team.f.area}</span>
                      <span>{kind === "task" ? t.team.f.dueDate : t.team.f.updated}</span>
                    </div>
                    <ul>
                      {grp.map((r) => {
                        const sev = kind === "bug" ? r.severity : r.priority;
                        const who = kind === "bug" ? r.platform : r.owner;
                        return (
                          <li key={r.num} className="border-t border-d-line first:border-t-0">
                            <Link href={`/dashboard/team/${r.num}`} className={`${ROW} py-3 hover:bg-d-paper`}>
                              <bdi className="text-d-muted">#{r.num}</bdi>
                              <span className="min-w-0 truncate font-semibold">{r.title}</span>
                              <span>{sev ? <Chip tone={tone(sev)}>{v[sev] ?? sev}</Chip> : "—"}</span>
                              <span className="truncate text-sm">{who ? (v[who] ?? who) : "—"}</span>
                              <span className="truncate text-sm">{r.area ? (v[r.area] ?? r.area) : "—"}</span>
                              <span className="text-sm text-d-muted">{fmtDate(lang, kind === "task" ? r.due_date : r.updated_at)}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </details>
              );
            })}
          </div>
        )
      ) : (
        <div className="flex items-start gap-4 overflow-x-auto pb-4">
          {statuses.map((s) => {
            const col = rows.filter((r) => r.status === s);
            return (
              <DropColumn
                key={s}
                status={s}
                label={v[s] ?? s}
                errs={t.team.err as Record<string, string>}
                head={
                  <h2 className="mb-3 flex items-center justify-between px-2 pt-1 text-sm font-bold">
                    <Chip tone={tone(s)}>{v[s] ?? s}</Chip>
                    <span className="text-d-muted">{col.length}</span>
                  </h2>
                }
              >
                {col.map((r) => {
                  const sev = kind === "bug" ? r.severity : r.priority;
                  return (
                    <DragCard key={r.num} num={r.num} status={r.status} className="flex flex-col gap-2.5 rounded-2xl border border-d-line bg-d-card p-4 shadow-card">
                      <Link href={`/dashboard/team/${r.num}`} draggable={false} className="font-semibold leading-6 hover:underline">
                        <bdi className="me-1.5 text-d-muted">#{r.num}</bdi>{r.title}
                      </Link>
                      <div className="flex flex-wrap gap-1.5">
                        {sev && <Chip tone={tone(sev)}>{v[sev] ?? sev}</Chip>}
                        {r.owner && <Chip>{v[r.owner] ?? r.owner}</Chip>}
                        {kind === "bug" && r.platform && <Chip>{v[r.platform] ?? r.platform}</Chip>}
                      </div>
                      <div className="flex items-center justify-between text-xs text-d-muted">
                        <span>{r.due_date ? `${L.due}: ${fmtDate(lang, r.due_date)}` : ""}</span>
                        <span className="flex items-center gap-1" title={L.comments}>
                          <MessageSquare size={14} aria-hidden="true" />{r.comments}
                        </span>
                      </div>
                      <StatusMenu num={r.num} kind={kind} status={r.status} back={here} />
                    </DragCard>
                  );
                })}
              </DropColumn>
            );
          })}
        </div>
      )}
    </>
  );
}
