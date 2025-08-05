-- Fonction pour forcer la suppression des analytics_events pour une étape
CREATE OR REPLACE FUNCTION force_delete_analytics_for_step(step_id_param UUID)
RETURNS VOID AS $$
BEGIN
  -- Supprimer toutes les références dans analytics_events pour cette étape
  DELETE FROM analytics_events WHERE step_id = step_id_param;
  
  -- Log pour le débogage
  RAISE NOTICE 'Suppression forcée des analytics_events pour l''étape: %', step_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION force_delete_analytics_for_step(UUID) TO authenticated; 