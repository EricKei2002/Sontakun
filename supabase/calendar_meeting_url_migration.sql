-- Add meeting_url column to local_calendar_events table
ALTER TABLE local_calendar_events ADD COLUMN IF NOT EXISTS meeting_url text;

-- Comment
COMMENT ON COLUMN local_calendar_events.meeting_url IS 'Meeting URL (Zoom or Google Meet)';
