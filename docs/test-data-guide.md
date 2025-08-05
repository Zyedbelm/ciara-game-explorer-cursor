# Guide d'utilisation des données de test - CIARA Game Explorer

## Vue d'ensemble

Ce guide explique comment utiliser les données de test complètes pour l'application CIARA Game Explorer. Les données de test fournissent un environnement réaliste pour le développement, les tests et la démonstration de l'application.

## Structure des données de test

### 📁 Fichiers SQL inclus

1. **`20250118000000_comprehensive_test_data.sql`** - Données de test principales
2. **`20250118000001_user_test_data.sql`** - Profils utilisateurs et progression
3. **`20250118000002_clean_test_data.sql`** - Script de nettoyage

### 🏙️ Données incluses

#### Villes touristiques (5 villes)
- **Lausanne** - Capitale olympique avec patrimoine gothique
- **Montreux** - Perle de la Riviera suisse, festival de jazz
- **Gruyères** - Village médiéval, berceau du fromage
- **Zermatt** - Station alpine, vue sur le Cervin
- **Lucerne** - Ville pittoresque, ponts couverts

#### Contenu pour chaque ville
- **5 catégories de parcours** : Patrimoine, Gastronomie, Nature, Art/Culture, Aventure
- **2 parcours par catégorie** : Découverte essentielle et Exploration approfondie
- **4-6 étapes par ville** : Monuments, musées, points de vue, activités
- **6 partenaires par ville** : Hôtels, restaurants, commerces, loisirs
- **4 récompenses par partenaire** : Réductions, cadeaux, surclassements, expériences

#### Contenu interactif
- **Questions de quiz** pour chaque étape
- **Documents de contenu** pour l'IA conversationnelle
- **Progression utilisateur** avec profils de test
- **Rédemptions de récompenses** simulées

## 🚀 Installation des données de test

### Prérequis
- Supabase CLI installé
- Base de données CIARA configurée
- Migrations existantes appliquées

### Étapes d'installation

1. **Appliquer les données de test principales**
   ```bash
   cd supabase
   supabase db reset --local
   # ou
   supabase migration up --local
   ```

2. **Vérifier l'installation**
   ```sql
   -- Vérifier le nombre de villes
   SELECT COUNT(*) FROM public.cities;
   -- Devrait retourner 6 (5 nouvelles + Sion existante)
   
   -- Vérifier les parcours
   SELECT c.name, COUNT(j.id) as journey_count 
   FROM public.cities c 
   LEFT JOIN public.journeys j ON c.id = j.city_id 
   GROUP BY c.name;
   ```

3. **Données utilisateur (optionnel)**
   ```bash
   # Appliquer les profils utilisateur de test
   supabase migration up --local
   ```

## 📊 Utilisation des données

### Développement et tests

#### Accès aux données
```sql
-- Obtenir toutes les villes avec leurs parcours
SELECT 
  c.name as city_name,
  c.slug,
  COUNT(j.id) as journey_count
FROM public.cities c
LEFT JOIN public.journeys j ON c.id = j.city_id
GROUP BY c.id, c.name, c.slug
ORDER BY c.name;

-- Obtenir les étapes d'une ville
SELECT 
  s.name,
  s.type,
  s.points_awarded,
  s.has_quiz
FROM public.steps s
JOIN public.cities c ON s.city_id = c.id
WHERE c.slug = 'lausanne'
ORDER BY s.points_awarded DESC;
```

#### Tests d'API
```javascript
// Exemple de test avec les données de Lausanne
const response = await fetch('/api/cities/lausanne/journeys');
const journeys = await response.json();

// Devrait retourner 10 parcours (5 catégories × 2 parcours)
expect(journeys.length).toBe(10);
```

### Démonstration

#### Parcours recommandés pour démo
1. **Lausanne - Patrimoine Historique** - Parcours complet avec 6 étapes
2. **Montreux - Nature et Paysages** - Vue sur le lac et les Alpes
3. **Gruyères - Gastronomie Locale** - Découverte du fromage et produits locaux

