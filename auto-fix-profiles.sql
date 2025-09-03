-- 🚀 CORRECTION AUTOMATIQUE DE LA TABLE PROFILES
-- Ce script corrige automatiquement la table profiles en fonction de ce qui existe déjà
-- Exécuter ce script dans Supabase Dashboard → SQL Editor

-- 1. DIAGNOSTIC : Vérifier la structure actuelle
DO $$
DECLARE
    col_exists BOOLEAN;
    missing_cols TEXT[] := ARRAY['first_name', 'last_name', 'role', 'total_points', 'created_at', 'updated_at'];
    col_name TEXT;
    added_cols TEXT[] := ARRAY[]::TEXT[];
BEGIN
    RAISE NOTICE '🔍 DIAGNOSTIC DE LA TABLE PROFILES...';
    
    -- Vérifier chaque colonne requise
    FOREACH col_name IN ARRAY missing_cols
    LOOP
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' 
            AND table_schema = 'public' 
            AND column_name = col_name
        ) INTO col_exists;
        
        IF NOT col_exists THEN
            RAISE NOTICE '❌ Colonne manquante: %', col_name;
        ELSE
            RAISE NOTICE '✅ Colonne existante: %', col_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE ' ';
    RAISE NOTICE '🔧 CORRECTION AUTOMATIQUE EN COURS...';
    
    -- Ajouter first_name si elle n'existe pas
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public' 
        AND column_name = 'first_name'
    ) INTO col_exists;
    
    IF NOT col_exists THEN
        ALTER TABLE profiles ADD COLUMN first_name TEXT;
        RAISE NOTICE '✅ Colonne first_name ajoutée';
        added_cols := array_append(added_cols, 'first_name');
    ELSE
        RAISE NOTICE 'ℹ️ Colonne first_name existe déjà';
    END IF;

    -- Ajouter last_name si elle n'existe pas
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public' 
        AND column_name = 'last_name'
    ) INTO col_exists;
    
    IF NOT col_exists THEN
        ALTER TABLE profiles ADD COLUMN last_name TEXT;
        RAISE NOTICE '✅ Colonne last_name ajoutée';
        added_cols := array_append(added_cols, 'last_name');
    ELSE
        RAISE NOTICE 'ℹ️ Colonne last_name existe déjà';
    END IF;

    -- Ajouter role si elle n'existe pas
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public' 
        AND column_name = 'role'
    ) INTO col_exists;
    
    IF NOT col_exists THEN
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'visitor';
        RAISE NOTICE '✅ Colonne role ajoutée avec valeur par défaut visitor';
        added_cols := array_append(added_cols, 'role');
    ELSE
        RAISE NOTICE 'ℹ️ Colonne role existe déjà';
    END IF;

    -- Ajouter total_points si elle n'existe pas
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public' 
        AND column_name = 'total_points'
    ) INTO col_exists;
    
    IF NOT col_exists THEN
        ALTER TABLE profiles ADD COLUMN total_points INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Colonne total_points ajoutée avec valeur par défaut 0';
        added_cols := array_append(added_cols, 'total_points');
    ELSE
        RAISE NOTICE 'ℹ️ Colonne total_points existe déjà';
    END IF;

    -- Ajouter created_at si elle n'existe pas
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public' 
        AND column_name = 'created_at'
    ) INTO col_exists;
    
    IF NOT col_exists THEN
        ALTER TABLE profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE '✅ Colonne created_at ajoutée avec valeur par défaut NOW()';
        added_cols := array_append(added_cols, 'created_at');
    ELSE
        RAISE NOTICE 'ℹ️ Colonne created_at existe déjà';
    END IF;

    -- Ajouter updated_at si elle n'existe pas
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public' 
        AND column_name = 'updated_at'
    ) INTO col_exists;
    
    IF NOT col_exists THEN
        ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE '✅ Colonne updated_at ajoutée avec valeur par défaut NOW()';
        added_cols := array_append(added_cols, 'updated_at');
    ELSE
        RAISE NOTICE 'ℹ️ Colonne updated_at existe déjà';
    END IF;

    -- Résumé des corrections
    RAISE NOTICE ' ';
    RAISE NOTICE '🎯 RÉSUMÉ DES CORRECTIONS:';
    IF array_length(added_cols, 1) > 0 THEN
        RAISE NOTICE '✅ Colonnes ajoutées: %', array_to_string(added_cols, ', ');
    ELSE
        RAISE NOTICE '✅ Aucune correction nécessaire - toutes les colonnes existent déjà';
    END IF;
    
END $$;

-- 2. VÉRIFICATION FINALE : Structure corrigée
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. VÉRIFICATION : Contraintes et index
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'profiles' 
AND table_schema = 'public';

-- 4. VÉRIFICATION : RLS (Row Level Security)
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 5. MESSAGE DE SUCCÈS
DO $$
BEGIN
    RAISE NOTICE ' ';
    RAISE NOTICE '🎉 CORRECTION TERMINÉE AVEC SUCCÈS !';
    RAISE NOTICE 'La table profiles est maintenant correctement configurée.';
    RAISE NOTICE 'Vous pouvez maintenant tester le système d''emails.';
END $$;

