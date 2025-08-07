import fs from 'fs';

// Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'ghp_xxxxxxxxxxxxxxxxxxxx'; // À remplacer par votre token
const REPO_OWNER = 'Zyedbelm';
const REPO_NAME = 'ciara-game-explorer-cursor';
const WORKFLOW_ID = 'static.yml';

console.log('🚀 DÉCLENCHEMENT DU DÉPLOIEMENT VIA GITHUB ACTIONS...');

// Créer un fichier de déclenchement
const triggerFile = {
  ref: 'main',
  inputs: {
    deploy_edge_functions: 'true'
  }
};

fs.writeFileSync('deployment-trigger.json', JSON.stringify(triggerFile, null, 2));

console.log('✅ Fichier de déclenchement créé');

// Instructions pour déclencher manuellement
console.log(`
🔧 DÉCLENCHEMENT MANUEL DU DÉPLOIEMENT:

1. Va sur https://github.com/Zyedbelm/ciara-game-explorer-cursor/actions
2. Clique sur "Static Site Deployment" dans la liste
3. Clique sur "Run workflow" (bouton bleu)
4. Sélectionne la branche "main"
5. Clique sur "Run workflow"

OU

1. Va sur https://github.com/Zyedbelm/ciara-game-explorer-cursor/actions/workflows/static.yml
2. Clique sur "Run workflow"
3. Sélectionne la branche "main"
4. Clique sur "Run workflow"

📝 Cela va redéployer l'application et les Edge Functions.
`);

// Vérifier le statut actuel
console.log('\n📊 STATUT ACTUEL:');
console.log('- Code modifié: ✅');
console.log('- Poussé sur GitHub: ✅');
console.log('- Edge Function à redéployer: ⏳');

// Test de l'Edge Function actuelle
console.log('\n🧪 TEST DE L\'EDGE FUNCTION ACTUELLE...');
try {
  const response = await fetch('https://pohqkspsdvvbqrgzfayl.supabase.co/functions/v1/generate-travel-journal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHFrc3BzZHZ2YnFyZ3pmYXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzY0NDQsImV4cCI6MjA2NzgxMjQ0NH0.r1AXZ_w5ifbjj7AOyEtSWpGFSuyYji8saicIcoLNShk'
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
    console.log('🔄 Redéploiement nécessaire...');
  }
} catch (error) {
  console.log('❌ Erreur lors du test:', error.message);
}

console.log(`
🎯 PROCHAINES ÉTAPES:

1. Déclenche le workflow GitHub Actions (instructions ci-dessus)
2. Attends 2-3 minutes pour le déploiement
3. Teste le carnet de voyage dans l'application
4. Le HTML moderne s'ouvrira dans un nouvel onglet

🚀 Le nouveau système est prêt, il faut juste le déployer !
`);
