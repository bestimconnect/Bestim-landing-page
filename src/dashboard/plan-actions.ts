"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canEditPlans, UUID } from "./catalog";
import { ENTITLEMENTS, PLAN_ID } from "./plans";
import { requireAdmin } from "./session";

const LIST = "/dashboard/plans";
const SAFE = /^\/dashboard\/plans(\?[\w=&%.+-]*)?$/;
const safe = (v: FormDataEntryValue | null) => (typeof v === "string" && SAFE.test(v) ? v : LIST);
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
function fail(here: string, code: string): never {
  redirect(`${here}${here.includes("?") ? "&" : "?"}err=${code}`);
}

async function begin(f: FormData) {
  const { supabase, role } = await requireAdmin();
  const here = safe(f.get("here"));
  if (!canEditPlans(role)) fail(here, "forbidden");
  return { supabase, here };
}

// Database refusals (plans.sql) -> the friendly codes in catalog.err.
const dbCode = (e: { code?: string; message?: string }) =>
  e.message?.includes("plans_max") ? "planMax" : e.message?.includes("plans_default_required") ? "planDefault" : e.code === "23503" ? "planInUse" : e.code === "23505" ? "dup" : "save";

export async function savePlan(f: FormData) {
  const { supabase, here } = await begin(f);
  const isNew = f.get("new") === "1";
  const id = str(f, "id");
  if (!PLAN_ID.test(id)) fail(here, "planId");
  const text = (k: string, max: number) => str(f, k).slice(0, max + 1);
  const row = {
    name_ar: text("name_ar", 40), name_en: text("name_en", 40), desc_ar: text("desc_ar", 200), desc_en: text("desc_en", 200),
  };
  if ([row.name_ar, row.name_en].some((s) => !s || s.length > 40) || row.desc_ar.length > 200 || row.desc_en.length > 200) fail(here, "planName");
  const sort = Number(str(f, "sort"));
  if (!Number.isInteger(sort) || sort < 0 || sort > 1000) fail(here, "number");
  const entitlements: Record<string, number | boolean | null> = {};
  for (const e of ENTITLEMENTS) {
    if (e.kind === "boolean") entitlements[e.key] = f.get(e.key) === "on";
    else {
      const s = str(f, e.key);
      const n = Number(s);
      if (s && !(Number.isInteger(n) && n >= 0 && n <= 10_000_000)) fail(here, "number");
      entitlements[e.key] = s ? n : null;
    }
  }
  const body = { ...row, sort, is_active: f.get("is_active") === "on", is_default: f.get("is_default") === "on", entitlements };
  const q = isNew ? supabase.from("plans").insert({ ...body, id }) : supabase.from("plans").update(body).eq("id", id);
  const { data, error } = await q.select("id");
  if (error) fail(here, dbCode(error));
  if (!data?.length) fail(here, "forbidden");
  revalidatePath("/dashboard", "layout");
  redirect(LIST);
}

export async function deletePlan(f: FormData) {
  const { supabase, here } = await begin(f);
  const id = str(f, "id");
  if (!PLAN_ID.test(id)) fail(here, "save");
  const { data, error } = await supabase.from("plans").delete().eq("id", id).select("id");
  if (error) fail(here, dbCode(error));
  if (!data?.length) fail(here, "forbidden");
  revalidatePath("/dashboard", "layout");
  redirect(LIST);
}

