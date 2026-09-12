"use server";
import { requireOperator } from "@/lib/studio/operator-access";
export async function searchSiteAccounts(_previous: unknown, formData: FormData) {
  const operator = await requireOperator();
  if (!operator) return { ok: false as const, error: "unauthorized" };
  const term = String(formData.get("search") ?? "").trim();
  if (term.length < 3 || term.length > 120) return { ok: false as const, error: "search_too_short" };
  const { data, error } = await operator.supabase.rpc("site_search_accounts", { search_term: term });
  return error ? { ok: false as const, error: "search_failed" } : { ok: true as const, accounts: data ?? [] };
}
