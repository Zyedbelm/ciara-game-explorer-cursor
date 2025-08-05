-- Additional Test Data - User Profiles and Progress
-- This script creates test user profiles and journey progress for development and testing

-- ============================
-- TEST USER PROFILES
-- ============================

-- Note: This script assumes auth.users table exists with test users
-- In a real environment, users would be created through Supabase Auth

-- Create test profiles for different user types
INSERT INTO public.profiles (user_id, email, first_name, last_name, role, city_id, preferred_languages, fitness_level, interests, available_time, total_points, current_level, badges_earned)
SELECT 
  user_data.user_id::uuid,
  user_data.email,
  user_data.first_name,
  user_data.last_name,
  user_data.role::user_role,
  cities.id,
  user_data.preferred_languages::text[],
  user_data.fitness_level,
  user_data.interests::journey_type[],
  user_data.available_time,
  user_data.total_points,
  user_data.current_level,
  user_data.badges_earned::text[]
FROM public.cities
CROSS JOIN (VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'marie.dubois@example.com', 'Marie', 'Dubois', 'visitor', ARRAY['fr', 'en'], 4, ARRAY['museums', 'art_culture'], 180, 250, 3, ARRAY['Explorer', 'Curieux']),
  ('550e8400-e29b-41d4-a716-446655440002', 'jean.martin@example.com', 'Jean', 'Martin', 'visitor', ARRAY['fr'], 3, ARRAY['hiking', 'nature'], 240, 450, 5, ARRAY['Randonneur', 'Aventurier', 'Nature']),
  ('550e8400-e29b-41d4-a716-446655440003', 'sophie.bernard@example.com', 'Sophie', 'Bernard', 'visitor', ARRAY['fr', 'en', 'de'], 2, ARRAY['gastronomy', 'museums'], 120, 180, 2, ARRAY['Gourmet']),
  ('550e8400-e29b-41d4-a716-446655440004', 'pierre.rousseau@example.com', 'Pierre', 'Rousseau', 'visitor', ARRAY['fr'], 5, ARRAY['adventure', 'hiking'], 300, 650, 7, ARRAY['Aventurier', 'Expert', 'Montagnard']),
  ('550e8400-e29b-41d4-a716-446655440005', 'admin@lausanne.ch', 'Admin', 'Lausanne', 'tenant_admin', ARRAY['fr', 'en'], 3, ARRAY['museums', 'art_culture'], 120, 50, 1, ARRAY['Administrateur'])
) AS user_data(user_id, email, first_name, last_name, role, preferred_languages, fitness_level, interests, available_time, total_points, current_level, badges_earned)
WHERE cities.slug = 'lausanne' -- Assign all test users to Lausanne
ON CONFLICT (user_id) DO NOTHING;

-- ============================
-- TEST JOURNEY PROGRESS
-- ============================

-- Create journey progress for test users
INSERT INTO public.user_journey_progress (user_id, journey_id, current_step_index, completed_steps, total_points_earned, status, completion_time_minutes, quiz_score)
SELECT 
  p.user_id,
  j.id,
  CASE 
    WHEN progress_data.status = 'completed' THEN (SELECT COUNT(*) FROM public.journey_steps js WHERE js.journey_id = j.id) - 1
    ELSE progress_data.current_step_index
  END,
  CASE 
    WHEN progress_data.status = 'completed' THEN (SELECT array_agg(js.step_order) FROM public.journey_steps js WHERE js.journey_id = j.id)
    ELSE progress_data.completed_steps::integer[]
  END,
  progress_data.total_points_earned,
  progress_data.status,
  progress_data.completion_time_minutes,
  progress_data.quiz_score
