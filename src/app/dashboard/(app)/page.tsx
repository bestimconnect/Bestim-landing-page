import Link from "next/link";
import { fmtNum, fmtToday, getDash } from "@/dashboard/i18n";
import { requireAdmin } from "@/dashboard/session";
import type { Overview } from "@/dashboard/types";
import { Card, Tile } from "@/dashboard/ui";

// Rough cost per AI call, from decisions Q70 / Q97 (voice ≈ 7 cents per user per 20 recordings, photo ≈ $0.001).
// ponytail: an estimate, not billing data; replace with real token costs once the AI log stores them.
const COST_VOICE = 0.0035;
const COST_SCAN = 0.001;

export default async function OverviewPage() {
  const { supabase, email } = await requireAdmin();
  const { t, lang } = await getDash();
  const { data } = await supabase.rpc("admin_overview");
  const o = data as Overview | null;
  if (!o) return null;

  const byKnown = o.logs_voice + o.logs_manual;
  const voicePct = byKnown ? Math.round((o.logs_voice / byKnown) * 100) : 0;
  const cost = o.voice_7d * COST_VOICE + o.scan_7d * COST_SCAN;
  const who = email.split("@")[0];

  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="text-sm text-d-muted">{fmtToday(lang)}</p>
        <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">
          {t.overview.hello}
          {who && <>{" "}<span dir="ltr">{who}</span></>}
        </h1>
      </header>

      <section className="relative flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-screen bg-d-panel p-8 text-[#f5f7f5] md:px-11 md:py-10">
        <div className="relative">
          <p className="text-[15px] text-[#b9c4be]">{t.overview.heroLead}</p>
          <p className="mt-2 flex items-baseline gap-3.5">
            <span className="text-7xl font-bold text-lime">{fmtNum(o.users)}</span>
            <span className="text-2xl font-bold">{t.overview.users}</span>
          </p>
          <p className="mt-1.5 text-[15px] text-[#b9c4be]">
            {fmtNum(o.users_7d)} {t.overview.newWeek} · {fmtNum(o.users_30d)} {t.overview.newMonth}
          </p>
        </div>
        <Link
          href="/dashboard/users"
          className="relative inline-flex h-13 items-center rounded-full bg-lime px-7 text-base font-bold text-ink shadow-glow transition-transform hover:-translate-y-0.5"
        >
          {t.overview.viewUsers}
        </Link>
      </section>

      <div className="grid gap-5 md:grid-cols-3">
        <Tile tone="mint" label={t.overview.cars} value={fmtNum(o.vehicles)} />
        <Tile tone="sky" label={t.overview.records} value={fmtNum(o.logs)} sub={`${fmtNum(o.logs_7d)} ${t.overview.recordsWeek}`} />
        <Tile tone="amber" label={t.overview.leads} value={fmtNum(o.leads)} sub={`${fmtNum(o.leads_7d)} ${t.overview.leadsWeek}`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="flex items-center gap-7 lg:col-span-2">
          <div
            className="relative size-37.5 shrink-0 rounded-full"
            style={{ background: `conic-gradient(var(--color-lime) 0 ${voicePct}%, var(--d-teal) ${voicePct}% 100%)` }}
            role="img"
            aria-label={`${t.overview.byVoice} ${voicePct}%`}
          >
            <div className="absolute inset-5.5 flex flex-col items-center justify-center rounded-full bg-d-card">
              <b className="text-3xl">{fmtNum(byKnown)}</b>
              <span className="text-xs text-d-muted">{t.overview.records}</span>
            </div>
          </div>
          <div className="flex flex-col gap-3.5">
            <h2 className="text-lg font-bold">{t.overview.howTitle}</h2>
            <p className="flex items-center gap-2.5">
              <span className="size-3.5 rounded-[5px] border border-[#b5d32a] bg-lime" />
              {t.overview.byVoice} <b>{fmtNum(o.logs_voice)}</b> ({voicePct}%)
            </p>
            <p className="flex items-center gap-2.5">
              <span className="size-3.5 rounded-[5px] bg-d-teal" />
              {t.overview.byHand} <b>{fmtNum(o.logs_manual)}</b>
            </p>
          </div>
        </Card>

        <Card className="lg:col-span-3">
          <h2 className="mb-4 text-lg font-bold">{t.overview.aiTitle}</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Tile tone="mint" small label={t.overview.voiceCalls} value={fmtNum(o.voice_7d)} />
            <Tile tone="sky" small label={t.overview.scans} value={fmtNum(o.scan_7d)} />
            <Tile tone="blush" small label={t.overview.failed} value={fmtNum(o.ai_failed_7d)} />
            <Tile tone="amber" small label={t.overview.cost} value={`$${cost.toFixed(2)}`} />
          </div>
          <p className="mt-4 text-sm text-d-muted">{t.overview.costNote}</p>
        </Card>
      </div>
    </div>
  );
}
