-- Add quizzes and documents for the content enrichment plan
-- Part 2: Quizzes and documents for new and existing steps

-- Add quizzes for Carcassonne steps
WITH carcassonne_quizzes AS (
  INSERT INTO public.quiz_questions (step_id, question, question_type, correct_answer, options, explanation, points_awarded, bonus_points)
  SELECT 
    s.id,
    quiz_question,
    'multiple_choice',
    quiz_answer,
    quiz_options::jsonb,
    quiz_explanation,
    10,
    5
  FROM public.steps s,
  (VALUES
    ('Cité de Carcassonne', 'En quelle année la Cité de Carcassonne a-t-elle été inscrite au patrimoine mondial de l''UNESCO ?', '1997', '["1997", "1985", "2001", "1992"]', 'La Cité de Carcassonne a été inscrite en 1997 pour son exceptionnelle architecture médiévale.'),
    ('Cité de Carcassonne', 'Combien de tours possède l''enceinte extérieure de la Cité ?', '18', '["18", "24", "12", "30"]', 'L''enceinte extérieure compte 18 tours de défense.'),
    
    ('Château Comtal', 'À quelle époque le Château Comtal a-t-il été construit ?', '12ème siècle', '["12ème siècle", "10ème siècle", "14ème siècle", "16ème siècle"]', 'Le Château Comtal date du 12ème siècle et a été agrandi au fil des siècles.'),
    ('Château Comtal', 'Quel était le rôle principal du Château Comtal ?', 'Résidence des vicomtes', '["Résidence des vicomtes", "Prison", "Caserne militaire", "Entrepôt"]', 'Il servait de résidence aux vicomtes de Carcassonne.'),
    
    ('Basilique Saint-Nazaire', 'Quels sont les deux styles architecturaux présents dans la basilique ?', 'Roman et gothique', '["Roman et gothique", "Gothique et Renaissance", "Roman et baroque", "Gothique et classique"]', 'La basilique mélange harmonieusement les styles roman (nef) et gothique (chœur et transept).'),
    
    ('Canal du Midi', 'Qui est l''ingénieur concepteur du Canal du Midi ?', 'Pierre-Paul Riquet', '["Pierre-Paul Riquet", "Sébastien Le Prestre de Vauban", "André Le Nôtre", "Jules Hardouin-Mansart"]', 'Pierre-Paul Riquet a conçu et dirigé la construction de ce chef-d''œuvre d''ingénierie.'),
    
    ('Lac de la Cavayère', 'Quelle est la principale activité proposée au lac de la Cavayère ?', 'Baignade et détente', '["Baignade et détente", "Pêche sportive", "Navigation à voile", "Plongée sous-marine"]', 'C''est un lieu de baignade et de loisirs très apprécié l''été.')
  ) AS quizzes(step_name, quiz_question, quiz_answer, quiz_options, quiz_explanation)
  WHERE s.name = quizzes.step_name AND s.city_id = (SELECT id FROM public.cities WHERE name = 'Carcassonne')
  RETURNING id, step_id
)

-- Add quizzes for Narbonne steps
, narbonne_quizzes AS (
  INSERT INTO public.quiz_questions (step_id, question, question_type, correct_answer, options, explanation, points_awarded, bonus_points)
  SELECT 
    s.id,
    quiz_question,
    'multiple_choice',
    quiz_answer,
    quiz_options::jsonb,
    quiz_explanation,
    10,
    5
  FROM public.steps s,
  (VALUES
    ('Cathédrale Saint-Just-et-Saint-Pasteur', 'Pourquoi la cathédrale de Narbonne est-elle inachevée ?', 'Manque de financement', '["Manque de financement", "Guerre de Cent Ans", "Peste noire", "Conflits religieux"]', 'Les travaux ont été interrompus au 14ème siècle faute de moyens financiers.'),
    ('Cathédrale Saint-Just-et-Saint-Pasteur', 'Quelle est la hauteur du chœur de la cathédrale ?', '41 mètres', '["41 mètres", "35 mètres", "47 mètres", "52 mètres"]', 'Le chœur s''élève à 41 mètres, faisant de cette cathédrale l''une des plus hautes de France.'),
    
    ('Palais des Archevêques', 'Combien de tours composent le Palais des Archevêques ?', 'Trois tours', '["Trois tours", "Deux tours", "Quatre tours", "Cinq tours"]', 'Le palais comprend trois tours principales : Gilles Aycelin, Saint-Martial et Madeleine.'),
    
    ('Via Domitia', 'En quelle année la Via Domitia a-t-elle été construite ?', '118 av. J.-C.', '["118 av. J.-C.", "125 av. J.-C.", "110 av. J.-C.", "102 av. J.-C."]', 'Cette voie romaine stratégique a été construite en 118 avant J.-C. par Domitius Ahenobarbus.'),
    
    ('Musée Narbo Via', 'Quel était le nom antique de Narbonne ?', 'Narbo Martius', '["Narbo Martius", "Narbona", "Narbo Augusta", "Narbonensis"]', 'La ville s''appelait Narbo Martius, première colonie romaine hors d''Italie.'),
    
    ('Abbaye de Fontfroide', 'À quel ordre religieux appartient l''abbaye de Fontfroide ?', 'Cistercien', '["Cistercien", "Bénédictin", "Franciscain", "Dominicain"]', 'Fondée au 12ème siècle, c''est une abbaye de l''ordre cistercien.')
  ) AS quizzes(step_name, quiz_question, quiz_answer, quiz_options, quiz_explanation)
  WHERE s.name = quizzes.step_name AND s.city_id = (SELECT id FROM public.cities WHERE name = 'Narbonne')
  RETURNING id, step_id
)