FROM public.profiles p
CROSS JOIN public.journeys j
CROSS JOIN (VALUES
  (2, ARRAY[1, 2], 85, 'in_progress', NULL, 78.5),
  (4, ARRAY[1, 2, 3, 4], 180, 'completed', 145, 92.3),
  (1, ARRAY[1], 25, 'in_progress', NULL, 65.0),
  (0, ARRAY[]::integer[], 0, 'in_progress', NULL, 0.0)
) AS progress_data(current_step_index, completed_steps, total_points_earned, status, completion_time_minutes, quiz_score)
WHERE p.role = 'visitor' AND j.city_id = p.city_id
AND random() < 0.3 -- Only create progress for 30% of user-journey combinations
LIMIT 20; -- Limit to reasonable number of progress records

-- ============================
-- TEST STEP COMPLETIONS
-- ============================

-- Create step completions for users with journey progress
INSERT INTO public.step_completions (user_id, step_id, journey_id, points_earned, bonus_points, quiz_score, quiz_perfect, quiz_time_seconds, verified_location)
SELECT 
  ujp.user_id,
  js.step_id,
  ujp.journey_id,
  s.points_awarded,
  CASE WHEN random() < 0.3 THEN 10 ELSE 0 END, -- 30% chance of bonus points
  FLOOR(random() * 25 + 5)::integer, -- Quiz score between 5-30
  random() < 0.2, -- 20% chance of perfect quiz
  FLOOR(random() * 60 + 15)::integer, -- Quiz time between 15-75 seconds
  random() < 0.8 -- 80% chance of verified location
FROM public.user_journey_progress ujp
JOIN public.journey_steps js ON ujp.journey_id = js.journey_id
JOIN public.steps s ON js.step_id = s.id
WHERE js.step_order = ANY(ujp.completed_steps)
ON CONFLICT (user_id, step_id, journey_id) DO NOTHING;

-- ============================
-- TEST REWARD REDEMPTIONS
-- ============================

-- Create some reward redemptions for active users
INSERT INTO public.reward_redemptions (user_id, reward_id, points_spent, redemption_code, status, expires_at)
SELECT 
  p.user_id,
  r.id,
  r.points_required,
  'TEST-' || UPPER(substring(md5(random()::text) from 1 for 8)),
  redemption_data.status,
  CASE 
    WHEN redemption_data.status = 'pending' THEN now() + interval '30 days'
    ELSE now() + interval '7 days'
  END
FROM public.profiles p
JOIN public.partners part ON part.city_id = p.city_id
JOIN public.rewards r ON r.partner_id = part.id
CROSS JOIN (VALUES
  ('pending'),
  ('validated'),
  ('pending')
) AS redemption_data(status)
WHERE p.role = 'visitor' AND p.total_points >= r.points_required
AND random() < 0.1 -- Only 10% chance of redemption
LIMIT 15; -- Limit to reasonable number

-- ============================
-- UPDATE STATISTICS
-- ============================

-- Update user total points based on completions
UPDATE public.profiles SET total_points = (
  SELECT COALESCE(SUM(sc.points_earned + sc.bonus_points), 0)
  FROM public.step_completions sc
  WHERE sc.user_id = profiles.user_id
) + 
CASE 
  WHEN role = 'visitor' THEN FLOOR(random() * 100) -- Add some random base points
  ELSE 0
END
WHERE role = 'visitor';

-- Update user levels based on points
UPDATE public.profiles SET current_level = 
  CASE 
    WHEN total_points >= 500 THEN 7
    WHEN total_points >= 400 THEN 6
    WHEN total_points >= 300 THEN 5
    WHEN total_points >= 200 THEN 4
    WHEN total_points >= 100 THEN 3
    WHEN total_points >= 50 THEN 2
    ELSE 1
  END
WHERE role = 'visitor';

-- Add more badges based on achievements
UPDATE public.profiles SET badges_earned = badges_earned || 
  CASE 
    WHEN total_points >= 500 THEN ARRAY['Expert', 'Collectionneur']
    WHEN total_points >= 300 THEN ARRAY['Passionné']
    WHEN total_points >= 200 THEN ARRAY['Découvreur']
    WHEN total_points >= 100 THEN ARRAY['Novice']
    ELSE ARRAY[]::text[]
  END
WHERE role = 'visitor';