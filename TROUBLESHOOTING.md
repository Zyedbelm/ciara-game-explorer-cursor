# 🔧 Guide de Dépannage - CIARA Game Explorer

## 🚨 Erreurs Courantes et Solutions

### 1. Erreurs "Outdated Optimize Dep" (504)

**Symptômes :**
```
Failed to load resource: the server responded with a status of 504 (Outdated Optimize Dep)
TypeError: Importing a module script failed.
```

**Solutions :**

#### Solution Rapide
```bash
# Arrêter le serveur (Ctrl+C)
# Puis exécuter :
npm run clear:cache
npm run dev
```

#### Solution Manuelle
```bash
# 1. Arrêter tous les processus Vite
pkill -f "vite"

# 2. Nettoyer le cache
rm -rf node_modules/.vite
rm -rf dist

# 3. Redémarrer
npm run dev
```

### 2. Erreurs de Connexion WebSocket Supabase

**Symptômes :**
```
WebSocket connection to 'wss://...supabase.co/realtime/v1/websocket' failed
```

**Solutions :**
- Vérifier la connexion internet
- Redémarrer l'application
- Vérifier les variables d'environnement Supabase

### 3. Erreurs de Chargement de Modules

**Symptômes :**
```
TypeError: Importing a module script failed.
```

**Solutions :**
```bash
# Nettoyer complètement et réinstaller
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

### 4. Erreurs TypeScript

**Symptômes :**
```
Type errors in compilation
```

**Solutions :**
```bash
# Vérifier les erreurs TypeScript
npx tsc --noEmit

# Corriger les erreurs ou les ignorer temporairement
```

## 🛠️ Scripts Utiles

### Nettoyage du Cache
```bash
npm run clear:cache
```

### Démarrage Propre
```bash
npm run dev:clean
```

### Vérification de Sécurité
```bash
npm run security:audit
```

### Test de Performance
```bash
npm run test:performance
```

## 🔍 Diagnostic

### Vérifier l'État du Serveur
```bash
# Vérifier si le serveur répond
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080
```

### Vérifier les Ports Utilisés
```bash
# Voir quels ports sont utilisés
lsof -i :8080
lsof -i :8081
lsof -i :8082
```

### Vérifier les Variables d'Environnement
```bash
# Vérifier que .env existe et contient les bonnes valeurs
cat .env
```

## 📋 Checklist de Dépannage

- [ ] Arrêter tous les processus Vite
- [ ] Nettoyer le cache Vite (`node_modules/.vite`)
- [ ] Supprimer le dossier `dist`
- [ ] Vérifier les variables d'environnement
- [ ] Redémarrer le serveur
- [ ] Tester sur une page simple
- [ ] Vérifier la console du navigateur

## 🆘 En Cas de Problème Persistant

1. **Sauvegarder les changements :**
   ```bash
   git add .
   git commit -m "Sauvegarde avant dépannage"
   ```

2. **Nettoyer complètement :**
   ```bash
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

3. **Redémarrer proprement :**
   ```bash
   npm run dev:clean
   ```

4. **Vérifier les logs :**
   - Console du navigateur (F12)
   - Terminal du serveur
   - Logs Vite

## 📞 Support

Si les problèmes persistent :
1. Vérifier la version de Node.js (`node --version`)
2. Vérifier la version de npm (`npm --version`)
3. Consulter les issues GitHub du projet
4. Contacter l'équipe de développement 