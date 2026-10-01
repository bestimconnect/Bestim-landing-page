import type { MetadataRoute } from "next";
import { legalSlugs } from "@/content/legal";
import { alternates, locales } from "@/lib/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", ...legalSlugs.map((slug) => `/${slug}`)];
  return paths.flatMap((path) =>
    locales.map((lang) => {
      const { canonical, languages } = alternates(lang, path);
      return { url: canonical, alternates: { languages } };
    }),
  );
}
