// The fixed list of things a plan can limit or switch on. Mirrors the keys in the database (plans.entitlements)
// and in the app. Labels live in the dictionaries under plans.ent.<key>.
// live = the app/database already honours it. The rest are switches only: the app has nothing behind them yet, so they
// are saved but not shown to users (decisions Q121). Add a key here and in the app (src/lib/entitlements.ts) when its feature is built.
export const ENTITLEMENTS = [
  { key: "max_cars", kind: "number", group: "limits", live: true },
  { key: "max_logs", kind: "number", group: "limits", live: true },
  { key: "voice_per_day", kind: "number", group: "limits", live: true },
  { key: "scans_per_day", kind: "number", group: "limits", live: true },
  { key: "receipt_photos", kind: "boolean", group: "features", live: true },
  { key: "share_history", kind: "boolean", group: "features", live: true },
  { key: "export", kind: "boolean", group: "features", live: true },
  { key: "widgets", kind: "boolean", group: "features", live: true },
  { key: "year_insights", kind: "boolean", group: "coming", live: false },
  { key: "custom_reminders", kind: "boolean", group: "coming", live: false },
  { key: "sale_report", kind: "boolean", group: "coming", live: false },
  { key: "family_garage", kind: "boolean", group: "coming", live: false },
  { key: "priority_support", kind: "boolean", group: "coming", live: false },
] as const;

export const GROUPS = ["limits", "features", "coming"] as const;
export const MAX_PLANS = 3;
export const PLAN_ID = /^[a-z][a-z0-9_]{1,19}$/;
