-- Create profile for existing user
-- This will create a profile for your current user account

INSERT INTO user_profiles (id, email, role)
SELECT 
    id, 
    email, 
    'admin' as role
FROM auth.users 
WHERE email IS NOT NULL
ON CONFLICT (id) DO UPDATE SET
    role = 'admin';