-- Comprehensive Test Data for CIARA Game Explorer
-- This file creates realistic test data for multiple cities with complete information

-- Clear existing data (except for any admin users or essential config)
DO $$ BEGIN
  -- Delete in correct order to respect foreign key constraints
  DELETE FROM public.reward_redemptions;
  DELETE FROM public.step_completions;
  DELETE FROM public.user_journey_progress;
  DELETE FROM public.quiz_questions;
  DELETE FROM public.content_documents WHERE step_id IS NOT NULL;
  DELETE FROM public.journey_steps;
  DELETE FROM public.journeys;
  DELETE FROM public.steps;
  DELETE FROM public.journey_categories;
  DELETE FROM public.rewards;
  DELETE FROM public.partners;
  DELETE FROM public.cities WHERE slug != 'admin'; -- Keep admin city if exists
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error clearing data: %', SQLERRM;
END $$;

-- ============================================================================
-- CITIES - 4 diverse cities with complete information
-- ============================================================================

INSERT INTO public.cities (
  name, slug, description, country, latitude, longitude, timezone,
  logo_url, primary_color, secondary_color,
  supported_languages, default_language,
  subscription_plan, subscription_active
) VALUES
-- Lyon, France - Cultural and gastronomic capital
(
  'Lyon', 'lyon', 
  'Capitale française de la gastronomie, Lyon séduit par son patrimoine architectural exceptionnel, ses traboules mystérieuses et sa scène culinaire renommée mondialement. Inscrite au patrimoine mondial de l''UNESCO, la ville offre un parfait équilibre entre histoire et modernité.',
  'France', 45.7640, 4.8357, 'Europe/Paris',
  'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400',
  '#DC2626', '#F59E0B',
  ARRAY['fr', 'en'], 'fr',
  'premium', true
),
-- Barcelona, Spain - Art and architecture
(
  'Barcelona', 'barcelona',
  'Métropole méditerranéenne vibrante, Barcelona fascine par l''architecture visionnaire de Gaudí, ses quartiers animés et sa culture catalane unique. Entre plages urbaines et monuments emblématiques, la ville offre une expérience culturelle incomparable.',
  'Spain', 41.3851, 2.1734, 'Europe/Madrid',
  'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400',
  '#E11D48', '#0EA5E9',
  ARRAY['es', 'ca', 'en'], 'es',
  'premium', true
),
-- Prague, Czech Republic - Medieval charm
(
  'Prague', 'prague',
  'Surnommée la "Ville aux cent clochers", Prague enchante par sa beauté médiévale préservée, ses châteaux majestueux et son atmosphère romantique. Capitale culturelle de l''Europe centrale, elle mélange harmonieusement gothique, baroque et Art nouveau.',
  'Czech Republic', 50.0755, 14.4378, 'Europe/Prague',
  'https://images.unsplash.com/photo-1541849546-216549ae216d?w=400',
  '#7C3AED', '#F59E0B',
  ARRAY['cs', 'en', 'de'], 'cs',
  'premium', true
),
-- Montreal, Canada - North American charm with European flair
(
  'Montreal', 'montreal',
  'Métropole cosmopolite du Québec, Montréal allie charme européen et dynamisme nord-américain. Ville bilingue par excellence, elle séduit par ses festivals, sa gastronomie créative et son patrimoine architectural unique en Amérique du Nord.',
  'Canada', 45.5017, -73.5673, 'America/Montreal',
  'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=400',
  '#1E40AF', '#DC2626',
  ARRAY['fr', 'en'], 'fr',
  'premium', true
);

-- ============================================================================
-- JOURNEY CATEGORIES - Diverse categories for each city
-- ============================================================================

INSERT INTO public.journey_categories (
  city_id, name, slug, description, icon, color, type, difficulty, estimated_duration
) VALUES
-- Lyon Categories
(
  (SELECT id FROM public.cities WHERE slug = 'lyon'),
  'Patrimoine UNESCO', 'patrimoine-unesco',
  'Découverte des sites inscrits au patrimoine mondial de l''UNESCO dans le Vieux Lyon et la Presqu''île',
  'landmark', '#DC2626', 'old_town', 'medium', 180
),
(
  (SELECT id FROM public.cities WHERE slug = 'lyon'),
  'Gastronomie Lyonnaise', 'gastronomie-lyonnaise',
  'Parcours gourmand dans les bouchons traditionnels et marchés locaux',
  'utensils', '#F59E0B', 'gastronomy', 'easy', 120
),
(
  (SELECT id FROM public.cities WHERE slug = 'lyon'),
  'Traboules et Mystères', 'traboules-mysteres',
  'Exploration des passages secrets et de l''histoire cachée de Lyon',
  'eye', '#8B5CF6', 'adventure', 'medium', 150
),
(
  (SELECT id FROM public.cities WHERE slug = 'lyon'),
  'Lyon Moderne', 'lyon-moderne',
  'Quartiers contemporains et architecture du 21ème siècle',
  'building', '#06B6D4', 'art_culture', 'easy', 90
),

-- Barcelona Categories
(
  (SELECT id FROM public.cities WHERE slug = 'barcelona'),
  'Gaudí et Modernisme', 'gaudi-modernisme',
  'Sur les traces d''Antoni Gaudí et de l''architecture moderniste catalane',
  'palette', '#E11D48', 'art_culture', 'medium', 240
),
(
  (SELECT id FROM public.cities WHERE slug = 'barcelona'),
  'Quartier Gothique', 'quartier-gothique',
  'Déambulation dans les ruelles médiévales du Barrio Gótico',
  'castle', '#7C2D12', 'old_town', 'easy', 120
),
(
  (SELECT id FROM public.cities WHERE slug = 'barcelona'),
  'Tapas et Traditions', 'tapas-traditions',
  'Découverte culinaire des tapas et de la culture catalane',
  'utensils', '#F59E0B', 'gastronomy', 'easy', 150
),
(
  (SELECT id FROM public.cities WHERE slug = 'barcelona'),
  'Barcelona Maritime', 'barcelona-maritime',
  'De la Barceloneta au Port Olympique, l''âme maritime de la ville',
  'anchor', '#0EA5E9', 'nature', 'easy', 180
),

-- Prague Categories
(
  (SELECT id FROM public.cities WHERE slug = 'prague'),
  'Châteaux et Palais', 'chateaux-palais',
  'Découverte des résidences royales et de l''architecture baroque',
  'crown', '#7C3AED', 'old_town', 'medium', 200
),
(
  (SELECT id FROM public.cities WHERE slug = 'prague'),
  'Prague Mystique', 'prague-mystique',
  'Légendes, alchimie et histoires fantastiques de la ville magique',
  'sparkles', '#8B5CF6', 'adventure', 'medium', 180
),
(
  (SELECT id FROM public.cities WHERE slug = 'prague'),
  'Bière et Tradition', 'biere-tradition',
  'L''art brassicole tchèque et les tavernes historiques',
  'beer', '#F59E0B', 'gastronomy', 'easy', 120
),
(
  (SELECT id FROM public.cities WHERE slug = 'prague'),
  'Art et Musées', 'art-musees',
  'Collections d''art et patrimoine culturel tchèque',
  'image', '#EF4444', 'museums', 'medium', 180
),

-- Montreal Categories
(
  (SELECT id FROM public.cities WHERE slug = 'montreal'),
  'Vieux-Montréal', 'vieux-montreal',
  'Exploration du quartier historique et de la Nouvelle-France',
  'landmark', '#1E40AF', 'old_town', 'easy', 150
),
(
  (SELECT id FROM public.cities WHERE slug = 'montreal'),
  'Plateau et Culture', 'plateau-culture',
  'Quartiers bohèmes et scène culturelle montréalaise',
  'music', '#DC2626', 'art_culture', 'medium', 180
),
(
  (SELECT id FROM public.cities WHERE slug = 'montreal'),
  'Saveurs du Québec', 'saveurs-quebec',
  'Gastronomie québécoise et spécialités locales',
  'utensils', '#F59E0B', 'gastronomy', 'easy', 120
),
(
  (SELECT id FROM public.cities WHERE slug = 'montreal'),
  'Montréal Souterrain', 'montreal-souterrain',
  'Découverte de la ville souterraine et de ses secrets',
  'subway', '#6B7280', 'adventure', 'medium', 150
);

