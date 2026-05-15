-- Регистрация/вход без service_role: только anon key + RPC

create extension if not exists pgcrypto;

create or replace function public.register_user(
  p_username text,
  p_password text,
  p_display_name text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
  uname text;
  dname text;
begin
  uname := lower(trim(p_username));
  dname := coalesce(nullif(trim(p_display_name), ''), uname);

  if uname !~ '^[a-z0-9_]{3,24}$' then
    raise exception 'invalid_username';
  end if;
  if length(p_password) < 6 then
    raise exception 'weak_password';
  end if;
  if exists (select 1 from public.profiles where username = uname) then
    raise exception 'username_taken';
  end if;

  uid := gen_random_uuid();

  insert into public.profiles (id, username, display_name)
  values (uid, uname, dname);

  insert into public.account_credentials (user_id, password_hash)
  values (uid, crypt(p_password, gen_salt('bf')));

  return uid;
end;
$$;

create or replace function public.verify_user_password(
  p_username text,
  p_password text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
  stored text;
begin
  select p.id, c.password_hash into uid, stored
  from public.profiles p
  join public.account_credentials c on c.user_id = p.id
  where p.username = lower(trim(p_username));

  if uid is null or stored is null then
    return null;
  end if;

  if stored = crypt(p_password, stored) then
    return uid;
  end if;

  return null;
end;
$$;

revoke all on function public.register_user(text, text, text) from public;
revoke all on function public.verify_user_password(text, text) from public;

grant execute on function public.register_user(text, text, text) to anon, authenticated;
grant execute on function public.verify_user_password(text, text) to anon, authenticated;
