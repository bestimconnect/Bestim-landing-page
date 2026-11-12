import type { MetadataRoute } from "next";
import { alternates, locales } from "@/lib/i18n";
import { pageSlugs } from "@/lib/pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", ...pageSlugs.map((slug) => `/${slug}`)];
  return paths.flatMap((path) =>
    locales.map((lang) => {
      const { canonical, languages } = alternates(lang, path);
      return { url: canonical, alternates: { languages } };
    }),
  );
}
