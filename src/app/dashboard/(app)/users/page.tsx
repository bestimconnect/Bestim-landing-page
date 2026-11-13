import { link, one } from "@/dashboard/catalog";
import { AdminsTab } from "@/dashboard/AdminsTab";
import { getDash } from "@/dashboard/i18n";
import { requireAdmin } from "@/dashboard/session";
import { PageTitle, TabNav } from "@/dashboard/ui";
import { UsersTab } from "@/dashboard/UsersTab";

export default async function UsersPage({ searchParams }: PageProps<"/dashboard/users">) {
  const { supabase, role, id } = await requireAdmin();
  const { t, lang } = await getDash();
  const sp = await searchParams;
  const admins = one(sp.tab) === "admins";

  return (
    <>
      <PageTitle>{t.users.title}</PageTitle>
      <TabNav
        label={t.users.title}
        items={[
          { href: link("/dashboard/users", { tab: "users" }), label: t.users.tabUsers, active: !admins },
          { href: link("/dashboard/users", { tab: "admins" }), label: t.users.tabAdmins, active: admins },
        ]}
      />
      {admins
        ? <AdminsTab sp={sp} role={role} me={id} t={t} lang={lang} supabase={supabase} />
        : <UsersTab sp={sp} role={role} me={id} t={t} lang={lang} supabase={supabase} />}
    </>
  );
}
