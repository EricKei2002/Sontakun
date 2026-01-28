-- Add meeting URL columns to availabilities table
ALTER TABLE availabilities ADD COLUMN IF NOT EXISTS meeting_url text;
ALTER TABLE availabilities ADD COLUMN IF NOT EXISTS provider_event_id text;

-- Comments
COMMENT ON COLUMN availabilities.meeting_url IS 'Google Meet / Zoom の参加URL';
COMMENT ON COLUMN availabilities.provider_event_id IS 'Google Calendar イベントID（キャンセル・変更用）';
