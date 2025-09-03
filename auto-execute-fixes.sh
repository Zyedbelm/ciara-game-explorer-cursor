#!/bin/bash

# 🚀 SCRIPT AUTOMATIQUE D'EXÉCUTION DES CORRECTIONS SUPABASE
# Ce script exécute automatiquement les corrections SQL via la CLI Supabase

echo "🚀 CORRECTION AUTOMATIQUE DE LA TABLE PROFILES VIA CLI SUPABASE"
echo "================================================================"
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -d "supabase" ]; then
    echo "❌ ERREUR : Ce script doit être exécuté depuis la racine du projet"
    echo "💡 Utilisez : cd /chemin/vers/ciara-game-explorer-main && ./auto-execute-fixes.sh"
    exit 1
fi

# Aller dans le répertoire supabase
cd supabase

echo "📁 Répertoire actuel : $(pwd)"
echo ""

# Vérifier que Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ ERREUR : Supabase CLI n'est pas installé"
    echo "💡 Installez-le avec : npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI détecté"
echo ""

# Vérifier le statut du projet
echo "🔍 Vérification du statut du projet..."
if ! supabase status &> /dev/null; then
    echo "❌ ERREUR : Impossible de se connecter au projet Supabase"
    echo "💡 Vérifiez votre connexion et vos clés API"
    exit 1
fi

echo "✅ Connexion au projet Supabase réussie"
echo ""

# Créer le script SQL temporaire
echo "📝 Création du script SQL de correction..."
cat > temp-fix-profiles.sql << 'EOF'
-- 🚀 CORRECTION AUTOMATIQUE DE LA TABLE PROFILES
-- Ce script corrige automatiquement la table profiles

DO $$
DECLARE
    col_exists BOOLEAN;
    added_cols TEXT[] := ARRAY[]::TEXT[];
BEGIN
    RAISE NOTICE '🔍 DIAGNOSTIC DE LA TABLE PROFILES...';
    
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

-- Vérification finale
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
EOF

echo "✅ Script SQL temporaire créé"
echo ""

# Exécuter le script SQL via la CLI
echo "🚀 Exécution du script de correction..."
echo "⚠️  Cette opération va modifier la structure de votre base de données"
echo ""

read -p "🤔 Voulez-vous continuer ? (y/N) : " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Opération annulée"
    rm -f temp-fix-profiles.sql
    exit 0
fi

echo "🔧 Exécution des corrections SQL..."
echo ""

# Exécuter le script SQL
if supabase db reset --db-url "$(supabase status --output json | jq -r '.db_url')" < temp-fix-profiles.sql; then
    echo "✅ Script SQL exécuté avec succès"
else
    echo "❌ Erreur lors de l'exécution du script SQL"
    echo "💡 Essayez d'exécuter manuellement le script dans Supabase Dashboard"
fi

# Nettoyer le fichier temporaire
rm -f temp-fix-profiles.sql

echo ""
echo "🎯 PROCHAINES ÉTAPES:"
echo "1. Vérifiez les logs du webhook auth-webhook"
echo "2. Testez l'inscription d'un compte sur https://ciara.city/auth"
echo "3. Surveillez la réception des emails"
echo ""
echo "🎉 CORRECTION TERMINÉE !"

