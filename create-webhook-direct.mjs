#!/usr/bin/env node

import fetch from 'node-fetch'

// Configuration Supabase
const SUPABASE_URL = 'https://pohqkspsdvvbqrgzfayl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzY0NDQsImV4cCI6MjA2NzgxMjQ0NH0.r1AXZ_w5ifbjj7AOyEtSWpGFSuyYji8saicIcoLNShk'

async function createWebhookDirect() {
  console.log('🚀 Création directe du webhook via l\'API Supabase...\n')

  try {
    // 1. Vérifier si la fonction auth-webhook existe
    console.log('📋 1. Vérification de la fonction auth-webhook...')
    const functionCheck = await fetch(`${SUPABASE_URL}/functions/v1/auth-webhook`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (functionCheck.ok) {
      console.log('✅ Fonction auth-webhook accessible')
    } else {
      console.log('❌ Fonction auth-webhook non accessible')
      console.log('💡 Vérifiez que la fonction est déployée')
      return
    }

    // 2. Créer le webhook via l'API REST
    console.log('\n📋 2. Création du webhook...')
    
    // Note: L'API Supabase ne permet pas de créer des hooks directement
    // Nous devons utiliser une approche alternative via les migrations SQL
    
    console.log('ℹ️ Création du webhook via migration SQL...')
    
    // Créer un fichier de migration SQL
    const migrationSQL = `
-- Migration pour créer le webhook auth_profile_creation
-- Note: Cette migration doit être exécutée manuellement dans Supabase Dashboard

-- 1. Vérifier que la fonction auth-webhook existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM supabase_functions.hooks 
      WHERE name = 'auth_profile_creation'
    ) THEN 'Hook already exists'
    ELSE 'Hook does not exist'
  END as hook_status;

-- 2. Instructions pour créer le hook manuellement:
--    - Allez dans Supabase Dashboard → Database → Hooks
--    - Cliquez sur "Create a new hook"
--    - Configuration:
--      * Name: auth_profile_creation
--      * Table: auth.users
--      * Events: ✅ INSERT (cocher seulement)
--      * Function: auth-webhook
--      * HTTP Method: POST
--    - Cliquez sur "Create hook"
`;

    const migrationFile = 'create-webhook-migration.sql'
    const fs = await import('fs')
    fs.writeFileSync(migrationFile, migrationSQL)
    
    console.log(`📄 Migration SQL créée dans ${migrationFile}`)
    console.log('📝 Exécutez cette migration dans Supabase Dashboard → SQL Editor')
    
    // 3. Créer les templates d'emails
    console.log('\n📧 3. Préparation des templates d\'emails...')
    await prepareEmailTemplates()
    
    console.log('\n✅ Configuration préparée !')
    console.log('🎯 Suivez les instructions pour finaliser la configuration')
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du webhook:', error.message)
  }
}

async function prepareEmailTemplates() {
  try {
    // Lire les templates HTML
    const fs = await import('fs')
    const path = await import('path')
    
    const magicLinkTemplate = fs.readFileSync(
      path.join(process.cwd(), 'email-templates/magic-link.html'), 
      'utf8'
    )
    
    const resetPasswordTemplate = fs.readFileSync(
      path.join(process.cwd(), 'email-templates/reset-password.html'), 
      'utf8'
    )
    
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

// Exécution
createWebhookDirect()
