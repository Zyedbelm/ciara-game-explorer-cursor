import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration Supabase
const SUPABASE_URL = 'https://pohqkspsdvvbqrgzfayl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzY0NDQsImV4cCI6MjA2NzgxMjQ0NH0.r1AXZ_w5ifbjj7AOyEtSWpGFSuyYji8saicIcoLNShk';

// Lire le contenu de l'Edge Function
const functionPath = path.join(__dirname, 'supabase', 'functions', 'generate-travel-journal', 'index.ts');
const functionContent = fs.readFileSync(functionPath, 'utf8');

console.log('🚀 DÉPLOIEMENT DE L\'EDGE FUNCTION VIA API...');

// Créer un fichier ZIP avec l'Edge Function
import archiver from 'archiver';
import { createWriteStream } from 'fs';

const output = createWriteStream('generate-travel-journal.zip');
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', async () => {
  console.log('📦 Archive créée:', archive.pointer() + ' bytes');
  
  // Lire le fichier ZIP
  const zipContent = fs.readFileSync('generate-travel-journal.zip');
  
  try {
    // Déployer via l'API REST de Supabase
    console.log('📤 Déploiement en cours...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/deploy_function`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        function_name: 'generate-travel-journal',
        function_code: functionContent
      })
    });
    
    if (response.ok) {
      console.log('✅ Déploiement réussi !');
    } else {
      console.log('❌ Erreur de déploiement:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Détails:', errorText);
    }
  } catch (error) {
    console.log('❌ Erreur lors du déploiement:', error.message);
  }
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);
archive.file(functionPath, { name: 'index.ts' });
archive.finalize();

// Alternative: Instructions manuelles
console.log(`
🔧 ALTERNATIVE MANUELLE:

1. Va sur https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl
2. Clique sur "Edge Functions" dans le menu de gauche
3. Clique sur "generate-travel-journal"
4. Clique sur "Deploy" ou "Redeploy"

OU

1. Va sur https://supabase.com/dashboard/project/pohqkspsdvvbqrgzfayl/functions
2. Trouve "generate-travel-journal"
3. Clique sur "Deploy"

📝 Le fichier index.ts a été modifié avec le nouveau code HTML moderne.
`);

// Test après déploiement
setTimeout(async () => {
  console.log('\n🧪 TEST APRÈS DÉPLOIEMENT...');
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-travel-journal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        journeyName: "Test Journey",
        rating: 5,
        comment: "Test comment",
        language: "fr"
      })
    });
    
    const data = await response.json();
    console.log('📊 Réponse de l\'Edge Function:', data);
    
    if (data.format === 'html') {
      console.log('✅ L\'Edge Function retourne bien le format HTML !');
    } else {
      console.log('⚠️ L\'Edge Function ne retourne pas encore le format HTML');
    }
  } catch (error) {
    console.log('❌ Erreur lors du test:', error.message);
  }
}, 5000);
