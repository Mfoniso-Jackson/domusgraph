create table if not exists public.housing_events (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  actor_type text not null default 'anonymous',
  event_type text not null,
  metadata jsonb default '{}'::jsonb,
  is_verified boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.onboarding_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  user_type text not null,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.feedback_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  property_id uuid references public.properties(id) on delete set null,
  source text not null,
  answer text not null,
  created_at timestamptz default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  invite_type text not null,
  recipient_email text,
  referral_code text unique not null,
  reputation_points_awarded integer default 5,
  accepted_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  channel text not null default 'in_app',
  title text not null,
  body text not null,
  metadata jsonb default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.property_photos (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  image_url text not null,
  verification_level text default 'unverified',
  moderation_status text default 'pending',
  created_at timestamptz default now()
);

create index if not exists housing_events_property_idx on public.housing_events(property_id);
create index if not exists housing_events_actor_idx on public.housing_events(actor_id);
create index if not exists housing_events_type_idx on public.housing_events(event_type);
create index if not exists housing_events_created_at_idx on public.housing_events(created_at desc);
create index if not exists housing_events_verified_idx on public.housing_events(is_verified);
create index if not exists onboarding_user_type_idx on public.onboarding_responses(user_type);
create index if not exists feedback_property_idx on public.feedback_responses(property_id);
create index if not exists referrals_code_idx on public.referrals(referral_code);
create index if not exists notifications_user_idx on public.notifications(user_id, read_at);
create index if not exists properties_city_idx on public.properties using gin (city gin_trgm_ops);

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
  (p.address_line_1 is not null and p.postcode is not null and coalesce(p.property_type, '') <> '') as has_details
from public.properties p
left join public.reviews r on r.property_id = p.id and r.moderation_status = 'approved'
left join public.maintenance_issues mi on mi.property_id = p.id and mi.moderation_status = 'approved'
left join public.housing_events he on he.property_id = p.id
left join public.property_claims pc on pc.property_id = p.id
left join public.property_photos pp on pp.property_id = p.id
group by p.id;

create or replace view public.housing_events_daily_growth as
select
  date_trunc('day', created_at)::date as event_day,
  count(*)::integer as total_events,
  count(*) filter (where is_verified)::integer as verified_events
from public.housing_events
group by 1;

create or replace view public.top_contributing_users as
select
  actor_id,
  actor_type,
  count(*)::integer as contribution_count,
  count(*) filter (where is_verified)::integer as verified_count
from public.housing_events
where actor_id is not null
group by actor_id, actor_type
order by contribution_count desc, verified_count desc;

create or replace view public.top_growing_cities as
select
  coalesce(p.city, 'Unknown') as city,
  count(he.id)::integer as event_count,
  count(distinct p.id)::integer as property_count
from public.housing_events he
join public.properties p on p.id = he.property_id
group by coalesce(p.city, 'Unknown')
order by event_count desc;

alter table public.housing_events enable row level security;
alter table public.onboarding_responses enable row level security;
alter table public.feedback_responses enable row level security;
alter table public.referrals enable row level security;
alter table public.notifications enable row level security;
alter table public.property_photos enable row level security;

create policy "Housing events are public readable" on public.housing_events for select using (true);
create policy "Anyone can create housing events" on public.housing_events for insert with check (true);

create policy "Users can read own onboarding" on public.onboarding_responses for select to authenticated using (auth.uid() = user_id);
create policy "Anyone can submit onboarding" on public.onboarding_responses for insert with check (true);

create policy "Users can read own feedback" on public.feedback_responses for select to authenticated using (auth.uid() = user_id);
create policy "Anyone can submit feedback" on public.feedback_responses for insert with check (true);

create policy "Referral links are public readable" on public.referrals for select using (true);
create policy "Anyone can create referrals" on public.referrals for insert with check (true);

create policy "Users can read own notifications" on public.notifications for select to authenticated using (auth.uid() = user_id);
create policy "Users can update own notifications" on public.notifications for update to authenticated using (auth.uid() = user_id);

create policy "Approved photos are public readable" on public.property_photos for select using (moderation_status = 'approved');
create policy "Authenticated users can submit photos" on public.property_photos for insert to authenticated with check (auth.uid() = user_id);

comment on table public.housing_events is 'Unified Housing Event Engine. Verified Housing Events are the North Star Metric.';
comment on table public.feedback_responses is 'Post-action customer discovery answers for graph-growth prioritization.';
comment on table public.referrals is 'Referral engine for inviting previous tenants, neighbours, landlords, and property managers. Rewards trust/reputation points, not money.';