-- ============================================================================
-- STEPS - 10 realistic steps per city with detailed information
-- ============================================================================

-- Lyon Steps
INSERT INTO public.steps (
  city_id, name, description, latitude, longitude, address, validation_radius,
  type, images, points_awarded, has_quiz, is_active
) VALUES
-- Lyon
(
  (SELECT id FROM public.cities WHERE slug = 'lyon'),
  'Basilique Notre-Dame de Fourvière',
  'Majestueuse basilique perchée sur la colline de Fourvière, elle domine Lyon depuis 1896. Surnommée "la tour Eiffel à l''envers" par les Lyonnais, elle offre une vue panoramique exceptionnelle sur la ville et constitue un véritable symbole de Lyon.',
  45.7622, 4.8225, 'Place de Fourvière, 69005 Lyon',
  100, 'monument', 
  ARRAY['https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800', 'https://images.unsplash.com/photo-1597149960987-c4c7b0d6d8a4?w=800'],
  30, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'lyon'),
  'Vieux Lyon Renaissance',
  'Quartier Renaissance le mieux conservé d''Europe, inscrit au patrimoine mondial de l''UNESCO. Ses ruelles pavées, ses cours d''honneur et ses traboules racontent 500 ans d''histoire lyonnaise.',
  45.7628, 4.8275, 'Place du Change, 69005 Lyon',
  80, 'landmark',
  ARRAY['https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800'],
  25, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'lyon'),
  'Traboules de la Croix-Rousse',
  'Passages secrets construits par les canuts pour transporter la soie à l''abri des intempéries. Ces couloirs cachés révèlent l''ingéniosité architecturale lyonnaise et l''histoire de la révolution industrielle.',
  45.7747, 4.8335, 'Rue Imbert Colomès, 69001 Lyon',
  60, 'landmark',
  ARRAY['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'],
  20, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'lyon'),
  'Halles de Lyon Paul Bocuse',
  'Temple de la gastronomie lyonnaise, ce marché couvert rassemble les meilleurs producteurs régionaux. Fromages, charcuteries, pâtisseries et spécialités locales s''y côtoient dans une ambiance authentique.',
  45.7694, 4.8501, '102 Cours Lafayette, 69003 Lyon',
  70, 'restaurant',
  ARRAY['https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800'],
  15, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'lyon'),
  'Musée des Confluences',
  'Architecture futuriste spectaculaire abritant des collections d''anthropologie, de sciences naturelles et de sociétés. Ce cristal de verre et d''acier dialogue avec le confluent du Rhône et de la Saône.',
  45.7326, 4.8184, '86 Quai Perrache, 69002 Lyon',
  90, 'museum',
  ARRAY['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800'],
  25, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'lyon'),
  'Place Bellecour',
  'L''une des plus grandes places piétonnes d''Europe, dominée par la statue équestre de Louis XIV. Cœur battant de Lyon, elle accueille marchés, événements et constitue un point de rendez-vous incontournable.',
  45.7578, 4.8320, 'Place Bellecour, 69002 Lyon',
  120, 'landmark',
  ARRAY['https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800'],
  20, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'lyon'),
  'Parc de la Tête d''Or',
  'Poumon vert de Lyon, ce parc urbain de 117 hectares abrite un zoo gratuit, un lac navigable et de magnifiques jardins botaniques. Créé en 1857, il offre une parenthèse nature au cœur de la métropole.',
  45.7789, 4.8532, 'Place Général Leclerc, 69006 Lyon',
  150, 'viewpoint',
  ARRAY['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800'],
  15, false, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'lyon'),
  'Opéra de Lyon',
  'Joyau architectural alliant patrimoine historique et modernité. Rénové par Jean Nouvel, ce temple lyrique propose une programmation internationale dans un cadre architectural exceptionnel.',
  45.7673, 4.8363, 'Place de la Comédie, 69001 Lyon',
  60, 'activity',
  ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'],
  20, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'lyon'),
  'Mur des Canuts',
  'Plus grande fresque murale d''Europe, cette œuvre de street art raconte l''histoire du quartier de la Croix-Rousse et rend hommage aux ouvriers de la soie. Un trompe-l''œil saisissant de réalisme.',
  45.7767, 4.8282, 'Boulevard des Canuts, 69004 Lyon',
  80, 'landmark',
  ARRAY['https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800'],
  15, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'lyon'),
  'Bouchon Lyonnais authentique',
  'Restaurant traditionnel lyonnais où déguster les spécialités locales : quenelles, saucisson chaud, tablier de sapeur. L''ambiance conviviale et la décoration vintage vous plongent dans l''âme lyonnaise.',
  45.7644, 4.8278, 'Rue Saint-Jean, 69005 Lyon',
  50, 'restaurant',
  ARRAY['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'],
  25, true, true
),

-- Barcelona Steps
(
  (SELECT id FROM public.cities WHERE slug = 'barcelona'),
  'Sagrada Família',
  'Chef-d''œuvre inachevé d''Antoni Gaudí, cette basilique extraordinaire mélange gothique et Art nouveau. Ses façades sculptées racontent la vie du Christ tandis que l''intérieur évoque une forêt de pierre pétrifiée.',
  41.4036, 2.1744, 'Carrer de Mallorca, 401, 08013 Barcelona',
  120, 'monument',
  ARRAY['https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800', 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800'],
  40, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'barcelona'),
  'Park Güell',
  'Parc magique conçu par Gaudí, où architecture et nature se mêlent harmonieusement. Ses mosaïques colorées, ses formes organiques et sa vue sur Barcelona en font un lieu féerique unique au monde.',
  41.4145, 2.1527, 'Carrer d''Olot, 5, 08024 Barcelona',
  150, 'viewpoint',
  ARRAY['https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800'],
  35, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'barcelona'),
  'Casa Batlló',
  'Joyau moderniste de Gaudí sur le Passeig de Gràcia. Sa façade ondulante évoque un dragon endormi, tandis que l''intérieur révèle un univers aquatique aux courbes sensuelles et aux couleurs chatoyantes.',
  41.3916, 2.1649, 'Passeig de Gràcia, 43, 08007 Barcelona',
  60, 'monument',
  ARRAY['https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800'],
  30, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'barcelona'),
  'Quartier Gothique',
  'Labyrinthe médiéval au cœur de Barcelona, où cathédrale gothique et palais anciens côtoient bars branchés et boutiques artisanales. Chaque ruelle raconte mille ans d''histoire catalane.',
  41.3828, 2.1761, 'Plaça de la Seu, 08002 Barcelona',
  100, 'landmark',
  ARRAY['https://images.unsplash.com/photo-1541849546-216549ae216d?w=800'],
  25, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'barcelona'),
  'La Boqueria',
  'Marché mythique de Barcelona, explosion de couleurs et de saveurs. Fruits exotiques, jambon ibérique, fromages artisanaux et jus frais s''offrent aux visiteurs dans une ambiance authentiquement catalane.',
  41.3817, 2.1717, 'La Rambla, 91, 08001 Barcelona',
  80, 'restaurant',
  ARRAY['https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800'],
  20, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'barcelona'),
  'Barceloneta Beach',
  'Plage urbaine emblématique où se mélangent culture catalane et ambiance méditerranéenne. Restaurants de poissons, bars chiringuitos et promenades en bord de mer créent une atmosphère unique.',
  41.3755, 2.1901, 'Platja de la Barceloneta, 08003 Barcelona',
  200, 'viewpoint',
  ARRAY['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800'],
  15, false, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'barcelona'),
  'Casa Milà (La Pedrera)',
  'Dernière œuvre civile de Gaudí, cette "carrière de pierre" révolutionne l''architecture résidentielle. Son toit-terrasse sculpté et ses cheminées-soldats offrent une vision futuriste de l''habitat urbain.',
  41.3954, 2.1619, 'Carrer de Provença, 261-265, 08008 Barcelona',
  70, 'monument',
  ARRAY['https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800'],
  30, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'barcelona'),
  'Museu Picasso',
  'Collection exceptionnelle retraçant la formation artistique de Picasso, de ses débuts barcelonais à sa période bleue. Installé dans cinq palais gothiques, le musée révèle les liens profonds entre l''artiste et sa ville.',
  41.3851, 2.1801, 'Carrer Montcada, 15-23, 08003 Barcelona',
  60, 'museum',
  ARRAY['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800'],
  25, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'barcelona'),
  'Flamenco authentique',
  'Spectacle traditionnel dans un tablao historique, où la passion andalouse rencontre l''âme catalane. Guitare, chant et danse s''unissent pour une expérience culturelle inoubliable.',
  41.3818, 2.1778, 'Carrer dels Escudellers, 7, 08002 Barcelona',
  50, 'activity',
  ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'],
  25, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'barcelona'),
  'Montjuïc et Palau Nacional',
  'Colline emblématique offrant la plus belle vue sur Barcelona. Le Palau Nacional abrite le Musée d''Art de Catalogne, tandis que les jardins et fontaines créent un écrin de verdure en pleine ville.',
  41.3681, 2.1537, 'Parc de Montjuïc, 08038 Barcelona',
  180, 'viewpoint',
  ARRAY['https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800'],
  30, true, true
);

