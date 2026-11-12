import { Phone } from "lucide-react";
import { fmtDate, fmtNum, getDash } from "@/dashboard/i18n";
import { requireAdmin } from "@/dashboard/session";
import { Chip, PageTitle } from "@/dashboard/ui";

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

export default async function LeadsPage() {
  const { supabase } = await requireAdmin();
  const { t, lang } = await getDash();
  const { data } = await supabase.from("connect_leads").select("*").order("created_at", { ascending: false }).limit(200);
  const rows = (data ?? []) as Lead[];

  return (
    <>
      <PageTitle sub={`${t.leads.total}: ${fmtNum(rows.length)}`}>{t.leads.title}</PageTitle>
      {rows.length === 0 ? (
        <p className="text-d-muted">{t.leads.empty}</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((l) => (
            <article key={l.id} className="flex flex-col gap-3.5 rounded-3xl border border-d-line bg-d-card p-6 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <Chip tone={l.kind === "fleet" ? "sky" : "amber"}>{l.kind === "fleet" ? t.leads.fleetKind : t.leads.workshopKind}</Chip>
                  <Chip>{t.leads.fleet}: <bdi>{l.fleet_size}</bdi></Chip>
                </div>
                <span className="text-[13px] text-d-muted">{fmtDate(lang, l.created_at, true)}</span>
              </div>
              <div>
                <p className="text-xl font-extrabold">{l.name}</p>
                <p className="text-d-muted">{l.company}</p>
              </div>
              {l.note && <p className="whitespace-pre-wrap rounded-2xl bg-d-paper px-4 py-3.5 leading-6">{l.note}</p>}
              <a
                href={`tel:${l.phone.replace(/\s/g, "")}`}
                className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-lime font-bold text-ink"
              >
                <Phone size={18} strokeWidth={1.9} aria-hidden="true" />
                {t.leads.call}
                <span dir="ltr" className="font-medium">{l.phone}</span>
              </a>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
