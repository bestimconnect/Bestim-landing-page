import type { requireAdmin } from "./session";
import type { Tone } from "./ui";

// Values are stored in English in the database; the dictionary (team.v) has the Arabic / English labels.
export const BUG_STATUS = ["New", "Confirmed", "In progress", "Fixed in build", "Verified", "Closed", "Won't fix"];
export const TASK_STATUS = ["Backlog", "To do", "In progress", "Waiting for Ahmed", "Waiting for Shady", "Done"];
export const SEVERITY = ["Blocker", "High", "Medium", "Low"];
export const PRIORITY = ["High", "Medium", "Low"];
export const PLATFORM = ["iPhone", "Android", "Web", "Both"];
export const AREA = ["App", "Store", "Website", "Connect", "Backend"];
export const OWNER = ["Shady", "Ahmed", "Daytwo"];
export const CLOSED = ["Closed", "Won't fix", "Done"];

export type Kind = "bug" | "task";
export const statusList = (kind: Kind) => (kind === "bug" ? BUG_STATUS : TASK_STATUS);

const TONES: Record<string, Tone> = {
  New: "blush", Confirmed: "amber", "In progress": "sky", "Fixed in build": "mint", Verified: "mint",
  "Waiting for Ahmed": "amber", "Waiting for Shady": "amber",
  Blocker: "blush", High: "amber", Medium: "sky",
};
export const tone = (v: string | null | undefined): Tone => (v && TONES[v]) || "paper";

// Shapes returned by the team_* functions (bestim-app/supabase/migrations/20261112090000_team_tracker.sql).
export type TeamRow = {
  num: number; kind: Kind; title: string; status: string; severity: string | null; priority: string | null; platform: string | null;
  area: string | null; owner: string | null; due_date: string | null; link_num: number | null; legacy_ref: string | null;
  created_at: string; updated_at: string; closed_at: string | null; comments: number;
};
export type TeamItem = TeamRow & {
  id: string; build: string | null; screen: string | null; steps: string | null; expected: string | null; actual: string | null;
  task_type: string | null; details: string | null; reported_by_name: string | null; created_by_name: string | null; created_via: string;
};
type Ref = { num: number; kind: Kind; title: string; status: string };
export type TeamDetail = {
  item: TeamItem;
  comments: { id: string; body: string; via: string; at: string; author: string | null }[];
  files: { id: string; path: string; mime: string; size: number; comment_id: string | null; at: string; by: string | null }[];
  activity: { action: string; detail: { from?: string; to?: string; status?: string } | null; via: string; at: string; actor: string | null }[];
  linked: Ref | null;
  linked_from: Ref[];
};
export type TeamOverview = {
  me: string | null; open_bugs: number; open_tasks: number; closed_7d: number;
  bug_status: Record<string, number>; task_status: Record<string, number>; bug_severity: Record<string, number>;
  task_owner: Record<string, number>; open_area: Record<string, number>;
  weekly: { week: string; created: number; closed: number }[];
  waiting_me: { num: number; title: string; status: string; due_date: string | null }[];
  blockers: { num: number; title: string; status: string; area: string | null }[];
  due_week: { num: number; title: string; status: string; owner: string | null; due_date: string }[];
};

type Db = Awaited<ReturnType<typeof requireAdmin>>["supabase"];
// One call to an admin function. Any failure (functions not applied yet, no network, viewer writing) becomes a
// code the page shows calmly instead of crashing: 42501 = read only, anything else = unavailable.
export async function call<T>(db: Db, fn: string, args: Record<string, unknown> = {}) {
  const { data, error } = await db.rpc(fn, args);
  if (error) return { data: null as T | null, err: error.code === "42501" ? ("readonly" as const) : ("unavailable" as const) };
  return { data: data as T, err: null };
}

export const FILE_TYPES: Record<string, string> = {
  "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/heic": "heic",
  "video/mp4": "mp4", "video/quicktime": "mov", "application/pdf": "pdf",
};
export const MAX_FILE = 10 * 1024 * 1024;
