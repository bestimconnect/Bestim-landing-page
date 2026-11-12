"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "./supabase";
import { site } from "@/lib/site";

export async function signIn(form: FormData) {
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(form.get("email") ?? "").trim(),
    password: String(form.get("password") ?? ""),
  });
  if (error) redirect("/dashboard/login?e=invalid");
  // Same login as the app, so most accounts are not admins: those are signed straight back out.
  const { data: role } = await supabase.rpc("admin_role");
  if (!role) {
    await supabase.auth.signOut();
    redirect("/dashboard/login?e=notAdmin");
  }
  redirect("/dashboard");
}

export async function signOut() {
  await (await supabaseServer()).auth.signOut();
  redirect("/dashboard/login");
}

// Setting a cookie in an action makes Next re-render the current page in the new language.
export async function setLang(form: FormData) {
  (await cookies()).set("dash_lang", form.get("lang") === "en" ? "en" : "ar", {
    path: "/dashboard",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}

// Sends the reset link. The answer is always the same, so nobody can use this page to find out who has an account.
// The link comes back to this same site (same browser: Supabase's code only works where the request was made).
export async function requestReset(form: FormData) {
  const origin = (await headers()).get("origin") ?? site.url;
  const here = /^https:\/\/(www\.)?bestim-eg\.com$|^http:\/\/localhost:\d+$/.test(origin) ? origin : site.url;
  const email = String(form.get("email") ?? "").trim();
  if (email) await (await supabaseServer()).auth.resetPasswordForEmail(email, { redirectTo: `${here}/dashboard/reset` });
  redirect("/dashboard/forgot?sent=1");
}

// Turns the one-time code from the email into a session, sets the new password, then asks for a fresh sign-in.
export async function setPassword(form: FormData) {
  const code = String(form.get("code") ?? "");
  const password = String(form.get("password") ?? "");
  const back = (e: string) => redirect(`/dashboard/reset?code=${encodeURIComponent(code)}&e=${e}`);
  if (password.length < 8) back("short");
  if (password !== String(form.get("confirm") ?? "")) back("mismatch");
  const supabase = await supabaseServer();
  const ex = await supabase.auth.exchangeCodeForSession(code);
  if (ex.error) redirect("/dashboard/reset?e=expired");
  const up = await supabase.auth.updateUser({ password });
  await supabase.auth.signOut();
  if (up.error) redirect("/dashboard/reset?e=expired");
  redirect("/dashboard/login?e=reset");
}