// The matrix form: every plan's details and entitlements plus the lock rules, in one save.
// The plan that becomes the default is written first (the database lets only one default exist and refuses to unset the old one first).
export async function savePlans(f: FormData) {
  const { supabase, here } = await begin(f);
  const ids = f.getAll("ids").map(String).filter((id) => PLAN_ID.test(id));
  if (!ids.length) fail(here, "save");
  const text = (k: string, max: number) => str(f, k).slice(0, max + 1);
  const whole = (k: string, max: number) => {
    const s = str(f, k);
    if (!s) return null;
    const n = Number(s);
    if (!(Number.isInteger(n) && n >= 0 && n <= max)) fail(here, "number");
    return n;
  };
  const popular = ids.filter((id) => f.get(`${id}.is_popular`) === "on");
  if (popular.length > 1) fail(here, "planPopular");
  const rows = ids.map((id) => {
    const row = {
      name_ar: text(`${id}.name_ar`, 40), name_en: text(`${id}.name_en`, 40), desc_ar: text(`${id}.desc_ar`, 200), desc_en: text(`${id}.desc_en`, 200),
    };
    if ([row.name_ar, row.name_en].some((s) => !s || s.length > 40) || row.desc_ar.length > 200 || row.desc_en.length > 200) fail(here, "planName");
    const entitlements: Record<string, number | boolean | null> = {};
    for (const e of ENTITLEMENTS) {
      entitlements[e.key] = e.kind === "boolean" ? f.get(`${id}.${e.key}`) === "on" : whole(`${id}.${e.key}`, 10_000_000);
    }
    return {
      id,
      body: {
        ...row, entitlements,
        price_monthly: whole(`${id}.price_monthly`, 1_000_000), price_yearly: whole(`${id}.price_yearly`, 10_000_000),
        trial_days: whole(`${id}.trial_days`, 90) ?? 0,
        is_active: f.get(`${id}.is_active`) === "on", is_popular: popular[0] === id, is_default: str(f, "default") === id,
      },
    };
  });
  rows.sort((a, b) => Number(b.body.is_default) - Number(a.body.is_default));
  for (const r of rows) {
    const { data, error } = await supabase.from("plans").update(r.body).eq("id", r.id).select("id");
    if (error) fail(here, dbCode(error));
    if (!data?.length) fail(here, "forbidden");
  }

  // Lock rules: a row only exists while it says something (hidden, or a message).
  const keep: { id: string; hidden: boolean; msg_ar: string; msg_en: string }[] = [];
  const drop: string[] = [];
  for (const e of ENTITLEMENTS) {
    const lock = { id: e.key, hidden: f.get(`lock.${e.key}.hidden`) === "on", msg_ar: text(`lock.${e.key}.msg_ar`, 200), msg_en: text(`lock.${e.key}.msg_en`, 200) };
    if (lock.msg_ar.length > 200 || lock.msg_en.length > 200) fail(here, "planName");
    if (lock.hidden || lock.msg_ar || lock.msg_en) keep.push(lock);
    else drop.push(e.key);
  }
  if (keep.length) {
    const { error } = await supabase.from("feature_locks").upsert(keep);
    if (error) fail(here, "save");
  }
  if (drop.length) {
    const { error } = await supabase.from("feature_locks").delete().in("id", drop);
    if (error) fail(here, "save");
  }
  revalidatePath("/dashboard", "layout");
  revalidatePath("/", "layout"); // the website's plan cards
  redirect(`${LIST}?saved=1`);
}

// Give one user a plan (empty plan = back to the default plan). Result shows as ?plan=ok|err on the user page.
export async function setUserPlan(f: FormData) {
  const { supabase, role } = await requireAdmin();
  const user = str(f, "user");
  if (!UUID.test(user)) redirect("/dashboard/users");
  const here = String(f.get("here") ?? "");
  const back = /^\/dashboard\/users(\?[\w=&%.+-]*)?$/.test(here) ? here : `/dashboard/users/${user}`; // the users table sends its own address
  const sep = back.includes("?") ? "&" : "?";
  const plan = str(f, "plan");
  const day = str(f, "expires");
  if (!canEditPlans(role) || (plan && !PLAN_ID.test(plan)) || (day && !/^\d{4}-\d{2}-\d{2}$/.test(day))) redirect(`${back}${sep}plan=err`);
  const { error } = await supabase.rpc("admin_set_user_plan", {
    p_user: user,
    p_plan: plan || null,
    p_expires: plan && day ? `${day}T23:59:59Z` : null,
  });
  revalidatePath("/dashboard", "layout");
  redirect(`${back}${sep}plan=${error ? "err" : "ok"}`);
}
