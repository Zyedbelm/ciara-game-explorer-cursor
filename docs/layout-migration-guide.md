# Guide de Migration des Layouts - Sticky Footer

## 🔍 Problème Résolu

**Avant :** Toutes les pages utilisaient `min-h-screen` mais avaient un espace blanc entre le contenu et le footer quand le contenu était court.

**Après :** Layout flex qui étend automatiquement le contenu principal et colle le footer en bas de page.

## 🎯 Solution Implémentée

### 1. Composants Layout Créés

- **`PageLayout`** : Layout de base avec gestion flex
- **`StandardPageLayout`** : Pages standards avec Header + Contenu + Footer
- **`CenteredPageLayout`** : Pages avec contenu centré (auth, erreurs)
- **`FullPageLayout`** : Contrôle total sur header/footer (landing, destination)

### 2. Structure Flex

```jsx
<div className="min-h-screen bg-background flex flex-col">
  {/* Header (optionnel) */}
  <Header />
  
  {/* Contenu principal - flex-1 prend tout l'espace disponible */}
  <main className="flex-1 flex flex-col">
    <div className="container mx-auto px-4 py-8 flex-1">
      {children} {/* Le contenu s'étend automatiquement */}
    </div>
  </main>
  
  {/* Footer - toujours en bas */}
  <Footer />
</div>
```

## 📋 Migration des Pages

### Pages Déjà Migrées ✅

1. **RewardsPage.tsx** - StandardPageLayout
2. **LegalPage.tsx** - StandardPageLayout

### Pages à Migrer 🔄

**Pages StandardPageLayout :**
- ContactPage.tsx
- CookiesPage.tsx
- PrivacyPage.tsx
- TermsPage.tsx
- FAQPage.tsx
- HelpPage.tsx
- MyRewardsPage.tsx
- ProfilePage.tsx

**Pages CenteredPageLayout :**
- AuthPage.tsx
- ResetPasswordPage.tsx
- NotFound.tsx

**Pages FullPageLayout :**
- Index.tsx (Landing)
- DestinationPage.tsx
- JourneyDetailPage.tsx
- AdminDashboard.tsx
- PartnerDashboard.tsx

## 🔧 Comment Migrer une Page

### Avant (Ancienne Structure)
```jsx
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

const MyPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton title="Mon Titre" />
      <div className="container mx-auto px-4 py-8">
        {/* Contenu */}
      </div>
      <Footer />
    </div>
  );
};
```

### Après (Nouvelle Structure)
```jsx
import { StandardPageLayout } from '@/components/layout';

const MyPage = () => {
  return (
    <StandardPageLayout
      title="Mon Titre"
      showBackButton={true}
      containerClassName="space-y-8" // Classes additionnelles optionnelles
    >
      {/* Contenu - s'étend automatiquement */}
    </StandardPageLayout>
  );
};
```

## 🎨 Classes CSS Importantes

- `flex-1` : Prend tout l'espace disponible
- `min-h-screen` : Hauteur minimale de l'écran
- `flex flex-col` : Layout vertical flex

## ⚡ Avantages

1. **Sticky Footer** : Footer toujours en bas, même avec peu de contenu
2. **Contenu Étendu** : L'espace principal utilise toute la hauteur disponible
3. **Responsive** : Fonctionne sur toutes les tailles d'écran
4. **Réutilisable** : Composants layout standardisés
5. **Maintenance** : Plus facile de modifier le layout global

## 🚀 Prochaines Étapes

1. Migrer toutes les pages restantes
2. Supprimer les anciens patterns `min-h-screen` + Footer manuel
3. Tester sur différents contenus et tailles d'écran
4. Optimiser les layouts spécifiques si nécessaire