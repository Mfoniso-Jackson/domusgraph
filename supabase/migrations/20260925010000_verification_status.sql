-- Richer verification, without breaking existing is_verified reads.
-- Values: reported | verified | disputed | corrected.
-- is_verified stays as-is for backward compatibility; verification_status
-- is the source of truth going forward and is what the timeline UI shows.
alter table public.housing_events add column if not exists verification_status text not null default 'reported';
update public.housing_events set verification_status = 'verified' where is_verified = true and verification_status = 'reported';

-- Brings claims into the same trust vocabulary as reviews/issues/photos,
-- which already have verification_level. claim_status (pending/approved/
-- rejected) stays as the domain-specific field for the claim's own lifecycle.
alter table public.property_claims add column if not exists verification_level text default 'unverified';
update public.property_claims set verification_level = 'verified' where claim_status = 'approved' and verification_level = 'unverified';
