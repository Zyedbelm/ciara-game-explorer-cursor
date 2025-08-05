-- Clean Test Data Script
-- This script removes all test data while preserving the original Sion data and schema

-- ============================
-- CLEAN TEST DATA
-- ============================

-- Remove test data in reverse order of dependencies
DELETE FROM public.reward_redemptions 
WHERE reward_id IN (
  SELECT r.id FROM public.rewards r 
  JOIN public.partners p ON r.partner_id = p.id 
  WHERE p.city_id IN (SELECT id FROM public.cities WHERE slug != 'sion')
);

DELETE FROM public.step_completions 
WHERE step_id IN (
  SELECT id FROM public.steps 
  WHERE city_id IN (SELECT id FROM public.cities WHERE slug != 'sion')
);

DELETE FROM public.user_journey_progress 
WHERE journey_id IN (
  SELECT id FROM public.journeys 
  WHERE city_id IN (SELECT id FROM public.cities WHERE slug != 'sion')
);

DELETE FROM public.rewards 
WHERE partner_id IN (
  SELECT id FROM public.partners 
  WHERE city_id IN (SELECT id FROM public.cities WHERE slug != 'sion')
);

DELETE FROM public.partners 
WHERE city_id IN (SELECT id FROM public.cities WHERE slug != 'sion');

DELETE FROM public.quiz_questions 
WHERE step_id IN (
  SELECT id FROM public.steps 
  WHERE city_id IN (SELECT id FROM public.cities WHERE slug != 'sion')
);

DELETE FROM public.content_documents 
WHERE step_id IN (
  SELECT id FROM public.steps 
  WHERE city_id IN (SELECT id FROM public.cities WHERE slug != 'sion')
);

DELETE FROM public.journey_steps 
WHERE journey_id IN (
  SELECT id FROM public.journeys 
  WHERE city_id IN (SELECT id FROM public.cities WHERE slug != 'sion')
);

DELETE FROM public.journeys 
WHERE city_id IN (SELECT id FROM public.cities WHERE slug != 'sion');

DELETE FROM public.journey_categories 
WHERE city_id IN (SELECT id FROM public.cities WHERE slug != 'sion');

DELETE FROM public.steps 
WHERE city_id IN (SELECT id FROM public.cities WHERE slug != 'sion');

-- Remove test user profiles (keep admin profiles)
DELETE FROM public.profiles 
WHERE user_id IN (
  SELECT user_id FROM public.profiles 
  WHERE email LIKE '%@example.com' OR role = 'visitor'
);

-- Remove test cities (keep Sion)
DELETE FROM public.cities WHERE slug != 'sion';

-- Drop test-specific indexes
DROP INDEX IF EXISTS idx_test_data_city_steps;
DROP INDEX IF EXISTS idx_test_data_city_partners;
DROP INDEX IF EXISTS idx_test_data_journey_steps;

-- Reset sequences if needed
-- Note: This is optional and depends on your needs
-- ALTER SEQUENCE IF EXISTS cities_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS steps_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS journeys_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS partners_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS rewards_id_seq RESTART WITH 1;