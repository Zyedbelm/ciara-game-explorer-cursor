const fs = require('fs');
const path = require('path');

// Configuration Supabase
const SUPABASE_URL = 'https://pohqkspsdvvbqrgzfayl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzY0NDQsImV4cCI6MjA2NzgxMjQ0NH0.r1AXZ_w5ifbjj7AOyEtSWpGFSuyYji8saicIcoLNShk';

// Lire le contenu de l'Edge Function
const functionPath = path.join(__dirname, 'supabase', 'functions', 'generate-travel-journal', 'index.ts');
const functionContent = fs.readFileSync(functionPath, 'utf8');

console.log('📁 Contenu de l\'Edge Function lu:', functionPath);
console.log('📊 Taille du fichier:', functionContent.length, 'caractères');

// Créer un script de test pour vérifier que l'Edge Function fonctionne
const testScript = `
// Test de l'Edge Function generate-travel-journal
const testData = {
  journeyName: "Test Journey",
  rating: 5,
  comment: "Test comment",
  language: "fr",
  journeyId: "test-journey-id"
};

fetch('${SUPABASE_URL}/functions/v1/generate-travel-journal', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${SUPABASE_ANON_KEY}'
  },
  body: JSON.stringify(testData)
})
.then(response => response.json())
.then(data => {
  console.log('✅ Test réussi:', data);
})
.catch(error => {
  console.error('❌ Test échoué:', error);
});
`;

fs.writeFileSync('test-edge-function.js', testScript);
console.log('✅ Script de test créé: test-edge-function.js');

// Instructions pour déployer manuellement
const instructions = `
🚀 INSTRUCTIONS POUR DÉPLOYER L'EDGE FUNCTION:

1. Va sur https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl
2. Clique sur "Edge Functions" dans le menu de gauche
3. Clique sur "generate-travel-journal"
4. Clique sur "Deploy" ou "Redeploy"

OU

1. Va sur https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/functions
2. Trouve "generate-travel-journal"
3. Clique sur "Deploy"

📝 Le fichier index.ts a été modifié avec le nouveau code HTML moderne.
`;

console.log(instructions);

// Vérifier que le fichier a bien été modifié
const hasNewCode = functionContent.includes('generateModernHTMLDocument') && 
                   functionContent.includes('htmlData') && 
                   functionContent.includes('format: \'html\'');

if (hasNewCode) {
  console.log('✅ Le code de l\'Edge Function contient bien les nouvelles modifications');
} else {
  console.log('❌ Le code de l\'Edge Function ne contient pas les nouvelles modifications');
  console.log('🔍 Recherche des mots-clés dans le fichier...');
  console.log('- generateModernHTMLDocument:', functionContent.includes('generateModernHTMLDocument'));
  console.log('- htmlData:', functionContent.includes('htmlData'));
  console.log('- format: \'html\':', functionContent.includes('format: \'html\''));
}
