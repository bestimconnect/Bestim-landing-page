// Shapes returned by the admin functions in bestim-app/supabase/migrations/20261022090000_admin_foundation.sql.
export type Overview = {
  users: number;
  users_7d: number;
  users_30d: number;
  vehicles: number;
  logs: number;
  logs_7d: number;
  logs_voice: number;
  logs_manual: number;
  voice_7d: number;
  scan_7d: number;
  ai_failed_7d: number;
  leads: number;
  leads_7d: number;
};

export type UserRow = {
  id: string;
  email: string | null;
  full_name: string;
  created_at: string;
  last_sign_in_at: string | null;
  vehicles: number;
  logs: number;
  plan_id: string | null;
  suspended: boolean;
  admin_role: string | null;
  total: number;
};

export type AdminRow = {
  user_id: string;
  email: string | null;
  full_name: string;
  role: string;
  team_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
};

export type UserDetail = {
  id: string;
  email: string | null;
  full_name: string;
  language: string;
  created_at: string;
  last_sign_in_at: string | null;
  provider: string | null;
  logs_voice: number;
  logs_manual: number;
  corrections: number;
  vehicles: { make: string; model: string; year: number | null; odometer: number | null; unit: string; primary: boolean }[];
  recent_logs: { title: string; service_date: string; cost: number | null; currency: string; source: string; status: string }[];
  ai_days: { day: string; count: number; scans: number }[];
  plan_id: string | null;
  plan_source: string | null;
  plan_expires_at: string | null;
};

export type Plan = {
  id: string;
  name_ar: string;
  name_en: string;
  desc_ar: string;
  desc_en: string;
  sort: number;
  is_active: boolean;
  is_default: boolean;
  is_popular: boolean;
  price_monthly: number | null;
  price_yearly: number | null;
  trial_days: number;
  entitlements: Record<string, number | boolean | null>;
};

export type FeatureLock = { id: string; hidden: boolean; msg_ar: string; msg_en: string };

export type SitePage = {
  slug: string;
  sort: number;
  title_ar: string;
  title_en: string;
  body_ar: string;
  body_en: string;
  is_published: boolean;
  updated_at: string;
};
