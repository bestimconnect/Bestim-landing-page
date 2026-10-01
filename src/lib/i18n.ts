import { site } from "./site";

const dictionaries = {
  ar: () => import("@/dictionaries/ar.json").then((m) => m.default),
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
};

export type Locale = keyof typeof dictionaries;
export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["ar"]>>;

// Arabic first: it is the default language everywhere.
export const locales = Object.keys(dictionaries) as Locale[];
export const hasLocale = (l: string): l is Locale => l in dictionaries;
export const getDictionary = (l: Locale): Promise<Dictionary> => dictionaries[l]();
export const dirOf = (l: Locale) => (l === "ar" ? "rtl" : "ltr");

// Canonical + hreflang links for a page. `path` is "" for home or "/privacy" etc.
export const alternates = (lang: Locale, path = "") => ({
  canonical: `${site.url}/${lang}${path}`,
  languages: {
    ar: `${site.url}/ar${path}`,
    en: `${site.url}/en${path}`,
    "x-default": `${site.url}/ar${path}`,
  },
});
