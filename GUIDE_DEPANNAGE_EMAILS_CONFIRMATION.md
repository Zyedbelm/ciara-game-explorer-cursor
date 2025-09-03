# 🔧 Guide de Dépannage - Emails de Confirmation CIARA

## 📋 Résumé du Problème
- **Utilisateur**: baptiste.meddeb@genieculturel.ch
- **Statut**: Compte créé dans Supabase mais email de confirmation non reçu
- **Symptôme**: Profil visible dans [Supabase Dashboard](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/auth/users) mais pas d'email

## 🔍 Diagnostic Automatique

### 1. Vérification du Statut du Système
```bash
# Définir la clé de service Supabase
export SUPABASE_SERVICE_ROLE_KEY="votre-clé-service"

# Exécuter le diagnostic complet
node check-system-status.mjs
```

### 2. Test d'Envoi d'Email
```bash
# Tester l'envoi d'email de confirmation
node test-email-confirmation.mjs
```

### 3. Forçage de l'Envoi
```bash
# Forcer l'envoi d'un email de confirmation
node force-email-confirmation.mjs
```

## 🚨 Points de Vérification Critiques

### A. Configuration Supabase
1. **Variables d'Environnement**
   - `RESEND_API_KEY` est-elle configurée ?
   - `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont-ils corrects ?

2. **Fonctions Edge**
   - `auth-webhook` est-elle déployée et active ?
   - `send-email-confirmation` est-elle accessible ?

3. **Webhooks**
   - Le webhook d'authentification est-il configuré ?
   - Les triggers sont-ils actifs ?

### B. Configuration Resend
1. **Clé API**
   - La clé API Resend est-elle valide ?
   - Les limites de taux sont-elles respectées ?

2. **Domaine**
   - Le domaine `ciara.city` est-il vérifié dans Resend ?
   - Les enregistrements DNS sont-ils corrects ?

3. **Statut du Compte**
   - Le compte Resend est-il actif ?
   - Y a-t-il des restrictions ou suspensions ?

## 🔧 Solutions par Ordre de Priorité

### Solution 1: Vérification Immédiate (5 min)
```bash
# 1. Vérifier le statut de l'utilisateur
node check-system-status.mjs

# 2. Forcer l'envoi d'un email
node force-email-confirmation.mjs
```

### Solution 2: Diagnostic des Fonctions (10 min)
1. Aller dans [Supabase Dashboard > Edge Functions](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/functions)
2. Vérifier que `auth-webhook` et `send-email-confirmation` sont actives
3. Consulter les logs des fonctions pour identifier les erreurs

### Solution 3: Vérification des Webhooks (15 min)
1. Aller dans [Supabase Dashboard > Database > Hooks](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/database/hooks)
2. Vérifier que le webhook `auth-webhook` est configuré
3. Tester le webhook avec des données de test

### Solution 4: Configuration Resend (20 min)
1. Aller dans [Resend Dashboard](https://resend.com/domains)
2. Vérifier le statut du domaine `ciara.city`
3. Vérifier la clé API et les limites
4. Tester l'envoi d'email directement depuis Resend

## 📊 Logs et Monitoring

### Logs Supabase
- **Edge Functions**: Dashboard > Functions > Logs
- **Database**: Dashboard > Database > Logs
- **Auth**: Dashboard > Auth > Logs

### Logs Resend
- **Email Delivery**: Dashboard > Activity
- **Bounces/Spam**: Dashboard > Bounces
- **API Usage**: Dashboard > API Keys

## 🎯 Actions Immédiates Recommandées

1. **Exécuter le diagnostic automatique**
   ```bash
   node check-system-status.mjs
   ```

2. **Forcer l'envoi d'un email de confirmation**
   ```bash
   node force-email-confirmation.mjs
   ```

3. **Vérifier les logs de la fonction auth-webhook**
   - Aller dans Supabase Dashboard > Functions > auth-webhook > Logs

4. **Tester la fonction send-email-confirmation**
   - Aller dans Supabase Dashboard > Functions > send-email-confirmation > Logs

## 🔍 Vérifications Manuelles

### Dans Supabase Dashboard
1. **Auth > Users**: Vérifier le statut de l'utilisateur
2. **Database > Tables > profiles**: Vérifier si le profil a été créé
3. **Functions**: Vérifier le statut des fonctions Edge
4. **Database > Hooks**: Vérifier la configuration des webhooks

### Dans Resend Dashboard
1. **Domains**: Vérifier le statut de `ciara.city`
2. **API Keys**: Vérifier la validité de la clé API
3. **Activity**: Vérifier les tentatives d'envoi
4. **Settings**: Vérifier les limites et restrictions

## 🚀 Solutions Alternatives

### Si Resend ne fonctionne pas
1. **Utiliser Supabase Auth Email** (temporaire)
   - Désactiver le webhook personnalisé
   - Activer les emails Supabase par défaut

2. **Utiliser un autre service d'email**
   - SendGrid, Mailgun, ou AWS SES
   - Mettre à jour la fonction `send-email-confirmation`

### Si le webhook ne fonctionne pas
1. **Créer manuellement le profil**
   ```sql
   INSERT INTO profiles (user_id, email, role, total_points, created_at, updated_at)
   VALUES ('user-id', 'baptiste.meddeb@genieculturel.ch', 'visitor', 0, NOW(), NOW());
   ```

2. **Confirmer manuellement l'email**
   ```sql
   UPDATE auth.users 
   SET email_confirmed_at = NOW() 
   WHERE email = 'baptiste.meddeb@genieculturel.ch';
   ```

## 📞 Support et Escalation

### Niveau 1: Diagnostic Automatique
- Utiliser les scripts fournis
- Vérifier la configuration de base

### Niveau 2: Investigation Manuelle
- Consulter les logs Supabase et Resend
- Tester les composants individuellement

### Niveau 3: Support Technique
- Contacter l'équipe technique
- Fournir les logs et diagnostics

## 📝 Checklist de Résolution

- [ ] Diagnostic automatique exécuté
- [ ] Email de confirmation forcé
- [ ] Logs des fonctions vérifiés
- [ ] Configuration Resend validée
- [ ] Webhooks testés
- [ ] Utilisateur notifié du statut
- [ ] Problème résolu ou escaladé

## 🔗 Liens Utiles

- [Supabase Dashboard](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl)
- [Resend Dashboard](https://resend.com)
- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [Documentation Resend](https://resend.com/docs)

---

**Dernière mise à jour**: $(date)
**Statut**: En cours de résolution
**Priorité**: Haute
