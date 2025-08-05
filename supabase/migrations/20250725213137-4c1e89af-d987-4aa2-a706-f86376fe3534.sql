-- Add test articles data
INSERT INTO articles (
  title, slug, content, excerpt, category, status, city_id, language,
  created_by, author_id, is_featured
) VALUES 
(
  'Découverte du Vieux-Lausanne',
  'decouverte-vieux-lausanne',
  'Plongez dans l''histoire fascinante du centre historique de Lausanne. Entre ruelles pavées et monuments séculaires, découvrez les secrets de cette ville millénaire...',
  'Une balade captivante à travers l''histoire de Lausanne',
  'culture',
  'published',
  (SELECT id FROM cities WHERE slug = 'lausanne' LIMIT 1),
  'fr',
  (SELECT user_id FROM profiles WHERE role = 'super_admin' LIMIT 1),
  (SELECT user_id FROM profiles WHERE role = 'super_admin' LIMIT 1),
  true
),
(
  'Les trésors cachés de Genève',
  'tresors-caches-geneve',
  'Genève regorge de lieux méconnus du grand public. Des jardins secrets aux passages confidentiels, explorez une autre facette de la cité de Calvin...',
  'Explorez les lieux secrets de la ville internationale',
  'découverte',
  'published',
  (SELECT id FROM cities WHERE slug = 'geneve' LIMIT 1),
  'fr',
  (SELECT user_id FROM profiles WHERE role = 'super_admin' LIMIT 1),
  (SELECT user_id FROM profiles WHERE role = 'super_admin' LIMIT 1),
  false
),
(
  'Guide gastronomique de Sion',
  'guide-gastronomique-sion',
  'La capitale valaisanne offre une richesse culinaire exceptionnelle. Des spécialités locales aux restaurants étoilés, découvrez les saveurs authentiques du Valais...',
  'Un voyage gustatif au cœur du Valais',
  'gastronomie',
  'published',
  (SELECT id FROM cities WHERE slug = 'sion' LIMIT 1),
  'fr',
  (SELECT user_id FROM profiles WHERE role = 'super_admin' LIMIT 1),
  (SELECT user_id FROM profiles WHERE role = 'super_admin' LIMIT 1),
  true
),
(
  'Article général CIARA',
  'article-general-ciara',
  'Cet article présente les nouveautés de la plateforme CIARA et les dernières fonctionnalités disponibles pour tous les utilisateurs...',
  'Les dernières nouveautés de la plateforme CIARA',
  'général',
  'published',
  NULL,
  'fr',
  (SELECT user_id FROM profiles WHERE role = 'super_admin' LIMIT 1),
  (SELECT user_id FROM profiles WHERE role = 'super_admin' LIMIT 1),
  false
);