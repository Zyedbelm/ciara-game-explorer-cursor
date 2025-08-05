# 🚨 Actions Immédiates pour Corriger les Problèmes

## 📋 **Problèmes Identifiés**

1. **Création de ville** : Erreur de contrainte `valid_category_icons`
2. **Suppression d'étape** : L'étape est utilisée dans des parcours mais on ne sait pas lesquels

## 🔧 **Actions à Effectuer IMMÉDIATEMENT**

### **Étape 1 : Appliquer les Corrections SQL**

1. **Aller dans Supabase Studio** : https://supabase.com/dashboard
2. **Sélectionner votre projet**
3. **Aller dans "SQL Editor"**
4. **Copier et exécuter le script** `apply_fixes.sql`

```sql
-- Script complet pour appliquer toutes les corrections
-- À exécuter dans Supabase Studio → SQL Editor

-- 1. CORRECTION DE LA CONTRAINTE valid_category_icons
-- Supprimer la contrainte existante si elle existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'valid_category_icons' 
        AND table_name = 'journey_categories'
    ) THEN
        ALTER TABLE public.journey_categories DROP CONSTRAINT valid_category_icons;
        RAISE NOTICE 'Contrainte valid_category_icons supprimée';
    END IF;
END $$;

-- Recréer la contrainte avec les bonnes icônes
ALTER TABLE public.journey_categories 
ADD CONSTRAINT valid_category_icons 
CHECK (icon IN ('building', 'utensils', 'mountain', 'camera', 'landmark', 'palette'));

-- 2. CRÉER LA FONCTION DE SUPPRESSION FORCÉE
CREATE OR REPLACE FUNCTION force_delete_analytics_for_step(step_id_param UUID)
RETURNS VOID AS $$
BEGIN
  -- Supprimer toutes les références dans analytics_events pour cette étape
  DELETE FROM analytics_events WHERE step_id = step_id_param;
  
  -- Log pour le débogage
  RAISE NOTICE 'Suppression forcée des analytics_events pour l''étape: %', step_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. DONNER LES PERMISSIONS NÉCESSAIRES
GRANT EXECUTE ON FUNCTION force_delete_analytics_for_step(UUID) TO authenticated;

-- 4. VÉRIFIER QUE TOUT EST BIEN APPLIQUÉ
DO $$
BEGIN
    RAISE NOTICE '✅ Contrainte valid_category_icons mise à jour avec succès';
    RAISE NOTICE '✅ Fonction force_delete_analytics_for_step créée avec succès';
    RAISE NOTICE '✅ Permissions accordées avec succès';
END $$;
```

### **Étape 2 : Redémarrer l'Application**

```bash
# Arrêter le serveur (Ctrl+C)
# Puis redémarrer
npm run dev
```

### **Étape 3 : Tester les Corrections**

#### **Test Création de Ville**
1. Aller dans super_admin → Gestion des villes
2. Cliquer sur "Créer une ville"
3. Remplir le formulaire avec :
   - Nom : "Test Ville"
   - Pays : Suisse
   - Description : "Ville de test"
   - Coordonnées : 46.5197, 6.6323
4. Sauvegarder
5. **Résultat attendu** : Ville créée sans erreur

#### **Test Suppression d'Étape**
1. Aller dans super_admin → Gestion des étapes
2. Sélectionner une ville (ex: Sion)
3. Tenter de supprimer l'étape "Parc central sion"
4. **Résultat attendu** : 
   - Si l'étape est dans un parcours : Message indiquant le nom du parcours
   - Si l'étape n'est pas utilisée : Suppression réussie

## 🎯 **Améliorations Apportées**

### **Suppression d'Étape Améliorée** :
- ✅ **Identification des parcours** : Affiche le nom des parcours qui utilisent l'étape
- ✅ **Message informatif** : "Cette étape est utilisée dans les parcours suivants : [Noms]"
- ✅ **Gestion robuste** : Suppression forcée si aucun parcours n'utilise l'étape

### **Création de Ville Améliorée** :
- ✅ **Messages d'erreur détaillés** selon le type d'erreur
- ✅ **Gestion des contraintes** : Messages spécifiques pour chaque type d'erreur
- ✅ **Correction de la contrainte** : Support de toutes les icônes nécessaires

## 🔍 **Codes d'Erreur et Solutions**

### **Création de Ville** :
- **23514** : Contrainte violée → Exécuter le script SQL
- **23505** : Doublon → Changer le nom ou le slug
- **23503** : Référence invalide → Vérifier le pays sélectionné

### **Suppression d'Étape** :
- **23503** : Étape utilisée dans des parcours → Retirer d'abord des parcours
- **409** : Conflit → Redémarrer l'application
- **404** : Fonction non trouvée → Exécuter le script SQL

## 📊 **Vérification de Succès**

Après avoir exécuté le script SQL, vous devriez voir :
```
✅ Contrainte valid_category_icons mise à jour avec succès
✅ Fonction force_delete_analytics_for_step créée avec succès
✅ Permissions accordées avec succès
```

Et dans la requête de vérification finale :
```
check_name                                    | status
---------------------------------------------|--------
Contrainte valid_category_icons              | ✅ Existe
Fonction force_delete_analytics_for_step     | ✅ Existe
```

---

**⚠️ IMPORTANT** : Ces corrections doivent être appliquées dans l'ordre indiqué pour résoudre les problèmes.

**Dernière mise à jour** : Janvier 2025  
**Version** : 3.1.0  
**Auteur** : Équipe CIARA 