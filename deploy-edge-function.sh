#!/bin/bash

# Script pour déployer l'Edge Function generate-travel-journal
echo "🚀 Déploiement de l'Edge Function generate-travel-journal..."

# Vérifier si supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé"
    echo "📦 Installation de Supabase CLI..."
    
    # Installation pour macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install supabase/tap/supabase
    else
        echo "❌ Système non supporté. Installez Supabase CLI manuellement."
        exit 1
    fi
fi

# Vérifier si on est connecté à Supabase
if ! supabase status &> /dev/null; then
    echo "🔑 Connexion à Supabase..."
    supabase login
fi

# Déployer l'Edge Function
echo "📤 Déploiement de generate-travel-journal..."
supabase functions deploy generate-travel-journal --project-ref pohqkspsdvvbqrgzfayl

echo "✅ Déploiement terminé !"
echo "🌐 Test de l'Edge Function..."
curl -X POST https://pohqkspsdvvbqrgzfayl.supabase.co/functions/v1/generate-travel-journal \
  -H "Content-Type: application/json" \
  -d '{"test": true}' \
  -w "\nStatus: %{http_code}\n"
