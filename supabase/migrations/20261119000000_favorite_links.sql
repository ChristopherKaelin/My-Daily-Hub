-- Tool 8: Favorite Links
-- Each user can store up to 25 favorite links, ordered by display_order.

create table if not exists public.favorite_links (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  title          text not null check (char_length(title) between 1 and 100),
  url            text not null check (char_length(url) between 1 and 2048),
  display_order  integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Index for per-user ordered fetches
create index if not exists favorite_links_user_order
  on public.favorite_links (user_id, display_order);

-- RLS
alter table public.favorite_links enable row level security;

create policy "Users manage their own links"
  on public.favorite_links
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Enforce the 25-link limit at the database level
create or replace function public.check_favorite_links_limit()
  returns trigger
  language plpgsql
  security definer
as $$
begin
  if (
    select count(*)
    from public.favorite_links
    where user_id = new.user_id
  ) >= 25 then
    raise exception 'Favorite links limit of 25 reached.';
  end if;
  return new;
end;
$$;

create trigger enforce_favorite_links_limit
  before insert on public.favorite_links
  for each row execute function public.check_favorite_links_limit();
