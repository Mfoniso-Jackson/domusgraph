create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

create table if not exists public.users_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text,
  created_at timestamptz default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  address_line_1 text not null,
  address_line_2 text,
  city text,
  postcode text not null,
  country text default 'UK',
  property_type text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  overall_rating integer check (overall_rating between 1 and 5),
  maintenance_rating integer check (maintenance_rating between 1 and 5),
  communication_rating integer check (communication_rating between 1 and 5),
  condition_rating integer check (condition_rating between 1 and 5),
  deposit_fairness_rating integer check (deposit_fairness_rating between 1 and 5),
  safety_rating integer check (safety_rating between 1 and 5),
  review_text text,
  experienced_damp boolean default false,
  experienced_mould boolean default false,
  experienced_heating boolean default false,
  experienced_plumbing boolean default false,
  experienced_noise boolean default false,
  experienced_pests boolean default false,
  experienced_electrical boolean default false,
  would_rent_again text,
  move_in_month text,
  move_out_month text,
  verification_level text default 'unverified',
  moderation_status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.maintenance_issues (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  issue_type text not null,
  severity text not null,
  description text,
  date_discovered date,
  landlord_notified boolean,
  response_time text,
  status text,
  resolution_date date,
  actually_fixed text,
  verification_level text default 'unverified',
  moderation_status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.property_claims (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text,
  email text,
  role text,
  portfolio_size text,
  biggest_time_sink text,
  maintenance_workflow text,
  time_saving_answer text,
  claim_status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.property_manager_intake (
  id uuid primary key default gen_random_uuid(),
  company_name text,
  contact_name text,
  email text,
  units_managed text,
  maintenance_tickets_per_month text,
  biggest_operational_challenge text,
  predictive_maintenance_interest text,
  one_problem_answer text,
  created_at timestamptz default now()
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  payload jsonb default '{}'::jsonb,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists properties_postcode_idx on public.properties using gin (postcode gin_trgm_ops);
create index if not exists properties_address_idx on public.properties using gin (address_line_1 gin_trgm_ops);
create index if not exists reviews_property_id_idx on public.reviews(property_id);
create index if not exists issues_property_id_idx on public.maintenance_issues(property_id);
create index if not exists claims_property_id_idx on public.property_claims(property_id);
create index if not exists analytics_event_name_idx on public.analytics_events(event_name);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at
before update on public.properties
for each row execute function public.set_updated_at();

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
    coalesce(max(mi.created_at), p.created_at)
  ) as last_activity
from public.properties p
left join public.reviews r on r.property_id = p.id and r.moderation_status = 'approved'
left join public.maintenance_issues mi on mi.property_id = p.id and mi.moderation_status = 'approved'
group by p.id;

alter table public.users_profile enable row level security;
alter table public.properties enable row level security;
alter table public.reviews enable row level security;
alter table public.maintenance_issues enable row level security;
alter table public.property_claims enable row level security;
alter table public.property_manager_intake enable row level security;
alter table public.analytics_events enable row level security;

create policy "Profiles are readable by owner" on public.users_profile for select using (auth.uid() = id);
create policy "Profiles are insertable by owner" on public.users_profile for insert with check (auth.uid() = id);
create policy "Properties are public readable" on public.properties for select using (true);
create policy "Authenticated users can create properties" on public.properties for insert to authenticated with check (auth.uid() = created_by or created_by is null);

create policy "Approved reviews are public readable" on public.reviews for select using (moderation_status = 'approved');
create policy "Users can read own reviews" on public.reviews for select to authenticated using (auth.uid() = user_id);
create policy "Authenticated users can create reviews" on public.reviews for insert to authenticated with check (auth.uid() = user_id);

create policy "Approved issues are public readable" on public.maintenance_issues for select using (moderation_status = 'approved');
create policy "Users can read own issues" on public.maintenance_issues for select to authenticated using (auth.uid() = user_id);
create policy "Authenticated users can create issues" on public.maintenance_issues for insert to authenticated with check (auth.uid() = user_id);

create policy "Users can read own claims" on public.property_claims for select to authenticated using (auth.uid() = user_id);
create policy "Authenticated users can create claims" on public.property_claims for insert to authenticated with check (auth.uid() = user_id);

create policy "Anyone can submit manager intake" on public.property_manager_intake for insert with check (true);
create policy "Anyone can log analytics events" on public.analytics_events for insert with check (true);

comment on table public.reviews is 'New reviews default to pending. Admin display uses the service role client; public client access only sees approved rows or the submitter own rows.';
comment on table public.maintenance_issues is 'Maintenance events are intentionally structured for future housing graph intelligence.';
comment on table public.property_claims is 'Claim verification is pending by default and should be manually reviewed before owner-facing features are unlocked.';
