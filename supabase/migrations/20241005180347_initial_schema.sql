-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  url TEXT,
  eligibility TEXT,
  deadline TEXT,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coaches table
CREATE TABLE IF NOT EXISTS coaches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  linkedin_url TEXT,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  role TEXT,
  interest_area TEXT,
  goals TEXT,
  status TEXT DEFAULT 'new',
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  resurface_date TIMESTAMP WITH TIME ZONE
);

-- Drop existing check constraint if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'contact_submissions_status_check') THEN
    ALTER TABLE contact_submissions DROP CONSTRAINT contact_submissions_status_check;
  END IF;
END $$;

-- Update any invalid status values to 'new'
UPDATE contact_submissions SET status = 'new' WHERE status NOT IN ('new', 'lead', 'client', 'closed');

-- Add the correct check constraint (ignore if it already exists)
DO $$
BEGIN
  ALTER TABLE contact_submissions ADD CONSTRAINT status_check CHECK (status IN ('new', 'lead', 'client', 'closed'));
EXCEPTION
  WHEN duplicate_object THEN
    -- Constraint already exists, do nothing
    NULL;
END $$;

-- Create submission_notes table
CREATE TABLE IF NOT EXISTS submission_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES contact_submissions(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_featured ON resources(featured);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_coaches_display_order ON coaches(display_order);
CREATE INDEX IF NOT EXISTS idx_coaches_active ON coaches(active);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);

CREATE INDEX IF NOT EXISTS idx_submission_notes_submission_id ON submission_notes(submission_id);
CREATE INDEX IF NOT EXISTS idx_submission_notes_created_at ON submission_notes(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (admin access)
CREATE POLICY "Allow authenticated users to manage resources" ON resources
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage coaches" ON coaches
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage submissions" ON contact_submissions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage submission notes" ON submission_notes
  FOR ALL USING (auth.role() = 'authenticated');

-- Allow public to insert contact submissions
CREATE POLICY "Allow public to insert contact submissions" ON contact_submissions
  FOR INSERT WITH CHECK (true);