-- Prague Steps
INSERT INTO public.steps (
  city_id, name, description, latitude, longitude, address, validation_radius,
  type, images, points_awarded, has_quiz, is_active
) VALUES
(
  (SELECT id FROM public.cities WHERE slug = 'prague'),
  'Château de Prague',
  'Plus grand complexe castral du monde, résidence des rois de Bohême depuis plus de 1000 ans. La cathédrale Saint-Guy, l''ancien palais royal et la ruelle d''Or racontent l''histoire millénaire de la nation tchèque.',
  50.0910, 14.4016, 'Prague Castle, 119 08 Prague 1',
  150, 'monument',
  ARRAY['https://images.unsplash.com/photo-1541849546-216549ae216d?w=800', 'https://images.unsplash.com/photo-1597149960987-c4c7b0d6d8a4?w=800'],
  40, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'prague'),
  'Pont Charles',
  'Pont gothique légendaire orné de 30 statues baroques, théâtre de l''âme praguoise depuis 1357. Musiciens, artistes et touristes s''y mélangent dans une atmosphère magique, surtout au coucher du soleil.',
  50.0865, 14.4114, 'Karlův most, 110 00 Prague 1',
  100, 'landmark',
  ARRAY['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'],
  30, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'prague'),
  'Horloge astronomique',
  'Merveille mécanique médiévale de 1410, cette horloge est la plus ancienne encore en fonctionnement. Chaque heure, les apôtres défilent tandis que la Mort sonne le glas, dans un spectacle fascinant.',
  50.0870, 14.4208, 'Staroměstské náměstí, 110 00 Prague 1',
  80, 'landmark',
  ARRAY['https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800'],
  25, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'prague'),
  'Quartier Juif',
  'Témoignage poignant de mille ans de présence juive à Prague. Synagogues historiques, cimetière aux pierres tombales millénaires et musée juif racontent une histoire riche et tragique.',
  50.0904, 14.4166, 'Maiselova, 110 00 Prague 1',
  120, 'museum',
  ARRAY['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800'],
  35, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'prague'),
  'Brasserie U Fleků',
  'Plus ancienne brasserie de Prague (1499), temple de la bière tchèque. Sa bière brune légendaire, ses salles voûtées et son ambiance conviviale perpétuent 500 ans de tradition brassicole.',
  50.0766, 14.4166, 'Křemencova 11, 110 00 Prague 1',
  60, 'restaurant',
  ARRAY['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'],
  20, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'prague'),
  'Colline de Petřín',
  'Poumon vert de Prague couronné d''une tour panoramique inspirée de la tour Eiffel. Jardins romantiques, observatoire et labyrinth de miroirs créent une escapade bucolique au cœur de la ville.',
  50.0830, 14.3917, 'Petřín Hill, 118 00 Prague 1',
  200, 'viewpoint',
  ARRAY['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800'],
  25, false, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'prague'),
  'Palais Lobkowicz',
  'Seul palais privé du château de Prague, abritant une collection d''art princière exceptionnelle. Œuvres de Canaletto, Bruegel et Velázquez côtoient souvenirs napoléoniens dans un cadre baroque somptueux.',
  50.0915, 14.4030, 'Jiřská 3, 119 00 Prague 1',
  70, 'museum',
  ARRAY['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800'],
  30, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'prague'),
  'Opéra National',
  'Joyau néo-Renaissance où résonne l''âme musicale tchèque. Dvořák, Smetana et Janáček y ont créé leurs chefs-d''œuvre dans ce temple lyrique aux dorures somptueuses.',
  50.0821, 14.4270, 'Legerova 75, 110 00 Prague 1',
  60, 'activity',
  ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'],
  25, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'prague'),
  'Wenceslas Square',
  'Boulevard historique témoin des grands moments de l''histoire tchèque. De la révolution de velours aux manifestations étudiantes, cette "place" longue de 750 mètres bat au rythme de la nation.',
  50.0813, 14.4280, 'Václavské náměstí, 110 00 Prague 1',
  150, 'landmark',
  ARRAY['https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800'],
  20, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'prague'),
  'Caves à absinthe',
  'Mystérieuses caves voûtées où la "fée verte" reprend ses droits. Dégustation d''absinthe traditionnelle dans un décor médiéval, perpétuant une tradition bohème légendaire.',
  50.0857, 14.4193, 'Karlova 12, 110 00 Prague 1',
  50, 'activity',
  ARRAY['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'],
  15, true, true
);

