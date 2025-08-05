-- Add acquired_at field to user_journey_progress for temporary acquisition system
ALTER TABLE public.user_journey_progress 
ADD COLUMN acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_journey_progress_acquired_at ON public.user_journey_progress(acquired_at);
CREATE INDEX IF NOT EXISTS idx_user_journey_progress_completed_at ON public.user_journey_progress(completed_at);

-- Create function to clean up unacquired completed journeys after 48 hours
CREATE OR REPLACE FUNCTION public.cleanup_unacquired_journeys()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count INTEGER := 0;
  step_completion_count INTEGER := 0;
BEGIN
  -- Log cleanup start
  PERFORM log_error('info', 'Starting cleanup of unacquired journeys', '{}'::jsonb);
  
  -- Get count of journeys to be cleaned up
  SELECT COUNT(*) INTO deleted_count
  FROM public.user_journey_progress 
  WHERE is_completed = true 
    AND acquired_at IS NULL 
    AND completed_at < now() - INTERVAL '48 hours';
  
  IF deleted_count > 0 THEN
    -- Clean up step completions for these journeys
    DELETE FROM public.step_completions 
    WHERE user_id IN (
      SELECT DISTINCT user_id 
      FROM public.user_journey_progress ujp
      JOIN public.journey_steps js ON ujp.journey_id = js.journey_id
      WHERE ujp.is_completed = true 
        AND ujp.acquired_at IS NULL 
        AND ujp.completed_at < now() - INTERVAL '48 hours'
    ) AND step_id IN (
      SELECT DISTINCT js.step_id
      FROM public.user_journey_progress ujp
      JOIN public.journey_steps js ON ujp.journey_id = js.journey_id
      WHERE ujp.is_completed = true 
        AND ujp.acquired_at IS NULL 
        AND ujp.completed_at < now() - INTERVAL '48 hours'
    );
    
    GET DIAGNOSTICS step_completion_count = ROW_COUNT;
    
    -- Delete the unacquired completed journeys
    DELETE FROM public.user_journey_progress 
    WHERE is_completed = true 
      AND acquired_at IS NULL 
      AND completed_at < now() - INTERVAL '48 hours';
    
    -- Recalculate user points for affected users
    UPDATE public.profiles 
    SET total_points = (
      SELECT COALESCE(SUM(points_earned), 0) 
      FROM public.step_completions 
      WHERE user_id = profiles.user_id
    ),
    updated_at = now()
    WHERE user_id IN (
      SELECT DISTINCT user_id 
      FROM public.step_completions
    );
    
    PERFORM log_error('info', 'Cleanup completed', 
      jsonb_build_object(
        'deleted_journeys', deleted_count,
        'deleted_step_completions', step_completion_count
      )
    );
  END IF;
  
  RETURN 'Cleaned up ' || deleted_count || ' unacquired journeys and ' || step_completion_count || ' step completions';
END;
$function$;

-- Create function for complete journey deletion (cascade delete)
CREATE OR REPLACE FUNCTION public.delete_user_journey_completely(p_user_id UUID, p_journey_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  step_ids UUID[];
  deleted_steps INTEGER := 0;
  deleted_progress INTEGER := 0;
  points_removed INTEGER := 0;
BEGIN
  -- Get all step IDs for this journey
  SELECT ARRAY_AGG(js.step_id) INTO step_ids
  FROM public.journey_steps js
  WHERE js.journey_id = p_journey_id;
  
  -- Get points that will be removed
  SELECT COALESCE(SUM(sc.points_earned), 0) INTO points_removed
  FROM public.step_completions sc
  WHERE sc.user_id = p_user_id 
    AND sc.step_id = ANY(step_ids);
  
  -- Delete step completions for this journey
  DELETE FROM public.step_completions 
  WHERE user_id = p_user_id 
    AND step_id = ANY(step_ids);
  
  GET DIAGNOSTICS deleted_steps = ROW_COUNT;
  
  -- Delete journey progress
  DELETE FROM public.user_journey_progress 
  WHERE user_id = p_user_id 
    AND journey_id = p_journey_id;
  
  GET DIAGNOSTICS deleted_progress = ROW_COUNT;
  
  -- Update user total points
  UPDATE public.profiles 
  SET total_points = GREATEST(0, total_points - points_removed),
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Log the deletion
  PERFORM log_error('info', 'Complete journey deletion performed', 
    jsonb_build_object(
      'user_id', p_user_id,
      'journey_id', p_journey_id,
      'deleted_steps', deleted_steps,
      'deleted_progress', deleted_progress,
      'points_removed', points_removed
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'deleted_steps', deleted_steps,
    'deleted_progress', deleted_progress,
    'points_removed', points_removed
  );
END;
$function$;

-- Create function to reset journey for replay (clean slate)
CREATE OR REPLACE FUNCTION public.reset_journey_for_replay(p_user_id UUID, p_journey_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  step_ids UUID[];
  deleted_steps INTEGER := 0;
  points_removed INTEGER := 0;
  progress_id UUID;
BEGIN
  -- Get all step IDs for this journey
  SELECT ARRAY_AGG(js.step_id) INTO step_ids
  FROM public.journey_steps js
  WHERE js.journey_id = p_journey_id;
  
  -- Get points that will be removed
  SELECT COALESCE(SUM(sc.points_earned), 0) INTO points_removed
  FROM public.step_completions sc
  WHERE sc.user_id = p_user_id 
    AND sc.step_id = ANY(step_ids);
  
  -- Delete existing step completions for this journey
  DELETE FROM public.step_completions 
  WHERE user_id = p_user_id 
    AND step_id = ANY(step_ids);
  
  GET DIAGNOSTICS deleted_steps = ROW_COUNT;
  
  -- Reset journey progress to start
  UPDATE public.user_journey_progress 
  SET current_step_order = 1,
      total_points_earned = 0,
      is_completed = false,
      completed_at = NULL,
      acquired_at = NULL,
      quiz_responses = '[]'::jsonb,
      status = 'in_progress',
      updated_at = now()
  WHERE user_id = p_user_id 
    AND journey_id = p_journey_id
  RETURNING id INTO progress_id;
  
  -- Update user total points
  UPDATE public.profiles 
  SET total_points = GREATEST(0, total_points - points_removed),
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Log the reset
  PERFORM log_error('info', 'Journey reset for replay', 
    jsonb_build_object(
      'user_id', p_user_id,
      'journey_id', p_journey_id,
      'deleted_steps', deleted_steps,
      'points_removed', points_removed,
      'progress_id', progress_id
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'deleted_steps', deleted_steps,
    'points_removed', points_removed,
    'progress_id', progress_id
  );
END;
$function$;