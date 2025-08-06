#!/bin/bash

echo "🧹 Nettoyage complet du cache Vite..."

# Arrêter tous les processus Vite en cours
echo "📴 Arrêt des processus Vite..."
pkill -f "vite" 2>/dev/null || true

# Attendre que les processus se terminent
sleep 2

# Supprimer le cache Vite
echo "🗑️ Suppression du cache Vite..."
rm -rf node_modules/.vite 2>/dev/null || true

# Supprimer le dossier dist
echo "🗑️ Suppression du dossier dist..."
rm -rf dist 2>/dev/null || true

# Supprimer les fichiers de cache potentiels
echo "🗑️ Suppression des fichiers de cache..."
find . -name "*.tsbuildinfo" -delete 2>/dev/null || true

# Nettoyer le cache npm
echo "🗑️ Nettoyage du cache npm..."
npm cache clean --force 2>/dev/null || true

# Supprimer les fichiers temporaires
echo "🗑️ Suppression des fichiers temporaires..."
find . -name ".DS_Store" -delete 2>/dev/null || true
find . -name "*.log" -delete 2>/dev/null || true

# Vérifier les ports utilisés
echo "🔍 Vérification des ports..."
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
lsof -ti:8082 | xargs kill -9 2>/dev/null || true
lsof -ti:8083 | xargs kill -9 2>/dev/null || true
lsof -ti:8084 | xargs kill -9 2>/dev/null || true
lsof -ti:8085 | xargs kill -9 2>/dev/null || true
lsof -ti:8086 | xargs kill -9 2>/dev/null || true

echo "✅ Cache nettoyé avec succès !"
echo "🚀 Redémarrez le serveur avec: npm run dev"
echo "💡 Pour un démarrage forcé: npm run dev -- --force" 