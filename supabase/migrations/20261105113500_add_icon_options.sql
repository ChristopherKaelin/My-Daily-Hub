-- icon_options: shared curated set of Phosphor icon keys, selectable by
-- the user when creating a habit. category groups icons for display in
-- the picker (not shown as a visible label). Read-only reference data,
-- not user-owned, so no user_id column and no per-user RLS policy.
create table icon_options (
  key         text primary key,
  label       text not null,
  category    text,
  created_at  timestamptz not null default now()
);

alter table icon_options enable row level security;

create policy "Anyone can read icon options"
  on icon_options for select
  using (true);

create index idx_icon_options_category on icon_options(category);

insert into icon_options (key, label, category) values
  ('barbell', 'Barbell', 'fitness'),
  ('bicycle', 'Bicycle', 'fitness'),
  ('footprints', 'Footprints', 'fitness'),
  ('sneaker-move', 'Sneaker move', 'fitness'),
  ('golf', 'Golf', 'fitness'),
  ('person-simple-tai-chi', 'Tai chi', 'fitness'),
  ('pill', 'Pill', 'health'),
  ('bandaids', 'Bandaids', 'health'),
  ('stethoscope', 'Stethoscope', 'health'),
  ('prescription', 'Prescription', 'health'),
  ('asclepius', 'Asclepius', 'health'),
  ('heartbeat', 'Heartbeat', 'health'),
  ('brain', 'Brain', 'health'),
  ('moon-stars', 'Moon stars', 'sleep'),
  ('bed', 'Bed', 'sleep'),
  ('battery-charging', 'Battery charging', 'sleep'),
  ('coffee', 'Coffee', 'food'),
  ('cooking-pot', 'Cooking pot', 'food'),
  ('grains', 'Grains', 'food'),
  ('drop', 'Drop', 'food'),
  ('pint-glass', 'Pint glass', 'food'),
  ('cross', 'Cross', 'faith'),
  ('hands-praying', 'Hands praying', 'faith'),
  ('books', 'Books', 'learning'),
  ('book-open-text', 'Book open text', 'learning'),
  ('notebook', 'Notebook', 'learning'),
  ('student', 'Student', 'learning'),
  ('chalkboard-teacher', 'Chalkboard teacher', 'learning'),
  ('graduation-cap', 'Graduation cap', 'learning'),
  ('broom', 'Broom', 'home'),
  ('washing-machine', 'Washing machine', 'home'),
  ('potted-plant', 'Potted plant', 'home'),
  ('leaf', 'Leaf', 'home'),
  ('house-line', 'House', 'home'),
  ('toolbox', 'Toolbox', 'home'),
  ('shovel', 'Shovel', 'home'),
  ('jar-label', 'Jar label', 'home'),
  ('bank', 'Bank', 'finance'),
  ('currency-circle-dollar', 'Currency circle dollar', 'finance'),
  ('currency-dollar', 'Currency dollar', 'finance'),
  ('money-wavy', 'Money wavy', 'finance'),
  ('users-three', 'Users three', 'people'),
  ('users-four', 'Users four', 'people'),
  ('handshake', 'Handshake', 'people'),
  ('hand-heart', 'Hand heart', 'people'),
  ('address-book-tabs', 'Address book tabs', 'people'),
  ('linkedin-logo', 'LinkedIn', 'social_logos'),
  ('x-logo', 'X', 'social_logos'),
  ('youtube-logo', 'YouTube', 'social_logos'),
  ('facebook-logo', 'Facebook', 'social_logos'),
  ('instagram-logo', 'Instagram', 'social_logos'),
  ('google-logo', 'Google', 'social_logos'),
  ('meta-logo', 'Meta', 'social_logos'),
  ('open-ai-logo', 'OpenAI', 'social_logos'),
  ('ny-times-logo', 'NY Times', 'social_logos'),
  ('stripe-logo', 'Stripe', 'social_logos'),
  ('apple-podcasts-logo', 'Apple Podcasts', 'social_logos'),
  ('spotify-logo', 'Spotify', 'social_logos'),
  ('code', 'Code', 'work_dev'),
  ('code-block', 'Code block', 'work_dev'),
  ('codesandbox-logo', 'CodeSandbox', 'work_dev'),
  ('file-html', 'HTML file', 'work_dev'),
  ('file-code', 'Code file', 'work_dev'),
  ('file-sql', 'SQL file', 'work_dev'),
  ('upload', 'Upload', 'work_dev'),
  ('folder-open', 'Folder open', 'work_dev'),
  ('calculator', 'Calculator', 'work_admin'),
  ('calendar-blank', 'Calendar', 'work_admin'),
  ('calendar-check', 'Calendar check', 'work_admin'),
  ('clock', 'Clock', 'work_admin'),
  ('clock-user', 'Clock user', 'work_admin'),
  ('note-pencil', 'Note pencil', 'work_admin'),
  ('pencil-line', 'Pencil line', 'work_admin'),
  ('presentation-chart', 'Presentation chart', 'work_admin'),
  ('list-checks', 'List checks', 'work_admin'),
  ('target', 'Target', 'work_admin'),
  ('trash', 'Trash', 'work_admin'),
  ('envelope-open', 'Envelope open', 'work_admin'),
  ('envelope-simple-open', 'Envelope simple open', 'work_admin'),
  ('globe', 'Globe', 'work_admin'),
  ('tree-structure', 'Tree structure', 'work_admin'),
  ('star', 'Star', 'work_admin'),
  ('headset', 'Headset', 'work_admin');

-- icon_key lives on goals, not habits: in the paper tracker each
-- monthly tracked target carries its own icon, not the underlying habit.
alter table goals
  add column icon_key text not null references icon_options(key);
