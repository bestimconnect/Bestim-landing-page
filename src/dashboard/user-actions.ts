"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { UUID } from "./catalog";
import { requireAdmin } from "./session";
import { site } from "@/lib/site";

// Users and admins tables. Account-level things (create, email, suspend, delete) need Supabase's auth admin API, which
// needs the server-only key SUPABASE_SERVICE_ROLE_KEY. It is used only after requireAdmin() and a role check, and every use
// is written to the audit log through admin_log(). Role changes and name edits go through database functions as the admin.
const SAFE = /^\/dashboard\/users(\?[\w=&%.+-]*)?$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = ["owner", "admin", "viewer"];
const TEAMS = ["Shady", "Ahmed", "Daytwo"];
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const withParam = (url: string, k: string, v: string) => `${url}${url.includes("?") ? "&" : "?"}${k}=${v}`;
function fail(here: string, code: string): never {
  redirect(withParam(here, "err", code));
}
const done = (here: string): never => redirect(withParam(here, "saved", "1"));

async function begin(f: FormData, roles: string[]) {
  const a = await requireAdmin();
  const here = SAFE.test(String(f.get("here") ?? "")) ? String(f.get("here")) : "/dashboard/users";
  if (!roles.includes(a.role)) fail(here, "forbidden");
  return { ...a, here };
}

function serviceClient(here: string) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) fail(here, "noKey");
  return createClient(site.supabaseUrl, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

// Database refusals -> the friendly codes in users.err.
const dbCode = (e: { code?: string; message?: string }) =>
  e.message?.includes("last_owner") ? "lastOwner" : e.code === "42501" ? "forbidden" : e.code === "22023" ? "invalid" : "save";

async function log(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"], action: string, target: string, detail: object = {}) {
  await supabase.rpc("admin_log", { p_action: action, p_target: target, p_detail: detail });
}

const isAdmin = async (service: ReturnType<typeof serviceClient>, id: string) =>
  !!(await service.from("admins").select("user_id").eq("user_id", id).maybeSingle()).data;

// New login. With a role it is also an admin (owner only); without one it is an ordinary app user.
export async function createUser(f: FormData) {
  const { supabase, role, here } = await begin(f, ["owner", "admin"]);
  const name = str(f, "name");
  const email = str(f, "email").toLowerCase();
  const password = String(f.get("password") ?? "");
  const asRole = str(f, "role");
  const team = str(f, "team");
  if (!name || name.length > 80) fail(here, "name");
  if (!EMAIL.test(email) || email.length > 200) fail(here, "email");
  if (password.length < 8 || password.length > 72) fail(here, "password");
  if (asRole && (!ROLES.includes(asRole) || (team && !TEAMS.includes(team)))) fail(here, "invalid");
  if (asRole && role !== "owner") fail(here, "forbidden");
  const service = serviceClient(here);
  const { data, error } = await service.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: name } });
  if (error || !data.user) fail(here, error?.code === "email_exists" || /already/i.test(error?.message ?? "") ? "emailTaken" : "save");
  const id = data.user.id;
  if (asRole) {
    const { error: e2 } = await supabase.rpc("admin_set_role", { p_user: id, p_role: asRole, p_team: team || null });
    if (e2) fail(here, dbCode(e2));
  }
  await log(supabase, asRole ? "create_admin" : "create_user", id, { email, role: asRole || null });
  revalidatePath("/dashboard", "layout");
  done(here);
}

// Edit name (always) and email (when it changed).
export async function updateUser(f: FormData) {
  const { supabase, here } = await begin(f, ["owner", "admin"]);
  const id = str(f, "id");
  const name = str(f, "name");
  const email = str(f, "email").toLowerCase();
  if (!UUID.test(id)) fail(here, "save");
  if (!name || name.length > 80) fail(here, "name");
  if (!EMAIL.test(email) || email.length > 200) fail(here, "email");
  const { error } = await supabase.rpc("admin_update_profile", { p_user: id, p_name: name });
  if (error) fail(here, dbCode(error));
  if (email !== str(f, "old_email").toLowerCase()) {
    const { error: e2 } = await serviceClient(here).auth.admin.updateUserById(id, { email, email_confirm: true });
    if (e2) fail(here, /already|exists/i.test(e2.message) ? "emailTaken" : "save");
    await log(supabase, "change_email", id, { to: email });
  }
  revalidatePath("/dashboard", "layout");
  done(here);
}

// Block or unblock sign-in. Never yourself, never another admin (remove their admin access first).
export async function suspendUser(f: FormData) {
  const { supabase, id: me, here } = await begin(f, ["owner", "admin"]);
  const id = str(f, "id");
  const on = f.get("to") === "1";
  if (!UUID.test(id)) fail(here, "save");
  if (id === me) fail(here, "self");
  const service = serviceClient(here);
  if (await isAdmin(service, id)) fail(here, "isAdmin");
  const { error } = await service.auth.admin.updateUserById(id, { ban_duration: on ? "876000h" : "none" });
  if (error) fail(here, "save");
  await log(supabase, on ? "suspend_user" : "unsuspend_user", id);
  revalidatePath("/dashboard", "layout");
  done(here);
}

// Delete the account and (by cascade) every car and record. Owner only; the owner types the email to confirm.
export async function deleteUser(f: FormData) {
  const { supabase, id: me, here } = await begin(f, ["owner"]);
  const id = str(f, "id");
  if (!UUID.test(id)) fail(here, "save");
  if (id === me) fail(here, "self");
  const service = serviceClient(here);
  if (await isAdmin(service, id)) fail(here, "isAdmin");
  const { data } = await service.auth.admin.getUserById(id);
  const email = data.user?.email?.toLowerCase();
  if (!email || str(f, "confirm").toLowerCase() !== email) fail(here, "confirm");
  const { error } = await service.auth.admin.deleteUser(id);
  if (error) fail(here, "save");
  await log(supabase, "delete_user", id, { email });
  revalidatePath("/dashboard", "layout");
  done(here);
}

// Make an existing user an admin, or change an admin's role (owner only; the database refuses to demote the last owner).
export async function setAdminRole(f: FormData) {
  const { supabase, here } = await begin(f, ["owner"]);
  const id = str(f, "id");
  const asRole = str(f, "role");
  const team = str(f, "team");
  if (!UUID.test(id) || !ROLES.includes(asRole) || (team && !TEAMS.includes(team))) fail(here, "invalid");
  const { error } = await supabase.rpc("admin_set_role", { p_user: id, p_role: asRole, p_team: team || null });
  if (error) fail(here, dbCode(error));
  revalidatePath("/dashboard", "layout");
  done(here);
}

// Take admin access away. The account stays as an ordinary user.
export async function removeAdmin(f: FormData) {
  const { supabase, here } = await begin(f, ["owner"]);
  const id = str(f, "id");
  if (!UUID.test(id)) fail(here, "save");
  const { error } = await supabase.rpc("admin_remove_admin", { p_user: id });
  if (error) fail(here, dbCode(error));
  revalidatePath("/dashboard", "layout");
  done(here);
}
