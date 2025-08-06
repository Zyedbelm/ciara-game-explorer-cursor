#!/usr/bin/env node

/**
 * Script de nettoyage automatique des logs de débogage
 * Supprime tous les console.log, console.error, console.warn, console.info, console.debug
 * du code source pour la production
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Configuration
const CONFIG = {
  // Dossiers à ignorer
  ignore: [
    'node_modules/**',
    'dist/**',
    'build/**',
    '.git/**',
    'coverage/**',
    '*.min.js',
    '*.bundle.js',
    'scripts/**',
    'supabase/functions/**' // Les fonctions Edge ont leurs propres logs
  ],
  
  // Extensions de fichiers à traiter
  extensions: ['js', 'jsx', 'ts', 'tsx'],
  
  // Patterns de logs à supprimer
  logPatterns: [
    /console\.log\s*\([^)]*\);?\s*/g,
    /console\.error\s*\([^)]*\);?\s*/g,
    /console\.warn\s*\([^)]*\);?\s*/g,
    /console\.info\s*\([^)]*\);?\s*/g,
    /console\.debug\s*\([^)]*\);?\s*/g,
    /console\.trace\s*\([^)]*\);?\s*/g,
    /console\.dir\s*\([^)]*\);?\s*/g,
    /console\.table\s*\([^)]*\);?\s*/g,
    /console\.group\s*\([^)]*\);?\s*/g,
    /console\.groupEnd\s*\([^)]*\);?\s*/g,
    /console\.time\s*\([^)]*\);?\s*/g,
    /console\.timeEnd\s*\([^)]*\);?\s*/g,
    /console\.timeLog\s*\([^)]*\);?\s*/g,
    /console\.count\s*\([^)]*\);?\s*/g,
    /console\.countReset\s*\([^)]*\);?\s*/g,
    /console\.clear\s*\([^)]*\);?\s*/g,
    /console\.profile\s*\([^)]*\);?\s*/g,
    /console\.profileEnd\s*\([^)]*\);?\s*/g,
    /console\.assert\s*\([^)]*\);?\s*/g
  ],
  
  // Patterns de logs à conserver (logs critiques)
  keepPatterns: [
    /console\.log\s*\(\s*['"]\s*🚨\s*/, // Logs d'erreur critique
    /console\.log\s*\(\s*['"]\s*💥\s*/, // Logs d'erreur fatale
    /console\.log\s*\(\s*['"]\s*🔴\s*/, // Logs d'erreur système
    /console\.error\s*\(/, // Tous les console.error
    /console\.warn\s*\(/, // Tous les console.warn
  ]
};

// Statistiques
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  logsRemoved: 0,
  errors: 0
};

/**
 * Vérifie si un log doit être conservé
 */
function shouldKeepLog(content) {
  return CONFIG.keepPatterns.some(pattern => pattern.test(content));
}

/**
 * Nettoie le contenu d'un fichier
 */
function cleanFileContent(content) {
  let cleanedContent = content;
  let logsRemoved = 0;
  
  CONFIG.logPatterns.forEach(pattern => {
    const matches = cleanedContent.match(pattern);
    if (matches) {
      matches.forEach(match => {
        if (!shouldKeepLog(match)) {
          cleanedContent = cleanedContent.replace(match, '');
          logsRemoved++;
        }
      });
    }
  });
  
  return { content: cleanedContent, logsRemoved };
}

/**
 * Traite un fichier
 */
function processFile(filePath) {
  try {
    stats.filesProcessed++;
    
    const content = fs.readFileSync(filePath, 'utf8');
    const { content: cleanedContent, logsRemoved } = cleanFileContent(content);
    
    if (logsRemoved > 0) {
      fs.writeFileSync(filePath, cleanedContent, 'utf8');
      stats.filesModified++;
      stats.logsRemoved += logsRemoved;
      
      console.log(`✅ ${filePath}: ${logsRemoved} logs supprimés`);
    }
  } catch (error) {
    stats.errors++;
    console.error(`❌ Erreur lors du traitement de ${filePath}:`, error.message);
  }
}

/**
 * Trouve tous les fichiers à traiter
 */
async function findFiles() {
  const patterns = CONFIG.extensions.map(ext => `**/*.${ext}`);
  const files = [];
  
  for (const pattern of patterns) {
    const matches = await glob(pattern, {
      ignore: CONFIG.ignore,
      nodir: true,
      absolute: true
    });
    files.push(...matches);
  }
  
  return [...new Set(files)]; // Supprimer les doublons
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🧹 Début du nettoyage des logs de débogage...\n');
  
  const files = await findFiles();
  console.log(`📁 ${files.length} fichiers trouvés\n`);
  
  files.forEach(processFile);
  
  console.log('\n📊 Résumé du nettoyage:');
  console.log(`   📄 Fichiers traités: ${stats.filesProcessed}`);
  console.log(`   ✏️  Fichiers modifiés: ${stats.filesModified}`);
  console.log(`   🗑️  Logs supprimés: ${stats.logsRemoved}`);
  console.log(`   ❌ Erreurs: ${stats.errors}`);
  
  if (stats.logsRemoved > 0) {
    console.log('\n✅ Nettoyage terminé avec succès!');
    console.log('💡 N\'oubliez pas de tester votre application après le nettoyage.');
  } else {
    console.log('\nℹ️  Aucun log de débogage trouvé à supprimer.');
  }
}

// Exécution
console.log('🧹 Script de nettoyage démarré');
main();

export { cleanFileContent, processFile, findFiles }; 