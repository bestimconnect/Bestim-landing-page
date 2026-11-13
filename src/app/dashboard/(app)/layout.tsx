import { Suspense } from "react";
import { TopBar } from "@/dashboard/Pending";
import { Shell } from "@/dashboard/Shell";
import { requireAdmin } from "@/dashboard/session";

// Everything except the login page. Each page also calls requireAdmin() itself (layouts don't re-run on every navigation).
export default async function AppLayout({ children }: LayoutProps<"/dashboard">) {
  const { email, role } = await requireAdmin();
  return (
    <Shell email={email} role={role}>
      <Suspense fallback={null}><TopBar /></Suspense>
      {children}
    </Shell>
  );
}
