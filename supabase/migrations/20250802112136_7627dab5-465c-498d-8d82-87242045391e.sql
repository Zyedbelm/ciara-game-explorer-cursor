-- Enrichir la table user_journey_progress avec les nouvelles données post-parcours
ALTER TABLE public.user_journey_progress 
ADD COLUMN user_rating integer CHECK (user_rating >= 1 AND user_rating <= 5),
ADD COLUMN user_comment text,
ADD COLUMN completion_duration interval,
ADD COLUMN quiz_responses jsonb DEFAULT '[]'::jsonb;

-- Créer une table pour les carnets de voyage générés par IA
CREATE TABLE public.travel_journals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  journey_id uuid NOT NULL,
  user_journey_progress_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  language text NOT NULL DEFAULT 'fr',
  generation_prompt text,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Activer RLS sur la table travel_journals
ALTER TABLE public.travel_journals ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs puissent gérer leurs propres carnets
CREATE POLICY "Users can manage their own travel journals" 
ON public.travel_journals 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Politique pour que les carnets publics soient visibles par tous
CREATE POLICY "Public travel journals are viewable by everyone" 
ON public.travel_journals 
FOR SELECT 
USING (is_public = true);

-- Créer un index pour optimiser les requêtes
CREATE INDEX idx_travel_journals_user_journey ON public.travel_journals(user_id, journey_id);
CREATE INDEX idx_travel_journals_progress ON public.travel_journals(user_journey_progress_id);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_travel_journals_updated_at
BEFORE UPDATE ON public.travel_journals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();