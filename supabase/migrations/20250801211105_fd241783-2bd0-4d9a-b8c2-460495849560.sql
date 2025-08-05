-- Comprehensive user deletion - keep only zyed.elmeddeb@gmail.com and baptiste.e.1985@gmail.com
-- Handle all foreign key references

-- Step 1: Update journeys to remove creator references (set to NULL or reassign)
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
UPDATE public.journeys 
SET created_by = NULL 
WHERE created_by IN (SELECT id FROM users_to_delete);

-- Step 2: Update steps to remove creator references
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
UPDATE public.steps 
SET reviewed_by = NULL 
WHERE reviewed_by IN (SELECT id FROM users_to_delete);

-- Step 3: Delete analytics events
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
DELETE FROM public.analytics_events 
WHERE user_id IN (SELECT id FROM users_to_delete);

-- Step 4: Delete step completions
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

-- Step 5: Delete user journey progress
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

-- Step 6: Delete reward redemptions
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

-- Step 7: Delete chat sessions and messages
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

-- Step 8: Delete visitor notifications
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
DELETE FROM public.visitor_notifications 
WHERE user_id IN (SELECT id FROM users_to_delete);

-- Step 9: Delete notifications
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
DELETE FROM public.notifications 
WHERE user_id IN (SELECT id FROM users_to_delete);

-- Step 10: Delete from profiles table
DELETE FROM public.profiles 
WHERE email IN (
  'admin@ciara.app',
  'elmeddebfamily@gmail.com', 
  'lausanne@ciara.app',
  'staff@ciara.app'
);

-- Step 11: Finally delete from auth.users table
DELETE FROM auth.users 
WHERE email IN (
  'admin@ciara.app',
  'elmeddebfamily@gmail.com',
  'lausanne@ciara.app', 
  'staff@ciara.app'
);

-- Step 12: Verify remaining users
DO $$
DECLARE
  auth_count integer;
  profile_count integer;
BEGIN
  SELECT COUNT(*) INTO auth_count FROM auth.users WHERE deleted_at IS NULL;
  SELECT COUNT(*) INTO profile_count FROM public.profiles;
  
  RAISE NOTICE 'User cleanup completed successfully!';
  RAISE NOTICE '- Remaining auth users: %', auth_count;
  RAISE NOTICE '- Remaining profiles: %', profile_count;
  
  -- Show remaining emails for verification
  RAISE NOTICE 'Remaining users: %', (
    SELECT string_agg(email, ', ') 
    FROM auth.users 
    WHERE deleted_at IS NULL
  );
END $$;