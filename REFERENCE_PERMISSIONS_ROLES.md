# 🔐 RÉFÉRENCE OFFICIELLE DES PERMISSIONS PAR RÔLE

## 📋 Vue d'ensemble des rôles

Ce document constitue la référence officielle des droits d'accès pour chaque rôle dans le système CIARA. Toutes les politiques RLS (Row Level Security) ont été auditées et alignées sur ces spécifications.

---

## 🔴 SUPER ADMIN (`super_admin`)

**Statut :** Accès global total à tout le système  
**Restrictions :** Aucune

### 🏙️ Gestion des villes
- ✅ **Voir** toutes les villes (même archivées/inactives)
- ✅ **Modifier** toutes les villes
- ✅ **Supprimer** des villes
- ✅ **Créer** de nouvelles villes

### 👥 Gestion des utilisateurs
- ✅ **Voir** tous les profils
- ✅ **Modifier** tous les profils
- ✅ **Supprimer** des profils
- ✅ **Gérer** les assignations de partenaires
- ✅ **Changer** les rôles des utilisateurs

### 📄 Gestion du contenu
- ✅ **Voir/modifier/supprimer** toutes les étapes
- ✅ **Voir/modifier/supprimer** tous les parcours
- ✅ **Voir/modifier/supprimer** tous les articles
- ✅ **Voir/modifier/supprimer** tous les documents
- ✅ **Gérer** tous les partenaires
- ✅ **Gérer** toutes les récompenses

### 🔧 Fonctionnalités administratives
- ✅ **Accès** à tous les tableaux de bord
- ✅ **Gestion** des catégories de parcours
- ✅ **Gestion** des traductions UI
- ✅ **Accès** aux analytics globales
- ✅ **Gestion** des médias et fichiers

---

## 🟡 ADMIN VILLE (`tenant_admin`)

**Statut :** Droits limités à sa ville assignée  
**Ville gérée :** Définie par `city_id` dans son profil

### 🏙️ Gestion de sa ville
- ✅ **Voir** sa ville
- ✅ **Modifier** sa ville (si non archivée)
- ❌ **Supprimer** sa ville
- ❌ **Voir** les autres villes archivées/inactives

### 👥 Gestion des utilisateurs de sa ville
- ✅ **Voir** les utilisateurs de sa ville
- ✅ **Modifier** les profils des utilisateurs de sa ville
- ✅ **Supprimer** des profils (dans sa ville)
- ✅ **Changer** les rôles (dans sa ville)
- ✅ **Gérer** les assignations de partenaires (dans sa ville)

**📌 Important :** Les tenant_admin peuvent seulement modifier les utilisateurs déjà affectés à leur ville par un super_admin. L'affectation initiale à une ville (`city_id`) ne peut être faite que par un super_admin.

### 📄 Gestion du contenu de sa ville
- ✅ **Voir/modifier/créer** les étapes de sa ville
- ✅ **Voir/modifier/créer** les parcours de sa ville
- ✅ **Voir/modifier/créer** les articles de sa ville
- ✅ **Voir/modifier/créer** les documents par étape (sa ville)
- ✅ **Gérer** les partenaires de sa ville
- ✅ **Gérer** les récompenses des partenaires de sa ville

### 📊 Tableau de bord Partenaires
- ✅ **Voir** les offres partenaires de sa ville
- ✅ **Accès** au tableau de bord de tous les partenaires de sa ville
- ✅ **Filtrer** par partenaire spécifique
- ✅ **Analytics** limitées à sa ville

### ❌ Restrictions
- ❌ **Accès** aux autres villes
- ❌ **Gestion** des super admins
- ❌ **Modification** des paramètres globaux
- ❌ **Suppression** de sa propre ville
- ❌ **Affectation** d'utilisateurs à des villes (réservé au super_admin)

---

## 🟢 PARTENAIRE (`partner`)

**Statut :** Droits très limités - Principalement consultation et gestion personnelle  
**Partenaire lié :** Défini par `partner_id` dans son profil

### 📖 Consultation publique
- ✅ **Voir** son propre profil
- ✅ **Voir** les étapes publiques
- ✅ **Voir** les parcours publics
- ✅ **Voir** les articles publiés
- ✅ **Voir** les documents publics

### 💼 Gestion de son business
- ✅ **Voir** ses offres partenaires
- ✅ **Accès** à son tableau de bord Partenaire personnel
- ✅ **Gérer** ses propres récompenses
- ✅ **Voir** ses propres analytics

### 👤 Gestion personnelle
- ✅ **Modifier** son propre profil (informations de base)
- ✅ **Gérer** ses propres parcours personnels (non prédéfinis)
- ✅ **Suivre** sa propre progression

