/*
  # Create subscriptions table and policies
  
  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `tier` (text, default: 'free')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS
    - Add policies for select, update, and insert
    - Add trigger for updated_at
  
  3. Performance
    - Add unique constraint on user_id
    - Add index on user_id
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
create policy "Users can view their own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can update their own subscription"
  on subscriptions for update
  using (auth.uid() = user_id);

create policy "Users can insert their own subscription"
  on subscriptions for insert
  with check (auth.uid() = user_id);

-- Add updated_at trigger
create trigger handle_subscriptions_updated_at
  before update on subscriptions
  for each row
  execute function handle_updated_at();

-- Add unique constraint
alter table subscriptions
add constraint subscriptions_user_id_key unique (user_id);

-- Create index for better query performance
create index if not exists subscriptions_user_id_idx on subscriptions (user_id);