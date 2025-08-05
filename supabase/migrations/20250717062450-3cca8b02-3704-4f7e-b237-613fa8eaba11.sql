-- Correction: Insertion de données de test (partie 1 - villes)

-- 1. Ajouter des villes supplémentaires pour tester le multi-tenant
INSERT INTO public.cities (name, slug, country, description, timezone, default_language, supported_languages, latitude, longitude, primary_color, secondary_color, subscription_plan) 
VALUES
('Lausanne', 'lausanne', 'Suisse', 'Capitale olympique au bord du lac Léman', 'Europe/Zurich', 'fr', ARRAY['fr', 'en', 'de'], 46.5197, 6.6323, '#2563eb', '#7c3aed', 'professional'),
('Genève', 'geneve', 'Suisse', 'Ville internationale des organisations', 'Europe/Zurich', 'fr', ARRAY['fr', 'en'], 46.2044, 6.1432, '#059669', '#dc2626', 'enterprise'),
('Montreux', 'montreux', 'Suisse', 'Perle de la Riviera suisse', 'Europe/Zurich', 'fr', ARRAY['fr', 'en'], 46.4312, 6.9107, '#7c2d12', '#ea580c', 'starter')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  primary_color = EXCLUDED.primary_color,
  secondary_color = EXCLUDED.secondary_color,
  subscription_plan = EXCLUDED.subscription_plan;