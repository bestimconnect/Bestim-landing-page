import { CirclePause, CirclePlay, Pencil, ShieldPlus, Trash2, WalletCards } from "lucide-react";
import { link, one } from "./catalog";
import { fmtDate, fmtNum, type DashDict, type DashLang } from "./i18n";
import { Modal } from "./Modal";
import { Pager, pageOf, sizeOf } from "./pager";
import { PendingLink, SubmitButton } from "./Pending";
import { setUserPlan } from "./plan-actions";
import type { Plan, UserRow } from "./types";
import { createUser, deleteUser, setAdminRole, suspendUser, updateUser } from "./user-actions";
import { ActionsTd, ActionsTh, AddButton, Avatar, btnLime, btnSmall, Chip, EmptyState, Field, Flash, iconBtn, input, SearchBar, Table, td, th, tint, Toolbar } from "./ui";
import type { SupabaseClient } from "@supabase/supabase-js";

const PATH = "/dashboard/users";
const ic = { size: 16, strokeWidth: 1.9, "aria-hidden": true } as const;

export const TEAMS = ["Shady", "Ahmed", "Daytwo"];

export async function UsersTab({ sp, role, me, t, lang, supabase }: {
  sp: Record<string, string | string[] | undefined>; role: string; me: string; t: DashDict; lang: DashLang; supabase: SupabaseClient;
}) {
  const q = one(sp.q).trim().slice(0, 80);
  const page = pageOf(sp.page);
  const size = sizeOf(sp.size);
  const modal = one(sp.modal);
  const canManage = role === "owner" || role === "admin";
  const isOwner = role === "owner";
  const u = t.users;
  const errs = u.err as Record<string, string>;

  const { data } = await supabase.rpc("admin_user_list", { p_search: q, p_limit: size, p_offset: (page - 1) * size });
  const rows = (data ?? []) as UserRow[];
  const total = rows[0]?.total ?? 0;
  const base = { tab: "users", q: q || undefined, page: page > 1 ? String(page) : undefined, size: size !== 25 ? String(size) : undefined };
  const here = link(PATH, base);
  const open = (m: string, id?: string) => link(PATH, { ...base, modal: m, id });
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

  return (
    <>
      <Toolbar actions={canManage && <AddButton href={open("user-new")}>{u.new}</AddButton>}>
        <SearchBar q={q} placeholder={u.placeholder} button={u.search} hidden={{ tab: "users" }} />
      </Toolbar>

      {one(sp.saved) && <Flash>{u.saved}</Flash>}
      {planMsg === "ok" && <Flash>{t.user.planSaved}</Flash>}
      {planMsg === "err" && <Flash tone="err">{t.user.planFailed}</Flash>}
      {err && <Flash tone="err">{errs[err] ?? errs.save}</Flash>}

      {rows.length === 0 ? (
        <EmptyState>{u.empty}</EmptyState>
      ) : (
        <Table height="h-[calc(125dvh-24rem)] min-h-80" footer={<Pager size={size} page={page} total={total} capped={total > 10000} base="/dashboard/users" params={{ tab: "users", q: q || undefined }} />}>
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
              {canManage && <ActionsTh label={u.actions} />}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className="group/row hover:bg-d-paper">
                <td className={td}>
                  <PendingLink href={`/dashboard/users/${r.id}`} spinner={false} className="flex items-center gap-3 font-semibold hover:underline">
                    <Avatar text={r.full_name || r.email || "?"} className={`size-9 text-sm text-ink ${tint(i)}`} />
                    <span className="max-w-48 truncate">{r.full_name || "—"}</span>
                  </PendingLink>
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
                  <ActionsTd>
                    <PendingLink spinner={false} href={open("user-edit", r.id)} className={iconBtn} title={u.edit} aria-label={u.edit}><Pencil {...ic} /></PendingLink>
                    <PendingLink spinner={false} href={open("user-plan", r.id)} className={iconBtn} title={u.changePlan} aria-label={u.changePlan}><WalletCards {...ic} /></PendingLink>
                    {r.id !== me && !r.admin_role && (
                      <form action={suspendUser} className="inline-flex">
                        <input type="hidden" name="here" value={here} />
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="to" value={r.suspended ? "0" : "1"} />
                        <SubmitButton className={iconBtn} title={r.suspended ? u.resume : u.suspend} aria-label={r.suspended ? u.resume : u.suspend}>
                          {r.suspended ? <CirclePlay {...ic} /> : <CirclePause {...ic} />}
                        </SubmitButton>
                      </form>
                    )}
                    {isOwner && !r.admin_role && <PendingLink spinner={false} href={open("user-admin", r.id)} className={iconBtn} title={u.makeAdmin} aria-label={u.makeAdmin}><ShieldPlus {...ic} /></PendingLink>}
                    {isOwner && r.id !== me && !r.admin_role && <PendingLink spinner={false} href={open("user-delete", r.id)} className={`${iconBtn} hover:!text-d-danger`} title={u.delete} aria-label={u.delete}><Trash2 {...ic} /></PendingLink>}
                  </ActionsTd>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {canManage && modal === "user-new" && (
        <Modal title={u.new} closeHref={here} closeLabel={t.catalog.close}>
          <form action={createUser} className="grid gap-3.5">
            <input type="hidden" name="here" value={here} />
            <Field label={u.name}><input name="name" required maxLength={80} className={input} /></Field>
            <Field label={u.email}><input name="email" type="email" required dir="ltr" maxLength={200} className={input} /></Field>
            <Field label={u.password}><input name="password" type="text" required minLength={8} maxLength={72} dir="ltr" autoComplete="off" className={input} /></Field>
            <p className="text-xs text-d-muted">{u.passwordHint}</p>
            <SubmitButton className={btnLime}>{u.create}</SubmitButton>
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
            <SubmitButton className={btnLime}>{t.catalog.save}</SubmitButton>
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
            <SubmitButton className={btnLime}>{t.catalog.save}</SubmitButton>
          </form>
        </Modal>
      )}

      {isOwner && modal === "user-admin" && row && (
        <Modal title={`${u.makeAdmin}: ${row.full_name || row.email}`} closeHref={here} closeLabel={t.catalog.close}>
          <form action={setAdminRole} className="grid gap-3.5">
            <input type="hidden" name="here" value={`${PATH}?tab=admins`} />
            <input type="hidden" name="id" value={row.id} />
            <RoleFields t={t} />
            <SubmitButton className={btnLime}>{u.makeAdmin}</SubmitButton>
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
              <SubmitButton className="h-12 rounded-full bg-d-danger px-6 text-[15px] font-bold text-white">{u.deleteGo}</SubmitButton>
              <PendingLink href={here} spinner={false} className={btnSmall}>{t.catalog.cancel}</PendingLink>
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
