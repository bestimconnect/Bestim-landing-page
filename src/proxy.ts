import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { site } from "@/lib/site";

// Keeps the admin's sign-in fresh and sends signed-out visitors to the login page.
// This is only the first check: every dashboard page and every database read checks again.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(site.supabaseUrl, site.supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims && request.nextUrl.pathname !== "/dashboard/login") {
    return NextResponse.redirect(new URL("/dashboard/login", request.url));
  }
  return response;
}

export const config = { matcher: "/dashboard/:path*" };
