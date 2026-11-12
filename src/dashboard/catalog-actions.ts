"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canEdit, IMAGE_TYPES, MAX_IMAGE, TYPE_IDS, UUID } from "./catalog";
import { requireAdmin } from "./session";

// Every action: sign-in check, role check, validate, write, then go back to the list (modal closes)
// or back to the same modal with &err=<code> (the modal shows the message).
type Db = Awaited<ReturnType<typeof requireAdmin>>["supabase"];
type Pic = { col: string; field: string; dir: string; tag?: string };

const SAFE = /^\/dashboard\/(cars|parts|types)(\?[\w=&%.+-]*)?$/;
const safe = (v: FormDataEntryValue | null, fallback = "/dashboard") => (typeof v === "string" && SAFE.test(v) ? v : fallback);
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
function fail(here: string, code: string): never {
  redirect(`${here}${here.includes("?") ? "&" : "?"}err=${code}`);
}
const names = (f: FormData) => ({ name_ar: str(f, "name_ar"), name_en: str(f, "name_en") });
const badNames = (n: { name_ar: string; name_en: string }) => [n.name_ar, n.name_en].some((s) => s.length < 1 || s.length > 60);
const num = (f: FormData, k: string) => {
  const s = str(f, k);
  if (!s) return null;
  const n = Number(s);
  return Number.isInteger(n) && n >= 0 && n <= 10_000_000 ? n : NaN;
};

async function begin(f: FormData) {
  const { supabase, role } = await requireAdmin();
  const here = safe(f.get("here"));
  const list = safe(f.get("list"));
  if (!canEdit(role)) fail(here, "forbidden");
  return { supabase, here, list };
}

const ext = (file: File) => IMAGE_TYPES[file.type];

// Picks the pictures out of the form, uploads them, writes the row, then removes the replaced files.
async function persist(
  db: Db, f: FormData, o: { table: string; id: string | null; row: Record<string, unknown>; pics: Pic[]; here: string; list: string },
) {
  const { table, id, row, pics, here, list } = o;
  const files = pics.map((p) => {
    const v = f.get(p.field);
    return v instanceof File && v.size > 0 ? v : null;
  });
  for (const file of files) {
    if (!file) continue;
    if (!ext(file)) fail(here, "imgType");
    if (file.size > MAX_IMAGE) fail(here, "imgBig");
  }
  let old: Record<string, string | null> = {};
  if (id) {
    const { data } = await db.from(table).select(pics.map((p) => p.col).join(",")).eq("id", id).maybeSingle();
    old = (data ?? {}) as unknown as Record<string, string | null>;
  }
  const key = id ?? crypto.randomUUID();
  const uploaded: string[] = [];
  const replaced: string[] = [];
  for (const [i, p] of pics.entries()) {
    const file = files[i];
    if (file) {
      const path = `${p.dir}/${key}-${p.tag ? `${p.tag}-` : ""}${Date.now()}.${ext(file)}`;
      const { error } = await db.storage.from("catalog").upload(path, file, { contentType: file.type, upsert: false });
      if (error) {
        await db.storage.from("catalog").remove(uploaded);
        fail(here, "upload");
      }
      uploaded.push(path);
      row[p.col] = path;
      if (old[p.col]) replaced.push(old[p.col]!);
    } else if (f.get(`rm_${p.field}`) === "on" && id) {
      row[p.col] = null;
      if (old[p.col]) replaced.push(old[p.col]!);
    }
  }
  const q = id ? db.from(table).update(row).eq("id", id) : db.from(table).insert({ ...row, id: key });
  const { data, error } = await q.select("id");
  if (error || !data?.length) {
    if (uploaded.length) await db.storage.from("catalog").remove(uploaded);
    fail(here, error?.code === "23505" ? "dup" : error ? "save" : "forbidden");
  }
  if (replaced.length) await db.storage.from("catalog").remove(replaced); // best effort
  revalidatePath("/dashboard", "layout");
  redirect(list);
}

const nextSort = async (db: Db, table: string) => {
  const { data } = await db.from(table).select("sort").order("sort", { ascending: false }).limit(1);
  return ((data?.[0] as { sort?: number } | undefined)?.sort ?? 0) + 1;
};
const idOf = (f: FormData) => {
  const id = str(f, "id");
  return UUID.test(id) ? id : null;
};

export async function saveMake(f: FormData) {
  const { supabase, here, list } = await begin(f);
  const id = idOf(f);
  const n = names(f);
  if (badNames(n)) fail(here, "name");
  const row: Record<string, unknown> = { ...n, is_active: f.get("is_active") === "on" };
  if (!id) row.sort = await nextSort(supabase, "car_makes");
  await persist(supabase, f, { table: "car_makes", id, row, pics: [{ col: "logo_path", field: "image", dir: "makes" }], here, list });
}

