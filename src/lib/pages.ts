import { site } from "./site";

// Privacy, terms, support, delete-account and about: text lives in the site_pages table (edited in /dashboard/pages).
export const pageSlugs = ["privacy", "terms", "support", "delete-account", "about"] as const;

export type SitePage = { title: string; body: string; updated: string };
export type Block = { type: "h" | "p" | "ul"; text?: string; items?: string[] };

/** The published page in one language, or null (missing, hidden, or the database is unreachable). */
export async function getPage(slug: string, lang: "ar" | "en"): Promise<SitePage | null> {
  if (!(pageSlugs as readonly string[]).includes(slug)) return null;
  try {
    const url = `${site.supabaseUrl}/rest/v1/site_pages?slug=eq.${slug}&select=title_${lang},body_${lang},updated_at`;
    const res = await fetch(url, { headers: { apikey: site.supabaseKey } });
    if (!res.ok) return null;
    const [row] = (await res.json()) as Record<string, string>[];
    return row ? { title: row[`title_${lang}`], body: row[`body_${lang}`], updated: row.updated_at.slice(0, 10) } : null;
  } catch {
    return null;
  }
}

// The page text format: "## Heading", blank-line paragraphs, "- " list lines. Same parser as the app's src/lib/pageText.ts.
export const parseBody = (body: string): Block[] =>
  body.split(/\n\s*\n/).flatMap((chunk): Block[] => {
    const text = chunk.trim();
    if (!text) return [];
    if (text.startsWith("## ")) {
      const [head, ...rest] = text.split("\n");
      return [{ type: "h", text: head.slice(3).trim() }, ...parseBody(rest.join("\n"))];
    }
    const lines = text.split("\n");
    return lines.every((l) => l.startsWith("- ")) ? [{ type: "ul", items: lines.map((l) => l.slice(2).trim()) }] : [{ type: "p", text }];
  });
