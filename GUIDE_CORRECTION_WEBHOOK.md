# 🔧 GUIDE COMPLET - CORRECTION WEBHOOK BIENVENUE

## 🚨 PROBLÈME IDENTIFIÉ
Les nouveaux utilisateurs ne reçoivent plus :
- ❌ Email de bienvenue 
- ❌ 10 points offerts

**Cause :** Le webhook d'authentification n'est pas configuré dans le Dashboard Supabase

## 🎯 SOLUTION COMPLÈTE

### ÉTAPE 1: Récupérer la clé Service Role
1. Va sur : https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/settings/api
2. Copie la clé **"service_role"** (section Project API keys)
3. Remplace dans le fichier `.env` :
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=ta_vraie_clé_service_role_ici
   ```

### ÉTAPE 2: Exécuter le script de diagnostic
```bash
node fix-webhook-direct.mjs
```

### ÉTAPE 3: Configurer le webhook dans Dashboard Supabase

1. **Aller sur :** https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/auth/webhooks

2. **Cliquer sur "Add Webhook"**

3. **Configuration :**
   ```
   Name: auth-webhook-ciara
   URL: https://pohqkspsdvvbqrgzfayl.supabase.co/functions/v1/auth-webhook
   Method: POST
   Events: ✅ user.created, ✅ user.updated
   Headers: Content-Type: application/json
   Status: ✅ Enabled
   ```

### ÉTAPE 4: Nettoyer l'ancien système (optionnel)

Dans Supabase SQL Editor, exécuter :
```sql
-- Supprimer l'ancien trigger défaillant
DROP TRIGGER IF EXISTS auth_users_webhook ON auth.users;
DROP FUNCTION IF EXISTS public.handle_auth_user_webhook();
```

### ÉTAPE 5: Tester le système

#### Test automatique :
```bash
node fix-webhook-direct.mjs
```

#### Correction manuelle pour un utilisateur :
```bash
node fix-webhook-direct.mjs email@example.com
```

#### Test complet :
1. Créer un nouveau compte test
2. Confirmer l'email
3. Vérifier que l'utilisateur reçoit :
   - ✅ Email de bienvenue
   - ✅ 10 points attribués

## 🔍 DIAGNOSTIC RAPIDE

### Vérifier les utilisateurs avec 0 points :
```sql
SELECT 
  email, 
  first_name, 
  last_name, 
  total_points, 
  created_at
FROM profiles 
WHERE total_points = 0 
ORDER BY created_at DESC
LIMIT 10;
```

### Corriger manuellement un utilisateur :
```sql
-- Remplace 'email@example.com' par le vrai email
UPDATE profiles 
SET total_points = 10, updated_at = NOW() 
WHERE email = 'email@example.com' AND total_points = 0;
```

## 📋 CHECKLIST FINALE

- [ ] Clé Service Role ajoutée à .env
- [ ] Script de diagnostic exécuté
- [ ] Webhook configuré dans Dashboard Supabase
- [ ] Ancien trigger nettoyé (optionnel)
- [ ] Test avec nouveau compte
- [ ] Utilisateurs existants corrigés si nécessaire

## 🆘 DÉPANNAGE

### "SUPABASE_SERVICE_ROLE_KEY manquante"
➜ Récupérer la clé depuis Dashboard > Settings > API

### "Webhook ne répond pas"
➜ Vérifier que la fonction `auth-webhook` est déployée dans Edge Functions

### "Email de bienvenue pas envoyé"
➜ Vérifier que la fonction `send-welcome-ciara` fonctionne :
```bash
curl -X POST https://pohqkspsdvvbqrgzfayl.supabase.co/functions/v1/send-welcome-ciara \
  -H "Content-Type: application/json" \
  -d '{"userName":"Test","email":"test@example.com"}'
```

### "Points pas attribués"
➜ Vérifier les permissions RLS sur la table `profiles`

## ✅ RÉSULTAT ATTENDU

Après ces corrections, chaque nouvel utilisateur qui confirme son email recevra automatiquement :
- 📧 Un email de bienvenue avec toutes les fonctionnalités CIARA
- 🎁 10 points de bienvenue pour commencer
- 🎯 Un profil complet créé automatiquement