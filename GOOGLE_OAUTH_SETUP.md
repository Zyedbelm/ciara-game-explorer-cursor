# 🔐 Configuration de l'authentification Google OAuth

Ce guide vous explique comment configurer l'authentification Google OAuth pour CIARA.

## 📋 Prérequis

1. Un compte Google Cloud Platform
2. Un projet Supabase configuré
3. Les variables d'environnement configurées

## 🚀 Étapes de configuration

### 1. Configuration Google Cloud Platform

#### 1.1 Créer un projet Google Cloud
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google+ API

#### 1.2 Configurer les identifiants OAuth
1. Dans la console Google Cloud, allez dans **APIs & Services** > **Credentials**
2. Cliquez sur **Create Credentials** > **OAuth 2.0 Client IDs**
3. Sélectionnez **Web application**
4. Configurez les URLs de redirection autorisées :
   ```
   https://ciara.city/auth/callback
   http://localhost:8080/auth/callback
   ```
5. Notez votre **Client ID** et **Client Secret**

### 2. Configuration des variables d'environnement

#### 2.1 Variables locales (.env)
```bash
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### 2.2 Variables Supabase
Dans votre projet Supabase, ajoutez ces variables d'environnement :
```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Configuration Supabase

#### 3.1 Activer l'authentification Google
1. Allez dans votre dashboard Supabase
2. Naviguez vers **Authentication** > **Providers**
3. Activez **Google**
4. Entrez votre Client ID et Client Secret
5. Configurez les URLs de redirection :
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```

#### 3.2 Exécuter la migration
```bash
supabase db push
```

### 4. Test de la configuration

#### 4.1 Test local
1. Démarrez votre application en local
2. Allez sur la page de connexion
3. Cliquez sur "Continuer avec Google"
4. Vérifiez que la redirection fonctionne

#### 4.2 Test en production
1. Déployez votre application
2. Testez la connexion Google sur l'environnement de production

## 🔧 Dépannage

### Problème : "Invalid redirect URI"
- Vérifiez que les URLs de redirection sont correctement configurées dans Google Cloud Console
- Assurez-vous que les URLs correspondent exactement à celles de votre application

### Problème : "Client ID not found"
- Vérifiez que le Client ID est correctement configuré dans Supabase
- Assurez-vous que la variable d'environnement est définie

### Problème : "OAuth consent screen not configured"
- Configurez l'écran de consentement OAuth dans Google Cloud Console
- Ajoutez les scopes nécessaires : `openid`, `email`, `profile`

## 📝 Notes importantes

- Les utilisateurs connectés via Google auront automatiquement un profil créé
- Les informations de profil (nom, email) seront récupérées depuis Google
- L'authentification Google fonctionne en parallèle avec l'authentification email/mot de passe

## 🔒 Sécurité

- Ne partagez jamais votre Client Secret
- Utilisez des variables d'environnement pour stocker les secrets
- Configurez des URLs de redirection restrictives
- Surveillez les tentatives de connexion dans les logs Supabase
