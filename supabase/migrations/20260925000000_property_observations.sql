-- UPRN is the UK's canonical property identifier. The EPC lookup already
-- receives it on every match (lib/epc.ts EpcRecord.uprn) but nothing has
-- ever stored it. Populating this unlocks exact-match entity resolution
-- instead of relying only on fuzzy address-token matching.
alter table public.properties add column if not exists uprn bigint;
create unique index if not exists properties_uprn_idx on public.properties(uprn) where uprn is not null;

-- Distinguishes EPC-seeded rows from real user submissions. All 200
-- current properties were EPC-seeded (created_by is null for every one).
alter table public.properties add column if not exists source text default 'user_submitted';
update public.properties set source = 'epc_import' where created_by is null and source = 'user_submitted';

-- One table for every open-data observation about a property (EPC history,
-- planning, Land Registry sales, flood risk, ...), rather than one table
-- per source. Mirrors the jsonb-metadata pattern housing_events already
-- uses. Public, unmoderated: these come from authoritative government
-- sources via service-role writes, not user submissions.
create table if not exists public.property_observations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  observation_type text not null,
  observed_at date,
  recorded_at timestamptz default now(),
  source text not null,
  source_url text,
  source_ref text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  unique (property_id, observation_type, source_ref)
);
create index if not exists property_observations_property_id_idx on public.property_observations(property_id);
create index if not exists property_observations_type_idx on public.property_observations(observation_type);

alter table public.property_observations enable row level security;
create policy "Property observations are public readable" on public.property_observations for select using (true);
