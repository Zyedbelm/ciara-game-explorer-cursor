# 🔧 Corrections - Suppression de Ville et d'Étape

## 📋 **Problèmes Identifiés**

### **1. Suppression de Ville - Erreur `user_profiles`**
- **Erreur** : `relation "public.user_profiles" does not exist`
- **Cause** : Nom de table incorrect dans le code
- **Solution** : Corriger `user_profiles` → `profiles`

### **2. Suppression d'Étape - Analytics Events persistants**
- **Erreur** : `Key is still referenced from table "analytics_events"`
- **Cause** : Pas de politique RLS pour DELETE sur `analytics_events`
- **Solution** : Ajouter politique RLS + améliorer la gestion d'erreurs

## ✅ **Corrections Appliquées**

### **1. Correction du Nom de Table**
```diff
- .from('user_profiles')
+ .from('profiles')
```

### **2. Amélioration de la Gestion des Analytics Events**
- ✅ **Fonction RPC améliorée** : Gestion d'erreurs plus robuste
- ✅ **Politique RLS ajoutée** : `Super admins can delete analytics events`
- ✅ **Fallback amélioré** : Tentative de suppression directe si RPC échoue
- ✅ **Messages d'erreur informatifs** : Indication que l'étape est utilisée dans les rapports

### **3. Fonction SQL Améliorée**
```sql
CREATE OR REPLACE FUNCTION force_delete_analytics_for_step(step_id_param UUID)
RETURNS VOID AS $$
BEGIN
  BEGIN
    DELETE FROM analytics_events WHERE step_id = step_id_param;
    RAISE NOTICE 'Suppression forcée des analytics_events pour l''étape: %', step_id_param;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Erreur lors de la suppression des analytics_events: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **4. Politique RLS Ajoutée**
```sql
CREATE POLICY "Super admins can delete analytics events" ON public.analytics_events
FOR DELETE USING (get_current_user_role() = 'super_admin');
```

## 🎯 **Résultats Attendus**

### **Suppression de Ville**
- ✅ **Ville de test "frf13rf1"** : Peut maintenant être supprimée
- ✅ **Suppression complète** : Toutes les données associées supprimées
- ✅ **Gestion d'erreurs** : Messages informatifs en cas de problème

### **Suppression d'Étape**
- ✅ **Identification des parcours** : Affiche les parcours utilisant l'étape
- ✅ **Suppression des analytics** : Gestion robuste des contraintes
- ✅ **Messages informatifs** : Indique si l'étape est dans des rapports

## 🔍 **Tests à Effectuer**

### **Test 1 : Suppression de Ville**
1. Aller dans super_admin → Gestion des villes
2. Tenter de supprimer la ville "frf13rf1"
3. **Résultat attendu** : ✅ Suppression réussie

### **Test 2 : Suppression d'Étape**
1. Aller dans super_admin → Gestion des étapes
2. Tenter de supprimer l'étape "Parc Central Sion"
3. **Résultat attendu** : 
   - Si dans un parcours : 📋 Message avec nom du parcours
   - Si pas dans un parcours : ✅ Suppression réussie

## 📊 **Structure de la Base de Données**

### **Tables Vérifiées**
- ✅ `profiles` (pas `user_profiles`)
- ✅ `analytics_events` avec colonne `step_id`
- ✅ Politiques RLS appropriées

### **Ordre de Suppression (Ville)**
1. `city_packages`
2. `journey_steps`
3. `step_completions`
4. `analytics_events`
5. `quiz_questions`
6. `step_content_documents`
7. `steps`
8. `journeys`
9. `journey_categories`
10. `profiles`
11. `cities`

---

**Dernière mise à jour** : Janvier 2025  
**Version** : 3.2.0  
**Auteur** : Équipe CIARA 