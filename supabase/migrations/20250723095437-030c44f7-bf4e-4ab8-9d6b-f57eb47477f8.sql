
-- Insert sample testimonials data
INSERT INTO public.testimonials (
  name, name_en, name_de,
  title, title_en, title_de,
  content, content_en, content_de,
  company, company_en, company_de,
  avatar_url, rating, language, is_active, display_order, featured
) VALUES
-- Testimonial 1 - French tourist
(
  'Marie Dubois', 'Marie Dubois', 'Marie Dubois',
  'Directrice Marketing', 'Marketing Director', 'Marketing-Direktorin',
  'CIARA a transformé notre découverte de Sion ! L''application gamifiée rend chaque visite passionnante et interactive. Nos visiteurs adorent gagner des points et échanger des récompenses.',
  'CIARA transformed our discovery of Sion! The gamified app makes every visit exciting and interactive. Our visitors love earning points and redeeming rewards.',
  'CIARA hat unsere Entdeckung von Sion verwandelt! Die gamifizierte App macht jeden Besuch spannend und interaktiv. Unsere Besucher lieben es, Punkte zu sammeln und Belohnungen einzulösen.',
  'Office du Tourisme de Sion', 'Sion Tourism Office', 'Tourismusbüro Sion',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  5, 'fr', true, 1, true
),
-- Testimonial 2 - Swiss hotel manager
(
  'Thomas Müller', 'Thomas Müller', 'Thomas Müller',
  'Directeur d''Hôtel', 'Hotel Manager', 'Hotel-Manager',
  'Depuis que nous utilisons CIARA, nos clients restent plus longtemps et découvrent vraiment notre région. Le système de récompenses fonctionne à merveille !',
  'Since we started using CIARA, our guests stay longer and truly discover our region. The rewards system works wonderfully!',
  'Seit wir CIARA nutzen, bleiben unsere Gäste länger und entdecken wirklich unsere Region. Das Belohnungssystem funktioniert wunderbar!',
  'Hôtel des Alpes', 'Hotel des Alpes', 'Hotel des Alpes',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  5, 'fr', true, 2, true
),
-- Testimonial 3 - Restaurant owner
(
  'Sophie Laurent', 'Sophie Laurent', 'Sophie Laurent',
  'Propriétaire de Restaurant', 'Restaurant Owner', 'Restaurant-Besitzerin',
  'CIARA nous apporte de nouveaux clients chaque semaine. Les visiteurs viennent avec leurs points et repartent enchantés de notre cuisine locale !',
  'CIARA brings us new customers every week. Visitors come with their points and leave delighted with our local cuisine!',
  'CIARA bringt uns jede Woche neue Kunden. Besucher kommen mit ihren Punkten und gehen begeistert von unserer lokalen Küche!',
  'Restaurant La Taverne', 'Restaurant La Taverne', 'Restaurant La Taverne',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  4, 'fr', true, 3, false
);

-- Insert sample client logos
INSERT INTO public.client_logos (
  name, name_en, name_de,
  logo_url, website_url,
  description, description_en, description_de,
  category, language, is_active, display_order
) VALUES
-- Tourism offices
(
  'Office du Tourisme de Sion', 'Sion Tourism Office', 'Tourismusbüro Sion',
  'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=200&h=100&fit=crop',
  'https://www.sion-tourisme.ch',
  'Office officiel du tourisme', 'Official tourism office', 'Offizielles Fremdenverkehrsamt',
  'client', 'fr', true, 1
),
(
  'Lausanne Tourisme', 'Lausanne Tourism', 'Lausanne Tourismus',
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=100&fit=crop',
  'https://www.lausanne-tourisme.ch',
  'Promotion touristique de Lausanne', 'Lausanne tourism promotion', 'Lausanne Tourismusförderung',
  'client', 'fr', true, 2
),
-- Partner hotels
(
  'Hôtel des Alpes', 'Hotel des Alpes', 'Hotel des Alpes',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=100&fit=crop',
  'https://www.hotel-des-alpes.ch',
  'Hôtel de charme en montagne', 'Charming mountain hotel', 'Charmantes Berghotel',
  'partner', 'fr', true, 3
),
(
  'Grand Hôtel Bellevue', 'Grand Hotel Bellevue', 'Grand Hotel Bellevue',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=200&h=100&fit=crop',
  'https://www.bellevue-hotel.ch',
  'Hôtel de luxe au bord du lac', 'Luxury lakeside hotel', 'Luxus-Hotel am See',
  'partner', 'fr', true, 4
),
-- Partner restaurants
(
  'Restaurant La Taverne', 'Restaurant La Taverne', 'Restaurant La Taverne',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=100&fit=crop',
  'https://www.la-taverne.ch',
  'Cuisine traditionnelle suisse', 'Traditional Swiss cuisine', 'Traditionelle Schweizer Küche',
  'partner', 'fr', true, 5
),
(
  'Café des Arts', 'Café des Arts', 'Café des Arts',
  'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=200&h=100&fit=crop',
  'https://www.cafe-des-arts.ch',
  'Café culturel au centre-ville', 'Cultural café downtown', 'Kulturcafé in der Innenstadt',
  'partner', 'fr', true, 6
);
