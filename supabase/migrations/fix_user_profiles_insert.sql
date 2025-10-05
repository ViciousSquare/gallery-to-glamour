-- Fix user_profiles INSERT policy - too permissive currently

-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Only authenticated users can insert" ON user_profiles;

-- Replace with much more restrictive policy
-- Only allow users to insert their own profile (matching their auth.uid())
CREATE POLICY "Users can only insert their own profile" ON user_profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- This way:
-- 1. The trigger creates profiles automatically on signup ✓
-- 2. If trigger fails, users can only create their own profile ✓  
-- 3. Users cannot create profiles for other people ✓