# 🔧 Guide de Vérification et Correction du Webhook Auth-Webhook

## 📋 Résumé du Problème Identifié
- **Symptôme**: Le webhook auth-webhook n'est pas déclenché lors de la création de comptes
- **Cause**: Erreur dans la fonction Edge (status non-2xx)
- **Impact**: Emails de confirmation non envoyés automatiquement
- **Statut**: 🔧 **EN COURS DE RÉSOLUTION**

## 🔍 Diagnostic Exécuté

### Tests Réalisés
1. ✅ **Fonction send-email-confirmation** - Parfaitement opérationnelle
2. ✅ **Service Resend** - Configuration correcte
3. ⚠️ **Webhook auth-webhook** - Erreur "Edge Function returned a non-2xx status code"
4. ✅ **Accès aux fonctions** - Toutes accessibles

### Erreur Identifiée
```
⚠️  Webhook appelé mais erreur détectée:
   Status: undefined
   Message: Edge Function returned a non-2xx status code
```

## 🚨 Causes Probables

### 1. Variables d'Environnement Manquantes
- `RESEND_API_KEY` - Clé API Resend pour l'envoi d'emails
- `SUPABASE_URL` - URL du projet Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Clé de service pour les opérations admin

### 2. Permissions Insuffisantes
- La fonction n'a pas les permissions pour créer des profils
- La clé de service n'est pas configurée correctement

### 3. Erreurs dans le Code
- Problèmes de syntaxe ou de logique
- Gestion d'erreur insuffisante

## 🔧 Étapes de Vérification et Correction

### Étape 1: Vérifier les Variables d'Environnement

#### Dans Supabase Dashboard
1. Aller dans [Edge Functions](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/functions)
2. Cliquer sur **auth-webhook**
3. Aller dans l'onglet **Settings**
4. Vérifier les variables d'environnement :

**Variables requises :**
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
SUPABASE_URL=https://pohqkspsdvvbqrgzfayl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_xxxxxxxxxxxxxxxxxxxxx
```

#### Comment obtenir ces clés :

**RESEND_API_KEY :**
1. Aller sur [Resend Dashboard](https://resend.com/api-keys)
2. Créer une nouvelle clé API ou copier une existante
3. Format : `re_xxxxxxxxxxxxxxxxxxxxx`

**SUPABASE_SERVICE_ROLE_KEY :**
1. Aller dans [Supabase Dashboard > Settings > API](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/settings/api)
2. Copier la clé **service_role** (pas la clé anon)
3. Format : `sb_xxxxxxxxxxxxxxxxxxxxx`

### Étape 2: Vérifier la Configuration des Triggers

#### Dans Supabase Dashboard
1. Aller dans [Database > Hooks](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/database/hooks)
2. Vérifier qu'il y a un webhook configuré pour `auth.users`
3. Vérifier que l'URL pointe vers : `https://pohqkspsdvvbqrgzfayl.supabase.co/functions/v1/auth-webhook`

#### Configuration attendue :
```sql
-- Trigger pour la table auth.users
CREATE TRIGGER auth_users_webhook
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION supabase_functions.http_request(
    'POST',
    'https://pohqkspsdvvbqrgzfayl.supabase.co/functions/v1/auth-webhook',
    '{"Content-Type":"application/json"}',
    '{}',
    '1000'
  );
```

### Étape 3: Vérifier les Logs de la Fonction

#### Dans Supabase Dashboard
1. Aller dans [Edge Functions > auth-webhook](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/functions)
2. Cliquer sur l'onglet **Logs**
3. Identifier les erreurs spécifiques

#### Erreurs communes à rechercher :
- `RESEND_API_KEY is not defined`
- `SUPABASE_SERVICE_ROLE_KEY is not defined`
- `Permission denied on table profiles`
- `Table profiles does not exist`

### Étape 4: Tester la Configuration

#### Après avoir configuré les variables :
1. Aller dans [Edge Functions > auth-webhook](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/functions)
2. Cliquer sur **Redeploy** pour recharger les variables d'environnement
3. Tester avec le script : `node test-webhook-trigger.mjs`

## 🛠️ Scripts de Test et Diagnostic

### 1. Test de Configuration
```bash
node check-webhook-config.mjs
```

### 2. Test du Déclenchement
```bash
node test-webhook-trigger.mjs
```

### 3. Test d'Envoi d'Email
```bash
node test-email-direct.mjs
```

## 📊 Vérifications Manuelles Requises

### Dans Supabase Dashboard
1. **Edge Functions > auth-webhook > Settings**
   - Variables d'environnement
   - Permissions
   - Statut de la fonction

2. **Database > Hooks**
   - Configuration du webhook
   - URL de destination
   - Triggers actifs

3. **Database > Tables > profiles**
   - Structure de la table
   - Permissions RLS
   - Données existantes

4. **Auth > Users**
   - Statut de baptiste.meddeb@genieculturel.ch
   - Vérification de la confirmation d'email

### Dans Resend Dashboard
1. **API Keys**
   - Validité de la clé API
   - Permissions et limites

2. **Domains**
   - Statut de ciara.city
   - Enregistrements DNS

3. **Activity**
   - Historique des envois
   - Bounces et erreurs

## 🎯 Actions Prioritaires

### 🔴 Urgent (À faire maintenant)
1. Vérifier `RESEND_API_KEY` dans les variables d'environnement
2. Vérifier `SUPABASE_SERVICE_ROLE_KEY` dans les variables d'environnement
3. Consulter les logs de la fonction auth-webhook

### 🟡 Important (À faire dans l'heure)
1. Redéployer la fonction après configuration des variables
2. Tester le webhook avec le script de test
3. Vérifier la configuration des triggers

### 🟢 Planifié (À faire aujourd'hui)
1. Tester la création d'un nouveau compte
2. Vérifier que l'email de confirmation est envoyé automatiquement
3. Documenter la configuration pour éviter les récurrences

## 🔍 Vérification de la Résolution

### Critères de Succès
- ✅ Le webhook auth-webhook s'exécute sans erreur
- ✅ Les profils utilisateurs sont créés automatiquement
- ✅ Les emails de confirmation sont envoyés automatiquement
- ✅ Les 10 points de bienvenue sont attribués après confirmation

### Test de Validation
1. Créer un nouveau compte utilisateur
2. Vérifier que le profil est créé dans la table profiles
3. Vérifier que l'email de confirmation est reçu
4. Confirmer l'email et vérifier l'attribution des points

## 📞 Support et Escalation

### Si le problème persiste après configuration :
1. Consulter les logs détaillés de la fonction
2. Vérifier les permissions de la base de données
3. Tester avec des données minimales
4. Contacter l'équipe technique si nécessaire

### Informations à fournir :
- Logs de la fonction auth-webhook
- Configuration des variables d'environnement
- Erreurs spécifiques rencontrées
- Résultats des tests de diagnostic

---

**Statut**: 🔧 En cours de résolution
**Priorité**: Haute
**Responsable**: Assistant IA + Utilisateur
**Dernière mise à jour**: $(date)
