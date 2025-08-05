-- Fix existing step_completions data by adding the correct journey_id
-- This will associate step completions with journeys based on the journey_steps table

UPDATE public.step_completions 
SET journey_id = (
  SELECT js.journey_id 
  FROM public.journey_steps js 
  WHERE js.step_id = step_completions.step_id 
  LIMIT 1
)
WHERE journey_id IS NULL 
AND step_id IN (
  SELECT DISTINCT step_id FROM public.journey_steps
);

-- Log the update
INSERT INTO public.system_logs (level, message, context)
VALUES (
  'info', 
  'Fixed step_completions journey_id associations', 
  jsonb_build_object(
    'updated_rows', (SELECT COUNT(*) FROM public.step_completions WHERE journey_id IS NOT NULL),
    'timestamp', now()
  )
);