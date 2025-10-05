-- Fix user role back to admin  
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = '66e2b46c-7a74-486c-9237-1b66dace0627';