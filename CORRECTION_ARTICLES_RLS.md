# 🔧 CORRECTION POLITIQUES RLS ARTICLES

## 🚨 PROBLÈME IDENTIFIÉ

### **Symptôme :**
- L'article "Découvrez nous !" était visible uniquement par le super admin
- Les utilisateurs avec le rôle `partner` ne pouvaient pas voir cet article
- Problème de politique RLS trop restrictive

### **Cause :**
La politique RLS précédente restreignait l'accès aux articles globaux (`city_id = NULL`) uniquement aux `super_admin` :

```sql
-- ANCIENNE POLITIQUE (PROBLÉMATIQUE)
CREATE POLICY "Public articles viewable by everyone" 
ON articles FOR SELECT 
USING (
  status = 'published' AND (
    city_id IS NOT NULL OR 
    get_current_user_role() = 'super_admin'  -- ❌ Trop restrictif
  )
);
```

## ✅ SOLUTION APPLIQUÉE

### **Nouvelle logique :**
1. **📖 LECTURE** : Tous les utilisateurs peuvent lire tous les articles publiés
2. **✏️ MODIFICATION** : Restreinte selon le rôle

### **Politiques RLS mises en place :**

#### **1. Politique de lecture publique**
```sql
CREATE POLICY "Published articles viewable by everyone" 
ON articles FOR SELECT 
USING (status = 'published');
```

#### **2. Politique de modification - Super admin**
```sql
CREATE POLICY "Super admins can manage all articles" 
ON articles FOR ALL 
USING (get_current_user_role() = 'super_admin')
WITH CHECK (get_current_user_role() = 'super_admin');
```

#### **3. Politique de modification - Tenant admin**
```sql
CREATE POLICY "Tenant admins can manage city articles" 
ON articles FOR ALL 
USING (
  get_current_user_role() = 'tenant_admin' AND 
  city_id = get_user_city_id() AND 
  city_id IS NOT NULL
)
WITH CHECK (
  get_current_user_role() = 'tenant_admin' AND 
  city_id = get_user_city_id() AND 
  city_id IS NOT NULL
);
```

#### **4. Politique de modification - Content manager**
```sql
CREATE POLICY "Content managers can manage city articles" 
ON articles FOR ALL 
USING (
  get_current_user_role() = 'content_manager' AND 
  city_id = get_user_city_id() AND 
  city_id IS NOT NULL
)
WITH CHECK (
  get_current_user_role() = 'content_manager' AND 
  city_id = get_user_city_id() AND 
  city_id IS NOT NULL
);
```

## 🎯 RÉSULTATS ATTENDUS

### **✅ Avant la correction :**
- ❌ Seul le super admin voyait l'article "Découvrez nous !"
- ❌ Les partenaires ne pouvaient pas voir les articles globaux
- ❌ Politique RLS trop restrictive

### **✅ Après la correction :**
- ✅ **Tous les utilisateurs** peuvent lire tous les articles publiés
- ✅ **Super admin** peut créer/modifier tous les articles
- ✅ **Tenant admin** peut créer/modifier uniquement les articles de sa ville
- ✅ **Content manager** peut créer/modifier uniquement les articles de sa ville
- ✅ **Partenaires** peuvent voir tous les articles publiés

## 🔍 VÉRIFICATION

### **Test avec l'article "Découvrez nous !" :**
- **ID** : `6f34e205-168b-4c1d-a9d8-cee9bd884b3d`
- **Titre** : "Découvrez nous !"
- **Slug** : `decouvrez-mous`
- **Type** : Article global (`city_id = NULL`)
- **Statut** : `published`

### **Utilisateurs testés :**
- ✅ **Super admin** : Peut voir et modifier
- ✅ **Partner (hedi.elmeddeb@gmail.com)** : Peut maintenant voir
- ✅ **Tenant admin** : Peut voir, peut modifier ses articles de ville
- ✅ **Content manager** : Peut voir, peut modifier ses articles de ville
- ✅ **Visiteur** : Peut voir tous les articles publiés

## 📋 RÈGLES FINALES

### **📖 Lecture (SELECT) :**
- **Tous les utilisateurs** → Tous les articles publiés
- **Aucune restriction** basée sur le rôle ou la ville

### **✏️ Modification (INSERT/UPDATE/DELETE) :**
- **Super admin** → Tous les articles (globaux + ville)
- **Tenant admin** → Uniquement les articles de sa ville
- **Content manager** → Uniquement les articles de sa ville
- **Partner/Visitor** → Aucune modification

---

**La correction est maintenant appliquée et fonctionnelle !** 🚀
