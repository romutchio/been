-- Auth without Supabase Auth / email: login + password in our tables, JWT for RLS

drop trigger if exists on_auth_user_created on auth.users;

alter table public.profiles drop constraint if exists profiles_id_fkey;

alter table public.profiles
  alter column id set default gen_random_uuid();

create table if not exists public.account_credentials (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  password_hash text not null
);

alter table public.account_credentials enable row level security;

-- No policies: only service_role can read/write credentials