-- Montreal Steps
INSERT INTO public.steps (
  city_id, name, description, latitude, longitude, address, validation_radius,
  type, images, points_awarded, has_quiz, is_active
) VALUES
(
  (SELECT id FROM public.cities WHERE slug = 'montreal'),
  'Basilique Notre-Dame',
  'Joyau néo-gothique du Vieux-Montréal, cette basilique impressionne par ses voûtes étoilées et son retable doré. Ses vitraux racontent l''histoire religieuse du Québec dans un décor d''exception.',
  45.5045, -73.5563, '110 Rue Notre-Dame O, Montreal, QC H2Y 1T1',
  80, 'monument',
  ARRAY['https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800'],
  30, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'montreal'),
  'Vieux-Port de Montréal',
  'Berceau historique de Montréal transformé en parc urbain dynamique. Promenades riveraines, activités nautiques et festivals animent ce lieu où convergent histoire et modernité.',
  45.5086, -73.5536, 'Quai King Edward, Montreal, QC H2Y 2E2',
  150, 'viewpoint',
  ARRAY['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800'],
  20, false, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'montreal'),
  'Mont-Royal',
  'Montagne emblématique offrant la plus belle vue sur Montréal. Conçu par Frederick Law Olmsted, ce parc urban unit nature et culture au cœur de la métropole québécoise.',
  45.5088, -73.5878, 'Mont-Royal, Montreal, QC H2T 2C2',
  200, 'viewpoint',
  ARRAY['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800'],
  25, false, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'montreal'),
  'Marché Jean-Talon',
  'Plus grand marché public d''Amérique du Nord, vitrine de la diversité culturelle montréalaise. Produits du terroir québécois, spécialités ethniques et ambiance conviviale s''y rencontrent.',
  45.5358, -73.6133, '7070 Av Henri-Julien, Montreal, QC H2S 3S3',
  100, 'restaurant',
  ARRAY['https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800'],
  15, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'montreal'),
  'Plateau Mont-Royal',
  'Quartier bohème aux escaliers extérieurs colorés, cœur de la culture montréalaise. Cafés branchés, librairies indépendantes et murales artistiques créent une atmosphère unique.',
  45.5200, -73.5800, 'Rue Saint-Laurent, Montreal, QC H2T 1R5',
  120, 'landmark',
  ARRAY['https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800'],
  20, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'montreal'),
  'Musée des Beaux-Arts',
  'Plus ancien musée du Canada, écrin de l''art québécois et international. De l''art inuit aux maîtres européens, ses collections reflètent la richesse culturelle du Québec.',
  45.4986, -73.5789, '1380 Rue Sherbrooke O, Montreal, QC H3G 1J5',
  70, 'museum',
  ARRAY['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800'],
  25, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'montreal'),
  'Rue Sainte-Catherine',
  'Artère commerciale légendaire, théâtre de la vie montréalaise. Boutiques, grands magasins et festivals de rue animent cette voie mythique longue de 15 kilomètres.',
  45.5090, -73.5617, 'Rue Sainte-Catherine, Montreal, QC H3A 1L1',
  100, 'shop',
  ARRAY['https://images.unsplash.com/photo-1541849546-216549ae216d?w=800'],
  15, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'montreal'),
  'Cabane à sucre urbaine',
  'Expérience authentique des traditions québécoises au cœur de la ville. Sirop d''érable, tourtière et tire sur neige perpétuent l''héritage culinaire du Québec.',
  45.5150, -73.5550, 'Rue de la Commune, Montreal, QC H2Y 2C6',
  60, 'restaurant',
  ARRAY['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'],
  20, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'montreal'),
  'Stade Olympique',
  'Symbole architectural des Jeux Olympiques de 1976, cette "Big O" fascine par sa tour inclinée et son design futuriste. Témoin de la modernité québécoise et de l''ambition olympique.',
  45.5576, -73.5513, '4545 Av Pierre-De Coubertin, Montreal, QC H1V 0B2',
  120, 'landmark',
  ARRAY['https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800'],
  25, true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'montreal'),
  'Ville souterraine RÉSO',
  'Réseau piétonnier souterrain unique au monde, ville dans la ville. 33 kilomètres de tunnels relient centres commerciaux, hôtels et stations de métro dans un labyrinthe fascinant.',
  45.5047, -73.5747, 'Place Ville Marie, Montreal, QC H3B 2E7',
  80, 'landmark',
  ARRAY['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'],
  30, true, true
);

-- ============================================================================
-- PARTNERS - Local businesses and attractions for each city
-- ============================================================================

INSERT INTO public.partners (
  city_id, name, description, category, address, phone, email, website,
  latitude, longitude, logo_url, images, is_active
) VALUES
-- Lyon Partners
(
  (SELECT id FROM public.cities WHERE slug = 'lyon'),
  'Bouchon Daniel et Denise', 
  'Authentique bouchon lyonnais tenu par la même famille depuis 1890. Spécialités : quenelles de brochet, saucisson chaud, tablier de sapeur.',
  'restaurant', 
  '36 Rue Tramassac, 69005 Lyon', 
  '+33 4 78 60 66 53', 
  'contact@daniel-denise.fr', 
  'https://daniel-denise.fr',
  45.7615, 4.8268, 
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200',
  ARRAY['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'],
  true
),
(
  (SELECT id FROM public.cities WHERE slug = 'lyon'),
  'Musée Miniature et Cinéma',
  'Univers fascinant des miniatures hyperréalistes et des effets spéciaux du cinéma. Collections uniques d''objets de films et scènes de vie en miniature.',
  'activity',
  '60 Rue Saint-Jean, 69005 Lyon',
  '+33 4 72 00 24 77',
  'info@museeminiatureetcinema.fr',
  'https://museeminiatureetcinema.fr',
  45.7638, 4.8275,
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=200',
  ARRAY['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800'],
  true
),
(
  (SELECT id FROM public.cities WHERE slug = 'lyon'),
  'Les Halles de la Martinière',
  'Epicerie fine et cave à vins dans le cœur historique de Lyon. Sélection de produits du terroir lyonnais et français.',
  'shop',
  '4 Rue de la Martinière, 69001 Lyon',
  '+33 4 78 71 46 51',
  'contact@halles-martiniere.fr',
  'https://halles-martiniere.fr',
  45.7688, 4.8354,
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200',
  ARRAY['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800'],
  true
),
(
  (SELECT id FROM public.cities WHERE slug = 'lyon'),
  'Hôtel Villa Florentine',
  'Hôtel 5 étoiles dans un ancien couvent du 17ème siècle, vue panoramique sur Lyon. Spa, gastronomie et service d''exception.',
  'hotel',
  '25 Montée Saint-Barthélémy, 69005 Lyon',
  '+33 4 72 56 56 56',
  'info@villaflorentine.com',
  'https://villaflorentine.com',
  45.7605, 4.8245,
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200',
  ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
  true
),

-- Barcelona Partners
(
  (SELECT id FROM public.cities WHERE slug = 'barcelona'),
  'Cal Pep',
  'Bar à tapas légendaire du quartier de la Ribera. Depuis 1986, Pep Manubens régale les Catalans avec les meilleurs produits de la Méditerranée.',
  'restaurant',
  'Plaça de les Olles, 8, 08003 Barcelona',
  '+34 933 10 79 61',
  'info@calpep.com',
  'https://calpep.com',
  41.3859, 2.1823,
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200',
  ARRAY['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'],
  true
),
(
  (SELECT id FROM public.cities WHERE slug = 'barcelona'),
  'Palau de la Música Catalana',
  'Palais de la musique moderniste, patrimoine mondial UNESCO. Concerts de musique classique, jazz et flamenco dans un décor architectural exceptionnel.',
  'activity',
  'Carrer del Palau de la Música, 4-6, 08003 Barcelona',
  '+34 932 95 72 00',
  'info@palaumusica.cat',
  'https://palaumusica.cat',
  41.3875, 2.1753,
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
  ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'],
  true
),
(
  (SELECT id FROM public.cities WHERE slug = 'barcelona'),
  'Custo Dalmau',
  'Boutique de mode barcelonaise iconique. Designs colorés et créatifs qui reflètent l''esprit artistique de la ville.',
  'shop',
  'Carrer de Ferran, 36, 08002 Barcelona',
  '+34 933 42 68 98',
  'barcelona@custo.com',
  'https://custo.com',
  41.3818, 2.1738,
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200',
  ARRAY['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800'],
  true
),
(
  (SELECT id FROM public.cities WHERE slug = 'barcelona'),
  'Hotel Casa Fuster',
  'Hôtel de luxe dans un palais moderniste de 1908. Terrasse avec vue sur le Passeig de Gràcia et concerts de jazz au Café Vienés.',
  'hotel',
  'Passeig de Gràcia, 132, 08008 Barcelona',
  '+34 932 55 30 00',
  'info@hotelcasafuster.com',
  'https://hotelcasafuster.com',
  41.3987, 2.1598,
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200',
  ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
  true
),

