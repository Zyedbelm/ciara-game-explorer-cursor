#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = 'https://pohqkspsdvvbqrgzfayl.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserExists() {
  console.log('🔍 VÉRIFICATION UTILISATEUR DANS AUTH\n');
  
  const testEmails = [
    'hello@ciara.city',
    'test@ciara.city', 
    'info@ciara.city'
  ];
  
  for (const email of testEmails) {
    try {
      const { data, error } = await supabase.auth.admin.listUsers({
        filter: `email.eq.${email}`
      });
      
      if (error) {
        console.log(`❌ ${email}: Erreur - ${error.message}`);
      } else if (data.users.length > 0) {
        console.log(`✅ ${email}: Utilisateur trouvé - ID: ${data.users[0].id}`);
      } else {
        console.log(`⚠️  ${email}: Utilisateur non trouvé`);
      }
    } catch (err) {
      console.log(`❌ ${email}: Exception - ${err.message}`);
    }
  }
  
  console.log('\n💡 Solution: Utiliser un email d\'un utilisateur existant pour tester le reset');
}

checkUserExists();