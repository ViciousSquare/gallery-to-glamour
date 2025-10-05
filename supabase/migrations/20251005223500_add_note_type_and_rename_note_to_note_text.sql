-- Add note_type column to submission_notes table
ALTER TABLE submission_notes ADD COLUMN note_type TEXT DEFAULT 'general';

-- Add check constraint for note_type values
ALTER TABLE submission_notes ADD CONSTRAINT submission_notes_note_type_check
  CHECK (note_type IN ('call', 'email', 'meeting', 'general'));

-- Update any existing notes to have a default type if needed
UPDATE submission_notes SET note_type = 'general' WHERE note_type IS NULL;