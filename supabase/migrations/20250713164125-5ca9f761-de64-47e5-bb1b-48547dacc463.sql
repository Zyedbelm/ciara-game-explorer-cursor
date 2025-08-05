-- Ajout des questions de quiz pour compléter les données de test

INSERT INTO public.quiz_questions (step_id, question, correct_answer, options, explanation, points_awarded, bonus_points, question_type) VALUES

-- Quiz pour Cathédrale Notre-Dame (Lausanne)
((SELECT id FROM steps WHERE name = 'Cathédrale Notre-Dame'), 
'En quelle année la construction de la cathédrale Notre-Dame de Lausanne a-t-elle commencé ?', 
'1170', 
'["1170", "1250", "1150", "1200"]', 
'La construction de la cathédrale Notre-Dame de Lausanne a commencé en 1170 et s''est achevée au 13e siècle.', 
15, 5, 'multiple_choice'),

-- Quiz pour Musée Olympique (Lausanne)
((SELECT id FROM steps WHERE name = 'Musée Olympique'), 
'Qui a fondé les Jeux Olympiques modernes ?', 
'Pierre de Coubertin', 
'["Pierre de Coubertin", "Jacques Rogge", "Thomas Bach", "Juan Antonio Samaranch"]', 
'Pierre de Coubertin a fondé le Comité International Olympique en 1894 et relancé les Jeux Olympiques modernes.', 
20, 5, 'multiple_choice'),

-- Quiz pour Jet d''eau (Genève)
((SELECT id FROM steps WHERE name = 'Jet d''eau'), 
'À quelle hauteur peut atteindre le Jet d''eau de Genève ?', 
'140 mètres', 
'["140 mètres", "100 mètres", "200 mètres", "85 mètres"]', 
'Le Jet d''eau de Genève peut projeter l''eau jusqu''à 140 mètres de hauteur à une vitesse de 200 km/h.', 
15, 5, 'multiple_choice'),

-- Quiz pour Palais des Nations (Genève)
((SELECT id FROM steps WHERE name = 'Palais des Nations'), 
'Combien de pays sont membres de l''ONU actuellement ?', 
'193', 
'["193", "195", "189", "201"]', 
'L''Organisation des Nations Unies compte 193 États membres depuis l''adhésion du Soudan du Sud en 2011.', 
25, 5, 'multiple_choice'),

-- Quiz pour Grossmünster (Zurich)
((SELECT id FROM steps WHERE name = 'Grossmünster'), 
'Quel réformateur célèbre a prêché dans le Grossmünster ?', 
'Huldrych Zwingli', 
'["Huldrych Zwingli", "Jean Calvin", "Martin Luther", "Guillaume Farel"]', 
'Huldrych Zwingli a été le pasteur du Grossmünster et a lancé la Réforme protestante à Zurich dès 1519.', 
15, 5, 'multiple_choice'),

-- Quiz pour Bahnhofstrasse (Zurich)
((SELECT id FROM steps WHERE name = 'Bahnhofstrasse'), 
'La Bahnhofstrasse de Zurich est considérée comme l''une des rues commerçantes les plus chères du monde. Vrai ou faux ?', 
'Vrai', 
'["Vrai", "Faux"]', 
'La Bahnhofstrasse est effectivement l''une des rues commerçantes les plus chères au monde, avec des loyers parmi les plus élevés.', 
10, 5, 'true_false');