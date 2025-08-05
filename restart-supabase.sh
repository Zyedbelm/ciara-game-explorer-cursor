#!/bin/bash

echo "🔄 Redémarrage de Supabase..."

# Arrêter Supabase
echo "⏹️  Arrêt de Supabase..."
docker-compose down

# Attendre un peu
sleep 2

# Redémarrer Supabase
echo "▶️  Démarrage de Supabase..."
docker-compose up -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 10

# Vérifier que les services sont en cours d'exécution
echo "🔍 Vérification des services..."
docker ps | grep supabase

echo "✅ Supabase redémarré avec la nouvelle configuration"
echo "🌐 URL: http://localhost:54321"
echo "📧 Email testing: http://localhost:54324" 