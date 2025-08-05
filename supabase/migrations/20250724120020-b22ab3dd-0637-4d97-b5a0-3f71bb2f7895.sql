-- Audit et correction du système de points

-- Étape 1: Supprimer les anciens triggers défaillants
DROP TRIGGER IF EXISTS update_user_total_points_trigger ON step_completions;
DROP TRIGGER IF EXISTS update_user_points_on_completion_delete ON step_completions;
DROP TRIGGER IF EXISTS update_user_points_trigger ON step_completions;
DROP TRIGGER IF EXISTS update_user_points_on_delete_trigger ON step_completions;

-- Étape 2: Supprimer les anciennes fonctions
DROP FUNCTION IF EXISTS update_user_total_points();
DROP FUNCTION IF EXISTS update_user_total_points_on_delete();

-- Étape 3: Créer une fonction robuste pour mettre à jour les points
CREATE OR REPLACE FUNCTION update_user_total_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  total_points_calc integer;
  user_exists boolean;
BEGIN
  -- Vérifier que l'utilisateur existe dans la table profiles
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE user_id = NEW.user_id) INTO user_exists;
  
  IF NOT user_exists THEN
    RAISE LOG 'User % not found in profiles table, skipping points update', NEW.user_id;
    RETURN NEW;
  END IF;

  -- Calculer le total des points pour l'utilisateur
  SELECT COALESCE(SUM(points_earned), 0) 
  INTO total_points_calc
  FROM public.step_completions 
  WHERE user_id = NEW.user_id;
  
  -- Mettre à jour les points totaux dans la table profiles
  UPDATE public.profiles 
  SET 
    total_points = total_points_calc,
    updated_at = now()
  WHERE user_id = NEW.user_id;
  
  -- Vérifier si la mise à jour a réussi
  IF NOT FOUND THEN
    RAISE LOG 'Failed to update total points for user %', NEW.user_id;
    RETURN NEW;
  END IF;
  
  -- Log de succès
  RAISE LOG 'Updated total points for user %: % points', NEW.user_id, total_points_calc;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log d'erreur mais ne pas faire échouer le trigger
    RAISE LOG 'Error updating total points for user %: %', NEW.user_id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Étape 4: Créer une fonction pour la suppression de step_completions
CREATE OR REPLACE FUNCTION update_user_total_points_on_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  total_points_calc integer;
BEGIN
  -- Calculer le total des points pour l'utilisateur après suppression
  SELECT COALESCE(SUM(points_earned), 0) 
  INTO total_points_calc
  FROM public.step_completions 
  WHERE user_id = OLD.user_id;
  
  -- Mettre à jour les points totaux dans la table profiles
  UPDATE public.profiles 
  SET 
    total_points = total_points_calc,
    updated_at = now()
  WHERE user_id = OLD.user_id;
  
  RAISE LOG 'Updated total points for user % after deletion: % points', OLD.user_id, total_points_calc;
  
  RETURN OLD;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error updating total points after deletion for user %: %', OLD.user_id, SQLERRM;
    RETURN OLD;
END;
$$;

-- Étape 5: Créer les nouveaux triggers
CREATE TRIGGER update_user_points_after_insert
  AFTER INSERT ON public.step_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_total_points();

CREATE TRIGGER update_user_points_after_update
  AFTER UPDATE ON public.step_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_total_points();

CREATE TRIGGER update_user_points_after_delete
  AFTER DELETE ON public.step_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_total_points_on_delete();

-- Étape 6: Synchroniser les points existants pour tous les utilisateurs
DO $$
DECLARE
  user_record RECORD;
  calculated_points integer;
BEGIN
  -- Pour chaque utilisateur dans profiles
  FOR user_record IN 
    SELECT user_id FROM public.profiles
  LOOP
    -- Calculer les points réels depuis step_completions
    SELECT COALESCE(SUM(points_earned), 0) 
    INTO calculated_points
    FROM public.step_completions 
    WHERE user_id = user_record.user_id;
    
    -- Mettre à jour le profil
    UPDATE public.profiles 
    SET 
      total_points = calculated_points,
      updated_at = now()
    WHERE user_id = user_record.user_id;
    
    RAISE LOG 'Synchronized points for user %: % points', user_record.user_id, calculated_points;
  END LOOP;
  
  RAISE NOTICE 'Points synchronization completed for all users';
END;
$$;