import type { Metadata } from "next";
import { Poppins, Tajawal } from "next/font/google";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MotionProvider } from "@/components/Motion";
import { dirOf, getDictionary, hasLocale, locales } from "@/lib/i18n";
import { site } from "@/lib/site";
import "../globals.css";

// The font stack itself is in globals.css (--font-sans); these calls load the files.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});
const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
});

// Only /ar and /en exist, and both are built ahead of time.
export const dynamicParams = false;
export const generateStaticParams = () => locales.map((lang) => ({ lang }));

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    metadataBase: new URL(site.url),
    title: { default: dict.meta.title, template: `%s | ${lang === "ar" ? "بستيم" : "Bestim"}` },
    description: dict.meta.description,
    openGraph: {
      siteName: "Bestim",
      type: "website",
      locale: lang === "ar" ? "ar_EG" : "en_US",
    },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <html lang={lang} dir={dirOf(lang)} className={`${poppins.variable} ${tajawal.variable} antialiased`}>
      <body className="font-sans">
        <MotionProvider>
          <Header lang={lang} dict={dict} />
          <main>{children}</main>
          <Footer lang={lang} dict={dict} />
        </MotionProvider>
      </body>
    </html>
  );
}