### ❌ Restrictions strictes
- ❌ **Voir** les autres profils
- ❌ **Voir** les autres partenaires
- ❌ **Modifier** le contenu de la ville
- ❌ **Gérer** des utilisateurs
- ❌ **Accès** aux fonctions d'administration (sauf son tableau de bord)
- ❌ **Voir** les données des autres partenaires

---

## ⚪ VISITEUR (`visitor`)

**Statut :** Droits minimaux - Utilisateur standard du système  
**Accès :** Public et personnel uniquement

### 📖 Consultation publique
- ✅ **Voir** les étapes publiques
- ✅ **Voir** les parcours publics
- ✅ **Voir** les articles publiés
- ✅ **Voir** les documents publics
- ✅ **Voir** les villes actives

### 👤 Gestion personnelle
- ✅ **Voir** son propre profil
- ✅ **Modifier** son propre profil (informations de base)
- ✅ **Gérer** ses propres parcours personnels
- ✅ **Suivre** sa propre progression dans les parcours
- ✅ **Gérer** ses propres notifications

### ❌ Restrictions complètes
- ❌ **Voir** les autres profils
- ❌ **Voir** les informations des partenaires
- ❌ **Accès** aux fonctions d'administration
- ❌ **Modifier** le contenu système
- ❌ **Voir** les données non publiques

---

## 🔄 WORKFLOW DE GESTION DES UTILISATEURS

### Processus d'affectation et gestion des rôles

1. **Affectation initiale à une ville (Super Admin uniquement)**
   ```
   Super Admin → Affecte user → city_id (ville)
   ```

2. **Gestion des rôles par ville (Tenant Admin)**
   ```
   Tenant Admin → Peut changer le rôle → Utilisateurs de SA ville uniquement
   ```

3. **Workflow complet**
   ```
   1. Super Admin crée/affecte un utilisateur à une ville
   2. Tenant Admin de cette ville peut ensuite :
      - Changer le rôle de l'utilisateur (visitor ↔ partner)
      - Modifier les informations du profil
      - Assigner à un partenaire (pour rôle partner)
   3. Super Admin garde le contrôle sur :
      - L'affectation ville (city_id)
      - Les rôles admin (tenant_admin, super_admin)
   ```

### Règles de sécurité
- ❌ Un tenant_admin ne peut pas "voler" un utilisateur d'une autre ville
- ❌ Un tenant_admin ne peut pas créer de nouveaux super_admin ou tenant_admin
- ✅ Un tenant_admin peut promouvoir visitor → partner dans sa ville
- ✅ Un super_admin garde le contrôle total sur les affectations

---

## 🔧 DÉTAILS TECHNIQUES

### Tables principales auditées
- ✅ `profiles` - Gestion des utilisateurs
- ✅ `cities` - Gestion des villes
- ✅ `steps` - Gestion des étapes
- ✅ `journeys` - Gestion des parcours
- ✅ `articles` - Gestion des articles
- ✅ `documents` - Gestion des documents
- ✅ `partners` - Gestion des partenaires
- ✅ `rewards` - Gestion des récompenses
- ✅ `quiz_questions` - Gestion des quiz
- ✅ `user_journey_progress` - Progression utilisateur
- ✅ `step_completions` - Complétion des étapes

### Fonctions de sécurité utilisées
- `get_current_user_role()` - Récupère le rôle de l'utilisateur connecté
- `get_user_city_id()` - Récupère l'ID de la ville de l'utilisateur
- `can_manage_city(city_id)` - Vérifie si l'utilisateur peut gérer une ville

### Vérifications effectuées
- ✅ Suppression de tous les rôles obsolètes (`city_admin`, `content_manager`)
- ✅ Alignement des politiques RLS avec les spécifications
- ✅ Validation des permissions cross-tables
- ✅ Test des accès pour modification d'étapes

---

## 📝 CHANGELOG

### Version 1.0 - Janvier 2025
- Audit complet des permissions selon spécifications validées
- Suppression des rôles obsolètes `city_admin` et `content_manager`
- Alignement des politiques RLS sur les 4 rôles officiels
- Correction des permissions tenant_admin pour gestion complète de leur ville
- Restriction des permissions partenaires à leurs propres données
- Documentation complète des droits par rôle

---

## ⚠️ IMPORTANT

Ce document fait référence pour toute modification future des permissions. Avant tout changement :

1. **Valider** les modifications avec les spécifications business
2. **Tester** les impacts sur les politiques RLS
3. **Mettre à jour** ce document de référence
4. **Vérifier** la cohérence cross-tables

**Dernière mise à jour :** Janvier 2025  
**Statut :** ✅ Validé et implémenté
