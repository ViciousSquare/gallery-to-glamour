-- SIMPLE FIX: Remove all user profile dependencies and restore basic functionality

-- Disable the trigger that might be causing issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop all user_profiles related policies that might be blocking queries
DROP POLICY IF EXISTS "Anyone authenticated can view profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- Drop user_profiles table completely for now
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS user_invitations CASCADE;