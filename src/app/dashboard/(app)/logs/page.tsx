import { redirect } from "next/navigation";
import { fmtDate, getDash } from "@/dashboard/i18n";
import { requireAdmin } from "@/dashboard/session";
import { Pager, pageOf, sizeOf } from "@/dashboard/pager";
import { PendingLink } from "@/dashboard/Pending";
import { Chip, EmptyState, PageTitle, TabNav, Table, td, th } from "@/dashboard/ui";

type Audit = { id: number; created_at: string; action: string; target: string | null; detail: { admin_email?: string; name?: string } | null };
type Ai = { id: number; created_at: string; user_id: string | null; kind: "voice" | "scan"; ok: boolean; ms: number | null };

export default async function LogsPage({ searchParams }: PageProps<"/dashboard/logs">) {
  const { supabase } = await requireAdmin();
  const { t, lang } = await getDash();
  const sp = await searchParams;
  const tab = sp.tab === "ai" ? "ai" : "audit";
  const page = pageOf(sp.page);
  const size = sizeOf(sp.size);
  const range = [(page - 1) * size, page * size - 1] as const;

  const tabs = [
    ["audit", t.logs.audit],
    ["ai", t.logs.ai],
  ] as const;

  return (
    <>
      <PageTitle>{t.logs.title}</PageTitle>
      <TabNav
        label={t.logs.title}
        items={tabs.map(([id, label]) => ({ href: `/dashboard/logs?tab=${id}`, label, active: tab === id }))}
      />
      {tab === "audit" ? <AuditTable /> : <AiTable />}
    </>
  );

  async function AuditTable() {
    const { data, count } = await supabase.from("admin_audit_log").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(...range);
    const rows = (data ?? []) as Audit[];
    if (!rows.length && page > 1) redirect(`/dashboard/logs?tab=${tab}`);
    if (!rows.length) return <EmptyState>{t.logs.empty}</EmptyState>;
    return (
      <>
        <Table>
          <thead>
            <tr>{[t.logs.time, t.logs.admin, t.logs.action, t.logs.target].map((h) => <th key={h} className={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className={td}>{fmtDate(lang, r.created_at, true)}</td>
                <td className={td} dir="ltr">{r.detail?.admin_email ?? "—"}</td>
                <td className={td}>
                  <Chip tone="sky">{(t.logs as Record<string, string>)[r.action] ?? r.action}</Chip>
                </td>
                <td className={td} dir="ltr">
                  {r.action === "view_user" && r.target ? (
                    <PendingLink spinner={false} href={`/dashboard/users/${r.target}`} className="font-medium text-d-teal underline-offset-4 hover:underline">{r.target.slice(0, 8)}</PendingLink>
                  ) : r.action.startsWith("catalog_") && r.target ? (
                    <span dir="auto">
                      {(t.logs as Record<string, string>)[`tbl_${r.target.split(":")[0]}`] ?? r.target.split(":")[0]}
                      {r.detail?.name ? ` ${r.detail.name}` : ""} <span className="text-d-muted" dir="ltr">{r.target.split(":")[1]?.slice(0, 8)}</span>
                    </span>
                  ) : (
                    r.target ?? "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Pager size={size} page={page} total={count ?? rows.length} base="/dashboard/logs" params={{ tab }} />
      </>
    );
  }

  async function AiTable() {
    const { data, count } = await supabase.from("ai_usage_log").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(...range);
    const rows = (data ?? []) as Ai[];
    if (!rows.length && page > 1) redirect(`/dashboard/logs?tab=${tab}`);
    if (!rows.length) return <EmptyState>{t.logs.empty}</EmptyState>;
    return (
      <>
        <Table>
          <thead>
            <tr>{[t.logs.time, t.logs.user, t.logs.kind, t.logs.result, t.logs.ms].map((h) => <th key={h} className={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className={td}>{fmtDate(lang, r.created_at, true)}</td>
                <td className={td} dir="ltr">
                  {r.user_id ? (
                    <PendingLink spinner={false} href={`/dashboard/users/${r.user_id}`} className="font-medium text-d-teal underline-offset-4 hover:underline">{r.user_id.slice(0, 8)}</PendingLink>
                  ) : (
                    "—"
                  )}
                </td>
                <td className={td}>
                  <Chip tone={r.kind === "voice" ? "mint" : "sky"}>{r.kind === "voice" ? t.logs.voice : t.logs.scan}</Chip>
                </td>
                <td className={`${td} ${r.ok ? "" : "text-d-danger"}`}>{r.ok ? t.logs.ok : t.logs.failed}</td>
                <td className={td}>{r.ms != null ? (r.ms / 1000).toFixed(1) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Pager size={size} page={page} total={count ?? rows.length} base="/dashboard/logs" params={{ tab }} />
      </>
    );
  }
}
