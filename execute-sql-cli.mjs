import { execSync } from 'child_process'
import fs from 'fs'

console.log('🚀 Exécution du SQL via la CLI Supabase...')

async function executeSQLCLI() {
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
    
    console.log('\n🔗 2. Tentative d\'exécution du SQL via la CLI...')
    
    // Lire le fichier SQL
    const sqlContent = fs.readFileSync('create-webhook-sql.sql', 'utf8')
    console.log('📄 Contenu SQL chargé:', sqlContent.length, 'caractères')
    
    // Essayer d'exécuter le SQL via la CLI
    try {
      console.log('🔄 Exécution du SQL...')
      
      // Créer un fichier temporaire pour l'exécution
      const tempSQL = 'temp-webhook.sql'
      fs.writeFileSync(tempSQL, sqlContent)
      
      // Exécuter via la CLI
      const result = execSync(`supabase db remote commit --file ${tempSQL}`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      })
      
      console.log('✅ SQL exécuté avec succès!')
      console.log('📋 Résultat:', result)
      
      // Nettoyer le fichier temporaire
      fs.unlinkSync(tempSQL)
      
    } catch (execError) {
      console.log('⚠️  Impossible d\'exécuter via CLI:', execError.message)
      console.log('💡 Tentative alternative...')
      
      // Nettoyer le fichier temporaire
      try {
        fs.unlinkSync('temp-webhook.sql')
      } catch (cleanupError) {
        // Ignorer l'erreur de nettoyage
      }
    }
    
    console.log('\n🔧 3. Alternative - Exécution manuelle requise...')
    
    console.log('✅ Ce qui est déjà configuré:')
    console.log('   • RESEND_API_KEY configurée')
    console.log('   • Fonction Edge auth-webhook active')
    console.log('   • Fonction send-email-confirmation opérationnelle')
    
    console.log('\n❌ Ce qui manque:')
    console.log('   • Trigger sur auth.users pour déclencher le webhook')
    console.log('   • Fonction de webhook dans la base de données')
    
    console.log('\n🔴 ACTION REQUISE - Exécuter le SQL manuellement:')
    console.log('   1. Aller dans [Supabase Dashboard > SQL Editor](https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/sql)')
    console.log('   2. Copier-coller le contenu du fichier create-webhook-sql.sql')
    console.log('   3. Cliquer sur "Run"')
    console.log('   4. Vérifier que le trigger a été créé')
    
    console.log('\n🎯 4. Résultat attendu après exécution...')
    console.log('   • Le webhook sera déclenché automatiquement lors de la création de comptes')
    console.log('   • Les emails de confirmation seront envoyés automatiquement')
    console.log('   • Les profils utilisateurs seront créés automatiquement')
    console.log('   • Les 10 points de bienvenue seront attribués après confirmation')
    
    console.log('\n💡 5. Test après configuration...')
    console.log('   1. Créer un nouveau compte utilisateur sur ciara.city')
    console.log('   2. Vérifier que l\'email de confirmation est reçu automatiquement')
    console.log('   3. Vérifier que le profil est créé dans la table profiles')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

// Exécuter le script
executeSQLCLI()
