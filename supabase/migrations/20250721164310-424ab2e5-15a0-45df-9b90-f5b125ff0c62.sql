
-- Ajouter une colonne language aux tables qui nécessitent une traduction
ALTER TABLE journeys ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'fr';
ALTER TABLE journey_categories ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'fr';
ALTER TABLE steps ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'fr';
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'fr';
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'fr';

-- Ajouter des colonnes pour les traductions des villes
ALTER TABLE cities ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS name_de TEXT;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS description_de TEXT;

-- Ajouter des colonnes pour les traductions des parcours
ALTER TABLE journeys ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE journeys ADD COLUMN IF NOT EXISTS name_de TEXT;
ALTER TABLE journeys ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE journeys ADD COLUMN IF NOT EXISTS description_de TEXT;

-- Ajouter des colonnes pour les traductions des catégories
ALTER TABLE journey_categories ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE journey_categories ADD COLUMN IF NOT EXISTS name_de TEXT;
ALTER TABLE journey_categories ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE journey_categories ADD COLUMN IF NOT EXISTS description_de TEXT;

-- Ajouter des colonnes pour les traductions des étapes
ALTER TABLE steps ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE steps ADD COLUMN IF NOT EXISTS name_de TEXT;
ALTER TABLE steps ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE steps ADD COLUMN IF NOT EXISTS description_de TEXT;

-- Ajouter des colonnes pour les traductions des questions de quiz
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS question_en TEXT;
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS question_de TEXT;
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS explanation_en TEXT;
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS explanation_de TEXT;
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS options_en JSONB;
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS options_de JSONB;

-- Ajouter des colonnes pour les traductions des récompenses
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS title_de TEXT;
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS description_de TEXT;

-- Ajouter la préférence de langue à la table profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'fr';

-- Créer une table pour les traductions statiques de l'interface
CREATE TABLE IF NOT EXISTS ui_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  language TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(key, language)
);

-- Activer RLS pour la table ui_translations
ALTER TABLE ui_translations ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture à tous
CREATE POLICY "UI translations are viewable by everyone" 
  ON ui_translations 
  FOR SELECT 
  USING (true);

-- Politique pour permettre la modification aux admins seulement
CREATE POLICY "Only admins can modify UI translations" 
  ON ui_translations 
  FOR ALL 
  USING (get_current_user_role() = ANY (ARRAY['super_admin'::text, 'tenant_admin'::text, 'content_manager'::text]))
  WITH CHECK (get_current_user_role() = ANY (ARRAY['super_admin'::text, 'tenant_admin'::text, 'content_manager'::text]));

-- Insérer quelques traductions de base
INSERT INTO ui_translations (key, language, value) VALUES
  ('welcome', 'fr', 'Bienvenue'),
  ('welcome', 'en', 'Welcome'),
  ('welcome', 'de', 'Willkommen'),
  ('journeys', 'fr', 'Parcours'),
  ('journeys', 'en', 'Journeys'),
  ('journeys', 'de', 'Touren'),
  ('rewards', 'fr', 'Récompenses'),
  ('rewards', 'en', 'Rewards'),
  ('rewards', 'de', 'Belohnungen'),
  ('profile', 'fr', 'Profil'),
  ('profile', 'en', 'Profile'),
  ('profile', 'de', 'Profil'),
  ('explore', 'fr', 'Explorer'),
  ('explore', 'en', 'Explore'),
  ('explore', 'de', 'Erkunden'),
  ('start_journey', 'fr', 'Commencer le parcours'),
  ('start_journey', 'en', 'Start journey'),
  ('start_journey', 'de', 'Tour starten'),
  ('generate_journey', 'fr', 'Générer mon parcours'),
  ('generate_journey', 'en', 'Generate my journey'),
  ('generate_journey', 'de', 'Meine Tour generieren'),
  ('my_journeys', 'fr', 'Mes parcours'),
  ('my_journeys', 'en', 'My journeys'),
  ('my_journeys', 'de', 'Meine Touren')
ON CONFLICT (key, language) DO NOTHING;

-- Créer une fonction pour obtenir une traduction
CREATE OR REPLACE FUNCTION get_translation(translation_key TEXT, lang TEXT DEFAULT 'fr')
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (SELECT value FROM ui_translations WHERE key = translation_key AND language = lang),
    (SELECT value FROM ui_translations WHERE key = translation_key AND language = 'fr'),
    translation_key
  );
$$;