-- Add quizzes for new Montreux steps
, montreux_quizzes AS (
  INSERT INTO public.quiz_questions (step_id, question, question_type, correct_answer, options, explanation, points_awarded, bonus_points)
  SELECT 
    s.id,
    quiz_question,
    'multiple_choice',
    quiz_answer,
    quiz_options::jsonb,
    quiz_explanation,
    10,
    5
  FROM public.steps s,
  (VALUES
    ('Terrasses de Lavaux', 'En quelle année les Terrasses de Lavaux ont-elles été classées UNESCO ?', '2007', '["2007", "2005", "2010", "2003"]', 'Ces vignobles exceptionnels ont été inscrits au patrimoine mondial en 2007.'),
    ('Terrasses de Lavaux', 'Sur combien de kilomètres s''étendent les terrasses ?', '30 kilomètres', '["30 kilomètres", "25 kilomètres", "40 kilomètres", "20 kilomètres"]', 'Les terrasses s''étendent sur environ 30 kilomètres le long du lac Léman.'),
    
    ('Rochers-de-Naye', 'À quelle altitude se trouvent les Rochers-de-Naye ?', '2042 mètres', '["2042 mètres", "1800 mètres", "2200 mètres", "1950 mètres"]', 'Le sommet culmine à 2042 mètres d''altitude.'),
    
    ('Gorges du Chaudron', 'Comment se sont formées les Gorges du Chaudron ?', 'Érosion glaciaire', '["Érosion glaciaire", "Activité volcanique", "Séisme", "Érosion marine"]', 'Ces gorges spectaculaires ont été creusées par l''érosion glaciaire.')
  ) AS quizzes(step_name, quiz_question, quiz_answer, quiz_options, quiz_explanation)
  WHERE s.name = quizzes.step_name AND s.city_id = (SELECT id FROM public.cities WHERE name = 'Montreux')
  RETURNING id, step_id
)

-- Add quiz for new Lausanne step
, lausanne_quizzes AS (
  INSERT INTO public.quiz_questions (step_id, question, question_type, correct_answer, options, explanation, points_awarded, bonus_points)
  SELECT 
    s.id,
    quiz_question,
    'multiple_choice',
    quiz_answer,
    quiz_options::jsonb,
    quiz_explanation,
    10,
    5
  FROM public.steps s,
  (VALUES
    ('Collection de l''Art Brut', 'Qui a fondé la Collection de l''Art Brut ?', 'Jean Dubuffet', '["Jean Dubuffet", "André Breton", "Pablo Picasso", "Marcel Duchamp"]', 'Jean Dubuffet a créé ce concept d''Art Brut et fondé cette collection unique.'),
    ('Collection de l''Art Brut', 'Que désigne le terme "Art Brut" ?', 'Art créé en dehors des normes culturelles', '["Art créé en dehors des normes culturelles", "Art non fini", "Art abstrait", "Art primitif"]', 'L''Art Brut désigne les créations artistiques réalisées en dehors des références culturelles dominantes.')
  ) AS quizzes(step_name, quiz_question, quiz_answer, quiz_options, quiz_explanation)
  WHERE s.name = quizzes.step_name AND s.city_id = (SELECT id FROM public.cities WHERE name = 'Lausanne')
  RETURNING id, step_id
)

SELECT 'Quizzes added successfully for all new steps' as result;