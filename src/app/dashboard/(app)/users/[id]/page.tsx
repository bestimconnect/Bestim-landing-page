import { Info } from "lucide-react";
import Image from "next/image";
import { canEditPlans } from "@/dashboard/catalog";
import { PendingLink, SubmitButton } from "@/dashboard/Pending";
import { setUserPlan } from "@/dashboard/plan-actions";
import type { Plan } from "@/dashboard/types";
import { fmtDate, fmtNum, getDash } from "@/dashboard/i18n";
import { Pager, pageOf, sizeOf } from "@/dashboard/pager";
import { requireAdmin } from "@/dashboard/session";
import type { UserDetail } from "@/dashboard/types";
import { Avatar, btnLime, Chip, EmptyState, Field, Flash, input, Table, td, th, tint } from "@/dashboard/ui";

export default async function UserPage({ params, searchParams }: PageProps<"/dashboard/users/[id]">) {
  const { supabase, role } = await requireAdmin();
  const { t, lang } = await getDash();
  const { id } = await params;
  const sp = await searchParams;
  const planMsg = sp.plan;
  const lp = pageOf(sp.lp);
  const dp = pageOf(sp.dp);
  const size = sizeOf(sp.size);
  const here = `/dashboard/users/${id}`;
  // Opening a user is written to the audit log by the function itself. A bad id makes it error: shown as "not found".
  const { data } = await supabase.rpc("admin_user_detail", { p_user: id });
  const u = data as UserDetail | null;
  const [logsRes, daysRes] = u
    ? await Promise.all([
        supabase.rpc("admin_user_logs", { p_user: id, p_limit: size, p_offset: (lp - 1) * size }),
        supabase.rpc("admin_user_ai_days", { p_user: id, p_limit: size, p_offset: (dp - 1) * size }),
      ])
    : [null, null];
  const logs = (logsRes?.data ?? { total: 0, rows: [] }) as { total: number; rows: UserDetail["recent_logs"] };
  const days = (daysRes?.data ?? { total: 0, rows: [] }) as { total: number; rows: UserDetail["ai_days"] };
  if (!u) {
    return (
      <>
        <PendingLink href="/dashboard/users" className="mb-4 inline-block text-sm font-medium text-d-teal underline-offset-4 hover:underline">
          ← {t.user.back}
        </PendingLink>
        <EmptyState>{t.user.notFound}</EmptyState>
      </>
    );
  }

  const canPlan = canEditPlans(role);
  const plans = canPlan ? (((await supabase.from("plans").select("id,name_ar,name_en,is_default").order("sort")).data ?? []) as Plan[]) : [];
  const planName = (pid: string | null) => {
    const p = plans.find((x) => x.id === pid);
    return p ? (lang === "ar" ? p.name_ar : p.name_en) : pid;
  };
  const sources = t.user.planSources as Record<string, string>;
  const name = u.full_name || u.email || "—";
  const facts = [
    [t.user.joined, fmtDate(lang, u.created_at)],
    [t.user.lastSeen, fmtDate(lang, u.last_sign_in_at, true)],
    [t.user.language, u.language === "ar" ? "العربية" : "English"],
    [t.user.provider, u.provider ?? "—"],
  ];
  const counters = [
    [t.user.voice, u.logs_voice],
    [t.user.hand, u.logs_manual],
    [t.user.corrections, u.corrections],
  ] as const;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[21rem_minmax(0,1fr)]">
      <aside className="relative flex flex-col gap-5 overflow-hidden rounded-screen bg-d-panel p-7 text-[#f5f7f5]">
        <Image
          src="/brand/logo-mark-inverse.png"
          alt=""
          width={512}
          height={401}
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-14 -end-16 h-auto w-72 opacity-8"
        />
        <PendingLink href="/dashboard/users" className="relative text-sm font-medium text-lime">
          ← {t.user.back}
        </PendingLink>
        <div className="relative flex flex-col items-center gap-2.5 text-center">
          <Avatar text={name} className="size-24 bg-lime text-[40px] text-ink" />
          <h1 className="text-2xl font-extrabold">{name}</h1>
          <p dir="ltr" className="max-w-full truncate text-sm text-[#b9c4be]">{u.email}</p>
        </div>
        <div className="relative grid grid-cols-3 gap-2 text-center">
          {counters.map(([label, n]) => (
            <div key={label} className="rounded-2xl bg-white/10 px-1 py-3.5">
              <p className="text-[22px] font-bold">{fmtNum(n)}</p>
              <p className="text-xs text-[#b9c4be]">{label}</p>
            </div>
          ))}
        </div>
        <dl className="relative text-sm">
          {facts.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3 border-t border-white/10 py-3">
              <dt className="text-[#b9c4be]">{label}</dt>
              <dd className="font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </aside>

      <div className="flex min-w-0 flex-col gap-6">
        <section className="rounded-3xl border border-d-line bg-d-card p-6 shadow-card">
          <h2 className="text-xl font-extrabold">{t.user.planTitle}</h2>
          <p className="mt-2 text-sm">
            {u.plan_id ? (
              <>
                <b>{planName(u.plan_id)}</b> · {sources[u.plan_source ?? ""] ?? u.plan_source} ·{" "}
                {u.plan_expires_at ? `${t.user.planUntil} ${fmtDate(lang, u.plan_expires_at)}` : t.user.planNoEnd}
              </>
            ) : (
              t.user.planDefault
            )}
          </p>
          {planMsg === "ok" && <Flash className="mt-3">{t.user.planSaved}</Flash>}
          {planMsg === "err" && <Flash tone="err" className="mt-3">{t.user.planFailed}</Flash>}
          {canPlan && (
            <form action={setUserPlan} className="mt-4 grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <input type="hidden" name="user" value={u.id} />
              <Field label={t.user.planPick}>
                <select name="plan" defaultValue={u.plan_id ?? ""} className={input}>
                  <option value="">{t.user.planDefaultOption}</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>{lang === "ar" ? p.name_ar : p.name_en}</option>
                  ))}
                </select>
              </Field>
              <Field label={t.user.planExpires}>
                <input name="expires" type="date" dir="ltr" defaultValue={u.plan_expires_at?.slice(0, 10) ?? ""} className={input} />
              </Field>
              <SubmitButton className={btnLime}>{t.catalog.save}</SubmitButton>
            </form>
          )}
        </section>

        <section>
          <h2 className="mb-3.5 text-xl font-extrabold">{t.user.carsTitle}</h2>
          {u.vehicles.length === 0 ? (
            <EmptyState>{t.user.noCars}</EmptyState>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {u.vehicles.map((v, i) => (
                <article key={i} className={`rounded-3xl p-6 ${tint(i)}`}>
                  <div className="flex items-center justify-between gap-3">
                    <b className="text-lg">{v.make} {v.model} {v.year ?? ""}</b>
                    {v.primary && (
                      <span className="rounded-full bg-d-card px-3 py-1 text-xs font-semibold">{t.user.primary}</span>
                    )}
                  </div>
                  <p className="mt-5 text-[13px] text-d-muted">{t.user.odometer}</p>
                  <p className="text-4xl font-bold">
                    {v.odometer != null ? fmtNum(v.odometer) : "—"}
                    {v.odometer != null && <span className="ms-2 text-base font-medium">{v.unit}</span>}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        {logs.total === 0 ? (
          <section>
            <h2 className="mb-3.5 text-xl font-extrabold">{t.user.recentTitle}</h2>
            <EmptyState>{t.user.noRecords}</EmptyState>
          </section>
        ) : (
          <Table title={t.user.recentTitle} footer={<Pager page={lp} total={logs.total} size={size} pageKey="lp" base={here} params={{ dp: dp > 1 ? String(dp) : undefined }} />}>
            <thead>
              <tr>
                {["", t.user.date, t.user.cost, t.user.source, t.user.status].map((h, i) => (
                  <th key={i} className={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.rows.map((l, i) => (
                <tr key={i}>
                  <td className={`${td} font-semibold`}>{l.title}</td>
                  <td className={td}>{fmtDate(lang, l.service_date)}</td>
                  <td className={td}>{l.cost != null ? `${fmtNum(l.cost)} ${l.currency}` : "—"}</td>
                  <td className={td}>
                    <Chip tone={l.source === "voice" ? "mint" : "paper"}>{l.source === "voice" ? t.user.voice : t.user.hand}</Chip>
                  </td>
                  <td className={`${td} text-d-muted`}>{l.status}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {days.total === 0 ? (
          <section>
            <h2 className="mb-3.5 text-xl font-extrabold">{t.user.aiTitle}</h2>
            <EmptyState>{t.user.noAi}</EmptyState>
          </section>
        ) : (
          <Table title={t.user.aiTitle} footer={<Pager page={dp} total={days.total} size={size} pageKey="dp" base={here} params={{ lp: lp > 1 ? String(lp) : undefined }} />}>
            <thead>
              <tr>
                {[t.user.day, t.user.voiceCalls, t.user.scans].map((h) => (
                  <th key={h} className={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.rows.map((d) => (
                <tr key={d.day}>
                  <td className={td}>{fmtDate(lang, d.day)}</td>
                  <td className={td}>{fmtNum(d.count)}</td>
                  <td className={td}>{fmtNum(d.scans)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        <p className="flex items-center gap-2.5 rounded-field bg-d-sky px-4.5 py-3 text-sm">
          <Info size={18} strokeWidth={1.8} aria-hidden="true" className="shrink-0" />
          {t.user.auditNote}
        </p>
      </div>
    </div>
  );
}
