# 🚀 RESTAURATION COMPLÈTE DU SYSTÈME EMAIL CIARA

## 🚨 **SITUATION ACTUELLE**
**TOUS les emails sont cassés :**
- ❌ Confirmation d'inscription
- ❌ Bienvenue après confirmation  
- ❌ Réinitialisation mot de passe
- ❌ Magic Link
- ❌ Emails partenaires (offres, bons, etc.)

---

## 🔧 **SOLUTION COMPLÈTE EN 5 ÉTAPES**

### **ÉTAPE 1 : Redéployer TOUTES les fonctions (CRITIQUE)**

```bash
# Dans votre terminal, depuis la racine du projet
cd supabase

# Redéployer TOUTES les fonctions d'email
supabase functions deploy auth-webhook
supabase functions deploy send-email-confirmation
supabase functions deploy send-welcome-ciara
supabase functions deploy send-password-reset
supabase functions deploy send-magic-link
supabase functions deploy send-partner-offer-notification
supabase functions deploy send-reward-notification
supabase functions deploy send-reward-redemption
supabase functions deploy send-partner-welcome
supabase functions deploy send-new-rewards-notification
supabase functions deploy send-journey-completion
supabase functions deploy send-contact-form
supabase functions deploy send-inactive-reminder
supabase functions deploy send-inactive-reminder-automated
supabase functions deploy send-package-inquiry
supabase functions deploy send-security-alert
```

**⚠️ IMPORTANT :** Cette étape est CRITIQUE car les fonctions ont été modifiées mais pas redéployées.

---

### **ÉTAPE 2 : Vérifier la configuration Resend**

#### **2.1 Dans Supabase Dashboard**
1. **Allez dans** [Supabase Dashboard](https://supabase.com/dashboard)
2. **Sélectionnez** votre projet `ciara-game-explorer`
3. **Menu gauche** → **"Settings"**
4. **Cliquez** sur **"Edge Functions"**
5. **Section "Environment Variables"** → Vérifiez `RESEND_API_KEY`

#### **2.2 Dans Resend Dashboard**
1. **Allez sur** [Resend Dashboard](https://resend.com/api-keys)
2. **Vérifiez** que votre clé API est active
3. **Vérifiez** que vous n'avez pas dépassé la limite (100 emails/jour)

---

### **ÉTAPE 3 : Tester chaque fonction individuellement**

#### **3.1 Test de base : send-email-confirmation**
```json
{
  "email": "votre-email@example.com",
  "confirmationUrl": "https://ciara.city/auth/callback?test=true",
  "name": "Test User"
}
```

#### **3.2 Test : send-welcome-ciara**
```json
{
  "userName": "Test User",
  "email": "votre-email@example.com",
  "loginUrl": "https://ciara.city/auth"
}
```

#### **3.3 Test : send-password-reset**
```json
{
  "email": "votre-email@example.com",
  "resetUrl": "https://ciara.city/reset-password?test=true",
  "name": "Test User"
}
```

#### **3.4 Test : send-partner-offer-notification**
```json
{
  "partnerEmail": "votre-email@example.com",
  "partnerName": "Test Partner",
  "offerDetails": "Test offer",
  "cityName": "Test City"
}
```

---

### **ÉTAPE 4 : Vérifier les logs en temps réel**

#### **4.1 Logs du webhook principal**
1. **Supabase Dashboard** → **Edge Functions** → **auth-webhook** → **Logs**
2. **Gardez** cette page ouverte pendant les tests

#### **4.2 Logs de chaque fonction**
- **send-email-confirmation** → **Logs**
- **send-welcome-ciara** → **Logs**
- **send-password-reset** → **Logs**
- **send-partner-offer-notification** → **Logs**

---

### **ÉTAPE 5 : Test d'inscription complet**

#### **5.1 Créer un compte test**
1. **Allez sur** [https://ciara.city/auth](https://ciara.city/auth)
2. **Onglet "Sign Up"**
3. **Entrez** une vraie adresse email
4. **Remplissez** le formulaire
5. **Cliquez** sur **"Sign Up"**

#### **5.2 Surveiller TOUS les logs**
- **Webhook** : Création du profil
- **send-email-confirmation** : Email de confirmation
- **send-welcome-ciara** : Email de bienvenue (après confirmation)

---

## 🔍 **DIAGNOSTIC DES PROBLÈMES COMMUNS**

### **Problème 1 : "Function not found"**
**Cause :** Fonction non déployée
**Solution :** Redéployer la fonction spécifique

### **Problème 2 : "Invalid API key"**
**Cause :** Clé Resend invalide
**Solution :** Régénérer la clé sur [Resend](https://resend.com/api-keys)

### **Problème 3 : "Rate limit exceeded"**
**Cause :** Limite de 100 emails/jour dépassée
**Solution :** Attendre le lendemain ou passer au plan payant

### **Problème 4 : "Domain not verified"**
**Cause :** Domaine non vérifié sur Resend
**Solution :** Vérifier le domaine sur [Resend Dashboard](https://resend.com/domains)

---

## 📋 **CHECKLIST DE RESTAURATION COMPLÈTE**

### **Fonctions principales**
- [ ] `auth-webhook` redéployé
- [ ] `send-email-confirmation` redéployé et testé
- [ ] `send-welcome-ciara` redéployé et testé
- [ ] `send-password-reset` redéployé et testé
- [ ] `send-magic-link` redéployé et testé

### **Fonctions partenaires**
- [ ] `send-partner-offer-notification` redéployé et testé
- [ ] `send-reward-notification` redéployé et testé
- [ ] `send-reward-redemption` redéployé et testé
- [ ] `send-partner-welcome` redéployé et testé
- [ ] `send-new-rewards-notification` redéployé et testé

### **Fonctions système**
- [ ] `send-journey-completion` redéployé et testé
- [ ] `send-contact-form` redéployé et testé
- [ ] `send-inactive-reminder` redéployé et testé
- [ ] `send-security-alert` redéployé et testé

---

## 🚨 **SI RIEN NE FONCTIONNE APRÈS TOUT**

### **Solution de dernier recours : Utiliser Supabase natif**
Je peux modifier TOUTES les fonctions pour utiliser les emails natifs Supabase (moins jolis mais fonctionnels).

### **Contact support immédiat**
1. **Resend** : [support@resend.com](mailto:support@resend.com)
2. **Supabase** : [support@supabase.com](mailto:support@supabase.com)

---

## 🎯 **OBJECTIF FINAL**

**Restaurer TOUT le système d'emails en moins de 1 heure :**
- ✅ Inscription → Confirmation → Bienvenue
- ✅ Réinitialisation mot de passe
- ✅ Magic Link
- ✅ Tous les emails partenaires
- ✅ Tous les emails système

---

## ⚡ **COMMANDES RAPIDES**

```bash
# Redéployer tout d'un coup
cd supabase
for func in auth-webhook send-email-confirmation send-welcome-ciara send-password-reset send-magic-link send-partner-offer-notification send-reward-notification send-reward-redemption send-partner-welcome send-new-rewards-notification send-journey-completion send-contact-form send-inactive-reminder send-inactive-reminder-automated send-package-inquiry send-security-alert; do
  echo "Deploying $func..."
  supabase functions deploy $func
done
```

**🎯 COMMENCEZ PAR L'ÉTAPE 1 : Redéployer TOUTES les fonctions !**

