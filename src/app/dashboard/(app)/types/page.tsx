import Link from "next/link";
import { canEdit, link, one, type VType } from "@/dashboard/catalog";
import { saveType } from "@/dashboard/catalog-actions";
import { fmtNum, getDash } from "@/dashboard/i18n";
import { Modal } from "@/dashboard/Modal";
import { requireAdmin } from "@/dashboard/session";
import { CatalogForm, Chip, Field, input, PageTitle, Pic, PicField, Switch, VisibleBox } from "@/dashboard/ui";

const PATH = "/dashboard/types";

export default async function TypesPage({ searchParams }: PageProps<"/dashboard/types">) {
  const { supabase, role } = await requireAdmin();
  const { t, lang } = await getDash();
  const sp = await searchParams;
  const edit = canEdit(role);

  const [typesRes, usageRes] = await Promise.all([
    supabase.from("vehicle_types").select("id,name_ar,name_en,sort,is_active,image_path").order("sort"),
    supabase.rpc("admin_type_usage"),
  ]);
  const types = (typesRes.data ?? []) as VType[];
  const usage = new Map(((usageRes.data ?? []) as { type: string; models: number; vehicles: number }[]).map((u) => [u.type, u]));
  const type = types.find((x) => x.id === one(sp.id) && one(sp.modal) === "type-edit");

  return (
    <>
      <PageTitle sub={`${fmtNum(types.length)} ${t.types.count} · ${t.types.sub}`}>{t.types.title}</PageTitle>
      <p className="mb-5 rounded-2xl bg-d-sky px-4.5 py-3 text-sm leading-6">{t.types.info}</p>

      {types.length === 0 ? (
        <p className="text-d-muted">{t.types.empty}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {types.map((v) => (
            <article key={v.id} className={`rounded-3xl border border-d-line bg-d-card p-3.5 shadow-card ${v.is_active ? "" : "opacity-70"}`}>
              <div className="flex h-32 items-center justify-center rounded-[18px] bg-d-paper">
                <Pic path={v.image_path} className="max-h-25 max-w-[88%] object-contain" />
              </div>
              <div className="mt-3.5 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-lg font-extrabold">{v.name_ar}</p>
                  <p className="text-xs text-d-muted" dir="ltr">{v.name_en}</p>
                </div>
                <Switch table="vehicle_types" id={v.id} on={v.is_active} back={PATH} label={t.catalog.visible} edit={edit} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip tone="mint">{fmtNum(Number(usage.get(v.id)?.models ?? 0))} {t.types.models}</Chip>
                <Chip tone="amber">{fmtNum(Number(usage.get(v.id)?.vehicles ?? 0))} {t.types.cars}</Chip>
              </div>
              <Link
                href={link(PATH, { modal: "type-edit", id: v.id })}
                className="mt-3.5 flex h-10.5 items-center justify-center rounded-full bg-d-panel text-sm font-semibold text-[#f5f7f5]"
              >
                {edit ? t.catalog.edit : t.catalog.view}
              </Link>
            </article>
          ))}
        </div>
      )}

      {type && (
        <Modal title={`${t.types.modalEdit}: ${lang === "ar" ? type.name_ar : type.name_en}`} closeHref={PATH} closeLabel={t.catalog.close}>
          <CatalogForm action={saveType} list={PATH} here={link(PATH, { modal: "type-edit", id: type.id })} id={type.id} edit={edit} err={one(sp.err)} t={t}>
            <PicField name="image" current={type.image_path} t={t} wide disabled={!edit} />
            <p className="text-xs leading-5 text-d-muted">{t.types.note}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t.catalog.nameAr}><input name="name_ar" required maxLength={60} defaultValue={type.name_ar} className={input} /></Field>
              <Field label={t.catalog.nameEn}><input name="name_en" dir="ltr" required maxLength={60} defaultValue={type.name_en} className={input} /></Field>
            </div>
            <Field label={t.types.sort}>
              <input name="sort" type="number" min={0} step={1} required dir="ltr" defaultValue={type.sort} className={input} />
            </Field>
            <VisibleBox on={type.is_active} label={t.catalog.visible} />
          </CatalogForm>
        </Modal>
      )}
    </>
  );
}
