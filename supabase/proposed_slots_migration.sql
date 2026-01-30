-- Add proposed_slots JSONB column to interviews table
ALTER TABLE interviews 
ADD COLUMN IF NOT EXISTS proposed_slots JSONB DEFAULT NULL;

-- Description of the column format (Documentation only)
COMMENT ON COLUMN interviews.proposed_slots IS 'Array of proposed time slots. Example: [{"date": "2026-02-01", "start": "10:00", "end": "12:00"}]';
