-- Telegram Mini App: link or sign in

alter table public.profiles
  add column if not exists telegram_id bigint,
  add column if not exists telegram_username text,
  add column if not exists telegram_linked_at timestamptz;

create unique index if not exists profiles_telegram_id_idx
  on public.profiles (telegram_id)
  where telegram_id is not null;

alter table public.auth_tokens drop constraint if exists auth_tokens_type_check;

alter table public.auth_tokens
  add constraint auth_tokens_type_check
  check (type in ('password_reset', 'email_verify', 'telegram_link'));
