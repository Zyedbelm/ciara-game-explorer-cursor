#!/usr/bin/env node

/**
 * Script de nettoyage des logs de production et sécurisation
 * Supprime tous les console.log, console.error, console.warn, console.info, console.debug
 * Sauf ceux qui sont explicitement marqués pour la production
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns de fichiers à traiter
const FILE_PATTERNS = [
  'src/**/*.{ts,tsx,js,jsx}',
  'supabase/functions/**/*.{ts,js}',
  '!src/**/*.test.{ts,tsx,js,jsx}',
  '!src/**/*.spec.{ts,tsx,js,jsx}',
  '!node_modules/**',
  '!dist/**',
  '!build/**'
];

// Patterns de logs à supprimer
const LOG_PATTERNS = [
  /console\.log\s*\(/g,
  /console\.error\s*\(/g,
  /console\.warn\s*\(/g,
  /console\.info\s*\(/g,
  /console\.debug\s*\(/g
];

// Patterns de logs à conserver (marqués pour la production)
const KEEP_PATTERNS = [
  /console\.log\s*\(\s*['"`]PRODUCTION:/, // console.log('PRODUCTION: ...')
  /console\.error\s*\(\s*['"`]PRODUCTION:/, // console.error('PRODUCTION: ...')
  /console\.warn\s*\(\s*['"`]PRODUCTION:/, // console.warn('PRODUCTION: ...')
];

// Patterns de sécurité à vérifier
const SECURITY_PATTERNS = [
  {
    name: 'Clés API exposées',
    pattern: /eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g,
    severity: 'CRITICAL'
  },
  {
    name: 'URLs hardcodées',
    pattern: /https?:\/\/[^\s'"]+\.supabase\.co/g,
    severity: 'HIGH'
  },
  {
    name: 'Tokens JWT exposés',
    pattern: /Bearer\s+[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g,
    severity: 'CRITICAL'
  }
];

function shouldKeepLog(line) {
  return KEEP_PATTERNS.some(pattern => pattern.test(line));
}

function removeLogs(content, filePath) {
  let modified = false;
  let lines = content.split('\n');
  let newLines = [];
  let logsRemoved = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let shouldKeepLine = true;

    // Vérifier si c'est un log à supprimer
    for (const pattern of LOG_PATTERNS) {
      if (pattern.test(line) && !shouldKeepLog(line)) {
        // Vérifier si c'est un log multiligne
        if (line.includes('(') && !line.includes(')')) {
          // Log multiligne, supprimer jusqu'à la fermeture
          let bracketCount = (line.match(/\(/g) || []).length - (line.match(/\)/g) || []).length;
          shouldKeepLine = false;
          logsRemoved++;
          
          // Chercher la fin du log
          for (let j = i + 1; j < lines.length && bracketCount > 0; j++) {
            bracketCount += (lines[j].match(/\(/g) || []).length - (lines[j].match(/\)/g) || []).length;
            i = j; // Avancer l'index
          }
        } else {
          // Log simple
          shouldKeepLine = false;
          logsRemoved++;
        }
        break;
      }
    }

    if (shouldKeepLine) {
      newLines.push(line);
    }
  }

  if (logsRemoved > 0) {
    modified = true;
    console.log(`✅ ${filePath}: ${logsRemoved} logs supprimés`);
  }

  return { content: newLines.join('\n'), modified, logsRemoved };
}

function checkSecurityIssues(content, filePath) {
  const issues = [];
  
  for (const securityPattern of SECURITY_PATTERNS) {
    const matches = content.match(securityPattern.pattern);
    if (matches) {
      issues.push({
        pattern: securityPattern.name,
        severity: securityPattern.severity,
        matches: matches.length,
        file: filePath
      });
    }
  }
  
  return issues;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { content: newContent, modified, logsRemoved } = removeLogs(content, filePath);
    const securityIssues = checkSecurityIssues(content, filePath);
    
    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
    }
    
    return { logsRemoved, securityIssues, modified };
  } catch (error) {
    console.error(`❌ Erreur lors du traitement de ${filePath}:`, error.message);
    return { logsRemoved: 0, securityIssues: [], modified: false, error: error.message };
  }
}

function main() {
  console.log('🔒 Début du nettoyage des logs de production et audit de sécurité...\n');
  
  const files = glob.sync(FILE_PATTERNS, { ignore: ['node_modules/**', 'dist/**', 'build/**'] });
  console.log(`📁 ${files.length} fichiers trouvés\n`);
  
  let stats = {
    filesProcessed: 0,
    filesModified: 0,
    logsRemoved: 0,
    errors: 0,
    securityIssues: []
  };
  
  for (const file of files) {
    const result = processFile(file);
    stats.filesProcessed++;
    
    if (result.error) {
      stats.errors++;
    } else {
      stats.logsRemoved += result.logsRemoved;
      if (result.modified) {
        stats.filesModified++;
      }
      stats.securityIssues.push(...result.securityIssues);
    }
  }
  
  console.log('\n📊 Résumé du nettoyage:');
  console.log(`   📄 Fichiers traités: ${stats.filesProcessed}`);
  console.log(`   ✏️  Fichiers modifiés: ${stats.filesModified}`);
  console.log(`   🗑️  Logs supprimés: ${stats.logsRemoved}`);
  console.log(`   ❌ Erreurs: ${stats.errors}`);
  
  if (stats.securityIssues.length > 0) {
    console.log('\n🚨 PROBLÈMES DE SÉCURITÉ DÉTECTÉS:');
    const criticalIssues = stats.securityIssues.filter(issue => issue.severity === 'CRITICAL');
    const highIssues = stats.securityIssues.filter(issue => issue.severity === 'HIGH');
    
    if (criticalIssues.length > 0) {
      console.log('\n🔴 PROBLÈMES CRITIQUES:');
      criticalIssues.forEach(issue => {
        console.log(`   ❌ ${issue.file}: ${issue.pattern} (${issue.matches} occurrences)`);
      });
    }
    
    if (highIssues.length > 0) {
      console.log('\n🟡 PROBLÈMES ÉLEVÉS:');
      highIssues.forEach(issue => {
        console.log(`   ⚠️  ${issue.file}: ${issue.pattern} (${issue.matches} occurrences)`);
      });
    }
  } else {
    console.log('\n✅ Aucun problème de sécurité détecté');
  }
  
  if (stats.logsRemoved > 0) {
    console.log('\n✅ Nettoyage terminé avec succès!');
    console.log('💡 N\'oubliez pas de tester votre application après le nettoyage.');
  } else {
    console.log('\nℹ️  Aucun log de débogage trouvé à supprimer.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { removeLogs, checkSecurityIssues, processFile }; 