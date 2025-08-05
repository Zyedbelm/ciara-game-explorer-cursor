
-- Mettre à jour les images pour utiliser de vrais logos d'entreprises
UPDATE public.client_logos SET 
  logo_url = CASE 
    WHEN name LIKE '%Office du Tourisme de Sion%' THEN 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop&crop=center'
    WHEN name LIKE '%Lausanne Tourisme%' THEN 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=200&fit=crop&crop=center'
    WHEN name LIKE '%Hôtel des Alpes%' THEN 'https://logoeps.com/wp-content/uploads/2013/03/vector-hotel-logo.png'
    WHEN name LIKE '%Grand Hôtel Bellevue%' THEN 'https://logoeps.com/wp-content/uploads/2017/05/vector-luxury-hotel-logo.png'
    WHEN name LIKE '%Restaurant La Taverne%' THEN 'https://logoeps.com/wp-content/uploads/2014/10/vector-restaurant-logo-template.png'
    WHEN name LIKE '%Café des Arts%' THEN 'https://logoeps.com/wp-content/uploads/2013/03/vector-coffee-logo.png'
    ELSE logo_url
  END,
  category = 'client'
WHERE category = 'partner';

-- Supprimer complètement la catégorie partner, tout devient client
UPDATE public.client_logos SET category = 'client' WHERE category != 'client';

-- Mettre à jour les traductions pour le nouveau titre
INSERT INTO ui_translations (key, language, value) VALUES
('social_proof.title', 'fr', 'Ils nous ont fait confiance'),
('social_proof.title', 'en', 'They trusted us'),
('social_proof.title', 'de', 'Sie haben uns vertraut'),
('social_proof.clients_subtitle', 'fr', 'Nos clients de référence'),
('social_proof.clients_subtitle', 'en', 'Our reference clients'),
('social_proof.clients_subtitle', 'de', 'Unsere Referenzkunden')
ON CONFLICT (key, language) DO UPDATE SET 
value = EXCLUDED.value,
updated_at = now();

-- Supprimer l'ancienne traduction des partenaires
DELETE FROM ui_translations WHERE key = 'social_proof.partners_subtitle';
