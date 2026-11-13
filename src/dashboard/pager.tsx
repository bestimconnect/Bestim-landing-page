import { link } from "./catalog";
import { fmtNum, getDash } from "./i18n";
import { PendingLink } from "./Pending";

export const PAGE_SIZE = 25;
export const SIZES = [25, 50, 100];
// ?size=50 -> 50; only the offered sizes are accepted.
export const sizeOf = (v: string | string[] | undefined) => {
  const n = parseInt(typeof v === "string" ? v : "", 10);
  return SIZES.includes(n) ? n : PAGE_SIZE;
};

// ?page=3 -> 3. Anything odd (empty, 0, "abc", huge) falls back to a sane value.
export const pageOf = (v: string | string[] | undefined) => {
  const n = parseInt(typeof v === "string" ? v : "", 10);
  return Number.isFinite(n) && n >= 1 && n <= 100000 ? n : 1;
};

// 1 ... 4 5 6 ... 20
const numbers = (page: number, last: number) => {
  const set = new Set([1, last, page - 1, page, page + 1]);
  const list = [...set].filter((n) => n >= 1 && n <= last).sort((a, b) => a - b);
  return list.flatMap((n, i) => (i > 0 && n - list[i - 1] > 1 ? ["…", n] : [n]));
};

const pill = "inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-semibold";

// Prev / numbered pages / Next and "Showing 26-50 of 312". Keeps every other URL parameter (search, tab, filters).
// `capped`: the total was counted only up to a limit, so it is shown as "10,000+".
export async function Pager({ page, total, size = PAGE_SIZE, base, params = {}, capped, pageKey = "page" }: {
  page: number; total: number; size?: number; base: string; params?: Record<string, string | undefined>; capped?: boolean; pageKey?: string;
}) {
  const { t } = await getDash();
  const P = t.pager;
  const last = Math.max(1, Math.ceil(total / size));
  const none = total <= 0;
  const cur = Math.min(page, last);
  const sz = (n: number) => (n !== PAGE_SIZE ? String(n) : undefined);
  const href = (n: number) => link(base, { ...params, size: sz(size), [pageKey]: n > 1 ? String(n) : undefined });
  const from = none ? 0 : (cur - 1) * size + 1;
  const to = Math.min(cur * size, total);
  const totalText = `${fmtNum(total)}${capped ? "+" : ""}`;
  return (
    <nav aria-label={P.label} className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
      <span className="text-d-muted">{P.showing.replace("{from}", fmtNum(from)).replace("{to}", fmtNum(to)).replace("{total}", totalText)}</span>
      <span className="flex flex-wrap items-center gap-1.5">
        {(
          <span className="me-3 flex items-center gap-1" role="group" aria-label={P.perPage}>
            <span className="me-1 text-d-muted">{P.perPage}</span>
            {SIZES.map((n) => (
              <PendingLink key={n} href={link(base, { ...params, size: sz(n) })} spinner={false} aria-current={n === size ? "true" : undefined}
                className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2.5 text-xs font-semibold ${n === size ? "bg-ink text-white" : "border border-d-line bg-d-card"}`}>
                {fmtNum(n)}
              </PendingLink>
            ))}
          </span>
        )}
        {(<>
          {cur > 1 ? <PendingLink href={href(cur - 1)} className={`${pill} border border-d-line bg-d-card`}>{P.prev}</PendingLink> : <span aria-disabled="true" className={`${pill} border border-d-line bg-d-card opacity-40`}>{P.prev}</span>}
          {numbers(cur, last).map((n, i) =>
            n === "…" ? (
              <span key={`gap${i}`} aria-hidden="true" className="px-1 text-d-muted">…</span>
            ) : (
              <PendingLink
                key={n}
                href={href(n as number)}
                spinner={false}
                aria-current={n === cur ? "page" : undefined}
                className={`${pill} ${n === cur ? "bg-lime text-ink shadow-glow" : "border border-d-line bg-d-card"}`}
              >
                {fmtNum(n as number)}
              </PendingLink>
            ),
          )}
          {cur < last ? <PendingLink href={href(cur + 1)} className={`${pill} border border-d-line bg-d-card`}>{P.next}</PendingLink> : <span aria-disabled="true" className={`${pill} border border-d-line bg-d-card opacity-40`}>{P.next}</span>}
        </>)}
      </span>
    </nav>
  );
}
