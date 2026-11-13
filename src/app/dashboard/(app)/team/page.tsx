import { Bug, ListChecks, Plus } from "lucide-react";
import { PendingLink } from "@/dashboard/Pending";
import { fmtDate, fmtNum, getDash } from "@/dashboard/i18n";
import { requireAdmin } from "@/dashboard/session";
import { Unavailable } from "@/dashboard/TeamBoard";
import { Bars, Donut, Weekly } from "@/dashboard/TeamCharts";
import { AREA, BUG_STATUS, call, OWNER, SEVERITY, tone, type TeamOverview } from "@/dashboard/team";
import { Card, Chip, EmptyState, PageTitle, Tile } from "@/dashboard/ui";

export default async function TeamOverviewPage() {
  const { supabase } = await requireAdmin();
  const { t, lang } = await getDash();
  const o = t.team.overview;
  const v = t.team.v as Record<string, string>;
  const { data: d } = await call<TeamOverview>(supabase, "team_overview");
  if (!d) {
    return (
      <>
        <PageTitle sub={o.sub}>{o.title}</PageTitle>
        <Unavailable text={t.team.unavailable} />
      </>
    );
  }
  const rows = (list: string[], m: Record<string, number>) => list.map((k) => ({ label: v[k] ?? k, n: m[k] ?? 0 }));
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo" }).format(new Date());
  const item = (x: { num: number; title: string; status: string }, extra?: React.ReactNode) => (
    <li key={x.num} className="flex flex-wrap items-center justify-between gap-2 border-t border-d-line py-2.5 first:border-0">
      <PendingLink href={`/dashboard/team/${x.num}`} spinner={false} className="min-w-0 font-semibold hover:underline">
        <bdi className="me-1.5 text-d-muted">#{x.num}</bdi>{x.title}
      </PendingLink>
      <span className="flex items-center gap-2 text-sm text-d-muted">{extra}<Chip tone={tone(x.status)}>{v[x.status] ?? x.status}</Chip></span>
    </li>
  );
  const box = (title: string, empty: string, children: React.ReactNode[]) => (
    <Card>
      <h2 className="mb-2 text-lg font-bold">{title}</h2>
      {children.length ? <ul>{children}</ul> : <EmptyState>{empty}</EmptyState>}
    </Card>
  );
  const goto = [
    { href: "/dashboard/team/bugs", icon: <Bug size={22} aria-hidden="true" />, title: o.goBugs, sub: o.goBugsSub },
    { href: "/dashboard/team/tasks", icon: <ListChecks size={22} aria-hidden="true" />, title: o.goTasks, sub: o.goTasksSub },
    { href: "/dashboard/team/bugs?new=bug", icon: <Plus size={22} aria-hidden="true" />, title: o.newBug, sub: o.newBugSub },
    { href: "/dashboard/team/tasks?new=task", icon: <Plus size={22} aria-hidden="true" />, title: o.newTask, sub: o.newTaskSub },
  ];

  return (
    <>
      <PageTitle sub={o.sub}>{o.title}</PageTitle>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Tile tone="blush" label={o.openBugs} value={fmtNum(d.open_bugs)} />
        <Tile tone="sky" label={o.openTasks} value={fmtNum(d.open_tasks)} />
        <Tile tone="mint" label={o.closed7d} value={fmtNum(d.closed_7d)} />
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {goto.map((g) => (
          <PendingLink key={g.href} href={g.href} spinner={false} className="flex items-center gap-3.5 rounded-3xl border border-d-line bg-d-card p-5 shadow-card hover:border-d-teal">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-d-mint">{g.icon}</span>
            <span><span className="block font-bold">{g.title}</span><span className="block text-sm text-d-muted">{g.sub}</span></span>
          </PendingLink>
        ))}
      </div>
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        {box(o.waiting, o.waitingEmpty, d.waiting_me.map((x) => item(x, x.due_date && <bdi>{fmtDate(lang, x.due_date)}</bdi>)))}
        {box(o.blockers, o.blockersEmpty, d.blockers.map((x) => item(x, x.area && v[x.area])))}
      </div>
      <div className="mb-6">
        {box(o.due, o.dueEmpty, d.due_week.map((x) => item(x, <>
          {x.due_date < today && <Chip tone="blush">{o.overdue}</Chip>}
          <bdi>{fmtDate(lang, x.due_date)}</bdi>{x.owner && <span>{v[x.owner]}</span>}
        </>)))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Bars title={o.bugsByStatus} rows={rows(BUG_STATUS, d.bug_status)} empty={o.noData} />
        <Bars title={o.tasksByOwner} rows={rows(OWNER, d.task_owner)} empty={o.noData} />
        <Bars title={o.byArea} rows={rows(AREA, d.open_area)} empty={o.noData} />
        <Donut title={o.bySeverity} rows={rows(SEVERITY, d.bug_severity)} empty={o.noData} />
        <div className="lg:col-span-2">
          <Weekly title={o.weekly} weeks={d.weekly ?? []} labels={{ created: o.created, closed: o.closed, week: o.week }} empty={o.noData} />
        </div>
      </div>
    </>
  );
}
