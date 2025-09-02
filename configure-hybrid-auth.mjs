#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Configuration Supabase
const SUPABASE_URL = 'https://pohqkspsdvvbqrgzfayl.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Erreur: SUPABASE_SERVICE_ROLE_KEY non définie')
  console.log('💡 Définissez la variable d\'environnement:')
  console.log('export SUPABASE_SERVICE_ROLE_KEY="votre_clé_service_role"')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function configureHybridAuth() {
  console.log('🚀 Configuration du système hybride auth...\n')

  try {
    // 1. Configuration du webhook
    console.log('📋 1. Configuration du webhook...')
    await configureWebhook()
    
    // 2. Configuration des templates d'emails
    console.log('\n📧 2. Configuration des templates d\'emails...')
    await configureEmailTemplates()
    
    console.log('\n✅ Configuration terminée avec succès !')
    console.log('🎯 Testez maintenant l\'inscription et les emails')
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.message)
    process.exit(1)
  }
}

async function configureWebhook() {
  try {
    // Vérifier si le webhook existe déjà
    const { data: existingHooks, error: fetchError } = await supabase
      .from('supabase_functions.hooks')
      .select('*')
      .eq('name', 'auth_profile_creation')
    
    if (fetchError) {
      console.log('ℹ️ Impossible de vérifier les hooks existants, création directe...')
    }
    
    if (existingHooks && existingHooks.length > 0) {
      console.log('✅ Hook auth_profile_creation existe déjà')
      return
    }
    
    // Créer le webhook via l'API REST
    const webhookConfig = {
      name: 'auth_profile_creation',
      table: 'auth.users',
      events: ['INSERT'],
      function_name: 'auth-webhook',
      http_method: 'POST',
      enabled: true
    }
    
    // Note: La création de hooks via l'API REST n'est pas directement supportée
    // Nous devons utiliser une approche alternative
    console.log('⚠️ Création du hook via l\'API REST...')
    
    const { data, error } = await supabase
      .from('supabase_functions.hooks')
      .insert(webhookConfig)
    
    if (error) {
      console.log('ℹ️ Création via API REST échouée, instructions manuelles...')
      console.log('📝 Créez manuellement le hook dans Supabase Dashboard:')
      console.log('   - Database → Hooks → Create a new hook')
      console.log('   - Name: auth_profile_creation')
      console.log('   - Table: auth.users')
      console.log('   - Events: INSERT')
      console.log('   - Function: auth-webhook')
    } else {
      console.log('✅ Hook auth_profile_creation créé avec succès')
    }
    
  } catch (error) {
    console.log('ℹ️ Configuration webhook échouée, instructions manuelles...')
    console.log('📝 Créez manuellement le hook dans Supabase Dashboard:')
    console.log('   - Database → Hooks → Create a new hook')
    console.log('   - Name: auth_profile_creation')
    console.log('   - Table: auth.users')
    console.log('   - Events: INSERT')
    console.log('   - Function: auth-webhook')
  }
}

async function configureEmailTemplates() {
  try {
    // Lire les templates HTML
    const magicLinkTemplate = fs.readFileSync(
      path.join(process.cwd(), 'email-templates/magic-link.html'), 
      'utf8'
    )
    
    const resetPasswordTemplate = fs.readFileSync(
      path.join(process.cwd(), 'email-templates/reset-password.html'), 
      'utf8'
    )
    
    console.log('📁 Templates HTML chargés avec succès')
    
    // Configuration des templates via l'API
    console.log('📧 Configuration du template Magic Link...')
    await configureMagicLinkTemplate(magicLinkTemplate)
    
    console.log('📧 Configuration du template Reset Password...')
    await configureResetPasswordTemplate(resetPasswordTemplate)
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration des templates:', error.message)
    console.log('📝 Configurez manuellement les templates dans Supabase Dashboard:')
    console.log('   - Authentication → Email Templates')
    console.log('   - Magic Link: Copiez le contenu de email-templates/magic-link.html')
    console.log('   - Recovery: Copiez le contenu de email-templates/reset-password.html')
  }
}

async function configureMagicLinkTemplate(template) {
  try {
    // Note: L'API Supabase ne permet pas de modifier directement les templates d'emails
    // Nous devons utiliser une approche alternative
    console.log('ℹ️ Configuration Magic Link via instructions manuelles...')
    console.log('📝 Dans Supabase Dashboard → Authentication → Email Templates:')
    console.log('   1. Section "Magic Link" → "Edit"')
    console.log('   2. Subject: 🔗 Lien magique de connexion CIARA | Magic login link')
    console.log('   3. Content: Copiez le template HTML')
    console.log('   4. Cliquez "Save"')
    
    // Sauvegarder le template dans un fichier pour copier-coller
    const outputPath = 'magic-link-template-for-copy.txt'
    fs.writeFileSync(outputPath, template)
    console.log(`📄 Template sauvegardé dans ${outputPath} pour copier-coller`)
    
  } catch (error) {
    console.error('❌ Erreur Magic Link template:', error.message)
  }
}

async function configureResetPasswordTemplate(template) {
  try {
    console.log('ℹ️ Configuration Reset Password via instructions manuelles...')
    console.log('📝 Dans Supabase Dashboard → Authentication → Email Templates:')
    console.log('   1. Section "Recovery" → "Edit"')
    console.log('   2. Subject: 🔒 Réinitialiser votre mot de passe CIARA | Reset your CIARA password')
    console.log('   3. Content: Copiez le template HTML')
    console.log('   4. Cliquez "Save"')
    
    // Sauvegarder le template dans un fichier pour copier-coller
    const outputPath = 'reset-password-template-for-copy.txt'
    fs.writeFileSync(outputPath, template)
    console.log(`📄 Template sauvegardé dans ${outputPath} pour copier-coller`)
    
  } catch (error) {
    console.error('❌ Erreur Reset Password template:', error.message)
  }
}

// Exécution
configureHybridAuth()
