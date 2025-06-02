/*
  # Create subscriptions table and policies
  
  1. Tables
    - Creates subscriptions table if it doesn't exist
    - Adds user_id, tier, and timestamp columns
  
  2. Security
    - Enables RLS
    - Adds policies for select, update, and insert operations
    - Ensures one subscription per user
  
  3. Performance
    - Adds index on user_id
    - Adds updated_at trigger
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
drop policy if exists "Users can view their own subscriptions" on subscriptions;
drop policy if exists "Users can update their own subscriptions" on subscriptions;
drop policy if exists "Users can insert their own subscriptions" on subscriptions;
drop policy if exists "Users can view their own subscription" on subscriptions;
drop policy if exists "Users can update their own subscription" on subscriptions;
drop policy if exists "Users can insert their own subscription" on subscriptions;

-- Create new policies
do $$ 
begin
  if not exists (
    select 1 from pg_policies 
    where tablename = 'subscriptions' 
    and policyname = 'Users can view their own subscription data'
  ) then
    create policy "Users can view their own subscription data"
      on subscriptions for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'subscriptions' 
    and policyname = 'Users can update their own subscription data'
  ) then
    create policy "Users can update their own subscription data"
      on subscriptions for update
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'subscriptions' 
    and policyname = 'Users can insert their own subscription data'
  ) then
    create policy "Users can insert their own subscription data"
      on subscriptions for insert
      with check (auth.uid() = user_id);
  end if;
end $$;

-- Add updated_at trigger if it doesn't exist
drop trigger if exists handle_subscriptions_updated_at on subscriptions;
create trigger handle_subscriptions_updated_at
  before update on subscriptions
  for each row
  execute function handle_updated_at();

-- Add unique constraint if it doesn't exist
do $$ 
begin
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