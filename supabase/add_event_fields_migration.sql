-- Add meeting_url and notes columns to local_calendar_events
alter table local_calendar_events 
  add column meeting_url text,
  add column notes text;
