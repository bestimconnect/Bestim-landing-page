import { Search } from "lucide-react";
import { redirect } from "next/navigation";
import { canEdit, link, one, type VType } from "@/dashboard/catalog";
import { saveMake, saveModel } from "@/dashboard/catalog-actions";
import { fmtNum, getDash } from "@/dashboard/i18n";
import { Modal } from "@/dashboard/Modal";
import { Pager, pageOf, sizeOf } from "@/dashboard/pager";
import { PendingLink } from "@/dashboard/Pending";
import { requireAdmin } from "@/dashboard/session";
import { btnLime, btnSmall, CatalogForm, Chip, EmptyState, Field, input, PageTitle, Pic, PicField, Switch, Table, td, th, VisibleBox } from "@/dashboard/ui";

type Make = { id: string; name_ar: string; name_en: string; is_active: boolean; logo_path: string | null; car_models: { count: number }[] };
type Model = { id: string; make_id: string; name_ar: string; name_en: string; body_type: string; is_active: boolean; image_path: string | null };

const PATH = "/dashboard/cars";

export default async function CarsPage({ searchParams }: PageProps<"/dashboard/cars">) {
  const { supabase, role } = await requireAdmin();
  const { t, lang } = await getDash();
  const sp = await searchParams;
  const edit = canEdit(role);
  const q = one(sp.q).trim().slice(0, 60);
  const modal = one(sp.modal);
  const modalId = one(sp.id);
  const page = pageOf(sp.page);
  const size = sizeOf(sp.size);

  const [makesRes, typesRes] = await Promise.all([
    supabase.from("car_makes").select("id,name_ar,name_en,is_active,logo_path,car_models(count)").order("sort").order("name_en"),
    supabase.from("vehicle_types").select("id,name_ar,name_en,sort,is_active,image_path").order("sort"),
  ]);
  const makes = (makesRes.data ?? []) as Make[];
  const types = (typesRes.data ?? []) as VType[];
  const typeName = (id: string) => {
    const v = types.find((x) => x.id === id);
    return v ? (lang === "ar" ? v.name_ar : v.name_en) : id;
  };
  const shown = q ? makes.filter((m) => `${m.name_ar} ${m.name_en}`.toLowerCase().includes(q.toLowerCase())) : makes;
  const requested = one(sp.brand);
  const brand = makes.find((m) => m.id === requested) ?? shown[0] ?? makes[0];
  const { data: modelRows, count: modelCount } = brand
    ? await supabase
        .from("car_models")
        .select("id,make_id,name_ar,name_en,body_type,is_active,image_path", { count: "exact" })
        .eq("make_id", brand.id)
        .order("name_en")
        .range((page - 1) * size, page * size - 1)
    : { data: [], count: 0 };
  const models = (modelRows ?? []) as Model[];
  const total = modelCount ?? 0;
  // A page past the end (old link, deleted rows): go to the last one.
  if (brand && models.length === 0 && total > 0 && page > 1) {
    redirect(link(PATH, { brand: brand.id, q, page: String(Math.ceil(total / size)) }));
  }
  const totalModels = makes.reduce((n, m) => n + (m.car_models[0]?.count ?? 0), 0);
  const nm = (x: { name_ar: string; name_en: string }) => (lang === "ar" ? x.name_ar : x.name_en);

  const pg = page > 1 ? String(page) : undefined;
  const list = link(PATH, { brand: brand?.id, q, page: pg });
  const close = list;
  const model = modal === "model-edit" ? models.find((m) => m.id === modalId) : undefined;
  const editBrand = modal === "brand-edit" ? makes.find((m) => m.id === modalId) : undefined;
  const err = one(sp.err);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-x-4">
        <PageTitle sub={`${fmtNum(makes.length)} ${t.cars.brands} · ${fmtNum(totalModels)} ${t.cars.models}`}>{t.cars.title}</PageTitle>
        {edit && (
          <PendingLink href={link(PATH, { modal: "brand-new", brand: brand?.id, q })} className={`${btnLime} mb-6 inline-flex items-center`}>
            {t.cars.newBrand}
          </PendingLink>
        )}
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[17.5rem_minmax(0,1fr)]">
        <section className="flex flex-col gap-1.5 rounded-3xl border border-d-line bg-d-card p-3.5 shadow-card">
          <form role="search" className="mb-1.5">
            <label className="flex h-11 items-center gap-2 rounded-full border border-d-line bg-d-paper px-4 text-d-muted focus-within:border-d-teal">
              <Search size={16} aria-hidden="true" className="shrink-0" />
              <input name="q" defaultValue={q} placeholder={t.cars.search} aria-label={t.cars.search} className="min-w-0 flex-1 bg-transparent text-sm text-d-ink outline-none placeholder:text-d-muted" />
            </label>
          </form>
          <div className="flex max-h-[34rem] flex-col gap-1 overflow-y-auto">
            {shown.length === 0 && <p className="p-3 text-sm text-d-muted">{t.cars.noBrands}</p>}
            {shown.map((m) => (
              <PendingLink
                key={m.id}
                spinner={false}
                href={link(PATH, { brand: m.id, q })}
                aria-current={m.id === brand?.id ? "true" : undefined}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${m.id === brand?.id ? "bg-d-mint" : ""} ${m.is_active ? "" : "opacity-55"}`}
              >
                <span className="flex size-9.5 shrink-0 items-center justify-center overflow-hidden rounded-full border border-dashed border-[#b9c4be] bg-white text-sm font-bold">
                  {m.logo_path ? <Pic path={m.logo_path} className="size-full object-contain" /> : [...m.name_en][0]?.toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-bold">{m.name_ar}</span>
                  <span className="block truncate text-xs text-d-muted" dir="ltr">{m.name_en}</span>
                </span>
                <span className="text-[13px] text-d-muted">{fmtNum(m.car_models[0]?.count ?? 0)}</span>
              </PendingLink>
            ))}
          </div>
        </section>

        {brand ? (
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-extrabold">
                {nm(brand)} <span className="text-sm font-medium text-d-muted">{fmtNum(total)} {t.cars.modelsCount}</span>
              </h2>
              {edit && (
                <div className="flex gap-2">
                  <PendingLink href={link(PATH, { modal: "brand-edit", id: brand.id, brand: brand.id, q })} className={btnSmall}>{t.cars.editBrand}</PendingLink>
                  <PendingLink href={link(PATH, { modal: "model-new", brand: brand.id, q, page: pg })} className={btnSmall}>{t.cars.newModel}</PendingLink>
                </div>
              )}
            </div>
            {models.length === 0 ? (
              <EmptyState>{t.cars.noModels}</EmptyState>
            ) : (
              <Table footer={<Pager size={size} page={page} total={total} base={PATH} params={{ brand: brand.id, q }} />}>
                <thead>
                  <tr>{[t.cars.model, t.cars.bodyType, t.cars.picture, t.cars.shown, ""].map((h, i) => <th key={i} className={th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {models.map((m) => {
                    const own = !!m.image_path;
                    const pic = m.image_path ?? types.find((x) => x.id === m.body_type)?.image_path;
                    return (
                      <tr key={m.id} className={m.is_active ? "" : "opacity-55"}>
                        <td className={td}>
                          <div className="flex items-center gap-3">
                            <span className="flex h-11 w-21 shrink-0 items-center justify-center rounded-xl bg-d-paper">
                              <Pic path={pic} className="max-h-9.5 max-w-19 object-contain" />
                            </span>
                            <span>
                              <span className="block text-[15px] font-bold">{m.name_ar}</span>
                              <span className="block text-xs text-d-muted" dir="ltr">{m.name_en}</span>
                            </span>
                          </div>
                        </td>
                        <td className={td}><Chip tone="mint">{typeName(m.body_type)}</Chip></td>
                        <td className={td}><Chip tone={own ? "amber" : "paper"}>{own ? t.cars.ownPic : t.cars.typePic}</Chip></td>
                        <td className={td}><Switch table="car_models" id={m.id} on={m.is_active} back={list} label={t.catalog.visible} edit={edit} /></td>
                        <td className={td}>
                          <PendingLink href={link(PATH, { modal: "model-edit", id: m.id, brand: brand.id, q, page: pg })} className={btnSmall}>{edit ? t.catalog.edit : t.catalog.view}</PendingLink>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </div>
        ) : (
          <EmptyState>{t.cars.noBrands}</EmptyState>
        )}
      </div>

      {(modal === "brand-new" || editBrand) && (edit || editBrand) && (
        <Modal title={editBrand ? t.cars.brandEdit : t.cars.brandNew} closeHref={close} closeLabel={t.catalog.close}>
          <CatalogForm
            action={saveMake}
            list={close}
            here={editBrand ? link(PATH, { modal: "brand-edit", id: editBrand.id, brand: brand?.id, q }) : link(PATH, { modal: "brand-new", brand: brand?.id, q })}
            id={editBrand?.id}
            edit={edit}
            err={err}
            t={t}
            del={editBrand ? "car_makes" : undefined}
          >
            <PicField name="image" current={editBrand?.logo_path} t={t} wide disabled={!edit} />
            <p className="text-xs leading-5 text-d-muted">{t.cars.logoNote}</p>
            <Field label={t.catalog.nameAr}><input name="name_ar" required maxLength={60} defaultValue={editBrand?.name_ar} className={input} /></Field>
            <Field label={t.catalog.nameEn}><input name="name_en" dir="ltr" required maxLength={60} defaultValue={editBrand?.name_en} className={input} /></Field>
            <VisibleBox on={editBrand?.is_active ?? true} label={t.catalog.visible} />
          </CatalogForm>
        </Modal>
      )}

      {((modal === "model-new" && edit) || model) && (
        <Modal title={model ? t.cars.modelEdit : t.cars.modelNew} closeHref={close} closeLabel={t.catalog.close}>
          <CatalogForm
            action={saveModel}
            list={close}
            here={model ? link(PATH, { modal: "model-edit", id: model.id, brand: brand?.id, q, page: pg }) : link(PATH, { modal: "model-new", brand: brand?.id, q, page: pg })}
            id={model?.id}
            edit={edit}
            err={err}
            t={t}
            del={model ? "car_models" : undefined}
          >
            <PicField name="image" current={model?.image_path} t={t} wide disabled={!edit} />
            <p className="text-xs leading-5 text-d-muted">{t.cars.modelNote}</p>
            <Field label={t.catalog.nameAr}><input name="name_ar" required maxLength={60} defaultValue={model?.name_ar} className={input} /></Field>
            <Field label={t.catalog.nameEn}><input name="name_en" dir="ltr" required maxLength={60} defaultValue={model?.name_en} className={input} /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t.cars.brand}>
                <select name="make_id" required defaultValue={model?.make_id ?? brand?.id} className={input}>
                  {makes.map((m) => <option key={m.id} value={m.id}>{nm(m)}</option>)}
                </select>
              </Field>
              <Field label={t.cars.body}>
                <select name="body_type" required defaultValue={model?.body_type ?? types[0]?.id} className={input}>
                  {types.map((v) => <option key={v.id} value={v.id}>{nm(v)}</option>)}
                </select>
              </Field>
            </div>
            <VisibleBox on={model?.is_active ?? true} label={t.catalog.visible} />
          </CatalogForm>
        </Modal>
      )}
    </>
  );
}
