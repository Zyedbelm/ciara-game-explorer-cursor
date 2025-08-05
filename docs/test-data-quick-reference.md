# Référence rapide - Données de test CIARA

## 🚀 Commandes essentielles

```bash
# Installer les données de test
cd supabase
supabase migration up --local

# Nettoyer les données de test
supabase db reset --local

# Vérifier l'installation
supabase db shell --local
```

## 📊 Données disponibles

### Villes (6 total)
- **Sion** (existante) - Capitale du Valais
- **Lausanne** - Capitale olympique
- **Montreux** - Riviera suisse
- **Gruyères** - Village médiéval
- **Zermatt** - Station alpine
- **Lucerne** - Ponts couverts

### Volumes de données
- **50 parcours** (10 par ville)
- **28 étapes** (4-6 par ville)
- **30 partenaires** (6 par ville)
- **120 récompenses** (4 par partenaire)
- **Questions de quiz** pour toutes les étapes
- **Documents de contenu** pour l'IA

## 🔍 Requêtes utiles

### Vérification rapide
```sql
-- Compter les données par ville
SELECT 
  c.name,
  COUNT(DISTINCT j.id) as journeys,
  COUNT(DISTINCT s.id) as steps,
  COUNT(DISTINCT p.id) as partners
FROM public.cities c
LEFT JOIN public.journeys j ON c.id = j.city_id
LEFT JOIN public.steps s ON c.id = s.city_id
LEFT JOIN public.partners p ON c.id = p.city_id
GROUP BY c.name
ORDER BY c.name;
```

### Parcours de test recommandés
```sql
-- Parcours avec le plus d'étapes
SELECT 
  c.name as city,
  j.name as journey,
  COUNT(js.step_id) as steps
FROM public.journeys j
JOIN public.cities c ON j.city_id = c.id
JOIN public.journey_steps js ON j.id = js.journey_id
GROUP BY c.name, j.name
ORDER BY steps DESC
LIMIT 5;
```

## 👥 Utilisateurs de test

### Profils disponibles
- **marie.dubois@example.com** - Culturel, niveau 3
- **jean.martin@example.com** - Nature, niveau 5
- **pierre.rousseau@example.com** - Aventure, niveau 7
- **admin@lausanne.ch** - Administrateur

### UUID des utilisateurs
```sql
-- Récupérer les UUID des utilisateurs de test
SELECT user_id, email, first_name, role 
FROM public.profiles 
WHERE email LIKE '%@example.com' OR email LIKE '%@lausanne.ch';
```

## 🎯 Tests recommandés

### Frontend
1. **Navigation** : Parcourir les villes et parcours
2. **Quiz** : Tester les questions interactives
3. **Récompenses** : Vérifier l'affichage des partenaires
4. **Progression** : Simuler la progression utilisateur

### API
1. **GET /cities** - Devrait retourner 6 villes
2. **GET /cities/{slug}/journeys** - 10 parcours par ville
3. **GET /journeys/{id}/steps** - 4-6 étapes par parcours
4. **GET /partners** - 30 partenaires au total

## 🔧 Personnalisation

### Ajouter des données
```sql
-- Nouvelle ville
INSERT INTO public.cities (name, slug, description, latitude, longitude)
VALUES ('Ma Ville', 'ma-ville', 'Description', 46.0, 7.0);

-- Nouvelle étape
INSERT INTO public.steps (city_id, name, description, latitude, longitude, type, points_awarded)
SELECT id, 'Nouvelle Étape', 'Description', 46.0, 7.0, 'monument', 20
FROM public.cities WHERE slug = 'ma-ville';
```

### Modifier les récompenses
```sql
-- Augmenter les points requis
UPDATE public.rewards 
SET points_required = points_required * 1.5
WHERE type = 'discount';
```

## 🧹 Nettoyage

### Supprimer des données spécifiques
```sql
-- Supprimer une ville et ses données
DELETE FROM public.cities WHERE slug = 'ville-a-supprimer';
-- Les suppressions en cascade s'appliquent automatiquement
```

### Reset complet
```bash
# Attention : supprime toutes les données
supabase db reset --local
```

## 📈 Métriques

### Statistiques globales
```sql
SELECT 
  'Cities' as entity, COUNT(*) as count FROM public.cities
UNION ALL
SELECT 'Journeys', COUNT(*) FROM public.journeys
UNION ALL
SELECT 'Steps', COUNT(*) FROM public.steps
UNION ALL
SELECT 'Partners', COUNT(*) FROM public.partners
UNION ALL
SELECT 'Rewards', COUNT(*) FROM public.rewards;
```

### Contrôle qualité
```sql
-- Vérifier les relations
SELECT 
  'Journeys without steps' as check,
  COUNT(*) as count
FROM public.journeys j
LEFT JOIN public.journey_steps js ON j.id = js.journey_id
WHERE js.journey_id IS NULL;
```

## 🚨 Dépannage

### Erreurs communes
1. **Migration failed** : Vérifiez que les migrations de base sont appliquées
2. **Foreign key constraint** : Vérifiez l'ordre des insertions
3. **Duplicate key** : Utilisez `ON CONFLICT DO NOTHING` si nécessaire

### Vérification de santé
```sql
-- Vérifier l'intégrité des données
SELECT 
  COUNT(*) as total_cities,
  COUNT(CASE WHEN slug IS NOT NULL THEN 1 END) as cities_with_slug,
  COUNT(CASE WHEN latitude IS NOT NULL THEN 1 END) as cities_with_location
FROM public.cities;
```

---

*Référence mise à jour : Janvier 2025*