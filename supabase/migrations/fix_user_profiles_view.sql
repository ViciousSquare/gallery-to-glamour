-- Fix user profiles policies - only admins should access, but users need their own profile for AuthContext

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Only admins can view profiles" ON user_profiles;

-- Users can only see their own profile (needed for AuthContext to work)
CREATE POLICY "Users can view own profile only" ON user_profiles
FOR SELECT USING (auth.uid() = id);

-- Admins can see all profiles (for user management)
CREATE POLICY "Admins can view all profiles" ON user_profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles up 
    WHERE up.id = auth.uid() AND up.role = 'admin'
  )
);