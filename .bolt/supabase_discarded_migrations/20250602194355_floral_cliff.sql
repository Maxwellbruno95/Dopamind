/*
  # Initial Database Schema Setup

  1. New Tables
    - settings
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - notifications_enabled (boolean)
      - sound_enabled (boolean)
      - theme (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - mood_entries
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - mood (integer)
      - timestamp (timestamptz)
      - note (text)
    
    - focus_sessions
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - started_at (timestamptz)
      - completed_at (timestamptz)
      - duration (integer)
      - session_type (text)
      - soundscape (text)
      - completed (boolean)
    
    - streaks
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - current_streak (integer)
      - longest_streak (integer)
      - last_session_date (date)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - analytics
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - event_type (text)
      - event_data (jsonb)
      - created_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Set up cascading deletes for user data cleanup

  3. Triggers
    - Add updated_at triggers for relevant tables
*/

-- Create updated_at trigger function
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Settings Table
create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  notifications_enabled boolean default true,
  sound_enabled boolean default true,
  theme text default 'system',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table settings enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'settings' and policyname = 'Users can view their own settings'
  ) then
    create policy "Users can view their own settings"
      on settings for select
      using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'settings' and policyname = 'Users can update their own settings'
  ) then
    create policy "Users can update their own settings"
      on settings for update
      using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'settings' and policyname = 'Users can insert their own settings'
  ) then
    create policy "Users can insert their own settings"
      on settings for insert
      with check (auth.uid() = user_id);
  end if;
end $$;

create trigger handle_settings_updated_at
  before update on settings
  for each row
  execute function handle_updated_at();

-- Mood Entries Table
create table if not exists mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  mood integer not null,
  timestamp timestamptz default now(),
  note text
);

alter table mood_entries enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'mood_entries' and policyname = 'Users can view their own mood entries'
  ) then
    create policy "Users can view their own mood entries"
      on mood_entries for select
      using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'mood_entries' and policyname = 'Users can insert their own mood entries'
  ) then
    create policy "Users can insert their own mood entries"
      on mood_entries for insert
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'mood_entries' and policyname = 'Users can delete their own mood entries'
  ) then
    create policy "Users can delete their own mood entries"
      on mood_entries for delete
      using (auth.uid() = user_id);
  end if;
end $$;

-- Focus Sessions Table
create table if not exists focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  started_at timestamptz default now(),
  completed_at timestamptz default now(),
  duration integer default 25,
  session_type text default 'focus',
  soundscape text,
  completed boolean default false
);

alter table focus_sessions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'focus_sessions' and policyname = 'Users can view their own focus sessions'
  ) then
    create policy "Users can view their own focus sessions"
      on focus_sessions for select
      using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'focus_sessions' and policyname = 'Users can insert their own focus sessions'
  ) then
    create policy "Users can insert their own focus sessions"
      on focus_sessions for insert
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'focus_sessions' and policyname = 'Users can delete their own focus sessions'
  ) then
    create policy "Users can delete their own focus sessions"
      on focus_sessions for delete
      using (auth.uid() = user_id);
  end if;
end $$;

-- Streaks Table
create table if not exists streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_session_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table streaks enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'streaks' and policyname = 'Users can view their own streaks'
  ) then
    create policy "Users can view their own streaks"
      on streaks for select
      using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'streaks' and policyname = 'Users can update their own streaks'
  ) then
    create policy "Users can update their own streaks"
      on streaks for update
      using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'streaks' and policyname = 'Users can insert their own streaks'
  ) then
    create policy "Users can insert their own streaks"
      on streaks for insert
      with check (auth.uid() = user_id);
  end if;
end $$;

create trigger handle_streaks_updated_at
  before update on streaks
  for each row
  execute function handle_updated_at();

-- Analytics Table
create table if not exists analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  event_type text not null,
  event_data jsonb,
  created_at timestamptz default now()
);

alter table analytics enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'analytics' and policyname = 'Users can view their own analytics'
  ) then
    create policy "Users can view their own analytics"
      on analytics for select
      using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'analytics' and policyname = 'Users can insert their own analytics'
  ) then
    create policy "Users can insert their own analytics"
      on analytics for insert
      with check (auth.uid() = user_id);
  end if;
end $$;

-- Create unique constraints
alter table settings
add constraint settings_user_id_key unique (user_id);

-- Create indexes for better query performance
create index if not exists mood_entries_user_id_timestamp_idx on mood_entries (user_id, timestamp);
create index if not exists focus_sessions_user_id_completed_at_idx on focus_sessions (user_id, completed_at);
create index if not exists analytics_user_id_event_type_idx on analytics (user_id, event_type);