"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient, createSupabaseServerClient, isAdminEmail, isConfigured } from "@/lib/supabase";
import { claimSchema, feedbackSchema, formObject, issueSchema, managerIntakeSchema, magicLinkSchema, onboardingSchema, propertySchema, referralSchema, reviewSchema } from "@/lib/schemas";
import { getCurrentUser } from "@/lib/data";
import { logAnalyticsEvent, logHousingEvent, setHousingEventVerified } from "@/lib/events";
import { enforceRateLimit } from "@/lib/rate-limit";
import { notifyAdminsOfPendingItem, notifyContributorOfModeration, notifyReferralInvite } from "@/lib/notifications";
import { lookupPostcode } from "@/lib/postcode";
import { attributeReferralIfPresent } from "@/lib/referrals";
import { getUnlockPreview } from "@/lib/growth";

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

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Sign in required to submit this.");
  }
  return user;
}

const UNLOCK_COLUMN = { reviews: "review_count", issues: "issue_count", photos: "photo_count", claimed: "claimed_count" } as const;

async function unlockQueryParam(supabase: ReturnType<typeof createSupabaseAdminClient>, propertyId: string, category: keyof typeof UNLOCK_COLUMN) {
  const { data } = await supabase.from("property_summary").select(UNLOCK_COLUMN[category]).eq("id", propertyId).single();
  const currentCount = Number((data as Record<string, number> | null)?.[UNLOCK_COLUMN[category]] ?? 0);
  const preview = getUnlockPreview(category, currentCount);
  return preview.willUnlock ? `&unlock=${preview.weight}&unlockLabel=${encodeURIComponent(preview.label)}` : "";
}

export async function createPropertyAction(formData: FormData) {
  const parsed = propertySchema.parse(formObject(formData));
  const supabase = await requireSupabase("create_property");
  const user = await getCurrentUser();

  const { data: existing } = await supabase
    .from("properties")
    .select("id")
    .eq("postcode", parsed.postcode)
    .ilike("address_line_1", parsed.address_line_1.trim())
    .maybeSingle();
  if (existing) {
    redirect(`/property/${existing.id}`);
  }

  let city = parsed.city;
  if (!city) {
    const lookup = await lookupPostcode(parsed.postcode);
    if (lookup?.adminDistrict) city = lookup.adminDistrict;
  }

  const { data, error } = await supabase
    .from("properties")
    .insert({ ...parsed, city, created_by: user?.id ?? null })
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
  const user = await requireUser();
  const supabase = await requireSupabase("submit_review");
  const unlock = await unlockQueryParam(supabase, propertyId, "reviews");
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      ...parsed,
      property_id: propertyId,
      user_id: user.id,
      moderation_status: "pending"
    })
    .select("id")
    .single();
  if (error) throw error;
  await logAnalyticsEvent("review_completed", { property_id: propertyId });
  await logHousingEvent({
    propertyId,
    actorType: "renter",
    eventType: "review_submitted",
    metadata: { overall_rating: parsed.overall_rating, would_rent_again: parsed.would_rent_again },
    sourceId: data.id
  });
  await notifyAdminsOfPendingItem({ type: "review", propertyId });
  await attributeReferralIfPresent(user.id);
  revalidatePath(`/property/${propertyId}`);
  redirect(`/contribute/next?propertyId=${propertyId}&event=review${unlock}`);
}

export async function submitIssueAction(propertyId: string, formData: FormData) {
  const parsed = issueSchema.parse(formObject(formData));
  const user = await requireUser();
  const supabase = await requireSupabase("submit_issue");
  const unlock = await unlockQueryParam(supabase, propertyId, "issues");
  const { data, error } = await supabase
    .from("maintenance_issues")
    .insert({
      ...parsed,
      property_id: propertyId,
      user_id: user.id,
      moderation_status: "pending"
    })
    .select("id")
    .single();
  if (error) throw error;
  await logAnalyticsEvent("issue_completed", { property_id: propertyId, issue_type: parsed.issue_type, severity: parsed.severity });
  await logHousingEvent({
    propertyId,
    actorType: "renter",
    eventType: parsed.status === "Resolved" ? "maintenance_issue_resolved" : "maintenance_issue_reported",
    metadata: { issue_type: parsed.issue_type, severity: parsed.severity, status: parsed.status, response_time: parsed.response_time },
    sourceId: data.id
  });
  await notifyAdminsOfPendingItem({ type: "issue", propertyId });
  await attributeReferralIfPresent(user.id);
  revalidatePath(`/property/${propertyId}`);
  redirect(`/contribute/next?propertyId=${propertyId}&event=issue${unlock}`);
}

