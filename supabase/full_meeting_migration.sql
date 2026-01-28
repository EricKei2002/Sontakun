-- Add meeting provider column to availabilities table
ALTER TABLE availabilities ADD COLUMN IF NOT EXISTS meeting_provider text;

-- Add candidate email column (for email notifications)
ALTER TABLE availabilities ADD COLUMN IF NOT EXISTS candidate_email text;

-- Comments
COMMENT ON COLUMN availabilities.meeting_provider IS 'Meeting provider: google_meet or zoom';
COMMENT ON COLUMN availabilities.candidate_email IS 'Candidate email for notifications';
