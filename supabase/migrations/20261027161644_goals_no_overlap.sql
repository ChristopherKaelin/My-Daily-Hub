-- Prevent two goals on the same habit from having overlapping active date
-- ranges. Without this, progress_entries.goal_id can't unambiguously tell
-- which goal a given day's entry belongs to.
create extension if not exists btree_gist;

alter table goals
  add constraint goals_no_overlap
  exclude using gist (
    habit_id with =,
    daterange(start_date, coalesce(end_date, 'infinity'), '[]') with &&
  );
