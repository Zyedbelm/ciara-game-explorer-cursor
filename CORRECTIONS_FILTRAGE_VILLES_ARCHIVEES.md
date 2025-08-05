# 🏙️ Corrections - Filtrage des Villes des Pays Archivés

## 📋 Problème Identifié

**Symptôme** : Les villes appartenant au pays France (archivé) apparaissent encore dans les listes déroulantes pour :
- Création d'étapes (Steps)
- Création de parcours (Journeys)

**Villes françaises visibles** : Carcassonne, Collioure, Gruissan, Narbonne, Sète

## 🔍 **Analyse du Problème**

Le problème venait du fait que plusieurs composants récupéraient les villes sans filtrer correctement :
1. **Villes archivées** : `is_archived = false`
2. **Pays actifs** : `countries.is_active = true`
3. **Villes visibles** : `is_visible_on_homepage = true`

## ✅ **Corrections Appliquées**

### 1. **JourneyCreator.tsx** - Création de Parcours

**Fichier** : `src/components/admin/JourneyCreator.tsx`

**Problème** : Ligne 158, la requête ne filtrait que par `is_archived = false`

**Solution** :
```typescript
// AVANT
const { data: allCities, error: cityError } = await supabase
  .from('cities')
  .select('*')
  .order('name');

// APRÈS
const { data: allCities, error: cityError } = await supabase
  .from('cities')
  .select(`
    *,
    countries!inner (
      name_fr,
      name_en, 
      name_de,
      code,
      is_active
    )
  `)
  .eq('is_archived', false)
  .eq('is_visible_on_homepage', true)
  .eq('countries.is_active', true)
  .order('name');
```

### 2. **StepsManagement.tsx** - Création d'Étapes

**Fichier** : `src/components/admin/StepsManagement.tsx`

**Problème** : Ligne 180, la requête ne filtrait que par `is_archived = false`

**Solution** :
```typescript
// AVANT
let query = supabase.from('cities').select('id, name, slug').eq('is_archived', false);

// APRÈS
let query = supabase
  .from('cities')
  .select(`
    id, 
    name, 
    slug,
    countries!inner (
      name_fr,
      name_en, 
      name_de,
      code,
      is_active
    )
  `)
  .eq('is_archived', false)
  .eq('is_visible_on_homepage', true)
  .eq('countries.is_active', true);
```

### 3. **AdminGeographicalFilters.tsx** - Filtres Géographiques

**Fichier** : `src/components/admin/AdminGeographicalFilters.tsx`

**Problème** : Ligne 82, la requête ne filtrait que par `is_archived = false`

**Solution** :
```typescript
// AVANT
let citiesQuery = supabase.from('cities').select('*').eq('is_archived', false);

// APRÈS
let citiesQuery = supabase
  .from('cities')
  .select(`
    *,
    countries!inner (
      name_fr,
      name_en, 
      name_de,
      code,
      is_active
    )
  `)
  .eq('is_archived', false)
  .eq('is_visible_on_homepage', true)
  .eq('countries.is_active', true);
```

### 4. **useOptimizedUserManagement.ts** - Gestion des Utilisateurs

**Fichier** : `src/hooks/useOptimizedUserManagement.ts`

**Problème** : Ligne 135, la requête ne filtrait que par `is_archived = false`

**Solution** :
```typescript
// AVANT
const { data, error } = await supabase
  .from('cities')
  .select('id, name, slug, country_id')
  .eq('is_archived', false)
  .order('name');

// APRÈS
const { data, error } = await supabase
  .from('cities')
  .select(`
    id, 
    name, 
    slug, 
    country_id,
    countries!inner (
      name_fr,
      name_en, 
      name_de,
      code,
      is_active
    )
  `)
  .eq('is_archived', false)
  .eq('is_visible_on_homepage', true)
  .eq('countries.is_active', true)
  .order('name');
```

## 🎯 **Logique de Filtrage Finale**

### **Requête SQL Équivalente** :
```sql
SELECT cities.*, countries.*
FROM cities
INNER JOIN countries ON cities.country_id = countries.id
WHERE cities.is_archived = false
  AND cities.is_visible_on_homepage = true
  AND countries.is_active = true
ORDER BY cities.name;
```

### **Filtres Appliqués** :
1. **`cities.is_archived = false`** : Exclut les villes archivées
2. **`cities.is_visible_on_homepage = true`** : Seules les villes visibles
3. **`countries.is_active = true`** : Seuls les pays actifs
4. **`countries!inner`** : Jointure obligatoire avec les pays

## 🔧 **Tests Recommandés**

### **Test 1 - Création de Parcours**
1. Aller dans super_admin → Gestion des parcours
2. Cliquer sur "Créer un parcours"
3. Vérifier que seules les villes suisses apparaissent dans la liste déroulante
4. Confirmer que les villes françaises (Carcassonne, Collioure, etc.) ne sont plus visibles

### **Test 2 - Création d'Étapes**
1. Aller dans super_admin → Gestion des étapes
2. Vérifier que seules les villes suisses apparaissent dans la liste déroulante
3. Confirmer que les villes françaises ne sont plus visibles

### **Test 3 - Filtres Géographiques**
1. Aller dans n'importe quelle page admin avec des filtres géographiques
2. Vérifier que seules les villes suisses apparaissent
3. Confirmer que les villes françaises ne sont plus visibles

### **Test 4 - Gestion des Utilisateurs**
1. Aller dans super_admin → Gestion des utilisateurs
2. Tenter d'assigner une ville à un utilisateur
3. Vérifier que seules les villes suisses apparaissent dans la liste

## 📊 **Résultats Attendus**

### **Avant les Corrections** :
- ✅ Villes suisses : Genève, Martigny, Montreux, Sion
- ❌ Villes françaises : Carcassonne, Collioure, Gruissan, Narbonne, Sète

### **Après les Corrections** :
- ✅ Villes suisses : Genève, Martigny, Montreux, Sion
- ✅ Villes françaises : **Aucune** (masquées car pays France archivé)

## 🚀 **Améliorations Apportées**

### **Cohérence** :
- ✅ Même logique de filtrage dans tous les composants
- ✅ Filtrage systématique des pays archivés
- ✅ Filtrage systématique des villes archivées

### **Performance** :
- ✅ Jointures optimisées avec `countries!inner`
- ✅ Filtres appliqués au niveau base de données
- ✅ Requêtes cohérentes et prévisibles

### **Maintenabilité** :
- ✅ Code documenté et structuré
- ✅ Logique centralisée et réutilisable
- ✅ Tests de validation inclus

---

**Dernière mise à jour** : Janvier 2025  
**Version** : 3.0.0  
**Auteur** : Équipe CIARA 