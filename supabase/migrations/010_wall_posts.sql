create table if not exists public.wall_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint wall_post_body_len check (char_length(body) between 1 and 2000)
);

create index if not exists wall_posts_created_at_idx
  on public.wall_posts (created_at desc);
