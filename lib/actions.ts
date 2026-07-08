"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient, isConfigured } from "@/lib/supabase";
import { claimSchema, formObject, issueSchema, managerIntakeSchema, propertySchema, reviewSchema } from "@/lib/schemas";
import { getCurrentUser } from "@/lib/data";

async function logEvent(event_name: string, payload: Record<string, unknown> = {}) {
  if (!isConfigured()) return;
  const supabase = createSupabaseAdminClient();
  await supabase.from("analytics_events").insert({ event_name, payload });
}

function requireSupabase() {
  if (!isConfigured()) {
    throw new Error("Supabase is not configured. Add environment variables from .env.example.");
  }
  return createSupabaseAdminClient();
}

export async function createPropertyAction(formData: FormData) {
  const parsed = propertySchema.parse(formObject(formData));
  const supabase = requireSupabase();
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("properties")
    .insert({ ...parsed, created_by: user?.id ?? null })
    .select("id")
    .single();
  if (error) throw error;
  await logEvent("property_created", { property_id: data.id, postcode: parsed.postcode });
  revalidatePath("/search");
  redirect(`/property/${data.id}`);
}

export async function logSearchAction(formData: FormData) {
  const query = String(formData.get("q") ?? "");
  await logEvent("property_search", { query });
  redirect(`/search?q=${encodeURIComponent(query)}`);
}

export async function submitReviewAction(propertyId: string, formData: FormData) {
  const parsed = reviewSchema.parse(formObject(formData));
  const supabase = requireSupabase();
  const user = await getCurrentUser();
  const { error } = await supabase.from("reviews").insert({
    ...parsed,
    property_id: propertyId,
    user_id: user?.id ?? null,
    moderation_status: "pending"
  });
  if (error) throw error;
  await logEvent("review_submitted", { property_id: propertyId });
  revalidatePath(`/property/${propertyId}`);
  redirect(`/property/${propertyId}`);
}

export async function submitIssueAction(propertyId: string, formData: FormData) {
  const parsed = issueSchema.parse(formObject(formData));
  const supabase = requireSupabase();
  const user = await getCurrentUser();
  const { error } = await supabase.from("maintenance_issues").insert({
    ...parsed,
    property_id: propertyId,
    user_id: user?.id ?? null,
    moderation_status: "pending"
  });
  if (error) throw error;
  await logEvent("issue_reported", { property_id: propertyId, issue_type: parsed.issue_type, severity: parsed.severity });
  revalidatePath(`/property/${propertyId}`);
  redirect(`/property/${propertyId}`);
}

export async function submitClaimAction(propertyId: string, formData: FormData) {
  const parsed = claimSchema.parse(formObject(formData));
  const supabase = requireSupabase();
  const user = await getCurrentUser();
  const { error } = await supabase.from("property_claims").insert({
    ...parsed,
    property_id: propertyId,
    user_id: user?.id ?? null,
    claim_status: "pending"
  });
  if (error) throw error;
  await logEvent("property_claim_submitted", { property_id: propertyId, role: parsed.role, portfolio_size: parsed.portfolio_size });
  revalidatePath(`/property/${propertyId}`);
  redirect(`/property/${propertyId}`);
}

export async function submitManagerIntakeAction(formData: FormData) {
  const parsed = managerIntakeSchema.parse(formObject(formData));
  const supabase = requireSupabase();
  const { error } = await supabase.from("property_manager_intake").insert(parsed);
  if (error) throw error;
  await logEvent("property_manager_intake_submitted", { units_managed: parsed.units_managed });
  redirect("/property-manager?submitted=1");
}
