import { Search } from "lucide-react";
import Link from "next/link";
import { link, one } from "./catalog";
import { fmtDate, type DashDict, type DashLang } from "./i18n";
import { Modal } from "./Modal";
import type { AdminRow, UserRow } from "./types";
import { createUser, removeAdmin, setAdminRole } from "./user-actions";
import { RoleFields } from "./UsersTab";
import { Avatar, btnLime, btnSmall, Chip, Field, input, Table, td, th, tint } from "./ui";
import type { SupabaseClient } from "@supabase/supabase-js";

const PATH = "/dashboard/users";
const act = "me-2 inline-flex h-8 items-center rounded-full border border-d-line bg-d-card px-3.5 text-xs font-semibold hover:bg-d-paper";

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

  const { data } = await supabase.rpc("admin_list_admins");
  const rows = (data ?? []) as AdminRow[];
  const row = rows.find((r) => r.user_id === one(sp.id));
  const adminIds = new Set(rows.map((r) => r.user_id));
  // "From users" tab: search ordinary users, hide those who are already admins.
  const found = isOwner && modal === "admin-new" && via === "users" && pq
    ? (((await supabase.rpc("admin_user_list", { p_search: pq, p_limit: 8, p_offset: 0 })).data ?? []) as UserRow[]).filter((r) => !adminIds.has(r.id))
    : [];
  const err = one(sp.err);
  const tab = (on: boolean) => `rounded-full px-5 py-2 text-sm font-semibold ${on ? "bg-lime text-ink" : "bg-d-paper text-d-muted"}`;

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {isOwner ? <Link href={open("admin-new")} className={`${btnLime} inline-flex items-center`}>{u.addAdmin}</Link> : <p className="text-sm text-d-muted">{u.ownerOnly}</p>}
      </div>
      {one(sp.saved) && <p role="status" className="mb-5 rounded-2xl bg-d-mint px-4 py-3 text-sm font-semibold">{u.saved}</p>}
      {err && <p role="alert" className="mb-5 rounded-2xl bg-d-blush px-4 py-3 text-sm font-semibold text-d-danger">{errs[err] ?? errs.save}</p>}

      {rows.length === 0 ? (
        <p className="text-d-muted">{u.empty}</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <th className={th}>{u.name}</th>
              <th className={th}>{u.email}</th>
              <th className={th}>{u.role}</th>
              <th className={th}>{u.team}</th>
              <th className={th}>{u.since}</th>
              <th className={th}>{u.lastSeen}</th>
              {isOwner && <th className={th}>{u.actions}</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.user_id}>
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
                  <td className={td}>
                    <Link href={open("admin-role", r.user_id)} className={act}>{u.changeRole}</Link>
                    <Link href={open("admin-remove", r.user_id)} className={`${act} text-d-danger`}>{u.removeAdmin}</Link>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {isOwner && modal === "admin-new" && (
        <Modal title={u.addAdmin} closeHref={here} closeLabel={t.catalog.close}>
          <div className="mb-4 flex gap-2" role="tablist">
            <Link role="tab" aria-selected={via === "users"} href={link(PATH, { tab: "admins", modal: "admin-new", via: "users" })} className={tab(via === "users")}>{u.fromUsers}</Link>
            <Link role="tab" aria-selected={via === "new"} href={link(PATH, { tab: "admins", modal: "admin-new", via: "new" })} className={tab(via === "new")}>{u.newAccount}</Link>
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
                <button type="submit" className={btnSmall}>{u.search}</button>
              </form>
              {pq && found.length === 0 && <p className="text-sm text-d-muted">{u.noMatch}</p>}
              {found.map((r) => (
                <form key={r.id} action={setAdminRole} className="grid gap-2 rounded-2xl border border-d-line p-3.5">
                  <input type="hidden" name="here" value={here} />
                  <input type="hidden" name="id" value={r.id} />
                  <p className="font-semibold">{r.full_name || "—"} <span dir="ltr" className="block text-xs font-normal text-d-muted">{r.email}</span></p>
                  <RoleFields t={t} />
                  <button type="submit" className={btnLime}>{u.makeAdmin}</button>
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
              <button type="submit" className={btnLime}>{u.create}</button>
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
            <button type="submit" className={btnLime}>{t.catalog.save}</button>
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
              <button type="submit" className="h-12 rounded-full bg-d-danger px-6 text-[15px] font-bold text-white">{u.removeAdmin}</button>
              <Link href={here} className={btnSmall}>{t.catalog.cancel}</Link>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
