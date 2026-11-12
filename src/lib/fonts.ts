import { Poppins, Tajawal } from "next/font/google";

// The font stack itself is in globals.css (--font-sans); these calls load the files.
// Shared by the website layout ([lang]) and the dashboard layout.
export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});
export const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
});
