import { createSupabaseAdminClient, getAdminEmails, isConfigured } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";

export type NotificationChannel = "in_app" | "email" | "push";

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function createNotification(input: {
  userId?: string | null;
  channel?: NotificationChannel;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
}) {
  if (!isConfigured() || !input.userId) return;
  const supabase = createSupabaseAdminClient();
  await supabase.from("notifications").insert({
    user_id: input.userId,
    channel: input.channel ?? "in_app",
    title: input.title,
    body: input.body,
    metadata: input.metadata ?? {}
  });
}

async function getUserEmail(userId: string) {
  if (!isConfigured()) return null;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.auth.admin.getUserById(userId);
  return data.user?.email ?? null;
}

export type PendingItemType = "review" | "issue" | "claim" | "photo";

const pendingItemLabels: Record<PendingItemType, string> = {
  review: "review",
  issue: "maintenance issue",
  claim: "property claim",
  photo: "photo"
};

export async function notifyAdminsOfPendingItem(input: { type: PendingItemType; propertyId: string | null }) {
  const admins = getAdminEmails();
  if (!admins.length) return;
  const label = pendingItemLabels[input.type];
  const link = `${siteUrl()}/admin`;
  await sendEmail({
    to: admins,
    subject: `New ${label} pending moderation`,
    html: `<p>A new ${label} was submitted${input.propertyId ? " for a property" : ""} and needs review.</p><p><a href="${link}">Open the moderation queue</a></p>`
  });
}

export async function notifyReferralInvite(input: { recipientEmail: string; inviteType: string; referralCode: string; propertyAddress?: string | null }) {
  const link = `${siteUrl()}/invite/${input.referralCode}`;
  const context = input.propertyAddress ? ` for ${input.propertyAddress}` : "";
  await sendEmail({
    to: input.recipientEmail,
    subject: "You've been invited to add housing history on DomusGraph",
    html: `<p>Someone invited you to help build a property's housing history${context} as a ${input.inviteType.toLowerCase()}.</p><p><a href="${link}">Open the invite</a></p><p>DomusGraph is a structured record of tenancy experiences, maintenance issues, and property history — no passwords, just a magic link.</p>`
  });
}

export async function notifyContributorOfModeration(input: {
  type: PendingItemType;
  status: string;
  userId?: string | null;
  email?: string | null;
  propertyId: string | null;
}) {
  const email = input.email ?? (input.userId ? await getUserEmail(input.userId) : null);
  if (!email) return;
  const label = pendingItemLabels[input.type];
  const decision = input.status === "approved" ? "approved" : "not approved";
  const link = input.propertyId ? `${siteUrl()}/property/${input.propertyId}` : siteUrl();
  await sendEmail({
    to: email,
    subject: `Your ${label} was ${decision}`,
    html: `<p>Your ${label} on DomusGraph was ${decision}${input.status === "approved" ? " and is now visible to renters" : ""}.</p><p><a href="${link}">View the property</a></p>`
  });

  if (input.userId) {
    await createNotification({
      userId: input.userId,
      channel: "email",
      title: `Your ${label} was ${decision}`,
      body: input.status === "approved" ? "Your housing experience now helps future renters make a better decision." : "This submission was not approved for public display.",
      metadata: { property_id: input.propertyId, type: input.type, status: input.status }
    });
  }
}
