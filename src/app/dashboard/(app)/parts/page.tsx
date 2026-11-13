import { redirect } from "next/navigation";
import { canEdit, link, one } from "@/dashboard/catalog";
import { savePart } from "@/dashboard/catalog-actions";
import { fmtNum, getDash } from "@/dashboard/i18n";
import { Modal } from "@/dashboard/Modal";
import { Pager, pageOf, sizeOf } from "@/dashboard/pager";
import { PendingLink } from "@/dashboard/Pending";
import { requireAdmin } from "@/dashboard/session";
import { btnLime, CatalogForm, EmptyState, Field, input, PageTitle, Pic, PicField, Switch, TabNav, VisibleBox } from "@/dashboard/ui";

type Part = {
  id: string; name_ar: string; name_en: string; default_interval_km: number | null; default_interval_months: number | null;
  category_id: string | null; has_reminder: boolean; fields: string[]; is_active: boolean;
  image_ok: string | null; image_soon: string | null; image_late: string | null;
};
type Cat = { id: string; parent_id: string | null; name_en: string; name_ar: string; sort: number };

const PATH = "/dashboard/parts";
const dot = "size-3 rounded-full border";

export default async function PartsPage({ searchParams }: PageProps<"/dashboard/parts">) {
  const { supabase, role } = await requireAdmin();
  const { t, lang } = await getDash();
  const sp = await searchParams;
  const edit = canEdit(role);
  const modal = one(sp.modal);
  const err = one(sp.err);

  const sel = "id,name_ar,name_en,default_interval_km,default_interval_months,category_id,has_reminder,fields,is_active,image_ok,image_soon,image_late";
  const catsRes = await supabase.from("record_categories").select("id,parent_id,name_en,name_ar,sort").order("sort");
  const cats = (catsRes.data ?? []) as Cat[];
  const nm = (x: { name_ar: string; name_en: string }) => (lang === "ar" ? x.name_ar : x.name_en);
  const tops = cats.filter((c) => !c.parent_id);
  const cat = tops.find((c) => c.id === one(sp.cat))?.id;
  const q = one(sp.q).trim().slice(0, 60).replace(/[,()%*]/g, " ");
  const page = pageOf(sp.page);
  const SIZE = sizeOf(sp.size);

  // The top category plus its sub-categories, so one filter covers the whole group.
  const ids = cat ? [cat, ...cats.filter((c) => c.parent_id === cat).map((c) => c.id)] : [];
  let query = supabase.from("service_types").select(sel, { count: "exact" });
  if (cat) query = query.in("category_id", ids);
  if (q) query = query.or(`name_en.ilike.%${q}%,name_ar.ilike.%${q}%`);
  const { data: partRows, count } = await query
    .order("sort")
    .order("name_en")
    .range((page - 1) * SIZE, page * SIZE - 1);
  const parts = (partRows ?? []) as Part[];
  const total = count ?? 0;
  if (parts.length === 0 && total > 0 && page > 1) redirect(link(PATH, { cat, q, page: String(Math.ceil(total / SIZE)) }));

  const pg = page > 1 ? String(page) : undefined;
  const list = link(PATH, { cat, q, page: pg });
  const part = modal === "part-edit" ? parts.find((p) => p.id === one(sp.id)) : undefined;
  const every = (p: Part) => {
    const bits = [
      p.default_interval_km != null && `${fmtNum(p.default_interval_km)} ${t.parts.km}`,
      p.default_interval_months != null && `${fmtNum(p.default_interval_months)} ${t.parts.months}`,
    ].filter(Boolean);
    return bits.length ? `${t.parts.every} ${bits.join(" · ")}` : t.parts.noSchedule;
  };
  const slots = [
    ["image_ok", t.parts.okPic, "bg-[#f7fce0]", part?.image_ok],
    ["image_soon", t.parts.soonPic, "bg-[#fff7e0]", part?.image_soon],
    ["image_late", t.parts.latePic, "bg-[#fff0f3]", part?.image_late],
  ] as const;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-x-4">
        <PageTitle sub={`${fmtNum(total)} ${t.parts.count} · ${t.parts.sub}`}>{t.parts.title}</PageTitle>
        {edit && (
          <PendingLink href={link(PATH, { modal: "part-new", cat, q, page: pg })} className={`${btnLime} mb-6 inline-flex items-center`}>{t.parts.new}</PendingLink>
        )}
      </div>

      <TabNav
        label={t.parts.category}
        items={[{ href: PATH, label: t.parts.all, active: !cat }, ...tops.map((c) => ({ href: link(PATH, { cat: c.id }), label: nm(c), active: cat === c.id }))]}
      />

      {parts.length === 0 ? (
        <EmptyState>{t.parts.empty}</EmptyState>
      ) : (
        <>
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {parts.map((p) => (
            <article
              key={p.id}
              className={`relative rounded-[22px] border-2 bg-d-card p-3.5 shadow-card ${p.is_active ? "border-lime" : "border-d-line opacity-70"}`}
            >
              <div className="flex h-32 items-center justify-center rounded-2xl bg-d-paper">
                <Pic path={p.image_ok} className="max-h-27 max-w-32 object-contain" />
              </div>
              <div className="mt-3 flex items-start justify-between gap-2">
                <PendingLink href={link(PATH, { modal: "part-edit", id: p.id, cat, q, page: pg })} spinner={false} className="min-w-0 after:absolute after:inset-0 after:rounded-[22px]">
                  <span className="block text-base font-extrabold">{p.name_ar}</span>
                  <span className="block text-xs text-d-muted" dir="ltr">{p.name_en}</span>
                </PendingLink>
                <span className="relative z-10">
                  <Switch table="service_types" id={p.id} on={p.is_active} back={list} label={t.catalog.visible} edit={edit} />
                </span>
              </div>
              <p className="mt-2.5 text-[13px] text-d-muted">{every(p)}</p>
              <div className="mt-2.5 flex gap-1.5" aria-hidden="true">
                <span className={`${dot} ${p.image_ok ? "border-[#b5d32a] bg-lime" : "border-dashed border-[#b9c4be]"}`} />
                <span className={`${dot} ${p.image_soon ? "border-[#ddb24a] bg-[#ffc95c]" : "border-dashed border-[#b9c4be]"}`} />
                <span className={`${dot} ${p.image_late ? "border-[#d9435c] bg-[#f96a83]" : "border-dashed border-[#b9c4be]"}`} />
              </div>
            </article>
          ))}
        </div>
        <Pager page={page} total={total} size={SIZE} base={PATH} params={{ cat, q }} />
        </>
      )}

      {((modal === "part-new" && edit) || part) && (
        <Modal title={part ? t.parts.modalEdit : t.parts.modalNew} closeHref={list} closeLabel={t.catalog.close}>
          <CatalogForm
            action={savePart}
            list={list}
            here={part ? link(PATH, { modal: "part-edit", id: part.id, cat, q, page: pg }) : link(PATH, { modal: "part-new", cat, q, page: pg })}
            id={part?.id}
            edit={edit}
            err={err}
            t={t}
            del={part ? "service_types" : undefined}
          >
            <p className="text-[13px] font-semibold">{t.parts.pictures}</p>
            <div className="grid grid-cols-3 gap-2.5">
              {slots.map(([name, label, tone, current]) => (
                <PicField key={name} name={name} label={label} current={current} tone={tone} t={t} disabled={!edit} />
              ))}
            </div>
            <p className="text-xs leading-5 text-d-muted">{t.parts.picsNote}</p>
            <Field label={t.catalog.nameAr}><input name="name_ar" required maxLength={60} defaultValue={part?.name_ar} className={input} /></Field>
            <Field label={t.catalog.nameEn}><input name="name_en" dir="ltr" required maxLength={60} defaultValue={part?.name_en} className={input} /></Field>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label={t.parts.intervalKm}>
                <input name="km" type="number" min={0} step={1} dir="ltr" defaultValue={part?.default_interval_km ?? ""} className={input} />
              </Field>
              <Field label={t.parts.intervalMonths}>
                <input name="months" type="number" min={0} step={1} dir="ltr" defaultValue={part?.default_interval_months ?? ""} className={input} />
              </Field>
              <Field label={t.parts.category}>
                <select name="category_id" defaultValue={part?.category_id ?? ""} className={input}>
                  <option value="">{t.catalog.none}</option>
                  {tops.map((top) => {
                    const subs = cats.filter((c) => c.parent_id === top.id);
                    return (
                      <optgroup key={top.id} label={nm(top)}>
                        {(subs.length ? subs : [top]).map((c) => <option key={c.id} value={c.id}>{nm(c)}</option>)}
                      </optgroup>
                    );
                  })}
                </select>
              </Field>
            </div>
            <label className="flex items-center justify-between text-sm font-semibold">
              {t.parts.reminder}
              <input type="checkbox" name="has_reminder" defaultChecked={part?.has_reminder ?? true} className="size-5 accent-d-teal" />
            </label>
            <Field label={t.parts.fields}>
              <input name="fields" defaultValue={part?.fields.join(", ")} placeholder={t.parts.fieldsNote} className={input} />
            </Field>
            <VisibleBox on={part?.is_active ?? true} label={t.catalog.visible} />
          </CatalogForm>
        </Modal>
      )}
    </>
  );
}
