#!/usr/bin/env node

/**
 * Script d'audit de sécurité complet pour CIARA
 * Détecte les vulnérabilités de sécurité dans le code
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Configuration de l'audit
const SECURITY_CONFIG = {
  // Patterns de vulnérabilités critiques
  criticalPatterns: [
    // Clés API exposées
    {
      name: 'Clés API hardcodées',
      pattern: /(api_key|apiKey|secret|password|token)\s*[:=]\s*['"`][^'"`]+['"`]/gi,
      severity: 'CRITICAL',
      description: 'Clés API ou secrets exposés dans le code'
    },
    
    // Variables d'environnement non sécurisées
    {
      name: 'Variables d\'environnement non sécurisées',
      pattern: /process\.env\.[A-Z_]+/g,
      severity: 'HIGH',
      description: 'Variables d\'environnement utilisées sans validation'
    },
    
    // Injection SQL potentielle
    {
      name: 'Injection SQL potentielle',
      pattern: /\.query\s*\(\s*[`'"]\s*\$\{/g,
      severity: 'CRITICAL',
      description: 'Template literals dans les requêtes SQL'
    },
    
    // XSS potentiel
    {
      name: 'XSS potentiel',
      pattern: /dangerouslySetInnerHTML\s*=\s*\{[^}]+\}/g,
      severity: 'HIGH',
      description: 'Utilisation de dangerouslySetInnerHTML'
    },
    
    // Évaluation de code dynamique
    {
      name: 'Évaluation de code dynamique',
      pattern: /eval\s*\(|Function\s*\(|setTimeout\s*\([^,]+,\s*[^)]*\)|setInterval\s*\([^,]+,\s*[^)]*\)/g,
      severity: 'CRITICAL',
      description: 'Évaluation de code dynamique dangereuse'
    },
    
    // localStorage non sécurisé
    {
      name: 'localStorage non sécurisé',
      pattern: /localStorage\.setItem\s*\(\s*[^,]+,\s*[^)]*\)/g,
      severity: 'MEDIUM',
      description: 'Données sensibles stockées dans localStorage'
    },
    
    // Cookies non sécurisés
    {
      name: 'Cookies non sécurisés',
      pattern: /document\.cookie\s*=/g,
      severity: 'MEDIUM',
      description: 'Manipulation directe des cookies'
    },
    
    // Requêtes fetch non sécurisées
    {
      name: 'Requêtes fetch non sécurisées',
      pattern: /fetch\s*\(\s*[^)]*\)/g,
      severity: 'LOW',
      description: 'Requêtes fetch sans validation des réponses'
    },
    
    // Console.log en production
    {
      name: 'Console.log en production',
      pattern: /console\.log\s*\(/g,
      severity: 'LOW',
      description: 'Logs de débogage dans le code'
    },
    
    // URLs hardcodées
    {
      name: 'URLs hardcodées',
      pattern: /https?:\/\/[^\s'"]+/g,
      severity: 'MEDIUM',
      description: 'URLs hardcodées dans le code'
    },
    
    // Fonctions non sécurisées
    {
      name: 'Fonctions non sécurisées',
      pattern: /innerHTML\s*=|outerHTML\s*=/g,
      severity: 'HIGH',
      description: 'Manipulation directe du DOM'
    },
    
    // Requêtes sans validation
    {
      name: 'Requêtes sans validation',
      pattern: /\.from\s*\(\s*['"`][^'"`]+['"`]\s*\)\.select\s*\(\s*\*\s*\)/g,
      severity: 'MEDIUM',
      description: 'Requêtes Supabase sans validation'
    },
    
    // Permissions excessives
    {
      name: 'Permissions excessives',
      pattern: /SECURITY DEFINER/g,
      severity: 'HIGH',
      description: 'Fonctions avec privilèges élevés'
    },
    
    // RLS désactivé
    {
      name: 'RLS désactivé',
      pattern: /ALTER TABLE.*DISABLE ROW LEVEL SECURITY/g,
      severity: 'CRITICAL',
      description: 'Row Level Security désactivé'
    }
  ],
  
  // Patterns de bonnes pratiques
  goodPractices: [
    {
      name: 'Validation des entrées',
      pattern: /zod\.|yup\.|joi\./g,
      type: 'POSITIVE',
      description: 'Validation des schémas utilisée'
    },
    
    {
      name: 'Headers de sécurité',
      pattern: /X-Content-Type-Options|X-Frame-Options|X-XSS-Protection/g,
      type: 'POSITIVE',
      description: 'Headers de sécurité configurés'
    },
    
    {
      name: 'CORS configuré',
      pattern: /Access-Control-Allow-Origin/g,
      type: 'POSITIVE',
      description: 'CORS configuré'
    },
    
    {
      name: 'Rate limiting',
      pattern: /rate.*limit|throttle/g,
      type: 'POSITIVE',
      description: 'Rate limiting implémenté'
    }
  ],
  
  // Extensions de fichiers à auditer
  extensions: ['js', 'jsx', 'ts', 'tsx', 'sql'],
  
  // Dossiers à ignorer
  ignore: [
    'node_modules/**',
    'dist/**',
    'build/**',
    '.git/**',
    'coverage/**',
    '*.min.js',
    '*.bundle.js'
  ]
};

// Résultats de l'audit
const auditResults = {
  critical: [],
  high: [],
  medium: [],
  low: [],
  positives: [],
  summary: {
    totalIssues: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    positiveCount: 0
  }
};

/**
 * Analyse un fichier pour les vulnérabilités
 */
function auditFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Vérifier les vulnérabilités critiques
    SECURITY_CONFIG.criticalPatterns.forEach(pattern => {
      const matches = content.match(pattern.pattern);
      if (matches) {
        const issue = {
          file: relativePath,
          line: findLineNumber(content, matches[0]),
          pattern: pattern.name,
          severity: pattern.severity,
          description: pattern.description,
          matches: matches.length
        };
        
        switch (pattern.severity) {
          case 'CRITICAL':
            auditResults.critical.push(issue);
            auditResults.summary.criticalCount++;
            break;
          case 'HIGH':
            auditResults.high.push(issue);
            auditResults.summary.highCount++;
            break;
          case 'MEDIUM':
            auditResults.medium.push(issue);
            auditResults.summary.mediumCount++;
            break;
          case 'LOW':
            auditResults.low.push(issue);
            auditResults.summary.lowCount++;
            break;
        }
        
        auditResults.summary.totalIssues++;
      }
    });
    
    // Vérifier les bonnes pratiques
    SECURITY_CONFIG.goodPractices.forEach(practice => {
      const matches = content.match(practice.pattern);
      if (matches) {
        auditResults.positives.push({
          file: relativePath,
          pattern: practice.name,
          description: practice.description,
          matches: matches.length
        });
        auditResults.summary.positiveCount++;
      }
    });
    
  } catch (error) {
    console.error(`❌ Erreur lors de l'audit de ${filePath}:`, error.message);
  }
}

/**
 * Trouve le numéro de ligne d'un pattern
 */
function findLineNumber(content, pattern) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(pattern)) {
      return i + 1;
    }
  }
  return 1;
}

/**
 * Trouve tous les fichiers à auditer
 */
async function findFiles() {
  const patterns = SECURITY_CONFIG.extensions.map(ext => `**/*.${ext}`);
  const files = [];
  
  console.log('🔍 Patterns de recherche:', patterns);
  
  for (const pattern of patterns) {
    console.log(`🔍 Recherche avec pattern: ${pattern}`);
    const matches = await glob(pattern, {
      ignore: SECURITY_CONFIG.ignore,
      nodir: true,
      absolute: true
    });
    console.log(`📁 Trouvé ${matches.length} fichiers pour ${pattern}`);
    files.push(...matches);
  }
  
  const uniqueFiles = [...new Set(files)];
  console.log(`📁 Total fichiers uniques: ${uniqueFiles.length}`);
  return uniqueFiles;
}

/**
 * Affiche les résultats de l'audit
 */
