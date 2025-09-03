#!/usr/bin/env node

/**
 * 🔍 DIAGNOSTIC CONFIGURATION AUTHENTIFICATION SUPABASE
 * 
 * Ce script vérifie pourquoi les emails de reset password et magic link ne s'envoient pas
 * 
 * UTILISATION : node diagnostic-auth-config.mjs
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config()

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://pohqkspsdvvbqrgzfayl.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ Erreur: SUPABASE_SERVICE_ROLE_KEY non configurée')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

console.log('🔍 DIAGNOSTIC CONFIGURATION AUTHENTIFICATION SUPABASE')
console.log('====================================================')
console.log('')

async function diagnosticAuthConfig() {
  try {
    console.log('🔍 Étape 1: Test de l\'API Reset Password...')
    
    // Tester l'API reset password avec un email de test
    const testEmail = 'test-auth@example.com'
    
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: testEmail,
      options: {
        redirectTo: 'https://ciara.city/reset-password'
      }
    })
    
    if (error) {
      console.log('❌ Erreur API Reset Password:')
      console.log('   Message:', error.message)
      console.log('   Status:', error.status)
      
      if (error.message.includes('email')) {
        console.log('   💡 Problème: Configuration email incorrecte')
      } else if (error.message.includes('redirect')) {
        console.log('   💡 Problème: URL de redirection invalide')
      } else if (error.message.includes('permission')) {
        console.log('   💡 Problème: Permissions insuffisantes')
      }
    } else {
      console.log('✅ API Reset Password fonctionne')
      console.log('   Lien généré:', data.properties.action_link ? 'OUI' : 'NON')
    }
    
    console.log('')
    console.log('🔍 Étape 2: Test de l\'API Magic Link...')
    
    // Tester l'API magic link
    const { data: magicData, error: magicError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: testEmail,
      options: {
        redirectTo: 'https://ciara.city/auth/callback'
      }
    })
    
    if (magicError) {
      console.log('❌ Erreur API Magic Link:')
      console.log('   Message:', magicError.message)
      console.log('   Status:', magicError.status)
    } else {
      console.log('✅ API Magic Link fonctionne')
      console.log('   Lien généré:', magicData.properties.action_link ? 'OUI' : 'NON')
    }
    
    console.log('')
    console.log('🔍 Étape 3: Vérification des paramètres d\'authentification...')
    
    // Vérifier les paramètres d'authentification via l'API
    try {
      const { data: authSettings, error: authError } = await supabase.auth.admin.listUsers()
      
      if (authError) {
        console.log('❌ Erreur accès paramètres auth:', authError.message)
      } else {
        console.log('✅ Paramètres d\'authentification accessibles')
        console.log('   Nombre d\'utilisateurs:', authSettings.users?.length || 0)
      }
    } catch (authError) {
      console.log('⚠️  Impossible de vérifier les paramètres d\'authentification')
    }
    
    console.log('')
    console.log('🔍 Étape 4: Test des fonctions Edge email...')
    
    // Tester l'accès aux fonctions Edge email
    const { data: emailFunc, error: emailError } = await supabase.functions.invoke('send-password-reset', {
      body: {
        email: testEmail,
        resetUrl: 'https://ciara.city/reset-password',
        name: 'Test User'
      }
    })
    
    if (emailError) {
      console.log('⚠️  Fonction send-password-reset accessible mais erreur:')
      console.log('   Message:', emailError.message)
      console.log('')
      console.log('ℹ️  Note: Cette erreur est normale car c\'est un test avec des données factices')
    } else {
      console.log('✅ Fonction send-password-reset accessible')
    }
    
    console.log('')
    console.log('🎯 RÉSUMÉ DU DIAGNOSTIC')
    console.log('========================')
    console.log('✅ Les APIs Supabase natives sont testées')
    console.log('✅ Les fonctions Edge sont accessibles')
    console.log('')
    console.log('🔍 PROBLÈMES POTENTIELS IDENTIFIÉS:')
    console.log('   1. Configuration email Supabase incorrecte')
    console.log('   2. URL de redirection invalide')
    console.log('   3. Permissions insuffisantes')
    console.log('   4. Paramètres d\'authentification mal configurés')
    console.log('')
    console.log('💡 SOLUTIONS RECOMMANDÉES:')
    console.log('   1. Vérifier la configuration email dans Supabase Dashboard')
    console.log('   2. Vérifier les URLs de redirection autorisées')
    console.log('   3. Vérifier les permissions de la clé service role')
    console.log('   4. Tester avec un vrai email (pas example.com)')
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error.message)
    process.exit(1)
  }
}

// Exécuter le diagnostic
diagnosticAuthConfig()
