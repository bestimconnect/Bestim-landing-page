import { Card } from "./ui";

// Charts drawn by us, no library. Text is always a solid colour. Bars and columns are plain boxes so they
// mirror by themselves in right-to-left; the donut is symmetric. Every chart also prints its numbers.
type Row = { label: string; n: number };
const COLORS = ["#ac2846", "#f96a83", "#e0a526", "#08736f"];

export function Bars({ title, rows, empty }: { title: string; rows: Row[]; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  const none = rows.every((r) => r.n === 0);
  return (
    <Card>
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      {none ? (
        <p className="text-d-muted">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {rows.map((r) => (
            <li key={r.label} className="grid grid-cols-[minmax(6rem,9rem)_1fr_2.5rem] items-center gap-3 text-sm">
              <span className="truncate">{r.label}</span>
              <span aria-hidden="true" className="h-3 rounded-full bg-d-paper">
                <span className="block h-full rounded-full bg-d-teal" style={{ width: `${(r.n / max) * 100}%` }} />
              </span>
              <span className="text-end font-bold tabular-nums">{r.n}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function Donut({ title, rows, empty }: { title: string; rows: Row[]; empty: string }) {
  const total = rows.reduce((s, r) => s + r.n, 0);
  const R = 44;
  const C = 2 * Math.PI * R;
  const starts = rows.map((_, i) => rows.slice(0, i).reduce((s, r) => s + (r.n / total) * C, 0));
  return (
    <Card>
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      {total === 0 ? (
        <p className="text-d-muted">{empty}</p>
      ) : (
        <div className="flex flex-wrap items-center gap-6">
          <svg viewBox="0 0 120 120" role="img" aria-label={`${title}: ${rows.map((r) => `${r.label} ${r.n}`).join(", ")}`} className="size-36 shrink-0">
            {rows.map((r, i) => {
              const len = (r.n / total) * C;
              return r.n > 0 && (
                <circle key={r.label} cx="60" cy="60" r={R} fill="none" stroke={COLORS[i % COLORS.length]} strokeWidth="16"
                  strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-starts[i]} transform="rotate(-90 60 60)" />
              );
            })}
            <text x="60" y="68" textAnchor="middle" className="fill-d-ink text-[26px] font-extrabold">{total}</text>
          </svg>
          <ul className="flex flex-col gap-2 text-sm">
            {rows.map((r, i) => (
              <li key={r.label} className="flex items-center gap-2.5">
                <span aria-hidden="true" className="size-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span>{r.label}</span>
                <span className="font-bold tabular-nums">{r.n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

// Eight columns, newest last (so the newest sits at the end side in both directions). Two boxes per week.
export function Weekly({ title, weeks, labels, empty }: {
  title: string; weeks: { week: string; created: number; closed: number }[];
  labels: { created: string; closed: string; week: string }; empty: string;
}) {
  const max = Math.max(1, ...weeks.flatMap((w) => [w.created, w.closed]));
  const none = weeks.every((w) => w.created === 0 && w.closed === 0);
  const h = (n: number) => `${n === 0 ? 0 : Math.max(4, (n / max) * 100)}%`;
  const day = (w: string) => `${w.slice(8, 10)}/${w.slice(5, 7)}`;
  return (
    <Card>
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      {none ? (
        <p className="text-d-muted">{empty}</p>
      ) : (
        <>
          <div aria-hidden="true" className="grid h-44 grid-cols-8 gap-2">
            {weeks.map((w) => (
              <div key={w.week} className="flex min-w-0 flex-col">
                <div className="flex flex-1 items-end justify-center gap-1">
                  <span className="w-1/3 rounded-t-md bg-d-teal" style={{ height: h(w.created) }} />
                  <span className="w-1/3 rounded-t-md bg-[#f96a83]" style={{ height: h(w.closed) }} />
                </div>
                <bdi className="mt-2 text-center text-xs text-d-muted">{day(w.week)}</bdi>
              </div>
            ))}
          </div>
          <p className="mt-4 flex gap-5 text-sm">
            <span className="flex items-center gap-2"><span aria-hidden="true" className="size-3 rounded-full bg-d-teal" />{labels.created}</span>
            <span className="flex items-center gap-2"><span aria-hidden="true" className="size-3 rounded-full bg-[#f96a83]" />{labels.closed}</span>
          </p>
          <table className="sr-only">
            <caption>{title}</caption>
            <thead><tr><th>{labels.week}</th><th>{labels.created}</th><th>{labels.closed}</th></tr></thead>
            <tbody>
              {weeks.map((w) => (
                <tr key={w.week}><td>{day(w.week)}</td><td>{w.created}</td><td>{w.closed}</td></tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </Card>
  );
}
