alter table public.housing_events add column if not exists source_id uuid;

create index if not exists housing_events_source_id_idx on public.housing_events(source_id);

comment on column public.housing_events.source_id is 'Links back to the review/maintenance_issue/property_claim row that generated this event, so moderation decisions can flip is_verified on the matching event.';
