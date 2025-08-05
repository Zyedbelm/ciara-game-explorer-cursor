-- Fix journey-step relationships and complete content enrichment
-- Remove problematic data and rebuild journey relationships correctly

-- First, clean up any duplicate journey-step relationships that might exist
DELETE FROM public.journey_steps 
WHERE journey_id IN (
  SELECT j.id FROM public.journeys j
  JOIN public.cities c ON j.city_id = c.id
  WHERE c.name IN ('Carcassonne', 'Narbonne')
  AND j.name IN ('Trésors de la Cité Médiévale', 'Nature et Patrimoine', 'Saveurs Cathares', 
                 'Narbonne Antique', 'Entre Terre et Mer', 'Délices du Terroir')
);

-- Add documents for new steps
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
    ('Cité de Carcassonne', 'Histoire de la Cité de Carcassonne', 'La Cité de Carcassonne est un ensemble architectural médiéval inscrit au patrimoine mondial de l''UNESCO en 1997. Fortifiée depuis l''époque gallo-romaine, elle comprend 52 tours et une double enceinte.', 'Guide historique de la cité fortifiée'),
    ('Château Comtal', 'Le Château Comtal', 'Résidence des vicomtes Trencavel, ce château du XIIe siècle abrite aujourd''hui un musée et offre une vue exceptionnelle sur la vallée.', 'Architecture militaire médiévale'),
    ('Canal du Midi', 'Le Canal du Midi', 'Chef-d''œuvre d''ingénierie du XVIIe siècle conçu par Pierre-Paul Riquet, inscrit au patrimoine UNESCO en 1996.', 'Ingénierie hydraulique historique')
  ) AS docs(step_name, doc_title, doc_content, doc_description)
  WHERE s.name = docs.step_name AND s.city_id = (SELECT id FROM public.cities WHERE name = 'Carcassonne')
  AND NOT EXISTS (SELECT 1 FROM public.content_documents WHERE step_id = s.id)
  RETURNING id
)

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
    ('Cathédrale Saint-Just-et-Saint-Pasteur', 'La Cathédrale de Narbonne', 'Cathédrale gothique inachevée commencée en 1272, possédant le quatrième chœur le plus haut de France avec 41 mètres.', 'Architecture gothique méridionale'),
    ('Palais des Archevêques', 'Le Palais des Archevêques', 'Complexe architectural témoignant de la puissance des archevêques de Narbonne, comprenant trois tours principales.', 'Architecture religieuse et civile'),
    ('Via Domitia', 'La Via Domitia', 'Première voie romaine construite en Gaule en 118 av. J.-C., reliant l''Italie à l''Espagne via Narbonne.', 'Voies de communication antiques'),
    ('Musée Narbo Via', 'Narbo Martius', 'Première colonie romaine hors d''Italie fondée en 118 av. J.-C., capitale de la Gaule narbonnaise.', 'Archéologie gallo-romaine')
  ) AS docs(step_name, doc_title, doc_content, doc_description)
  WHERE s.name = docs.step_name AND s.city_id = (SELECT id FROM public.cities WHERE name = 'Narbonne')
  AND NOT EXISTS (SELECT 1 FROM public.content_documents WHERE step_id = s.id)
  RETURNING id
)

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
    ('Terrasses de Lavaux', 'Les Terrasses de Lavaux', 'Vignobles en terrasses inscrits à l''UNESCO en 2007, s''étendant sur 30 kilomètres avec plus de 10 000 terrasses.', 'Patrimoine viticole'),
    ('Rochers-de-Naye', 'Les Rochers-de-Naye', 'Sommet culminant à 2042 mètres, accessible par crémaillère, offrant un panorama exceptionnel sur le lac Léman.', 'Écosystème alpin'),
    ('Gorges du Chaudron', 'Les Gorges du Chaudron', 'Canyon spectaculaire de 76 mètres de profondeur creusé par l''érosion glaciaire, découvert en 1877.', 'Géologie naturelle')
  ) AS docs(step_name, doc_title, doc_content, doc_description)
  WHERE s.name = docs.step_name AND s.city_id = (SELECT id FROM public.cities WHERE name = 'Montreux')
  AND NOT EXISTS (SELECT 1 FROM public.content_documents WHERE step_id = s.id)
  RETURNING id
)

, lausanne_documents AS (
  INSERT INTO public.content_documents (step_id, city_id, title, content, document_type, language, description)
  SELECT 
    s.id,
    s.city_id,
    'L''Art Brut selon Jean Dubuffet',
    'Concept créé par Jean Dubuffet en 1945, l''Art Brut rassemble des créations spontanées réalisées en dehors des conventions artistiques.',
    'historical_info',
    'fr',
    'Art marginal et création spontanée'
  FROM public.steps s
  WHERE s.name = 'Collection de l''Art Brut' AND s.city_id = (SELECT id FROM public.cities WHERE name = 'Lausanne')
  AND NOT EXISTS (SELECT 1 FROM public.content_documents WHERE step_id = s.id)
  RETURNING id
)

