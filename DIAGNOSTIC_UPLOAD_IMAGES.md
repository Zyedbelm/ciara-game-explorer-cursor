# 🔍 Diagnostic - Problème d'Upload d'Images

## 🚨 Problème Identifié

**Symptôme** : Les images uploadées dans l'espace admin pour Sion et Martigny ne s'affichent pas sur la homepage et la page /cities.

## 🔍 Analyse du Problème

### 1. **Vérification de la Base de Données**

**État actuel** :
```sql
SELECT id, name, slug, hero_image_url 
FROM cities 
WHERE name IN ('Sion', 'Martigny');

-- Résultat :
-- Martigny: hero_image_url = null
-- Sion: hero_image_url = null
```

**Problème** : Les images uploadées ne sont pas sauvegardées dans la base de données.

### 2. **Correction Appliquée**

**Problème identifié** : Dans `CityManagement.tsx`, le champ `hero_image_url` n'était pas inclus dans `cityData` lors de la sauvegarde.

**Correction appliquée** :
```typescript
// AVANT
const cityData = {
  name: data.name,
  slug: data.slug,
  // ... autres champs
  is_visible_on_homepage: data.is_visible_on_homepage,
  // hero_image_url manquant !
};

// APRÈS
const cityData = {
  name: data.name,
  slug: data.slug,
  // ... autres champs
  is_visible_on_homepage: data.is_visible_on_homepage,
  hero_image_url: data.hero_image_url || null, // ✅ Ajouté
};
```

### 3. **Configuration du Bucket Supabase Storage**

**Bucket "cities" créé** :
- ✅ Bucket existe et est configuré
- ✅ Accepte les types MIME : image/jpeg, image/png, image/webp, image/svg+xml
- ✅ Taille limite : 10MB
- ✅ Public : true

## 🧪 Tests de Validation

### **Test 1 : Upload d'Image via l'Espace Admin**

1. **Aller dans l'espace admin**
2. **Modifier la ville Martigny**
3. **Uploader une image de couverture**
4. **Sauvegarder**
5. **Vérifier dans la base de données** :
   ```sql
   SELECT hero_image_url FROM cities WHERE name = 'Martigny';
   ```
6. **Vérifier sur la homepage** : L'image uploadée doit s'afficher

### **Test 2 : Vérification de la Fonction getCityImage**

La fonction `getCityImage` dans `cityImageHelpers.ts` :
```typescript
export function getCityImage(cityData: {
  hero_image_url?: string | null;
  name: string;
  slug?: string;
}): string {
  // 1. Priorité : Image uploadée dans la base de données
  if (cityData.hero_image_url && cityData.hero_image_url.trim() !== '') {
    // Vérifier si c'est une URL Supabase Storage
    if (cityData.hero_image_url.includes('supabase.co')) {
      return cityData.hero_image_url; // ✅ Retourne l'image uploadée
    }
    // Si c'est une URL externe, l'utiliser directement
    if (cityData.hero_image_url.startsWith('http')) {
      return cityData.hero_image_url; // ✅ Retourne l'image uploadée
    }
  }
  
  // 2. Fallback vers les images par défaut
  // ...
}
```

## 🔧 Prochaines Étapes

### **1. Test Immédiat**
```bash
# 1. Redémarrer le serveur de développement
npm run dev

# 2. Aller sur http://localhost:8085/
# 3. Tester l'upload d'image pour Martigny
# 4. Vérifier que l'image s'affiche
```

### **2. Vérification des Logs**
- Ouvrir les DevTools (F12)
- Aller dans l'onglet Console
- Uploader une image et vérifier les logs d'erreur

### **3. Debug du Composant FileUpload**
Si le problème persiste, vérifier :
- Les permissions du bucket Supabase Storage
- Les politiques RLS (Row Level Security)
- Les logs d'erreur dans la console

## 📊 État Actuel

### **Corrections Appliquées** :
- ✅ Champ `hero_image_url` ajouté à `cityData` dans `onSubmit`
- ✅ Bucket "cities" créé et configuré
- ✅ Fonction `getCityImage` optimisée

### **À Tester** :
- ⏳ Upload d'image via l'espace admin
- ⏳ Affichage sur la homepage
- ⏳ Affichage sur la page /cities

## 🎯 Résultat Attendu

Après les corrections :
1. **Upload d'image** : L'image est sauvegardée dans `hero_image_url`
2. **Affichage** : L'image uploadée s'affiche sur la homepage et /cities
3. **Fallback** : Si pas d'image, une image par défaut s'affiche

---

**Dernière mise à jour** : Janvier 2025  
**Version** : 2.5.0  
**Auteur** : Équipe CIARA 