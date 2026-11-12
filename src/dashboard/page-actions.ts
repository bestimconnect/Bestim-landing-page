"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canEdit } from "./catalog";
import { requireAdmin } from "./session";

const LIST = "/dashboard/pages";
const SAFE = /^\/dashboard\/pages(\?[\w=&%.+-]*)?$/;
const SLUG = /^[a-z][a-z-]{1,29}$/;
const str = (f: FormData, k: string) => String(f.get(k) ?? "").replace(/\r\n/g, "\n").trim();
function fail(here: string, code: string): never {
  redirect(`${here}${here.includes("?") ? "&" : "?"}err=${code}`);
}

// Edit one legal / business page (the five slugs are fixed: rows are seeded by site_pages.sql, never added here).
export async function savePage(f: FormData) {
  const { supabase, role } = await requireAdmin();
  const here = SAFE.test(String(f.get("here") ?? "")) ? String(f.get("here")) : LIST;
  const slug = str(f, "id");
  if (!canEdit(role)) fail(here, "forbidden");
  if (!SLUG.test(slug)) fail(here, "save");
  const row = { title_ar: str(f, "title_ar"), title_en: str(f, "title_en"), body_ar: str(f, "body_ar"), body_en: str(f, "body_en"), is_published: f.get("is_published") === "on" };
  if (!row.title_ar || !row.title_en || row.title_ar.length > 80 || row.title_en.length > 80 || row.body_ar.length > 60000 || row.body_en.length > 60000) fail(here, "pageText");
  const { data, error } = await supabase.from("site_pages").update(row).eq("slug", slug).select("slug");
  if (error) fail(here, "save");
  if (!data?.length) fail(here, "forbidden"); // row security refused it
  revalidatePath(`/ar/${slug}`);
  revalidatePath(`/en/${slug}`);
  revalidatePath("/dashboard", "layout");
  redirect(LIST);
}