-- Prague Partners
(
  (SELECT id FROM public.cities WHERE slug = 'prague'),
  'Lokál',
  'Taverne moderne servant les meilleures bières tchèques et cuisine traditionnelle revisitée. Atmosphère conviviale et authentique.',
  'restaurant',
  'Dlouhá 33, 110 00 Prague 1',
  '+420 222 316 265',
  'info@lokal-dlouha.ambi.cz',
  'https://lokal-dlouha.ambi.cz',
  50.0892, 14.4205,
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200',
  ARRAY['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'],
  true
),
(
  (SELECT id FROM public.cities WHERE slug = 'prague'),
  'Théâtre National',
  'Temple de la culture tchèque, opéra et ballets de renommée mondiale. Architecture néo-Renaissance et programmation exceptionnelle.',
  'activity',
  'Národní 2, 110 00 Prague 1',
  '+420 224 901 448',
  'info@narodni-divadlo.cz',
  'https://narodni-divadlo.cz',
  50.0810, 14.4138,
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
  ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'],
  true
),
(
  (SELECT id FROM public.cities WHERE slug = 'prague'),
  'Manufaktura',
  'Boutique de souvenirs tchèques authentiques. Cristal de Bohême, cosmétiques naturels et artisanat traditionnel.',
  'shop',
  'Melantrichova 17, 110 00 Prague 1',
  '+420 221 632 480',
  'info@manufaktura.cz',
  'https://manufaktura.cz',
  50.0862, 14.4203,
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200',
  ARRAY['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800'],
  true
),
(
  (SELECT id FROM public.cities WHERE slug = 'prague'),
  'Augustine Hotel',
  'Hôtel de luxe dans un monastère du 13ème siècle. Spa, gastronomie raffinée et emplacement exceptionnel près du château.',
  'hotel',
  'Letenská 12/33, 118 00 Prague 1',
  '+420 266 112 233',
  'info@augustinehotel.com',
  'https://augustinehotel.com',
  50.0886, 14.4063,
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200',
  ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
  true
),

-- Montreal Partners
(
  (SELECT id FROM public.cities WHERE slug = 'montreal'),
  'Joe Beef',
  'Restaurant emblématique du quartier Little Burgundy. Cuisine québécoise créative et cave à vins exceptionnelle.',
  'restaurant',
  '2491 Rue Notre-Dame O, Montreal, QC H3J 1N6',
  '+1 514-935-6504',
  'info@joebeef.ca',
  'https://joebeef.ca',
  45.4833, -73.5619,
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200',
  ARRAY['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'],
  true
),
(
  (SELECT id FROM public.cities WHERE slug = 'montreal'),
  'Cirque du Soleil',
  'Spectacles extraordinaires mêlant acrobaties, musique et arts visuels. Créations québécoises reconnues mondialement.',
  'activity',
  '8400 2e Avenue, Montreal, QC H1Z 4M6',
  '+1 514-722-2324',
  'info@cirquedusoleil.com',
  'https://cirquedusoleil.com',
  45.6392, -73.5506,
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
  ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'],
  true
),
(
  (SELECT id FROM public.cities WHERE slug = 'montreal'),
  'Simons',
  'Grand magasin québécois emblématique. Mode, design et lifestyle dans un cadre architectural historique.',
  'shop',
  '977 Rue Sainte-Catherine O, Montreal, QC H3A 0C8',
  '+1 514-282-1840',
  'info@simons.ca',
  'https://simons.ca',
  45.5043, -73.5696,
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200',
  ARRAY['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800'],
  true
),
(
  (SELECT id FROM public.cities WHERE slug = 'montreal'),
  'Fairmont Le Reine Elizabeth',
  'Hôtel légendaire au cœur de Montréal. John Lennon y a enregistré "Give Peace a Chance" en 1969.',
  'hotel',
  '900 René-Lévesque Blvd W, Montreal, QC H3B 4A5',
  '+1 514-861-3511',
  'montreal@fairmont.com',
  'https://fairmont.com/queen-elizabeth-montreal',
  45.5009, -73.5684,
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200',
  ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
  true
);

-- ============================================================================
-- REWARDS - Attractive rewards for each partner
-- ============================================================================

INSERT INTO public.rewards (
  partner_id, title, description, type, value_chf, points_required,
  expires_at, max_redemptions, image_url, terms_conditions, is_active
) VALUES
-- Lyon Rewards
(
  (SELECT id FROM public.partners WHERE name = 'Bouchon Daniel et Denise'),
  'Menu traditionnel -20%',
  'Réduction de 20% sur le menu découverte lyonnais (entrée, plat, dessert)',
  'discount', 15.00, 150,
  '2025-12-31 23:59:59', 50,
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
  'Valable du lundi au vendredi midi. Réservation recommandée. Non cumulable.',
  true
),
(
  (SELECT id FROM public.partners WHERE name = 'Musée Miniature et Cinéma'),
  'Entrée offerte',
  'Billet d''entrée gratuit pour découvrir les collections de miniatures et d''effets spéciaux',
  'free_item', 16.00, 200,
  '2025-12-31 23:59:59', 100,
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400',
  'Valable tous les jours. Présenter le code QR à l''accueil.',
  true
),
(
  (SELECT id FROM public.partners WHERE name = 'Les Halles de la Martinière'),
  'Dégustation gratuite',
  'Dégustation de 3 vins et produits du terroir lyonnais',
  'experience', 12.00, 120,
  '2025-12-31 23:59:59', 30,
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
  'Sur réservation. Durée 30 minutes. Interdit aux mineurs.',
  true
),
(
  (SELECT id FROM public.partners WHERE name = 'Hôtel Villa Florentine'),
  'Surclassement gratuit',
  'Surclassement gratuit selon disponibilité et welcome drink',
  'upgrade', 50.00, 400,
  '2025-12-31 23:59:59', 20,
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
  'Selon disponibilité. Valable pour réservations directes uniquement.',
  true
),

-- Barcelona Rewards
(
  (SELECT id FROM public.partners WHERE name = 'Cal Pep'),
  'Tapas découverte -15%',
  'Réduction de 15% sur la sélection de tapas du chef',
  'discount', 12.00, 180,
  '2025-12-31 23:59:59', 60,
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
  'Valable tous les jours. Minimum 2 personnes. Non cumulable.',
  true
),
(
  (SELECT id FROM public.partners WHERE name = 'Palau de la Música Catalana'),
  'Visite guidée gratuite',
  'Visite guidée complète du palais avec audioguide inclus',
  'free_item', 20.00, 250,
  '2025-12-31 23:59:59', 40,
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
  'Réservation obligatoire. Visites en français, anglais, espagnol, catalan.',
  true
),
(
  (SELECT id FROM public.partners WHERE name = 'Custo Dalmau'),
  'Accessoire offert',
  'Accessoire Custo offert pour tout achat supérieur à 50€',
  'free_item', 25.00, 150,
  '2025-12-31 23:59:59', 80,
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
  'Valable sur les collections actuelles. Choix selon disponibilité.',
  true
),
(
  (SELECT id FROM public.partners WHERE name = 'Hotel Casa Fuster'),
  'Cocktail au rooftop',
  'Cocktail gratuit au bar panoramique avec vue sur Barcelona',
  'free_item', 18.00, 200,
  '2025-12-31 23:59:59', 25,
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
  'Valable de 18h à 22h. Réservation recommandée.',
  true
),

-- Prague Rewards
(
  (SELECT id FROM public.partners WHERE name = 'Lokál'),
  'Plat traditionnel -25%',
  'Réduction de 25% sur les spécialités tchèques avec bière pression',
  'discount', 8.00, 120,
  '2025-12-31 23:59:59', 70,
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
  'Valable tous les jours. Réservation recommandée le weekend.',
  true
),
(
  (SELECT id FROM public.partners WHERE name = 'Théâtre National'),
  'Réduction spectacle -30%',
  'Réduction de 30% sur les billets de spectacle selon disponibilité',
  'discount', 25.00, 300,
  '2025-12-31 23:59:59', 30,
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
  'Selon disponibilité. Valable 48h avant représentation.',
  true
),
(
  (SELECT id FROM public.partners WHERE name = 'Manufaktura'),
  'Souvenir cristal offert',
  'Petit objet en cristal de Bohême offert pour tout achat',
  'free_item', 15.00, 100,
  '2025-12-31 23:59:59', 90,
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
  'Valable dans toutes les boutiques. Choix selon stock disponible.',
  true
),
(
  (SELECT id FROM public.partners WHERE name = 'Augustine Hotel'),
  'Spa access gratuit',
  'Accès gratuit au spa Augustine pendant 2 heures',
  'experience', 40.00, 350,
  '2025-12-31 23:59:59', 15,
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
  'Réservation obligatoire. Accès piscine et sauna inclus.',
  true
),

