# 🎯 Guide d'Action Simple - Résolution du Problème d'Emails

## 📋 Situation Clarifiée

✅ **Ce qui fonctionne :**
- Fonction send-email-confirmation (envoi d'emails)
- Service Resend (configuration correcte)
- Templates d'emails

❌ **Ce qui ne fonctionne pas :**
- Envoi automatique d'emails lors de la création de comptes
- Création automatique de profils utilisateurs

## 🔍 Cause Identifiée

**Le webhook auth-webhook a été supprimé** de la base de données. Il manque le trigger qui déclenche automatiquement l'envoi d'emails lors de la création d'utilisateurs.

## 🛠️ Solution en 3 Étapes

### Étape 1 : Exécuter le Script SQL (5 minutes)

1. **Aller dans [Supabase Dashboard > SQL Editor](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/sql)**

2. **Copier et coller ce code SQL :**
```sql
-- Créer le webhook manquant pour auth.users
CREATE OR REPLACE FUNCTION public.handle_auth_user_webhook()
RETURNS TRIGGER AS $$
BEGIN
  -- Appeler la fonction Edge auth-webhook
  PERFORM net.http_post(
    url := 'https://pohqkspsdvvbqrgzfayl.supabase.co/functions/v1/auth-webhook',
    headers := '{"Content-Type": "application/json"}',
    body := json_build_object(
      'type', TG_OP,
      'record', row_to_json(NEW),
      'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END
    )::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger sur auth.users
DROP TRIGGER IF EXISTS auth_users_webhook ON auth.users;
CREATE TRIGGER auth_users_webhook
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_webhook();
```

3. **Cliquer sur "Run" pour exécuter le script**

### Étape 2 : Vérifier la Configuration (2 minutes)

1. **Aller dans [Edge Functions > auth-webhook > Settings](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/functions)**

2. **Vérifier que ces variables sont configurées :**
   - `RESEND_API_KEY` (doit commencer par `re_`)
   - `SUPABASE_URL` (doit être `https://pohqkspsdvvbqrgzfayl.supabase.co`)
   - `SUPABASE_SERVICE_ROLE_KEY` (doit commencer par `sb_`)

3. **Si des variables manquent, les ajouter et cliquer sur "Save changes"**

### Étape 3 : Tester la Solution (3 minutes)

1. **Créer un nouveau compte utilisateur sur ciara.city**
2. **Vérifier que l'email de confirmation est reçu automatiquement**
3. **Vérifier que le profil est créé dans la table profiles**

## 🎯 Résultat Attendu

Après ces 3 étapes, **tout devrait fonctionner automatiquement** :
- ✅ Création de compte → Email automatique envoyé
- ✅ Création de profil automatique
- ✅ Attribution des 10 points de bienvenue
- ✅ Email de bienvenue

## 🔧 Si Ça Ne Marche Toujours Pas

### Vérifier les Logs
1. Aller dans [Edge Functions > auth-webhook > Logs](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/functions)
2. Créer un nouveau compte
3. Vérifier les logs pour identifier l'erreur

### Erreurs Communes
- **RESEND_API_KEY manquante** → Ajouter dans les variables d'environnement
- **Permission denied** → Vérifier que la fonction a les bonnes permissions
- **Table profiles n'existe pas** → Vérifier la structure de la base

## 📞 Support

**Si vous avez des questions ou si ça ne marche pas :**
1. Exécutez d'abord les 3 étapes ci-dessus
2. Consultez les logs de la fonction auth-webhook
3. Fournissez les erreurs spécifiques rencontrées

---

**Temps estimé : 10 minutes**
**Difficulté : Facile**
**Statut : Solution claire identifiée**
