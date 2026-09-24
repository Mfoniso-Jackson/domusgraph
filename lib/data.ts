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
  timeline_count?: number;
  claimed_count?: number;
  photo_count?: number;
  has_details?: boolean;
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
  let builder = supabase.from("property_summary").select("*").order("last_activity", { ascending: false, nullsFirst: false }).limit(24);
  if (query.trim()) {
    const term = `%${query.trim()}%`;
    builder = builder.or(`address_line_1.ilike.${term},postcode.ilike.${term},city.ilike.${term}`);
  }
  const { data, error } = await builder;
  if (error) throw error;
  return data ?? [];
}

export async function getSearchDiscovery() {
  if (!isConfigured()) return { recentSearches: [], popularProperties: [] as PropertySummary[] };
  const supabase = createSupabaseAdminClient();
  const [events, popularProperties] = await Promise.all([
    supabase.from("analytics_events").select("payload, created_at").eq("event_name", "property_search").order("created_at", { ascending: false }).limit(6),
    supabase.from("property_summary").select("*").order("timeline_count", { ascending: false, nullsFirst: false }).limit(6)
  ]);
  const recentSearches = (events.data ?? [])
    .map((event) => (event.payload as { query?: string } | null)?.query)
    .filter(Boolean) as string[];
  return { recentSearches, popularProperties: popularProperties.data ?? [] };
}

export async function getProperty(id: string) {
  if (!isConfigured()) return null;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("property_summary").select("*").eq("id", id).single();
  if (error) return null;
  return data as PropertySummary;
}

export async function getPropertyDetail(id: string) {
  if (!isConfigured()) return { property: null, reviews: [], issues: [], claims: [], events: [] };
  const supabase = createSupabaseAdminClient();
  const [property, reviews, issues, claims, events] = await Promise.all([
    supabase.from("property_summary").select("*").eq("id", id).single(),
    supabase.from("reviews").select("*").eq("property_id", id).eq("moderation_status", "approved").order("created_at", { ascending: false }),
    supabase.from("maintenance_issues").select("*").eq("property_id", id).eq("moderation_status", "approved").order("created_at", { ascending: false }),
    supabase.from("property_claims").select("*").eq("property_id", id).order("created_at", { ascending: false }),
    supabase.from("housing_events").select("*").eq("property_id", id).order("created_at", { ascending: false }).limit(30)
  ]);
  return {
    property: property.data,
    reviews: reviews.data ?? [],
    issues: issues.data ?? [],
    claims: claims.data ?? [],
    events: events.data ?? []
  };
}

export async function getDashboardData() {
  const user = await getCurrentUser();
  if (!user || !isConfigured()) return { user, reviews: [], issues: [], claims: [], propertyIds: new Set<string>(), housingEvents: [], feedback: [], referrals: [] };
  const supabase = await createSupabaseServerClient();
  const [reviews, issues, claims, housingEvents, feedback, referrals] = await Promise.all([
    supabase.from("reviews").select("id, property_id, created_at, overall_rating, verification_level").eq("user_id", user.id),
    supabase.from("maintenance_issues").select("id, property_id, created_at, issue_type, status, verification_level").eq("user_id", user.id),
    supabase.from("property_claims").select("id, property_id, created_at, claim_status").eq("user_id", user.id),
    supabase.from("housing_events").select("id, property_id, created_at, event_type, is_verified").eq("actor_id", user.id),
    supabase.from("feedback_responses").select("id, created_at, source").eq("user_id", user.id),
    supabase.from("referrals").select("id, property_id, created_at, referral_code, reputation_points_awarded").eq("created_by", user.id)
  ]);
  const propertyIds = new Set<string>([
    ...(reviews.data ?? []).map((item) => item.property_id),
    ...(issues.data ?? []).map((item) => item.property_id),
    ...(claims.data ?? []).map((item) => item.property_id)
  ]);
  return { user, reviews: reviews.data ?? [], issues: issues.data ?? [], claims: claims.data ?? [], propertyIds, housingEvents: housingEvents.data ?? [], feedback: feedback.data ?? [], referrals: referrals.data ?? [] };
}

export async function getAdminData() {
  const user = await getCurrentUser();
  if (!user || !isAdminEmail(user.email)) return { allowed: false };
  const supabase = createSupabaseAdminClient();
  const [properties, reviews, issues, claims, intakes, housingEvents, verifiedEvents, feedback, dailyEvents, topUsers, topCities, pendingReviews, pendingIssues, pendingClaims] = await Promise.all([
    supabase.from("properties").select("id", { count: "exact", head: true }),
    supabase.from("reviews").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(8),
    supabase.from("maintenance_issues").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(8),
    supabase.from("property_claims").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(8),
    supabase.from("property_manager_intake").select("id", { count: "exact", head: true }),
    supabase.from("housing_events").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(12),
    supabase.from("housing_events").select("id", { count: "exact", head: true }).eq("is_verified", true),
    supabase.from("feedback_responses").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(8),
    supabase.from("housing_events_daily_growth").select("*").order("event_day", { ascending: false }).limit(30),
    supabase.from("top_contributing_users").select("*").limit(10),
    supabase.from("top_growing_cities").select("*").limit(10),
    supabase.from("reviews").select("*").eq("moderation_status", "pending").order("created_at", { ascending: true }).limit(20),
    supabase.from("maintenance_issues").select("*").eq("moderation_status", "pending").order("created_at", { ascending: true }).limit(20),
    supabase.from("property_claims").select("*").eq("claim_status", "pending").order("created_at", { ascending: true }).limit(20)
  ]);
  const propertyCount = properties.count ?? 0;
  const reviewCount = reviews.count ?? 0;
  const issueCount = issues.count ?? 0;
  const eventCount = housingEvents.count ?? 0;
  return {
    allowed: true,
    counts: {
      properties: propertyCount,
      reviews: reviewCount,
      issues: issueCount,
      claims: claims.count ?? 0,
      intakes: intakes.count ?? 0,
      housingEvents: eventCount,
      verifiedEvents: verifiedEvents.count ?? 0,
      feedback: feedback.count ?? 0,
      averageReviewsPerProperty: propertyCount ? Number((reviewCount / propertyCount).toFixed(2)) : 0,
      averageEventsPerProperty: propertyCount ? Number((eventCount / propertyCount).toFixed(2)) : 0
    },
    recentReviews: reviews.data ?? [],
    recentIssues: issues.data ?? [],
    pendingReviews: pendingReviews.data ?? [],
    pendingIssues: pendingIssues.data ?? [],
    pendingClaims: pendingClaims.data ?? [],
    recentHousingEvents: housingEvents.data ?? [],
    recentFeedback: feedback.data ?? [],
    dailyGrowth: dailyEvents.data ?? [],
    topUsers: topUsers.data ?? [],
    topCities: topCities.data ?? []
  };
}

export async function getFeedbackAdminData() {
  const user = await getCurrentUser();
  if (!user || !isAdminEmail(user.email)) return { allowed: false, responses: [] };
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("feedback_responses").select("*").order("created_at", { ascending: false }).limit(100);
  return { allowed: true, responses: data ?? [] };
}

export async function getPropertiesByCity(city: string) {
  if (!isConfigured()) return [] as PropertySummary[];
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("property_summary").select("*").ilike("city", city).order("last_activity", { ascending: false }).limit(50);
  return data ?? [];
}

export async function getPropertiesByPostcode(postcode: string) {
  if (!isConfigured()) return [] as PropertySummary[];
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("property_summary").select("*").ilike("postcode", `${postcode}%`).order("last_activity", { ascending: false }).limit(50);
  return data ?? [];
}
