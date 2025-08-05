# Configuration Supabase Production - Reset Password

## Problème identifié
Le lien de récupération redirige vers `https://ciara.city` mais vous êtes sur `localhost:8080`.

## Solution
Aller sur **Supabase Dashboard** → **Authentication** → **URL Configuration**

### Configuration à mettre :
1. **Site URL** : `https://ciara.city`
2. **Redirect URLs** : 
   - `https://ciara.city/reset-password`
   - `https://ciara.city/auth`
   - `http://localhost:8080/reset-password` (pour tests locaux)
   - `http://localhost:8080/auth` (pour tests locaux)

### Alternative temporaire
Modifier le lien manuellement :
- Remplacer `https://ciara.city/reset-password` par `http://localhost:8080/reset-password`
- Garder le reste du lien identique

## Test
1. Demander un nouveau lien de récupération
2. Vérifier que le lien redirige vers `localhost:8080`
3. Tester la récupération de mot de passe 