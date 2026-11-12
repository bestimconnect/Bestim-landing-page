import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { alternates, getDictionary, hasLocale } from "@/lib/i18n";
import { getPage, parseBody } from "@/lib/pages";
import { site } from "@/lib/site";

// Privacy, terms, support, delete-account, about: one template, text from the site_pages table (the dashboard's Pages editor).
// Pages are built on first visit and refreshed hourly; saving in the dashboard refreshes them at once.
export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/[lang]/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const page = await getPage(slug, lang);
  if (!page) return {};
  const first = parseBody(page.body).find((b) => b.type === "p")?.text ?? "";
  return { title: page.title, description: first.slice(0, 160), alternates: alternates(lang, `/${slug}`) };
}

// Turns the support email inside a paragraph into a clickable link.
function Text({ children }: { children: string }) {
  const parts = children.split(site.email);
  return parts.map((part, i) => (
    <span key={i}>
      {part}
      {i < parts.length - 1 && (
        <a href={`mailto:${site.email}`} dir="ltr" className="font-medium text-teal underline">
          {site.email}
        </a>
      )}
    </span>
  ));
}

export default async function LegalPage({ params }: PageProps<"/[lang]/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const page = await getPage(slug, lang);
  if (!page) notFound();
  const dict = await getDictionary(lang);
  const blocks = parseBody(page.body);
  return (
    <article className="mx-auto max-w-3xl px-4 pt-36 pb-16 md:pt-44">
      <h1 className="text-4xl leading-[1.25] font-bold md:text-5xl">{page.title}</h1>
      <p className="mt-3 text-sm text-muted">
        {dict.footer.updated}: <span dir="ltr">{page.updated}</span>
      </p>
      {blocks.map((b, i) =>
        b.type === "h" ? (
          <h2 key={i} className="mt-10 text-2xl font-semibold">{b.text}</h2>
        ) : b.type === "p" ? (
          <p key={i} className="mt-3 leading-8 text-muted">
            <Text>{b.text!}</Text>
          </p>
        ) : (
          <ul
            key={i}
            // Steps that already start with "1." don't get a bullet as well.
            className={`mt-3 space-y-2 leading-8 text-muted marker:text-teal ${/^\d/.test(b.items![0]) ? "" : "list-disc ps-6"}`}
          >
            {b.items!.map((item) => (
              <li key={item}>
                <Text>{item}</Text>
              </li>
            ))}
          </ul>
        ),
      )}
    </article>
  );
}
