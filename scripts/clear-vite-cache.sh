#!/bin/bash

echo "🧹 Nettoyage du cache Vite..."

# Arrêter tous les processus Vite en cours
echo "📴 Arrêt des processus Vite..."
pkill -f "vite" 2>/dev/null || true

# Supprimer le cache Vite
echo "🗑️ Suppression du cache Vite..."
rm -rf node_modules/.vite 2>/dev/null || true

# Supprimer le dossier dist
echo "🗑️ Suppression du dossier dist..."
rm -rf dist 2>/dev/null || true

# Supprimer les fichiers de cache potentiels
echo "🗑️ Suppression des fichiers de cache..."
find . -name "*.tsbuildinfo" -delete 2>/dev/null || true

echo "✅ Cache nettoyé avec succès !"
echo "🚀 Redémarrez le serveur avec: npm run dev" 