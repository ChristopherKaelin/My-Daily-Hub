-- habits: identity of a tracked habit
create table habits (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id),
  name             text not null,
  tracking_mode    text not null check (tracking_mode in ('boolean', 'frequency', 'cumulative')),
  unit             text,
  increment_amount numeric,
  archived_at      timestamptz,
  created_at       timestamptz not null default now(),

  check (
    (tracking_mode in ('boolean', 'frequency') and unit is null and increment_amount is null)
    or (tracking_mode = 'cumulative')
  )
);

-- goals: a target for a habit over a period
create table goals (
  id            uuid primary key default gen_random_uuid(),
  habit_id      uuid not null references habits(id),
  period        text not null check (period in ('day', 'week', 'month')),
  target_count  integer not null check (target_count > 0),
  start_date    date not null,
  end_date      date,
  created_at    timestamptz not null default now(),

  check (end_date is null or end_date >= start_date)
);

-- progress_entries: the daily log against a goal
create table progress_entries (
  id          uuid primary key default gen_random_uuid(),
  goal_id     uuid not null references goals(id),
  entry_date  date not null,
  count       integer not null check (count > 0),
  created_at  timestamptz not null default now(),

  unique (goal_id, entry_date)
);

create index idx_goals_habit_id on goals(habit_id);
create index idx_progress_entries_goal_id on progress_entries(goal_id);

-- Row Level Security
alter table habits enable row level security;
alter table goals enable row level security;
alter table progress_entries enable row level security;

-- habits: direct ownership via user_id
create policy "Users can view own habits"
  on habits for select
  using (auth.uid() = user_id);

create policy "Users can insert own habits"
  on habits for insert
  with check (auth.uid() = user_id);

create policy "Users can update own habits"
  on habits for update
  using (auth.uid() = user_id);

create policy "Users can delete own habits"
  on habits for delete
  using (auth.uid() = user_id);

-- goals: ownership via the parent habit
create policy "Users can view own goals"
  on goals for select
  using (
    exists (select 1 from habits where habits.id = goals.habit_id and habits.user_id = auth.uid())
  );

create policy "Users can insert own goals"
  on goals for insert
  with check (
    exists (select 1 from habits where habits.id = goals.habit_id and habits.user_id = auth.uid())
  );

create policy "Users can update own goals"
  on goals for update
  using (
    exists (select 1 from habits where habits.id = goals.habit_id and habits.user_id = auth.uid())
  );

create policy "Users can delete own goals"
  on goals for delete
  using (
    exists (select 1 from habits where habits.id = goals.habit_id and habits.user_id = auth.uid())
  );

-- progress_entries: ownership via goal -> habit
create policy "Users can view own progress entries"
  on progress_entries for select
  using (
    exists (
      select 1 from goals
      join habits on habits.id = goals.habit_id
      where goals.id = progress_entries.goal_id and habits.user_id = auth.uid()
    )
  );

create policy "Users can insert own progress entries"
  on progress_entries for insert
  with check (
    exists (
      select 1 from goals
      join habits on habits.id = goals.habit_id
      where goals.id = progress_entries.goal_id and habits.user_id = auth.uid()
    )
  );

create policy "Users can update own progress entries"
  on progress_entries for update
  using (
    exists (
      select 1 from goals
      join habits on habits.id = goals.habit_id
      where goals.id = progress_entries.goal_id and habits.user_id = auth.uid()
    )
  );

create policy "Users can delete own progress entries"
  on progress_entries for delete
  using (
    exists (
      select 1 from goals
      join habits on habits.id = goals.habit_id
      where goals.id = progress_entries.goal_id and habits.user_id = auth.uid()
    )
  );
