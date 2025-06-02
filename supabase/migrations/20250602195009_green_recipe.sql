/*
  # Add Subscriptions Table

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, unique, references auth.users)
      - `tier` (text, default 'free')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `subscriptions` table
    - Add policies for authenticated users to:
      - Read their own subscription
      - Update their own subscription
      - Insert their own subscription

  3. Changes
    - Add trigger for auto-updating updated_at
    - Add unique constraint on user_id
*/

-- Create subscriptions table
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  tier text default 'free',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table subscriptions enable row level security;

-- Add policies
do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'subscriptions' and policyname = 'Users can view their own subscription'
  ) then
    create policy "Users can view their own subscription"
      on subscriptions for select
      using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'subscriptions' and policyname = 'Users can update their own subscription'
  ) then
    create policy "Users can update their own subscription"
      on subscriptions for update
      using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'subscriptions' and policyname = 'Users can insert their own subscription'
  ) then
    create policy "Users can insert their own subscription"
      on subscriptions for insert
      with check (auth.uid() = user_id);
  end if;
end $$;

-- Add updated_at trigger
do $$
begin
  if not exists (
    select 1 from pg_triggers where tgname = 'handle_subscriptions_updated_at'
  ) then
    create trigger handle_subscriptions_updated_at
      before update on subscriptions
      for each row
      execute function handle_updated_at();
  end if;
end $$;

-- Add unique constraint
alter table subscriptions
add constraint subscriptions_user_id_key unique (user_id);

-- Create index for better query performance
create index if not exists subscriptions_user_id_idx on subscriptions (user_id);