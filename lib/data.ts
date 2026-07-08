import { cache } from "react";
import { createSupabaseAdminClient, createSupabaseServerClient, isAdminEmail, isConfigured } from "@/lib/supabase";

export type PropertySummary = {
  id: string;
  address_line_1: string;
  address_line_2?: string | null;
  city?: string | null;
  postcode: string;
  created_at: string;
  average_rating: number | null;
  review_count: number;
  issue_count: number;
  last_activity: string | null;
};

export const getCurrentUser = cache(async () => {
  if (!isConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
});

export async function searchProperties(query = "") {
  if (!isConfigured()) return [] as PropertySummary[];
  const supabase = createSupabaseAdminClient();
  let builder = supabase.from("property_summary").select("*").order("last_activity", { ascending: false, nullsFirst: false }).limit(20);
  if (query.trim()) {
    const term = `%${query.trim()}%`;
    builder = builder.or(`address_line_1.ilike.${term},postcode.ilike.${term},city.ilike.${term}`);
  }
  const { data, error } = await builder;
  if (error) throw error;
  return data ?? [];
}

export async function getProperty(id: string) {
  if (!isConfigured()) return null;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("property_summary").select("*").eq("id", id).single();
  if (error) return null;
  return data as PropertySummary;
}

export async function getPropertyDetail(id: string) {
  if (!isConfigured()) return { property: null, reviews: [], issues: [], claims: [] };
  const supabase = createSupabaseAdminClient();
  const [property, reviews, issues, claims] = await Promise.all([
    supabase.from("property_summary").select("*").eq("id", id).single(),
    supabase.from("reviews").select("*").eq("property_id", id).eq("moderation_status", "approved").order("created_at", { ascending: false }),
    supabase.from("maintenance_issues").select("*").eq("property_id", id).eq("moderation_status", "approved").order("created_at", { ascending: false }),
    supabase.from("property_claims").select("*").eq("property_id", id).order("created_at", { ascending: false })
  ]);
  return {
    property: property.data,
    reviews: reviews.data ?? [],
    issues: issues.data ?? [],
    claims: claims.data ?? []
  };
}

export async function getDashboardData() {
  const user = await getCurrentUser();
  if (!user || !isConfigured()) return { user, reviews: [], issues: [], claims: [], propertyIds: new Set<string>() };
  const supabase = await createSupabaseServerClient();
  const [reviews, issues, claims] = await Promise.all([
    supabase.from("reviews").select("id, property_id, created_at, overall_rating").eq("user_id", user.id),
    supabase.from("maintenance_issues").select("id, property_id, created_at, issue_type, status").eq("user_id", user.id),
    supabase.from("property_claims").select("id, property_id, created_at, claim_status").eq("user_id", user.id)
  ]);
  const propertyIds = new Set<string>([
    ...(reviews.data ?? []).map((item) => item.property_id),
    ...(issues.data ?? []).map((item) => item.property_id),
    ...(claims.data ?? []).map((item) => item.property_id)
  ]);
  return { user, reviews: reviews.data ?? [], issues: issues.data ?? [], claims: claims.data ?? [], propertyIds };
}

export async function getAdminData() {
  const user = await getCurrentUser();
  if (!user || !isAdminEmail(user.email)) return { allowed: false };
  const supabase = createSupabaseAdminClient();
  const [properties, reviews, issues, claims, intakes] = await Promise.all([
    supabase.from("properties").select("id", { count: "exact", head: true }),
    supabase.from("reviews").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(8),
    supabase.from("maintenance_issues").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(8),
    supabase.from("property_claims").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(8),
    supabase.from("property_manager_intake").select("id", { count: "exact", head: true })
  ]);
  return {
    allowed: true,
    counts: {
      properties: properties.count ?? 0,
      reviews: reviews.count ?? 0,
      issues: issues.count ?? 0,
      claims: claims.count ?? 0,
      intakes: intakes.count ?? 0
    },
    recentReviews: reviews.data ?? [],
    recentIssues: issues.data ?? [],
    pendingClaims: (claims.data ?? []).filter((claim) => claim.claim_status === "pending")
  };
}
