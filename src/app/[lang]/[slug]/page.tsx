import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { legal, legalSlugs, type LegalSlug } from "@/content/legal";
import { alternates, getDictionary, hasLocale } from "@/lib/i18n";
import { site } from "@/lib/site";

// Privacy, terms, support and delete-account: one template, text in src/content/legal.ts.
export const dynamicParams = false;
export const generateStaticParams = () => legalSlugs.map((slug) => ({ slug }));

const isSlug = (s: string): s is LegalSlug => (legalSlugs as readonly string[]).includes(s);

export async function generateMetadata({ params }: PageProps<"/[lang]/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang) || !isSlug(slug)) return {};
  const doc = legal[slug][lang];
  return { title: doc.title, description: doc.description, alternates: alternates(lang, `/${slug}`) };
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
  if (!hasLocale(lang) || !isSlug(slug)) notFound();
  const doc = legal[slug][lang];
  const dict = await getDictionary(lang);
  return (
    <article className="mx-auto max-w-3xl px-4 pt-36 pb-16 md:pt-44">
      <h1 className="text-4xl leading-[1.25] font-bold md:text-5xl">{doc.title}</h1>
      <p className="mt-3 text-sm text-muted">
        {dict.footer.updated}: <span dir="ltr">{doc.updated}</span>
      </p>
      <p className="mt-8 text-lg leading-8 text-muted">
        <Text>{doc.intro}</Text>
      </p>
      {doc.sections.map((section) => (
        <section key={section.heading} className="mt-10">
          <h2 className="text-2xl font-semibold">{section.heading}</h2>
          {section.body?.map((p) => (
            <p key={p} className="mt-3 leading-8 text-muted">
              <Text>{p}</Text>
            </p>
          ))}
          {section.list && (
            <ul
              // Steps that already start with "1." don't get a bullet as well.
              className={`mt-3 space-y-2 leading-8 text-muted marker:text-teal ${
                /^\d/.test(section.list[0]) ? "" : "list-disc ps-6"
              }`}
            >
              {section.list.map((item) => (
                <li key={item}>
                  <Text>{item}</Text>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </article>
  );
}
