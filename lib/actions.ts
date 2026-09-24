"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient, createSupabaseServerClient, isAdminEmail, isConfigured } from "@/lib/supabase";
import { claimSchema, feedbackSchema, formObject, issueSchema, managerIntakeSchema, magicLinkSchema, onboardingSchema, propertySchema, referralSchema, reviewSchema } from "@/lib/schemas";
import { getCurrentUser } from "@/lib/data";
import { logAnalyticsEvent, logHousingEvent } from "@/lib/events";
import { enforceRateLimit } from "@/lib/rate-limit";

async function requireSupabase(rateLimitAction?: string) {
  if (!isConfigured()) {
    throw new Error("Supabase is not configured. Add environment variables from .env.example.");
  }
  if (rateLimitAction) await enforceRateLimit(rateLimitAction);
  return createSupabaseAdminClient();
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !isAdminEmail(user.email)) {
    throw new Error("Admin access required.");
  }
  return createSupabaseAdminClient();
}

export async function createPropertyAction(formData: FormData) {
  const parsed = propertySchema.parse(formObject(formData));
  const supabase = await requireSupabase("create_property");
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("properties")
    .insert({ ...parsed, created_by: user?.id ?? null })
    .select("id")
    .single();
  if (error) throw error;
  await logAnalyticsEvent("property_created", { property_id: data.id, postcode: parsed.postcode });
  await logHousingEvent({ propertyId: data.id, eventType: "property_created", metadata: { postcode: parsed.postcode, property_type: parsed.property_type } });
  revalidatePath("/search");
  redirect(`/property/${data.id}`);
}

export async function logSearchAction(formData: FormData) {
  const query = String(formData.get("q") ?? "");
  await enforceRateLimit("search", { windowMs: 60 * 1000, max: 30 });
  await logAnalyticsEvent("property_search", { query });
  redirect(`/search?q=${encodeURIComponent(query)}`);
}

export async function submitReviewAction(propertyId: string, formData: FormData) {
  const parsed = reviewSchema.parse(formObject(formData));
  const supabase = await requireSupabase("submit_review");
  const user = await getCurrentUser();
  const { error } = await supabase.from("reviews").insert({
    ...parsed,
    property_id: propertyId,
    user_id: user?.id ?? null,
    moderation_status: "pending"
  });
  if (error) throw error;
  await logAnalyticsEvent("review_completed", { property_id: propertyId });
  await logHousingEvent({
    propertyId,
    actorType: "renter",
    eventType: "review_submitted",
    metadata: { overall_rating: parsed.overall_rating, would_rent_again: parsed.would_rent_again }
  });
  revalidatePath(`/property/${propertyId}`);
  redirect(`/contribute/next?propertyId=${propertyId}&event=review`);
}

export async function submitIssueAction(propertyId: string, formData: FormData) {
  const parsed = issueSchema.parse(formObject(formData));
  const supabase = await requireSupabase("submit_issue");
  const user = await getCurrentUser();
  const { error } = await supabase.from("maintenance_issues").insert({
    ...parsed,
    property_id: propertyId,
    user_id: user?.id ?? null,
    moderation_status: "pending"
  });
  if (error) throw error;
  await logAnalyticsEvent("issue_completed", { property_id: propertyId, issue_type: parsed.issue_type, severity: parsed.severity });
  await logHousingEvent({
    propertyId,
    actorType: "renter",
    eventType: parsed.status === "Resolved" ? "maintenance_issue_resolved" : "maintenance_issue_reported",
    metadata: { issue_type: parsed.issue_type, severity: parsed.severity, status: parsed.status, response_time: parsed.response_time }
  });
  revalidatePath(`/property/${propertyId}`);
  redirect(`/contribute/next?propertyId=${propertyId}&event=issue`);
}

export async function submitClaimAction(propertyId: string, formData: FormData) {
  const parsed = claimSchema.parse(formObject(formData));
  const supabase = await requireSupabase("submit_claim");
  const user = await getCurrentUser();
  const { error } = await supabase.from("property_claims").insert({
    ...parsed,
    property_id: propertyId,
    user_id: user?.id ?? null,
    claim_status: "pending"
  });
  if (error) throw error;
  await logAnalyticsEvent("claim_completed", { property_id: propertyId, role: parsed.role, portfolio_size: parsed.portfolio_size });
  await logHousingEvent({
    propertyId,
    actorType: parsed.role === "Property manager" ? "property_manager" : parsed.role === "Letting agent" ? "letting_agent" : "landlord",
    eventType: "property_claimed",
    metadata: { role: parsed.role, portfolio_size: parsed.portfolio_size, maintenance_workflow: parsed.maintenance_workflow }
  });
  revalidatePath(`/property/${propertyId}`);
  redirect(`/contribute/next?propertyId=${propertyId}&event=claim`);
}

