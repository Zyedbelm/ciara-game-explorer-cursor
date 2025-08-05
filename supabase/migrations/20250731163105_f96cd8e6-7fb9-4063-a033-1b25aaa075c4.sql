-- Add documents for new steps and create journey-step relationships
-- Part 3: Documents and journey organization

-- Add documents for Carcassonne steps
WITH carcassonne_documents AS (
  INSERT INTO public.content_documents (step_id, city_id, title, content, document_type, language, description)
  SELECT 
    s.id,
    s.city_id,
    doc_title,
    doc_content,
    'historical_info',
    'fr',
    doc_description
  FROM public.steps s,
  (VALUES
    ('Cité de Carcassonne', 'Histoire de la Cité de Carcassonne', 'La Cité de Carcassonne est un ensemble architectural médiéval qui se dresse sur la rive droite de l''Aude, dans la ville de Carcassonne. Fortifiée depuis l''époque gallo-romaine, elle doit son aspect actuel aux restaurations entreprises au XIXe siècle par Eugène Viollet-le-Duc. La cité comprend le château comtal et 52 tours, le tout étant ceint d''une double enceinte fortifiée. Site touristique majeur, elle accueille plus de 4 millions de visiteurs par an.', 'Guide historique de la cité fortifiée'),
    
    ('Château Comtal', 'Le Château Comtal et ses défenses', 'Le Château Comtal, situé au cœur de la Cité, fut la résidence des vicomtes Trencavel puis des sénéchaux royaux. Construit au XIIe siècle, il a été remanié à plusieurs reprises. Ses fortifications comprennent un fossé sec, une barbacane et des courtines défensives. Le château abrite aujourd''hui un musée lapidaire et offre un point de vue exceptionnel sur la ville basse et la vallée de l''Aude.', 'Architecture militaire médiévale'),
    
    ('Basilique Saint-Nazaire', 'La Basilique Saint-Nazaire et Saint-Celse', 'Cette basilique présente la particularité de mélanger deux styles architecturaux : roman pour la nef (XIe-XIIe siècles) et gothique rayonnant pour le chœur et le transept (XIIIe-XIVe siècles). Elle abrite des vitraux remarquables des XIVe et XVIe siècles, considérés parmi les plus beaux du Midi de la France. Le tympan du portail sud représente le Christ en majesté entouré du tétramorphe.', 'Art religieux médiéval'),
    
    ('Canal du Midi', 'Le Canal du Midi : chef-d''œuvre d''ingénierie', 'Construit entre 1667 et 1681 sous la direction de Pierre-Paul Riquet, le Canal du Midi relie la Garonne à la Méditerranée. Long de 240 kilomètres, il compte 126 ouvrages d''art dont 63 écluses, 126 ponts, 7 ponts-canaux et 6 barrages. Inscrit au patrimoine mondial de l''UNESCO en 1996, il constitue l''une des plus remarquables réalisations du génie civil du XVIIe siècle.', 'Ingénierie hydraulique historique')
  ) AS docs(step_name, doc_title, doc_content, doc_description)
  WHERE s.name = docs.step_name AND s.city_id = (SELECT id FROM public.cities WHERE name = 'Carcassonne')
  RETURNING id, step_id
)

-- Add documents for Narbonne steps
, narbonne_documents AS (
  INSERT INTO public.content_documents (step_id, city_id, title, content, document_type, language, description)
  SELECT 
    s.id,
    s.city_id,
    doc_title,
    doc_content,
    'historical_info',
    'fr',
    doc_description
  FROM public.steps s,
  (VALUES
    ('Cathédrale Saint-Just-et-Saint-Pasteur', 'La Cathédrale inachevée de Narbonne', 'Commencée en 1272, la cathédrale Saint-Just-et-Saint-Pasteur de Narbonne devait être l''une des plus grandes cathédrales de France. Seuls le chœur et une partie du transept furent achevés. Avec ses 41 mètres de hauteur sous voûte, elle possède le quatrième chœur le plus haut de France après Beauvais, Amiens et Metz. L''édifice abrite un remarquable orgue de tribune du XVIIe siècle et de magnifiques verrières.', 'Architecture gothique meridionale'),
    
    ('Palais des Archevêques', 'Le Palais des Archevêques de Narbonne', 'Ce complexe architectural exceptionnel témoigne de la puissance temporelle des archevêques de Narbonne du XIIe au XIVe siècle. Il comprend le Palais Vieux (XIIe-XIIIe siècles) et le Palais Neuf (XIVe siècle). Les trois tours - Gilles Aycelin, Saint-Martial et Madeleine - offrent un panorama exceptionnel sur la ville et la région. Le palais abrite aujourd''hui l''hôtel de ville et plusieurs musées.', 'Architecture religieuse et civile'),
    
    ('Via Domitia', 'La Via Domitia : première route romaine de Gaule', 'Construite en 118 av. J.-C., la Via Domitia fut la première voie romaine construite en Gaule. Elle reliait l''Italie à l''Espagne en passant par Narbonne, alors capitale de la province de Gaule narbonnaise. Des vestiges de cette route sont encore visibles dans la ville, notamment une section pavée conservée et des bornes milliaires. Cette voie stratégique favorisa le développement économique et culturel de la région.', 'Voies de communication antiques'),
    
    ('Musée Narbo Via', 'Narbo Martius : première colonie romaine de Gaule', 'Fondée en 118 av. J.-C., Narbo Martius (Narbonne antique) fut la première colonie romaine établie hors d''Italie. Capitale de la province de Gaule narbonnaise, elle devint rapidement l''un des ports les plus importants de Méditerranée occidentale. Le musée Narbo Via, ouvert en 2021, présente les collections archéologiques exceptionnelles découvertes sur le territoire narbonnais, témoignant de deux millénaires d''histoire.', 'Archéologie gallo-romaine')
  ) AS docs(step_name, doc_title, doc_content, doc_description)
  WHERE s.name = docs.step_name AND s.city_id = (SELECT id FROM public.cities WHERE name = 'Narbonne')
  RETURNING id, step_id
)

