import { Pager, pageOf, sizeOf } from "@/dashboard/pager";
import { canEdit, link, one } from "@/dashboard/catalog";
import { fmtDate, getDash } from "@/dashboard/i18n";
import { Modal } from "@/dashboard/Modal";
import { PendingLink } from "@/dashboard/Pending";
import { savePage } from "@/dashboard/page-actions";
import { requireAdmin } from "@/dashboard/session";
import type { SitePage } from "@/dashboard/types";
import { btnSmall, CatalogForm, Chip, Field, InfoBanner, input, PageTitle, Table, td, th } from "@/dashboard/ui";

const PATH = "/dashboard/pages";
const area = `${input} h-auto min-h-72 py-3 leading-7`;

export default async function PagesPage({ searchParams }: PageProps<"/dashboard/pages">) {
  const { supabase, role } = await requireAdmin();
  const { t, lang } = await getDash();
  const sp = await searchParams;
  const edit = canEdit(role);
  const pg = pageOf(sp.page);
  const size = sizeOf(sp.size);

  // The list needs only the short columns; the 60 KB bodies are loaded for the one page being edited.
  const { data, count } = await supabase.from("site_pages").select("slug,sort,title_ar,title_en,is_published,updated_at", { count: "exact" }).order("sort").range((pg - 1) * size, pg * size - 1);
  const pages = (data ?? []) as Omit<SitePage, "body_ar" | "body_en">[];
  const slug = one(sp.modal) === "page-edit" && /^[a-z0-9-]{1,60}$/i.test(one(sp.id)) ? one(sp.id) : "";
  const { data: full } = slug ? await supabase.from("site_pages").select("*").eq("slug", slug).maybeSingle() : { data: null };
  const page = (full ?? undefined) as SitePage | undefined;

  return (
    <>
      <PageTitle sub={t.pages.sub}>{t.pages.title}</PageTitle>
      <InfoBanner>{t.pages.info}</InfoBanner>
      <Table footer={<Pager size={size} page={pg} total={count ?? pages.length} base={PATH} />}>
        <thead>
          <tr>
            <th className={th}>{t.pages.page}</th>
            <th className={th}>{t.pages.updated}</th>
            <th className={th} />
          </tr>
        </thead>
        <tbody>
          {pages.map((p) => (
            <tr key={p.slug}>
              <td className={td}>
                <span className="font-semibold">{lang === "ar" ? p.title_ar : p.title_en}</span>{" "}
                <span className="text-xs text-d-muted" dir="ltr">/{p.slug}</span>{" "}
                {!p.is_published && <Chip tone="amber">{t.pages.hidden}</Chip>}
              </td>
              <td className={td}>{fmtDate(lang, p.updated_at)}</td>
              <td className={`${td} text-end`}>
                <PendingLink href={link(PATH, { modal: "page-edit", id: p.slug })} className={btnSmall}>{edit ? t.catalog.edit : t.catalog.view}</PendingLink>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {page && (
        <Modal title={`${t.pages.modalEdit}: ${lang === "ar" ? page.title_ar : page.title_en}`} closeHref={PATH} closeLabel={t.catalog.close}>
          <CatalogForm action={savePage} list={PATH} here={link(PATH, { modal: "page-edit", id: page.slug })} id={page.slug} edit={edit} err={one(sp.err)} t={t}>
            <p className="text-xs leading-5 text-d-muted">{t.pages.bodyHint}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t.pages.titleAr}><input name="title_ar" required maxLength={80} defaultValue={page.title_ar} className={input} /></Field>
              <Field label={t.pages.titleEn}><input name="title_en" dir="ltr" required maxLength={80} defaultValue={page.title_en} className={input} /></Field>
            </div>
            <Field label={t.pages.bodyAr}><textarea name="body_ar" maxLength={60000} defaultValue={page.body_ar} className={area} /></Field>
            <Field label={t.pages.bodyEn}><textarea name="body_en" dir="ltr" maxLength={60000} defaultValue={page.body_en} className={area} /></Field>
            <label className="flex items-center justify-between text-sm font-semibold">
              {t.pages.published}
              <input type="checkbox" name="is_published" defaultChecked={page.is_published} className="size-5 accent-d-teal" />
            </label>
            <a href={`/${lang}/${page.slug}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-d-teal underline">{t.pages.open}</a>
          </CatalogForm>
        </Modal>
      )}
    </>
  );
}
