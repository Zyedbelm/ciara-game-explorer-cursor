-- Update RLS policy for journey_steps to allow users to manage steps for their own personal journeys
DROP POLICY IF EXISTS "Only content managers can modify journey steps" ON public.journey_steps;

CREATE POLICY "Content managers and users can manage journey steps" 
ON public.journey_steps 
FOR ALL 
USING (
  CASE 
    -- Super admin can manage all
    WHEN get_current_user_role() = 'super_admin' THEN true
    -- Content managers can manage steps in their city
    WHEN get_current_user_role() = ANY (ARRAY['tenant_admin', 'content_manager']) THEN true
    -- Users can manage steps for their own personal journeys
    WHEN journey_id IN (
      SELECT id FROM public.journeys 
      WHERE created_by = auth.uid() AND is_predefined = false
    ) THEN true
    ELSE false
  END
)
WITH CHECK (
  CASE 
    -- Super admin can create all
    WHEN get_current_user_role() = 'super_admin' THEN true
    -- Content managers can create steps
    WHEN get_current_user_role() = ANY (ARRAY['tenant_admin', 'content_manager']) THEN true
    -- Users can create steps for their own personal journeys
    WHEN journey_id IN (
      SELECT id FROM public.journeys 
      WHERE created_by = auth.uid() AND is_predefined = false
    ) THEN true
    ELSE false
  END
);