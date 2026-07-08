export type CompletionInput = {
  review_count?: number | null;
  issue_count?: number | null;
  timeline_count?: number | null;
  has_details?: boolean | null;
  claimed_count?: number | null;
  photo_count?: number | null;
};

export const completionParts = [
  { key: "reviews", label: "Reviews", weight: 25 },
  { key: "issues", label: "Maintenance Issues", weight: 20 },
  { key: "photos", label: "Photos", weight: 10 },
  { key: "timeline", label: "Timeline", weight: 15 },
  { key: "details", label: "Property Details", weight: 15 },
  { key: "claimed", label: "Claimed Status", weight: 15 }
] as const;

export function getPropertyCompletion(input: CompletionInput) {
  const checks = {
    reviews: Number(input.review_count ?? 0) > 0,
    issues: Number(input.issue_count ?? 0) > 0,
    photos: Number(input.photo_count ?? 0) > 0,
    timeline: Number(input.timeline_count ?? 0) > 0,
    details: Boolean(input.has_details),
    claimed: Number(input.claimed_count ?? 0) > 0
  };
  const score = completionParts.reduce((total, part) => total + (checks[part.key] ? part.weight : 0), 0);
  return { score, checks };
}

export function getReputationScore(input: { reviews: number; issues: number; claims: number; verifiedReviews?: number; verifiedIssues?: number }) {
  return input.reviews * 15 + input.issues * 20 + input.claims * 10 + (input.verifiedReviews ?? 0) * 25 + (input.verifiedIssues ?? 0) * 30;
}

export function getTrustBadges(input: { verifiedReviews?: number; verifiedIssues?: number; claims?: number; approvedClaim?: boolean }) {
  const badges = [];
  if ((input.verifiedReviews ?? 0) > 0) badges.push("Verified Reviewer");
  if ((input.verifiedIssues ?? 0) > 0) badges.push("Verified Issue Reporter");
  if (input.approvedClaim) badges.push("Verified Landlord");
  if ((input.claims ?? 0) > 0) badges.push("Property Contributor");
  return badges;
}

export function slugToLabel(slug: string) {
  return decodeURIComponent(slug).replaceAll("-", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
