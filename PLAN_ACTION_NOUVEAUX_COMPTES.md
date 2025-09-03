# 🎯 Plan d'Action Sûr pour les Nouveaux Comptes

## 📋 **État Actuel**
- ✅ **Authentification restaurée** - Les comptes existants fonctionnent
- ❌ **Webhook problématique supprimé** - Plus de blocage
- 🔄 **Nouveaux comptes** - Pas d'emails automatiques

## 🚀 **Phase 1: Diagnostic et Correction (Sûr)**

### 1.1 **Identifier le Problème Exact**
- 🔍 **Consulter les logs** de la fonction auth-webhook
- 📊 **Analyser l'erreur** qui causait le "non-2xx status code"
- 🎯 **Identifier la cause racine** (variables, permissions, code)

### 1.2 **Corriger le Webhook Edge Function**
- 🛠️ **Corriger le code** de `supabase/functions/auth-webhook/index.ts`
- 🔧 **Tester localement** avant déploiement
- 📦 **Redéployer** la fonction corrigée

## 🛡️ **Phase 2: Approche Progressive et Sûre**

### 2.1 **Créer un Webhook SÛR (IMMÉDIAT)**
```sql
-- Exécuter dans Supabase Dashboard > SQL Editor
-- Ce webhook est SÛR et ne peut pas bloquer l'authentification

-- 1. Créer la fonction SÛRE
CREATE OR REPLACE FUNCTION public.handle_new_user_safe()
RETURNS TRIGGER AS $$
BEGIN
  -- SEULEMENT sur INSERT (nouveaux comptes)
  IF TG_OP != 'INSERT' THEN
    RETURN NEW;
  END IF;
  
  -- Gestion d'erreur robuste
  BEGIN
    PERFORM net.http_post(
      url := 'https://pohqkspsdvvbqrgzfayl.supabase.co/functions/v1/auth-webhook',
      headers := '{"Content-Type": "application/json"}',
      body := json_build_object(
        'type', TG_OP,
        'record', row_to_json(NEW)
      )::text
    );
  EXCEPTION WHEN OTHERS THEN
    -- NE JAMAIS bloquer l'authentification
    RAISE LOG 'Webhook: Erreur ignorée pour utilisateur %', NEW.id;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Créer le trigger SÛR
CREATE TRIGGER auth_new_users_safe
  AFTER INSERT ON auth.users  -- SEULEMENT INSERT
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_safe();
```

### 2.2 **Avantages du Webhook SÛR**
- ✅ **Seulement INSERT** - Pas d'interférence avec la connexion
- ✅ **Gestion d'erreur robuste** - Ne bloque jamais l'authentification
- ✅ **Logs détaillés** - Facilite le debugging
- ✅ **Rollback automatique** - En cas d'erreur, l'utilisateur peut se connecter

## 🧪 **Phase 3: Test et Validation**

### 3.1 **Test du Webhook SÛR**
1. **Créer un compte de test** sur ciara.city
2. **Vérifier les logs** du webhook
3. **Confirmer que l'email est envoyé**
4. **Vérifier que le profil est créé**

### 3.2 **Test de Sécurité**
1. **Se connecter à un compte existant** - Doit fonctionner
2. **Modifier un compte existant** - Ne doit pas déclencher le webhook
3. **Vérifier que l'authentification reste stable**

## 🚀 **Phase 4: Activation Progressive**

### 4.1 **Activation Immédiate (Sûre)**
- 🟢 **Webhook SÛR activé** - Nouveaux comptes fonctionnent
- 🟢 **Authentification préservée** - Comptes existants fonctionnent
- 🟢 **Emails automatiques** - Nouveaux utilisateurs reçoivent leurs emails

### 4.2 **Monitoring et Surveillance**
- 📊 **Surveiller les logs** du webhook
- 🔍 **Vérifier les erreurs** et les corriger
- 📈 **Mesurer le taux de succès** des nouveaux comptes

## 🎯 **Résultat Final Attendu**

### ✅ **Ce qui fonctionnera :**
- **Comptes existants** - Connexion normale
- **Nouveaux comptes** - Création + email automatique
- **Profils utilisateurs** - Création automatique
- **Points de bienvenue** - Attribution après confirmation

### 🛡️ **Ce qui sera protégé :**
- **Authentification existante** - Jamais bloquée
- **Stabilité de l'application** - Pas de dégradation de service
- **Expérience utilisateur** - Cohérente et fiable

## 📝 **Actions Immédiates Requises**

### 🔴 **Action 1: Créer le Webhook SÛR**
1. Aller dans [Supabase Dashboard > SQL Editor](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/sql)
2. Copier-coller le code SQL du webhook SÛR
3. Cliquer sur "Run"

### 🟡 **Action 2: Tester la Solution**
1. Créer un nouveau compte sur ciara.city
2. Vérifier que l'email arrive automatiquement
3. Vérifier que l'authentification des comptes existants fonctionne

### 🟢 **Action 3: Monitoring**
1. Surveiller les logs du webhook
2. Vérifier qu'il n'y a pas d'erreurs
3. Confirmer que tout fonctionne comme attendu

---

**Ce plan est SÛR et ne peut pas bloquer votre application. Le webhook SÛR ne s'active que sur les nouveaux comptes et a une gestion d'erreur robuste.**
