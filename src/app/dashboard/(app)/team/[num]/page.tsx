import { FileText, Paperclip } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { one } from "@/dashboard/catalog";
import { fmtDate, getDash } from "@/dashboard/i18n";
import { Modal } from "@/dashboard/Modal";
import { requireAdmin } from "@/dashboard/session";
import { addComment, addFile } from "@/dashboard/team-actions";
import { call, tone, type TeamDetail } from "@/dashboard/team";
import { ErrorBanner, StatusMenu, Unavailable } from "@/dashboard/TeamBoard";
import { ItemForm, textarea } from "@/dashboard/TeamForm";
import { btnLime, btnSmall, Card, Chip, PageTitle } from "@/dashboard/ui";

export default async function TeamItemPage({ params, searchParams }: PageProps<"/dashboard/team/[num]">) {
  const { supabase } = await requireAdmin();
  const { t, lang } = await getDash();
  const { num } = await params;
  if (!/^\d{1,9}$/.test(num)) notFound();
  const sp = await searchParams;
  const here = `/dashboard/team/${num}`;
  const v = t.team.v as Record<string, string>;
  const f = t.team.f;
  const I = t.team.item;
  const res = await call<TeamDetail | { error: string }>(supabase, "team_get", { p_num: Number(num) });
  if (res.data && "error" in res.data) notFound();
  if (!res.data) return <Unavailable text={t.team.unavailable} />;
  const d = res.data;
  const it = d.item;
  const paths = d.files.map((x) => x.path);
  const { data: signed } = paths.length ? await supabase.storage.from("team-files").createSignedUrls(paths, 3600) : { data: [] };
  const url = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));
  const lab = (x: string | null | undefined) => (x ? (v[x] ?? x) : "");
  const fields = (
    it.kind === "bug"
      ? [[f.platform, lab(it.platform)], [f.area, lab(it.area)], [f.build, it.build ?? ""], [f.screen, it.screen ?? ""], [f.reportedBy, it.reported_by_name ?? ""]]
      : [[f.owner, lab(it.owner)], [f.area, lab(it.area)], [f.taskType, it.task_type ?? ""], [f.dueDate, it.due_date ? fmtDate(lang, it.due_date) : ""]]
  ).filter(([, x]) => x) as [string, string][];
  const longs: [string, string | null][] = it.kind === "bug"
    ? [[f.steps, it.steps], [f.expected, it.expected], [f.actual, it.actual]]
    : [[f.details, it.details]];
  const sev = it.kind === "bug" ? it.severity : it.priority;
  const ref = (r: { num: number; title: string; status: string }) => (
    <li key={r.num} className="flex flex-wrap items-center justify-between gap-2 py-1.5">
      <Link href={`/dashboard/team/${r.num}`} className="font-semibold hover:underline"><bdi className="me-1.5 text-d-muted">#{r.num}</bdi>{r.title}</Link>
      <Chip tone={tone(r.status)}>{lab(r.status)}</Chip>
    </li>
  );
  const act = (a: TeamDetail["activity"][number]) =>
    (I.act as Record<string, string>)[a.action]
      ?.replace("{from}", lab(a.detail?.from)).replace("{to}", lab(a.detail?.to ?? a.detail?.status)) ?? a.action;
  const h2 = "mb-3 text-lg font-bold";

  return (
    <>
      <PageTitle sub={<bdi>#{it.num}{it.legacy_ref ? ` · ${it.legacy_ref}` : ""}</bdi>}>{it.title}</PageTitle>
      <ErrorBanner code={one(sp.err)} errs={t.team.err as Record<string, string>} />
      {one(sp.edit) === "1" && (
        <Modal title={it.kind === "bug" ? t.team.form.editBug : t.team.form.editTask} closeHref={here} closeLabel={t.team.form.cancel}>
          <ItemForm kind={it.kind} item={it} t={t} here={`${here}?edit=1`} cancel={here} err={one(sp.err)} />
        </Modal>
      )}
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Chip tone={tone(it.status)}>{lab(it.status)}</Chip>
              {sev && <Chip tone={tone(sev)}>{lab(sev)}</Chip>}
              <Link href={`${here}?edit=1`} className={`${btnSmall} ms-auto`}>{I.edit}</Link>
            </div>
            {fields.length > 0 && (
              <dl className="mb-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {fields.map(([k, x]) => (
                  <div key={k}><dt className="text-xs font-semibold text-d-muted">{k}</dt><dd>{x}</dd></div>
                ))}
              </dl>
            )}
            {longs.filter(([, x]) => x).map(([k, x]) => (
              <div key={k} className="mb-4 last:mb-0">
                <h2 className="mb-1 text-xs font-semibold text-d-muted">{k}</h2>
                <p className="whitespace-pre-wrap rounded-2xl bg-d-paper px-4 py-3 leading-6">{x}</p>
              </div>
            ))}
            {(d.linked || d.linked_from.length > 0) && (
              <div className="mt-4 border-t border-d-line pt-3">
                <h2 className="mb-1 text-xs font-semibold text-d-muted">{d.linked ? I.linkedTask : I.linkedBugs}</h2>
                <ul>{d.linked ? ref(d.linked) : d.linked_from.map(ref)}</ul>
              </div>
            )}
          </Card>

          <Card>
            <h2 className={h2}>{I.comments}</h2>
            {d.comments.length === 0 ? <p className="mb-4 text-d-muted">{I.noComments}</p> : (
              <ul className="mb-4 flex flex-col gap-3">
                {d.comments.map((c) => (
                  <li key={c.id} className="rounded-2xl bg-d-paper px-4 py-3">
                    <p className="mb-1 text-xs text-d-muted">
                      <b className="text-d-ink">{c.author ?? "—"}</b> · {fmtDate(lang, c.at, true)}{c.via === "mcp" && ` · ${I.viaClaude}`}
                    </p>
                    <p className="whitespace-pre-wrap leading-6">{c.body}</p>
                  </li>
                ))}
              </ul>
            )}
            <form action={addComment} className="flex flex-col gap-2.5">
              <input type="hidden" name="num" value={it.num} />
              <input type="hidden" name="here" value={here} />
              <textarea name="body" rows={3} maxLength={5000} required placeholder={I.commentPh} aria-label={I.commentPh} className={textarea} />
              <button type="submit" className={`${btnLime} self-start`}>{I.post}</button>
            </form>
          </Card>

          <Card>
            <h2 className={h2}>{I.files}</h2>
            {d.files.length === 0 ? <p className="mb-4 text-d-muted">{I.noFiles}</p> : (
              <ul className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {d.files.map((x) => {
                  const href = url.get(x.path);
                  const body = x.mime.startsWith("image/") && href ? (
                    // Signed Storage links: Next's image optimiser isn't needed (same as the catalog pictures).
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={href} alt="" loading="lazy" className="h-32 w-full rounded-2xl border border-d-line object-cover" />
                  ) : (
                    <span className="flex h-32 flex-col items-center justify-center gap-1.5 rounded-2xl border border-d-line bg-d-paper text-sm font-semibold">
                      <FileText size={26} aria-hidden="true" />{x.mime.split("/")[1]}
                    </span>
                  );
                  return <li key={x.id}>{href ? <a href={href} target="_blank" rel="noreferrer">{body}</a> : body}</li>;
                })}
              </ul>
            )}
            <form action={addFile} className="flex flex-wrap items-center gap-2.5">
              <input type="hidden" name="num" value={it.num} />
              <input type="hidden" name="here" value={here} />
              <input type="file" name="file" required accept="image/png,image/jpeg,image/webp,image/heic,video/mp4,video/quicktime,application/pdf" aria-label={I.files}
                className="min-w-0 flex-1 text-xs file:me-2 file:rounded-full file:border-0 file:bg-d-mint file:px-3 file:py-1.5 file:text-xs file:font-semibold" />
              <button type="submit" className={`${btnSmall} gap-2`}><Paperclip size={16} aria-hidden="true" />{I.upload}</button>
            </form>
            <p className="mt-2 text-xs text-d-muted">{I.fileHint}</p>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <h2 className={h2}>{I.status}</h2>
            <StatusMenu num={it.num} kind={it.kind} status={it.status} back={here} />
            <dl className="mt-4 flex flex-col gap-2 text-sm">
              {([[f.createdBy, it.created_by_name ?? "—"], [f.created, fmtDate(lang, it.created_at, true)], [f.updated, fmtDate(lang, it.updated_at, true)], ...(it.closed_at ? [[f.closed, fmtDate(lang, it.closed_at, true)]] : [])] as [string, string][]).map(([k, x]) => (
                <div key={k} className="flex justify-between gap-3"><dt className="text-d-muted">{k}</dt><dd className="text-end">{x}</dd></div>
              ))}
            </dl>
          </Card>
          <Card>
            <h2 className={h2}>{I.activity}</h2>
            <ol className="flex flex-col gap-3 text-sm">
              {d.activity.map((a, i) => (
                <li key={i} className="border-s-2 border-d-line ps-3">
                  <p>{act(a)}</p>
                  <p className="text-xs text-d-muted">{a.actor ?? "—"} · {fmtDate(lang, a.at, true)}{a.via === "mcp" && ` · ${I.viaClaude}`}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </>
  );
}
