-- Ajouter du contenu documentaire réaliste pour chaque étape pour alimenter le chat IA

-- D'abord, vérifier si la table content_documents existe, sinon la créer
CREATE TABLE IF NOT EXISTS public.content_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  step_id UUID REFERENCES public.steps(id) ON DELETE CASCADE,
  city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  document_type TEXT DEFAULT 'historical_info', -- historical_info, practical_info, cultural_info, architectural_info
  language TEXT DEFAULT 'fr',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Supprimer le contenu existant pour éviter les doublons
DELETE FROM public.content_documents WHERE step_id IS NOT NULL;

-- Ajouter du contenu documentaire pour chaque étape
INSERT INTO public.content_documents (step_id, title, content, document_type, language)
SELECT 
  s.id,
  CASE 
    WHEN s.name ILIKE '%cathédrale%' OR s.name ILIKE '%notre-dame%' THEN 'Histoire de la Cathédrale Notre-Dame de Lausanne'
    WHEN s.name ILIKE '%château%' OR s.name ILIKE '%saint-maire%' THEN 'Le Château Saint-Maire : Siège du Gouvernement Vaudois'
    WHEN s.name ILIKE '%olympique%' OR s.name ILIKE '%musée%' THEN 'Lausanne, Capitale Olympique Mondiale'
    WHEN s.name ILIKE '%ouchy%' OR s.name ILIKE '%port%' THEN 'Le Port d''Ouchy et ses Traditions Lacustres'
    WHEN s.name ILIKE '%palais%' OR s.name ILIKE '%rumine%' THEN 'Le Palais de Rumine : Temple de la Culture'
    WHEN s.name ILIKE '%place%' OR s.name ILIKE '%palud%' THEN 'La Place de la Palud : Cœur Historique de Lausanne'
    WHEN s.name ILIKE '%escaliers%' OR s.name ILIKE '%marché%' THEN 'Les Escaliers du Marché : Lien Entre Deux Mondes'
    WHEN s.name ILIKE '%sauvabelin%' OR s.name ILIKE '%tour%' THEN 'La Forêt de Sauvabelin : Poumon Vert de Lausanne'
    ELSE CONCAT('Découverte de ', s.name)
  END as title,
  CASE 
    WHEN s.name ILIKE '%cathédrale%' OR s.name ILIKE '%notre-dame%' THEN 
      'La Cathédrale Notre-Dame de Lausanne est l''un des plus beaux monuments gothiques de Suisse. Construite entre 1170 et 1275, elle fut consacrée par le pape Grégoire X en présence de l''empereur Rodolphe de Habsbourg. 

      ARCHITECTURE : La cathédrale présente un style gothique français adapté aux traditions locales. Sa façade occidentale est ornée d''un magnifique portail peint, rare exemple de polychromie médiévale conservée. La rose sud, datant du 13e siècle, est considérée comme l''une des plus belles d''Europe.

      HISTOIRE : Édifiée sur les ruines d''une église carolingienne, la cathédrale a traversé les siècles en conservant sa splendeur. Elle a survécu à la Réforme protestante de 1536, perdant alors ses autels et ses statues, mais gardant son architecture intacte.

      PARTICULARITÉS : Chaque nuit depuis plus de 600 ans, un guet annonce les heures du haut de la tour de 72 mètres. Cette tradition unique en Europe fait de Lausanne la dernière ville au monde à maintenir cette coutume médiévale.

      VISITE : L''intérieur révèle des voûtes élancées, des chapelles latérales richement décorées et un orgue exceptionnel. Ne manquez pas la crypte qui abrite les vestiges de l''église primitive et des sarcophages mérovingiens.'
    
    WHEN s.name ILIKE '%château%' OR s.name ILIKE '%saint-maire%' THEN 
      'Le Château Saint-Maire, imposante forteresse dominant Lausanne, est le siège du gouvernement vaudois depuis 1803. Cette demeure historique raconte huit siècles d''histoire suisse.

      CONSTRUCTION : Édifié entre 1397 et 1427 par les évêques de Lausanne, le château servait de résidence épiscopale et de forteresse défensive. Son architecture mélange les styles gothique tardif et Renaissance naissante.

      ARCHITECTURE : Le château se distingue par ses quatre tours rondes, sa cour d''honneur pavée et ses façades en molasse du Jura. Les fenêtres à meneaux et les toitures en tuiles vernissées témoignent du raffinement de l''époque.

      HISTOIRE POLITIQUE : Après la Réforme, le château devient résidence des baillis bernois (1536-1798), puis préfecture française sous Napoléon. Depuis 1803, il abrite le Conseil d''État vaudois, faisant de lui l''un des plus anciens sièges gouvernementaux en activité.

      JARDINS : Les jardins en terrasses offrent une vue panoramique sur le lac Léman et les Alpes. Aménagés au 19e siècle, ils constituent un écrin de verdure au cœur de la ville.

      ANECDOTES : Le château possède une cave voûtée du 14e siècle qui servait de prison. Aujourd''hui, elle accueille les réceptions officielles du gouvernement vaudois.'
    
    WHEN s.name ILIKE '%olympique%' OR s.name ILIKE '%musée%' THEN 
      'Lausanne est la Capitale Olympique mondiale depuis 1915, date de l''installation du Comité International Olympique (CIO) dans la ville. Le Musée Olympique, inauguré en 1993, est le plus grand centre d''information au monde sur les Jeux Olympiques.

      HISTOIRE DU CIO : Pierre de Coubertin choisit Lausanne en 1915 pour sa neutralité et sa position centrale en Europe. La ville devient ainsi le siège permanent du mouvement olympique moderne.

      LE MUSÉE : Conçu par l''architecte Pedro Ramirez Vazquez, le bâtiment s''intègre harmonieusement dans le parc d''Ouchy. Ses trois niveaux retracent l''histoire olympique de l''Antiquité à nos jours.

      COLLECTIONS : Plus de 10 000 objets, 500 000 images et documents, des torches olympiques, des médailles, des équipements sportifs et des œuvres d''art composent cette collection unique.

      PARC OLYMPIQUE : Le parc de 8 hectares abrite 40 sculptures d''artistes contemporains. La Flamme Olympique y brûle en permanence, symbole de l''idéal olympique.

      INNOVATION : Le musée propose des expériences immersives avec simulateurs sportifs, réalité virtuelle et installations interactives pour vivre l''émotion olympique.

      IMPACT : Lausanne accueille plus de 50 fédérations sportives internationales, confirmant son statut de capitale mondiale du sport.'
    
    WHEN s.name ILIKE '%ouchy%' OR s.name ILIKE '%port%' THEN 
      'Le port d''Ouchy, ancien village de pêcheurs devenu quartier chic de Lausanne, est le point de départ des plus belles excursions sur le lac Léman. Ce lieu chargé d''histoire allie tradition maritime et modernité.

      HISTOIRE MARITIME : Dès le Moyen Âge, Ouchy était le port naturel de Lausanne. Les bateaux à voile latine transportaient marchandises et voyageurs entre les rives suisse et française du lac.

      ARCHITECTURE : Le château d''Ouchy (12e siècle) témoigne du passé médiéval. Transformé en hôtel de luxe, il a accueilli de nombreuses personnalités, dont Lord Byron qui y séjourna en 1816.

      NAVIGATION : La Compagnie Générale de Navigation (CGN) perpétue la tradition avec ses bateaux Belle Époque. Huit vapeurs historiques, dont le "Montreux" (1904), naviguent encore sur le lac.

      GASTRONOMIE : Les restaurants du port proposent les spécialités lacustres : perches du lac, féra fumée, filets de bondelle. La tradition viticole se découvre dans les caves d''Ouchy.

      PROMENADES : Le quai d''Ouchy s''étend sur 2 km, bordé de platanes centenaires. C''est le point de départ du sentier viticole de Lavaux, inscrit au patrimoine mondial UNESCO.

      ÉVÉNEMENTS : Ouchy accueille de nombreux festivals : Fête de la Tulipe au printemps, Festival de la Cité en été, et les marchés de Noël en hiver.'
    
    WHEN s.name ILIKE '%palais%' OR s.name ILIKE '%rumine%' THEN 
      'Le Palais de Rumine, joyau architectural néo-Renaissance, abrite depuis 1906 les plus importantes collections culturelles et scientifiques du canton de Vaud. Ce temple de la connaissance est l''œuvre de l''architecte Gaspard André.

      ARCHITECTURE : Inspiré de la Renaissance florentine, le palais présente une façade majestueuse en pierre de taille. Sa coupole centrale, haute de 50 mètres, domine la place de la Riponne et symbolise l''élévation de l''esprit.

      HISTOIRE : Construit grâce au legs de Gabriel de Rumine (1841-1871), riche mécène d''origine russe, le palais devait rassembler "tout ce qui peut contribuer à l''instruction publique".

      LES MUSÉES : Cinq institutions cohabitent harmonieusement :
      - Musée cantonal d''archéologie et d''histoire
      - Musée cantonal de géologie  
      - Musée cantonal de zoologie
      - Cabinet des médailles
      - Espace Arlaud (expositions temporaires)

      COLLECTIONS REMARQUABLES : Momies égyptiennes, fossiles jurassiques, minéraux alpins, monnaies antiques, faune régionale... Plus de 3 millions d''objets racontent l''histoire naturelle et humaine de la région.

      BIBLIOTHÈQUE : La Bibliothèque cantonale et universitaire, avec ses 2 millions de documents, occupe une partie du palais. Sa salle de lecture néo-Renaissance est l''une des plus belles de Suisse.

      CURIOSITÉS : Le palais cache des trésors : un planétarium, des laboratoires de recherche, et dans les sous-sols, d''anciennes caves voûtées transformées en réserves.'
    
    WHEN s.name ILIKE '%place%' OR s.name ILIKE '%palud%' THEN 
      'La Place de la Palud est le cœur battant de Lausanne depuis le Moyen Âge. Cette place pittoresque, avec ses arcades colorées et sa fontaine historique, incarne l''âme de la vieille ville.

      ORIGINE : Le nom "Palud" vient du latin "palus" (marais), car la place était autrefois un terrain marécageux. Asséchée au 13e siècle, elle devient rapidement le centre commercial de la ville.

      ARCHITECTURE : Les maisons à arcades, construites entre le 15e et 18e siècle, présentent des façades colorées typiques de l''architecture urbaine suisse. Chaque bâtiment raconte une histoire différente.

      LA FONTAINE DE LA JUSTICE : Érigée en 1557, cette fontaine Renaissance est l''œuvre du sculpteur Laurent Perroud. La statue de la Justice, tenant balance et épée, symbolise l''équité qui doit régner sur le commerce.

      HÔTEL DE VILLE : Construit en 1674, l''Hôtel de Ville abrite encore aujourd''hui les autorités communales. Sa façade baroque et son escalier d''honneur témoignent de la prospérité passée.

      MARCHÉS : Depuis 700 ans, la place accueille les marchés. Le mercredi et samedi, producteurs locaux proposent fruits, légumes, fromages et spécialités vaudoises dans une ambiance authentique.

      HORLOGE ASTRONOMIQUE : L''horloge de l''Hôtel de Ville, installée en 1902, indique non seulement l''heure mais aussi les phases lunaires et les signes du zodiaque.

      TRADITIONS : Chaque année, la Fête de la Tulipe transforme la place en jardin coloré, perpétuant une tradition qui remonte au 18e siècle.'
    
    WHEN s.name ILIKE '%escaliers%' OR s.name ILIKE '%marché%' THEN 
      'Les Escaliers du Marché, appelés aussi "Escaliers de la Mercerie", constituent l''un des passages les plus emblématiques de Lausanne. Ces 150 marches en pierre relient la ville basse à la ville haute depuis le Moyen Âge.

      HISTOIRE : Construits au 13e siècle, ces escaliers suivent le tracé d''un ancien sentier muletier. Ils permettaient aux marchands de transporter leurs marchandises du port d''Ouchy vers les marchés de la ville haute.

      ARCHITECTURE : Les escaliers sont bordés de maisons médiévales et Renaissance parfaitement conservées. Les façades colorées, les enseignes en fer forgé et les petites boutiques créent une atmosphère unique.

      LA MERCERIE : Historiquement, cette rue abritait les merciers, marchands de tissus et d''articles de mode. Aujourd''hui encore, on y trouve des commerces traditionnels : librairies, antiquaires, artisans.

      PARTICULARITÉS : Chaque palier offre une perspective différente sur la ville. Les niches murales abritaient autrefois des statues de saints protecteurs des voyageurs.

      LÉGENDES : Selon la tradition, celui qui monte les escaliers sans s''arrêter verra son vœu exaucé. Les amoureux y gravent leurs initiales sur les pierres usées par le temps.

      CINÉMA : Ces escaliers ont servi de décor à plusieurs films, notamment "L''Inconnu de Strasbourg" avec Jean-Paul Belmondo.

      CONSEILS : La montée peut être sportive ! Prenez votre temps pour admirer les détails architecturaux et les vues sur le lac qui se dévoilent progressivement.'
    
    WHEN s.name ILIKE '%sauvabelin%' OR s.name ILIKE '%tour%' THEN 
      'La Forêt de Sauvabelin est le poumon vert de Lausanne, un espace naturel de 200 hectares qui offre détente et découvertes à deux pas du centre-ville. Sa tour d''observation de 35 mètres est devenue l''un des symboles de la capitale vaudoise.

      HISTOIRE NATURELLE : Cette forêt mixte, composée de hêtres, chênes, érables et résineux, existe depuis des millénaires. Elle a été préservée grâce à la volonté des autorités lausannoises dès le 19e siècle.

      LA TOUR : Inaugurée en 2003, la Tour de Sauvabelin est une prouesse architecturale en bois local. Sa structure hélicoïdale de 35 mètres offre une vue panoramique à 360° sur Lausanne, le lac Léman et les Alpes.

      FAUNE ET FLORE : La forêt abrite une biodiversité remarquable : 80 espèces d''oiseaux, écureuils, renards, chevreuils. Au printemps, les sous-bois se parent d''anémones, primevères et ail des ours.

      SENTIERS : 15 km de sentiers balisés permettent de découvrir tous les aspects de la forêt. Le parcours Vita, créé en 1968, fut l''un des premiers de Suisse.

      LE LAC : Le petit lac artificiel, créé en 1888, accueille cygnes, canards et hérons. C''est un lieu de promenade familial très apprécié, avec aire de jeux et restaurant.

      ACTIVITÉS : La forêt propose de nombreuses activités : course à pied, VTT, pique-nique, observation ornithologique. En hiver, les sentiers se transforment en pistes de ski de fond.

      ACCÈS : Accessible en métro (ligne M2, arrêt Sauvabelin) ou à pied depuis le centre-ville (30 minutes de marche), la forêt est un exemple réussi d''intégration urbaine de la nature.'
    
    ELSE CONCAT('Cette étape de votre parcours vous permet de découvrir ', s.name, ', un lieu emblématique qui mérite votre attention. Prenez le temps d''observer les détails architecturaux, l''ambiance du quartier et l''histoire qui se dégage de chaque pierre.')
  END as content,
  'historical_info' as document_type,
  'fr' as language
