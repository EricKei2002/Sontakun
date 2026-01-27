-- Create local_calendar_events table for storing events in Sontakun
create table local_calendar_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table local_calendar_events enable row level security;

-- Policies
create policy "Users can view own events" on local_calendar_events for select using (auth.uid() = user_id);
create policy "Users can insert own events" on local_calendar_events for insert with check (auth.uid() = user_id);
create policy "Users can update own events" on local_calendar_events for update using (auth.uid() = user_id);
create policy "Users can delete own events" on local_calendar_events for delete using (auth.uid() = user_id);

-- Index for faster queries
create index local_calendar_events_user_id_idx on local_calendar_events(user_id);
create index local_calendar_events_start_time_idx on local_calendar_events(start_time);