export async function submitManagerIntakeAction(formData: FormData) {
  const parsed = managerIntakeSchema.parse(formObject(formData));
  const supabase = await requireSupabase("manager_intake");
  const { error } = await supabase.from("property_manager_intake").insert(parsed);
  if (error) throw error;
  await logAnalyticsEvent("signup_completed", { units_managed: parsed.units_managed });
  await logHousingEvent({
    actorType: "property_manager",
    eventType: "property_manager_signup",
    metadata: { units_managed: parsed.units_managed, challenge: parsed.biggest_operational_challenge }
  });
  redirect("/contribute/next?event=manager");
}

export async function submitOnboardingAction(formData: FormData) {
  const parsed = onboardingSchema.parse(formObject(formData));
  const supabase = await requireSupabase("onboarding");
  const user = await getCurrentUser();
  const { error } = await supabase.from("onboarding_responses").insert({
    user_id: user?.id ?? null,
    user_type: parsed.user_type,
    answers: parsed
  });
  if (error) throw error;
  await logAnalyticsEvent("signup_completed", { user_type: parsed.user_type });
  redirect("/contribute/next?event=onboarding");
}

export async function submitFeedbackAction(formData: FormData) {
  const parsed = feedbackSchema.parse(formObject(formData));
  const supabase = await requireSupabase("feedback");
  const user = await getCurrentUser();
  const { error } = await supabase.from("feedback_responses").insert({
    user_id: user?.id ?? null,
    property_id: parsed.property_id || null,
    source: parsed.source,
    answer: parsed.answer
  });
  if (error) throw error;
  await logAnalyticsEvent("feedback_submitted", { source: parsed.source, property_id: parsed.property_id });
  await logHousingEvent({ propertyId: parsed.property_id || null, eventType: "feedback_submitted", metadata: { source: parsed.source } });
  redirect(`/contribute/next${parsed.property_id ? `?propertyId=${parsed.property_id}&event=feedback` : "?event=feedback"}`);
}

export async function createReferralAction(formData: FormData) {
  const parsed = referralSchema.parse(formObject(formData));
  const supabase = await requireSupabase("referral");
  const user = await getCurrentUser();
  const code = crypto.randomUUID().slice(0, 8);
  const { error } = await supabase.from("referrals").insert({
    property_id: parsed.property_id || null,
    created_by: user?.id ?? null,
    invite_type: parsed.invite_type,
    recipient_email: parsed.recipient_email || null,
    referral_code: code,
    reputation_points_awarded: 5
  });
  if (error) throw error;
  await logAnalyticsEvent("referral_created", { invite_type: parsed.invite_type, property_id: parsed.property_id });
  await logHousingEvent({ propertyId: parsed.property_id || null, eventType: "referral_created", metadata: { invite_type: parsed.invite_type } });
  redirect(`/invite/${code}`);
}

export async function requestMagicLinkAction(formData: FormData) {
  const { email, next } = magicLinkSchema.parse(formObject(formData));
  await enforceRateLimit(`magic_link:${email.toLowerCase()}`, { windowMs: 5 * 60 * 1000, max: 3 });
  if (!isConfigured()) {
    throw new Error("Supabase is not configured. Add environment variables from .env.example.");
  }
  const supabase = await createSupabaseServerClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const redirectTo = `${siteUrl}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`;
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
  if (error) throw error;
  redirect(`/auth/sign-in?sent=1${next ? `&next=${encodeURIComponent(next)}` : ""}`);
}

export async function signOutAction() {
  if (!isConfigured()) redirect("/");
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function moderateReviewAction(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const { data, error } = await supabase.from("reviews").update({ moderation_status: status }).eq("id", id).select("property_id").single();
  if (error) throw error;
  revalidatePath("/admin");
  if (data?.property_id) revalidatePath(`/property/${data.property_id}`);
}

export async function moderateIssueAction(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const { data, error } = await supabase.from("maintenance_issues").update({ moderation_status: status }).eq("id", id).select("property_id").single();
  if (error) throw error;
  revalidatePath("/admin");
  if (data?.property_id) revalidatePath(`/property/${data.property_id}`);
}

export async function moderateClaimAction(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const { data, error } = await supabase.from("property_claims").update({ claim_status: status }).eq("id", id).select("property_id").single();
  if (error) throw error;
  revalidatePath("/admin");
  if (data?.property_id) revalidatePath(`/property/${data.property_id}`);
}
