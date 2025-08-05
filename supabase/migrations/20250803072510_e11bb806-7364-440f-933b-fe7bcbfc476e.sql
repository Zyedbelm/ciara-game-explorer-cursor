-- Add a manual repair function for journey data synchronization
-- This function reconstructs quiz_responses from step_completions for immediate fixes

CREATE OR REPLACE FUNCTION public.repair_journey_data(p_user_id uuid, p_journey_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  repair_result JSONB := '{}';
  step_record RECORD;
  quiz_responses_rebuilt JSONB := '[]'::jsonb;
  correct_total_points INTEGER := 0;
  step_count INTEGER := 0;
  updated_count INTEGER := 0;
BEGIN
  -- Log repair start
  PERFORM log_error('info', 'Starting manual journey data repair', 
    jsonb_build_object(
      'user_id', p_user_id,
      'journey_id', p_journey_id
    )
  );

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

  -- Update user_journey_progress with repaired data
  UPDATE public.user_journey_progress 
  SET 
    quiz_responses = quiz_responses_rebuilt,
    total_points_earned = correct_total_points,
    current_step_order = step_count + 1,
    status = CASE 
      WHEN step_count > 0 THEN 'in_progress'
      ELSE status
    END,
    updated_at = now()
  WHERE user_id = p_user_id 
    AND journey_id = p_journey_id;

  -- Check if any rows were updated
  GET DIAGNOSTICS updated_count = ROW_COUNT;

  -- Build result
  repair_result := jsonb_build_object(
    'success', true,
    'steps_processed', step_count,
    'records_updated', updated_count,
    'total_points_corrected', correct_total_points,
    'quiz_responses_rebuilt', jsonb_array_length(quiz_responses_rebuilt),
    'timestamp', now()
  );

  -- Log completion
  PERFORM log_error('info', 'Manual journey data repair completed', repair_result);

  RETURN repair_result;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and return failure
    PERFORM log_error('error', 'Manual journey data repair failed', 
      jsonb_build_object(
        'user_id', p_user_id,
        'journey_id', p_journey_id,
        'error', SQLERRM
      )
    );
    
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'timestamp', now()
    );
END;
$function$;