#!/usr/bin/env node

/**
 * Script de test des corrections de sécurité
 * Vérifie que toutes les vulnérabilités critiques ont été corrigées
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns de test
const SECURITY_PATTERNS = [
  {
    name: 'Clés API exposées',
    pattern: /eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g,
    severity: 'CRITICAL',
    allowed: ['test-profile.js'] // Fichiers autorisés
  },
  {
    name: 'URLs hardcodées Supabase',
    pattern: /https?:\/\/[^\s'"]+\.supabase\.co/g,
    severity: 'HIGH',
    allowed: ['env.example', '.env'] // Fichiers autorisés
  },
  {
    name: 'Console.log en production',
    pattern: /console\.(log|error|warn|info|debug)\s*\(/g,
    severity: 'MEDIUM',
    allowed: ['scripts/', 'test/', '*.test.js', '*.spec.js'] // Dossiers autorisés
  }
];

function testSecurityPatterns() {
  console.log('🔒 Test des corrections de sécurité...\n');
  
  const files = glob.sync('**/*.{ts,tsx,js,jsx}', { 
    ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**'] 
  });
  
  let results = {
    totalFiles: files.length,
    issuesFound: 0,
    criticalIssues: 0,
    highIssues: 0,
    mediumIssues: 0,
    details: []
  };
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      for (const pattern of SECURITY_PATTERNS) {
        // Vérifier si le fichier est autorisé
        const isAllowed = pattern.allowed.some(allowed => 
          file.includes(allowed) || file.match(allowed)
        );
        
        if (!isAllowed) {
          const matches = content.match(pattern.pattern);
          if (matches) {
            results.issuesFound++;
            results.details.push({
              file,
              pattern: pattern.name,
              severity: pattern.severity,
              matches: matches.length
            });
            
            switch (pattern.severity) {
              case 'CRITICAL':
                results.criticalIssues++;
                break;
              case 'HIGH':
                results.highIssues++;
                break;
              case 'MEDIUM':
                results.mediumIssues++;
                break;
            }
          }
        }
      }
    } catch (error) {
      console.error(`❌ Erreur lors du test de ${file}:`, error.message);
    }
  }
  
  return results;
}

function testEnvironmentVariables() {
  console.log('🔧 Test des variables d\'environnement...\n');
  
  const envFile = '.env';
  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  
  if (!fs.existsSync(envFile)) {
    return {
      status: 'ERROR',
      message: 'Fichier .env manquant'
    };
  }
  
  const envContent = fs.readFileSync(envFile, 'utf8');
  const missingVars = [];
  
  for (const varName of requiredVars) {
    if (!envContent.includes(varName)) {
      missingVars.push(varName);
    }
  }
  
  if (missingVars.length > 0) {
    return {
      status: 'WARNING',
      message: `Variables manquantes: ${missingVars.join(', ')}`
    };
  }
  
  return {
    status: 'SUCCESS',
    message: 'Toutes les variables d\'environnement sont configurées'
  };
}

function testClientConfiguration() {
  console.log('🔐 Test de la configuration du client Supabase...\n');
  
  const clientFile = 'src/integrations/supabase/client.ts';
  
  if (!fs.existsSync(clientFile)) {
    return {
      status: 'ERROR',
      message: 'Fichier client Supabase manquant'
    };
  }
  
  const content = fs.readFileSync(clientFile, 'utf8');
  
  // Vérifier que les clés ne sont pas hardcodées
  const hardcodedKeys = content.match(/eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g);
  if (hardcodedKeys) {
    return {
      status: 'CRITICAL',
      message: 'Clés API hardcodées détectées dans le client'
    };
  }
  
  // Vérifier l'utilisation des variables d'environnement
  const usesEnvVars = content.includes('import.meta.env.VITE_SUPABASE_URL') && 
                     content.includes('import.meta.env.VITE_SUPABASE_ANON_KEY');
  
  if (!usesEnvVars) {
    return {
      status: 'WARNING',
      message: 'Variables d\'environnement non utilisées'
    };
  }
  
  return {
    status: 'SUCCESS',
    message: 'Configuration du client sécurisée'
  };
}

