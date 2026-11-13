import { redirect } from "next/navigation";
import { Search, ShieldCheck, UserMinus } from "lucide-react";
import { link, one } from "./catalog";
import { fmtDate, type DashDict, type DashLang } from "./i18n";
import { Modal } from "./Modal";
import { Pager, pageOf, sizeOf } from "./pager";
import { PendingLink, SubmitButton } from "./Pending";
import type { AdminRow, UserRow } from "./types";
import { createUser, removeAdmin, setAdminRole } from "./user-actions";
import { RoleFields } from "./UsersTab";
import { ActionsTd, ActionsTh, AddButton, Avatar, btnLime, btnSmall, Chip, EmptyState, Field, Flash, iconBtn, input, Table, td, th, tint, Toolbar } from "./ui";
import type { SupabaseClient } from "@supabase/supabase-js";

const PATH = "/dashboard/users";
const ic = { size: 16, strokeWidth: 1.9, "aria-hidden": true } as const;

export async function AdminsTab({ sp, role, me, t, lang, supabase }: {
  sp: Record<string, string | string[] | undefined>; role: string; me: string; t: DashDict; lang: DashLang; supabase: SupabaseClient;
}) {
  const u = t.users;
  const errs = u.err as Record<string, string>;
  const roleName = (r: string) => (u.roles as Record<string, string>)[r] ?? r;
  const isOwner = role === "owner";
  const modal = one(sp.modal);
  const via = one(sp.via) === "new" ? "new" : "users";
  const pq = one(sp.pq).trim().slice(0, 80);
  const here = link(PATH, { tab: "admins" });
  const open = (m: string, id?: string) => link(PATH, { tab: "admins", modal: m, id });

  const size = sizeOf(sp.size);
  const page = pageOf(sp.page);
  const { data } = await supabase.rpc("admin_list_admins_page", { p_limit: size, p_offset: (page - 1) * size });
  const pageRows = (data ?? []) as AdminRow[];
  if (pageRows.length === 0 && page > 1) redirect(link(PATH, { tab: "admins" }));
  const total = pageRows[0]?.total ?? 0;
  // The edit / remove dialogs need that one person, whichever page they are on.
  const wantRow = (modal === "admin-role" || modal === "admin-remove") && /^[0-9a-f-]{36}$/i.test(one(sp.id));
  const row = wantRow ? (((await supabase.rpc("admin_list_admins_page", { p_limit: 1, p_offset: 0, p_user: one(sp.id) })).data ?? []) as AdminRow[])[0] : undefined;
  // "From users" tab: search ordinary users, hide those who are already admins.
  const found = isOwner && modal === "admin-new" && via === "users" && pq
    ? (((await supabase.rpc("admin_user_list", { p_search: pq, p_limit: 8, p_offset: 0 })).data ?? []) as UserRow[]).filter((r) => !r.admin_role)
    : [];
  const err = one(sp.err);
  const tab = (on: boolean) => `rounded-full px-5 py-2 text-sm font-semibold ${on ? "bg-lime text-ink" : "bg-d-paper text-d-muted"}`;

  return (
    <>
      <Toolbar actions={isOwner && <AddButton href={open("admin-new")}>{u.addAdmin}</AddButton>}>
        {!isOwner && <p className="min-w-0 text-sm text-d-muted">{u.ownerOnly}</p>}
      </Toolbar>
      {one(sp.saved) && <Flash>{u.saved}</Flash>}
      {err && <Flash tone="err">{errs[err] ?? errs.save}</Flash>}

      {total === 0 ? (
        <EmptyState>{u.empty}</EmptyState>
      ) : (
        <Table height="h-[calc(125dvh-24rem)] min-h-80" footer={<Pager size={size} page={page} total={total} base="/dashboard/users" params={{ tab: "admins" }} />}>
          <thead>
            <tr>
              <th className={th}>{u.name}</th>
              <th className={th}>{u.email}</th>
              <th className={th}>{u.role}</th>
              <th className={th}>{u.team}</th>
              <th className={th}>{u.since}</th>
              <th className={th}>{u.lastSeen}</th>
              {isOwner && <ActionsTh label={u.actions} />}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r, i) => (
              <tr key={r.user_id} className="group/row hover:bg-d-paper">
                <td className={td}>
                  <span className="flex items-center gap-3 font-semibold">
                    <Avatar text={r.full_name || r.email || "?"} className={`size-9 text-sm text-ink ${tint(i)}`} />
                    <span className="max-w-48 truncate">{r.full_name || "—"}</span>
                    {r.user_id === me && <Chip tone="amber">{u.you}</Chip>}
                  </span>
                </td>
                <td className={td}><span dir="ltr" className="inline-block max-w-56 truncate align-middle">{r.email ?? "—"}</span></td>
                <td className={td}><Chip tone="sky">{roleName(r.role)}</Chip></td>
                <td className={td}>{r.team_name ?? "—"}</td>
                <td className={td}>{fmtDate(lang, r.created_at)}</td>
                <td className={td}>{fmtDate(lang, r.last_sign_in_at)}</td>
                {isOwner && (
                  <ActionsTd>
                    <PendingLink spinner={false} href={open("admin-role", r.user_id)} className={iconBtn} title={u.changeRole} aria-label={u.changeRole}><ShieldCheck {...ic} /></PendingLink>
                    <PendingLink spinner={false} href={open("admin-remove", r.user_id)} className={`${iconBtn} hover:!text-d-danger`} title={u.removeAdmin} aria-label={u.removeAdmin}><UserMinus {...ic} /></PendingLink>
                  </ActionsTd>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {isOwner && modal === "admin-new" && (
        <Modal title={u.addAdmin} closeHref={here} closeLabel={t.catalog.close}>
          <div className="mb-4 flex gap-2" role="tablist">
            <PendingLink spinner={false} role="tab" aria-selected={via === "users"} href={link(PATH, { tab: "admins", modal: "admin-new", via: "users" })} className={tab(via === "users")}>{u.fromUsers}</PendingLink>
            <PendingLink spinner={false} role="tab" aria-selected={via === "new"} href={link(PATH, { tab: "admins", modal: "admin-new", via: "new" })} className={tab(via === "new")}>{u.newAccount}</PendingLink>
          </div>
          {via === "users" ? (
            <div className="grid gap-3.5">
              <form role="search" className="flex gap-2">
                <input type="hidden" name="tab" value="admins" />
                <input type="hidden" name="modal" value="admin-new" />
                <input type="hidden" name="via" value="users" />
                <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full border border-d-line bg-d-paper px-4 text-d-muted focus-within:border-d-teal">
                  <Search size={16} aria-hidden="true" className="shrink-0" />
                  <input name="pq" defaultValue={pq} autoFocus placeholder={u.pickUser} aria-label={u.pickUser} className="min-w-0 flex-1 bg-transparent text-d-ink outline-none placeholder:text-d-muted" />
                </label>
                <SubmitButton className={btnSmall}>{u.search}</SubmitButton>
              </form>
              {pq && found.length === 0 && <p className="text-sm text-d-muted">{u.noMatch}</p>}
              {found.map((r) => (
                <form key={r.id} action={setAdminRole} className="grid gap-2 rounded-2xl border border-d-line p-3.5">
                  <input type="hidden" name="here" value={here} />
                  <input type="hidden" name="id" value={r.id} />
                  <p className="font-semibold">{r.full_name || "—"} <span dir="ltr" className="block text-xs font-normal text-d-muted">{r.email}</span></p>
                  <RoleFields t={t} />
                  <SubmitButton className={btnLime}>{u.makeAdmin}</SubmitButton>
                </form>
              ))}
            </div>
          ) : (
            <form action={createUser} className="grid gap-3.5">
              <input type="hidden" name="here" value={here} />
              <Field label={u.name}><input name="name" required maxLength={80} className={input} /></Field>
              <Field label={u.email}><input name="email" type="email" required dir="ltr" maxLength={200} className={input} /></Field>
              <Field label={u.password}><input name="password" type="text" required minLength={8} maxLength={72} dir="ltr" autoComplete="off" className={input} /></Field>
              <p className="-mt-2 text-xs text-d-muted">{u.passwordHint}</p>
              <RoleFields t={t} />
              <SubmitButton className={btnLime}>{u.create}</SubmitButton>
            </form>
          )}
        </Modal>
      )}

      {isOwner && modal === "admin-role" && row && (
        <Modal title={`${u.changeRole}: ${row.full_name || row.email}`} closeHref={here} closeLabel={t.catalog.close}>
          <form action={setAdminRole} className="grid gap-3.5">
            <input type="hidden" name="here" value={here} />
            <input type="hidden" name="id" value={row.user_id} />
            <RoleFields t={t} role={["owner", "admin", "viewer"].includes(row.role) ? row.role : "admin"} team={row.team_name} />
            <SubmitButton className={btnLime}>{t.catalog.save}</SubmitButton>
          </form>
        </Modal>
      )}

      {isOwner && modal === "admin-remove" && row && (
        <Modal title={`${u.removeAdmin}: ${row.full_name || row.email}`} closeHref={here} closeLabel={t.catalog.close}>
          <form action={removeAdmin} className="grid gap-3.5">
            <input type="hidden" name="here" value={here} />
            <input type="hidden" name="id" value={row.user_id} />
            <p className="rounded-2xl bg-d-paper px-4 py-3 text-sm leading-6">{u.removeNote}</p>
            <div className="flex gap-3">
              <SubmitButton className="h-12 rounded-full bg-d-danger px-6 text-[15px] font-bold text-white">{u.removeAdmin}</SubmitButton>
              <PendingLink href={here} spinner={false} className={btnSmall}>{t.catalog.cancel}</PendingLink>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
