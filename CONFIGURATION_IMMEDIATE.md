# 🚀 CONFIGURATION IMMÉDIATE DU SYSTÈME HYBRIDE AUTH

## ⚡ **CONFIGURATION RAPIDE (5 minutes)**

### **1. Créer le Webhook (CRITIQUE)**

#### **Étape 1 : Aller dans Supabase Dashboard**
1. **Ouvrez** [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Sélectionnez** votre projet `ciara-game-explorer`
3. **Menu gauche** → **"PLATFORM"**
4. **Cliquez** sur **"Webhooks"**

#### **Étape 2 : Créer le Hook de Profil**
1. **Cliquez** sur **"Create a new hook"**
2. **Configuration :**
   - **Name** : `auth_profile_creation`
   - **Table** : `auth.users`
   - **Events** : ✅ **INSERT** (cocher seulement)
   - **Function** : `auth-webhook`
   - **HTTP Method** : `POST`
3. **Cliquez** sur **"Create hook"**

### **2. Configurer les Templates d'Emails**

#### **Étape 1 : Aller dans Authentication → Email Templates**
1. **Menu gauche** → **"Authentication"**
2. **Onglet** → **"Email Templates"**

#### **Étape 2 : Configurer Magic Link**
1. **Section "Magic Link"** → **"Edit"**
2. **Subject** : `🔗 Lien magique de connexion CIARA | Magic login link`
3. **Content** : Copiez le contenu de `magic-link-template-for-copy.txt`
4. **Cliquez "Save"**

#### **Étape 3 : Configurer Reset Password**
1. **Section "Recovery"** → **"Edit"**
2. **Subject** : `🔒 Réinitialiser votre mot de passe CIARA | Reset your CIARA password`
3. **Content** : Copiez le contenu de `reset-password-template-for-copy.txt`
4. **Cliquez "Save"**

### **3. Test Immédiat**

#### **Test d'inscription :**
- **Allez sur** `/auth` → Onglet "Sign Up"
- **Remplissez** le formulaire
- **Vérifiez** que le profil est créé automatiquement

#### **Test Magic Link :**
- **Onglet "Magic Link"** → Entrez votre email
- **Vérifiez** l'email reçu (style CIARA personnalisé)
- **Cliquez** sur le lien → Redirection vers `/profile`

#### **Test Reset Password :**
- **Onglet "Forgot Password"** → Entrez votre email
- **Vérifiez** l'email reçu (style CIARA personnalisé)
- **Cliquez** sur le lien → Redirection vers `/reset-password`

## ✅ **RÉSULTAT ATTENDU**

**Après configuration :**
1. **Inscription** → ✅ Fonctionne (webhook crée le profil)
2. **Magic Link** → ✅ Fonctionne (email natif Supabase)
3. **Reset Password** → ✅ Fonctionne (email natif Supabase)
4. **Connexion Google** → ✅ Fonctionne (redirection correcte)

## 🎯 **OBJECTIF FINAL**

**Système d'authentification robuste et élégant :**
- **Inscription** → Webhook crée le profil
- **Magic Link** → Email natif + redirection automatique
- **Reset Password** → Email natif + redirection automatique
- **Connexion Google** → Redirection OAuth correcte
- **Maintenance** → Minimale et fiable

**Configurez maintenant et testez !** 🚀
