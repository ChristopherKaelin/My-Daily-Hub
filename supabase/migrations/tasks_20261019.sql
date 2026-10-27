-- tasks: user task-tracking tool
create table tasks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id),
  title         text not null check (char_length(title) <= 200),
  description   text check (char_length(description) <= 1000),
  due_date      date,
  priority      text default 'medium' check (priority = any (array['low', 'medium', 'high'])),
  is_complete   boolean default false,
  completed_at  timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table tasks enable row level security;

create policy "Users can manage own tasks"
  on tasks for all
  using (auth.uid() = user_id);
