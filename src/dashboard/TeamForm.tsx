import type { DashDict } from "./i18n";
import { saveItem } from "./team-actions";
import { AREA, OWNER, PLATFORM, PRIORITY, SEVERITY, type Kind, type TeamItem } from "./team";
import { btnLime, Field, input } from "./ui";
import Link from "next/link";

export const textarea = "w-full rounded-2xl border border-d-line bg-d-paper px-3.5 py-3 text-[15px] outline-none focus:border-d-teal";

// <option>s for one list, labels from the dictionary. blank = the first "nothing selected" entry.
export function Opts({ list, t, blank }: { list: string[]; t: DashDict; blank?: string }) {
  const v = t.team.v as Record<string, string>;
  return (
    <>
      {blank !== undefined && <option value="">{blank}</option>}
      {list.map((x) => <option key={x} value={x}>{v[x] ?? x}</option>)}
    </>
  );
}

// One form for creating and editing a bug or task (item present = editing). Plain <form>, no JavaScript.
export function ItemForm({ kind, item, t, here, cancel, err }: { kind: Kind; item?: TeamItem; t: DashDict; here: string; cancel: string; err?: string }) {
  const f = t.team.f;
  const errs = t.team.err as Record<string, string>;
  const sel = (name: string, label: string, list: string[], cur: string | null | undefined, required = false) => (
    <Field label={label}>
      <select name={name} defaultValue={cur ?? ""} required={required} className={input}>
        <Opts list={list} t={t} blank={required ? undefined : t.team.form.none} />
      </select>
    </Field>
  );
  const line = (name: string, label: string, cur: string | null | undefined, max: number) => (
    <Field label={label}><input name={name} defaultValue={cur ?? ""} maxLength={max} className={input} /></Field>
  );
  const long = (name: string, label: string, cur: string | null | undefined, rows = 4) => (
    <Field label={label}><textarea name={name} defaultValue={cur ?? ""} rows={rows} maxLength={10000} className={textarea} /></Field>
  );
  return (
    <form action={saveItem} className="flex flex-col gap-3.5">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="here" value={here} />
      {item && <input type="hidden" name="num" value={item.num} />}
      {err && <p role="alert" className="rounded-2xl bg-d-blush px-4 py-3 text-sm font-semibold text-d-danger">{errs[err] ?? errs.unavailable}</p>}
      <Field label={f.title}><input name="title" defaultValue={item?.title ?? ""} required maxLength={200} className={input} /></Field>
      {kind === "bug" ? (
        <>
          <div className="grid gap-3.5 sm:grid-cols-3">
            {sel("severity", f.severity, SEVERITY, item?.severity, true)}
            {sel("platform", f.platform, PLATFORM, item?.platform)}
            {sel("area", f.area, AREA, item?.area)}
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2">
            {line("build", f.build, item?.build, 120)}
            {line("screen", f.screen, item?.screen, 120)}
          </div>
          {long("steps", f.steps, item?.steps)}
          {long("expected", f.expected, item?.expected, 3)}
          {long("actual", f.actual, item?.actual, 3)}
          <Field label={f.linkNum}>
            <input name="link_num" inputMode="numeric" pattern="\d{1,9}" defaultValue={item?.link_num ?? ""} dir="ltr" className={input} />
            <span className="mt-1 block text-xs text-d-muted">{t.team.form.linkHint}</span>
          </Field>
          {!item && (
            <Field label={f.screenshot}>
              <input type="file" name="file" accept="image/png,image/jpeg,image/webp,image/heic" className="block w-full text-xs file:me-2 file:rounded-full file:border-0 file:bg-d-mint file:px-3 file:py-1.5 file:text-xs file:font-semibold" />
            </Field>
          )}
        </>
      ) : (
        <>
          <div className="grid gap-3.5 sm:grid-cols-3">
            {sel("owner", f.owner, OWNER, item?.owner, true)}
            {sel("priority", f.priority, PRIORITY, item?.priority)}
            {sel("area", f.area, AREA, item?.area)}
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2">
            {line("task_type", f.taskType, item?.task_type, 60)}
            <Field label={f.dueDate}><input type="date" name="due_date" defaultValue={item?.due_date ?? ""} className={input} /></Field>
          </div>
          {long("details", f.details, item?.details, 5)}
        </>
      )}
      <div className="mt-1 flex gap-2.5">
        <button type="submit" className={`${btnLime} flex-1`}>{item ? t.team.form.save : t.team.form.create}</button>
        <Link href={cancel} replace className="inline-flex h-12 items-center justify-center rounded-full border border-d-line bg-d-card px-5 text-[15px] font-semibold">{t.team.form.cancel}</Link>
      </div>
    </form>
  );
}
