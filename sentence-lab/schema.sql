-- ============================================================
-- Sentence Lab — Supabase schema
-- Run this ONCE in the Supabase SQL editor (anon key cannot run DDL).
-- Project: lhmwtfyceilgndpygivj
-- ============================================================

-- ---------- 1. Sessions: one row per student per activity attempt ----------
create table if not exists qf_sessions (
  id             uuid primary key default gen_random_uuid(),
  student_name   text not null,
  class_period   text,
  activity_id    text not null,
  activity_title text,
  tool           text,                 -- combine | write | blank | proof
  started_at     timestamptz default now(),
  completed_at   timestamptz,
  score          int  default 0,       -- points earned
  total          int  default 0,       -- points possible
  percent        int,                  -- 0-100
  proficiency    text,                 -- green | yellow | red | blue
  replay_number  int  default 1
);

create index if not exists qf_sessions_student_idx  on qf_sessions (student_name);
create index if not exists qf_sessions_activity_idx on qf_sessions (activity_id);

-- ---------- 2. Attempts: one row per keystroke-submission ----------
-- This is the real data model. Every report aggregates over this table.
create table if not exists qf_attempts (
  id             bigserial primary key,
  session_id     uuid references qf_sessions(id) on delete cascade,
  student_name   text not null,
  class_period   text,
  activity_id    text not null,
  prompt_id      text not null,
  prompt_index   int,
  attempt_number int,                  -- 1..5
  response       text,
  feedback       text,                 -- exactly what the student was shown
  is_optimal     boolean default false,
  skill          text,                 -- e.g. "past-tense"
  standard       text,                 -- e.g. "ELD.PI.9-10.10" or "L.9-10.1"
  created_at     timestamptz default now()
);

create index if not exists qf_attempts_student_idx on qf_attempts (student_name);
create index if not exists qf_attempts_skill_idx   on qf_attempts (skill);
create index if not exists qf_attempts_session_idx on qf_attempts (session_id);

-- ---------- 3. Roster (optional but makes the dashboard grid complete) ----------
-- Without this, the dashboard only shows students who have submitted something.
create table if not exists qf_roster (
  id           bigserial primary key,
  student_name text not null,
  class_period text,
  home_lang    text,                   -- es | zh | vi | ar | tl | ...
  active       boolean default true
);

-- ---------- 4. Assignments (which activities each period should see) ----------
create table if not exists qf_assignments (
  id           bigserial primary key,
  class_period text not null,
  activity_id  text not null,
  due_date     date,
  created_at   timestamptz default now()
);

-- ============================================================
-- Row level security — permissive, matching the rest of the suite
-- ============================================================
alter table qf_sessions    enable row level security;
alter table qf_attempts    enable row level security;
alter table qf_roster      enable row level security;
alter table qf_assignments enable row level security;

drop policy if exists qf_sessions_all on qf_sessions;
create policy qf_sessions_all on qf_sessions
  for all using (true) with check (true);

drop policy if exists qf_attempts_all on qf_attempts;
create policy qf_attempts_all on qf_attempts
  for all using (true) with check (true);

drop policy if exists qf_roster_all on qf_roster;
create policy qf_roster_all on qf_roster
  for all using (true) with check (true);

drop policy if exists qf_assignments_all on qf_assignments;
create policy qf_assignments_all on qf_assignments
  for all using (true) with check (true);

-- ============================================================
-- Optional: store content packs in the database instead of content.js
-- Leave this unused until you want to author activities without a git push.
-- ============================================================
create table if not exists qf_activities (
  id         text primary key,          -- matches activity.id in content.js
  title      text,
  tool       text,
  skill      text,
  standard   text,
  level      text,
  payload    jsonb not null,            -- the whole activity object
  published  boolean default true,
  updated_at timestamptz default now()
);

alter table qf_activities enable row level security;
drop policy if exists qf_activities_all on qf_activities;
create policy qf_activities_all on qf_activities
  for all using (true) with check (true);
