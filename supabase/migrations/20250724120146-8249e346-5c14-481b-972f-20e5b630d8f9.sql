-- Synchroniser les points existants pour tous les utilisateurs
DO $$
DECLARE
  user_record RECORD;
  calculated_points integer;
  updated_count integer := 0;
BEGIN
  -- Pour chaque utilisateur dans profiles
  FOR user_record IN 
    SELECT user_id, total_points as current_points FROM public.profiles
  LOOP
    -- Calculer les points réels depuis step_completions
    SELECT COALESCE(SUM(points_earned), 0) 
    INTO calculated_points
    FROM public.step_completions 
    WHERE user_id = user_record.user_id;
    
    -- Si les points calculés diffèrent des points actuels, mettre à jour
    IF calculated_points != COALESCE(user_record.current_points, 0) THEN
      UPDATE public.profiles 
      SET 
        total_points = calculated_points,
        updated_at = now()
      WHERE user_id = user_record.user_id;
      
      updated_count := updated_count + 1;
      RAISE LOG 'Synchronized points for user %: % points (was %)', 
        user_record.user_id, calculated_points, user_record.current_points;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Points synchronization completed: updated % users', updated_count;
END;
$$;