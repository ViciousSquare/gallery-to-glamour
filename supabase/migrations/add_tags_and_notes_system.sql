-- Add tags and notes system for contact submissions

-- Create submission_tags table
CREATE TABLE IF NOT EXISTS submission_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID NOT NULL REFERENCES contact_submissions(id) ON DELETE CASCADE,
    tag_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create submission_notes table
CREATE TABLE IF NOT EXISTS submission_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID NOT NULL REFERENCES contact_submissions(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_submission_tags_submission_id ON submission_tags(submission_id);
CREATE INDEX IF NOT EXISTS idx_submission_notes_submission_id ON submission_notes(submission_id);

-- Enable Row Level Security
ALTER TABLE submission_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for submission_tags
CREATE POLICY "Authenticated users can view submission tags" ON submission_tags
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert submission tags" ON submission_tags
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete submission tags" ON submission_tags
    FOR DELETE TO authenticated
    USING (true);

-- Create RLS policies for submission_notes
CREATE POLICY "Authenticated users can view submission notes" ON submission_notes
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert submission notes" ON submission_notes
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update submission notes" ON submission_notes
    FOR UPDATE TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can delete submission notes" ON submission_notes
    FOR DELETE TO authenticated
    USING (true);

-- Add trigger to update updated_at on submission_notes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_submission_notes_updated_at 
    BEFORE UPDATE ON submission_notes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();