-- Add documents for new Montreux steps
, montreux_documents AS (
  INSERT INTO public.content_documents (step_id, city_id, title, content, document_type, language, description)
  SELECT 
    s.id,
    s.city_id,
    doc_title,
    doc_content,
    'historical_info',
    'fr',
    doc_description
  FROM public.steps s,
  (VALUES
    ('Terrasses de Lavaux', 'Les Terrasses de Lavaux : un paysage façonné par l''homme', 'Les Terrasses de Lavaux s''étendent sur 30 kilomètres entre Montreux et Lausanne. Ce paysage viticole exceptionnel, fruit de mille ans de travail humain, comprend plus de 10 000 terrasses soutenues par des murets de pierre sèche. Inscrit au patrimoine mondial de l''UNESCO en 2007, il produit des vins réputés grâce à un microclimat unique bénéficiant du triple effet du soleil, du lac et des pierres des murets qui restituent la chaleur.', 'Patrimoine viticole et paysager'),
    
    ('Rochers-de-Naye', 'Les Rochers-de-Naye : sommet panoramique du Léman', 'Culminant à 2042 mètres, les Rochers-de-Naye offrent un panorama exceptionnel sur le lac Léman, les Alpes françaises et suisses. Accessible depuis 1892 par un chemin de fer à crémaillère au départ de Montreux, ce sommet abrite un jardin alpin remarquable présentant plus de 1000 espèces de montagne. La réserve naturelle protège une faune et une flore alpines diversifiées, dont des marmottes et des edelweiss.', 'Écosystème alpin et panorama'),
    
    ('Gorges du Chaudron', 'Les Gorges du Chaudron : canyon spectaculaire', 'Creusées par l''érosion glaciaire puis par la rivière Baye de Montreux, les Gorges du Chaudron forment un canyon spectaculaire de 76 mètres de profondeur. Découvertes en 1877, elles se parcourent par un sentier aménagé le long de passerelles et ponts suspendus. Les parois rocheuses abritent une végétation particulière adaptée à l''humidité constante, créant un microclimat unique dans la région.', 'Géologie et phénomènes naturels')
  ) AS docs(step_name, doc_title, doc_content, doc_description)
  WHERE s.name = docs.step_name AND s.city_id = (SELECT id FROM public.cities WHERE name = 'Montreux')
  RETURNING id, step_id
)

-- Add document for new Lausanne step
, lausanne_documents AS (
  INSERT INTO public.content_documents (step_id, city_id, title, content, document_type, language, description)
  SELECT 
    s.id,
    s.city_id,
    doc_title,
    doc_content,
    'historical_info',
    'fr',
    doc_description
  FROM public.steps s,
  (VALUES
    ('Collection de l''Art Brut', 'L''Art Brut selon Jean Dubuffet', 'L''Art Brut désigne des ouvrages exécutés par des personnes indemnes de culture artistique, chez lesquelles le mimétisme, contrairement à ce qui se passe chez les intellectuels, ait peu ou pas de part. Concept créé par Jean Dubuffet en 1945, il rassemble des créations spontanées, étrangères aux conventions artistiques. La Collection de l''Art Brut de Lausanne, inaugurée en 1976, présente plus de 70 000 œuvres d''environ 1000 auteurs, constituant la plus importante collection au monde dans ce domaine.', 'Art marginal et création spontanée')
  ) AS docs(step_name, doc_title, doc_content, doc_description)
  WHERE s.name = docs.step_name AND s.city_id = (SELECT id FROM public.cities WHERE name = 'Lausanne')
  RETURNING id, step_id
)

