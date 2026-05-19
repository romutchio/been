-- Planned trips, collaborators, no auto-visits until completed

create type public.trip_status as enum ('planned', 'completed');

alter table public.trips
  add column if not exists status public.trip_status not null default 'completed';

create table if not exists public.trip_members (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (trip_id, user_id)
);

create index if not exists trip_members_trip_id_idx on public.trip_members (trip_id);
create index if not exists trip_members_user_id_idx on public.trip_members (user_id);
create index if not exists trips_status_idx on public.trips (status);

alter table public.trip_members enable row level security;
