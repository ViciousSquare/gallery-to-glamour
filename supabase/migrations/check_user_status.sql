-- Check current user and profile status
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created,
  up.role,
  up.created_at as profile_created
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.email IS NOT NULL;

-- If your profile doesn't exist or role is 'user', run this:
-- UPDATE user_profiles SET role = 'admin' WHERE email = 'your-email@domain.com';