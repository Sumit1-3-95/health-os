-- Health metrics from Apple Watch (one row per day)
create table if not exists health_metrics (
  id uuid default gen_random_uuid() primary key,
  date text not null unique,           -- YYYY-MM-DD
  steps integer,
  active_calories integer,
  exercise_minutes integer,
  resting_heart_rate numeric(4,1),
  sleep_hours numeric(3,1),
  stand_hours integer,
  weight_kg numeric(4,1),              -- synced here too for one source of truth
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for fast date queries
create index if not exists health_metrics_date_idx on health_metrics (date);

-- Enable realtime
alter publication supabase_realtime add table health_metrics;
