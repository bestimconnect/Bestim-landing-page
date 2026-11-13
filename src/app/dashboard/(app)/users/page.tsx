import Link from "next/link";
import { link, one } from "@/dashboard/catalog";
import { AdminsTab } from "@/dashboard/AdminsTab";
import { getDash } from "@/dashboard/i18n";
import { requireAdmin } from "@/dashboard/session";
import { PageTitle } from "@/dashboard/ui";
import { UsersTab } from "@/dashboard/UsersTab";

export default async function UsersPage({ searchParams }: PageProps<"/dashboard/users">) {
  const { supabase, role, id } = await requireAdmin();
  const { t, lang } = await getDash();
  const sp = await searchParams;
  const admins = one(sp.tab) === "admins";
  const tab = (on: boolean) => `rounded-full px-6 py-2.5 text-[15px] font-bold ${on ? "bg-lime text-ink shadow-glow" : "border border-d-line bg-d-card text-d-muted"}`;

  return (
    <>
      <PageTitle>{t.users.title}</PageTitle>
      <nav className="mb-6 flex gap-2" role="tablist" aria-label={t.users.title}>
        <Link role="tab" aria-selected={!admins} href={link("/dashboard/users", { tab: "users" })} className={tab(!admins)}>{t.users.tabUsers}</Link>
        <Link role="tab" aria-selected={admins} href={link("/dashboard/users", { tab: "admins" })} className={tab(admins)}>{t.users.tabAdmins}</Link>
      </nav>
      {admins
        ? <AdminsTab sp={sp} role={role} me={id} t={t} lang={lang} supabase={supabase} />
        : <UsersTab sp={sp} role={role} me={id} t={t} lang={lang} supabase={supabase} />}
    </>
  );
}
