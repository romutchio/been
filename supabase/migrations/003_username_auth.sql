-- Username-based auth helpers (no real email for users)

create or replace function public.is_username_available(name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.profiles
    where username = lower(trim(name))
  );
$$;

revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  final_username text;
  display text;
begin
  final_username := lower(trim(coalesce(new.raw_user_meta_data ->> 'username', '')));
  display := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    final_username
  );

  if final_username !~ '^[a-z0-9_]{3,24}$' then
    final_username := 'user' || left(replace(new.id::text, '-', ''), 8);
  end if;

  insert into public.profiles (id, username, display_name)
  values (new.id, final_username, display)
  on conflict (id) do update
    set username = excluded.username,
        display_name = excluded.display_name;

  return new;
exception
  when unique_violation then
    raise exception 'username_taken';
end;
$$;
