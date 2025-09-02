# 🎯 Configuration des Templates d'Emails Supabase

## 📋 **OBJECTIF**
Configurer les templates d'emails personnalisés pour Magic Link et Reset Password directement dans Supabase Dashboard.

---

## 🚀 **ÉTAPES DE CONFIGURATION**

### **1. Accéder aux Templates d'Emails**
1. **Ouvrez** [Supabase Dashboard](https://supabase.com/dashboard)
2. **Sélectionnez** votre projet `ciara-game-explorer`
3. **Menu gauche** → **"Authentication"**
4. **Onglet** → **"Email Templates"**

### **2. Configurer le Template Magic Link**
1. **Section** → **"Magic Link"**
2. **Sujet** → `🔗 Lien magique de connexion CIARA | Magic login link`
3. **Contenu HTML** → Copiez le contenu de `email-templates/magic-link.html`
4. **Cliquez** → **"Save"**

### **3. Configurer le Template Reset Password**
1. **Section** → **"Recovery"**
2. **Sujet** → `🔒 Réinitialiser votre mot de passe CIARA | Reset your CIARA password`
3. **Contenu HTML** → Copiez le contenu de `email-templates/reset-password.html`
4. **Cliquez** → **"Save"**

---

## 📧 **TEMPLATES DISPONIBLES**

### **Magic Link Template**
- **Fichier** : `email-templates/magic-link.html`
- **Fonction** : Connexion automatique via email
- **Redirection** : `/profile` (connecté automatiquement)

### **Reset Password Template**
- **Fichier** : `email-templates/reset-password.html`
- **Fonction** : Réinitialisation du mot de passe
- **Redirection** : `/reset-password` (formulaire de nouveau mot de passe)

---

## ✅ **VÉRIFICATION**

### **Après configuration :**
1. **Testez Magic Link** :
   - Allez sur `/auth` → Onglet "Magic Link"
   - Entrez votre email → "Send Magic Link"
   - Vérifiez l'email reçu (style CIARA personnalisé)
   - Cliquez sur le lien → Redirection vers `/profile`

2. **Testez Reset Password** :
   - Allez sur `/auth` → Onglet "Forgot Password"
   - Entrez votre email → "Send Reset Link"
   - Vérifiez l'email reçu (style CIARA personnalisé)
   - Cliquez sur le lien → Redirection vers `/reset-password`

---

## 🔧 **CONFIGURATION TECHNIQUE**

### **URLs de Redirection Configurées :**
- `https://ciara.city/profile` (Magic Link)
- `https://ciara.city/reset-password` (Reset Password)
- `http://localhost:8080/profile` (Développement)
- `http://localhost:8080/reset-password` (Développement)

### **Fonctions Frontend :**
- **Magic Link** : `supabase.auth.signInWithOtp()`
- **Reset Password** : `supabase.auth.resetPasswordForEmail()`
- **Redirection automatique** gérée par Supabase

---

## 🎨 **CARACTÉRISTIQUES DES TEMPLATES**

### **Design CIARA :**
- **Header** : Dégradé bleu-violet avec logo CIARA
- **Icônes** : 🔗 pour Magic Link, 🔒 pour Reset Password
- **Couleurs** : Palette CIARA (bleu, violet, orange)
- **Responsive** : Optimisé mobile et desktop
- **Bilingue** : Français + Anglais

### **Sécurité :**
- **Expiration** : 1 heure
- **Messages** : Avertissements de sécurité
- **Conseils** : Bonnes pratiques de mots de passe

---

## 🚨 **DÉPANNAGE**

### **Si les emails ne s'envoient pas :**
1. **Vérifiez** que SMTP est désactivé dans Supabase
2. **Confirmez** que les templates sont sauvegardés
3. **Testez** avec un email valide

### **Si les redirections ne fonctionnent pas :**
1. **Vérifiez** les URLs dans `supabase/config.toml`
2. **Confirmez** que la configuration est poussée
3. **Testez** en local puis en production

---

## 📝 **NOTES IMPORTANTES**

- **Aucun webhook personnalisé** n'est nécessaire
- **Supabase gère** automatiquement les sessions et tokens
- **Les templates** sont stockés dans Supabase (pas de fichiers externes)
- **La configuration** est automatiquement propagée

---

## 🎯 **RÉSULTAT ATTENDU**

✅ **Magic Link** → Email personnalisé CIARA → Connexion automatique vers `/profile`
✅ **Reset Password** → Email personnalisé CIARA → Formulaire vers `/reset-password`
✅ **Aucune erreur 500** ou 404
✅ **Système d'authentification** entièrement natif et robuste
