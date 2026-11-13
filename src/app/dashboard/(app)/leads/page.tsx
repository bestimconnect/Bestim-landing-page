import { Phone } from "lucide-react";
import { fmtDate, fmtNum, getDash } from "@/dashboard/i18n";
import { requireAdmin } from "@/dashboard/session";
import { Pager, pageOf, sizeOf } from "@/dashboard/pager";
import { Chip, EmptyState, PageTitle, Table, td, th } from "@/dashboard/ui";

type Lead = {
  id: string;
  created_at: string;
  name: string;
  company: string;
  phone: string;
  fleet_size: string;
  kind: "fleet" | "workshop";
  note: string | null;
};

export default async function LeadsPage({ searchParams }: PageProps<"/dashboard/leads">) {
  const { supabase } = await requireAdmin();
  const { t, lang } = await getDash();
  const sp = await searchParams;
  const page = pageOf(sp.page);
  const size = sizeOf(sp.size);
  const { data, count } = await supabase
    .from("connect_leads")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * size, page * size - 1);
  const rows = (data ?? []) as Lead[];
  const total = count ?? rows.length;

  return (
    <>
      <PageTitle sub={`${t.leads.total}: ${fmtNum(total)}`}>{t.leads.title}</PageTitle>
      {rows.length === 0 ? (
        <EmptyState>{t.leads.empty}</EmptyState>
      ) : (
        <Table footer={<Pager size={size} page={page} total={total} base="/dashboard/leads" />}>
          <thead>
            <tr>
              {[t.leads.date, t.leads.name, t.leads.company, t.leads.kind, t.leads.fleet, t.leads.note, t.leads.phone].map((h) => <th key={h} className={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id} className="hover:bg-d-paper">
                <td className={td}>{fmtDate(lang, l.created_at, true)}</td>
                <td className={`${td} font-semibold`}>{l.name}</td>
                <td className={td}>{l.company}</td>
                <td className={td}><Chip tone={l.kind === "fleet" ? "sky" : "amber"}>{l.kind === "fleet" ? t.leads.fleetKind : t.leads.workshopKind}</Chip></td>
                <td className={td}><bdi>{l.fleet_size}</bdi></td>
                <td className={`${td} max-w-72 !whitespace-pre-wrap`}>{l.note ?? "—"}</td>
                <td className={td}>
                  <a href={`tel:${l.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 font-semibold text-d-teal underline-offset-4 hover:underline">
                    <Phone size={16} strokeWidth={1.9} aria-hidden="true" />
                    <span dir="ltr">{l.phone}</span>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
