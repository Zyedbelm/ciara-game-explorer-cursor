-- Corriger temporairement le trigger d'audit pour gérer les tables sans colonne 'id'
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  record_id_value uuid;
BEGIN
  -- Essayer d'obtenir l'ID depuis la structure appropriée
  BEGIN
    IF TG_OP = 'INSERT' THEN
      record_id_value := NEW.id;
    ELSIF TG_OP = 'UPDATE' THEN
      record_id_value := NEW.id;
    ELSIF TG_OP = 'DELETE' THEN
      record_id_value := OLD.id;
    END IF;
  EXCEPTION
    WHEN undefined_column THEN
      -- Si la colonne 'id' n'existe pas, utiliser NULL
      record_id_value := NULL;
  END;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.admin_audit_log (
      table_name,
      action,
      record_id,
      new_values,
      user_id,
      ip_address
    ) VALUES (
      TG_TABLE_NAME,
      TG_OP,
      record_id_value,
      to_jsonb(NEW),
      auth.uid(),
      inet_client_addr()
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.admin_audit_log (
      table_name,
      action,
      record_id,
      old_values,
      new_values,
      user_id,
      ip_address
    ) VALUES (
      TG_TABLE_NAME,
      TG_OP,
      record_id_value,
      to_jsonb(OLD),
      to_jsonb(NEW),
      auth.uid(),
      inet_client_addr()
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.admin_audit_log (
      table_name,
      action,
      record_id,
      old_values,
      user_id,
      ip_address
    ) VALUES (
      TG_TABLE_NAME,
      TG_OP,
      record_id_value,
      to_jsonb(OLD),
      auth.uid(),
      inet_client_addr()
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Maintenant synchroniser les points
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