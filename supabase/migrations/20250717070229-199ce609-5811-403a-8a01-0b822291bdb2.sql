-- Partie 3: Parcours, partenaires et récompenses

-- 4. Créer des parcours pour les catégories existantes
WITH existing_categories AS (
  SELECT 
    jc.id as category_id,
    jc.city_id,
    jc.name as category_name,
    jc.difficulty,
    jc.estimated_duration,
    ROW_NUMBER() OVER (PARTITION BY jc.city_id ORDER BY jc.created_at) as cat_num
  FROM public.journey_categories jc
)
INSERT INTO public.journeys (city_id, category_id, name, description, difficulty, estimated_duration, distance_km, total_points, is_active, is_predefined, image_url)
SELECT 
  ec.city_id,
  ec.category_id,
  journey_data.name || ' - ' || ec.category_name,
  journey_data.description,
  ec.difficulty,
  ec.estimated_duration + journey_data.duration_modifier,
  journey_data.distance_km,
  journey_data.total_points,
  true,
  true,
  journey_data.image_url
FROM existing_categories ec
CROSS JOIN (VALUES
  ('Découverte guidée', 'Un parcours complet pour découvrir les incontournables', 0, 2.5, 180, 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800'),
  ('Exploration libre', 'À votre rythme, explorez selon vos envies', 15, 3.2, 220, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800')
) AS journey_data(name, description, duration_modifier, distance_km, total_points, image_url)
WHERE NOT EXISTS (
  SELECT 1 FROM public.journeys j2 
  WHERE j2.category_id = ec.category_id 
  AND j2.name LIKE '%' || journey_data.name || '%'
);

-- 5. Ajouter des partenaires pour toutes les villes
WITH city_data AS (
  SELECT 
    c.id as city_id,
    c.name as city_name,
    c.latitude,
    c.longitude
  FROM public.cities c
)
INSERT INTO public.partners (city_id, name, category, description, address, phone, email, website, latitude, longitude, is_active, logo_url)
SELECT 
  cd.city_id,
  partner_info.name || ' ' || cd.city_name,
  partner_info.category,
  partner_info.description,
  partner_info.address || ', ' || cd.city_name,
  partner_info.phone,
  LOWER(REPLACE(partner_info.name, ' ', '')) || '@' || LOWER(cd.city_name) || '.ch',
  'www.' || LOWER(REPLACE(partner_info.name, ' ', '')) || '.ch',
  cd.latitude + partner_info.lat_offset,
  cd.longitude + partner_info.lng_offset,
  true,
  partner_info.logo_url
FROM city_data cd
CROSS JOIN (VALUES
  ('Hôtel Central', 'hebergement', 'Hôtel familial au cœur de la ville', 'Place Centrale 1', '+41 XX XXX XX XX', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', 0.001, 0.002),
  ('Brasserie Locale', 'restaurant', 'Spécialités régionales et bières artisanales', 'Rue de la Brasserie 5', '+41 XX XXX XX XX', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', -0.002, 0.001),
  ('Boutique Souvenirs', 'commerce', 'Produits locaux et artisanat traditionnel', 'Avenue du Commerce 12', '+41 XX XXX XX XX', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400', 0.003, -0.001),
  ('Café du Coin', 'restaurant', 'Café convivial avec terrasse', 'Rue Piétonne 8', '+41 XX XXX XX XX', 'https://images.unsplash.com/photo-1501747315-3aa946dd12d6?w=400', -0.001, 0.003),
  ('Spa Détente', 'loisir', 'Soins et massages relaxants', 'Chemin du Bien-être 3', '+41 XX XXX XX XX', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400', 0.002, -0.002)
) AS partner_info(name, category, description, address, phone, logo_url, lat_offset, lng_offset)
WHERE NOT EXISTS (
  SELECT 1 FROM public.partners p2 
  WHERE p2.city_id = cd.city_id 
  AND p2.name LIKE '%' || partner_info.name || '%'
);

-- 6. Créer des récompenses pour tous les partenaires
INSERT INTO public.rewards (partner_id, title, description, type, points_required, value_chf, terms_conditions, is_active, image_url, max_redemptions)
SELECT 
  p.id,
  reward_data.title,
  reward_data.description,
  reward_data.type::reward_type,
  reward_data.points_required,
  reward_data.value_chf,
  reward_data.terms_conditions,
  true,
  reward_data.image_url,
  reward_data.max_redemptions
FROM public.partners p
CROSS JOIN (VALUES
  ('Réduction 10%', 'Profitez de 10% de réduction', 'discount', 100, 10.0, 'Valable 30 jours', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400', 100),
  ('Petit cadeau', 'Recevez un petit cadeau surprise', 'freebie', 80, 5.0, 'Un cadeau par visite', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400', 50)
) AS reward_data(title, description, type, points_required, value_chf, terms_conditions, image_url, max_redemptions)
WHERE NOT EXISTS (
  SELECT 1 FROM public.rewards r2 
  WHERE r2.partner_id = p.id 
  AND r2.title = reward_data.title
);