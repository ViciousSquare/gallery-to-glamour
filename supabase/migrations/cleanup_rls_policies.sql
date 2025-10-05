-- Clean up RLS policies - remove duplicates and conflicts

-- Remove old/conflicting resource policies
DROP POLICY IF EXISTS "Enable read for all Users" ON resources;
DROP POLICY IF EXISTS "Enable ALL access for authenticated Users" ON resources;
DROP POLICY IF EXISTS "Admin users can view all resources" ON resources;
DROP POLICY IF EXISTS "Admin users can insert resources" ON resources;
DROP POLICY IF EXISTS "Admin users can update resources" ON resources;
DROP POLICY IF EXISTS "Admin users can delete resources" ON resources;

-- Remove old/conflicting coach policies  
DROP POLICY IF EXISTS "Admin users can view all coaches" ON coaches;
DROP POLICY IF EXISTS "Admin users can insert coaches" ON coaches;
DROP POLICY IF EXISTS "Admin users can update coaches" ON coaches;
DROP POLICY IF EXISTS "Admin users can delete coaches" ON coaches;

-- Keep only the authenticated user policies for resources and coaches
-- (The "Authenticated users can..." policies are the ones we want)

-- Add admin-only policy for updating user roles
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- Replace with more restrictive policies
CREATE POLICY "Users can update their own profile data" ON user_profiles 
FOR UPDATE USING (auth.uid() = id);

-- Admin can update any profile including roles
CREATE POLICY "Admins can update any profile" ON user_profiles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_profiles up 
    WHERE up.id = auth.uid() AND up.role = 'admin'
  )
);