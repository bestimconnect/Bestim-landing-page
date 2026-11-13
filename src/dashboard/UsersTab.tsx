import { Search } from "lucide-react";
import Link from "next/link";
import { link, one } from "./catalog";
import { fmtDate, fmtNum, type DashDict, type DashLang } from "./i18n";
import { Modal } from "./Modal";
import { setUserPlan } from "./plan-actions";
import type { Plan, UserRow } from "./types";
import { createUser, deleteUser, setAdminRole, suspendUser, updateUser } from "./user-actions";
import { Avatar, btnLime, btnSmall, Chip, Field, input, Table, td, th, tint } from "./ui";
import type { SupabaseClient } from "@supabase/supabase-js";

const PATH = "/dashboard/users";
const PAGE = 25;
const act = "me-2 inline-flex h-8 items-center rounded-full border border-d-line bg-d-card px-3.5 text-xs font-semibold hover:bg-d-paper";

export const TEAMS = ["Shady", "Ahmed", "Daytwo"];

export async function UsersTab({ sp, role, me, t, lang, supabase }: {
  sp: Record<string, string | string[] | undefined>; role: string; me: string; t: DashDict; lang: DashLang; supabase: SupabaseClient;
}) {
  const q = one(sp.q).trim().slice(0, 80);
  const page = Math.max(1, Number(one(sp.page)) || 1);
  const modal = one(sp.modal);
  const canManage = role === "owner" || role === "admin";
  const isOwner = role === "owner";
  const u = t.users;
  const errs = u.err as Record<string, string>;

  const { data } = await supabase.rpc("admin_user_list", { p_search: q, p_limit: PAGE, p_offset: (page - 1) * PAGE });
  const rows = (data ?? []) as UserRow[];
  const total = rows[0]?.total ?? 0;
  const base = { tab: "users", q: q || undefined, page: page > 1 ? String(page) : undefined };
  const here = link(PATH, base);
  const open = (m: string, id?: string) => link(PATH, { ...base, modal: m, id });
  const pageHref = (p: number) => link(PATH, { tab: "users", q: q || undefined, page: p > 1 ? String(p) : undefined });
  const row = rows.find((r) => r.id === one(sp.id));
  const plans = modal === "user-plan" && row ? (((await supabase.from("plans").select("id,name_ar,name_en,is_default").order("sort")).data ?? []) as Plan[]) : [];
  const planName = (id: string | null) => {
    if (!id) return "—";
    const p = plans.find((x) => x.id === id);
    return p ? (lang === "ar" ? p.name_ar : p.name_en) : id;
  };
  const roleName = (r: string) => (u.roles as Record<string, string>)[r] ?? r;
  const err = one(sp.err);
  const planMsg = one(sp.plan);
  const pager = "rounded-full border border-d-line bg-d-card px-4 py-2 text-sm";

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <form className="flex min-w-0 flex-1 gap-2 sm:max-w-xl" role="search">
          <input type="hidden" name="tab" value="users" />
          <label className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-full border border-d-line bg-d-card px-5 text-d-muted focus-within:border-d-teal">
            <Search size={18} strokeWidth={1.9} aria-hidden="true" className="shrink-0" />
            <input name="q" defaultValue={q} placeholder={u.placeholder} aria-label={u.placeholder} className="min-w-0 flex-1 bg-transparent text-d-ink outline-none placeholder:text-d-muted" />
          </label>
          <button type="submit" className="h-12 rounded-full bg-lime px-6 font-semibold text-ink shadow-glow">{u.search}</button>
        </form>
        {canManage && <Link href={open("user-new")} className={`${btnLime} inline-flex items-center`}>{u.new}</Link>}
      </div>

      {one(sp.saved) && <p role="status" className="mb-5 rounded-2xl bg-d-mint px-4 py-3 text-sm font-semibold">{u.saved}</p>}
      {planMsg === "ok" && <p role="status" className="mb-5 rounded-2xl bg-d-mint px-4 py-3 text-sm font-semibold">{t.user.planSaved}</p>}
      {planMsg === "err" && <p role="alert" className="mb-5 rounded-2xl bg-d-blush px-4 py-3 text-sm font-semibold text-d-danger">{t.user.planFailed}</p>}
      {err && <p role="alert" className="mb-5 rounded-2xl bg-d-blush px-4 py-3 text-sm font-semibold text-d-danger">{errs[err] ?? errs.save}</p>}

      {rows.length === 0 ? (
        <p className="text-d-muted">{u.empty}</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <th className={th}>{u.name}</th>
              <th className={th}>{u.email}</th>
              <th className={th}>{u.plan}</th>
              <th className={th}>{u.status}</th>
              <th className={th}>{u.cars}</th>
              <th className={th}>{u.records}</th>
              <th className={th}>{u.lastSeen}</th>
              <th className={th}>{u.joined}</th>
              {canManage && <th className={th}>{u.actions}</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id}>
                <td className={td}>
                  <Link href={`/dashboard/users/${r.id}`} className="flex items-center gap-3 font-semibold hover:underline">
                    <Avatar text={r.full_name || r.email || "?"} className={`size-9 text-sm text-ink ${tint(i)}`} />
                    <span className="max-w-48 truncate">{r.full_name || "—"}</span>
                  </Link>
                </td>
                <td className={td}><span dir="ltr" className="inline-block max-w-56 truncate align-middle">{r.email ?? "—"}</span></td>
                <td className={td}>{r.plan_id ?? "—"}</td>
                <td className={td}>
                  <Chip tone={r.suspended ? "blush" : "mint"}>{r.suspended ? u.suspended : u.active}</Chip>
                  {r.admin_role && <span className="ms-2"><Chip tone="sky">{roleName(r.admin_role)}</Chip></span>}
                </td>
                <td className={td}>{fmtNum(r.vehicles)}</td>
                <td className={td}>{fmtNum(r.logs)}</td>
                <td className={td}>{fmtDate(lang, r.last_sign_in_at)}</td>
                <td className={td}>{fmtDate(lang, r.created_at)}</td>
                {canManage && (
                  <td className={td}>
                    <Link href={open("user-edit", r.id)} className={act}>{u.edit}</Link>
                    <Link href={open("user-plan", r.id)} className={act}>{u.changePlan}</Link>
                    {r.id !== me && !r.admin_role && (
                      <form action={suspendUser} className="inline">
                        <input type="hidden" name="here" value={here} />
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="to" value={r.suspended ? "0" : "1"} />
                        <button type="submit" className={act}>{r.suspended ? u.resume : u.suspend}</button>
                      </form>
                    )}
                    {isOwner && !r.admin_role && <Link href={open("user-admin", r.id)} className={act}>{u.makeAdmin}</Link>}
                    {isOwner && r.id !== me && !r.admin_role && <Link href={open("user-delete", r.id)} className={`${act} text-d-danger`}>{u.delete}</Link>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <div className="mt-6 flex items-center justify-between gap-2 text-sm">
        <span className="text-d-muted">{u.total}: {fmtNum(total)}</span>
        <span className="flex gap-2">
          {page > 1 && <Link href={pageHref(page - 1)} className={pager}>{u.prev}</Link>}
          {page * PAGE < total && <Link href={pageHref(page + 1)} className={pager}>{u.next}</Link>}
        </span>
      </div>

      {canManage && modal === "user-new" && (
        <Modal title={u.new} closeHref={here} closeLabel={t.catalog.close}>
          <form action={createUser} className="grid gap-3.5">
            <input type="hidden" name="here" value={here} />
            <Field label={u.name}><input name="name" required maxLength={80} className={input} /></Field>
            <Field label={u.email}><input name="email" type="email" required dir="ltr" maxLength={200} className={input} /></Field>
            <Field label={u.password}><input name="password" type="text" required minLength={8} maxLength={72} dir="ltr" autoComplete="off" className={input} /></Field>
            <p className="text-xs text-d-muted">{u.passwordHint}</p>
            <button type="submit" className={btnLime}>{u.create}</button>
          </form>
        </Modal>
      )}

      {canManage && modal === "user-edit" && row && (
        <Modal title={`${u.edit}: ${row.full_name || row.email}`} closeHref={here} closeLabel={t.catalog.close}>
          <form action={updateUser} className="grid gap-3.5">
            <input type="hidden" name="here" value={here} />
            <input type="hidden" name="id" value={row.id} />
            <input type="hidden" name="old_email" value={row.email ?? ""} />
            <Field label={u.name}><input name="name" required maxLength={80} defaultValue={row.full_name} className={input} /></Field>
            <Field label={u.email}><input name="email" type="email" required dir="ltr" maxLength={200} defaultValue={row.email ?? ""} className={input} /></Field>
            <button type="submit" className={btnLime}>{t.catalog.save}</button>
          </form>
        </Modal>
      )}

      {canManage && modal === "user-plan" && row && (
        <Modal title={`${u.changePlan}: ${row.full_name || row.email}`} closeHref={here} closeLabel={t.catalog.close}>
          <form action={setUserPlan} className="grid gap-3.5">
            <input type="hidden" name="here" value={here} />
            <input type="hidden" name="user" value={row.id} />
            <Field label={t.user.planPick}>
              <select name="plan" defaultValue={row.plan_id ?? ""} className={input}>
                <option value="">{t.user.planDefaultOption}</option>
                {plans.map((p) => <option key={p.id} value={p.id}>{planName(p.id)}</option>)}
              </select>
            </Field>
            <Field label={t.user.planExpires}><input name="expires" type="date" dir="ltr" className={input} /></Field>
            <button type="submit" className={btnLime}>{t.catalog.save}</button>
          </form>
        </Modal>
      )}

      {isOwner && modal === "user-admin" && row && (
        <Modal title={`${u.makeAdmin}: ${row.full_name || row.email}`} closeHref={here} closeLabel={t.catalog.close}>
          <form action={setAdminRole} className="grid gap-3.5">
            <input type="hidden" name="here" value={`${PATH}?tab=admins`} />
            <input type="hidden" name="id" value={row.id} />
            <RoleFields t={t} />
            <button type="submit" className={btnLime}>{u.makeAdmin}</button>
          </form>
        </Modal>
      )}

      {isOwner && modal === "user-delete" && row && (
        <Modal title={`${u.delete}: ${row.full_name || row.email}`} closeHref={here} closeLabel={t.catalog.close}>
          <form action={deleteUser} className="grid gap-3.5">
            <input type="hidden" name="here" value={here} />
            <input type="hidden" name="id" value={row.id} />
            <p className="rounded-2xl bg-d-blush px-4 py-3 text-sm leading-6 text-d-danger">{u.deleteWarn}</p>
            <Field label={`${u.deleteType}: ${row.email}`}><input name="confirm" required dir="ltr" autoComplete="off" className={input} /></Field>
            <div className="flex gap-3">
              <button type="submit" className="h-12 rounded-full bg-d-danger px-6 text-[15px] font-bold text-white">{u.deleteGo}</button>
              <Link href={here} className={btnSmall}>{t.catalog.cancel}</Link>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

// Role + optional team name, shared by the make-admin and new-admin forms.
export function RoleFields({ t, role, team }: { t: DashDict; role?: string; team?: string | null }) {
  const names = t.users.roles as Record<string, string>;
  return (
    <>
      <Field label={t.users.role}>
        <select name="role" defaultValue={role ?? "admin"} className={input}>
          {["owner", "admin", "viewer"].map((r) => <option key={r} value={r}>{names[r]}</option>)}
        </select>
      </Field>
      <p className="-mt-2 text-xs leading-5 text-d-muted">{t.users.rolesHint}</p>
      <Field label={t.users.team}>
        <select name="team" defaultValue={team ?? ""} className={input}>
          <option value="">{t.users.noTeam}</option>
          {TEAMS.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </Field>
    </>
  );
}
