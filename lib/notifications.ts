import { createSupabaseAdminClient, isConfigured } from "@/lib/supabase";

export type NotificationChannel = "in_app" | "email" | "push";

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

export const notificationService = {
  reviewApproved(userId: string) {
    return createNotification({
      userId,
      title: "Your review was approved",
      body: "Your housing experience now helps future renters make a better decision."
    });
  },
  propertyUpdated(userId: string, propertyId: string) {
    return createNotification({
      userId,
      title: "Property updated",
      body: "A property you contributed to has new housing graph activity.",
      metadata: { property_id: propertyId }
    });
  },
  claimApproved(userId: string, propertyId: string) {
    return createNotification({
      userId,
      title: "Claim approved",
      body: "Your property claim is now verified.",
      metadata: { property_id: propertyId }
    });
  }
};
