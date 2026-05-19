-- Email on profiles + auth tokens

alter table public.profiles
  add column if not exists email text,
  add column if not exists email_verified_at timestamptz;

create unique index if not exists profiles_email_lower_idx
  on public.profiles (lower(email))
  where email is not null;

create table if not exists public.auth_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('password_reset', 'email_verify')),
  token_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists auth_tokens_hash_idx on public.auth_tokens (token_hash);
create index if not exists auth_tokens_user_type_idx
  on public.auth_tokens (user_id, type);
