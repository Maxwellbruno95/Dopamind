/*
  # Create subscriptions table with policies

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `tier` (text, defaults to 'free')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS
    - Add policies for select, update, and insert
    - Ensure users can only access their own subscription data
  
  3. Performance
    - Add index on user_id
    - Add unique constraint on user_id
*/

-- Create subscriptions table if it doesn't exist
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  tier text default 'free',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS if not already enabled
alter table subscriptions enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Users can view their own subscription" on subscriptions;
drop policy if exists "Users can update their own subscription" on subscriptions;
drop policy if exists "Users can insert their own subscription" on subscriptions;

-- Add policies
create policy "Users can view their own subscriptions"
  on subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can update their own subscriptions"
  on subscriptions for update
  using (auth.uid() = user_id);

create policy "Users can insert their own subscriptions"
  on subscriptions for insert
  with check (auth.uid() = user_id);

-- Add updated_at trigger if it doesn't exist
drop trigger if exists handle_subscriptions_updated_at on subscriptions;
create trigger handle_subscriptions_updated_at
  before update on subscriptions
  for each row
  execute function handle_updated_at();

-- Add unique constraint if it doesn't exist
do $$ begin
  if not exists (
    select constraint_name 
    from information_schema.table_constraints 
    where table_name = 'subscriptions' 
    and constraint_name = 'subscriptions_user_id_key'
  ) then
    alter table subscriptions
    add constraint subscriptions_user_id_key unique (user_id);
  end if;
end $$;

-- Create index for better query performance if it doesn't exist
create index if not exists subscriptions_user_id_idx on subscriptions (user_id);