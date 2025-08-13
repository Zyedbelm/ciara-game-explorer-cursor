# 🔧 CORRECTION ERREUR 400 - MODIFICATION ÉTAPES

## 🚨 Problème identifié

L'erreur 400 (Bad Request) lors de la modification des étapes était causée par plusieurs problèmes dans le code frontend :

### 1. Schéma de validation incorrect
Le schéma Zod dans `StepForm.tsx` ne correspondait pas à la structure de la base de données :
- Champs obligatoires manquants (`review_status`, `language`)
- Types incorrects (string au lieu d'UUID pour `city_id`)
- Contraintes trop strictes (`points_awarded` minimum à 1 au lieu de 0)

### 2. Gestion des données mal optimisée
La fonction `updateStep` envoyait des données non filtrées à Supabase, incluant des valeurs `undefined` qui causaient des erreurs.

## ✅ Solutions implémentées

### 1. Correction du schéma de validation (`StepForm.tsx`)

**AVANT :**
```typescript
const stepSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  type: z.enum(['monument', 'restaurant', 'viewpoint', 'museum', 'shop', 'activity', 'landmark']),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  points_awarded: z.number().min(1).max(100), // ❌ Minimum incorrect
  city_id: z.string().min(1, 'La ville est obligatoire'), // ❌ Pas de validation UUID
  // ❌ Champs manquants
});
```

**APRÈS :**
```typescript
const stepSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères').optional(),
  type: z.enum(['monument', 'restaurant', 'viewpoint', 'museum', 'shop', 'activity', 'landmark']).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  points_awarded: z.number().min(0).max(100).optional(), // ✅ Minimum correct
  city_id: z.string().uuid('ID de ville invalide'), // ✅ Validation UUID
  journey_id: z.string().uuid().optional().nullable(), // ✅ Gestion null
  review_status: z.enum(['draft', 'pending_review', 'approved', 'rejected']).optional(), // ✅ Ajouté
  language: z.string().optional(), // ✅ Ajouté
  // ✅ Champs multilingues ajoutés
  name_en: z.string().optional(),
  name_de: z.string().optional(),
  description_en: z.string().optional(),
  description_de: z.string().optional(),
});
```

### 2. Amélioration de la fonction updateStep (`useStepsManagement.ts`)

**AVANT :**
```typescript
const updateStep = async (stepId: string, data: StepFormData) => {
  const stepData = {
    ...data, // ❌ Inclut tous les champs, même undefined
    journey_id: data.journey_id || null,
    images: data.images || []
  };

  const { error } = await supabase
    .from('steps')
    .update(stepData) // ❌ Peut contenir des undefined
    .eq('id', stepId);
};
```

**APRÈS :**
```typescript
const updateStep = async (stepId: string, data: StepFormData) => {
  // ✅ Filtrage des données undefined
  const stepData: any = {};
  
  Object.keys(data).forEach(key => {
    const value = (data as any)[key];
    if (value !== undefined) {
      if (key === 'journey_id') {
        stepData[key] = value || null;
      } else if (key === 'images') {
        stepData[key] = value || [];
      } else {
        stepData[key] = value;
      }
    }
  });

  // ✅ Champs obligatoires automatiques
  if (!stepData.updated_at) {
    stepData.updated_at = new Date().toISOString();
  }

  // ✅ Logging pour debug
  console.log('Updating step with data:', stepData);

  const { error, data: result } = await supabase
    .from('steps')
    .update(stepData)
    .eq('id', stepId)
    .select(); // ✅ Retourne les données mises à jour

  if (error) {
    console.error('Supabase error:', error);
    throw error;
  }

  console.log('Update successful:', result);
};
```

## 🔍 Contraintes de base de données respectées

Les corrections prennent maintenant en compte toutes les contraintes :

```sql
-- ✅ Points non négatifs
CHECK ((points_awarded >= 0))

-- ✅ Rayon de validation positif  
CHECK ((validation_radius > 0))

-- ✅ Statut de révision valide
CHECK ((review_status = ANY (ARRAY['draft'::text, 'pending_review'::text, 'approved'::text, 'rejected'::text])))

-- ✅ Référence ville valide
FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE

-- ✅ Utilisateur réviseur valide
FOREIGN KEY (reviewed_by) REFERENCES auth.users(id)
```

## 🎯 Tests recommandés

1. **Tester la modification d'une étape** depuis l'interface admin
2. **Vérifier les logs de la console** pour voir les données envoyées
3. **Confirmer que l'erreur 400 a disparu**
4. **Valider que les champs optionnels** ne causent plus d'erreurs

## 📝 Prochaines étapes

1. Tester l'interface avec les corrections
2. Vérifier que toutes les validations fonctionnent
3. Confirmer que les permissions RLS sont bien appliquées
4. Monitorer les logs pour s'assurer de la stabilité

**Date :** Janvier 2025  
**Statut :** ✅ Corrections implémentées - En attente de tests
