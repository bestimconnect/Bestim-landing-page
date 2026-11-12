import { Search } from "lucide-react";
import Link from "next/link";
import { fmtDate, fmtNum, getDash } from "@/dashboard/i18n";
import { requireAdmin } from "@/dashboard/session";
import type { UserRow } from "@/dashboard/types";
import { Avatar, PageTitle, tint } from "@/dashboard/ui";

const PAGE = 25;

export default async function UsersPage({ searchParams }: PageProps<"/dashboard/users">) {
  const { supabase } = await requireAdmin();
  const { t, lang } = await getDash();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 80) : "";
  const page = Math.max(1, Number(sp.page) || 1);

  const { data } = await supabase.rpc("admin_user_list", { p_search: q, p_limit: PAGE, p_offset: (page - 1) * PAGE });
  const rows = (data ?? []) as UserRow[];
  const total = rows[0]?.total ?? 0;
  const href = (p: number) => `/dashboard/users?${new URLSearchParams({ ...(q && { q }), page: String(p) })}`;
  const pager = "rounded-full border border-d-line bg-d-card px-4 py-2 text-sm";

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-x-4">
        <PageTitle sub={`${t.users.total}: ${fmtNum(total)}`}>{t.users.title}</PageTitle>
        <form className="mb-6 flex w-full gap-2 sm:w-auto" role="search">
          <label className="flex h-13 min-w-0 flex-1 items-center gap-2.5 rounded-full border border-d-line bg-d-card px-5 text-d-muted focus-within:border-d-teal sm:w-90 sm:flex-none">
            <Search size={18} strokeWidth={1.9} aria-hidden="true" className="shrink-0" />
            <input
              name="q"
              defaultValue={q}
              placeholder={t.users.placeholder}
              aria-label={t.users.placeholder}
              className="min-w-0 flex-1 bg-transparent text-d-ink outline-none placeholder:text-d-muted"
            />
          </label>
          <button type="submit" className="h-13 rounded-full bg-lime px-6 font-semibold text-ink shadow-glow">
            {t.users.search}
          </button>
        </form>
      </div>

      {rows.length === 0 ? (
        <p className="text-d-muted">{t.users.empty}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((u, i) => (
            <Link
              key={u.id}
              href={`/dashboard/users/${u.id}`}
              className="block rounded-3xl border border-d-line bg-d-card p-5 shadow-card transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3.5">
                <Avatar text={u.full_name || u.email || "?"} className={`size-14 text-[22px] text-ink ${tint(i)}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[17px] font-bold">{u.full_name || "—"}</p>
                  <p dir="ltr" className="truncate text-[13px] text-d-muted rtl:text-end">{u.email ?? "—"}</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-d-line pt-4 text-center">
                <div>
                  <p className="text-xl font-bold">{fmtNum(u.vehicles)}</p>
                  <p className="text-xs text-d-muted">{t.users.cars}</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{fmtNum(u.logs)}</p>
                  <p className="text-xs text-d-muted">{t.users.records}</p>
                </div>
                <div>
                  <p className="text-sm font-bold leading-7">{fmtDate(lang, u.last_sign_in_at)}</p>
                  <p className="text-xs text-d-muted">{t.users.lastSeen}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-d-muted">{t.users.joined}: {fmtDate(lang, u.created_at)}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-end gap-2 text-sm">
        {page > 1 && <Link href={href(page - 1)} className={pager}>{t.users.prev}</Link>}
        {page * PAGE < total && <Link href={href(page + 1)} className={pager}>{t.users.next}</Link>}
      </div>
    </>
  );
}
