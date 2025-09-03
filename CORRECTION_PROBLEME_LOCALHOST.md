# 🚨 Correction du Problème Localhost dans le Webhook Auth-Webhook

## 📋 Problème Identifié
- **Symptôme**: Les logs montrent `localhost:9999` en production
- **Cause**: Configuration locale dans les variables d'environnement
- **Impact**: Webhook non fonctionnel, emails non envoyés automatiquement
- **Statut**: 🔴 **URGENT À CORRIGER**

## 🔍 Analyse des Logs

### Logs Problématiques
```
ℹ️ Auth Webhook - Event non géré: undefined
🔔 Auth Webhook - Type: undefined
🔔 Auth Webhook - Record: No user ID
Listening on http://localhost:9999/
booted (time: 30ms)
shutdown
shutdown
```

### Problèmes Identifiés
1. **Type: undefined** - Données mal formées reçues
2. **Record: No user ID** - Aucun ID utilisateur reçu
3. **localhost:9999** - Configuration locale en production
4. **Event non géré** - Le webhook ne reconnaît pas l'événement

## 🚨 Actions Immédiates Requises

### Étape 1: Vérifier les Variables d'Environnement (🔴 URGENT)

#### Dans [Supabase Dashboard > Edge Functions > auth-webhook > Settings](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/functions)

**Variables à vérifier et corriger :**

```bash
# ❌ INCORRECT (à supprimer)
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIzNjQ0NCwiZXhwIjoyMDY3ODEyNDQ0fQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ✅ CORRECT (à configurer)
SUPABASE_URL=https://pohqkspsdvvbqrgzfayl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Étape 2: Vérifier la Configuration des Hooks (🔴 URGENT)

#### Dans [Supabase Dashboard > Database > Hooks](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/database/hooks)

**Configuration attendue :**
```sql
-- Le webhook doit pointer vers la PRODUCTION, pas localhost
CREATE TRIGGER auth_users_webhook
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION supabase_functions.http_request(
    'POST',
    'https://pohqkspsdvvbqrgzfayl.supabase.co/functions/v1/auth-webhook',  -- ✅ PRODUCTION
    '{"Content-Type":"application/json"}',
    '{}',
    '1000'
  );
```

**❌ Configuration INCORRECTE (à corriger) :**
```sql
-- Si vous voyez ceci, c'est INCORRECT
'http://localhost:54321/functions/v1/auth-webhook'  -- ❌ LOCALHOST
```

### Étape 3: Vérifier les Settings du Projet (🟡 Important)

#### Dans [Supabase Dashboard > Settings > API](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/settings/api)

**Vérifier que :**
- **Project URL** = `https://pohqkspsdvvbqrgzfayl.supabase.co`
- **Project API keys** pointent vers la production
- **Aucune référence à localhost**

## 🔧 Procédure de Correction

### 1. Correction des Variables d'Environnement

#### Dans [Edge Functions > auth-webhook > Settings](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/functions)

1. **Cliquer sur "Settings"**
2. **Vérifier chaque variable :**
   - `SUPABASE_URL` doit être `https://pohqkspsdvvbqrgzfayl.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` doit commencer par `sb_`
   - `RESEND_API_KEY` doit commencer par `re_`
3. **Supprimer toute variable contenant localhost**
4. **Sauvegarder les changements**

### 2. Correction de la Configuration des Hooks

#### Dans [Database > Hooks](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/database/hooks)

1. **Identifier le webhook pour `auth.users`**
2. **Vérifier l'URL de destination**
3. **S'assurer qu'elle pointe vers la production**
4. **Si localhost détecté, corriger l'URL**

### 3. Redéploiement de la Fonction

#### Après correction des variables :

1. **Aller dans [Edge Functions > auth-webhook](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/functions)**
2. **Cliquer sur "Redeploy"**
3. **Attendre la confirmation du redéploiement**

## 🧪 Tests de Validation

### Test 1: Vérification de la Configuration
```bash
node check-webhook-config.mjs
```

### Test 2: Test du Webhook
```bash
node test-webhook-trigger.mjs
```

### Test 3: Test de Création de Profil
1. Créer un nouveau compte utilisateur sur ciara.city
2. Vérifier les logs dans [Edge Functions > auth-webhook > Logs](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/functions)
3. Vérifier que les logs montrent :
   - ✅ `Type: INSERT`
   - ✅ `Record: User ID: [id]`
   - ❌ **PAS de localhost**

## 📊 Logs Attendus Après Correction

### Logs Corrects
```
🔔 Auth Webhook - Type: INSERT
🔔 Auth Webhook - Record: User ID: [user-id]
👤 Création de profil pour utilisateur: [user-id]
✅ Profil créé avec succès pour: [user-id]
📧 Envoi automatique de l'email de confirmation via Resend...
✅ Email de confirmation envoyé via Resend (méthode partenaires)
```

### Logs Incorrects (à éviter)
```
ℹ️ Auth Webhook - Event non géré: undefined
🔔 Auth Webhook - Type: undefined
🔔 Auth Webhook - Record: No user ID
Listening on http://localhost:9999/
```

## 🚨 Vérifications Critiques

### ✅ À Vérifier Immédiatement
- [ ] Variables d'environnement sans localhost
- [ ] URL du webhook pointe vers la production
- [ ] Fonction redéployée après correction
- [ ] Logs ne mentionnent plus localhost

### 🔍 Points de Contrôle
- [ ] [Edge Functions > auth-webhook > Settings](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/functions)
- [ ] [Database > Hooks](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/database/hooks)
- [ ] [Settings > API](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/settings/api)

## 🎯 Résultat Attendu

Après correction, le webhook devrait :
1. **Recevoir correctement les événements** de création d'utilisateur
2. **Créer automatiquement les profils** dans la table `profiles`
3. **Envoyer automatiquement les emails** de confirmation
4. **Attribuer les 10 points de bienvenue** après confirmation
5. **Ne plus mentionner localhost** dans les logs

## 📞 Support et Escalation

### Si le problème persiste après correction :
1. Vérifier que toutes les variables sont correctes
2. Consulter les logs détaillés de la fonction
3. Vérifier que la fonction est bien redéployée
4. Tester avec un nouveau compte utilisateur

### Informations à fournir :
- Configuration des variables d'environnement
- URL du webhook configuré
- Logs de la fonction après correction
- Résultats des tests de validation

---

**Statut**: 🔴 Problème critique identifié
**Priorité**: URGENT
**Responsable**: Assistant IA + Utilisateur
**Dernière mise à jour**: $(date)
