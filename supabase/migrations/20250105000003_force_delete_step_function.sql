-- Fonction RPC pour forcer la suppression d'une étape
-- Nettoie toutes les relations avant suppression
CREATE OR REPLACE FUNCTION force_delete_step(step_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  step_exists BOOLEAN;
  analytics_count INTEGER;
  journey_steps_count INTEGER;
BEGIN
  -- Vérifier que l'étape existe
  SELECT EXISTS(SELECT 1 FROM steps WHERE id = step_id_param) INTO step_exists;
  
  IF NOT step_exists THEN
    RAISE EXCEPTION 'Step with ID % does not exist', step_id_param;
  END IF;

  -- Log pour debugging
  RAISE NOTICE '🧹 Starting forced deletion of step: %', step_id_param;

  -- 1. Supprimer analytics_events (pas de CASCADE)
  DELETE FROM analytics_events WHERE step_id = step_id_param;
  GET DIAGNOSTICS analytics_count = ROW_COUNT;
  RAISE NOTICE '📊 Deleted % analytics_events', analytics_count;

  -- 2. Supprimer journey_steps (pas de CASCADE)
  DELETE FROM journey_steps WHERE step_id = step_id_param;
  GET DIAGNOSTICS journey_steps_count = ROW_COUNT;
  RAISE NOTICE '🛤️ Deleted % journey_steps', journey_steps_count;

  -- 3. Supprimer l'étape (CASCADE gère le reste)
  DELETE FROM steps WHERE id = step_id_param;
  
  RAISE NOTICE '✅ Step % successfully deleted', step_id_param;
  RETURN TRUE;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error deleting step %: %', step_id_param, SQLERRM;
    RETURN FALSE;
END;
$$;

-- Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION force_delete_step(UUID) TO authenticated;
