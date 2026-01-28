-- Add pending confirmation columns to availabilities table
ALTER TABLE availabilities ADD COLUMN IF NOT EXISTS pending_slot jsonb;
-- pending_slot = {"start": "ISO date", "end": "ISO date"}

ALTER TABLE availabilities ADD COLUMN IF NOT EXISTS pending_status text DEFAULT null;
-- null | 'pending' | 'accepted' | 'declined'

-- Add index for pending status queries
CREATE INDEX IF NOT EXISTS idx_availabilities_pending_status ON availabilities(pending_status);

-- Comment for documentation
COMMENT ON COLUMN availabilities.pending_slot IS 'The proposed time slot awaiting candidate confirmation';
COMMENT ON COLUMN availabilities.pending_status IS 'Confirmation status: null=not requested, pending=awaiting response, accepted=confirmed, declined=rejected';
