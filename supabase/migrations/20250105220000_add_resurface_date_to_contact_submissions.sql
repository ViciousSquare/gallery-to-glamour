-- Add resurface_date column to contact_submissions if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'contact_submissions'
        AND column_name = 'resurface_date'
    ) THEN
        ALTER TABLE contact_submissions ADD COLUMN resurface_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;