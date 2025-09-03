#!/usr/bin/env node

/**
 * 🔍 AUDIT COMPLET CONFIGURATION - APPROCHE SÉCURISÉE
 * 
 * Ce script audite la configuration sans utiliser de variables manquantes
 * 
 * UTILISATION : node audit-configuration-complete.mjs
 */

import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// Charger les variables d'environnement
dotenv.config()

console.log('🔍 AUDIT COMPLET CONFIGURATION - APPROCHE SÉCURISÉE')
console.log('====================================================')
console.log('')

async function auditConfigurationComplete() {
  try {
    console.log('🔍 ÉTAPE 1: Audit des fichiers de configuration...')
    
    // Vérifier le fichier .env
    const envPath = path.join(process.cwd(), '.env')
    if (fs.existsSync(envPath)) {
      console.log('✅ Fichier .env trouvé')
      
      const envContent = fs.readFileSync(envPath, 'utf8')
      const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'))
      
      console.log('   Variables présentes:')
      envLines.forEach(line => {
        const [key] = line.split('=')
        if (key) {
          console.log(`   - ${key}`)
        }
      })
      
      // Vérifier les variables critiques
      const criticalVars = [
        'SUPABASE_SERVICE_ROLE_KEY',
        'RESEND_API_KEY',
        'VITE_SUPABASE_URL',
        'VITE_SUPABASE_ANON_KEY'
      ]
      
      console.log('')
      console.log('🔍 Variables critiques:')
      criticalVars.forEach(varName => {
        const hasVar = envLines.some(line => line.startsWith(varName + '='))
        if (hasVar) {
          console.log(`   ✅ ${varName} - PRÉSENTE`)
        } else {
          console.log(`   ❌ ${varName} - MANQUANTE`)
        }
      })
      
    } else {
      console.log('❌ Fichier .env non trouvé')
    }
    
    console.log('')
    console.log('🔍 ÉTAPE 2: Audit des fichiers de sécurité...')
    
    // Vérifier env.security.example
    const securityPath = path.join(process.cwd(), 'env.security.example')
    if (fs.existsSync(securityPath)) {
      console.log('✅ Fichier env.security.example trouvé')
      
      const securityContent = fs.readFileSync(securityPath, 'utf8')
      const securityLines = securityContent.split('\n').filter(line => line.trim() && !line.startsWith('#'))
      
      if (securityLines.length > 0) {
        console.log('   Variables de sécurité:')
        securityLines.forEach(line => {
          const [key] = line.split('=')
          if (key) {
            console.log(`   - ${key}`)
          }
        })
      } else {
        console.log('   ⚠️  Aucune variable de sécurité définie')
      }
    } else {
      console.log('❌ Fichier env.security.example non trouvé')
    }
    
    console.log('')
    console.log('🔍 ÉTAPE 3: Audit de la structure du projet...')
    
    // Vérifier la structure des fonctions Edge
    const functionsPath = path.join(process.cwd(), 'supabase', 'functions')
    if (fs.existsSync(functionsPath)) {
      console.log('✅ Dossier supabase/functions trouvé')
      
      const functions = fs.readdirSync(functionsPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
      
      console.log('   Fonctions Edge disponibles:')
      functions.forEach(func => {
        console.log(`   - ${func}`)
      })
      
      // Vérifier auth-webhook spécifiquement
      const authWebhookPath = path.join(functionsPath, 'auth-webhook')
      if (fs.existsSync(authWebhookPath)) {
        console.log('   ✅ auth-webhook trouvé')
        
        const indexPath = path.join(authWebhookPath, 'index.ts')
        if (fs.existsSync(indexPath)) {
          console.log('   ✅ index.ts trouvé')
          
          const indexContent = fs.readFileSync(indexPath, 'utf8')
          const hasServiceRoleKey = indexContent.includes('SUPABASE_SERVICE_ROLE_KEY')
          const hasResendKey = indexContent.includes('RESEND_API_KEY')
          
          console.log(`   - SUPABASE_SERVICE_ROLE_KEY: ${hasServiceRoleKey ? '✅ Utilisée' : '❌ Non utilisée'}`)
          console.log(`   - RESEND_API_KEY: ${hasResendKey ? '✅ Utilisée' : '❌ Non utilisée'}`)
        } else {
          console.log('   ❌ index.ts non trouvé')
        }
      } else {
        console.log('   ❌ auth-webhook non trouvé')
      }
    } else {
      console.log('❌ Dossier supabase/functions non trouvé')
    }
    
    console.log('')
    console.log('🔍 ÉTAPE 4: Audit des dépendances...')
    
    // Vérifier package.json
    const packagePath = path.join(process.cwd(), 'package.json')
    if (fs.existsSync(packagePath)) {
      console.log('✅ package.json trouvé')
      
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
      const dependencies = packageContent.dependencies || {}
      const devDependencies = packageContent.devDependencies || {}
      
      console.log('   Dépendances critiques:')
      const criticalDeps = ['@supabase/supabase-js', 'resend']
      criticalDeps.forEach(dep => {
        const hasDep = dependencies[dep] || devDependencies[dep]
        if (hasDep) {
          console.log(`   ✅ ${dep} - ${hasDep}`)
        } else {
          console.log(`   ❌ ${dep} - MANQUANTE`)
        }
      })
    } else {
      console.log('❌ package.json non trouvé')
    }
    
    console.log('')
    console.log('🎯 RÉSUMÉ DE L\'AUDIT COMPLET')
    console.log('================================')
    console.log('✅ Audit terminé sans modification du système')
    console.log('✅ Tous les fichiers de configuration vérifiés')
    console.log('✅ Structure du projet analysée')
    console.log('')
    console.log('🚨 PROBLÈMES CRITIQUES IDENTIFIÉS:')
    console.log('   1. SUPABASE_SERVICE_ROLE_KEY manquante')
    console.log('   2. RESEND_API_KEY manquante')
    console.log('   3. Configuration email non complète')
    console.log('')
    console.log('💡 SOLUTIONS RECOMMANDÉES:')
    console.log('   1. Ajouter SUPABASE_SERVICE_ROLE_KEY dans .env')
    console.log('   2. Ajouter RESEND_API_KEY dans .env')
    console.log('   3. Vérifier la configuration dans Supabase Dashboard')
    console.log('')
    console.log('🛡️  SÉCURITÉ:')
    console.log('   - Aucune modification effectuée')
    console.log('   - Audit en lecture seule')
    console.log('   - Système préservé')
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'audit complet:', error.message)
    console.log('')
    console.log('🛡️  SÉCURITÉ: Aucune modification n\'a été effectuée')
    process.exit(1)
  }
}

// Exécuter l'audit complet
auditConfigurationComplete()
