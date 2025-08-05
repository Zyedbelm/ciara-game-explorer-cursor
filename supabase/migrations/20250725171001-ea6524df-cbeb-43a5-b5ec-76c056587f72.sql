-- Créer la foreign key manquante entre articles.author_id et profiles.user_id
ALTER TABLE public.articles 
ADD CONSTRAINT articles_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES public.profiles(user_id) ON DELETE SET NULL;

-- Créer une foreign key pour updated_by vers profiles
ALTER TABLE public.articles 
ADD CONSTRAINT articles_updated_by_fkey 
FOREIGN KEY (updated_by) REFERENCES public.profiles(user_id) ON DELETE SET NULL;

-- Créer une foreign key pour created_by vers profiles  
ALTER TABLE public.articles 
ADD CONSTRAINT articles_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES public.profiles(user_id) ON DELETE SET NULL;