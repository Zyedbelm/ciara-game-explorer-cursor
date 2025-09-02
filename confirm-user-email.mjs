#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

// Configuration Supabase
const SUPABASE_URL = 'https://pohqkspsdvvbqrgzfayl.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Erreur: SUPABASE_SERVICE_ROLE_KEY non définie')
  console.log('💡 Définissez la variable d\'environnement:')
  console.log('export SUPABASE_SERVICE_ROLE_KEY="votre_clé_service_role"')
  console.log('\n📝 Ou utilisez le script SQL: confirm-user-email.sql')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function confirmUserEmail() {
  const userEmail = 'baptiste.meddeb@genieculturel.ch'
  
  console.log('🚀 Confirmation de l\'email pour:', userEmail)
  console.log('')

  try {
    // 1. Vérifier l'état actuel de l'utilisateur
    console.log('📋 1. Vérification de l\'état actuel...')
    const { data: user, error: userError } = await supabase.auth.admin.getUserByEmail(userEmail)
    
    if (userError) {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur:', userError.message)
      return
    }
    
    if (!user.user) {
      console.error('❌ Utilisateur non trouvé:', userEmail)
      return
    }
    
    console.log('✅ Utilisateur trouvé:', user.user.id)
    console.log('📧 Email confirmé:', user.user.email_confirmed_at ? 'OUI' : 'NON')
    console.log('📅 Créé le:', user.user.created_at)
    
    // 2. Confirmer l'email si nécessaire
    if (!user.user.email_confirmed_at) {
      console.log('\n📧 2. Confirmation de l\'email...')
      
      const { data: confirmData, error: confirmError } = await supabase.auth.admin.updateUserById(
        user.user.id,
        { email_confirmed_at: new Date().toISOString() }
      )
      
      if (confirmError) {
        console.error('❌ Erreur lors de la confirmation:', confirmError.message)
        return
      }
      
      console.log('✅ Email confirmé avec succès!')
      console.log('📅 Confirmé le:', confirmData.user.email_confirmed_at)
    } else {
      console.log('ℹ️ Email déjà confirmé')
    }
    
    // 3. Vérifier le profil
    console.log('\n👤 3. Vérification du profil...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.user.id)
      .single()
    
    if (profileError) {
      console.error('❌ Erreur lors de la récupération du profil:', profileError.message)
    } else if (profile) {
      console.log('✅ Profil trouvé:')
      console.log('   - ID:', profile.user_id)
      console.log('   - Email:', profile.email)
      console.log('   - Rôle:', profile.role)
      console.log('   - Prénom:', profile.first_name)
      console.log('   - Nom:', profile.last_name)
    } else {
      console.log('❌ Profil non trouvé')
    }
    
    // 4. Instructions finales
    console.log('\n🎯 4. Instructions de connexion:')
    console.log('L\'utilisateur peut maintenant se connecter avec:')
    console.log('   - Email:', userEmail)
    console.log('   - Mot de passe: [celui utilisé lors de l\'inscription]')
    console.log('\n🌐 Testez la connexion sur: https://ciara.city/auth')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
    console.log('\n📝 Utilisez le script SQL alternatif: confirm-user-email.sql')
  }
}

// Exécution
confirmUserEmail()
