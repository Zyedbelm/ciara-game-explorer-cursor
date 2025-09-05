#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = 'https://pohqkspsdvvbqrgzfayl.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSimpleReset() {
  console.log('🧪 TEST SIMPLE EDGE FUNCTION RESET PASSWORD\n');
  
  // Utiliser un email simple et valide
  const testEmail = 'hello@ciara.city';
  
  console.log(`📤 Test avec email: ${testEmail}`);
  
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-password-reset-custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify({
        email: testEmail,
        userName: 'Test User'
      })
    });
    
    console.log('🔍 Status:', response.status);
    console.log('🔍 StatusText:', response.statusText);
    
    const responseText = await response.text();
    console.log('📋 Response body:', responseText);
    
    if (response.ok) {
      console.log('✅ Edge Function fonctionne !');
    } else {
      console.log('❌ Edge Function erreur:', response.status);
    }
    
  } catch (err) {
    console.log('❌ Exception:', err.message);
  }
}

testSimpleReset();