#### Utilisateurs de test
- **marie.dubois@example.com** - Profil culturel, niveau 3
- **jean.martin@example.com** - Profil nature, niveau 5
- **pierre.rousseau@example.com** - Profil aventure, niveau 7

## 🔧 Personnalisation des données

### Ajouter une nouvelle ville
```sql
-- 1. Ajouter la ville
INSERT INTO public.cities (name, slug, description, latitude, longitude, primary_color, secondary_color)
VALUES ('Nouvelle Ville', 'nouvelle-ville', 'Description...', 46.0000, 7.0000, '#FF0000', '#00FF00');

-- 2. Ajouter des catégories
INSERT INTO public.journey_categories (city_id, name, slug, type, difficulty)
SELECT id, 'Patrimoine', 'patrimoine', 'museums', 'medium'
FROM public.cities WHERE slug = 'nouvelle-ville';

-- 3. Suivre le modèle des autres villes...
```

### Modifier les récompenses
```sql
-- Ajouter une récompense spéciale
INSERT INTO public.rewards (partner_id, title, description, type, points_required, value_chf)
SELECT 
  p.id,
  'Récompense Spéciale',
  'Description personnalisée',
  'discount',
  200,
  30.0
FROM public.partners p
WHERE p.name LIKE '%Restaurant%';
```

## 🧹 Nettoyage des données

### Supprimer toutes les données de test
```bash
# Utiliser le script de nettoyage
supabase db reset --local
# puis appliquer seulement les migrations de base
```

### Supprimer des données spécifiques
```sql
-- Supprimer une ville et toutes ses données
DELETE FROM public.cities WHERE slug = 'ville-a-supprimer';
-- Les suppressions en cascade s'appliquent automatiquement
```

## 📈 Métriques et analytiques

### Données disponibles pour les tests analytiques
- **250+ étapes** réparties sur 5 villes
- **50+ parcours** avec différentes difficultés
- **150+ partenaires** dans diverses catégories
- **600+ récompenses** de différents types
- **Profils utilisateur** avec historique de progression

### Requêtes d'analyse
```sql
-- Statistiques par ville
SELECT 
  c.name,
  COUNT(DISTINCT j.id) as journeys,
  COUNT(DISTINCT s.id) as steps,
  COUNT(DISTINCT p.id) as partners,
  COUNT(DISTINCT r.id) as rewards
FROM public.cities c
LEFT JOIN public.journeys j ON c.id = j.city_id
LEFT JOIN public.steps s ON c.id = s.city_id
LEFT JOIN public.partners p ON c.id = p.city_id
LEFT JOIN public.rewards r ON p.id = r.partner_id
GROUP BY c.id, c.name
ORDER BY c.name;
```

## 🔒 Sécurité et bonnes pratiques

### Environnements
- **Développement** : Utilisez toutes les données de test
- **Staging** : Données de test partielles
- **Production** : Jamais de données de test

### Sauvegarde
```bash
# Sauvegarder avant d'appliquer les données de test
supabase db dump --local > backup_before_test_data.sql

# Restaurer si nécessaire
supabase db reset --local
psql -d postgresql://... -f backup_before_test_data.sql
```

## 📞 Support et contribution

### Signaler un problème
1. Vérifiez que les migrations de base sont appliquées
2. Consultez les logs Supabase
3. Créez un issue avec les détails de l'erreur

### Contribuer
1. Ajoutez des données réalistes
2. Respectez le format existant
3. Testez les nouvelles données
4. Documentez les changements

## 📚 Ressources additionnelles

- [Documentation Supabase](https://supabase.com/docs)
- [Guide des migrations](https://supabase.com/docs/guides/cli/local-development)
- [Politique de sécurité RLS](https://supabase.com/docs/guides/auth/row-level-security)

---

*Ce guide est maintenu par l'équipe de développement CIARA. Dernière mise à jour : Janvier 2025*