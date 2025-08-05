-- Data synchronization function to fix journey inconsistencies
-- This function will be called to clean up existing data

CREATE OR REPLACE FUNCTION public.synchronize_journey_data(p_user_id UUID, p_journey_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  sync_result JSONB := '{}';
  step_count INTEGER := 0;
  fixed_count INTEGER := 0;
  correct_total_points INTEGER := 0;
  quiz_responses_rebuilt JSONB := '[]'::jsonb;
  step_record RECORD;
BEGIN
  -- Get all valid step completions for this user-journey combination
  FOR step_record IN
    SELECT 
      sc.step_id,
      sc.points_earned,
      sc.completed_at,
      js.step_order - 1 as step_index  -- Convert to 0-based index
    FROM public.step_completions sc
    JOIN public.journey_steps js ON sc.step_id = js.step_id
    WHERE sc.user_id = p_user_id 
      AND sc.journey_id = p_journey_id
      AND js.journey_id = p_journey_id
    ORDER BY js.step_order
  LOOP
    -- Build quiz response object
    quiz_responses_rebuilt := quiz_responses_rebuilt || jsonb_build_object(
      'stepIndex', step_record.step_index,
      'stepId', step_record.step_id,
      'pointsEarned', step_record.points_earned,
      'completedAt', step_record.completed_at,
      'validationMethod', 'geolocation'
    );
    
    -- Add to total points
    correct_total_points := correct_total_points + COALESCE(step_record.points_earned, 0);
    step_count := step_count + 1;
  END LOOP;

  -- Update user_journey_progress with synchronized data
  UPDATE public.user_journey_progress 
  SET 
    quiz_responses = quiz_responses_rebuilt,
    total_points_earned = correct_total_points,
    current_step_order = step_count + 1,
    updated_at = now()
  WHERE user_id = p_user_id 
    AND journey_id = p_journey_id;

  -- Check if any rows were updated
  GET DIAGNOSTICS fixed_count = ROW_COUNT;

  -- Build result
  sync_result := jsonb_build_object(
    'success', true,
    'steps_processed', step_count,
    'records_updated', fixed_count,
    'total_points_corrected', correct_total_points,
    'timestamp', now()
  );

  RETURN sync_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'timestamp', now()
    );
END;
$$;

-- Function to run synchronization for all users and journeys with inconsistencies
CREATE OR REPLACE FUNCTION public.synchronize_all_journey_data()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  total_processed INTEGER := 0;
  total_fixed INTEGER := 0;
  progress_record RECORD;
  sync_result JSONB;
  final_result JSONB := '{}';
BEGIN
  -- Find all user_journey_progress records that might need synchronization
  FOR progress_record IN
    SELECT DISTINCT user_id, journey_id
    FROM public.user_journey_progress
    WHERE journey_id IN (SELECT DISTINCT id FROM public.journeys WHERE is_active = true)
  LOOP
    -- Run synchronization for each user-journey combination
    SELECT public.synchronize_journey_data(progress_record.user_id, progress_record.journey_id) INTO sync_result;
    
    total_processed := total_processed + 1;
    
    -- Check if synchronization was successful and made changes
    IF (sync_result->>'success')::boolean = true AND (sync_result->>'records_updated')::integer > 0 THEN
      total_fixed := total_fixed + 1;
    END IF;
  END LOOP;

  final_result := jsonb_build_object(
    'success', true,
    'total_processed', total_processed,
    'total_fixed', total_fixed,
    'timestamp', now(),
    'message', format('Processed %s journey progress records, fixed %s inconsistencies', total_processed, total_fixed)
  );

  RETURN final_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'total_processed', total_processed,
      'total_fixed', total_fixed,
      'timestamp', now()
    );
END;
$$;

-- Log the migration
PERFORM log_error('info', 'Journey data synchronization functions created', 
  jsonb_build_object(
    'functions_created', ARRAY['synchronize_journey_data', 'synchronize_all_journey_data'],
    'purpose', 'Fix step_completions and quiz_responses inconsistencies',
    'migration_timestamp', now()
  )
);

-- Note: To run the synchronization, execute: SELECT public.synchronize_all_journey_data();