# 🧹 GUIDE NETTOYAGE COMPLET DES UTILISATEURS

## 📋 **RÉSUMÉ EXÉCUTIF**

**Objectif :** Supprimer TOUS les comptes utilisateurs et profils sauf le super admin `zyed.elmeddeb@gmail.com`

**⚠️ ATTENTION :** Cette opération est **IRRÉVERSIBLE** sans sauvegarde préalable !

---

## 🚨 **AVERTISSEMENTS CRITIQUES**

### **⚠️ RISQUES :**
- **Suppression définitive** de tous les utilisateurs sauf le super admin
- **Perte de données** : profils, points, progression, etc.
- **Impossible de récupérer** sans sauvegarde préalable
- **Impact sur l'application** : tous les utilisateurs devront se réinscrire

### **✅ PRÉREQUIS OBLIGATOIRES :**
1. **Sauvegarde complète** de la base de données
2. **Environnement de test** pour valider le script
3. **Fenêtre de maintenance** planifiée
4. **Accès super admin** confirmé

---

## 🔒 **SÉCURITÉ ET SAUVEGARDE**

### **1. Sauvegarde obligatoire :**
```bash
# Sauvegarde complète de la base
pg_dump -h your-host -U your-user -d your-database > backup_before_cleanup_$(date +%Y%m%d_%H%M%S).sql

# Ou via Supabase CLI
supabase db dump --data-only > backup_before_cleanup.sql
```

### **2. Vérification de la sauvegarde :**
```bash
# Tester la restauration sur un environnement de test
psql -h test-host -U test-user -d test-database < backup_before_cleanup.sql
```

---

## 📁 **FICHIERS FOURNIS**

### **1. `cleanup-users.sql`** - Script principal de nettoyage
- **Fonction :** Supprime tous les utilisateurs sauf le super admin
- **Sécurité :** Vérifications et validations intégrées
- **Rollback :** Transaction avec commit/rollback

### **2. `verify-users-cleanup.sql`** - Script de vérification
- **Fonction :** Vérifie l'état avant/après le nettoyage
- **Contrôles :** Comptage, relations, intégrité
- **Statistiques :** Répartition par rôle

### **3. `rollback-users-cleanup.sql`** - Script de rollback
- **Fonction :** Instructions de restauration
- **Alternatives :** Méthodes de récupération
- **Recommandations :** Bonnes pratiques

---

## 🚀 **PROCÉDURE D'EXÉCUTION**

### **ÉTAPE 1 : Préparation**
```bash
# 1. Vérifier l'accès à la base
psql -h your-host -U your-user -d your-database

# 2. Exécuter le script de vérification
\i verify-users-cleanup.sql
```

### **ÉTAPE 2 : Sauvegarde**
```bash
# Créer une sauvegarde complète
pg_dump -h your-host -U your-user -d your-database > backup_$(date +%Y%m%d_%H%M%S).sql
```

### **ÉTAPE 3 : Nettoyage**
```bash
# Exécuter le script de nettoyage
\i cleanup-users.sql
```

### **ÉTAPE 4 : Vérification**
```bash
# Vérifier le résultat
\i verify-users-cleanup.sql
```

---

## 🧪 **TESTS ET VALIDATION**

### **Vérifications obligatoires :**
1. ✅ **Super admin conservé** : `zyed.elmeddeb@gmail.com` existe toujours
2. ✅ **Autres utilisateurs supprimés** : Aucun autre utilisateur dans `auth.users`
3. ✅ **Profils cohérents** : Un seul profil dans `public.profiles`
4. ✅ **Intégrité maintenue** : Aucun profil orphelin

### **Tests de fonctionnalité :**
1. **Connexion super admin** : Vérifier que le compte fonctionne
2. **Permissions** : Confirmer les droits d'administration
3. **Application** : Tester les fonctionnalités critiques

---

## 🔄 **ROLLBACK ET RÉCUPÉRATION**

### **En cas de problème :**
```bash
# 1. Arrêter immédiatement l'application
# 2. Restaurer depuis la sauvegarde
pg_restore -h your-host -U your-user -d your-database backup_file.sql

# 3. Vérifier la restauration
\i verify-users-cleanup.sql
```

### **Alternatives de récupération :**
1. **Sauvegarde Supabase** : Utiliser les outils de restauration Supabase
2. **Point-in-time recovery** : Si activé sur votre plan
3. **Restauration manuelle** : Recréer les utilisateurs un par un

---

## 📊 **RÉSULTATS ATTENDUS**

### **Avant le nettoyage :**
- **N utilisateurs** dans `auth.users`
- **N profils** dans `public.profiles`
- **Mix de rôles** : super_admin, tenant_admin, partner, visitor

### **Après le nettoyage :**
- **1 utilisateur** dans `auth.users` (zyed.elmeddeb@gmail.com)
- **1 profil** dans `public.profiles` (profil super admin)
- **Rôle unique** : super_admin

---

## 🚨 **SCÉNARIOS D'URGENCE**

### **Problème 1 : Super admin supprimé par erreur**
```sql
-- Vérifier immédiatement
SELECT COUNT(*) FROM auth.users WHERE email = 'zyed.elmeddeb@gmail.com';

-- Si 0, RESTAURER IMMÉDIATEMENT depuis la sauvegarde
```

### **Problème 2 : Profils orphelins**
```sql
-- Identifier les profils orphelins
SELECT * FROM public.profiles p
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE u.id IS NULL;
```

### **Problème 3 : Contraintes cassées**
```sql
-- Vérifier l'intégrité
SELECT 
    schemaname, 
    tablename, 
    constraintname, 
    constrainttype
FROM pg_constraints 
WHERE schemaname IN ('auth', 'public');
```

---

## 📋 **CHECKLIST FINALE**

### **Avant l'exécution :**
- [ ] **Sauvegarde complète** créée et testée
- [ ] **Environnement de test** validé
- [ ] **Fenêtre de maintenance** planifiée
- [ ] **Équipe notifiée** de l'opération
- [ ] **Scripts testés** sur environnement de développement

### **Pendant l'exécution :**
- [ ] **Vérification pré-nettoyage** exécutée
- [ ] **Sauvegarde** confirmée
- [ ] **Script de nettoyage** exécuté
- [ ] **Vérification post-nettoyage** validée
- [ ] **Tests de fonctionnalité** effectués

### **Après l'exécution :**
- [ ] **Résultats documentés**
- [ ] **Équipe notifiée** du succès
- [ ] **Monitoring** activé
- [ ] **Plan de récupération** mis à jour

---

## ✅ **CONCLUSION**

**Le nettoyage des utilisateurs est une opération CRITIQUE qui nécessite :**

1. **Préparation minutieuse** et sauvegarde obligatoire
2. **Exécution sécurisée** avec scripts validés
3. **Vérification complète** des résultats
4. **Plan de rollback** prêt en cas de problème

**⚠️ NE PAS EXÉCUTER sans avoir lu et compris ce guide complet !**

---

*Dernière mise à jour :* $(date)
*Responsable :* Assistant IA
*Version :* 1.0
*Sécurité :* CRITIQUE
