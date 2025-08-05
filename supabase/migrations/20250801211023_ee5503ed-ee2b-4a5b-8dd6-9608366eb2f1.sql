-- Delete specific users - keep only zyed.elmeddeb@gmail.com and baptiste.e.1985@gmail.com
-- Step 1: Get user IDs we want to delete
WITH users_to_delete AS (
  SELECT id 
  FROM auth.users 
  WHERE email IN (
    'admin@ciara.app',
    'elmeddebfamily@gmail.com', 
    'lausanne@ciara.app',
    'staff@ciara.app'
  )
)
-- Step 2: Delete analytics events for these users first
DELETE FROM public.analytics_events 
WHERE user_id IN (SELECT id FROM users_to_delete);

-- Step 3: Delete other related data that might reference these users
WITH users_to_delete AS (
  SELECT id 
  FROM auth.users 
  WHERE email IN (
    'admin@ciara.app',
    'elmeddebfamily@gmail.com', 
    'lausanne@ciara.app',
    'staff@ciara.app'
  )
)
DELETE FROM public.step_completions 
WHERE user_id IN (SELECT id FROM users_to_delete);

WITH users_to_delete AS (
  SELECT id 
  FROM auth.users 
  WHERE email IN (
    'admin@ciara.app',
    'elmeddebfamily@gmail.com', 
    'lausanne@ciara.app',
    'staff@ciara.app'
  )
)
DELETE FROM public.user_journey_progress 
WHERE user_id IN (SELECT id FROM users_to_delete);

WITH users_to_delete AS (
  SELECT id 
  FROM auth.users 
  WHERE email IN (
    'admin@ciara.app',
    'elmeddebfamily@gmail.com', 
    'lausanne@ciara.app',
    'staff@ciara.app'
  )
)
DELETE FROM public.reward_redemptions 
WHERE user_id IN (SELECT id FROM users_to_delete);

WITH users_to_delete AS (
  SELECT id 
  FROM auth.users 
  WHERE email IN (
    'admin@ciara.app',
    'elmeddebfamily@gmail.com', 
    'lausanne@ciara.app',
    'staff@ciara.app'
  )
)
DELETE FROM public.chat_sessions 
WHERE user_id IN (SELECT id FROM users_to_delete);

-- Step 4: Delete from profiles table
DELETE FROM public.profiles 
WHERE email IN (
  'admin@ciara.app',
  'elmeddebfamily@gmail.com', 
  'lausanne@ciara.app',
  'staff@ciara.app'
);

-- Step 5: Delete from auth.users table
DELETE FROM auth.users 
WHERE email IN (
  'admin@ciara.app',
  'elmeddebfamily@gmail.com',
  'lausanne@ciara.app', 
  'staff@ciara.app'
);

-- Step 6: Verify remaining users
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
  RAISE NOTICE 'Remaining emails: %', (
    SELECT string_agg(email, ', ') 
    FROM auth.users 
    WHERE deleted_at IS NULL
  );
END $$;