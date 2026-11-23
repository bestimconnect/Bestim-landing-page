"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { UUID } from "./catalog";
import { requireAdmin } from "./session";
import { site } from "@/lib/site";

// Admin push (Notifications page). The message is saved first (so it also shows in the app's Notifications bell), then sent
// through Expo's push service in batches of 100. Needs the server-only SUPABASE_SERVICE_ROLE_KEY (tokens are private); the
// optional EXPO_ACCESS_TOKEN is only for Expo's "enhanced security" setting. Owner and admin only. Every send is audit-logged.
const HERE = "/dashboard/notifications";
const EXPO = "https://exp.host/--/api/v2/push/send";
const MAX_SELECTED = 500;
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const go = (qs: string): never => redirect(`${HERE}?${qs}`);

type Ticket = { status: "ok" | "error"; details?: { error?: string } };
type Msg = { to: string; title: string; body: string; sound: "default"; channelId: "default"; data: { announcementId: string; url: string } };

/** Name search for the "selected users" picker. */
export async function searchUsers(q: string) {
  const { supabase, role } = await requireAdmin();
  if (role !== "owner" && role !== "admin") return [];
  const { data } = await supabase.rpc("admin_user_list", { p_search: q.trim().slice(0, 80), p_limit: 8, p_offset: 0 });
  return ((data ?? []) as { id: string; email: string | null; full_name: string }[]).map((u) => ({ id: u.id, email: u.email ?? "", name: u.full_name }));
}

export async function sendPush(f: FormData) {
  const { supabase, role } = await requireAdmin();
  if (role !== "owner" && role !== "admin") go("err=forbidden");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) go("err=noKey");
  const service = createClient(site.supabaseUrl, key!, { auth: { persistSession: false, autoRefreshToken: false } });

  const title_ar = str(f, "title_ar");
  const body_ar = str(f, "body_ar");
  const title_en = str(f, "title_en");
  const body_en = str(f, "body_en");
  const audience = str(f, "audience") === "selected" ? "selected" : "all";
  const ids = [...new Set(f.getAll("user").map(String).filter((x) => UUID.test(x)))];
  if (!title_ar || !body_ar || title_ar.length > 100 || body_ar.length > 500 || title_en.length > 100 || body_en.length > 500) go("err=invalid");
  if (audience === "selected" && (ids.length === 0 || ids.length > MAX_SELECTED)) go("err=noRecipients");
  if (audience === "all" && str(f, "confirm") !== "1") go("err=confirm"); // everyone: the admin ticked the box that shows the count

  const me = (await supabase.auth.getClaims()).data?.claims?.sub as string | undefined;
  const { data: ann, error } = await service
    .from("announcements")
    .insert({ title_ar, body_ar, title_en: title_en || null, body_en: body_en || null, audience, sent_by: me ?? null })
    .select("id")
    .single();
  if (error || !ann) go("err=save");
  const announcementId = ann!.id as string;
  if (audience === "selected") {
    const { error: e2 } = await service.from("announcement_users").insert(ids.map((user_id) => ({ announcement_id: announcementId, user_id })));
    if (e2) go("err=save");
  }

  // Phones to notify: everyone's (or the chosen users') tokens, minus people who turned notifications off.
  const tokens: { token: string; lang: string }[] = [];
  for (let from = 0; ; from += 1000) {
    let q = service.from("push_tokens").select("token, profiles!inner(language, notifications_enabled)").eq("profiles.notifications_enabled", true).order("id").range(from, from + 999);
    if (audience === "selected") q = q.in("user_id", ids);
    const { data } = await q;
    const rows = (data ?? []) as unknown as { token: string; profiles: { language: string } | { language: string }[] }[];
    for (const r of rows) tokens.push({ token: r.token, lang: (Array.isArray(r.profiles) ? r.profiles[0] : r.profiles)?.language === "en" ? "en" : "ar" });
    if (rows.length < 1000) break;
  }

  let sent = 0;
  let failed = 0;
  const dead: string[] = [];
  for (let i = 0; i < tokens.length; i += 100) {
    const batch = tokens.slice(i, i + 100);
    const messages: Msg[] = batch.map(({ token, lang }) => ({
      to: token,
      title: lang === "en" && title_en ? title_en : title_ar,
      body: lang === "en" && body_en ? body_en : body_ar,
      sound: "default",
      channelId: "default",
      data: { announcementId, url: "/notifications" },
    }));
    try {
      const res = await fetch(EXPO, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", ...(process.env.EXPO_ACCESS_TOKEN ? { Authorization: `Bearer ${process.env.EXPO_ACCESS_TOKEN}` } : {}) },
        body: JSON.stringify(messages),
      });
      const tickets = ((await res.json()) as { data?: Ticket[] }).data ?? [];
      tickets.forEach((tk, j) => {
        if (tk.status === "ok") sent++;
        else {
          failed++;
          if (tk.details?.error === "DeviceNotRegistered") dead.push(batch[j].token); // the app was removed: forget the token
        }
      });
      failed += Math.max(batch.length - tickets.length, 0);
    } catch {
      failed += batch.length;
    }
  }
  if (dead.length) await service.from("push_tokens").delete().in("token", dead);
  await service.from("announcements").update({ push_sent: sent, push_failed: failed }).eq("id", announcementId);
  await supabase.rpc("admin_log", { p_action: "send_push", p_target: announcementId, p_detail: { audience, users: audience === "selected" ? ids.length : null, sent, failed } });
  revalidatePath(HERE);
  go(`saved=1&sent=${sent}&failed=${failed}`);
}
