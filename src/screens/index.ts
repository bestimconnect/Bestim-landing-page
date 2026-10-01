// The app screenshots. Imported (not read from /public) so every file gets a
// content-based address: replace a PNG and the new one shows at once, no stale cache.
import type { StaticImageData } from "next/image";

import arHome from "./ar/home.png";
import arVoice from "./ar/voice.png";
import arReview from "./ar/review.png";
import arReminders from "./ar/reminders.png";
import arExpenses from "./ar/expenses.png";
import arRecord from "./ar/record.png";
import arShare from "./ar/share.png";
import arVehicles from "./ar/vehicles.png";
import enHome from "./en/home.png";
import enVoice from "./en/voice.png";
import enReview from "./en/review.png";
import enReminders from "./en/reminders.png";
import enExpenses from "./en/expenses.png";
import enRecord from "./en/record.png";
import enShare from "./en/share.png";
import enVehicles from "./en/vehicles.png";

const screens = {
  ar: { home: arHome, voice: arVoice, review: arReview, reminders: arReminders, expenses: arExpenses, record: arRecord, share: arShare, vehicles: arVehicles },
  en: { home: enHome, voice: enVoice, review: enReview, reminders: enReminders, expenses: enExpenses, record: enRecord, share: enShare, vehicles: enVehicles },
};

export type ScreenName = keyof (typeof screens)["ar"];
export const screen = (lang: "ar" | "en", name: ScreenName): StaticImageData => screens[lang][name];
