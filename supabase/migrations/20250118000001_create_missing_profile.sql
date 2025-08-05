-- Créer le profil manquant pour l'utilisateur partenaire
INSERT INTO public.profiles (
  user_id,
  email,
  full_name,
  role,
  total_points,
  current_level,
  fitness_level,
  preferred_languages,
  interests,
  city_id,
  created_at,
  updated_at
) VALUES (
  '7a782714-4642-492a-b370-e5f2a08c1f51',
  'hedi.elmeddeb@gmail.com',
  'Hedi Elmeddeb',
  'partner',
  0,
  1,
  'medium',
  ARRAY['fr', 'en'],
  ARRAY['gastronomy', 'culture'],
  NULL,
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO NOTHING; 