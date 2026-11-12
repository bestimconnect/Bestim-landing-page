import { site } from "@/lib/site";

// Pictures live in the public "catalog" bucket; the tables store only the path inside it.
export const imageUrl = (path: string | null | undefined) =>
  path ? `${site.supabaseUrl}/storage/v1/object/public/catalog/${path}` : null;

// Owner, admin and content editors may change the catalog (the database checks again). Support and viewer only look.
export const canEdit = (role: string) => ["owner", "admin", "content"].includes(role);

export const TYPE_IDS = ["sedan", "hatchback", "suv", "coupe", "sports", "convertible", "pickup", "van"];
export const IMAGE_TYPES: Record<string, string> = { "image/png": "png", "image/webp": "webp", "image/jpeg": "jpg" };
export const MAX_IMAGE = 2 * 1024 * 1024;
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type VType = { id: string; name_ar: string; name_en: string; sort: number; is_active: boolean; image_path: string | null };

// Builds "/dashboard/cars?brand=…&modal=…", skipping empty values.
export const link = (path: string, params: Record<string, string | undefined>) => {
  const q = new URLSearchParams(Object.entries(params).filter((e): e is [string, string] => !!e[1]));
  return q.size ? `${path}?${q}` : path;
};

// The one-string param helper for searchParams.
export const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

// Plans are money-adjacent: only owner and admin edit them (the database checks again).
export const canEditPlans = (role: string) => ["owner", "admin"].includes(role);
