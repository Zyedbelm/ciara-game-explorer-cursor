-- Ajout des politiques RLS manquantes pour les quiz_questions et content_documents

-- Autoriser la création/modification de quiz par les gestionnaires de contenu
CREATE POLICY "Content managers can manage quiz questions" 
ON public.quiz_questions 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['super_admin'::text, 'tenant_admin'::text, 'content_manager'::text]))
WITH CHECK (get_current_user_role() = ANY (ARRAY['super_admin'::text, 'tenant_admin'::text, 'content_manager'::text]));

-- Autoriser la création/modification de documents par les gestionnaires de contenu  
CREATE POLICY "Content managers can manage content documents" 
ON public.content_documents 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['super_admin'::text, 'tenant_admin'::text, 'content_manager'::text]))
WITH CHECK (get_current_user_role() = ANY (ARRAY['super_admin'::text, 'tenant_admin'::text, 'content_manager'::text]));