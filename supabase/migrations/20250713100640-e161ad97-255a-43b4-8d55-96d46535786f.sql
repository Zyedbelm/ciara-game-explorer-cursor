-- Phase 1: Enrichissement du contenu avec plus d'étapes et de parcours réalistes

-- Ajouter plus d'étapes pour Sion avec les types corrects
INSERT INTO public.steps (city_id, name, description, latitude, longitude, type, points_awarded, has_quiz, images, address, validation_radius)
SELECT 
  c.id,
  'Château de Tourbillon',
  'Dominant la ville de Sion, ce château médiéval offre une vue imprenable sur la vallée du Rhône. Construit au 13ème siècle, il témoigne de l''importance stratégique de Sion à travers les âges.',
  46.2322,
  7.3567,
  'monument'::step_type,
  25,
  true,
  ARRAY['https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800&q=80'],
  'Rue des Châteaux, 1950 Sion',
  75
FROM cities c WHERE c.slug = 'sion'

UNION ALL

SELECT 
  c.id,
  'Cathédrale Notre-Dame du Glarier',
  'Magnifique cathédrale gothique du 15ème siècle, cœur spirituel de Sion. Admirez ses fresques médiévales et son architecture remarquable.',
  46.2311,
  7.3589,
  'landmark'::step_type,
  20,
  true,
  ARRAY['https://images.unsplash.com/photo-1466442929976-97f336a657be?w=800&q=80'],
  'Place de la Cathédrale, 1950 Sion',
  50
FROM cities c WHERE c.slug = 'sion'

UNION ALL

SELECT 
  c.id,
  'Musée d''Histoire du Valais',
  'Plongez dans l''histoire fascinante du Valais, de la préhistoire à nos jours. Collections exceptionnelles et expositions interactives.',
  46.2298,
  7.3601,
  'museum'::step_type,
  15,
  true,
  ARRAY['https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&q=80'],
  'Château de Valère, 1950 Sion',
  40
FROM cities c WHERE c.slug = 'sion'

UNION ALL

SELECT 
  c.id,
  'Vignobles de Fendant',
  'Découvrez les vignobles emblématiques du Valais et dégustez le célèbre Fendant. Vue panoramique sur les Alpes valaisannes.',
  46.2156,
  7.3423,
  'viewpoint'::step_type,
  20,
  true,
  ARRAY['https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80'],
  'Route des Vignobles, 1950 Sion',
  60
FROM cities c WHERE c.slug = 'sion'

UNION ALL

SELECT 
  c.id,
  'Marché du Samedi',
  'Marché traditionnel valaisan avec produits locaux, fromages d''alpage et spécialités régionales. Ambiance authentique garantie.',
  46.2304,
  7.3578,
  'activity'::step_type,
  10,
  false,
  ARRAY['https://images.unsplash.com/photo-1517022812141-23620dba5c23?w=800&q=80'],
  'Place du Midi, 1950 Sion',
  30
FROM cities c WHERE c.slug = 'sion'

UNION ALL

SELECT 
  c.id,
  'Restaurant La Sitterie',
  'Restaurant traditionnel valaisan proposant des spécialités locales dans un cadre chaleureux. Parfait pour découvrir la gastronomie régionale.',
  46.2289,
  7.3545,
  'restaurant'::step_type,
  15,
  false,
  ARRAY['https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&q=80'],
  'Rue du Grand-Pont 12, 1950 Sion',
  25
FROM cities c WHERE c.slug = 'sion';