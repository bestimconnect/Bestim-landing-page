import { canEditPlans, link, one } from "@/dashboard/catalog";
import { deletePlan, savePlan, savePlans } from "@/dashboard/plan-actions";
import { ENTITLEMENTS, GROUPS, MAX_PLANS } from "@/dashboard/plans";
import { fmtNum, getDash } from "@/dashboard/i18n";
import { Modal } from "@/dashboard/Modal";
import { PendingLink, SubmitButton } from "@/dashboard/Pending";
import { requireAdmin } from "@/dashboard/session";
import type { FeatureLock, Plan } from "@/dashboard/types";
import { btnLime, CatalogForm, Chip, EmptyState, Field, Flash, InfoBanner, input, PageTitle, td } from "@/dashboard/ui";

const PATH = "/dashboard/plans";
type Dict = Awaited<ReturnType<typeof getDash>>["t"];

export default async function PlansPage({ searchParams }: PageProps<"/dashboard/plans">) {
  const { supabase, role } = await requireAdmin();
  const { t, lang } = await getDash();
  const sp = await searchParams;
  const edit = canEditPlans(role);
  const ent = t.plans.ent as Record<string, string>;
  const errs = t.catalog.err as Record<string, string>;

  const [{ data }, { data: lockRows }] = await Promise.all([supabase.from("plans").select("*").order("sort"), supabase.from("feature_locks").select("*")]);
  const plans = (data ?? []) as Plan[];
  const locks = new Map(((lockRows ?? []) as FeatureLock[]).map((l) => [l.id, l]));
  const full = plans.length >= MAX_PLANS;
  const modal = one(sp.modal);
  const plan = modal === "plan-edit" ? plans.find((p) => p.id === one(sp.id)) : undefined;
  const isNew = modal === "plan-new" && edit && !full;
  const err = one(sp.err);
  const num = (v: unknown) => (typeof v === "number" ? v : "");

  return (
    <>
      <PageTitle sub={`${fmtNum(plans.length)} / ${fmtNum(MAX_PLANS)} · ${t.plans.sub}`}>{t.plans.title}</PageTitle>
      <InfoBanner>{t.plans.info}</InfoBanner>
      {one(sp.saved) && <Flash>{t.plans.saved}</Flash>}
      {err && <Flash tone="err">{errs[err] ?? errs.save}</Flash>}

      {edit && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          {full ? (
            <>
              <span className={`${btnLime} inline-flex items-center opacity-50`} aria-disabled="true">{t.plans.new}</span>
              <span className="text-sm text-d-muted">{t.plans.maxHint}</span>
            </>
          ) : (
            <PendingLink href={link(PATH, { modal: "plan-new" })} className={`${btnLime} inline-flex items-center`}>{t.plans.new}</PendingLink>
          )}
        </div>
      )}

      {plans.length === 0 ? (
        <EmptyState>{t.plans.empty}</EmptyState>
      ) : (
        <form action={savePlans}>
          <input type="hidden" name="here" value={PATH} />
          {plans.map((p) => <input key={p.id} type="hidden" name="ids" value={p.id} />)}
          <fieldset disabled={!edit} className="m-0 grid min-w-0 gap-6 border-0 p-0">
            <section className="grid gap-4 lg:grid-cols-3">
              {plans.map((p) => (
                <article key={p.id} className="grid content-start gap-3 rounded-3xl border border-d-line bg-d-card p-5 shadow-card">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-d-muted" dir="ltr">{p.id}</p>
                    <PendingLink href={link(PATH, { modal: "plan-edit", id: p.id })} spinner={false} className="text-xs font-semibold text-d-teal">{t.plans.more}</PendingLink>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Field label={t.catalog.nameAr}><input name={`${p.id}.name_ar`} required maxLength={40} defaultValue={p.name_ar} className={input} /></Field>
                    <Field label={t.catalog.nameEn}><input name={`${p.id}.name_en`} dir="ltr" required maxLength={40} defaultValue={p.name_en} className={input} /></Field>
                    <Field label={t.plans.descAr}><input name={`${p.id}.desc_ar`} maxLength={200} defaultValue={p.desc_ar} className={input} /></Field>
                    <Field label={t.plans.descEn}><input name={`${p.id}.desc_en`} dir="ltr" maxLength={200} defaultValue={p.desc_en} className={input} /></Field>
                    <Field label={t.plans.priceMonthly}><input name={`${p.id}.price_monthly`} type="number" min={0} dir="ltr" defaultValue={num(p.price_monthly)} className={input} /></Field>
                    <Field label={t.plans.priceYearly}><input name={`${p.id}.price_yearly`} type="number" min={0} dir="ltr" defaultValue={num(p.price_yearly)} className={input} /></Field>
                  </div>
                  <p className="-mt-1 text-xs text-d-muted">{t.plans.priceHint}</p>
                  <Field label={t.plans.trialDays}><input name={`${p.id}.trial_days`} type="number" min={0} max={90} dir="ltr" defaultValue={p.trial_days} className={input} /></Field>
                  <label className="flex items-center justify-between text-sm font-semibold">{t.plans.active}<input type="checkbox" name={`${p.id}.is_active`} defaultChecked={p.is_active} className="size-5 accent-d-teal" /></label>
                  <label className="flex items-center justify-between text-sm font-semibold">{t.plans.popular}<input type="checkbox" name={`${p.id}.is_popular`} defaultChecked={p.is_popular} className="size-5 accent-d-teal" /></label>
                  <label className="flex items-center justify-between text-sm font-semibold">{t.plans.defaultFor}<input type="radio" name="default" value={p.id} defaultChecked={p.is_default} className="size-5 accent-d-teal" /></label>
                </article>
              ))}
            </section>

            <section className="overflow-x-auto rounded-3xl border border-d-line bg-d-card shadow-card">
              <table className="w-full min-w-190 border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="px-3 py-3.5 text-start text-d-muted">{t.plans.matrix}</th>
                    {plans.map((p) => (
                      <th key={p.id} className="px-3 py-3.5 text-start">
                        {lang === "ar" ? p.name_ar : p.name_en} {p.is_default && <Chip tone="mint">{t.plans.default}</Chip>}
                      </th>
                    ))}
                  </tr>
                </thead>
                {GROUPS.map((g) => (
                  <tbody key={g}>
                    <tr><td colSpan={plans.length + 1} className="bg-d-paper px-3 py-2 text-xs font-bold text-d-muted">{(t.plans.group as Record<string, string>)[g]}</td></tr>
                    {ENTITLEMENTS.filter((e) => e.group === g).map((e) => {
                      const lock = locks.get(e.key);
                      return (
                        <FeatureRows
                          key={e.key}
                          label={ent[e.key]}
                          live={e.live}
                          t={t}
                          cells={plans.map((p) => (
                            <td key={p.id} className={`${td} !px-3 !py-3 align-top !whitespace-normal`}>
                              {e.kind === "number" ? (
                                <input name={`${p.id}.${e.key}`} type="number" min={0} dir="ltr" placeholder={t.plans.blank} defaultValue={num(p.entitlements[e.key])} className={`${input} max-w-32`} />
                              ) : (
                                <input type="checkbox" name={`${p.id}.${e.key}`} defaultChecked={p.entitlements[e.key] === true} aria-label={`${ent[e.key]} · ${p.name_en}`} className="size-5 accent-d-teal" />
                              )}
                            </td>
                          ))}
                          lock={
                            e.kind === "boolean" ? (
                              <LockRow cols={plans.length + 1} t={t}>
                              <label className="flex items-center gap-2 text-sm font-semibold">
                                <input type="checkbox" name={`lock.${e.key}.hidden`} defaultChecked={lock?.hidden ?? false} className="size-5 accent-d-teal" />
                                {t.plans.lockHide}
                              </label>
                              <Field label={t.plans.lockAr}><input name={`lock.${e.key}.msg_ar`} maxLength={200} defaultValue={lock?.msg_ar} className={input} /></Field>
                              <Field label={t.plans.lockEn}><input name={`lock.${e.key}.msg_en`} dir="ltr" maxLength={200} defaultValue={lock?.msg_en} className={input} /></Field>
                              </LockRow>
                            ) : null
                          }
                        />
                      );
                    })}
                  </tbody>
                ))}
              </table>
            </section>
          </fieldset>
          {edit ? (
            <div className="sticky bottom-4 z-10 mt-5 flex justify-end">
              <SubmitButton className={`${btnLime} px-10`}>{t.catalog.save}</SubmitButton>
            </div>
          ) : (
            <p className="mt-4 text-sm text-d-muted">{t.catalog.viewOnly}</p>
          )}
        </form>
      )}

      {(plan || isNew) && (
        <Modal title={plan ? `${t.plans.modalEdit}: ${lang === "ar" ? plan.name_ar : plan.name_en}` : t.plans.new} closeHref={PATH} closeLabel={t.catalog.close}>
          <CatalogForm
            action={savePlan}
            delAction={deletePlan}
            list={PATH}
            here={plan ? link(PATH, { modal: "plan-edit", id: plan.id }) : link(PATH, { modal: "plan-new" })}
            id={plan?.id}
            del={plan ? "plans" : undefined}
            edit={edit}
            err={err}
            t={t}
          >
            {!plan && (
              <>
                <input type="hidden" name="new" value="1" />
                <Field label={t.plans.id}>
                  <input name="id" dir="ltr" required minLength={2} maxLength={20} pattern="[a-z][a-z0-9_]{1,19}" className={input} />
                </Field>
                <p className="-mt-2 text-xs text-d-muted">{t.plans.idHint}</p>
              </>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t.catalog.nameAr}><input name="name_ar" required maxLength={40} defaultValue={plan?.name_ar} className={input} /></Field>
              <Field label={t.catalog.nameEn}><input name="name_en" dir="ltr" required maxLength={40} defaultValue={plan?.name_en} className={input} /></Field>
              <Field label={t.plans.descAr}><input name="desc_ar" maxLength={200} defaultValue={plan?.desc_ar} className={input} /></Field>
              <Field label={t.plans.descEn}><input name="desc_en" dir="ltr" maxLength={200} defaultValue={plan?.desc_en} className={input} /></Field>
            </div>
            <Field label={t.plans.sort}>
              <input name="sort" type="number" min={0} step={1} required dir="ltr" defaultValue={plan?.sort ?? Math.max(0, ...plans.map((p) => p.sort)) + 1} className={input} />
            </Field>
            <p className="text-xs text-d-muted">{t.plans.modalNote}</p>
          </CatalogForm>
        </Modal>
      )}
    </>
  );
}

// One feature: its row of plan cells, with an expandable row under it for the lock rule (switches only).
function FeatureRows({ label, live, t, cells, lock }: { label: string; live: boolean; t: Dict; cells: React.ReactNode; lock: React.ReactNode }) {
  return (
    <>
      <tr>
        <th scope="row" className={`${td} !px-3 !py-3 text-start align-top font-semibold !whitespace-normal`}>
          {label}
          <span className="mt-1 block"><Chip tone={live ? "mint" : "amber"}>{live ? t.plans.live : t.plans.soonTag}</Chip></span>
        </th>
        {cells}
      </tr>
      {lock}
    </>
  );
}

function LockRow({ cols, t, children }: { cols: number; t: Dict; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={cols} className="px-3 pb-3">
        <details>
          <summary className="cursor-pointer text-xs font-semibold text-d-teal">{t.plans.lockTitle}</summary>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">{children}</div>
        </details>
      </td>
    </tr>
  );
}
