-- Add real partners and offers for active cities

-- First, get city IDs for reference
-- Lausanne, Montreux, Sion (Switzerland)
-- Carcassonne, Collioure, Narbonne (France)

-- Insert Partners for Lausanne
INSERT INTO public.partners (
  id,
  city_id,
  name,
  category,
  description,
  address,
  phone,
  email,
  website,
  latitude,
  longitude,
  logo_url,
  is_active
) VALUES
-- Café de Grancy - Popular local café in Lausanne
(
  gen_random_uuid(),
  (SELECT id FROM public.cities WHERE slug = 'lausanne' LIMIT 1),
  'Café de Grancy',
  'restaurant',
  'Café authentique du quartier de Grancy, réputé pour ses spécialités locales et son ambiance conviviale.',
  'Avenue d''Echallens 94, 1004 Lausanne',
  '+41 21 647 07 67',
  'contact@cafedegrancy.ch',
  'https://www.cafedegrancy.ch',
  46.5158,
  6.6208,
  null,
  true
),
-- Holy Cow! Gourmet Burger Company - Local burger chain
(
  gen_random_uuid(),
  (SELECT id FROM public.cities WHERE slug = 'lausanne' LIMIT 1),
  'Holy Cow! Lausanne',
  'restaurant',
  'Burgers gastronomiques avec des ingrédients locaux et bio, concept suisse innovant.',
  'Rue du Grand-Pont 2, 1003 Lausanne',
  '+41 21 312 21 21',
  'lausanne@holycow.ch',
  'https://www.holycow.ch',
  46.5197,
  6.6323,
  null,
  true
);

-- Insert Partners for Montreux
INSERT INTO public.partners (
  id,
  city_id,
  name,
  category,
  description,
  address,
  phone,
  email,
  website,
  latitude,
  longitude,
  logo_url,
  is_active
) VALUES
-- Le Palais Oriental - Restaurant with lake view
(
  gen_random_uuid(),
  (SELECT id FROM public.cities WHERE slug = 'montreux' LIMIT 1),
  'Le Palais Oriental',
  'restaurant',
  'Restaurant oriental avec vue sur le lac Léman, spécialités libanaises et méditerranéennes.',
  'Quai du Casino 1, 1820 Montreux',
  '+41 21 963 12 71',
  'contact@palaisorientalmontreux.ch',
  'https://www.palaisorientalmontreux.ch',
  46.4312,
  6.9123,
  null,
  true
),
-- Café Bellagio - Classic Swiss café
(
  gen_random_uuid(),
  (SELECT id FROM public.cities WHERE slug = 'montreux' LIMIT 1),
  'Café Bellagio',
  'cafe',
  'Café traditionnel suisse au cœur de Montreux, parfait pour une pause gourmande.',
  'Avenue des Alpes 14, 1820 Montreux',
  '+41 21 962 83 83',
  'info@cafebellagio.ch',
  null,
  46.4299,
  6.9106,
  null,
  true
);

-- Insert Partners for Sion
INSERT INTO public.partners (
  id,
  city_id,
  name,
  category,
  description,
  address,
  phone,
  email,
  website,
  latitude,
  longitude,
  logo_url,
  is_active
) VALUES
-- Café du Midi - Historic café in old town
(
  gen_random_uuid(),
  (SELECT id FROM public.cities WHERE slug = 'sion' LIMIT 1),
  'Café du Midi',
  'cafe',
  'Café historique au cœur de la vieille ville de Sion, tradition valaisanne depuis 1875.',
  'Place du Midi 21, 1950 Sion',
  '+41 27 322 15 77',
  'contact@cafedumidi-sion.ch',
  null,
  46.2276,
  7.3608,
  null,
  true
),
-- Restaurant La Sitterie - Local Valais cuisine
(
  gen_random_uuid(),
  (SELECT id FROM public.cities WHERE slug = 'sion' LIMIT 1),
  'Restaurant La Sitterie',
  'restaurant',
  'Restaurant traditionnel valaisan proposant des spécialités locales et des vins du terroir.',
  'Rue de la Sitterie 4, 1950 Sion',
  '+41 27 323 32 30',
  'info@lasitterie.ch',
  'https://www.lasitterie.ch',
  46.2298,
  7.3585,
  null,
  true
);

-- Insert Partners for Carcassonne
INSERT INTO public.partners (
  id,
  city_id,
  name,
  category,
  description,
  address,
  phone,
  email,
  website,
  latitude,
  longitude,
  logo_url,
  is_active
) VALUES
-- Le Carcassonnais - Traditional French brasserie
(
  gen_random_uuid(),
  (SELECT id FROM public.cities WHERE slug = 'carcassonne' LIMIT 1),
  'Le Carcassonnais',
  'restaurant',
  'Brasserie traditionnelle française au cœur de la cité médiévale, spécialités du terroir.',
  '14 Place Marcou, 11000 Carcassonne',
  '+33 4 68 71 23 45',
  'contact@lecarcassonnais.fr',
  'https://www.lecarcassonnais.fr',
  43.2061,
  2.3639,
  null,
  true
),
-- Pâtisserie Mirepoix - Local pastry shop
(
  gen_random_uuid(),
  (SELECT id FROM public.cities WHERE slug = 'carcassonne' LIMIT 1),
  'Pâtisserie Mirepoix',
  'cafe',
  'Pâtisserie artisanale proposant des spécialités locales et des créations originales.',
  '23 Rue Comte Roger, 11000 Carcassonne',
  '+33 4 68 47 15 89',
  'contact@patisseriemirepoix.fr',
  null,
  43.2056,
  2.3498,
  null,
  true
);

