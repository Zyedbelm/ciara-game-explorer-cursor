#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function configureAuthSimple() {
  console.log('🚀 Configuration simplifiée du système hybride auth...\n')

  try {
    // 1. Vérifier que la fonction auth-webhook est déployée
    console.log('📋 1. Vérification de la fonction auth-webhook...')
    await checkAuthWebhook()
    
    // 2. Préparer les templates d'emails
    console.log('\n📧 2. Préparation des templates d\'emails...')
    await prepareEmailTemplates()
    
    // 3. Créer le guide de configuration
    console.log('\n📚 3. Création du guide de configuration...')
    await createConfigurationGuide()
    
    console.log('\n✅ Configuration préparée avec succès !')
    console.log('🎯 Suivez le guide CONFIGURATION_IMMEDIATE.md pour finaliser')
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.message)
  }
}

async function checkAuthWebhook() {
  try {
    // Vérifier que la fonction existe localement
    const webhookPath = path.join(__dirname, 'supabase/functions/auth-webhook/index.ts')
    
    if (fs.existsSync(webhookPath)) {
      console.log('✅ Fonction auth-webhook trouvée localement')
      
      // Vérifier le contenu
      const content = fs.readFileSync(webhookPath, 'utf8')
      if (content.includes('profiles') && content.includes('INSERT')) {
        console.log('✅ Contenu du webhook vérifié (gestion des profils)')
      } else {
        console.log('⚠️ Contenu du webhook à vérifier')
      }
    } else {
      console.log('❌ Fonction auth-webhook non trouvée')
    }
    
    console.log('💡 Vérifiez que la fonction est déployée:')
    console.log('   cd supabase && supabase functions deploy auth-webhook')
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message)
  }
}

async function prepareEmailTemplates() {
  try {
    // Lire les templates HTML
    const magicLinkPath = path.join(__dirname, 'email-templates/magic-link.html')
    const resetPasswordPath = path.join(__dirname, 'email-templates/reset-password.html')
    
    if (!fs.existsSync(magicLinkPath) || !fs.existsSync(resetPasswordPath)) {
      console.log('❌ Templates HTML non trouvés')
      console.log('💡 Vérifiez que le dossier email-templates/ existe')
      return
    }
    
    const magicLinkTemplate = fs.readFileSync(magicLinkPath, 'utf8')
    const resetPasswordTemplate = fs.readFileSync(resetPasswordPath, 'utf8')
    
    console.log('📁 Templates HTML chargés avec succès')
    
    // Créer des fichiers de copie-coller
    const magicLinkFile = 'magic-link-template-for-copy.txt'
    const resetPasswordFile = 'reset-password-template-for-copy.txt'
    
    fs.writeFileSync(magicLinkFile, magicLinkTemplate)
    fs.writeFileSync(resetPasswordFile, resetPasswordTemplate)
    
    console.log(`📄 Template Magic Link: ${magicLinkFile}`)
    console.log(`📄 Template Reset Password: ${resetPasswordFile}`)
    
    console.log('\n📝 Instructions pour configurer les templates:')
    console.log('1. Allez dans Supabase Dashboard → Authentication → Email Templates')
    console.log('2. Magic Link: Copiez le contenu de magic-link-template-for-copy.txt')
    console.log('3. Recovery: Copiez le contenu de reset-password-template-for-copy.txt')
    
  } catch (error) {
    console.error('❌ Erreur lors de la préparation des templates:', error.message)
  }
}

async function createConfigurationGuide() {
  try {
    const guideContent = `# 🚀 CONFIGURATION IMMÉDIATE DU SYSTÈME HYBRIDE AUTH

## ⚡ **CONFIGURATION RAPIDE (5 minutes)**

### **1. Créer le Webhook (CRITIQUE)**

#### **Étape 1 : Aller dans Supabase Dashboard**
1. **Ouvrez** [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Sélectionnez** votre projet \`ciara-game-explorer\`
3. **Menu gauche** → **"Database"**
4. **Onglet** → **"Hooks"**

#### **Étape 2 : Créer le Hook de Profil**
1. **Cliquez** sur **"Create a new hook"**
2. **Configuration :**
   - **Name** : \`auth_profile_creation\`
   - **Table** : \`auth.users\`
   - **Events** : ✅ **INSERT** (cocher seulement)
   - **Function** : \`auth-webhook\`
   - **HTTP Method** : \`POST\`
3. **Cliquez** sur **"Create hook"**

### **2. Configurer les Templates d'Emails**

#### **Étape 1 : Aller dans Authentication → Email Templates**
1. **Menu gauche** → **"Authentication"**
2. **Onglet** → **"Email Templates"**

#### **Étape 2 : Configurer Magic Link**
1. **Section "Magic Link"** → **"Edit"**
2. **Subject** : \`🔗 Lien magique de connexion CIARA | Magic login link\`
3. **Content** : Copiez le contenu de \`magic-link-template-for-copy.txt\`
4. **Cliquez "Save"**

#### **Étape 3 : Configurer Reset Password**
1. **Section "Recovery"** → **"Edit"**
2. **Subject** : \`🔒 Réinitialiser votre mot de passe CIARA | Reset your CIARA password\`
3. **Content** : Copiez le contenu de \`reset-password-template-for-copy.txt\`
4. **Cliquez "Save"**

### **3. Test Immédiat**

#### **Test d'inscription :**
- **Allez sur** \`/auth\` → Onglet "Sign Up"
- **Remplissez** le formulaire
- **Vérifiez** que le profil est créé automatiquement

#### **Test Magic Link :**
- **Onglet "Magic Link"** → Entrez votre email
- **Vérifiez** l'email reçu (style CIARA personnalisé)
- **Cliquez** sur le lien → Redirection vers \`/profile\`

#### **Test Reset Password :**
- **Onglet "Forgot Password"** → Entrez votre email
- **Vérifiez** l'email reçu (style CIARA personnalisé)
- **Cliquez** sur le lien → Redirection vers \`/reset-password\`

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
`

    fs.writeFileSync('CONFIGURATION_IMMEDIATE.md', guideContent)
    console.log('📚 Guide CONFIGURATION_IMMEDIATE.md créé')
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du guide:', error.message)
  }
}

// Exécution
configureAuthSimple()