-- Create journey-step relationships with proper ordering
, carcassonne_journey_steps AS (
  INSERT INTO public.journey_steps (journey_id, step_id, step_order, custom_instructions)
  SELECT 
    j.id,
    s.id,
    ROW_NUMBER() OVER (PARTITION BY j.id ORDER BY 
      CASE s.name 
        WHEN 'Cité de Carcassonne' THEN 1
        WHEN 'Château Comtal' THEN 2  
        WHEN 'Basilique Saint-Nazaire' THEN 3
        WHEN 'Musée de l''Inquisition' THEN 4
        WHEN 'Lac de la Cavayère' THEN 1
        WHEN 'Canal du Midi' THEN 2
        WHEN 'Pont Vieux' THEN 3
        WHEN 'Marché de Carcassonne' THEN 1
        ELSE 99
      END
    ),
    CASE 
      WHEN j.name = 'Trésors de la Cité Médiévale' AND s.name = 'Cité de Carcassonne' THEN 'Commencez par l''entrée principale'
      WHEN j.name = 'Nature et Patrimoine' AND s.name = 'Lac de la Cavayère' THEN 'Détendez-vous dans ce cadre naturel'
      WHEN j.name = 'Saveurs Cathares' AND s.name = 'Marché de Carcassonne' THEN 'Découvrez les produits locaux'
      ELSE 'Explorez cette étape à votre rythme'
    END
  FROM public.journeys j
  JOIN public.cities c ON j.city_id = c.id
  JOIN public.steps s ON s.city_id = c.id
  WHERE c.name = 'Carcassonne' 
    AND j.name IN ('Trésors de la Cité Médiévale', 'Nature et Patrimoine', 'Saveurs Cathares')
    AND (
      (j.name = 'Trésors de la Cité Médiévale' AND s.name IN ('Cité de Carcassonne', 'Château Comtal', 'Basilique Saint-Nazaire', 'Musée de l''Inquisition')) OR
      (j.name = 'Nature et Patrimoine' AND s.name IN ('Lac de la Cavayère', 'Canal du Midi', 'Pont Vieux', 'Cité de Carcassonne')) OR
      (j.name = 'Saveurs Cathares' AND s.name IN ('Marché de Carcassonne', 'Cité de Carcassonne'))
    )
  RETURNING id
)

, narbonne_journey_steps AS (
  INSERT INTO public.journey_steps (journey_id, step_id, step_order, custom_instructions)
  SELECT 
    j.id,
    s.id,
    ROW_NUMBER() OVER (PARTITION BY j.id ORDER BY 
      CASE s.name 
        WHEN 'Via Domitia' THEN 1
        WHEN 'Musée Narbo Via' THEN 2
        WHEN 'Cathédrale Saint-Just-et-Saint-Pasteur' THEN 3
        WHEN 'Palais des Archevêques' THEN 4
        WHEN 'Canal de la Robine' THEN 1
        WHEN 'Réserve Naturelle Sainte-Lucie' THEN 2
        WHEN 'Abbaye de Fontfroide' THEN 3
        WHEN 'Halles de Narbonne' THEN 1
        ELSE 99
      END
    ),
    'Explorez cette étape remarquable'
  FROM public.journeys j
  JOIN public.cities c ON j.city_id = c.id
  JOIN public.steps s ON s.city_id = c.id
  WHERE c.name = 'Narbonne' 
    AND j.name IN ('Narbonne Antique', 'Entre Terre et Mer', 'Délices du Terroir')
    AND (
      (j.name = 'Narbonne Antique' AND s.name IN ('Via Domitia', 'Musée Narbo Via', 'Cathédrale Saint-Just-et-Saint-Pasteur', 'Palais des Archevêques')) OR
      (j.name = 'Entre Terre et Mer' AND s.name IN ('Canal de la Robine', 'Réserve Naturelle Sainte-Lucie', 'Abbaye de Fontfroide')) OR
      (j.name = 'Délices du Terroir' AND s.name IN ('Halles de Narbonne', 'Canal de la Robine'))
    )
  RETURNING id
)

-- Update quiz flags and journey metadata
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

-- Update journey metadata (total points and distance estimates)
, update_journey_metadata AS (
  UPDATE public.journeys 
  SET 
    total_points = (
      SELECT COALESCE(SUM(s.points_awarded), 0)
      FROM public.journey_steps js
      JOIN public.steps s ON js.step_id = s.id
      WHERE js.journey_id = journeys.id
    ),
    updated_at = now()
  WHERE city_id IN (
    SELECT id FROM public.cities 
    WHERE name IN ('Carcassonne', 'Narbonne')
  )
  RETURNING id
)

SELECT 'Content enrichment plan successfully implemented for all cities' as result;