"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "./supabase";

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
