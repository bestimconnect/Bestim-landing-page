import { site } from "./site";

// The plan cards read the active plans straight from the database (anon can read active plans; edited in /dashboard/plans).
export type PlanRow = {
  id: string; name_ar: string; name_en: string; desc_ar: string; desc_en: string; is_popular: boolean;
  price_monthly: number | null; price_yearly: number | null; entitlements: Record<string, number | boolean | null>;
};

/** Active plans, cheapest first. Empty when the table isn't there yet or the database is unreachable: the section then hides. */
export async function getPlans(): Promise<PlanRow[]> {
  try {
    const url = `${site.supabaseUrl}/rest/v1/plans?is_active=eq.true&order=sort&select=id,name_ar,name_en,desc_ar,desc_en,is_popular,price_monthly,price_yearly,entitlements`;
    const res = await fetch(url, { headers: { apikey: site.supabaseKey }, next: { revalidate: 300 } });
    if (!res.ok) return [];
    const rows = (await res.json()) as PlanRow[];
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

const LIMITS = ["max_cars", "max_logs", "voice_per_day", "scans_per_day"] as const;
// Only features the app already has: the proposed switches in the dashboard stay off the website until they are built.
const FEATURES = ["receipt_photos", "share_history", "export", "widgets"] as const;

/** What a plan adds over the one before it (every line for the first plan). */
export function planLines(t: { limit: Record<string, string>; feature: Record<string, string>; unlimited: string }, p: PlanRow, prev?: PlanRow) {
  const lines: string[] = [];
  for (const k of LIMITS) {
    const v = (p.entitlements[k] as number | null | undefined) ?? null;
    const pv = prev ? ((prev.entitlements[k] as number | null | undefined) ?? null) : undefined;
    if (pv === undefined || (pv !== null && (v === null || v > pv))) lines.push(`${t.limit[k]}: ${v ?? t.unlimited}`);
  }
  for (const f of FEATURES) if (p.entitlements[f] === true && prev?.entitlements[f] !== true) lines.push(t.feature[f]);
  return lines;
}
