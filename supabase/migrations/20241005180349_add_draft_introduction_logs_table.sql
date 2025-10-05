-- Create draft_introduction_logs table for rate limiting AI requests
CREATE TABLE IF NOT EXISTS draft_introduction_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES contact_submissions(id) ON DELETE CASCADE,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  estimated_cost DECIMAL(10,6) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE draft_introduction_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own logs
CREATE POLICY "Users can manage their own draft logs" ON draft_introduction_logs
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_draft_logs_user_id ON draft_introduction_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_draft_logs_created_at ON draft_introduction_logs(created_at DESC);