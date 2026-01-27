-- Create user_settings table
create table user_settings (
  user_id uuid references auth.users(id) primary key,
  lunch_policy text default 'avoid' check (lunch_policy in ('avoid', 'allow', 'none')),
  custom_instructions text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table user_settings enable row level security;

-- Policies
create policy "Users can view own settings" on user_settings for select using (auth.uid() = user_id);
create policy "Users can insert own settings" on user_settings for insert with check (auth.uid() = user_id);
create policy "Users can update own settings" on user_settings for update using (auth.uid() = user_id);

