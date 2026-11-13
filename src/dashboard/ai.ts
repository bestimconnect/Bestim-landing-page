// Money for the AI costs page. The database returns token sums; this turns them into dollars with the saved prices.
export type Prices = { input: number; audio: number; output: number };
// ponytail: placeholder per-million-token prices; the owner sets the real ones from Google's price page on the AI costs page.
export const DEFAULT_PRICES: Prices = { input: 0.3, audio: 1, output: 2.5 };
// Rows logged before tokens were recorded cost this per call (decisions Q70 / Q97), as the Overview always estimated.
const FALLBACK = { voice: 0.0035, scan: 0.001 };

export type AiRow = {
  kind: "voice" | "scan"; model: string; calls: number; untracked: number;
  input_tokens: number; audio_tokens: number; output_tokens: number;
};
export type AiDay = AiRow & { day: string; failed: number };
export type AiUser = AiRow & { user_id: string | null; name: string; email: string | null };
export type AiUsage = {
  month_start: string;
  settings: { ai_budget?: number; ai_prices?: Prices; billing_account?: string };
  daily: AiDay[];
  users: AiUser[];
};

export const cost = (r: AiRow, p: Prices) =>
  (Math.max(r.input_tokens - r.audio_tokens, 0) * p.input + r.audio_tokens * p.audio + r.output_tokens * p.output) / 1e6 +
  r.untracked * FALLBACK[r.kind];

export const money = (n: number) => `$${n.toFixed(n > 0 && n < 0.1 ? 4 : 2)}`;
export const BILLING_ID = /^[0-9A-Fa-f]{6}-[0-9A-Fa-f]{6}-[0-9A-Fa-f]{6}$/;
export const payUrl = (id: string) => `https://console.cloud.google.com/billing/${id}`;
