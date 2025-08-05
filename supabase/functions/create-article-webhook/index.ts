import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-token, x-compressed-content',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ArticleData {
  title: string
  content: string
  category?: string
  city_id?: string
  excerpt?: string
  featured_image_url?: string
  status?: 'draft' | 'published'
  language?: string
  tags?: string[]
  is_featured?: boolean
  title_en?: string
  title_de?: string
  content_en?: string
  content_de?: string
  excerpt_en?: string
  excerpt_de?: string
}

Deno.serve(async (req) => {
  // Log incoming request details for debugging
  console.log('Webhook request received:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
    contentType: req.headers.get('content-type'),
    isCompressed: req.headers.get('content-encoding'),
  });

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      console.error('Invalid method:', req.method);
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check content type
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Invalid content type:', contentType);
      return new Response(JSON.stringify({ 
        error: 'Content-Type must be application/json',
        received: contentType 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify webhook token for security
    const webhookToken = req.headers.get('x-webhook-token');
    const expectedToken = Deno.env.get('WEBHOOK_TOKEN');
    
    if (!expectedToken || webhookToken !== expectedToken) {
      console.log('Unauthorized webhook request - token mismatch');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ENHANCED MULTI-PASS JSON CLEANING IMPLEMENTATION
    let bodyText: string;
    let cleaningLog: string[] = [];
    
    // Comprehensive list of problematic Unicode characters
    const PROBLEMATIC_CHARS = {
      // Zero-width characters
      zeroWidth: [
        '\u200B', // Zero-width space (ZWSP)
        '\u200C', // Zero-width non-joiner (ZWNJ)
        '\u200D', // Zero-width joiner (ZWJ)
        '\u2060', // Word joiner (WJ)
        '\uFEFF', // Byte order mark (BOM)
        '\u200E', // Left-to-right mark
        '\u200F', // Right-to-left mark
      ],
      // Invisible spaces and separators
      invisibleSpaces: [
        '\u00A0', // Non-breaking space
        '\u1680', // Ogham space mark
        '\u2000', // En quad
        '\u2001', // Em quad
        '\u2002', // En space
        '\u2003', // Em space
        '\u2004', // Three-per-em space
        '\u2005', // Four-per-em space
        '\u2006', // Six-per-em space
        '\u2007', // Figure space
        '\u2008', // Punctuation space
        '\u2009', // Thin space
        '\u200A', // Hair space
        '\u202F', // Narrow no-break space
        '\u205F', // Medium mathematical space
        '\u3000', // Ideographic space
      ],
      // Line and paragraph separators
      lineSeparators: [
        '\u2028', // Line separator
        '\u2029', // Paragraph separator
        '\u0085', // Next line (NEL)
      ],
      // Format characters
      formatChars: [
        '\u061C', // Arabic letter mark
        '\u2066', // Left-to-right isolate
        '\u2067', // Right-to-left isolate
        '\u2068', // First strong isolate
        '\u2069', // Pop directional isolate
      ]
    };
    
    // Multi-pass cleaning function
    const performMultiPassCleaning = (input: string): { cleaned: string; log: string[] } => {
      let result = input;
      const log: string[] = [];
      const originalLength = input.length;
      
      // PASS 1: Remove all problematic Unicode characters
      Object.entries(PROBLEMATIC_CHARS).forEach(([category, chars]) => {
        chars.forEach(char => {
          const beforeCount = result.split(char).length - 1;
          if (beforeCount > 0) {
            result = result.replace(new RegExp(char, 'g'), '');
            log.push(`Pass 1 - ${category}: Removed ${beforeCount} instances of char 0x${char.charCodeAt(0).toString(16)}`);
          }
        });
      });
      
      // PASS 2: Extended regex cleaning for control and formatting characters
      const beforePass2 = result;
      // Remove all control characters (0x00-0x1F), DEL (0x7F), and C1 controls (0x80-0x9F)
      result = result.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      // Remove additional Unicode format and invisible characters
      result = result.replace(/[\u2000-\u200F\u2028-\u202F\u2060-\u206F]/g, '');
      
      if (beforePass2 !== result) {
        log.push(`Pass 2 - Control chars: Removed ${beforePass2.length - result.length} characters`);
      }
      
      // PASS 3: Aggressive whitespace normalization
      const beforePass3 = result;
      // Replace all Unicode whitespace with regular space, then normalize
      result = result.replace(/[\s\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/g, ' ');
      // Normalize multiple spaces
      result = result.replace(/\s+/g, ' ');
      // Trim all whitespace from start and end
      result = result.trim();
      
      if (beforePass3 !== result) {
        log.push(`Pass 3 - Whitespace: Normalized and trimmed, length change: ${beforePass3.length - result.length}`);
      }
      
      // PASS 4: JSON structure validation and cleanup
      const beforePass4 = result;
      
      // Find the last closing brace
      const lastBraceIndex = result.lastIndexOf('}');
      if (lastBraceIndex !== -1 && lastBraceIndex < result.length - 1) {
        const trailingContent = result.substring(lastBraceIndex + 1);
        log.push(`Pass 4 - Structure: Found trailing content after JSON (${trailingContent.length} chars)`);
        
        // Detailed analysis of trailing characters
        const charAnalysis = Array.from(trailingContent).map((char, index) => {
          const code = char.charCodeAt(0);
          return `  [${index}]: "${char}" (dec:${code}, hex:0x${code.toString(16)}, category:${getCharCategory(code)})`;
        }).join('\n');
        log.push(`Pass 4 - Trailing chars analysis:\n${charAnalysis}`);
        
        result = result.substring(0, lastBraceIndex + 1);
        log.push(`Pass 4 - Structure: Truncated to valid JSON end`);
      }
      
      // PASS 5: Final validation and character encoding check
      const beforePass5 = result;
      // Replace any remaining problematic characters that might cause JSON parsing issues
      result = result.replace(/[\uD800-\uDFFF]/g, ''); // Remove surrogate pairs
      result = result.replace(/[\uFDD0-\uFDEF]/g, ''); // Remove non-characters
      result = result.replace(/[\uFFFE-\uFFFF]/g, ''); // Remove more non-characters
      
      if (beforePass5 !== result) {
        log.push(`Pass 5 - Encoding: Removed invalid Unicode sequences, length change: ${beforePass5.length - result.length}`);
      }
      
      log.push(`Multi-pass cleaning complete: ${originalLength} → ${result.length} characters (${originalLength - result.length} removed)`);
      
      return { cleaned: result, log };
    };
    
    // Helper function to categorize characters
    const getCharCategory = (code: number): string => {
      if (code >= 0x0000 && code <= 0x001F) return 'C0-Control';
      if (code >= 0x007F && code <= 0x009F) return 'C1-Control';
      if (code >= 0x2000 && code <= 0x200F) return 'General-Punctuation';
      if (code >= 0x2028 && code <= 0x202F) return 'Line-Para-Separators';
      if (code >= 0x2060 && code <= 0x206F) return 'Format-Characters';
      if (code >= 0xFDD0 && code <= 0xFDEF) return 'Non-Character';
      if (code === 0xFEFF) return 'BOM';
      return 'Other';
    };
    
    try {
      bodyText = await req.text();
      const originalBodyLength = bodyText.length;
      
      console.log('=== ENHANCED JSON PROCESSING START ===');
      console.log('Raw request body length:', originalBodyLength);
      console.log('Raw request body (first 1000 chars):', bodyText.substring(0, 1000));
      
      // Show raw character codes around the problem area (position 517)
      if (originalBodyLength > 515) {
        const problemArea = bodyText.substring(510, 525);
        console.log('Character analysis around position 517:');
        Array.from(problemArea).forEach((char, index) => {
          const pos = 510 + index;
          const code = char.charCodeAt(0);
          console.log(`  [${pos}]: "${char}" (dec:${code}, hex:0x${code.toString(16)}, cat:${getCharCategory(code)})`);
        });
      }
      
      // Check for common issues before cleaning
      if (bodyText.length === 0) {
        console.error('Empty request body received');
        return new Response(JSON.stringify({ 
          error: 'Empty request body',
          bodyLength: 0
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (bodyText.trim().startsWith('<')) {
        console.error('HTML content received instead of JSON:', bodyText.substring(0, 200));
        return new Response(JSON.stringify({ 
          error: 'HTML content received instead of JSON',
          receivedContent: bodyText.substring(0, 200)
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Execute multi-pass cleaning
      const { cleaned, log } = performMultiPassCleaning(bodyText);
      bodyText = cleaned;
      cleaningLog = log;
      
      // Enhanced logging
      console.log('=== MULTI-PASS CLEANING RESULTS ===');
      cleaningLog.forEach(logEntry => console.log(logEntry));
      
      console.log('=== FINAL CLEANED RESULT ===');
      console.log(`Final length: ${bodyText.length}`);
      console.log('Final content (first 500 chars):', bodyText.substring(0, 500));
      console.log('Final content (last 50 chars):', bodyText.slice(-50));
      
      // Length validation
      const expectedMinLength = 200; // Rough estimate for minimum valid JSON
      if (bodyText.length < expectedMinLength) {
        console.warn(`Cleaned body seems too short (${bodyText.length} chars), might be over-cleaned`);
      }
      
      // JSON structure validation
      const openBraces = (bodyText.match(/\{/g) || []).length;
      const closeBraces = (bodyText.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        console.error(`JSON structure issue: ${openBraces} opening braces vs ${closeBraces} closing braces`);
      }
      
      console.log(`JSON structure check: ${openBraces} open braces, ${closeBraces} close braces`);
      console.log('=== ENHANCED JSON PROCESSING END ===');
      
    } catch (textError) {
      console.error('Error reading request body as text:', textError);
      return new Response(JSON.stringify({ 
        error: 'Failed to read request body',
        details: textError.message
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Progressive JSON validation with fallback attempts
    let requestData: ArticleData;
    let parseAttempts: string[] = [];
    
    try {
      // Attempt 1: Direct parsing
      requestData = JSON.parse(bodyText) as ArticleData;
      console.log('✓ Successfully parsed JSON on first attempt');
    } catch (parseError) {
      parseAttempts.push(`Attempt 1 failed: ${parseError.message}`);
      
      try {
        // Attempt 2: Try with additional character replacements
        const sanitizedBody = bodyText
          .replace(/[\u0080-\u00FF]/g, '') // Remove extended ASCII
          .replace(/\r\n/g, '\n') // Normalize line endings
          .replace(/\r/g, '\n');
        
        requestData = JSON.parse(sanitizedBody) as ArticleData;
        console.log('✓ Successfully parsed JSON on second attempt (after additional sanitization)');
        parseAttempts.push('Attempt 2 succeeded with extended sanitization');
      } catch (parseError2) {
        parseAttempts.push(`Attempt 2 failed: ${parseError2.message}`);
        
        try {
          // Attempt 3: Try parsing with escaped quotes fix
          const quotesFixedBody = bodyText.replace(/([^\\])"/g, '$1\\"');
          requestData = JSON.parse(quotesFixedBody) as ArticleData;
          console.log('✓ Successfully parsed JSON on third attempt (after quotes fix)');
          parseAttempts.push('Attempt 3 succeeded with quotes fix');
        } catch (parseError3) {
          parseAttempts.push(`Attempt 3 failed: ${parseError3.message}`);
          
          // Final attempt: log detailed error information
          console.error('All JSON parsing attempts failed:');
          parseAttempts.forEach((attempt, index) => {
            console.error(`  ${index + 1}. ${attempt}`);
          });
          console.error('Final body for parsing:', bodyText);
          console.error('Body character analysis:');
          
          // Analyze problematic characters
          const charAnalysis = Array.from(bodyText.slice(-50)).map((char, index) => {
            const code = char.charCodeAt(0);
            return `${bodyText.length - 50 + index}: "${char}" (${code}, 0x${code.toString(16)})`;
          }).join('\n  ');
          console.error(`Last 50 characters:\n  ${charAnalysis}`);
          
          return new Response(JSON.stringify({ 
            error: 'Invalid JSON in request body - all parsing attempts failed',
            originalError: parseError.message,
            attempts: parseAttempts,
            bodyLength: bodyText.length,
            cleaningLog: cleaningLog,
            lastChars: bodyText.slice(-20)
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    console.log('Received article data:', requestData);

    // Validate required fields
    if (!requestData.title || !requestData.content) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: title and content are required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate slug from title
    const generateSlug = (title: string): string => {
      return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim()
        .slice(0, 100); // Limit length
    };

    let slug = generateSlug(requestData.title);

    // Check for existing slug and make it unique
    let counter = 1;
    let uniqueSlug = slug;
    
    while (true) {
      const { data: existingArticle } = await supabase
        .from('articles')
        .select('id')
        .eq('slug', uniqueSlug)
        .single();

      if (!existingArticle) break;
      
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    // Generate tags based on category and content
    const generateTags = (content: string, category?: string): string[] => {
      const tags: string[] = [];
      
      if (category) {
        tags.push(category);
      }
      
      // Extract keywords from content (simplified approach)
      const keywords = [
        'tourisme', 'voyage', 'culture', 'gastronomie', 'histoire',
        'nature', 'patrimoine', 'découverte', 'randonnée', 'art'
      ];
      
      const contentLower = content.toLowerCase();
      keywords.forEach(keyword => {
        if (contentLower.includes(keyword) && !tags.includes(keyword)) {
          tags.push(keyword);
        }
      });
      
      // Add custom tags if provided
      if (requestData.tags) {
        requestData.tags.forEach(tag => {
          if (!tags.includes(tag)) {
            tags.push(tag);
          }
        });
      }
      
      return tags.slice(0, 5); // Limit to 5 tags
    };

    // Generate excerpt if not provided
    const generateExcerpt = (content: string): string => {
      return content
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .substring(0, 200)
        .trim() + '...';
    };

    // Function to clean UUID fields - convert empty strings to null
    const cleanUuidField = (value: string | undefined | null): string | null => {
      if (!value || value.trim() === '') {
        return null;
      }
      return value.trim();
    };

    // Prepare article data
    const articleData = {
      title: requestData.title,
      slug: uniqueSlug,
      content: requestData.content,
      category: requestData.category || 'general',
      city_id: cleanUuidField(requestData.city_id),
      excerpt: requestData.excerpt || generateExcerpt(requestData.content),
      featured_image_url: requestData.featured_image_url || null,
      status: requestData.status || 'draft',
      language: requestData.language || 'fr',
      tags: generateTags(requestData.content, requestData.category),
      is_featured: requestData.is_featured || false,
      title_en: requestData.title_en || null,
      title_de: requestData.title_de || null,
      content_en: requestData.content_en || null,
      content_de: requestData.content_de || null,
      excerpt_en: requestData.excerpt_en || null,
      excerpt_de: requestData.excerpt_de || null,
      created_by: null, // Will be set by webhook
      updated_by: null,
      published_at: requestData.status === 'published' ? new Date().toISOString() : null
    };

    console.log('Creating article with data:', articleData);

    // Insert article into database
    const { data: article, error } = await supabase
      .from('articles')
      .insert(articleData)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to create article', 
        details: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Article created successfully:', article.id);

    // Return success response
    return new Response(JSON.stringify({
      success: true,
      article: {
        id: article.id,
        title: article.title,
        slug: article.slug,
        status: article.status,
        created_at: article.created_at
      }
    }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});