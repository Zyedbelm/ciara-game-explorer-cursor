-- Corriger la fonction pour s'adapter à la structure existante de content_documents
DROP FUNCTION IF EXISTS create_standardized_content_for_city(TEXT);

CREATE OR REPLACE FUNCTION create_standardized_content_for_city(city_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  city_record RECORD;
  category_patrimoine UUID;
  category_gastronomie UUID;
  category_nature UUID;
  journey_patrimoine UUID;
  journey_gastronomie UUID;
  journey_nature UUID;
  step_count INTEGER := 0;
  quiz_count INTEGER := 0;
  doc_count INTEGER := 0;
BEGIN
  -- Récupérer les informations de la ville
  SELECT * INTO city_record FROM public.cities WHERE name = city_name;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ville % non trouvée', city_name;
  END IF;
  
  -- Récupérer les catégories existantes
  SELECT id INTO category_patrimoine 
  FROM public.journey_categories 
  WHERE city_id = city_record.id AND slug = 'patrimoine-culturel';
  
  SELECT id INTO category_gastronomie 
  FROM public.journey_categories 
  WHERE city_id = city_record.id AND slug = 'gastronomie-locale';
  
  SELECT id INTO category_nature 
  FROM public.journey_categories 
  WHERE city_id = city_record.id AND slug = 'randonnees-nature';
  
  -- Créer les 3 parcours standardisés
  INSERT INTO public.journeys (
    id, name, description, city_id, category_id, difficulty, 
    estimated_duration, is_predefined, is_active, language,
    name_en, name_de, description_en, description_de
  ) VALUES 
  (
    gen_random_uuid(),
    'Patrimoine & Histoire de ' || city_name,
    'Découvrez les trésors historiques et culturels de ' || city_name || ' à travers ses monuments emblématiques et ses quartiers chargés d''histoire.',
    city_record.id,
    category_patrimoine,
    'easy',
    120,
    true,
    true,
    'fr',
    'Heritage & History of ' || city_name,
    'Erbe & Geschichte von ' || city_name,
    'Discover the historical and cultural treasures of ' || city_name || ' through its emblematic monuments and historically rich districts.',
    'Entdecken Sie die historischen und kulturellen Schätze von ' || city_name || ' durch seine emblematischen Denkmäler und geschichtsträchtigen Viertel.'
  ),
  (
    gen_random_uuid(),
    'Gastronomie & Terroir de ' || city_name,
    'Savourez les spécialités locales et découvrez les traditions culinaires qui font la richesse gastronomique de ' || city_name || '.',
    city_record.id,
    category_gastronomie,
    'easy',
    90,
    true,
    true,
    'fr',
    'Gastronomy & Terroir of ' || city_name,
    'Gastronomie & Terroir von ' || city_name,
    'Savor local specialties and discover the culinary traditions that make the gastronomic richness of ' || city_name || '.',
    'Genießen Sie lokale Spezialitäten und entdecken Sie die kulinarischen Traditionen, die den gastronomischen Reichtum von ' || city_name || ' ausmachen.'
  ),
  (
    gen_random_uuid(),
    'Nature & Découverte de ' || city_name,
    'Explorez les espaces naturels et les panoramas exceptionnels qui entourent ' || city_name || ', entre nature préservée et points de vue remarquables.',
    city_record.id,
    category_nature,
    'medium',
    150,
    true,
    true,
    'fr',
    'Nature & Discovery of ' || city_name,
    'Natur & Entdeckung von ' || city_name,
    'Explore the natural spaces and exceptional panoramas surrounding ' || city_name || ', between preserved nature and remarkable viewpoints.',
    'Erkunden Sie die Naturräume und außergewöhnlichen Panoramen rund um ' || city_name || ', zwischen erhaltener Natur und bemerkenswerten Aussichtspunkten.'
  );
  
  -- Récupérer les IDs des parcours créés
  SELECT id INTO journey_patrimoine FROM public.journeys 
  WHERE city_id = city_record.id AND name = 'Patrimoine & Histoire de ' || city_name;
  
  SELECT id INTO journey_gastronomie FROM public.journeys 
  WHERE city_id = city_record.id AND name = 'Gastronomie & Terroir de ' || city_name;
  
  SELECT id INTO journey_nature FROM public.journeys 
  WHERE city_id = city_record.id AND name = 'Nature & Découverte de ' || city_name;
  
  -- Associer les étapes existantes aux parcours (répartition intelligente)
  INSERT INTO public.journey_steps (journey_id, step_id, step_order, custom_instructions)
  SELECT 
    CASE 
      WHEN s.type IN ('monument', 'museum', 'historical_site', 'church', 'castle') THEN journey_patrimoine
      WHEN s.type IN ('restaurant', 'market', 'winery', 'shop', 'cafe') THEN journey_gastronomie
      ELSE journey_nature
    END as journey_id,
    s.id as step_id,
    ROW_NUMBER() OVER (
      PARTITION BY CASE 
        WHEN s.type IN ('monument', 'museum', 'historical_site', 'church', 'castle') THEN journey_patrimoine
        WHEN s.type IN ('restaurant', 'market', 'winery', 'shop', 'cafe') THEN journey_gastronomie
        ELSE journey_nature
      END 
      ORDER BY s.created_at
    ) as step_order,
    CASE 
      WHEN s.type IN ('monument', 'museum', 'historical_site', 'church', 'castle') 
      THEN 'Prenez le temps d''admirer l''architecture et l''histoire de ce lieu emblématique.'
      WHEN s.type IN ('restaurant', 'market', 'winery', 'shop', 'cafe') 
      THEN 'Découvrez les saveurs locales et les traditions culinaires de la région.'
      ELSE 'Profitez de la beauté naturelle et des panoramas offerts par ce lieu.'
    END as custom_instructions
  FROM public.steps s
  WHERE s.city_id = city_record.id AND s.is_active = true;
  
  GET DIAGNOSTICS step_count = ROW_COUNT;
  
  -- Créer des documents pour chaque parcours (adapter à la structure existante)
  INSERT INTO public.content_documents (
    title, content, document_type, city_id, journey_id, language
  ) 
  SELECT 
    'Guide ' || j.name,
    'Ce guide vous accompagne dans votre découverte de ' || j.name || '. ' ||
    'Suivez les étapes proposées pour une expérience optimale et n''hésitez pas à ' ||
    'prendre votre temps pour apprécier chaque lieu visité.',
    'guide',
    city_record.id,
    j.id,
    'fr'
  FROM public.journeys j 
  WHERE j.city_id = city_record.id AND j.is_predefined = true;
  
  GET DIAGNOSTICS doc_count = ROW_COUNT;
  
  -- Mettre à jour les totaux de points des parcours
  UPDATE public.journeys 
  SET total_points = (
    SELECT COALESCE(SUM(s.points_awarded), 0)
    FROM public.journey_steps js
    JOIN public.steps s ON js.step_id = s.id
    WHERE js.journey_id = journeys.id
  )
  WHERE city_id = city_record.id;
  
  SELECT COUNT(*) INTO quiz_count 
  FROM public.quiz_questions qq
  JOIN public.steps s ON qq.step_id = s.id
  WHERE s.city_id = city_record.id;
  
  RETURN 'Contenu standardisé créé pour ' || city_name || ': ' ||
         '3 parcours, ' || step_count || ' associations étapes-parcours, ' ||
         quiz_count || ' quiz, ' || doc_count || ' documents.';
END;
$$;

-- Exécuter le plan pour toutes les villes
SELECT implement_revised_content_plan();