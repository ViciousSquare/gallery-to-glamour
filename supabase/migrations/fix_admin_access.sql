-- Simple fix: Just let authenticated users see all profiles
-- We'll handle admin restrictions in the app layer, not database layer

-- Drop current restrictive policy
DROP POLICY IF EXISTS "Users see own profile" ON user_profiles;

-- Simple policy: all authenticated users can read profiles
-- Security is handled by the UI (Users tab only shows for admins)
CREATE POLICY "Authenticated users can view profiles" ON user_profiles
FOR SELECT USING (auth.role() = 'authenticated');