export async function saveModel(f: FormData) {
  const { supabase, here, list } = await begin(f);
  const id = idOf(f);
  const n = names(f);
  const make = str(f, "make_id");
  const body = str(f, "body_type");
  if (badNames(n)) fail(here, "name");
  if (!UUID.test(make) || !TYPE_IDS.includes(body)) fail(here, "choose");
  const row = { ...n, make_id: make, body_type: body, is_active: f.get("is_active") === "on" };
  await persist(supabase, f, { table: "car_models", id, row, pics: [{ col: "image_path", field: "image", dir: "models" }], here, list });
}

export async function savePart(f: FormData) {
  const { supabase, here, list } = await begin(f);
  const id = idOf(f);
  const n = names(f);
  const km = num(f, "km");
  const months = num(f, "months");
  const cat = str(f, "category_id");
  if (badNames(n)) fail(here, "name");
  if (Number.isNaN(km) || Number.isNaN(months)) fail(here, "number");
  if (cat && !UUID.test(cat)) fail(here, "choose");
  const fields = str(f, "fields").split(",").map((s) => s.trim()).filter(Boolean);
  if (fields.length > 20 || fields.some((s) => s.length > 40)) fail(here, "fields");
  const row: Record<string, unknown> = {
    ...n,
    default_interval_km: km,
    default_interval_months: months,
    category_id: cat || null,
    has_reminder: f.get("has_reminder") === "on",
    fields,
    is_active: f.get("is_active") === "on",
  };
  if (!id) Object.assign(row, { is_system: false, sort: await nextSort(supabase, "service_types") });
  const pics: Pic[] = [
    { col: "image_ok", field: "image_ok", dir: "parts", tag: "ok" },
    { col: "image_soon", field: "image_soon", dir: "parts", tag: "soon" },
    { col: "image_late", field: "image_late", dir: "parts", tag: "late" },
  ];
  await persist(supabase, f, { table: "service_types", id, row, pics, here, list });
}

export async function saveType(f: FormData) {
  const { supabase, here, list } = await begin(f);
  const id = str(f, "id");
  const n = names(f);
  const sort = num(f, "sort");
  if (!TYPE_IDS.includes(id)) fail(here, "choose");
  if (badNames(n)) fail(here, "name");
  if (sort === null || Number.isNaN(sort)) fail(here, "number");
  const row = { ...n, sort, is_active: f.get("is_active") === "on" };
  await persist(supabase, f, { table: "vehicle_types", id, row, pics: [{ col: "image_path", field: "image", dir: "types" }], here, list });
}

const TABLES = ["car_makes", "car_models", "service_types", "vehicle_types"];
const PIC_COLS: Record<string, string[]> = {
  car_makes: ["logo_path"],
  car_models: ["image_path"],
  service_types: ["image_ok", "image_soon", "image_late"],
};

// The little switch in the lists.
export async function toggleActive(f: FormData) {
  const { supabase, role } = await requireAdmin();
  const back = safe(f.get("back"));
  const table = str(f, "table");
  const id = str(f, "id");
  if (!canEdit(role) || !TABLES.includes(table) || !(UUID.test(id) || table === "vehicle_types")) redirect(back);
  await supabase.from(table).update({ is_active: str(f, "to") === "1" }).eq("id", id);
  revalidatePath("/dashboard", "layout");
  redirect(back);
}

// Delete only when unused. The database refuses a part that records still use (23503).
export async function deleteRow(f: FormData) {
  const { supabase, here, list } = await begin(f);
  const table = str(f, "table");
  const id = str(f, "id");
  if (!PIC_COLS[table] || !UUID.test(id)) fail(here, "save");
  if (table === "car_makes") {
    const { count } = await supabase.from("car_models").select("id", { count: "exact", head: true }).eq("make_id", id);
    if (count) fail(here, "hasModels");
  }
  const cols = PIC_COLS[table];
  const { data: old } = await supabase.from(table).select(cols.join(",")).eq("id", id).maybeSingle();
  const { data, error } = await supabase.from(table).delete().eq("id", id).select("id");
  if (error) fail(here, error.code === "23503" ? "inUse" : "save");
  if (!data?.length) fail(here, "forbidden");
  const files = Object.values((old ?? {}) as unknown as Record<string, string | null>).filter((p): p is string => !!p);
  if (files.length) await supabase.storage.from("catalog").remove(files); // best effort
  revalidatePath("/dashboard", "layout");
  redirect(list);
}
