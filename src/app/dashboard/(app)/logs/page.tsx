import Link from "next/link";
import { fmtDate, getDash } from "@/dashboard/i18n";
import { requireAdmin } from "@/dashboard/session";
import { Chip, PageTitle, Table, td, th } from "@/dashboard/ui";

type Audit = { id: number; created_at: string; action: string; target: string | null; detail: { admin_email?: string; name?: string } | null };
type Ai = { id: number; created_at: string; user_id: string | null; kind: "voice" | "scan"; ok: boolean; ms: number | null };

export default async function LogsPage({ searchParams }: PageProps<"/dashboard/logs">) {
  const { supabase } = await requireAdmin();
  const { t, lang } = await getDash();
  const tab = (await searchParams).tab === "ai" ? "ai" : "audit";

  const tabs = [
    ["audit", t.logs.audit],
    ["ai", t.logs.ai],
  ] as const;

  return (
    <>
      <PageTitle>{t.logs.title}</PageTitle>
      <nav className="mb-5 inline-flex gap-1 rounded-full border border-d-line bg-d-card p-1">
        {tabs.map(([id, label]) => (
          <Link
            key={id}
            href={`/dashboard/logs?tab=${id}`}
            aria-current={tab === id ? "page" : undefined}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold ${
              tab === id ? "bg-d-panel text-[#f5f7f5]" : "text-d-muted"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
      {tab === "audit" ? <AuditTable /> : <AiTable />}
    </>
  );

  async function AuditTable() {
    const { data } = await supabase.from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(100);
    const rows = (data ?? []) as Audit[];
    if (!rows.length) return <p className="text-d-muted">{t.logs.empty}</p>;
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
                    <Link href={`/dashboard/users/${r.target}`} className="font-medium text-d-teal underline-offset-4 hover:underline">{r.target.slice(0, 8)}</Link>
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
        <p className="mt-3 text-[13px] text-d-muted">{t.logs.limitNote}</p>
      </>
    );
  }

  async function AiTable() {
    const { data } = await supabase.from("ai_usage_log").select("*").order("created_at", { ascending: false }).limit(100);
    const rows = (data ?? []) as Ai[];
    if (!rows.length) return <p className="text-d-muted">{t.logs.empty}</p>;
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
                    <Link href={`/dashboard/users/${r.user_id}`} className="font-medium text-d-teal underline-offset-4 hover:underline">{r.user_id.slice(0, 8)}</Link>
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
        <p className="mt-3 text-[13px] text-d-muted">{t.logs.limitNote}</p>
      </>
    );
  }
}