-- Insert Partners for Collioure
INSERT INTO public.partners (
  id,
  city_id,
  name,
  category,
  description,
  address,
  phone,
  email,
  website,
  latitude,
  longitude,
  logo_url,
  is_active
) VALUES
-- Le Fanal - Seafood restaurant with harbor view
(
  gen_random_uuid(),
  (SELECT id FROM public.cities WHERE slug = 'collioure' LIMIT 1),
  'Le Fanal',
  'restaurant',
  'Restaurant de fruits de mer avec vue sur le port, spécialités catalanes et poissons frais.',
  '1 Quai de l''Amirauté, 66190 Collioure',
  '+33 4 68 82 07 56',
  'reservation@lefanalcollioure.fr',
  'https://www.lefanalcollioure.fr',
  42.5255,
  3.0836,
  null,
  true
),
-- Café Sola - Beach café
(
  gen_random_uuid(),
  (SELECT id FROM public.cities WHERE slug = 'collioure' LIMIT 1),
  'Café Sola',
  'cafe',
  'Café de plage authentique, parfait pour une pause rafraîchissante face à la Méditerranée.',
  '2 Avenue Camille Pelletan, 66190 Collioure',
  '+33 4 68 98 01 24',
  'hello@cafesola.fr',
  null,
  42.5280,
  3.0865,
  null,
  true
);

-- Insert Partners for Narbonne
INSERT INTO public.partners (
  id,
  city_id,
  name,
  category,
  description,
  address,
  phone,
  email,
  website,
  latitude,
  longitude,
  logo_url,
  is_active
) VALUES
-- Brasserie Le Donjon - Historic brasserie
(
  gen_random_uuid(),
  (SELECT id FROM public.cities WHERE slug = 'narbonne' LIMIT 1),
  'Brasserie Le Donjon',
  'restaurant',
  'Brasserie historique face à la cathédrale, cuisine traditionnelle française et spécialités régionales.',
  '7 Avenue Général Leclerc, 11100 Narbonne',
  '+33 4 68 32 55 95',
  'contact@brasseriedonjon.fr',
  'https://www.brasseriedonjon.fr',
  43.1839,
  3.0032,
  null,
  true
),
-- Café Central - Traditional French café
(
  gen_random_uuid(),
  (SELECT id FROM public.cities WHERE slug = 'narbonne' LIMIT 1),
  'Café Central',
  'cafe',
  'Café traditionnel français au centre-ville, lieu de rencontre des habitants depuis 1920.',
  '12 Place Salengro, 11100 Narbonne',
  '+33 4 68 65 14 78',
  'info@cafecentral-narbonne.fr',
  null,
  43.1847,
  3.0040,
  null,
  true
);

-- Now insert rewards/offers for each partner
-- Swiss partners (10 CHF offers)
INSERT INTO public.rewards (
  id,
  partner_id,
  type,
  title,
  description,
  points_required,
  value_chf,
  max_redemptions,
  max_redemptions_per_user,
  validity_days,
  terms_conditions,
  is_active
) VALUES
-- Café de Grancy offers
(
  gen_random_uuid(),
  (SELECT id FROM public.partners WHERE name = 'Café de Grancy' LIMIT 1),
  'discount',
  'Café offert',
  'Un café ou thé offert avec votre visite guidée de Lausanne',
  50,
  5.0,
  100,
  1,
  30,
  'Valable du lundi au vendredi. Présenter le code QR au moment de la commande. Non cumulable avec d''autres offres.',
  true
),
-- Holy Cow! Lausanne offers
(
  gen_random_uuid(),
  (SELECT id FROM public.partners WHERE name = 'Holy Cow! Lausanne' LIMIT 1),
  'discount',
  'Réduction 10 CHF',
  '10 CHF de réduction sur votre commande (minimum 25 CHF)',
  80,
  10.0,
  50,
  1,
  30,
  'Minimum de commande 25 CHF. Valable tous les jours. Présenter le code QR avant le paiement.',
  true
),
-- Le Palais Oriental offers
(
  gen_random_uuid(),
  (SELECT id FROM public.partners WHERE name = 'Le Palais Oriental' LIMIT 1),
  'discount',
  'Apéritif offert',
  'Un apéritif maison offert pour deux personnes',
  60,
  8.0,
  80,
  1,
  30,
  'Valable le soir uniquement. Réservation recommandée. Présenter le code QR à l''arrivée.',
  true
),
-- Café Bellagio offers
(
  gen_random_uuid(),
  (SELECT id FROM public.partners WHERE name = 'Café Bellagio' LIMIT 1),
  'free_item',
  'Pâtisserie offerte',
  'Une pâtisserie suisse offerte avec toute boisson chaude',
  40,
  6.0,
  60,
  2,
  30,
  'Choix parmi la sélection du jour. Valable toute la journée. Une pâtisserie par code QR.',
  true
),
-- Café du Midi offers
(
  gen_random_uuid(),
  (SELECT id FROM public.partners WHERE name = 'Café du Midi' LIMIT 1),
  'discount',
  'Fendant offert',
  'Un verre de Fendant valaisan offert (après-midi uniquement)',
  70,
  7.0,
  40,
  1,
  30,
  'Valable à partir de 15h. Présenter une pièce d''identité. Consommation responsable.',
  true
),
-- Restaurant La Sitterie offers
(
  gen_random_uuid(),
  (SELECT id FROM public.partners WHERE name = 'Restaurant La Sitterie' LIMIT 1),
  'discount',
  'Réduction 15 CHF',
  '15 CHF de réduction sur le menu dégustation valaisan',
  100,
  15.0,
  30,
  1,
  30,
  'Valable sur le menu dégustation uniquement. Réservation obligatoire. Mentionner le code CIARA.',
  true
);

