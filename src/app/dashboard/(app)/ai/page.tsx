import { ExternalLink, Settings } from "lucide-react";
import { cost, DEFAULT_PRICES, money, payUrl, type AiUser, type AiUsage } from "@/dashboard/ai";
import { saveAiSettings } from "@/dashboard/ai-actions";
import { one } from "@/dashboard/catalog";
import { fmtNum, getDash } from "@/dashboard/i18n";
import { Modal } from "@/dashboard/Modal";
import { PendingLink, SubmitButton } from "@/dashboard/Pending";
import { Pager, pageOf, sizeOf } from "@/dashboard/pager";
import { requireAdmin } from "@/dashboard/session";
import { supabaseServer } from "@/dashboard/supabase";
import { btnLime, btnSmall, Card, Chip, Field, Flash, InfoBanner, input, PageTitle, Table, th, td, Tile } from "@/dashboard/ui";

const PATH = "/dashboard/ai";

export default async function AiPage({ searchParams }: PageProps<"/dashboard/ai">) {
  // Start the data call alongside the admin check (the database function checks admin itself).
  const supabase = await supabaseServer();
  const sp = await searchParams;
  const pg = pageOf(sp.page);
  const size = sizeOf(sp.size);
  const [{ role }, { t }, usage, people] = await Promise.all([
    requireAdmin(), getDash(), supabase.rpc("admin_ai_usage"),
    supabase.rpc("admin_ai_users", { p_limit: size, p_offset: (pg - 1) * size }),
  ]);
  const A = t.ai;
  const errs = A.err as Record<string, string>;
  const u = usage.data as AiUsage | null;
  if (!u) return <Flash tone="err" className="">{errs.save}</Flash>;

  const prices = u.settings.ai_prices ?? DEFAULT_PRICES;
  const budget = u.settings.ai_budget ?? null;
  const billing = u.settings.billing_account ?? "";
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo" }).format(new Date());
  const month = today.slice(0, 7);

  const mine = u.daily.filter((r) => r.day.startsWith(month));
  const sum = (f: (r: (typeof mine)[number]) => number) => mine.reduce((n, r) => n + f(r), 0);
  const spent = sum((r) => cost(r, prices));
  const calls = (k: string) => sum((r) => (r.kind === k ? r.calls : 0));
  const total = calls("voice") + calls("scan");
  const pct = budget ? (spent / budget) * 100 : 0;

  // Spend per day for the chart (oldest first).
  const perDay = new Map<string, number>();
  for (const r of u.daily) perDay.set(r.day, (perDay.get(r.day) ?? 0) + cost(r, prices));
  const days = [...perDay.entries()].sort(([a], [b]) => a.localeCompare(b));
  const peak = Math.max(...days.map(([, v]) => v), 0.0001);

  // Top users this month (owner/admin only; viewers get an empty list from the database).
  const byUser = new Map<string, { name: string; voice: number; scan: number; cost: number }>();
  const ppl = (people.data ?? { total: 0, rows: [] }) as { total: number; rows: AiUser[] };
  for (const r of ppl.rows) {
    const k = r.user_id ?? "gone";
    const row = byUser.get(k) ?? { name: r.name, voice: 0, scan: 0, cost: 0 };
    row[r.kind] += r.calls;
    row.cost += cost(r, prices);
    byUser.set(k, row);
  }
  const top = [...byUser.values()]; // already busiest first, from the database

  const modal = one(sp.modal) === "settings" && role === "owner";
  const err = one(sp.err);
  const bar = pct >= 100 ? "bg-d-danger" : pct >= 80 ? "bg-[#e0a526]" : "bg-lime";
  const priceField = (name: string, label: string, v: number) => (
    <Field label={label}>
      <input name={name} required inputMode="decimal" defaultValue={v} dir="ltr" className={input} />
    </Field>
  );

  return (
    <>
      <PageTitle sub={A.sub}>{A.title}</PageTitle>
      <InfoBanner>{A.info}</InfoBanner>
      {one(sp.saved) && <Flash>{A.saved}</Flash>}

      {modal && (
        <Modal title={A.settings.title} closeHref={PATH} closeLabel={A.settings.cancel}>
          <form action={saveAiSettings} className="flex flex-col gap-4 p-6">
            {err && <Flash tone="err" className="">{errs[err] ?? errs.save}</Flash>}
            <Field label={A.settings.budget}>
              <input name="budget" inputMode="decimal" defaultValue={budget ?? ""} dir="ltr" className={input} />
            </Field>
            <fieldset className="flex flex-col gap-3 rounded-2xl border border-d-line p-4">
              <legend className="px-2 text-[13px] font-semibold">{A.settings.prices}</legend>
              {priceField("p_input", A.settings.pInput, prices.input)}
              {priceField("p_audio", A.settings.pAudio, prices.audio)}
              {priceField("p_output", A.settings.pOutput, prices.output)}
              <p className="text-xs text-d-muted">{A.settings.priceHint}</p>
            </fieldset>
            <Field label={A.settings.billing}>
              <input name="billing" defaultValue={billing} dir="ltr" placeholder="01A2B3-C4D5E6-F7A8B9" className={input} />
              <span className="mt-1 block text-xs text-d-muted">{A.settings.billingHint}</span>
            </Field>
            <div className="flex flex-wrap gap-2.5">
              <SubmitButton className={btnLime}>{A.settings.save}</SubmitButton>
              <PendingLink href={PATH} spinner={false} className={btnSmall}>{A.settings.cancel}</PendingLink>
            </div>
          </form>
        </Modal>
      )}

      <Card className="mb-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-bold">{A.budgetTitle}</h2>
          {budget !== null && <Chip tone={pct >= 100 ? "blush" : pct >= 80 ? "amber" : "mint"}>{pct >= 100 ? A.over : pct >= 80 ? A.warn80 : A.ok}</Chip>}
          <div className="ms-auto flex flex-wrap items-center gap-2.5">
            {role === "owner" && (
              <PendingLink href={`${PATH}?modal=settings`} className={`${btnSmall} gap-2`}><Settings size={16} aria-hidden="true" />{A.settingsBtn}</PendingLink>
            )}
            {billing ? (
              <a href={payUrl(billing)} target="_blank" rel="noreferrer" className={`${btnLime} inline-flex items-center gap-2`}>
                {A.pay}<ExternalLink size={16} aria-hidden="true" />
              </a>
            ) : (
              <span className={`${btnLime} inline-flex items-center opacity-50`} aria-disabled="true">{A.pay}</span>
            )}
          </div>
        </div>
        {budget === null ? <p className="text-d-muted">{A.noBudget}</p> : (
          <>
            <div className="h-4 overflow-hidden rounded-full bg-d-paper" role="meter" aria-valuemin={0} aria-valuemax={budget} aria-valuenow={Math.min(spent, budget)} aria-label={A.budgetTitle}>
              <div className={`h-full rounded-full ${bar}`} style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
            <p className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
              <span>{A.spent}: <b dir="ltr">{money(spent)}</b> {A.of} <b dir="ltr">{money(budget)}</b> ({Math.round(pct)}%)</span>
              <span>{A.left}: <b dir="ltr">{money(Math.max(budget - spent, 0))}</b></span>
            </p>
          </>
        )}
        <p className="mt-3 text-xs text-d-muted">{billing ? A.payHint : A.payMissing}</p>
      </Card>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Tile tone="amber" small label={A.spent} value={<bdi>{money(spent)}</bdi>} />
        <Tile tone="mint" small label={A.voice} value={fmtNum(calls("voice"))} />
        <Tile tone="sky" small label={A.scans} value={fmtNum(calls("scan"))} />
        <Tile tone="blush" small label={A.failed} value={fmtNum(sum((r) => r.failed))} sub={total ? `${A.perCall}: ${money(spent / total)}` : undefined} />
      </div>

      <Card className="mb-6">
        <h2 className="mb-4 text-lg font-bold">{A.daily}</h2>
        {days.length === 0 ? <p className="text-d-muted">{A.noData}</p> : (
          <div dir="ltr" className="flex h-40 items-end gap-1">
            {days.map(([day, v]) => (
              <div key={day} title={`${day}: ${money(v)}`} className="flex h-full flex-1 items-end">
                <div className="w-full rounded-t-md bg-d-teal" style={{ height: `${Math.max((v / peak) * 100, 2)}%` }} />
              </div>
            ))}
          </div>
        )}
        <p className="mt-3 text-xs text-d-muted">{A.estimate}</p>
      </Card>

      {top.length > 0 && (
        <Table title={A.topUsers} footer={<Pager size={size} page={pg} total={ppl.total} base={PATH} />}>
          <thead>
            <tr>
              <th className={th}>{A.colUser}</th>
              <th className={th}>{A.colVoice}</th>
              <th className={th}>{A.colScan}</th>
              <th className={th}>{A.colCost}</th>
            </tr>
          </thead>
          <tbody>
            {top.map((r, i) => (
              <tr key={i}>
                <td className={td}>{r.name}</td>
                <td className={td}>{fmtNum(r.voice)}</td>
                <td className={td}>{fmtNum(r.scan)}</td>
                <td className={td}><bdi>{money(r.cost)}</bdi></td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
