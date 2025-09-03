#!/bin/bash

# 🚀 SCRIPT DE REDÉPLOIEMENT COMPLET DES FONCTIONS EMAIL CIARA
# Ce script redéploie TOUTES les fonctions d'email pour restaurer le système

echo "🚀 RESTAURATION COMPLÈTE DU SYSTÈME EMAIL CIARA"
echo "================================================"
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -d "supabase" ]; then
    echo "❌ ERREUR : Ce script doit être exécuté depuis la racine du projet"
    echo "💡 Utilisez : cd /chemin/vers/ciara-game-explorer-main && ./deploy-all-email-functions.sh"
    exit 1
fi

# Aller dans le répertoire supabase
cd supabase

echo "📁 Répertoire actuel : $(pwd)"
echo ""

# Liste de toutes les fonctions d'email à redéployer
EMAIL_FUNCTIONS=(
    "auth-webhook"
    "send-email-confirmation"
    "send-welcome-ciara"
    "send-password-reset"
    "send-magic-link"
    "send-partner-offer-notification"
    "send-reward-notification"
    "send-reward-redemption"
    "send-partner-welcome"
    "send-new-rewards-notification"
    "send-journey-completion"
    "send-contact-form"
    "send-inactive-reminder"
    "send-inactive-reminder-automated"
    "send-package-inquiry"
    "send-security-alert"
)

echo "🔧 FONCTIONS À REDÉPLOYER (${#EMAIL_FUNCTIONS[@]} fonctions)"
echo "--------------------------------------------------------"

# Afficher la liste des fonctions
for func in "${EMAIL_FUNCTIONS[@]}"; do
    echo "  📧 $func"
done

echo ""
echo "⚠️  ATTENTION : Cette opération va redéployer TOUTES les fonctions d'email"
echo "   Temps estimé : 5-10 minutes"
echo ""

# Demander confirmation
read -p "🤔 Voulez-vous continuer ? (y/N) : " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Opération annulée"
    exit 0
fi

echo "🚀 DÉBUT DU REDÉPLOIEMENT..."
echo "=============================="
echo ""

# Compteur de succès/échecs
SUCCESS_COUNT=0
FAILED_COUNT=0
FAILED_FUNCTIONS=()

# Redéployer chaque fonction
for func in "${EMAIL_FUNCTIONS[@]}"; do
    echo "📦 Redéploiement de $func..."
    
    # Redéployer la fonction
    if supabase functions deploy "$func" --no-verify-jwt; then
        echo "✅ $func redéployé avec succès"
        ((SUCCESS_COUNT++))
    else
        echo "❌ Échec du redéploiement de $func"
        ((FAILED_COUNT++))
        FAILED_FUNCTIONS+=("$func")
    fi
    
    echo ""
done

# Résumé final
echo "🎯 RÉSUMÉ DU REDÉPLOIEMENT"
echo "============================"
echo "✅ Succès : $SUCCESS_COUNT/${#EMAIL_FUNCTIONS[@]}"
echo "❌ Échecs : $FAILED_COUNT/${#EMAIL_FUNCTIONS[@]}"

if [ $FAILED_COUNT -gt 0 ]; then
    echo ""
    echo "❌ FONCTIONS EN ÉCHEC :"
    for func in "${FAILED_FUNCTIONS[@]}"; do
        echo "   - $func"
    done
    
    echo ""
    echo "🔧 SOLUTIONS :"
    echo "   1. Vérifiez votre connexion internet"
    echo "   2. Vérifiez que Supabase est accessible"
    echo "   3. Vérifiez vos clés API"
    echo "   4. Redéployez manuellement les fonctions en échec"
else
    echo ""
    echo "🎉 TOUTES LES FONCTIONS ONT ÉTÉ REDÉPLOYÉES AVEC SUCCÈS !"
    echo ""
    echo "🔍 PROCHAINES ÉTAPES :"
    echo "   1. Vérifiez les variables d'environnement dans Supabase Dashboard"
    echo "   2. Testez les fonctions individuellement"
    echo "   3. Surveillez les logs en temps réel"
    echo "   4. Testez l'inscription d'un compte"
fi

echo ""
echo "📚 DOCUMENTATION :"
echo "   - RESTAURATION_EMAILS_COMPLETE.md : Guide complet"
echo "   - ACTION_IMMEDIATE_EMAILS.md : Actions immédiates"
echo "   - DIAGNOSTIC_EMAILS_RESEND.md : Diagnostic des problèmes"

echo ""
echo "🎯 OBJECTIF : Restaurer TOUT le système d'emails en moins de 1 heure !"