function main() {
  console.log('🔒 AUDIT DE SÉCURITÉ - TESTS POST-CORRECTION\n');
  console.log('=' .repeat(60));
  
  // Test 1: Patterns de sécurité
  const securityResults = testSecurityPatterns();
  
  // Test 2: Variables d'environnement
  const envResults = testEnvironmentVariables();
  
  // Test 3: Configuration du client
  const clientResults = testClientConfiguration();
  
  // Affichage des résultats
  console.log('\n📊 RÉSULTATS DES TESTS');
  console.log('=' .repeat(60));
  
  // Résultats des patterns de sécurité
  console.log('\n🔍 Test des patterns de sécurité:');
  console.log(`   📄 Fichiers testés: ${securityResults.totalFiles}`);
  console.log(`   🚨 Problèmes trouvés: ${securityResults.issuesFound}`);
  console.log(`   🔴 Critiques: ${securityResults.criticalIssues}`);
  console.log(`   🟡 Élevés: ${securityResults.highIssues}`);
  console.log(`   🟢 Moyens: ${securityResults.mediumIssues}`);
  
  if (securityResults.details.length > 0) {
    console.log('\n📋 Détails des problèmes:');
    securityResults.details.forEach(issue => {
      const icon = issue.severity === 'CRITICAL' ? '🔴' : 
                   issue.severity === 'HIGH' ? '🟡' : '🟢';
      console.log(`   ${icon} ${issue.file}: ${issue.pattern} (${issue.matches} occurrences)`);
    });
  }
  
  // Résultats des variables d'environnement
  console.log('\n🔧 Test des variables d\'environnement:');
  const envIcon = envResults.status === 'SUCCESS' ? '✅' : 
                  envResults.status === 'WARNING' ? '⚠️' : '❌';
  console.log(`   ${envIcon} ${envResults.message}`);
  
  // Résultats de la configuration du client
  console.log('\n🔐 Test de la configuration du client:');
  const clientIcon = clientResults.status === 'SUCCESS' ? '✅' : 
                     clientResults.status === 'WARNING' ? '⚠️' : '❌';
  console.log(`   ${clientIcon} ${clientResults.message}`);
  
  // Résumé global
  console.log('\n🏆 RÉSUMÉ GLOBAL');
  console.log('=' .repeat(60));
  
  const hasCriticalIssues = securityResults.criticalIssues > 0;
  const hasHighIssues = securityResults.highIssues > 0;
  const hasEnvIssues = envResults.status !== 'SUCCESS';
  const hasClientIssues = clientResults.status !== 'SUCCESS';
  
  if (hasCriticalIssues || hasEnvIssues || hasClientIssues) {
    console.log('❌ ÉCHEC: Vulnérabilités critiques détectées');
    console.log('   L\'application n\'est pas prête pour la production');
    process.exit(1);
  } else if (hasHighIssues) {
    console.log('⚠️  ATTENTION: Vulnérabilités élevées détectées');
    console.log('   Corriger avant le déploiement en production');
  } else {
    console.log('✅ SUCCÈS: Toutes les vulnérabilités critiques corrigées');
    console.log('   L\'application est sécurisée pour la production');
  }
  
  console.log('\n📈 MÉTRIQUES:');
  console.log(`   🔒 Niveau de sécurité: ${hasCriticalIssues ? 'CRITIQUE' : hasHighIssues ? 'ÉLEVÉ' : 'SÉCURISÉ'}`);
  console.log(`   🚀 Prêt pour la production: ${hasCriticalIssues ? 'NON' : 'OUI'}`);
  console.log(`   📊 Score de sécurité: ${Math.max(0, 100 - securityResults.criticalIssues * 50 - securityResults.highIssues * 20)}/100`);
}

if (require.main === module) {
  main();
}

module.exports = { testSecurityPatterns, testEnvironmentVariables, testClientConfiguration }; 