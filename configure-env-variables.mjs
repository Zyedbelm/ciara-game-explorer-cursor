import { execSync } from 'child_process'

console.log('🔧 Configuration des Variables d\'Environnement pour auth-webhook...')

async function configureEnvVariables() {
  try {
    console.log('\n📊 1. Vérification de la CLI Supabase...')
    
    // Vérifier que la CLI est disponible
    try {
      const version = execSync('supabase --version', { encoding: 'utf8' })
      console.log('✅ CLI Supabase disponible:', version.trim())
    } catch (error) {
      console.error('❌ CLI Supabase non disponible:', error.message)
      return
    }
    
    console.log('\n🔧 2. Configuration des variables d\'environnement...')
    
    // Configuration des variables nécessaires
    const envVars = [
      {
        name: 'SERVICE_ROLE_KEY',
        value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIzNjQ0NCwiZXhwIjoyMDY3ODEyNDQ0fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8',
        description: 'Clé de service pour les opérations admin'
      },
      {
        name: 'PROJECT_URL',
        value: 'https://pohqkspsdvvbqrgzfayl.supabase.co',
        description: 'URL du projet Supabase'
      }
    ]
    
    console.log('📝 Variables à configurer:')
    envVars.forEach(variable => {
      console.log(`   • ${variable.name}: ${variable.description}`)
    })
    
    console.log('\n🚀 3. Configuration via CLI Supabase...')
    
    // Configurer chaque variable
    for (const variable of envVars) {
      try {
        console.log(`\n🔄 Configuration de ${variable.name}...`)
        
        const command = `supabase secrets set ${variable.name}=${variable.value}`
        console.log(`   Commande: ${command}`)
        
        const result = execSync(command, { encoding: 'utf8' })
        console.log(`   ✅ ${variable.name} configuré avec succès`)
        
      } catch (error) {
        console.log(`   ❌ Erreur configuration ${variable.name}:`, error.message)
      }
    }
    
    console.log('\n📋 4. Vérification de la configuration...')
    
    try {
      const secretsList = execSync('supabase secrets list', { encoding: 'utf8' })
      console.log('📊 Variables configurées:')
      console.log(secretsList)
    } catch (error) {
      console.log('⚠️  Impossible de lister les variables:', error.message)
    }
    
    console.log('\n🔧 5. Modification du code auth-webhook...')
    
    console.log('📝 Le code de auth-webhook doit être modifié pour utiliser:')
    console.log('   • SERVICE_ROLE_KEY au lieu de SUPABASE_SERVICE_ROLE_KEY')
    console.log('   • PROJECT_URL au lieu de SUPABASE_URL')
    
    console.log('\n🎯 6. Actions requises...')
    
    console.log('\n🔴 Action 1: Modifier le code auth-webhook')
    console.log('   1. Aller dans [Supabase Dashboard > Edge Functions > auth-webhook](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/functions)')
    console.log('   2. Modifier le code pour utiliser les nouvelles variables')
    console.log('   3. Redéployer la fonction')
    
    console.log('\n🟡 Action 2: Tester la solution')
    console.log('   1. Créer un nouveau compte utilisateur')
    console.log('   2. Vérifier que l\'email est envoyé automatiquement')
    console.log('   3. Vérifier que le profil est créé')
    
    console.log('\n💡 7. Code modifié requis...')
    
    console.log('📝 Dans supabase/functions/auth-webhook/index.ts, remplacer:')
    console.log('   const supabaseUrl = Deno.env.get(\'SUPABASE_URL\')!')
    console.log('   const supabaseServiceKey = Deno.env.get(\'SUPABASE_SERVICE_ROLE_KEY\')!')
    console.log('')
    console.log('📝 Par:')
    console.log('   const supabaseUrl = Deno.env.get(\'PROJECT_URL\')!')
    console.log('   const supabaseServiceKey = Deno.env.get(\'SERVICE_ROLE_KEY\')!')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

// Exécuter la configuration
configureEnvVariables()
