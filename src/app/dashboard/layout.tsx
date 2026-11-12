import type { Metadata } from "next";
import { getDash } from "@/dashboard/i18n";
import { poppins, tajawal } from "@/lib/fonts";
import "../globals.css";

// Its own root layout (the website's is under /[lang]). Private: no search engines, no preview.
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDash();
  return { title: `Bestim | ${t.meta.title}`, robots: { index: false, follow: false } };
}

export default async function DashboardRootLayout({ children }: LayoutProps<"/dashboard">) {
  const { lang, dir } = await getDash();
  return (
    <html lang={lang} dir={dir} className={`${poppins.variable} ${tajawal.variable} antialiased`}>
      <body className="dash font-sans">{children}</body>
    </html>
  );
}
