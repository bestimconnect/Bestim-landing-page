import { cache } from "react";
import { redirect } from "next/navigation";
import { supabaseServer } from "./supabase";

// Call at the top of every dashboard page. Signed out or not an admin: back to the login page.
// (The database checks again on every read, so this is the friendly check, not the only one.)
export const requireAdmin = cache(async () => {
  const supabase = await supabaseServer();
  // Both checks at once (one round trip instead of two); the redirect still happens before anything renders.
  const [{ data }, { data: role }] = await Promise.all([supabase.auth.getClaims(), supabase.rpc("admin_role")]);
  if (!data?.claims) redirect("/dashboard/login");
  if (!role) redirect("/dashboard/login?e=notAdmin");
  return { supabase, role: role as string, id: data.claims.sub as string, email: (data.claims.email as string | undefined) ?? "" };
});
