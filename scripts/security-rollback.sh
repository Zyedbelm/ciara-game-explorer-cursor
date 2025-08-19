#!/bin/bash

# Script de rollback pour les corrections de sécurité
# Usage: ./scripts/security-rollback.sh

echo "🔄 ROLLBACK DES CORRECTIONS DE SÉCURITÉ"
echo "======================================"

# Vérifier si git est disponible
if ! command -v git &> /dev/null; then
    echo "❌ Git n'est pas installé. Rollback manuel requis."
    exit 1
fi

# Vérifier l'état du repository
if [ ! -d ".git" ]; then
    echo "❌ Pas de repository Git. Rollback manuel requis."
    exit 1
fi

echo "📋 État actuel du repository:"
git status --porcelain

echo ""
echo "🔍 Recherche du dernier commit avant les corrections de sécurité..."

# Chercher le dernier commit avant les corrections de sécurité
LAST_SECURE_COMMIT=$(git log --oneline --grep="SECURITY\|sécurité\|security" -n 1 --format="%H")

if [ -z "$LAST_SECURE_COMMIT" ]; then
    echo "⚠️  Aucun commit de sécurité trouvé. Rollback au commit précédent..."
    LAST_SECURE_COMMIT=$(git log --oneline -n 2 | tail -n 1 | cut -d' ' -f1)
fi

echo "📍 Commit de rollback: $LAST_SECURE_COMMIT"
echo "📝 Message: $(git log --oneline -n 1 $LAST_SECURE_COMMIT)"

echo ""
read -p "🤔 Voulez-vous procéder au rollback ? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Début du rollback..."
    
    # Sauvegarder l'état actuel
    echo "💾 Sauvegarde de l'état actuel..."
    git stash push -m "Sauvegarde avant rollback sécurité $(date)"
    
    # Rollback au commit précédent
    echo "⏪ Rollback au commit $LAST_SECURE_COMMIT..."
    git reset --hard $LAST_SECURE_COMMIT
    
    # Nettoyer les fichiers non trackés
    echo "🧹 Nettoyage des fichiers non trackés..."
    git clean -fd
    
    echo ""
    echo "✅ Rollback terminé avec succès!"
    echo ""
    echo "📋 Actions effectuées:"
    echo "  - Sauvegarde de l'état actuel dans stash"
    echo "  - Rollback au commit: $LAST_SECURE_COMMIT"
    echo "  - Nettoyage des fichiers non trackés"
    echo ""
    echo "🔄 Pour restaurer l'état précédent:"
    echo "  git stash pop"
    echo ""
    echo "📊 État actuel:"
    git status --porcelain
    
else
    echo "❌ Rollback annulé."
    exit 0
fi