-- Montreal Rewards
(
  (SELECT id FROM public.partners WHERE name = 'Joe Beef'),
  'Apéritif maison offert',
  'Cocktail signature Joe Beef offert avec le menu',
  'free_item', 14.00, 160,
  '2025-12-31 23:59:59', 45,
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
  'Réservation obligatoire. Valable du mardi au samedi.',
  true
),
(
  (SELECT id FROM public.partners WHERE name = 'Cirque du Soleil'),
  'Réduction billet -20%',
  'Réduction de 20% sur les spectacles à Montréal',
  'discount', 30.00, 280,
  '2025-12-31 23:59:59', 50,
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
  'Selon disponibilité. Valable sur certaines catégories de billets.',
  true
),
(
  (SELECT id FROM public.partners WHERE name = 'Simons'),
  'Carte cadeau 25$',
  'Carte cadeau de 25$ CAD valable dans tous les magasins',
  'free_item', 25.00, 220,
  '2025-12-31 23:59:59', 35,
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
  'Valable 1 an. Non remboursable, non échangeable.',
  true
),
(
  (SELECT id FROM public.partners WHERE name = 'Fairmont Le Reine Elizabeth'),
  'Afternoon Tea -50%',
  'Réduction de 50% sur le thé à l''anglaise au Rosélys',
  'discount', 22.00, 250,
  '2025-12-31 23:59:59', 20,
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
  'Réservation obligatoire. Valable du mercredi au dimanche.',
  true
);

-- ============================================================================
-- JOURNEYS - Complete journeys for each city
-- ============================================================================

INSERT INTO public.journeys (
  city_id, category_id, name, description, difficulty, estimated_duration,
  distance_km, image_url, is_predefined, is_active
) VALUES
-- Lyon Journeys
(
  (SELECT id FROM public.cities WHERE slug = 'lyon'),
  (SELECT id FROM public.journey_categories WHERE slug = 'patrimoine-unesco'),
  'Lyon UNESCO Essentiel',
  'Découverte des sites emblématiques inscrits au patrimoine mondial : Vieux Lyon, Fourvière et Presqu''île. Un parcours à travers 2000 ans d''histoire.',
  'medium', 180, 3.5,
  'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800',
  true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'lyon'),
  (SELECT id FROM public.journey_categories WHERE slug = 'gastronomie-lyonnaise'),
  'Saveurs de Lyon',
  'Parcours gourmand dans les bouchons traditionnels et marchés locaux. Dégustation de spécialités lyonnaises authentiques.',
  'easy', 120, 2.0,
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
  true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'lyon'),
  (SELECT id FROM public.journey_categories WHERE slug = 'traboules-mysteres'),
  'Mystères et Traboules',
  'Exploration des passages secrets de Lyon et découverte des légendes urbaines. Aventure dans les coulisses de l''histoire.',
  'medium', 150, 2.8,
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
  true, true
),

-- Barcelona Journeys
(
  (SELECT id FROM public.cities WHERE slug = 'barcelona'),
  (SELECT id FROM public.journey_categories WHERE slug = 'gaudi-modernisme'),
  'Gaudí et le Modernisme',
  'Sur les traces du génie catalan à travers ses œuvres majeures : Sagrada Família, Park Güell, Casa Batlló. Immersion dans l''univers architectural unique.',
  'medium', 240, 4.2,
  'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800',
  true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'barcelona'),
  (SELECT id FROM public.journey_categories WHERE slug = 'quartier-gothique'),
  'Secrets du Barrio Gótico',
  'Déambulation dans le labyrinthe médiéval du quartier gothique. Découverte des trésors cachés de la Barcelona antique.',
  'easy', 120, 1.8,
  'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800',
  true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'barcelona'),
  (SELECT id FROM public.journey_categories WHERE slug = 'tapas-traditions'),
  'Tapas et Culture Catalane',
  'Immersion dans la culture culinaire catalane : marchés, tapas bars et traditions locales. Saveurs authentiques de la Méditerranée.',
  'easy', 150, 2.5,
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
  true, true
),

-- Prague Journeys
(
  (SELECT id FROM public.cities WHERE slug = 'prague'),
  (SELECT id FROM public.journey_categories WHERE slug = 'chateaux-palais'),
  'Châteaux et Palais Royaux',
  'Voyage dans l''histoire royale tchèque à travers châteaux et palais. De la résidence royale aux jardins secrets.',
  'medium', 200, 3.8,
  'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800',
  true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'prague'),
  (SELECT id FROM public.journey_categories WHERE slug = 'prague-mystique'),
  'Prague Magique et Mystique',
  'Exploration des légendes et mystères de la ville aux cent clochers. Alchimie, fantômes et histoires extraordinaires.',
  'medium', 180, 3.2,
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
  true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'prague'),
  (SELECT id FROM public.journey_categories WHERE slug = 'biere-tradition'),
  'Bière et Traditions Tchèques',
  'Découverte de l''art brassicole tchèque et des tavernes historiques. Culture de la bière et convivialité locale.',
  'easy', 120, 2.0,
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
  true, true
),

-- Montreal Journeys
(
  (SELECT id FROM public.cities WHERE slug = 'montreal'),
  (SELECT id FROM public.journey_categories WHERE slug = 'vieux-montreal'),
  'Vieux-Montréal Historique',
  'Voyage dans le temps à travers le quartier fondateur de Montréal. Architecture nouvelle-france et patrimoine québécois.',
  'easy', 150, 2.2,
  'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800',
  true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'montreal'),
  (SELECT id FROM public.journey_categories WHERE slug = 'plateau-culture'),
  'Plateau et Scène Culturelle',
  'Immersion dans la culture montréalaise contemporaine : art de rue, cafés branchés, créativité québécoise.',
  'medium', 180, 3.0,
  'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800',
  true, true
),
(
  (SELECT id FROM public.cities WHERE slug = 'montreal'),
  (SELECT id FROM public.journey_categories WHERE slug = 'saveurs-quebec'),
  'Saveurs Authentiques du Québec',
  'Exploration culinaire des spécialités québécoises : marchés, cabanes à sucre, gastronomie locale.',
  'easy', 120, 2.5,
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
  true, true
);

-- ============================================================================
-- JOURNEY STEPS - Link steps to journeys in logical order
-- ============================================================================

-- Lyon UNESCO Essentiel Journey
INSERT INTO public.journey_steps (journey_id, step_id, step_order, custom_instructions) VALUES
(
  (SELECT id FROM public.journeys WHERE name = 'Lyon UNESCO Essentiel'),
  (SELECT id FROM public.steps WHERE name = 'Basilique Notre-Dame de Fourvière'),
  1, 'Commencez par la basilique pour une vue d''ensemble sur Lyon'
),
(
  (SELECT id FROM public.journeys WHERE name = 'Lyon UNESCO Essentiel'),
  (SELECT id FROM public.steps WHERE name = 'Vieux Lyon Renaissance'),
  2, 'Descendez vers le quartier Renaissance'
),
(
  (SELECT id FROM public.journeys WHERE name = 'Lyon UNESCO Essentiel'),
  (SELECT id FROM public.steps WHERE name = 'Traboules de la Croix-Rousse'),
  3, 'Découvrez les passages secrets des canuts'
),
(
  (SELECT id FROM public.journeys WHERE name = 'Lyon UNESCO Essentiel'),
  (SELECT id FROM public.steps WHERE name = 'Place Bellecour'),
  4, 'Terminez par la place centrale de Lyon'
);

