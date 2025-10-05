-- Fix infinite recursion in user_profiles policies
-- Simple solution: just let users see their own profile, period.

-- Drop the conflicting policies that cause recursion
DROP POLICY IF EXISTS "Users can view own profile only" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;

-- Simple policy: users can only see their own profile
CREATE POLICY "Users see own profile" ON user_profiles
FOR SELECT USING (auth.uid() = id);