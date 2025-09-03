# 🔍 DIAGNOSTIC COMPLET DU SYSTÈME EMAIL RESEND

## 🚨 **PROBLÈME IDENTIFIÉ**
**Vous ne recevez plus d'emails de l'application CIARA malgré `RESEND_API_KEY` configuré.**

---

## 🔧 **ÉTAPES DE DIAGNOSTIC**

### **Étape 1 : Vérifier la configuration Resend dans Supabase**

#### **1.1 Vérifier les variables d'environnement**
1. **Allez dans** [Supabase Dashboard](https://supabase.com/dashboard)
2. **Sélectionnez** votre projet `ciara-game-explorer`
3. **Menu gauche** → **"Settings"**
4. **Cliquez** sur **"Edge Functions"**
5. **Section "Environment Variables"** → Vérifiez que `RESEND_API_KEY` est présente

#### **1.2 Vérifier la clé Resend**
1. **Allez sur** [Resend Dashboard](https://resend.com/api-keys)
2. **Vérifiez** que votre clé API est active
3. **Vérifiez** que vous n'avez pas dépassé la limite (100 emails/jour gratuit)

---

### **Étape 2 : Tester les fonctions Edge Functions individuellement**

#### **2.1 Tester `send-email-confirmation`**
```bash
# Via Supabase Dashboard → Edge Functions → send-email-confirmation → Test
{
  "email": "test@example.com",
  "confirmationUrl": "https://ciara.city/auth/callback?test=true",
  "name": "Test User"
}
```

#### **2.2 Tester `send-welcome-ciara`**
```bash
# Via Supabase Dashboard → Edge Functions → send-welcome-ciara → Test
{
  "userName": "Test User",
  "email": "test@example.com",
  "loginUrl": "https://ciara.city/auth"
}
```

---

### **Étape 3 : Vérifier les logs du webhook**

#### **3.1 Vérifier les logs du webhook `auth-webhook`**
1. **Supabase Dashboard** → **Edge Functions** → **auth-webhook**
2. **Cliquez** sur **"Logs"**
3. **Regardez** les logs récents pour voir :
   - ✅ "Profile created successfully"
   - ✅ "Lien de confirmation généré"
   - ❌ "Erreur envoi email via Resend"

#### **3.2 Vérifier les logs des fonctions d'email**
1. **Supabase Dashboard** → **Edge Functions** → **send-email-confirmation** → **Logs**
2. **Supabase Dashboard** → **Edge Functions** → **send-welcome-ciara** → **Logs**

---

### **Étape 4 : Vérifier la configuration des emails dans Supabase**

#### **4.1 Vérifier les templates d'email**
1. **Supabase Dashboard** → **Authentication** → **Email Templates**
2. **Vérifiez** que les templates sont configurés
3. **Vérifiez** que SMTP est configuré (si utilisé)

#### **4.2 Vérifier les redirections**
1. **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. **Vérifiez** que `https://ciara.city/auth/callback` est dans les URLs autorisées

---

## 🚀 **SOLUTIONS POSSIBLES**

### **Solution 1 : Redéployer le webhook**
```bash
# Dans votre terminal
cd supabase
supabase functions deploy auth-webhook
```

### **Solution 2 : Vérifier la clé Resend**
1. **Générez une nouvelle clé API** sur [Resend](https://resend.com/api-keys)
2. **Mettez à jour** `RESEND_API_KEY` dans Supabase Dashboard
3. **Redéployez** les fonctions

### **Solution 3 : Tester avec un email simple**
1. **Créez un compte test** avec une vraie adresse email
2. **Vérifiez** les logs en temps réel
3. **Vérifiez** votre boîte de réception et spam

---

## 📋 **CHECKLIST DE VÉRIFICATION**

- [ ] `RESEND_API_KEY` configuré dans Supabase Dashboard
- [ ] Clé Resend active et valide
- [ ] Webhook `auth-webhook` redéployé
- [ ] Fonctions `send-email-confirmation` et `send-welcome-ciara` redéployées
- [ ] Logs du webhook consultés
- [ ] Test d'inscription effectué
- [ ] Emails reçus (vérifier spam)

---

## 🔍 **COMMANDES DE DIAGNOSTIC**

### **Redéployer toutes les fonctions**
```bash
cd supabase
supabase functions deploy auth-webhook
supabase functions deploy send-email-confirmation
supabase functions deploy send-welcome-ciara
```

### **Vérifier le statut des fonctions**
```bash
supabase functions list
```

---

## 📞 **SUPPORT**

Si le problème persiste après ces vérifications :
1. **Vérifiez** les logs Resend sur [Resend Dashboard](https://resend.com/activity)
2. **Contactez** le support Resend si nécessaire
3. **Vérifiez** que votre domaine est vérifié sur Resend

---

**🎯 OBJECTIF : Restaurer le système d'emails automatiques complet !**

