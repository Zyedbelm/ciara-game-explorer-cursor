-- CIARA Tourism Platform Database Schema
-- Create enum types for better type safety
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'tenant_admin', 
  'content_manager',
  'analytics_viewer',
  'ciara_staff',
  'content_creator',
  'tech_support',
  'partner_admin',
  'partner_viewer',
  'visitor'
);

CREATE TYPE journey_type AS ENUM (
  'hiking',
  'museums',
  'old_town',
  'gastronomy',
  'art_culture',
  'nature',
  'adventure',
  'family'
);

CREATE TYPE step_type AS ENUM (
  'monument',
  'restaurant',
  'viewpoint',
  'museum',
  'shop',
  'activity',
  'landmark'
);

CREATE TYPE journey_difficulty AS ENUM (
  'easy',
  'medium',
  'hard',
  'expert'
);

CREATE TYPE reward_type AS ENUM (
  'discount',
  'free_item',
  'upgrade',
  'experience'
);

-- Cities/Destinations (Tenants)
CREATE TABLE public.cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  country TEXT NOT NULL DEFAULT 'Switzerland',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timezone TEXT DEFAULT 'Europe/Zurich',
  
  -- Branding
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#EF4444',
  
  -- Configuration
  supported_languages TEXT[] DEFAULT ARRAY['fr', 'en'],
  default_language TEXT DEFAULT 'fr',
  
  -- Subscription info
  subscription_plan TEXT DEFAULT 'starter',
  subscription_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  
  -- Role and permissions
  role user_role NOT NULL DEFAULT 'visitor',
  city_id UUID REFERENCES public.cities(id),
  
  -- Visitor preferences
  preferred_languages TEXT[] DEFAULT ARRAY['fr'],
  fitness_level INTEGER CHECK (fitness_level >= 1 AND fitness_level <= 5) DEFAULT 3,
  interests journey_type[],
  available_time INTEGER, -- in minutes
  
  -- Gamification
  total_points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  badges_earned TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Journey Types (categories)
CREATE TABLE public.journey_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- lucide icon name
  color TEXT DEFAULT '#3B82F6',
  type journey_type NOT NULL,
  difficulty journey_difficulty DEFAULT 'medium',
  estimated_duration INTEGER, -- in minutes
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(city_id, slug)
);

-- Steps/Points of Interest (reusable across journeys)
CREATE TABLE public.steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Location
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  validation_radius INTEGER DEFAULT 50, -- meters
  
  -- Content
  type step_type NOT NULL,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  audio_url TEXT,
  video_url TEXT,
  
  -- Gamification
  points_awarded INTEGER DEFAULT 10,
  has_quiz BOOLEAN DEFAULT false,
  
  -- Visibility
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Journeys/Parcours
CREATE TABLE public.journeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.journey_categories(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- Journey details
  difficulty journey_difficulty DEFAULT 'medium',
  estimated_duration INTEGER, -- in minutes
  distance_km DECIMAL(5, 2),
  
  -- Content
  image_url TEXT,
  total_points INTEGER DEFAULT 0,
  
  -- Journey path
  step_order INTEGER[] DEFAULT ARRAY[]::INTEGER[], -- order of step IDs
  
  -- Status
  is_predefined BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  
  -- AI Generation
  generated_by_ai BOOLEAN DEFAULT false,
  generation_params JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Journey Steps relationship (many-to-many with order)
CREATE TABLE public.journey_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  journey_id UUID NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES public.steps(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  
  -- Step-specific customization
  custom_instructions TEXT,
  points_override INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(journey_id, step_id),
  UNIQUE(journey_id, step_order)
);

-- Quiz questions for steps
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  step_id UUID NOT NULL REFERENCES public.steps(id) ON DELETE CASCADE,
  
  question TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice', -- multiple_choice, true_false, photo_recognition
  options JSONB, -- array of options for multiple choice
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  
  points_awarded INTEGER DEFAULT 10,
  bonus_points INTEGER DEFAULT 5, -- for quick/perfect answers
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Partners (restaurants, shops, hotels, etc.)
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- restaurant, shop, hotel, activity, transport
  
  -- Contact info
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  
  -- Location
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Branding
  logo_url TEXT,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Rewards catalog
CREATE TABLE public.rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  
  -- Reward details
  type reward_type NOT NULL,
  value_chf DECIMAL(10, 2), -- CHF value
  points_required INTEGER NOT NULL,
  
  -- Validity
  expires_at TIMESTAMP WITH TIME ZONE,
  max_redemptions INTEGER,
  current_redemptions INTEGER DEFAULT 0,
  
  -- Content
  image_url TEXT,
  terms_conditions TEXT,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Journey Progress
CREATE TABLE public.user_journey_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  journey_id UUID NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  
  -- Progress tracking
  current_step_index INTEGER DEFAULT 0,
  completed_steps INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  total_points_earned INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'in_progress', -- in_progress, completed, abandoned
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Performance
  completion_time_minutes INTEGER,
  quiz_score DECIMAL(5, 2), -- percentage
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, journey_id)
);

