import { createSupabaseAdminClient, isConfigured } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/data";

export type ActorType = "renter" | "landlord" | "letting_agent" | "property_manager" | "admin" | "anonymous";
export type HousingEventType =
  | "review_submitted"
  | "maintenance_issue_reported"
  | "maintenance_issue_resolved"
  | "property_claimed"
  | "landlord_response"
  | "property_manager_signup"
  | "property_created"
  | "feedback_submitted"
  | "referral_created"
  | "photo_uploaded";

export async function logAnalyticsEvent(eventName: string, payload: Record<string, unknown> = {}) {
  if (!isConfigured()) return;
  const supabase = createSupabaseAdminClient();
  const user = await getCurrentUser();
  await supabase.from("analytics_events").insert({
    event_name: eventName,
    payload,
    user_id: user?.id ?? null
  });
}

export async function logHousingEvent(args: {
  propertyId?: string | null;
  actorType?: ActorType;
  eventType: HousingEventType;
  metadata?: Record<string, unknown>;
  isVerified?: boolean;
  sourceId?: string | null;
}) {
  if (!isConfigured()) return;
  const supabase = createSupabaseAdminClient();
  const user = await getCurrentUser();
  await supabase.from("housing_events").insert({
    property_id: args.propertyId ?? null,
    actor_id: user?.id ?? null,
    actor_type: args.actorType ?? "anonymous",
    event_type: args.eventType,
    metadata: args.metadata ?? {},
    is_verified: args.isVerified ?? false,
    source_id: args.sourceId ?? null
  });
}

export type VerificationStatus = "reported" | "verified" | "disputed" | "corrected";

export async function setHousingEventVerified(sourceId: string, isVerified: boolean) {
  if (!isConfigured()) return;
  const supabase = createSupabaseAdminClient();
  const verificationStatus: VerificationStatus = isVerified ? "verified" : "disputed";
  await supabase.from("housing_events").update({ is_verified: isVerified, verification_status: verificationStatus }).eq("source_id", sourceId);
}
