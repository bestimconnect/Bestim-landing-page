"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "./session";
import {
  AREA, BUG_STATUS, call, FILE_TYPES, MAX_FILE, OWNER, PLATFORM, PRIORITY, SEVERITY, TASK_STATUS, type Kind,
} from "./team";

// Same shape as the other action files: sign-in check, validate, call the database function, redirect
// (back to the page with ?err=<code> when something is wrong). Everything goes through the team_* functions.
const SAFE = /^\/dashboard\/team\/(bugs|tasks|\d+)(\?[\w=&%.+-]*)?$/;
const safe = (v: FormDataEntryValue | null, fallback: string) => (typeof v === "string" && SAFE.test(v) ? v : fallback);
const str = (f: FormData, k: string) => String(f.get(k) ?? "").replace(/\r\n/g, "\n").trim();
function fail(here: string, code: string): never {
  redirect(`${here.replace(/[?&]err=\w+/, "")}${here.includes("?") ? "&" : "?"}err=${code}`);
}
const done = () => revalidatePath("/dashboard/team", "layout");

type Res = { ok?: boolean; num?: number; error?: string };
const outcome = (r: { data: Res | null; err: string | null }) => r.err ?? (r.data?.error === "not_found" ? "notFound" : r.data?.error ? "invalid" : r.data?.ok ? null : "unavailable");

async function begin(f: FormData, fallback: string) {
  const { supabase, role } = await requireAdmin();
  const here = safe(f.get("here"), fallback);
  if (role === "viewer") fail(here, "readonly");
  return { supabase, here };
}

const fileProblem = (file: File) => (!FILE_TYPES[file.type] ? "fileType" : file.size > MAX_FILE ? "fileBig" : null);
const fileOf = (f: FormData, k: string) => {
  const v = f.get(k);
  return v instanceof File && v.size > 0 ? v : null;
};

// Uploads to the private team-files bucket under the item's own folder, then registers the file.
async function attach(db: Awaited<ReturnType<typeof begin>>["supabase"], num: number, file: File) {
  const got = await call<{ item?: { id: string } }>(db, "team_get", { p_num: num });
  const id = got.data?.item?.id;
  if (!id) return got.err ?? "notFound";
  const path = `${id}/${crypto.randomUUID()}.${FILE_TYPES[file.type]}`;
  const up = await db.storage.from("team-files").upload(path, file, { contentType: file.type });
  if (up.error) return "upload";
  const r = await call<Res>(db, "team_file_add", { p_num: num, p_path: path, p_mime: file.type, p_size: file.size, p_comment: null, p_via: "dashboard" });
  const code = outcome(r);
  if (code) await db.storage.from("team-files").remove([path]);
  return code;
}

