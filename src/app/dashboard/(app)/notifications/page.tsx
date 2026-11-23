import { ComposeForm } from "@/dashboard/ComposeForm";
import { fmtDate, fmtNum, getDash } from "@/dashboard/i18n";
import { requireAdmin } from "@/dashboard/session";
import { Chip, EmptyState, Flash, PageTitle, Table, td, th } from "@/dashboard/ui";
import { one } from "@/dashboard/catalog";

type Row = { id: string; title_ar: string; title_en: string | null; audience: string; push_sent: number; push_failed: number; recipients: number; created_at: string };

export default async function NotificationsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { supabase, role } = await requireAdmin();
  const { t, lang } = await getDash();
  const n = t.notifications;
  const sp = await searchParams;
  const canSend = role === "owner" || role === "admin";
  const [{ data: history }, { data: users }] = await Promise.all([
    supabase.rpc("admin_announcements", { p_limit: 50 }),
    supabase.rpc("admin_user_list", { p_search: "", p_limit: 1, p_offset: 0 }),
  ]);
  const rows = (history ?? []) as Row[];
  const total = ((users ?? []) as { total: number }[])[0]?.total ?? 0;
  const err = one(sp.err);
  const errs = n.err as Record<string, string>;

  return (
    <>
      <PageTitle sub={n.sub}>{n.title}</PageTitle>
      {one(sp.saved) && <Flash>{n.sentSummary.replace("{sent}", one(sp.sent) || "0").replace("{failed}", one(sp.failed) || "0")}</Flash>}
      {err && <Flash tone="err">{errs[err] ?? errs.save}</Flash>}
      {canSend && <ComposeForm l={n.form} total={total} />}
      <h2 className="mb-3 mt-10 text-lg font-bold">{n.history}</h2>
      {rows.length === 0 ? (
        <EmptyState>{n.empty}</EmptyState>
      ) : (
        <Table>
          <thead>
            <tr>
              <th className={th}>{n.col.date}</th>
              <th className={th}>{n.col.title}</th>
              <th className={th}>{n.col.audience}</th>
              <th className={th}>{n.col.recipients}</th>
              <th className={th}>{n.col.pushed}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className={td}>{fmtDate(lang, r.created_at, true)}</td>
                <td className={td}>{lang === "en" && r.title_en ? r.title_en : r.title_ar}</td>
                <td className={td}><Chip tone={r.audience === "all" ? "amber" : "sky"}>{r.audience === "all" ? n.form.all : n.form.selected}</Chip></td>
                <td className={td}>{fmtNum(r.recipients)}</td>
                <td className={td}>{fmtNum(r.push_sent)}{r.push_failed ? ` / ${fmtNum(r.push_failed)} ✗` : ""}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
