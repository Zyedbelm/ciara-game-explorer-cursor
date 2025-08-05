-- Restauration complète de la structure de base de données CIARA

-- 1. Créer les tables manquantes pour le suivi des utilisateurs
CREATE TABLE IF NOT EXISTS public.user_journey_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  journey_id UUID NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  current_step_order INTEGER DEFAULT 1,
  total_points_earned INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, journey_id)
);

CREATE TABLE IF NOT EXISTS public.step_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  step_id UUID NOT NULL REFERENCES public.steps(id) ON DELETE CASCADE,
  journey_id UUID REFERENCES public.journeys(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  points_earned INTEGER DEFAULT 0,
  quiz_score INTEGER,
  validation_method TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, step_id, journey_id)
);

CREATE TABLE IF NOT EXISTS public.reward_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  points_spent INTEGER NOT NULL,
  redemption_code TEXT UNIQUE,
  status TEXT DEFAULT 'pending',
  used_at TIMESTAMP WITH TIME ZONE,
  partner_validation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Activer RLS sur toutes les tables
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_journey_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.step_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

-- 3. Créer une fonction pour récupérer le rôle utilisateur (évite la récursion RLS)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- 4. Créer les policies RLS complètes
-- Cities (lisibles par tous)
CREATE POLICY "Cities are viewable by everyone" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Only admins can modify cities" ON public.cities FOR ALL USING (
  public.get_current_user_role() IN ('super_admin', 'tenant_admin')
);

-- Journey categories (lisibles par tous)
CREATE POLICY "Journey categories are viewable by everyone" ON public.journey_categories FOR SELECT USING (true);
CREATE POLICY "Only admins can modify journey categories" ON public.journey_categories FOR ALL USING (
  public.get_current_user_role() IN ('super_admin', 'tenant_admin', 'content_manager')
);

-- Journeys (lisibles par tous)
CREATE POLICY "Journeys are viewable by everyone" ON public.journeys FOR SELECT USING (true);
CREATE POLICY "Only content managers can modify journeys" ON public.journeys FOR ALL USING (
  public.get_current_user_role() IN ('super_admin', 'tenant_admin', 'content_manager')
);

-- Steps (lisibles par tous)
CREATE POLICY "Steps are viewable by everyone" ON public.steps FOR SELECT USING (true);
CREATE POLICY "Only content managers can modify steps" ON public.steps FOR ALL USING (
  public.get_current_user_role() IN ('super_admin', 'tenant_admin', 'content_manager')
);

-- Journey steps (lisibles par tous)
CREATE POLICY "Journey steps are viewable by everyone" ON public.journey_steps FOR SELECT USING (true);
CREATE POLICY "Only content managers can modify journey steps" ON public.journey_steps FOR ALL USING (
  public.get_current_user_role() IN ('super_admin', 'tenant_admin', 'content_manager')
);

-- Partners (lisibles par tous)
CREATE POLICY "Partners are viewable by everyone" ON public.partners FOR SELECT USING (true);
CREATE POLICY "Only admins can modify partners" ON public.partners FOR ALL USING (
  public.get_current_user_role() IN ('super_admin', 'tenant_admin')
);

-- Rewards (lisibles par tous)
CREATE POLICY "Rewards are viewable by everyone" ON public.rewards FOR SELECT USING (true);
CREATE POLICY "Only admins can modify rewards" ON public.rewards FOR ALL USING (
  public.get_current_user_role() IN ('super_admin', 'tenant_admin')
);

-- Profiles (utilisateurs voient leur profil, admins voient tout)
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (
  auth.uid() = user_id OR public.get_current_user_role() IN ('super_admin', 'tenant_admin')
);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Only admins can create/delete profiles" ON public.profiles FOR INSERT WITH CHECK (
  public.get_current_user_role() IN ('super_admin', 'tenant_admin')
);
CREATE POLICY "Only admins can delete profiles" ON public.profiles FOR DELETE USING (
  public.get_current_user_role() IN ('super_admin', 'tenant_admin')
);

-- User journey progress (utilisateurs voient leur progression)
CREATE POLICY "Users can view own journey progress" ON public.user_journey_progress FOR SELECT USING (
  auth.uid() = user_id OR public.get_current_user_role() IN ('super_admin', 'tenant_admin')
);
CREATE POLICY "Users can manage own journey progress" ON public.user_journey_progress FOR ALL USING (auth.uid() = user_id);

-- Step completions (utilisateurs voient leurs complétions)
CREATE POLICY "Users can view own step completions" ON public.step_completions FOR SELECT USING (
  auth.uid() = user_id OR public.get_current_user_role() IN ('super_admin', 'tenant_admin')
);
CREATE POLICY "Users can manage own step completions" ON public.step_completions FOR ALL USING (auth.uid() = user_id);

-- Reward redemptions (utilisateurs voient leurs échanges)
CREATE POLICY "Users can view own reward redemptions" ON public.reward_redemptions FOR SELECT USING (
  auth.uid() = user_id OR public.get_current_user_role() IN ('super_admin', 'tenant_admin')
);
CREATE POLICY "Users can create own reward redemptions" ON public.reward_redemptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reward redemptions" ON public.reward_redemptions FOR UPDATE USING (auth.uid() = user_id);

-- 5. Créer les triggers pour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_journey_progress_updated_at ON public.user_journey_progress;
CREATE TRIGGER update_user_journey_progress_updated_at
  BEFORE UPDATE ON public.user_journey_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_reward_redemptions_updated_at ON public.reward_redemptions;
CREATE TRIGGER update_reward_redemptions_updated_at
  BEFORE UPDATE ON public.reward_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Ajouter des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_user_journey_progress_user_id ON public.user_journey_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_journey_progress_journey_id ON public.user_journey_progress(journey_id);
CREATE INDEX IF NOT EXISTS idx_step_completions_user_id ON public.step_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_step_completions_step_id ON public.step_completions(step_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_user_id ON public.reward_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_reward_id ON public.reward_redemptions(reward_id);