FROM public.steps s;

-- Ajouter du contenu pratique pour chaque étape
INSERT INTO public.content_documents (step_id, title, content, document_type, language)
SELECT 
  s.id,
  CONCAT('Informations pratiques - ', s.name),
  CASE 
    WHEN s.name ILIKE '%cathédrale%' OR s.name ILIKE '%notre-dame%' THEN 
      'HORAIRES : Ouvert tous les jours de 9h à 19h (17h30 en hiver). Entrée gratuite.
      VISITE GUIDÉE : Tous les jours à 14h30 (français) et 15h30 (anglais). Durée : 45 minutes.
      MONTÉE À LA TOUR : Possible d''avril à octobre, 232 marches, vue panoramique exceptionnelle.
      CONCERTS : Récitals d''orgue le dimanche à 17h. Festival international d''orgue en été.
      ACCÈS : Métro M2 arrêt "Riponne-Maurice Béjart", puis 5 minutes à pied.
      SERVICES : Toilettes, boutique de souvenirs, audioguides disponibles.
      À SAVOIR : Tenue correcte exigée. Photos autorisées sans flash.'
    
    WHEN s.name ILIKE '%château%' OR s.name ILIKE '%saint-maire%' THEN 
      'VISITE : Visites guidées uniquement, sur réservation au 021 316 40 30.
      HORAIRES : Mardi et jeudi à 10h et 14h (français), mercredi à 14h (anglais).
      TARIFS : Adultes 8 CHF, étudiants/AVS 5 CHF, enfants gratuit.
      JARDINS : Accès libre tous les jours de 8h à 18h.
      ÉVÉNEMENTS : Journées du patrimoine en septembre, portes ouvertes.
      ACCÈS : Métro M2 arrêt "Riponne-Maurice Béjart", puis 10 minutes à pied.
      PARKING : Places limitées, préférer les transports publics.
      RESTAURANT : Café du Château ouvert en semaine de 8h à 17h.'
    
    WHEN s.name ILIKE '%olympique%' OR s.name ILIKE '%musée%' THEN 
      'HORAIRES : Mardi-dimanche 9h-18h (fermé lundi sauf fériés).
      TARIFS : Adultes 18 CHF, étudiants 12 CHF, enfants 10 CHF, famille 36 CHF.
      VISITE : Comptez 2-3 heures. Audioguides inclus (8 langues).
      ACTIVITÉS : Simulateurs sportifs, expériences VR, ateliers enfants.
      RESTAURANT : TOM Café avec terrasse vue lac, cuisine méditerranéenne.
      ACCÈS : Métro M2 arrêt "Ouchy-Olympique", sortie directe.
      PARKING : 200 places payantes, gratuit avec Swiss Museum Pass.
      BOUTIQUE : Souvenirs olympiques, équipements sportifs, livres.'
    
    ELSE 
      'ACCÈS : Facilement accessible à pied ou en transports publics.
      HORAIRES : Accessible en permanence (extérieur).
      SERVICES : Toilettes publiques à proximité.
      RESTAURANTS : Plusieurs établissements dans les environs.
      PHOTOS : Autorisées, idéal pour Instagram !
      DURÉE : Comptez 15-30 minutes pour bien profiter du lieu.
      CONSEIL : Meilleure lumière en fin d''après-midi pour les photos.'
  END as content,
  'practical_info' as document_type,
  'fr' as language
FROM public.steps s;

-- Créer les index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_content_documents_step_id ON public.content_documents(step_id);
CREATE INDEX IF NOT EXISTS idx_content_documents_type ON public.content_documents(document_type);

-- Activer RLS si pas déjà fait
ALTER TABLE public.content_documents ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture à tous
CREATE POLICY IF NOT EXISTS "Content documents are viewable by everyone" 
ON public.content_documents FOR SELECT USING (true);