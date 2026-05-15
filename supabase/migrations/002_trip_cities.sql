create table public.trip_cities (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  country_code char(2) not null,
  city_name text not null,
  created_at timestamptz not null default now()
);

create index trip_cities_trip_id_idx on public.trip_cities (trip_id);

alter table public.trip_cities enable row level security;

create policy "trip_cities_select"
  on public.trip_cities for select
  to authenticated
  using (
    exists (
      select 1 from public.trips t
      where t.id = trip_id
        and (t.user_id = auth.uid() or public.is_friend(t.user_id))
    )
  );

create policy "trip_cities_insert"
  on public.trip_cities for insert
  to authenticated
  with check (
    exists (
      select 1 from public.trips t
      where t.id = trip_id and t.user_id = auth.uid()
    )
  );

create policy "trip_cities_delete"
  on public.trip_cities for delete
  to authenticated
  using (
    exists (
      select 1 from public.trips t
      where t.id = trip_id and t.user_id = auth.uid()
    )
  );
