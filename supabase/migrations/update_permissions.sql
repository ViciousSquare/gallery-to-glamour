-- Update RLS policies to allow regular users to manage resources and coaches
-- Only user management requires admin role

-- Resources table - allow all authenticated users to manage
DROP POLICY IF EXISTS "Only authenticated users can view resources" ON resources;
DROP POLICY IF EXISTS "Only authenticated users can insert resources" ON resources;
DROP POLICY IF EXISTS "Only authenticated users can update resources" ON resources;
DROP POLICY IF EXISTS "Only authenticated users can delete resources" ON resources;

CREATE POLICY "Authenticated users can view resources" ON resources FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert resources" ON resources FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update resources" ON resources FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete resources" ON resources FOR DELETE USING (true);

-- Coaches table - allow all authenticated users to manage
DROP POLICY IF EXISTS "Only authenticated users can view coaches" ON coaches;
DROP POLICY IF EXISTS "Only authenticated users can insert coaches" ON coaches;
DROP POLICY IF EXISTS "Only authenticated users can update coaches" ON coaches;
DROP POLICY IF EXISTS "Only authenticated users can delete coaches" ON coaches;

CREATE POLICY "Authenticated users can view coaches" ON coaches FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert coaches" ON coaches FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update coaches" ON coaches FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete coaches" ON coaches FOR DELETE USING (true);