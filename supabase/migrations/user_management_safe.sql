-- Fix user_profiles policies - only admins should manage user profiles

-- Drop all current user_profiles policies
DROP POLICY IF EXISTS "Users can only insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile data" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;

-- Create admin-only policies
-- Only admins can view user profiles
CREATE POLICY "Only admins can view profiles" ON user_profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles up 
    WHERE up.id = auth.uid() AND up.role = 'admin'
  )
);

-- Only admins can update user profiles (including roles)
CREATE POLICY "Only admins can update profiles" ON user_profiles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_profiles up 
    WHERE up.id = auth.uid() AND up.role = 'admin'
  )
);

-- Only the trigger should insert profiles (on user signup)
-- No INSERT policy needed - trigger runs with elevated privileges