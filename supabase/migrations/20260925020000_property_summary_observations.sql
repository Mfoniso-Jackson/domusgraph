-- Surfaces public-record data (EPC, sale history) on property_summary so
-- search result cards can show real signal instead of leading with 0/0
-- review and issue counts on properties nobody has contributed to yet.
create or replace view public.property_summary as
select
  p.id,
  p.address_line_1,
  p.address_line_2,
  p.city,
  p.postcode,
  p.country,
  p.property_type,
  p.created_at,
  round(avg(r.overall_rating)::numeric, 1) as average_rating,
  count(distinct r.id)::integer as review_count,
  count(distinct mi.id)::integer as issue_count,
  greatest(
    p.created_at,
    coalesce(max(r.created_at), p.created_at),
    coalesce(max(mi.created_at), p.created_at),
    coalesce(max(he.created_at), p.created_at),
    coalesce(max(pc.created_at), p.created_at)
  ) as last_activity,
  count(distinct he.id)::integer as timeline_count,
  count(distinct pc.id) filter (where pc.claim_status = 'approved')::integer as claimed_count,
  count(distinct pp.id) filter (where pp.moderation_status = 'approved')::integer as photo_count,
  (p.address_line_1 is not null and p.postcode is not null and coalesce(p.property_type, '') <> '') as has_details,
  count(distinct po.id)::integer as observation_count,
  (array_agg(po.data->>'energy_band' order by po.observed_at desc) filter (where po.observation_type = 'epc'))[1] as epc_rating
from public.properties p
left join public.reviews r on r.property_id = p.id and r.moderation_status = 'approved'
left join public.maintenance_issues mi on mi.property_id = p.id and mi.moderation_status = 'approved'
left join public.housing_events he on he.property_id = p.id
left join public.property_claims pc on pc.property_id = p.id
left join public.property_photos pp on pp.property_id = p.id
left join public.property_observations po on po.property_id = p.id
group by p.id;