-- Create journey-step relationships for new journeys
, journey_step_relations AS (
  INSERT INTO public.journey_steps (journey_id, step_id, step_order, custom_instructions)
  SELECT 
    j.id,
    s.id,
    step_order,
    custom_instruction
  FROM public.journeys j
  JOIN public.cities c ON j.city_id = c.id
  JOIN public.steps s ON s.city_id = c.id,
  (VALUES
    -- Carcassonne - Trésors de la Cité Médiévale
    ('Carcassonne', 'Trésors de la Cité Médiévale', 'Cité de Carcassonne', 1, 'Commencez votre visite par l''entrée principale de la Cité'),
    ('Carcassonne', 'Trésors de la Cité Médiévale', 'Château Comtal', 2, 'Explorez le cœur défensif de la Cité'),
    ('Carcassonne', 'Trésors de la Cité Médiévale', 'Basilique Saint-Nazaire', 3, 'Admirez les vitraux exceptionnels'),
    ('Carcassonne', 'Trésors de la Cité Médiévale', 'Musée de l''Inquisition', 4, 'Plongez dans l''histoire médiévale'),
    
    -- Carcassonne - Nature et Patrimoine  
    ('Carcassonne', 'Nature et Patrimoine', 'Lac de la Cavayère', 1, 'Détendez-vous dans ce cadre naturel'),
    ('Carcassonne', 'Nature et Patrimoine', 'Canal du Midi', 2, 'Promenez-vous le long du canal historique'),
    ('Carcassonne', 'Nature et Patrimoine', 'Pont Vieux', 3, 'Traversez ce pont médiéval'),
    ('Carcassonne', 'Nature et Patrimoine', 'Cité de Carcassonne', 4, 'Terminez par la vue sur la Cité depuis la ville basse'),
    
    -- Carcassonne - Saveurs Cathares
    ('Carcassonne', 'Saveurs Cathares', 'Marché de Carcassonne', 1, 'Découvrez les produits locaux'),
    ('Carcassonne', 'Saveurs Cathares', 'Cité de Carcassonne', 2, 'Déjeunez dans un restaurant de la Cité'),
    
    -- Narbonne - Narbonne Antique
    ('Narbonne', 'Narbonne Antique', 'Via Domitia', 1, 'Commencez par la voie romaine'),
    ('Narbonne', 'Narbonne Antique', 'Musée Narbo Via', 2, 'Découvrez les collections archéologiques'),
    ('Narbonne', 'Narbonne Antique', 'Cathédrale Saint-Just-et-Saint-Pasteur', 3, 'Admirez l''architecture gothique'),
    ('Narbonne', 'Narbonne Antique', 'Palais des Archevêques', 4, 'Explorez le complexe archiépiscopal'),
    
    -- Narbonne - Entre Terre et Mer
    ('Narbonne', 'Entre Terre et Mer', 'Canal de la Robine', 1, 'Promenez-vous le long du canal'),
    ('Narbonne', 'Entre Terre et Mer', 'Réserve Naturelle Sainte-Lucie', 2, 'Observez la faune protégée'),
    ('Narbonne', 'Entre Terre et Mer', 'Abbaye de Fontfroide', 3, 'Visitez cette abbaye cistercienne'),
    
    -- Narbonne - Délices du Terroir
    ('Narbonne', 'Délices du Terroir', 'Halles de Narbonne', 1, 'Découvrez les spécialités locales'),
    ('Narbonne', 'Délices du Terroir', 'Canal de la Robine', 2, 'Terminez par une promenade digestive')
  ) AS relations(city_name, journey_name, step_name, step_order, custom_instruction)
  WHERE c.name = relations.city_name 
    AND j.name = relations.journey_name 
    AND s.name = relations.step_name
  RETURNING id, journey_id, step_id
)

-- Update has_quiz flag for steps with quizzes
, update_quiz_flags AS (
  UPDATE public.steps 
  SET has_quiz = true, updated_at = now()
  WHERE id IN (
    SELECT DISTINCT step_id 
    FROM public.quiz_questions 
    WHERE step_id IN (
      SELECT id FROM public.steps 
      WHERE city_id IN (
        SELECT id FROM public.cities 
        WHERE name IN ('Carcassonne', 'Narbonne', 'Montreux', 'Lausanne')
      )
    )
  )
  RETURNING id
)

SELECT 'Content enrichment plan fully implemented - documents, journey relationships, and quiz flags updated' as result;