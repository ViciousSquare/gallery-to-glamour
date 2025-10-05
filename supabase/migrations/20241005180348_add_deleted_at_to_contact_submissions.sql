-- Add deleted_at column for soft deletes
ALTER TABLE contact_submissions ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- Create index for deleted_at
CREATE INDEX IF NOT EXISTS idx_contact_submissions_deleted_at ON contact_submissions(deleted_at);

-- Update RLS policy to exclude deleted records by default
DROP POLICY IF EXISTS "Allow authenticated users to manage submissions" ON contact_submissions;
CREATE POLICY "Allow authenticated users to manage submissions" ON contact_submissions
  FOR ALL USING (auth.role() = 'authenticated' AND deleted_at IS NULL);