-- French partners (5 EUR offers)
INSERT INTO public.rewards (
  id,
  partner_id,
  type,
  title,
  description,
  points_required,
  value_chf,
  max_redemptions,
  max_redemptions_per_user,
  validity_days,
  terms_conditions,
  is_active
) VALUES
-- Le Carcassonnais offers
(
  gen_random_uuid(),
  (SELECT id FROM public.partners WHERE name = 'Le Carcassonnais' LIMIT 1),
  'discount',
  'Apéritif offert',
  'Un apéritif de bienvenue offert',
  50,
  5.0,
  80,
  1,
  30,
  'Valable du mardi au samedi. Présenter le code QR à l''arrivée. Non cumulable.',
  true
),
-- Pâtisserie Mirepoix offers
(
  gen_random_uuid(),
  (SELECT id FROM public.partners WHERE name = 'Pâtisserie Mirepoix' LIMIT 1),
  'free_item',
  'Café + madeleine',
  'Un café et une madeleine artisanale offerts',
  40,
  4.5,
  100,
  1,
  30,
  'Valable toute la journée. Choix café espresso, allongé ou cappuccino. Une consommation par code.',
  true
),
-- Le Fanal offers
(
  gen_random_uuid(),
  (SELECT id FROM public.partners WHERE name = 'Le Fanal' LIMIT 1),
  'discount',
  'Sangria offerte',
  'Une sangria catalane offerte à partager (2 personnes)',
  60,
  8.0,
  50,
  1,
  30,
  'Valable en terrasse uniquement. Minimum 2 personnes. Présenter le code avant la commande.',
  true
),
-- Café Sola offers
(
  gen_random_uuid(),
  (SELECT id FROM public.partners WHERE name = 'Café Sola' LIMIT 1),
  'free_item',
  'Granita offerte',
  'Une granita artisanale aux fruits de saison offerte',
  35,
  4.0,
  120,
  2,
  30,
  'Parfums selon disponibilité. Valable de 10h à 18h. Présenter le code QR.',
  true
),
-- Brasserie Le Donjon offers
(
  gen_random_uuid(),
  (SELECT id FROM public.partners WHERE name = 'Brasserie Le Donjon' LIMIT 1),
  'discount',
  'Réduction 7€',
  '7€ de réduction sur votre repas (minimum 20€)',
  70,
  7.5,
  60,
  1,
  30,
  'Minimum de commande 20€. Valable midi et soir. Réservation conseillée. Présenter le code QR.',
  true
),
-- Café Central offers
(
  gen_random_uuid(),
  (SELECT id FROM public.partners WHERE name = 'Café Central' LIMIT 1),
  'free_item',
  'Café gourmand',
  'Un café gourmand avec mignardises maison offert',
  45,
  6.0,
  80,
  1,
  30,
  'Disponible de 14h à 17h. Café au choix + 3 mignardises. Présenter le code QR.',
  true
);

-- Add email translations for partner notifications
INSERT INTO public.ui_translations (key, language, value, category) VALUES
('partner.offer.title', 'fr', 'Nouvelle offre partenaire disponible !', 'email'),
('partner.offer.title', 'en', 'New partner offer available!', 'email'),
('partner.offer.title', 'de', 'Neues Partnerangebot verfügbar!', 'email'),
('partner.offer.message', 'fr', 'Découvrez une nouvelle offre exclusive de nos partenaires locaux.', 'email'),
('partner.offer.message', 'en', 'Discover a new exclusive offer from our local partners.', 'email'),
('partner.offer.message', 'de', 'Entdecken Sie ein neues exklusives Angebot unserer lokalen Partner.', 'email');