import { Check } from "lucide-react";
import { SubmitButton } from "@/dashboard/Pending";
import { call } from "@/dashboard/team";
import { revokeKey } from "@/dashboard/team-actions";
import { KeyMaker } from "@/dashboard/TeamKeys";
import { getDash } from "@/dashboard/i18n";
import { requireAdmin } from "@/dashboard/session";
import { btnSmall, Card, PageTitle } from "@/dashboard/ui";
import { site } from "@/lib/site";

export default async function ConnectPage() {
  const { supabase } = await requireAdmin();
  const keys = (await call<{ id: string; label: string; last_used_at: string | null; revoked_at: string | null }[]>(supabase, "team_key_list")).data ?? [];
  const { t } = await getDash();
  const c = t.team.connect;
  const url = `${site.supabaseUrl}/functions/v1/team-mcp`;
  const groups: [string, string[]][] = [[c.desktop, c.stepsDesktop], [c.web, c.stepsWeb], [c.code, c.stepsCode]];
  return (
    <>
      <PageTitle>{c.title}</PageTitle>
      <p className="mb-5 max-w-3xl leading-7">{c.intro}</p>
      <Card className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-d-muted">{c.urlLabel}</h2>
        <p dir="ltr" className="select-all break-all rounded-2xl bg-d-paper px-4 py-3 text-start font-mono text-sm">{url}</p>
      </Card>
      <Card className="mb-6">
        <h2 className="mb-2 text-lg font-bold">{c.keyTitle}</h2>
        <p className="mb-4 max-w-3xl text-sm leading-6 text-d-muted">{c.keyHelp}</p>
        <KeyMaker url={url} t={{ label: c.keyLabel, def: c.keyDefault, make: c.keyMake, fresh: c.keyNew, full: c.keyFull, error: c.keyError }} />
        <ul className="mt-5 flex flex-col gap-2">
          {keys.length === 0 && <li className="text-sm text-d-muted">{c.keyNone}</li>}
          {keys.map((k) => (
            <li key={k.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-d-line pt-2">
              <span className="font-semibold">{k.label}</span>
              <span className="text-sm text-d-muted">{k.revoked_at ? c.keyRevoked : `${c.keyUsed}: ${k.last_used_at ? k.last_used_at.slice(0, 10) : c.keyNever}`}</span>
              {!k.revoked_at && <form action={revokeKey}><input type="hidden" name="id" value={k.id} /><SubmitButton className={btnSmall}>{c.keyRevoke}</SubmitButton></form>}
            </li>
          ))}
        </ul>
      </Card>
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        {groups.map(([title, steps]) => (
          <Card key={title}>
            <h2 className="mb-3 text-lg font-bold">{title}</h2>
            <ol className="flex list-decimal flex-col gap-2 ps-5 leading-6">{steps.map((s) => <li key={s}>{s}</li>)}</ol>
          </Card>
        ))}
      </div>
      <Card>
        <h2 className="mb-3 text-lg font-bold">{c.can}</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {c.abilities.map((a) => (
            <li key={a} className="flex items-start gap-2.5"><Check size={18} aria-hidden="true" className="mt-1 shrink-0 text-d-teal" />{a}</li>
          ))}
        </ul>
      </Card>
    </>
  );
}
