# 🔐 CORRECTION DES PERMISSIONS POUR CITY_ADMIN

## Problème identifié
L'utilisateur super_admin ne pouvait pas modifier les étapes depuis l'interface d'administration. L'erreur 400 était due à des politiques RLS (Row Level Security) incomplètes qui n'incluaient pas le rôle `city_admin`.

## Corrections effectuées

### 1. Fonction `can_manage_city`
```sql
-- AVANT (ne supportait que tenant_admin)
SELECT CASE 
  WHEN get_current_user_role() = 'super_admin' THEN true
  WHEN get_current_user_role() = 'tenant_admin' AND get_user_city_id() = target_city_id THEN true
  ELSE false
END;

-- APRÈS (support de city_admin ajouté)
SELECT CASE 
  WHEN get_current_user_role() = 'super_admin' THEN true
  WHEN get_current_user_role() IN ('tenant_admin', 'city_admin') 
       AND get_user_city_id() = target_city_id THEN true
  ELSE false
END;
```

### 2. Politique RLS pour table `steps`
```sql
-- Politique corrigée pour inclure city_admin
CREATE POLICY "Content managers can manage steps in their city" ON steps
FOR ALL USING (
  CASE 
    WHEN get_current_user_role() = 'super_admin' THEN true
    WHEN get_current_user_role() IN ('tenant_admin', 'content_manager', 'city_admin') 
         AND can_manage_city(city_id) THEN true
    ELSE false
  END
);
```

### 3. Politique RLS pour table `journeys`
```sql
-- Mise à jour pour inclure city_admin
CREATE POLICY "Content managers can manage journeys in their city" ON journeys
FOR ALL USING (
  CASE 
    WHEN get_current_user_role() = 'super_admin' THEN true
    WHEN get_current_user_role() IN ('tenant_admin', 'content_manager', 'city_admin') 
         AND can_manage_city(city_id) THEN true
    ELSE false
  END
);
```

### 4. Politique RLS pour table `cities`
```sql
-- Nouvelle politique pour permettre aux city_admin de modifier leur ville
CREATE POLICY "Admins can modify their city" ON cities
FOR UPDATE USING (
  (get_current_user_role() IN ('tenant_admin', 'city_admin') 
   AND id = get_user_city_id() 
   AND is_archived = false)
);
```

### 5. Politique RLS pour table `documents`
```sql
-- Ajout du support city_admin
CREATE POLICY "Only content managers can modify documents" ON documents
FOR ALL USING (
  get_current_user_role() IN ('super_admin', 'tenant_admin', 'content_manager', 'city_admin')
);
```

### 6. Politique RLS pour table `articles`
```sql
-- Ajout du support city_admin
CREATE POLICY "Content managers can manage city articles" ON articles
FOR ALL USING (
  (get_current_user_role() IN ('content_manager', 'city_admin') 
   AND city_id = get_user_city_id() 
   AND city_id IS NOT NULL)
);
```

## Résultat
✅ Les super_admin peuvent maintenant modifier toutes les étapes
✅ Les city_admin peuvent modifier les étapes de leur ville
✅ Les city_admin peuvent modifier leur ville
✅ Les city_admin peuvent gérer les parcours de leur ville
✅ Les city_admin peuvent gérer les documents et articles de leur ville

## Test effectué
- Modification réussie de l'étape "Fondation Pierre Gianadda" (ID: 9ed4c258-6fcf-4170-a8c5-51239b06f1ae)
- L'erreur 400 est maintenant résolue

## Prochaines étapes recommandées
1. Tester l'interface d'administration avec un compte city_admin
2. Vérifier que les autres tables importantes ont les bonnes permissions
3. Documenter les rôles et permissions dans la documentation utilisateur