// Create (no num) or edit (num) a bug or task from the form. The database re-checks everything.
export async function saveItem(f: FormData) {
  const kind: Kind = f.get("kind") === "task" ? "task" : "bug";
  const numStr = str(f, "num");
  const { supabase, here } = await begin(f, numStr ? `/dashboard/team/${numStr}` : `/dashboard/team/${kind}s?new=${kind}`);
  const text = (k: string, max: number) => {
    const s = str(f, k);
    if (s.length > max) fail(here, "long");
    return s || null;
  };
  const pick = (k: string, list: string[], required = false) => {
    const s = str(f, k);
    if (!s) return required ? fail(here, "choose") : null;
    return list.includes(s) ? s : fail(here, "choose");
  };
  const title = str(f, "title");
  if (!title || title.length > 200) fail(here, "title");
  const item: Record<string, unknown> = { title, kind, area: pick("area", AREA) };
  if (kind === "bug") {
    const link = str(f, "link_num");
    if (link && !/^\d{1,9}$/.test(link)) fail(here, "link");
    Object.assign(item, {
      severity: pick("severity", SEVERITY, true), platform: pick("platform", PLATFORM),
      build: text("build", 120), screen: text("screen", 120), steps: text("steps", 10000),
      expected: text("expected", 10000), actual: text("actual", 10000), link_num: link ? Number(link) : null,
    });
  } else {
    const due = str(f, "due_date");
    if (due && !/^\d{4}-\d{2}-\d{2}$/.test(due)) fail(here, "date");
    Object.assign(item, {
      owner: pick("owner", OWNER, true), priority: pick("priority", PRIORITY), task_type: text("task_type", 60),
      due_date: due || null, details: text("details", 10000),
    });
  }
  const shot = fileOf(f, "file");
  if (shot && fileProblem(shot)) fail(here, fileProblem(shot)!);
  if (numStr) {
    if (!/^\d{1,9}$/.test(numStr)) fail(here, "notFound");
    item.num = Number(numStr);
  }
  const r = await call<Res>(supabase, "team_save", { p_item: item, p_via: "dashboard" });
  const code = outcome(r);
  if (code) fail(here, code);
  const num = r.data!.num!;
  const next = `/dashboard/team/${num}`;
  if (shot && !numStr) {
    const bad = await attach(supabase, num, shot);
    if (bad) {
      done();
      fail(next, bad);
    }
  }
  done();
  redirect(next);
}

// The little status menu on cards and the item page.
export async function setStatus(f: FormData) {
  const { supabase, here } = await begin(f, "/dashboard/team");
  const status = str(f, "status");
  const num = str(f, "num");
  if (!/^\d{1,9}$/.test(num) || ![...BUG_STATUS, ...TASK_STATUS].includes(status)) fail(here, "choose");
  const code = outcome(await call<Res>(supabase, "team_save", { p_item: { num: Number(num), status }, p_via: "dashboard" }));
  if (code) fail(here, code);
  done();
  redirect(here);
}

// Called by the board's drag and drop: returns an error code (or null) instead of redirecting.
export async function moveItem(num: number, status: string): Promise<string | null> {
  const { supabase, role } = await requireAdmin();
  if (role === "viewer") return "readonly";
  if (!Number.isInteger(num) || num < 1 || ![...BUG_STATUS, ...TASK_STATUS].includes(status)) return "choose";
  const code = outcome(await call<Res>(supabase, "team_save", { p_item: { num, status }, p_via: "dashboard" }));
  if (!code) done();
  return code;
}

export async function addComment(f: FormData) {
  const { supabase, here } = await begin(f, "/dashboard/team");
  const num = str(f, "num");
  const body = str(f, "body");
  if (!/^\d{1,9}$/.test(num)) fail(here, "notFound");
  if (!body || body.length > 5000) fail(here, "comment");
  const code = outcome(await call<Res>(supabase, "team_comment", { p_num: Number(num), p_body: body, p_via: "dashboard" }));
  if (code) fail(here, code);
  done();
  redirect(here);
}

export async function addFile(f: FormData) {
  const { supabase, here } = await begin(f, "/dashboard/team");
  const num = str(f, "num");
  const file = fileOf(f, "file");
  if (!/^\d{1,9}$/.test(num)) fail(here, "notFound");
  if (!file) fail(here, "noFile");
  const bad = fileProblem(file) ?? (await attach(supabase, Number(num), file));
  if (bad) fail(here, bad);
  done();
  redirect(here);
}

// Personal keys for the Claude connector. The key is shown once, so this returns it to the page instead of redirecting.
export async function createKey(_prev: { key?: string; error?: string } | null, f: FormData) {
  const { supabase } = await requireAdmin();
  const r = await call<string>(supabase, "team_key_create", { p_label: str(f, "label").slice(0, 60) || "Claude" });
  if (r.err || !r.data) return { error: r.err ?? "unavailable" };
  done();
  return { key: r.data };
}

export async function revokeKey(f: FormData) {
  const { supabase } = await requireAdmin();
  await call(supabase, "team_key_revoke", { p_id: str(f, "id") });
  done();
}
