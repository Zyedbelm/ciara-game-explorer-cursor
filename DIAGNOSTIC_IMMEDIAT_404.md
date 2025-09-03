# 🚨 DIAGNOSTIC IMMÉDIAT : ERREUR 404 + PAS D'EMAIL

## 🚨 **PROBLÈMES IDENTIFIÉS**
- ❌ **Pas d'email reçu** lors de l'inscription
- ❌ **Erreur 404** sur la page d'inscription
- ❌ **WebSocket déconnecté** (problème de connexion Supabase)

---

## 🔍 **DIAGNOSTIC IMMÉDIAT EN 3 ÉTAPES**

### **ÉTAPE 1 : Vérifier les logs du webhook (CRITIQUE)**

#### **1.1 Aller dans Supabase Dashboard**
1. **Ouvrez** [https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/functions](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/functions)
2. **Cliquez** sur **"auth-webhook"**
3. **Cliquez** sur **"Logs"**
4. **Gardez** cette page ouverte

#### **1.2 Vérifier les logs récents**
**Regardez** si vous voyez :
- ✅ "Profile created successfully"
- ✅ "Lien de confirmation généré"
- ❌ "Erreur envoi email via Resend"
- ❌ Aucun log (webhook non déclenché)

---

### **ÉTAPE 2 : Vérifier la configuration du webhook**

#### **2.1 Vérifier que le webhook est actif**
1. **Supabase Dashboard** → **Database** → **Hooks**
2. **Cherchez** `auth-webhook` dans la liste
3. **Vérifiez** que le statut est "Active"

#### **2.2 Vérifier les variables d'environnement**
1. **Supabase Dashboard** → **Settings** → **Edge Functions**
2. **Section "Environment Variables"**
3. **Vérifiez** que `RESEND_API_KEY` est présente et non vide

---

### **ÉTAPE 3 : Tester la fonction individuellement**

#### **3.1 Test de send-email-confirmation**
1. **Supabase Dashboard** → **Edge Functions** → **send-email-confirmation**
2. **Cliquez** sur **"Test"**
3. **Entrez** ce JSON :
```json
{
  "email": "votre-email@example.com",
  "confirmationUrl": "https://ciara.city/auth/callback?test=true",
  "name": "Test User"
}
```
4. **Cliquez** sur **"Run"**

---

## 🚨 **PROBLÈMES POSSIBLES ET SOLUTIONS**

### **Problème 1 : Webhook non déclenché**
**Symptôme :** Aucun log dans auth-webhook
**Cause :** Webhook non configuré ou inactif
**Solution :** Vérifier Database → Hooks

### **Problème 2 : Erreur Resend**
**Symptôme :** "Erreur envoi email via Resend" dans les logs
**Cause :** Clé API invalide ou limite dépassée
**Solution :** Vérifier RESEND_API_KEY et limites

### **Problème 3 : Erreur 404 sur la page**
**Symptôme :** "Failed to load resource: 404"
**Cause :** Problème de routage ou de build
**Solution :** Vérifier le déploiement du frontend

---

## 🔧 **SOLUTIONS IMMÉDIATES**

### **Solution 1 : Vérifier le webhook Database**
```sql
-- Exécuter dans Supabase Dashboard → SQL Editor
SELECT * FROM supabase_functions.hooks WHERE name = 'auth-webhook';
```

### **Solution 2 : Redéployer le webhook si nécessaire**
```bash
cd supabase
supabase functions deploy auth-webhook
```

### **Solution 3 : Vérifier les variables d'environnement**
1. **Supabase Dashboard** → **Settings** → **Edge Functions**
2. **Ajouter/Modifier** `RESEND_API_KEY`
3. **Redéployer** toutes les fonctions

---

## 📋 **CHECKLIST DE VÉRIFICATION RAPIDE**

- [ ] Logs du webhook consultés
- [ ] Webhook actif dans Database → Hooks
- [ ] RESEND_API_KEY configurée
- [ ] Fonction send-email-confirmation testée
- [ ] Erreur 404 identifiée et résolue

---

## 🎯 **OBJECTIF IMMÉDIAT**

**Identifier pourquoi le webhook n'est pas déclenché et pourquoi l'email n'est pas envoyé.**

**Commencez par vérifier les logs du webhook - c'est la clé du problème !**

