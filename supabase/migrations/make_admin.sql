-- Make the first user (or your specific user) an admin
-- Replace 'your-email@example.com' with your actual email

-- Option 1: Make the first user admin
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id 
  FROM user_profiles 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- Option 2: Make specific user admin (uncomment and replace email)
-- UPDATE user_profiles 
-- SET role = 'admin' 
-- WHERE email = 'your-email@example.com';