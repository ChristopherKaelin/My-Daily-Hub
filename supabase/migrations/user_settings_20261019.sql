-- user_settings: per-user app preferences
create table user_settings (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null unique references auth.users(id),
  display_name  text check (char_length(display_name) <= 50),
  city          text check (char_length(city) <= 100),
  weather_unit  text default 'fahrenheit' check (weather_unit = any (array['fahrenheit', 'celsius'])),
  theme         text default 'default',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table user_settings enable row level security;

create policy "Users can manage own settings"
  on user_settings for all
  using (auth.uid() = user_id);
