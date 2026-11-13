"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { BILLING_ID } from "./ai";
import { requireAdmin } from "./session";

const PATH = "/dashboard/ai";
const val = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

// Owner only (the database checks too). Empty budget / billing id clears them.
export async function saveAiSettings(f: FormData) {
  const { supabase, role } = await requireAdmin();
  const bad = (code: string): never => redirect(`${PATH}?modal=settings&err=${code}`);
  if (role !== "owner") bad("forbidden");
  const budget = val(f, "budget");
  const billing = val(f, "billing").toUpperCase();
  const price = (k: string) => {
    const s = val(f, k);
    return /^\d{1,4}(\.\d{1,4})?$/.test(s) ? s : bad("number");
  };
  if (budget && !/^\d{1,7}(\.\d{1,2})?$/.test(budget)) bad("number");
  if (billing && !BILLING_ID.test(billing)) bad("billing");
  const { error } = await supabase.rpc("admin_ai_settings_save", {
    p_budget: budget ? Number(budget) : null,
    p_prices: { input: price("p_input"), audio: price("p_audio"), output: price("p_output") },
    p_billing: billing || null,
  });
  if (error) bad(error.code === "42501" ? "forbidden" : "save");
  revalidatePath(PATH);
  redirect(`${PATH}?saved=1`);
}
