-- Been: travel map app schema

create type friendship_status as enum ('pending', 'accepted');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  display_name text,
  created_at timestamptz not null default now(),
  constraint username_format check (
    username ~ '^[a-z0-9_]{3,24}$'
  )
);

create table public.visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  country_code char(2) not null,
  visited_at date,
  created_at timestamptz not null default now(),
  unique (user_id, country_code)
);

create table public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  country_code char(2) not null,
  created_at timestamptz not null default now(),
  unique (user_id, country_code)
);

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  notes text,
  start_date date,
  end_date date,
  created_at timestamptz not null default now()
);

create table public.trip_countries (
  trip_id uuid not null references public.trips (id) on delete cascade,
  country_code char(2) not null,
  primary key (trip_id, country_code)
);

create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade,
  status friendship_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

create index visits_user_id_idx on public.visits (user_id);
create index wishlist_user_id_idx on public.wishlist (user_id);
create index trips_user_id_idx on public.trips (user_id);
create index friendships_requester_idx on public.friendships (requester_id);
create index friendships_addressee_idx on public.friendships (addressee_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
begin
  base_username := lower(regexp_replace(
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    '[^a-z0-9_]', '', 'g'
  ));
  if length(base_username) < 3 then
    base_username := 'user';
  end if;
  base_username := left(base_username, 20);
  final_username := base_username;

  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data ->> 'display_name', final_username)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.visits enable row level security;
alter table public.wishlist enable row level security;
alter table public.trips enable row level security;
alter table public.trip_countries enable row level security;
alter table public.friendships enable row level security;

-- Profiles
create policy "profiles_select_all"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Helper: accepted friendship between current user and target
create or replace function public.is_friend(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.friendships f
    where f.status = 'accepted'
      and (
        (f.requester_id = auth.uid() and f.addressee_id = target)
        or (f.addressee_id = auth.uid() and f.requester_id = target)
      )
  );
$$;

revoke all on function public.is_friend(uuid) from public;
grant execute on function public.is_friend(uuid) to authenticated;

-- Visits
create policy "visits_select"
  on public.visits for select
  to authenticated
  using (auth.uid() = user_id or public.is_friend(user_id));

create policy "visits_insert_own"
  on public.visits for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "visits_update_own"
  on public.visits for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "visits_delete_own"
  on public.visits for delete
  to authenticated
  using (auth.uid() = user_id);

-- Wishlist
create policy "wishlist_select"
  on public.wishlist for select
  to authenticated
  using (auth.uid() = user_id or public.is_friend(user_id));

create policy "wishlist_insert_own"
  on public.wishlist for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "wishlist_delete_own"
  on public.wishlist for delete
  to authenticated
  using (auth.uid() = user_id);

-- Trips
create policy "trips_select"
  on public.trips for select
  to authenticated
  using (auth.uid() = user_id or public.is_friend(user_id));

create policy "trips_insert_own"
  on public.trips for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "trips_update_own"
  on public.trips for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "trips_delete_own"
  on public.trips for delete
  to authenticated
  using (auth.uid() = user_id);

-- Trip countries (via trip ownership)
create policy "trip_countries_select"
  on public.trip_countries for select
  to authenticated
  using (
    exists (
      select 1 from public.trips t
      where t.id = trip_id
        and (t.user_id = auth.uid() or public.is_friend(t.user_id))
    )
  );

create policy "trip_countries_insert"
  on public.trip_countries for insert
  to authenticated
  with check (
    exists (
      select 1 from public.trips t
      where t.id = trip_id and t.user_id = auth.uid()
    )
  );

create policy "trip_countries_delete"
  on public.trip_countries for delete
  to authenticated
  using (
    exists (
      select 1 from public.trips t
      where t.id = trip_id and t.user_id = auth.uid()
    )
  );

-- Friendships
create policy "friendships_select"
  on public.friendships for select
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "friendships_insert"
  on public.friendships for insert
  to authenticated
  with check (auth.uid() = requester_id);

create policy "friendships_update"
  on public.friendships for update
  to authenticated
  using (auth.uid() = addressee_id or auth.uid() = requester_id)
  with check (auth.uid() = addressee_id or auth.uid() = requester_id);

create policy "friendships_delete"
  on public.friendships for delete
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);
