import { Activity, Bug, Car, FileText, Languages, Layers, LayoutDashboard, List, ListChecks, LogOut, Mail, Plug, Sparkles, Users, WalletCards, Wrench } from "lucide-react";
import { cookies } from "next/headers";
import Image from "next/image";
import type { ReactNode } from "react";
import { setLang, signOut } from "./actions";
import { getDash } from "./i18n";
import { SubmitButton } from "./Pending";
import { Nav, type NavItem } from "./Nav";
import { SidebarToggle } from "./SidebarToggle";
import { Avatar } from "./ui";

const hideWhenCollapsed = "md:group-data-[collapsed=true]:hidden";

// Dark sidebar on computers (on the start side, collapsible to an icon rail), a top bar on phones.
export async function Shell({ email, role, children }: { email: string; role: string; children: ReactNode }) {
  const { lang, t } = await getDash();
  const collapsed = (await cookies()).get("dash_nav")?.value === "collapsed";
  const icon = { size: 20, strokeWidth: 1.8, "aria-hidden": true } as const;
  const items: NavItem[] = [
    { href: "/dashboard", label: t.nav.overview, icon: <LayoutDashboard {...icon} /> },
    { href: "/dashboard/users", label: t.nav.users, icon: <Users {...icon} /> },
    { href: "/dashboard/leads", label: t.nav.leads, icon: <Mail {...icon} /> },
    { href: "/dashboard/logs", label: t.nav.logs, icon: <List {...icon} /> },
    { href: "/dashboard/plans", label: t.nav.plans, icon: <WalletCards {...icon} /> },
    { href: "/dashboard/ai", label: t.nav.ai, icon: <Sparkles {...icon} /> },
    { heading: t.nav.content },
    { href: "/dashboard/cars", label: t.nav.cars, icon: <Car {...icon} /> },
    { href: "/dashboard/parts", label: t.nav.parts, icon: <Wrench {...icon} /> },
    { href: "/dashboard/types", label: t.nav.types, icon: <Layers {...icon} /> },
    { href: "/dashboard/pages", label: t.nav.pages, icon: <FileText {...icon} /> },
    { heading: t.team.nav.heading },
    { href: "/dashboard/team", label: t.team.nav.overview, icon: <Activity {...icon} />, exact: true },
    { href: "/dashboard/team/bugs", label: t.team.nav.bugs, icon: <Bug {...icon} /> },
    { href: "/dashboard/team/tasks", label: t.team.nav.tasks, icon: <ListChecks {...icon} /> },
    { href: "/dashboard/team/connect", label: t.team.nav.connect, icon: <Plug {...icon} /> },
  ];
  const name = email.split("@")[0] || email;
  const roleLabel = (t.roles as Record<string, string>)[role] ?? role;
  const otherLang = lang === "ar" ? "en" : "ar";
  const row =
    "flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-sm text-[#c9d3cd] transition-colors hover:bg-white/10 hover:text-white md:group-data-[collapsed=true]:justify-center md:group-data-[collapsed=true]:px-0";
  return (
    <div className="min-h-[125dvh] md:flex">
      <aside
        data-collapsed={collapsed}
        className="group flex shrink-0 flex-col gap-3 bg-d-panel p-4 text-[#f5f7f5] transition-[width] duration-200 md:sticky md:top-0 md:h-[125dvh] md:w-65 md:gap-6 md:overflow-y-auto md:px-5 md:py-7 md:data-[collapsed=true]:w-21 md:data-[collapsed=true]:px-3"
      >
        <div className="flex items-center justify-between gap-2 md:group-data-[collapsed=true]:flex-col md:group-data-[collapsed=true]:gap-4">
          <Image src="/brand/logo-word-inverse.png" alt="Bestim" width={900} height={198} priority className={`h-6 w-auto md:ms-2 md:h-7 ${hideWhenCollapsed}`} />
          <Image
            src="/brand/logo-mark-inverse.png"
            alt="Bestim"
            width={512}
            height={401}
            priority
            className="hidden h-8 w-auto md:group-data-[collapsed=true]:block"
          />
          <SidebarToggle collapse={t.nav.collapse} expand={t.nav.expand} />
        </div>

        <Nav items={items} />

        <div className="flex flex-wrap items-center gap-x-1 gap-y-2 md:mt-auto md:flex-col md:items-stretch md:gap-1 md:border-t md:border-white/10 md:pt-5">
          <div
            title={`${email} · ${roleLabel}`}
            className="flex min-w-0 items-center gap-3 rounded-2xl bg-[#2c3a32] p-2.5 md:mb-2 md:group-data-[collapsed=true]:justify-center md:group-data-[collapsed=true]:bg-transparent md:group-data-[collapsed=true]:p-0"
          >
            <Avatar text={email} className="size-11 bg-lime text-lg text-ink" />
            <div className={`min-w-0 ${hideWhenCollapsed}`}>
              <p className="truncate text-sm font-bold">{name}</p>
              <p dir="ltr" className="truncate text-xs text-[#b9c4be] rtl:text-end">{email}</p>
              <span className="mt-1 inline-block rounded-full bg-d-panel px-2.5 py-0.5 text-[11px] font-semibold text-lime">{roleLabel}</span>
            </div>
          </div>
          <form action={setLang}>
            <input type="hidden" name="lang" value={otherLang} />
            <SubmitButton lang={otherLang} title={otherLang === "ar" ? "العربية" : "English"} className={row}>
              <Languages size={18} strokeWidth={1.8} aria-hidden="true" className="shrink-0" />
              <span className={hideWhenCollapsed}>{otherLang === "ar" ? "العربية" : "English"}</span>
            </SubmitButton>
          </form>
          <form action={signOut}>
            <SubmitButton title={t.nav.signOut} className={row}>
              <LogOut size={18} strokeWidth={1.8} aria-hidden="true" className="shrink-0 rtl:rotate-180" />
              <span className={hideWhenCollapsed}>{t.nav.signOut}</span>
            </SubmitButton>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-10">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