-- Lyon Saveurs de Lyon Journey
INSERT INTO public.journey_steps (journey_id, step_id, step_order, custom_instructions) VALUES
(
  (SELECT id FROM public.journeys WHERE name = 'Saveurs de Lyon'),
  (SELECT id FROM public.steps WHERE name = 'Halles de Lyon Paul Bocuse'),
  1, 'Commencez par le temple de la gastronomie lyonnaise'
),
(
  (SELECT id FROM public.journeys WHERE name = 'Saveurs de Lyon'),
  (SELECT id FROM public.steps WHERE name = 'Bouchon Lyonnais authentique'),
  2, 'Déjeunez dans un authentique bouchon lyonnais'
),
(
  (SELECT id FROM public.journeys WHERE name = 'Saveurs de Lyon'),
  (SELECT id FROM public.steps WHERE name = 'Vieux Lyon Renaissance'),
  3, 'Promenade digestive dans le Vieux Lyon'
);

-- Barcelona Gaudí Journey
INSERT INTO public.journey_steps (journey_id, step_id, step_order, custom_instructions) VALUES
(
  (SELECT id FROM public.journeys WHERE name = 'Gaudí et le Modernisme'),
  (SELECT id FROM public.steps WHERE name = 'Sagrada Família'),
  1, 'Commencez par le chef-d''œuvre inachevé de Gaudí'
),
(
  (SELECT id FROM public.journeys WHERE name = 'Gaudí et le Modernisme'),
  (SELECT id FROM public.steps WHERE name = 'Park Güell'),
  2, 'Continuez vers le parc magique de Gaudí'
),
(
  (SELECT id FROM public.journeys WHERE name = 'Gaudí et le Modernisme'),
  (SELECT id FROM public.steps WHERE name = 'Casa Batlló'),
  3, 'Découvrez la maison-dragon sur le Passeig de Gràcia'
),
(
  (SELECT id FROM public.journeys WHERE name = 'Gaudí et le Modernisme'),
  (SELECT id FROM public.steps WHERE name = 'Casa Milà (La Pedrera)'),
  4, 'Terminez par la dernière œuvre civile de Gaudí'
);

-- Prague Châteaux Journey
INSERT INTO public.journey_steps (journey_id, step_id, step_order, custom_instructions) VALUES
(
  (SELECT id FROM public.journeys WHERE name = 'Châteaux et Palais Royaux'),
  (SELECT id FROM public.steps WHERE name = 'Château de Prague'),
  1, 'Commencez par le plus grand complexe castral du monde'
),
(
  (SELECT id FROM public.journeys WHERE name = 'Châteaux et Palais Royaux'),
  (SELECT id FROM public.steps WHERE name = 'Palais Lobkowicz'),
  2, 'Visitez le seul palais privé du château'
),
(
  (SELECT id FROM public.journeys WHERE name = 'Châteaux et Palais Royaux'),
  (SELECT id FROM public.steps WHERE name = 'Pont Charles'),
  3, 'Traversez le pont légendaire vers la vieille ville'
),
(
  (SELECT id FROM public.journeys WHERE name = 'Châteaux et Palais Royaux'),
  (SELECT id FROM public.steps WHERE name = 'Colline de Petřín'),
  4, 'Terminez par une vue panoramique sur Prague'
);

-- Montreal Vieux-Montréal Journey
INSERT INTO public.journey_steps (journey_id, step_id, step_order, custom_instructions) VALUES
(
  (SELECT id FROM public.journeys WHERE name = 'Vieux-Montréal Historique'),
  (SELECT id FROM public.steps WHERE name = 'Basilique Notre-Dame'),
  1, 'Commencez par le joyau néo-gothique'
),
(
  (SELECT id FROM public.journeys WHERE name = 'Vieux-Montréal Historique'),
  (SELECT id FROM public.steps WHERE name = 'Vieux-Port de Montréal'),
  2, 'Promenez-vous le long du fleuve Saint-Laurent'
),
(
  (SELECT id FROM public.journeys WHERE name = 'Vieux-Montréal Historique'),
  (SELECT id FROM public.steps WHERE name = 'Ville souterraine RÉSO'),
  3, 'Découvrez la ville souterraine'
),
(
  (SELECT id FROM public.journeys WHERE name = 'Vieux-Montréal Historique'),
  (SELECT id FROM public.steps WHERE name = 'Rue Sainte-Catherine'),
  4, 'Terminez par l''artère commerciale emblématique'
);

-- Update journey total points
UPDATE public.journeys 
SET total_points = (
  SELECT COALESCE(SUM(s.points_awarded), 0)
  FROM public.journey_steps js
  JOIN public.steps s ON js.step_id = s.id
  WHERE js.journey_id = journeys.id
);

-- ============================================================================
-- QUIZ QUESTIONS - Realistic questions for each step
-- ============================================================================

-- This will be handled by the existing quiz question migration
-- But let's add some specific questions for our new steps

INSERT INTO public.quiz_questions (step_id, question, question_type, options, correct_answer, explanation, points_awarded, bonus_points)
SELECT 
  s.id,
  CASE 
    WHEN s.name = 'Sagrada Família' THEN 'En quelle année Antoni Gaudí a-t-il commencé les travaux de la Sagrada Família ?'
    WHEN s.name = 'Park Güell' THEN 'Quelle était la fonction originale du Park Güell ?'
    WHEN s.name = 'Château de Prague' THEN 'Depuis combien de temps le château de Prague est-il habité ?'
    WHEN s.name = 'Pont Charles' THEN 'Combien de statues baroques ornent le Pont Charles ?'
    WHEN s.name = 'Basilique Notre-Dame de Fourvière' THEN 'Quel surnom les Lyonnais donnent-ils à la basilique de Fourvière ?'
    WHEN s.name = 'Basilique Notre-Dame' AND s.city_id = (SELECT id FROM public.cities WHERE slug = 'montreal') THEN 'Quel style architectural caractérise la basilique Notre-Dame de Montréal ?'
    ELSE 'Quelle est la particularité historique de ce lieu ?'
  END,
  'multiple_choice',
  CASE 
    WHEN s.name = 'Sagrada Família' THEN '["1882", "1890", "1875", "1900"]'::jsonb
    WHEN s.name = 'Park Güell' THEN '["Cité-jardin résidentielle", "Parc public", "Jardin privé", "Parc d''attractions"]'::jsonb
    WHEN s.name = 'Château de Prague' THEN '["Plus de 1000 ans", "800 ans", "500 ans", "1200 ans"]'::jsonb
    WHEN s.name = 'Pont Charles' THEN '["30 statues", "25 statues", "35 statues", "40 statues"]'::jsonb
    WHEN s.name = 'Basilique Notre-Dame de Fourvière' THEN '["La tour Eiffel à l''envers", "La sentinelle de Lyon", "La gardienne", "Le phare"]'::jsonb
    WHEN s.name = 'Basilique Notre-Dame' AND s.city_id = (SELECT id FROM public.cities WHERE slug = 'montreal') THEN '["Néo-gothique", "Gothique", "Roman", "Baroque"]'::jsonb
    ELSE '["Architecture unique", "Histoire millénaire", "Légendes locales", "Patrimoine mondial"]'::jsonb
  END,
  CASE 
    WHEN s.name = 'Sagrada Família' THEN '1882'
    WHEN s.name = 'Park Güell' THEN 'Cité-jardin résidentielle'
    WHEN s.name = 'Château de Prague' THEN 'Plus de 1000 ans'
    WHEN s.name = 'Pont Charles' THEN '30 statues'
    WHEN s.name = 'Basilique Notre-Dame de Fourvière' THEN 'La tour Eiffel à l''envers'
    WHEN s.name = 'Basilique Notre-Dame' AND s.city_id = (SELECT id FROM public.cities WHERE slug = 'montreal') THEN 'Néo-gothique'
    ELSE 'Architecture unique'
  END,
  CASE 
    WHEN s.name = 'Sagrada Família' THEN 'Gaudí a pris en charge le projet en 1882, un an après le début des travaux par Francisco de Paula del Villar.'
    WHEN s.name = 'Park Güell' THEN 'Initialement conçu comme une cité-jardin résidentielle de luxe, le projet fut transformé en parc public en 1922.'
    WHEN s.name = 'Château de Prague' THEN 'Depuis le 9ème siècle, le château de Prague est le siège du pouvoir, ce qui en fait le plus ancien complexe castral habité du monde.'
    WHEN s.name = 'Pont Charles' THEN 'Les 30 statues baroques, principalement du 18ème siècle, transforment le pont en véritable galerie d''art à ciel ouvert.'
    WHEN s.name = 'Basilique Notre-Dame de Fourvière' THEN 'Les Lyonnais l''appellent affectueusement "la tour Eiffel à l''envers" en raison de sa silhouette imposante.'
    WHEN s.name = 'Basilique Notre-Dame' AND s.city_id = (SELECT id FROM public.cities WHERE slug = 'montreal') THEN 'Construite entre 1824 et 1829, elle représente un magnifique exemple du style néo-gothique en Amérique du Nord.'
    ELSE 'Chaque lieu historique possède ses propres caractéristiques architecturales et culturelles uniques.'
  END,
  20,
  10
