import { cookies } from "next/headers";
import { createSupabaseAdminClient, isConfigured } from "@/lib/supabase";
import { REFERRAL_COOKIE } from "@/lib/referral-cookie";

/**
 * Best-effort: if the current visitor arrived via a referral link (cookie set by
 * middleware on /invite/[code]) and hasn't already been credited, mark that
 * referral accepted. Never throws — attribution must not block the action that
 * triggered it (a review/issue/claim/photo submission).
 */
export async function attributeReferralIfPresent(currentUserId: string | null | undefined) {
  if (!isConfigured()) return;
  try {
    const store = await cookies();
    const code = store.get(REFERRAL_COOKIE)?.value;
    if (!code) return;
    const supabase = createSupabaseAdminClient();
    const { data: referral } = await supabase.from("referrals").select("id, created_by, accepted_at").eq("referral_code", code).maybeSingle();
    if (!referral || referral.accepted_at) return;
    if (currentUserId && referral.created_by === currentUserId) return;
    await supabase.from("referrals").update({ accepted_at: new Date().toISOString() }).eq("id", referral.id);
  } catch (error) {
    console.error("Failed to attribute referral", error);
  }
}