export async function submitClaimAction(propertyId: string, formData: FormData) {
  const parsed = claimSchema.parse(formObject(formData));
  const user = await requireUser();
  const supabase = await requireSupabase("submit_claim");
  const unlock = await unlockQueryParam(supabase, propertyId, "claimed");
  const { data, error } = await supabase
    .from("property_claims")
    .insert({
      ...parsed,
      property_id: propertyId,
      user_id: user.id,
      claim_status: "pending"
    })
    .select("id")
    .single();
  if (error) throw error;
  await logAnalyticsEvent("claim_completed", { property_id: propertyId, role: parsed.role, portfolio_size: parsed.portfolio_size });
  await logHousingEvent({
    propertyId,
    actorType: parsed.role === "Property manager" ? "property_manager" : parsed.role === "Letting agent" ? "letting_agent" : "landlord",
    eventType: "property_claimed",
    metadata: { role: parsed.role, portfolio_size: parsed.portfolio_size, maintenance_workflow: parsed.maintenance_workflow },
    sourceId: data.id
  });
  await notifyAdminsOfPendingItem({ type: "claim", propertyId });
  await attributeReferralIfPresent(user.id);
  revalidatePath(`/property/${propertyId}`);
  redirect(`/contribute/next?propertyId=${propertyId}&event=claim${unlock}`);
}

const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export async function submitPhotoAction(propertyId: string, formData: FormData) {
  const user = await requireUser();
  const supabase = await requireSupabase("submit_photo");

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose a photo to upload.");
  }
  if (file.size > MAX_PHOTO_BYTES) {
    throw new Error("Photo must be 5MB or smaller.");
  }
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    throw new Error("Photo must be a JPEG, PNG, or WebP image.");
  }

  const unlock = await unlockQueryParam(supabase, propertyId, "photos");

  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${propertyId}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from("property-photos").upload(path, file, { contentType: file.type });
  if (uploadError) throw uploadError;

  const {
    data: { publicUrl }
  } = supabase.storage.from("property-photos").getPublicUrl(path);

  const { data, error } = await supabase
    .from("property_photos")
    .insert({ property_id: propertyId, user_id: user.id, image_url: publicUrl, moderation_status: "pending" })
    .select("id")
    .single();
  if (error) throw error;

  await logAnalyticsEvent("photo_completed", { property_id: propertyId });
  await logHousingEvent({ propertyId, actorType: "renter", eventType: "photo_uploaded", metadata: {}, sourceId: data.id });
  await notifyAdminsOfPendingItem({ type: "photo", propertyId });
  await attributeReferralIfPresent(user.id);
  revalidatePath(`/property/${propertyId}`);
  redirect(`/contribute/next?propertyId=${propertyId}&event=photo${unlock}`);
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
  if (parsed.recipient_email) {
    let propertyAddress: string | null = null;
    if (parsed.property_id) {
      const { data: property } = await supabase.from("properties").select("address_line_1").eq("id", parsed.property_id).maybeSingle();
      propertyAddress = property?.address_line_1 ?? null;
    }
    await notifyReferralInvite({ recipientEmail: parsed.recipient_email, inviteType: parsed.invite_type, referralCode: code, propertyAddress });
  }
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
  const { data, error } = await supabase
    .from("reviews")
    .update({ moderation_status: status, verification_level: status === "approved" ? "verified" : "unverified" })
    .eq("id", id)
    .select("property_id, user_id")
    .single();
  if (error) throw error;
  await setHousingEventVerified(id, status === "approved");
  await notifyContributorOfModeration({ type: "review", status, userId: data?.user_id, propertyId: data?.property_id ?? null });
  revalidatePath("/admin");
  if (data?.property_id) revalidatePath(`/property/${data.property_id}`);
}

export async function moderateIssueAction(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const { data, error } = await supabase
    .from("maintenance_issues")
    .update({ moderation_status: status, verification_level: status === "approved" ? "verified" : "unverified" })
    .eq("id", id)
    .select("property_id, user_id")
    .single();
  if (error) throw error;
  await setHousingEventVerified(id, status === "approved");
  await notifyContributorOfModeration({ type: "issue", status, userId: data?.user_id, propertyId: data?.property_id ?? null });
  revalidatePath("/admin");
  if (data?.property_id) revalidatePath(`/property/${data.property_id}`);
}

export async function moderateClaimAction(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const { data, error } = await supabase
    .from("property_claims")
    .update({ claim_status: status, verification_level: status === "approved" ? "verified" : "unverified" })
    .eq("id", id)
    .select("property_id, user_id, email")
    .single();
  if (error) throw error;
  await setHousingEventVerified(id, status === "approved");
  await notifyContributorOfModeration({ type: "claim", status, userId: data?.user_id, email: data?.email, propertyId: data?.property_id ?? null });
  revalidatePath("/admin");
  if (data?.property_id) revalidatePath(`/property/${data.property_id}`);
}

export async function moderatePhotoAction(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const { data, error } = await supabase
    .from("property_photos")
    .update({ moderation_status: status, verification_level: status === "approved" ? "verified" : "unverified" })
    .eq("id", id)
    .select("property_id, user_id")
    .single();
  if (error) throw error;
  await setHousingEventVerified(id, status === "approved");
  await notifyContributorOfModeration({ type: "photo", status, userId: data?.user_id, propertyId: data?.property_id ?? null });
  revalidatePath("/admin");
  if (data?.property_id) revalidatePath(`/property/${data.property_id}`);
}