FROM public.steps s
WHERE s.name IN ('Sagrada Família', 'Park Güell', 'Château de Prague', 'Pont Charles', 'Basilique Notre-Dame de Fourvière', 'Basilique Notre-Dame');

-- ============================================================================
-- CONTENT DOCUMENTS - Rich cultural and historical content
-- ============================================================================

-- This is handled by the existing content documents migration
-- The existing migration already populates content for steps

-- ============================================================================
-- FINAL UPDATES AND OPTIMIZATIONS
-- ============================================================================

-- Update journey distances and durations based on actual step locations
UPDATE public.journeys 
SET distance_km = CASE 
  WHEN name = 'Lyon UNESCO Essentiel' THEN 3.5
  WHEN name = 'Saveurs de Lyon' THEN 2.0
  WHEN name = 'Mystères et Traboules' THEN 2.8
  WHEN name = 'Gaudí et le Modernisme' THEN 4.2
  WHEN name = 'Secrets du Barrio Gótico' THEN 1.8
  WHEN name = 'Tapas et Culture Catalane' THEN 2.5
  WHEN name = 'Châteaux et Palais Royaux' THEN 3.8
  WHEN name = 'Prague Magique et Mystique' THEN 3.2
  WHEN name = 'Bière et Traditions Tchèques' THEN 2.0
  WHEN name = 'Vieux-Montréal Historique' THEN 2.2
  WHEN name = 'Plateau et Scène Culturelle' THEN 3.0
  WHEN name = 'Saveurs Authentiques du Québec' THEN 2.5
  ELSE distance_km
END;

-- Create some additional journey steps for completeness
INSERT INTO public.journey_steps (journey_id, step_id, step_order, custom_instructions) VALUES
-- Barcelona Quartier Gothique
(
  (SELECT id FROM public.journeys WHERE name = 'Secrets du Barrio Gótico'),
  (SELECT id FROM public.steps WHERE name = 'Quartier Gothique'),
  1, 'Commencez par une vue d''ensemble du quartier gothique'
),
(
  (SELECT id FROM public.journeys WHERE name = 'Secrets du Barrio Gótico'),
  (SELECT id FROM public.steps WHERE name = 'La Boqueria'),
  2, 'Découvrez les saveurs du marché emblématique'
),
(
  (SELECT id FROM public.journeys WHERE name = 'Secrets du Barrio Gótico'),
  (SELECT id FROM public.steps WHERE name = 'Museu Picasso'),
  3, 'Explorez l''art de Picasso dans son cadre gothique'
),

-- Prague Mystique
(
  (SELECT id FROM public.journeys WHERE name = 'Prague Magique et Mystique'),
  (SELECT id FROM public.steps WHERE name = 'Horloge astronomique'),
  1, 'Commencez par l''horloge mystérieuse'
),
(
  (SELECT id FROM public.journeys WHERE name = 'Prague Magique et Mystique'),
  (SELECT id FROM public.steps WHERE name = 'Quartier Juif'),
  2, 'Découvrez l''histoire millénaire du quartier juif'
),
(
  (SELECT id FROM public.journeys WHERE name = 'Prague Magique et Mystique'),
  (SELECT id FROM public.steps WHERE name = 'Caves à absinthe'),
  3, 'Terminez par une expérience mystique à l''absinthe'
),

-- Montreal Plateau Culture
(
  (SELECT id FROM public.journeys WHERE name = 'Plateau et Scène Culturelle'),
  (SELECT id FROM public.steps WHERE name = 'Plateau Mont-Royal'),
  1, 'Commencez par le quartier bohème'
),
(
  (SELECT id FROM public.journeys WHERE name = 'Plateau et Scène Culturelle'),
  (SELECT id FROM public.steps WHERE name = 'Musée des Beaux-Arts'),
  2, 'Découvrez l''art québécois et international'
),
(
  (SELECT id FROM public.journeys WHERE name = 'Plateau et Scène Culturelle'),
  (SELECT id FROM public.steps WHERE name = 'Mont-Royal'),
  3, 'Terminez par une vue panoramique sur la ville'
);

-- Final update of total points for all journeys
UPDATE public.journeys 
SET total_points = (
  SELECT COALESCE(SUM(s.points_awarded), 0)
  FROM public.journey_steps js
  JOIN public.steps s ON js.step_id = s.id
  WHERE js.journey_id = journeys.id
);

-- Add some variety to has_quiz flags
UPDATE public.steps SET has_quiz = true WHERE points_awarded >= 25;
UPDATE public.steps SET has_quiz = false WHERE type = 'viewpoint' AND points_awarded < 20;

-- Ensure all images are properly set
UPDATE public.steps SET images = ARRAY['https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800'] WHERE type = 'monument' AND images = '{}';
UPDATE public.steps SET images = ARRAY['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800'] WHERE type = 'museum' AND images = '{}';
UPDATE public.steps SET images = ARRAY['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'] WHERE type = 'restaurant' AND images = '{}';
UPDATE public.steps SET images = ARRAY['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800'] WHERE type = 'viewpoint' AND images = '{}';
UPDATE public.steps SET images = ARRAY['https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800'] WHERE type = 'landmark' AND images = '{}';
UPDATE public.steps SET images = ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'] WHERE type = 'activity' AND images = '{}';
UPDATE public.steps SET images = ARRAY['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800'] WHERE type = 'shop' AND images = '{}';

-- Success message
DO $$ BEGIN
  RAISE NOTICE 'Comprehensive test data successfully created!';
  RAISE NOTICE 'Cities: % rows', (SELECT COUNT(*) FROM public.cities WHERE slug != 'admin');
  RAISE NOTICE 'Journey Categories: % rows', (SELECT COUNT(*) FROM public.journey_categories);
  RAISE NOTICE 'Steps: % rows', (SELECT COUNT(*) FROM public.steps);
  RAISE NOTICE 'Journeys: % rows', (SELECT COUNT(*) FROM public.journeys);
  RAISE NOTICE 'Partners: % rows', (SELECT COUNT(*) FROM public.partners);
  RAISE NOTICE 'Rewards: % rows', (SELECT COUNT(*) FROM public.rewards);
  RAISE NOTICE 'Quiz Questions: % rows', (SELECT COUNT(*) FROM public.quiz_questions);
END $$;