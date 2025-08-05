#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class PerformanceTester {
  constructor() {
    this.results = [];
    this.browser = null;
    this.page = null;
  }

  async init() {
    console.log('🚀 Initialisation du testeur de performance...');
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Activer les métriques de performance
    await this.page.setCacheEnabled(false);
    await this.page.setViewport({ width: 1920, height: 1080 });
  }

  async measurePageLoad(url, name) {
    console.log(`📊 Test de performance pour: ${name}`);
    
    const startTime = Date.now();
    
    // Mesurer le temps de navigation
    const navigationPromise = this.page.waitForNavigation({ 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    await navigationPromise;
    
    const loadTime = Date.now() - startTime;

    // Collecter les métriques de performance
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        totalResources: performance.getEntriesByType('resource').length,
        totalSize: performance.getEntriesByType('resource').reduce((acc, resource) => acc + (resource.transferSize || 0), 0)
      };
    });

    // Vérifier les erreurs de console
    const consoleErrors = await this.page.evaluate(() => {
      return window.consoleErrors || [];
    });

    // Vérifier les traductions manquantes
    const missingTranslations = await this.page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const missingKeys = [];
      
      elements.forEach(el => {
        const text = el.textContent;
        if (text && text.includes('_') && text.includes('message_')) {
          missingKeys.push(text);
        }
      });
      
      return [...new Set(missingKeys)];
    });

    const result = {
      name,
      url,
      loadTime,
      metrics,
      consoleErrors: consoleErrors.length,
      missingTranslations: missingTranslations.length,
      timestamp: new Date().toISOString()
    };

    this.results.push(result);
    
    console.log(`✅ ${name}: ${loadTime}ms | Erreurs: ${consoleErrors.length} | Traductions manquantes: ${missingTranslations.length}`);
    
    return result;
  }

  async testAllPages() {
    const baseUrl = 'http://localhost:8080';
    const pages = [
      { url: '/', name: 'Homepage' },
      { url: '/cities', name: 'Sélection de villes' },
      { url: '/destinations/geneva', name: 'Page destination (Genève)' },
      { url: '/auth', name: 'Page d\'authentification' },
      { url: '/rewards', name: 'Page des récompenses' },
      { url: '/profile', name: 'Page de profil' },
    ];

    console.log('🧪 Début des tests de performance...\n');

    for (const page of pages) {
      try {
        await this.measurePageLoad(`${baseUrl}${page.url}`, page.name);
        // Pause entre les tests
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Erreur lors du test de ${page.name}:`, error.message);
      }
    }
  }

  generateReport() {
    console.log('\n📋 Génération du rapport de performance...\n');

    const report = {
      summary: {
        totalPages: this.results.length,
        averageLoadTime: this.results.reduce((acc, r) => acc + r.loadTime, 0) / this.results.length,
        totalErrors: this.results.reduce((acc, r) => acc + r.consoleErrors, 0),
        totalMissingTranslations: this.results.reduce((acc, r) => acc + r.missingTranslations, 0),
        timestamp: new Date().toISOString()
      },
      pages: this.results,
      recommendations: []
    };

    // Analyser les résultats et générer des recommandations
    const avgLoadTime = report.summary.averageLoadTime;
    if (avgLoadTime > 3000) {
      report.recommendations.push('⚠️ Temps de chargement moyen élevé. Considérer l\'optimisation des images et du code.');
    }
    if (avgLoadTime > 5000) {
      report.recommendations.push('🚨 Temps de chargement critique. Optimisation urgente requise.');
    }

    if (report.summary.totalErrors > 0) {
      report.recommendations.push('🔧 Erreurs de console détectées. Vérifier les logs pour plus de détails.');
    }

    if (report.summary.totalMissingTranslations > 0) {
      report.recommendations.push('🌐 Traductions manquantes détectées. Vérifier le système de traduction.');
    }

    // Afficher le rapport
    console.log('📊 RAPPORT DE PERFORMANCE');
    console.log('='.repeat(50));
    console.log(`Pages testées: ${report.summary.totalPages}`);
    console.log(`Temps de chargement moyen: ${report.summary.averageLoadTime.toFixed(0)}ms`);
    console.log(`Erreurs totales: ${report.summary.totalErrors}`);
    console.log(`Traductions manquantes: ${report.summary.totalMissingTranslations}`);
    console.log('');

    console.log('📄 DÉTAILS PAR PAGE:');
    this.results.forEach(result => {
      console.log(`  ${result.name}:`);
      console.log(`    Temps de chargement: ${result.loadTime}ms`);
      console.log(`    Erreurs: ${result.consoleErrors}`);
      console.log(`    Traductions manquantes: ${result.missingTranslations}`);
      console.log(`    FCP: ${result.metrics.firstContentfulPaint.toFixed(0)}ms`);
      console.log('');
    });

    if (report.recommendations.length > 0) {
      console.log('💡 RECOMMANDATIONS:');
      report.recommendations.forEach(rec => console.log(`  ${rec}`));
    }

    // Sauvegarder le rapport
    const reportPath = path.join(__dirname, '../performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Rapport sauvegardé dans: ${reportPath}`);

    return report;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

async function main() {
  const tester = new PerformanceTester();
  
  try {
    await tester.init();
    await tester.testAllPages();
    tester.generateReport();
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  } finally {
    await tester.cleanup();
  }
}

if (require.main === module) {
  main();
}

module.exports = PerformanceTester; 