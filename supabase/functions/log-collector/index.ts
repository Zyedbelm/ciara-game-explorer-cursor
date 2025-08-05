import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LogEntry {
  timestamp: string;
  level: string;
  category: string;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  emailId?: string;
  functionName?: string;
  duration?: number;
  success?: boolean;
  errorCode?: string;
  retryCount?: number;
  metadata?: Record<string, any>;
}

interface LogCollectorRequest {
  logs: LogEntry[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { logs }: LogCollectorRequest = await req.json();

    if (!Array.isArray(logs) || logs.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid logs data' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`📊 Processing ${logs.length} log entries`);

    // Process logs in batches
    const batchSize = 100;
    const results = [];

    for (let i = 0; i < logs.length; i += batchSize) {
      const batch = logs.slice(i, i + batchSize);
      
      try {
        // Insert logs into system_logs table
        const { data, error } = await supabase
          .from('system_logs')
          .insert(
            batch.map(log => ({
              level: log.level,
              message: log.message,
              context: log.context || {},
              user_id: log.userId || null,
              created_at: log.timestamp,
              metadata: {
                sessionId: log.sessionId,
                emailId: log.emailId,
                functionName: log.functionName,
                duration: log.duration,
                success: log.success,
                errorCode: log.errorCode,
                retryCount: log.retryCount,
                category: log.category,
                ...log.metadata
              }
            }))
          );

        if (error) {
          console.error('❌ Error inserting log batch:', error);
          results.push({ success: false, error: error.message });
        } else {
          console.log(`✅ Successfully inserted batch of ${batch.length} logs`);
          results.push({ success: true, count: batch.length });
        }

        // Check for critical errors and send alerts
        const criticalLogs = batch.filter(log => log.level === 'critical');
        if (criticalLogs.length > 0) {
          await sendCriticalAlerts(criticalLogs);
        }

        // Check for email failures and update metrics
        const emailLogs = batch.filter(log => log.category === 'email');
        if (emailLogs.length > 0) {
          await updateEmailMetrics(emailLogs);
        }

      } catch (batchError) {
        console.error('❌ Error processing log batch:', batchError);
        results.push({ success: false, error: 'Batch processing failed' });
      }
    }

    // Cleanup old logs (keep last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    try {
      const { error: cleanupError } = await supabase
        .from('system_logs')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString());

      if (cleanupError) {
        console.warn('⚠️ Cleanup warning:', cleanupError);
      }
    } catch (cleanupErr) {
      console.warn('⚠️ Log cleanup failed:', cleanupErr);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: logs.length,
        results 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('💥 Log collector error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

// Send alerts for critical errors
async function sendCriticalAlerts(criticalLogs: LogEntry[]) {
  try {
    for (const log of criticalLogs) {
      // Send to monitoring service or email alert
      console.log('🚨 CRITICAL ALERT:', log.message, log.context);
      
      // Here you could integrate with services like:
      // - Slack webhooks
      // - Email alerts
      // - PagerDuty
      // - Discord webhooks
      
      if (log.category === 'email' && log.context?.email) {
        // Email-specific critical alert
        await supabase.functions.invoke('send-critical-alert', {
          body: {
            type: 'email_critical_failure',
            message: log.message,
            email: log.context.email,
            timestamp: log.timestamp,
            context: log.context
          }
        });
      }
    }
  } catch (error) {
    console.error('❌ Failed to send critical alerts:', error);
  }
}

// Update email metrics in real-time
async function updateEmailMetrics(emailLogs: LogEntry[]) {
  try {
    const metrics = {
      sent: 0,
      failed: 0,
      retried: 0,
      bounced: 0,
      opened: 0,
      clicked: 0
    };

    emailLogs.forEach(log => {
      const event = log.context?.event;
      if (event && event in metrics) {
        metrics[event as keyof typeof metrics]++;
      }
    });

    // Update metrics table
    const { error } = await supabase
      .from('email_metrics')
      .upsert({
        date: new Date().toISOString().split('T')[0],
        ...metrics,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'date'
      });

    if (error) {
      console.error('❌ Failed to update email metrics:', error);
    }
    
  } catch (error) {
    console.error('❌ Error updating email metrics:', error);
  }
}

serve(handler);