-- Step completions and quiz results
CREATE TABLE public.step_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES public.steps(id) ON DELETE CASCADE,
  journey_id UUID REFERENCES public.journeys(id) ON DELETE CASCADE,
  
  -- Completion details
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  points_earned INTEGER DEFAULT 0,
  bonus_points INTEGER DEFAULT 0,
  
  -- Quiz results
  quiz_score INTEGER, -- points scored in quiz
  quiz_perfect BOOLEAN DEFAULT false,
  quiz_time_seconds INTEGER,
  
  -- Location verification
  verified_location BOOLEAN DEFAULT false,
  check_in_latitude DECIMAL(10, 8),
  check_in_longitude DECIMAL(11, 8),
  
  UNIQUE(user_id, step_id, journey_id)
);

-- Reward redemptions
CREATE TABLE public.reward_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  
  -- Redemption details
  points_spent INTEGER NOT NULL,
  redemption_code TEXT NOT NULL UNIQUE,
  qr_code_url TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, validated, expired, cancelled
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  validated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Validation
  validated_by UUID REFERENCES public.profiles(user_id),
  validation_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_journey_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.step_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (visitors can read their city's public data)
CREATE POLICY "Cities are viewable by everyone" 
ON public.cities FOR SELECT USING (true);

CREATE POLICY "Profiles are viewable by owner" 
ON public.profiles FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Public content is viewable by everyone" 
ON public.journey_categories FOR SELECT USING (true);

CREATE POLICY "Public steps are viewable by everyone" 
ON public.steps FOR SELECT USING (is_active = true);

CREATE POLICY "Public journeys are viewable by everyone" 
ON public.journeys FOR SELECT USING (is_active = true);

CREATE POLICY "Journey steps are viewable by everyone" 
ON public.journey_steps FOR SELECT USING (true);

CREATE POLICY "Quiz questions are viewable by everyone" 
ON public.quiz_questions FOR SELECT USING (true);

CREATE POLICY "Active partners are viewable by everyone" 
ON public.partners FOR SELECT USING (is_active = true);

CREATE POLICY "Active rewards are viewable by everyone" 
ON public.rewards FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their own progress" 
ON public.user_journey_progress FOR ALL 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own completions" 
ON public.step_completions FOR ALL 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own redemptions" 
ON public.reward_redemptions FOR ALL 
USING (auth.uid()::text = user_id::text);

-- Create indexes for performance
CREATE INDEX idx_cities_slug ON public.cities(slug);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_city_role ON public.profiles(city_id, role);
CREATE INDEX idx_steps_city_location ON public.steps(city_id, latitude, longitude);
CREATE INDEX idx_journeys_city_category ON public.journeys(city_id, category_id);
CREATE INDEX idx_user_progress_user_journey ON public.user_journey_progress(user_id, journey_id);
CREATE INDEX idx_step_completions_user ON public.step_completions(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON public.cities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_journey_categories_updated_at BEFORE UPDATE ON public.journey_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_steps_updated_at BEFORE UPDATE ON public.steps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_journeys_updated_at BEFORE UPDATE ON public.journeys FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quiz_questions_updated_at BEFORE UPDATE ON public.quiz_questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rewards_updated_at BEFORE UPDATE ON public.rewards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_journey_progress_updated_at BEFORE UPDATE ON public.user_journey_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reward_redemptions_updated_at BEFORE UPDATE ON public.reward_redemptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert demo data for Sion
INSERT INTO public.cities (name, slug, description, latitude, longitude, primary_color, secondary_color) 
VALUES (
  'Sion', 
  'sion', 
  'Capitale du Valais, ville historique au cœur des Alpes suisses', 
  46.2306, 
  7.3603,
  '#E11D48', -- Rose vif pour le Valais
  '#F59E0B'  -- Ambre pour les montagnes
);