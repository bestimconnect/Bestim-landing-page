import { DeliveryCheck } from "@/dashboard/DeliveryCheck";
import { createClient } from "@supabase/supabase-js";
import { site } from "@/lib/site";
import { ComposeForm, type Prefill } from "@/dashboard/ComposeForm";
import { fmtDate, fmtNum, getDash } from "@/dashboard/i18n";
import { requireAdmin } from "@/dashboard/session";
import { btnSmall, Chip, EmptyState, Flash, PageTitle, Table, td, th } from "@/dashboard/ui";
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
  // "Resend": ?from=<id> fills the form with an old message (texts, tap action, recipients) so it can be sent again.
  const KEYS: Record<string, string> = { "/": "home", "/services": "services", "/expenses": "money", "/garage": "garage", "/notifications": "notifications", "/upgrade": "upgrade" };
  const fromId = one(sp.from);
  let from: Prefill | undefined;
  if (canSend && fromId && /^[0-9a-f-]{36}$/i.test(fromId) && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const svc = createClient(site.supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: a } = await svc.from("announcements").select("*").eq("id", fromId).single();
    if (a) {
      let picked: Prefill["picked"] = [];
      if (a.audience === "selected") {
        const { data: us } = await svc.from("announcement_users").select("user_id").eq("announcement_id", fromId).limit(500);
        const { data: ps } = await svc.from("profiles").select("id, full_name").in("id", (us ?? []).map((u) => u.user_id as string));
        picked = (ps ?? []).map((p) => ({ id: p.id as string, name: (p.full_name as string) ?? "", email: "" }));
      }
      from = {
        title_ar: a.title_ar, body_ar: a.body_ar, title_en: a.title_en ?? "", body_en: a.body_en ?? "",
        action: a.action, screen: KEYS[a.action_value ?? ""] ?? "", link: a.action === "link" ? (a.action_value ?? "") : "",
        audience: a.audience, picked,
      };
    }
  }
  const err = one(sp.err);
  const errs = n.err as Record<string, string>;

  return (
    <>
      <PageTitle sub={n.sub}>{n.title}</PageTitle>
      {one(sp.saved) && <Flash>{n.sentSummary.replace("{sent}", one(sp.sent) || "0").replace("{failed}", one(sp.failed) || "0")}</Flash>}
      {err && <Flash tone="err">{errs[err] ?? errs.save}</Flash>}
      {canSend && <ComposeForm key={fromId ?? "new"} l={n.form} total={total} from={from} />}
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
              <th className={th} />
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
                <td className={td}>
                  <div className="flex flex-wrap items-center gap-2">
                    {canSend && <a href={`/dashboard/notifications?from=${r.id}#compose`} className={btnSmall}>{n.resend}</a>}
                    {r.push_sent > 0 && <DeliveryCheck id={r.id} l={n.form} />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
