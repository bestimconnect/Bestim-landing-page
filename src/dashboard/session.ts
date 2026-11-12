import { cache } from "react";
import { redirect } from "next/navigation";
import { supabaseServer } from "./supabase";

// Call at the top of every dashboard page. Signed out or not an admin: back to the login page.
// (The database checks again on every read, so this is the friendly check, not the only one.)
export const requireAdmin = cache(async () => {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/dashboard/login");
  const { data: role } = await supabase.rpc("admin_role");
  if (!role) redirect("/dashboard/login?e=notAdmin");
  return { supabase, role: role as string, email: (data.claims.email as string | undefined) ?? "" };
});
