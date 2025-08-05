
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JourneyPreferences {
  duration: string;
  interests: string[];
  difficulty: string;
  groupSize: string;
  startLocation?: string;
}

interface GeneratedStep {
  stepId: string;
  order: number;
  customInstructions: string;
}

interface GeneratedJourney {
  name: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedDuration: number;
  steps: GeneratedStep[];
  totalPoints: number;
}

serve(async (req) => {
  console.log('🚀 Generate-journey function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create supabase client for auth verification
    const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header provided');
      return new Response(JSON.stringify({ 
        error: 'Authentication required. Please log in to generate journeys.' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError?.message || 'Invalid token');
      return new Response(JSON.stringify({ 
        error: 'Invalid authentication. Please log in again.' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ User authenticated:', user.email);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const requestBody = await req.json();
    console.log('📝 Request body received:', JSON.stringify(requestBody, null, 2));
    
    const { preferences, cityId }: { preferences: JourneyPreferences; cityId: string } = requestBody;
    
    if (!preferences || !cityId) {
      console.error('❌ Missing required parameters:', { preferences: !!preferences, cityId: !!cityId });
      throw new Error('Missing preferences or cityId');
    }

    if (!openAIApiKey) {
      console.error('❌ OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    console.log('🏙️ Fetching city information for ID:', cityId);
    
    // Get city information
    const { data: city, error: cityError } = await supabase
      .from('cities')
      .select('*')
      .eq('id', cityId)
      .single();
      
    if (cityError) {
      console.error('❌ City fetch error:', cityError);
      throw new Error(`Failed to fetch city: ${cityError.message}`);
    }
    
    if (!city) {
      console.error('❌ City not found for ID:', cityId);
      throw new Error('City not found');
    }

    console.log('✅ City found:', city.name);

    // Get available steps for this city
    console.log('🔍 Fetching steps for city:', cityId);
    const { data: steps, error: stepsError } = await supabase
      .from('steps')
      .select('*')
      .eq('city_id', cityId)
      .eq('is_active', true);
      
    if (stepsError) {
      console.error('❌ Steps fetch error:', stepsError);
      throw new Error(`Failed to fetch steps: ${stepsError.message}`);
    }

    console.log(`✅ Found ${steps?.length || 0} active steps`);

    // Get journey categories for this city
    console.log('🔍 Fetching categories for city:', cityId);
    const { data: categories, error: categoriesError } = await supabase
      .from('journey_categories')
      .select('*')
      .eq('city_id', cityId);
      
    if (categoriesError) {
      console.error('❌ Categories fetch error:', categoriesError);
      throw new Error(`Failed to fetch categories: ${categoriesError.message}`);
    }

    console.log(`✅ Found ${categories?.length || 0} categories`);

    if (!steps || steps.length === 0) {
      console.error('❌ No steps available for city:', cityId);
      throw new Error('No steps available for this city');
    }

    if (!categories || categories.length === 0) {
      console.error('❌ No categories available for city:', cityId);
      throw new Error('No categories available for this city');
    }

    // Generate journey using OpenAI
    console.log('🤖 Calling OpenAI API...');
    const prompt = `
Tu es un expert en tourisme pour la ville de ${city.name}. 
Génère un parcours touristique personnalisé basé sur ces préférences :
- Centres d'intérêt : ${preferences.interests?.join(', ') || 'Général'}
- Niveau de difficulté : ${preferences.difficulty}
- Temps disponible : ${preferences.duration} minutes
- Taille du groupe : ${preferences.groupSize || 'Non spécifié'}
- Point de départ : ${preferences.startLocation || 'Centre-ville'}

Voici les étapes disponibles dans la ville (UTILISE UNIQUEMENT CES IDs) :
${steps.map(step => `- ID: ${step.id}, Nom: ${step.name}, Type: ${step.type || 'général'}, Points: ${step.points_awarded || 10}, Description: ${step.description || 'Pas de description'}`).join('\n')}

Voici les catégories disponibles (CHOISIS UNE DE CES CATÉGORIES) :
${categories.map(cat => `- Nom: ${cat.name}, Type: ${cat.type || 'général'}, Description: ${cat.description || 'Pas de description'}`).join('\n')}

Crée un parcours JSON avec cette structure EXACTE :
{
  "name": "Nom du parcours engageant",
  "description": "Description attrayante du parcours (2-3 phrases)",
  "category": "EXACTEMENT un des noms de catégorie ci-dessus",
  "difficulty": "${preferences.difficulty}",
  "estimatedDuration": ${parseInt(preferences.duration)},
  "steps": [
    {
      "stepId": "UUID exact d'une étape ci-dessus",
      "order": 1,
      "customInstructions": "Instructions personnalisées pour cette étape dans ce parcours"
    }
  ],
  "totalPoints": 50
}

RÈGLES IMPORTANTES :
- Utilise UNIQUEMENT les stepId fournis ci-dessus
- Choisis 3-6 étapes selon le temps disponible
- Ordonne les étapes de façon logique géographiquement
- Le nombre de points = nombre d'étapes × 10 environ
- Assure-toi que le JSON est valide
- NE RÉPONDS QU'AVEC LE JSON, rien d'autre
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'Tu es un assistant spécialisé dans la création de parcours touristiques. Tu réponds uniquement en JSON valide sans aucun texte supplémentaire.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      console.error('❌ OpenAI API request failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('❌ OpenAI error response:', errorText);
      throw new Error(`OpenAI API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📨 OpenAI response received');
    
    if (!data.choices || data.choices.length === 0) {
      console.error('❌ No choices in OpenAI response:', data);
      throw new Error('No response from OpenAI');
    }
    
    const journeyContent = data.choices[0].message.content;
    console.log('🤖 AI response content:', journeyContent);
    
    let journeyData: GeneratedJourney;
    try {
      // Clean the response to ensure it's valid JSON
      const cleanContent = journeyContent.trim().replace(/```json\n?|\n?```/g, '');
      journeyData = JSON.parse(cleanContent);
      console.log('✅ Successfully parsed AI response');
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', journeyContent);
      console.error('❌ Parse error:', parseError);
      throw new Error(`Invalid AI response format: ${parseError.message}`);
    }

    // Validate the generated journey structure
    if (!journeyData.name || !journeyData.steps || !Array.isArray(journeyData.steps)) {
      console.error('❌ Invalid journey structure:', journeyData);
      throw new Error('Invalid journey structure from AI');
    }

    if (journeyData.steps.length === 0) {
      console.error('❌ No steps in generated journey');
      throw new Error('Generated journey has no steps');
    }

    // Validate that all stepIds exist
    const validStepIds = new Set(steps.map(s => s.id));
    const invalidSteps = journeyData.steps.filter(step => !validStepIds.has(step.stepId));
    
    if (invalidSteps.length > 0) {
      console.error('❌ Invalid step IDs found:', invalidSteps.map(s => s.stepId));
      throw new Error(`Invalid step IDs: ${invalidSteps.map(s => s.stepId).join(', ')}`);
    }

    // Find matching category
    const matchingCategory = categories.find(cat => 
      cat.name === journeyData.category ||
      cat.type === journeyData.category || 
      cat.name.toLowerCase().includes(journeyData.category.toLowerCase())
    );
    
    if (!matchingCategory) {
      console.error('❌ Invalid category specified:', journeyData.category);
      console.error('❌ Available categories:', categories.map(c => c.name));
      // Use the first available category as fallback
      const fallbackCategory = categories[0];
      console.log('🔄 Using fallback category:', fallbackCategory.name);
      journeyData.category = fallbackCategory.name;
    }

    const finalCategory = matchingCategory || categories[0];
    
    console.log('✅ Journey generated successfully for user:', user.email, {
      name: journeyData.name,
      steps: journeyData.steps.length,
      category: finalCategory.name,
      duration: journeyData.estimatedDuration,
      points: journeyData.totalPoints
    });

    const response_data = {
      journey: {
        ...journeyData,
        categoryId: finalCategory.id,
        cityId: cityId,
        generatedByAi: true,
        generationParams: preferences
      }
    };

    return new Response(JSON.stringify(response_data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Error in generate-journey function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: error instanceof Error ? error.stack : 'No additional details'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
