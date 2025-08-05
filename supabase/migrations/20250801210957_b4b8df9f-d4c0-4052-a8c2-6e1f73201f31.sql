-- Delete specific users - keep only zyed.elmeddeb@gmail.com and baptiste.e.1985@gmail.com
-- Step 1: Delete from profiles table first (to avoid foreign key issues)
DELETE FROM public.profiles 
WHERE email IN (
  'admin@ciara.app',
  'elmeddebfamily@gmail.com', 
  'lausanne@ciara.app',
  'staff@ciara.app'
);

-- Step 2: Delete from auth.users table
DELETE FROM auth.users 
WHERE email IN (
  'admin@ciara.app',
  'elmeddebfamily@gmail.com',
  'lausanne@ciara.app', 
  'staff@ciara.app'
);

-- Step 3: Verify remaining users
DO $$
DECLARE
  auth_count integer;
  profile_count integer;
BEGIN
  SELECT COUNT(*) INTO auth_count FROM auth.users WHERE deleted_at IS NULL;
  SELECT COUNT(*) INTO profile_count FROM public.profiles;
  
  RAISE NOTICE 'Cleanup completed:';
  RAISE NOTICE '- Remaining auth users: %', auth_count;
  RAISE NOTICE '- Remaining profiles: %', profile_count;
  
  -- Show remaining emails for verification
  RAISE NOTICE 'Remaining auth users: %', (
    SELECT string_agg(email, ', ') 
    FROM auth.users 
    WHERE deleted_at IS NULL
  );
  
  RAISE NOTICE 'Remaining profiles: %', (
    SELECT string_agg(email, ', ') 
    FROM public.profiles
  );
END $$;