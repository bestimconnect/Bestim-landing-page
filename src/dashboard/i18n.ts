import { cache } from "react";
import { cookies } from "next/headers";

const dictionaries = {
  ar: () => import("@/dictionaries/dashboard.ar.json").then((m) => m.default),
  en: () => import("@/dictionaries/dashboard.en.json").then((m) => m.default),
};

export type DashLang = keyof typeof dictionaries;
export type DashDict = Awaited<ReturnType<(typeof dictionaries)["ar"]>>;

// The dashboard's language is a cookie (it has no /ar /en in its address). Arabic first.
export const getDash = cache(async () => {
  const lang: DashLang = (await cookies()).get("dash_lang")?.value === "en" ? "en" : "ar";
  return { lang, dir: lang === "ar" ? ("rtl" as const) : ("ltr" as const), t: await dictionaries[lang]() };
});

// Egypt time, Latin digits in both languages (like the app).
export const fmtDate = (lang: DashLang, iso: string | null | undefined, time = false) =>
  iso
    ? new Intl.DateTimeFormat(lang === "ar" ? "ar-EG-u-nu-latn" : "en-GB", {
        dateStyle: "medium",
        ...(time ? { timeStyle: "short" } : {}),
        timeZone: "Africa/Cairo",
      }).format(new Date(iso))
    : "—";

export const fmtNum = (n: number) => new Intl.NumberFormat("en-US").format(n);

// "Thursday, 22 October 2026" for the greeting.
export const fmtToday = (lang: DashLang) =>
  new Intl.DateTimeFormat(lang === "ar" ? "ar-EG-u-nu-latn" : "en-GB", {
    dateStyle: "full",
    timeZone: "Africa/Cairo",
  }).format(new Date());