function displayResults() {
  console.log('\n🔒 RÉSULTATS DE L\'AUDIT DE SÉCURITÉ');
  console.log('=' .repeat(50));
  
  // Vulnérabilités critiques
  if (auditResults.critical.length > 0) {
    console.log('\n🚨 VULNÉRABILITÉS CRITIQUES:');
    auditResults.critical.forEach(issue => {
      console.log(`   ❌ ${issue.file}:${issue.line} - ${issue.pattern}`);
      console.log(`      ${issue.description} (${issue.matches} occurrences)`);
    });
  }
  
  // Vulnérabilités élevées
  if (auditResults.high.length > 0) {
    console.log('\n🔴 VULNÉRABILITÉS ÉLEVÉES:');
    auditResults.high.forEach(issue => {
      console.log(`   ⚠️  ${issue.file}:${issue.line} - ${issue.pattern}`);
      console.log(`      ${issue.description} (${issue.matches} occurrences)`);
    });
  }
  
  // Vulnérabilités moyennes
  if (auditResults.medium.length > 0) {
    console.log('\n🟡 VULNÉRABILITÉS MOYENNES:');
    auditResults.medium.forEach(issue => {
      console.log(`   ⚠️  ${issue.file}:${issue.line} - ${issue.pattern}`);
      console.log(`      ${issue.description} (${issue.matches} occurrences)`);
    });
  }
  
  // Vulnérabilités faibles
  if (auditResults.low.length > 0) {
    console.log('\n🟢 VULNÉRABILITÉS FAIBLES:');
    auditResults.low.forEach(issue => {
      console.log(`   ℹ️  ${issue.file}:${issue.line} - ${issue.pattern}`);
      console.log(`      ${issue.description} (${issue.matches} occurrences)`);
    });
  }
  
  // Bonnes pratiques
  if (auditResults.positives.length > 0) {
    console.log('\n✅ BONNES PRATIQUES DÉTECTÉES:');
    auditResults.positives.forEach(practice => {
      console.log(`   ✅ ${practice.file} - ${practice.pattern}`);
      console.log(`      ${practice.description} (${practice.matches} occurrences)`);
    });
  }
  
  // Résumé
  console.log('\n📊 RÉSUMÉ:');
  console.log(`   🚨 Critiques: ${auditResults.summary.criticalCount}`);
  console.log(`   🔴 Élevées: ${auditResults.summary.highCount}`);
  console.log(`   🟡 Moyennes: ${auditResults.summary.mediumCount}`);
  console.log(`   🟢 Faibles: ${auditResults.summary.lowCount}`);
  console.log(`   ✅ Bonnes pratiques: ${auditResults.summary.positiveCount}`);
  console.log(`   📄 Total: ${auditResults.summary.totalIssues} problèmes`);
  
  // Recommandations
  if (auditResults.summary.criticalCount > 0) {
    console.log('\n🚨 RECOMMANDATIONS CRITIQUES:');
    console.log('   1. Corriger immédiatement toutes les vulnérabilités critiques');
    console.log('   2. Ne pas déployer en production avant correction');
    console.log('   3. Réviser les pratiques de développement');
  } else if (auditResults.summary.highCount > 0) {
    console.log('\n⚠️  RECOMMANDATIONS:');
    console.log('   1. Corriger les vulnérabilités élevées rapidement');
    console.log('   2. Implémenter des tests de sécurité');
    console.log('   3. Former l\'équipe aux bonnes pratiques');
  } else {
    console.log('\n✅ SÉCURITÉ SATISFAISANTE');
    console.log('   Continuez à maintenir ces bonnes pratiques!');
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🔒 Début de l\'audit de sécurité CIARA...\n');
  
  const files = await findFiles();
  console.log(`📁 ${files.length} fichiers à auditer\n`);
  
  files.forEach(auditFile);
  
  displayResults();
  
  // Code de sortie basé sur la gravité
  if (auditResults.summary.criticalCount > 0) {
    process.exit(1); // Erreur critique
  } else if (auditResults.summary.highCount > 0) {
    process.exit(2); // Avertissement élevé
  } else {
    process.exit(0); // Succès
  }
}

// Exécution
console.log('🚀 Script de sécurité démarré');
console.log('📁 Répertoire courant:', process.cwd());

// Exécuter directement
main();

export { auditFile, displayResults, auditResults }; 