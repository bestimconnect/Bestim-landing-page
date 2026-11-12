import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { site } from "@/lib/site";

// A Supabase client that acts as the signed-in admin (their own session, never a secret key).
// What they may read is decided by the database (see the admin_foundation migration), not by this code.
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(site.supabaseUrl, site.supabaseKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a page, where cookies can't be written: proxy.ts already refreshed the session.
        }
      },
    },
  });
}
