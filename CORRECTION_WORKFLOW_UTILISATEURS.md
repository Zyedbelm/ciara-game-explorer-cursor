# 🔄 CORRECTION WORKFLOW GESTION UTILISATEURS

## 📋 Précision importante ajoutée

Suite à la clarification du workflow de gestion des utilisateurs, les politiques RLS ont été affinées pour respecter la règle suivante :

> **Un tenant_admin peut changer les rôles d'utilisateurs de SA ville, mais pour cela, un utilisateur doit être affecté à une ville, et cela ne peut se faire pour le moment que par le super_admin.**

## 🔧 Correction apportée

### Politique RLS `profiles` mise à jour

**AVANT :**
```sql
-- Permettait aux tenant_admin de modifier les utilisateurs avec city_id IS NULL
(get_current_user_role() = 'tenant_admin' 
 AND ((city_id = get_user_city_id()) OR (city_id IS NULL)) 
 AND (user_id <> auth.uid()))
```

**APRÈS :**
```sql
-- Ne permet aux tenant_admin que les utilisateurs DÉJÀ affectés à leur ville
(get_current_user_role() = 'tenant_admin' 
 AND city_id = get_user_city_id() 
 AND city_id IS NOT NULL 
 AND user_id <> auth.uid())
```

## 🎯 Workflow officiel

### 1. Affectation initiale (Super Admin uniquement)
```
Super Admin → Affecte utilisateur → city_id (ville spécifique)
```

### 2. Gestion des rôles (Tenant Admin)
```
Tenant Admin → Peut modifier → Utilisateurs de SA ville uniquement
```

### 3. Règles de sécurité strictes

✅ **Ce qui est permis :**
- Super Admin : Affecte n'importe quel utilisateur à n'importe quelle ville
- Tenant Admin : Modifie les utilisateurs déjà affectés à SA ville
- Utilisateur : Modifie son propre profil (informations de base)

❌ **Ce qui est interdit :**
- Tenant Admin ne peut pas "voler" un utilisateur d'une autre ville
- Tenant Admin ne peut pas modifier les utilisateurs sans ville affectée
- Tenant Admin ne peut pas s'auto-modifier

## 📄 Documentation mise à jour

Le document `REFERENCE_PERMISSIONS_ROLES.md` a été enrichi avec :
- ✅ Section "WORKFLOW DE GESTION DES UTILISATEURS"
- ✅ Processus d'affectation et gestion des rôles
- ✅ Règles de sécurité détaillées
- ✅ Restrictions clarifiées pour tenant_admin

## ✅ Tests de validation

- ✅ Politique RLS mise à jour et testée
- ✅ Workflow documenté et sécurisé
- ✅ Restrictions tenant_admin clarifiées
- ✅ Droits utilisateurs préservés

## 🚀 Prochaines étapes

1. **Tester l'interface d'administration** avec un compte tenant_admin
2. **Vérifier** que seuls les utilisateurs de la ville sont modifiables
3. **Confirmer** que l'affectation ville reste exclusive au super_admin

**Date :** Janvier 2025  
**Statut :** ✅ Implémenté et documenté
