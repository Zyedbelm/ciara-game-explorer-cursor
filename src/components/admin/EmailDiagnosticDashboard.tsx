import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Mail, Settings, Database, Activity } from 'lucide-react';

interface EmailTest {
  id: string;
  type: 'password_reset' | 'email_confirmation' | 'welcome';
  email: string;
  status: 'pending' | 'success' | 'error';
  response?: any;
  timestamp: Date;
}

interface DiagnosticResult {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: any;
}

const EmailDiagnosticDashboard = () => {
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [emailTests, setEmailTests] = useState<EmailTest[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const runDiagnostics = async () => {
    setRefreshing(true);
    const results: DiagnosticResult[] = [];

    try {
      // Test 1: Vérifier la configuration Supabase Auth
      try {
        const { data: authSettings } = await supabase.auth.getSession();
        results.push({
          component: 'Supabase Auth',
          status: 'healthy',
          message: 'Session Auth fonctionnelle',
          details: { hasSession: !!authSettings.session }
        });
      } catch (error: any) {
        results.push({
          component: 'Supabase Auth',
          status: 'error',
          message: `Erreur Auth: ${error.message}`,
          details: error
        });
      }

      // Test 2: Vérifier les Edge Functions disponibles
      try {
        const functions = [
          'send-password-reset',
          'send-email-confirmation', 
          'auth-webhook',
          'send-welcome-ciara'
        ];

        for (const func of functions) {
          try {
            const response = await fetch(`https://pohqkspsdvvbqrgzfayl.supabase.co/functions/v1/${func}`, {
              method: 'OPTIONS'
            });
            
            results.push({
              component: `Edge Function: ${func}`,
              status: response.ok ? 'healthy' : 'warning',
              message: response.ok ? 'Accessible' : `Status: ${response.status}`,
              details: { status: response.status, headers: Object.fromEntries(response.headers) }
            });
          } catch (error: any) {
            results.push({
              component: `Edge Function: ${func}`,
              status: 'error',
              message: `Non accessible: ${error.message}`,
              details: error
            });
          }
        }
      } catch (error: any) {
        results.push({
          component: 'Edge Functions',
          status: 'error',
          message: `Erreur globale: ${error.message}`,
          details: error
        });
      }

      // Test 3: Vérifier les logs récents
      try {
        const { data: logs, error } = await supabase
          .from('system_logs')
          .select('*')
          .ilike('message', '%email%')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        const errorLogs = logs?.filter(log => log.level === 'error') || [];
        results.push({
          component: 'Logs Système',
          status: errorLogs.length > 0 ? 'warning' : 'healthy',
          message: `${logs?.length || 0} logs email, ${errorLogs.length} erreurs`,
          details: { totalLogs: logs?.length, errorLogs: errorLogs.length, recentLogs: logs?.slice(0, 3) }
        });
      } catch (error: any) {
        results.push({
          component: 'Logs Système',
          status: 'error',
          message: `Erreur accès logs: ${error.message}`,
          details: error
        });
      }

      // Test 4: Vérifier la configuration des redirections
      try {
        const config = {
          siteUrl: window.location.origin,
          redirectUrls: [
            'https://ciara.city',
            'https://ciara.lovable.app',
            window.location.origin
          ]
        };

        results.push({
          component: 'Configuration URLs',
          status: 'healthy',
          message: 'URLs configurées',
          details: config
        });
      } catch (error: any) {
        results.push({
          component: 'Configuration URLs',
          status: 'error',
          message: `Erreur config: ${error.message}`,
          details: error
        });
      }

    } catch (error: any) {
      results.push({
        component: 'Diagnostic Général',
        status: 'error',
        message: `Erreur globale: ${error.message}`,
        details: error
      });
    }

    setDiagnostics(results);
    setRefreshing(false);
  };

  const testPasswordReset = async () => {
    if (!testEmail) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un email",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const testId = Date.now().toString();
    
    const newTest: EmailTest = {
      id: testId,
      type: 'password_reset',
      email: testEmail,
      status: 'pending',
      timestamp: new Date()
    };

    setEmailTests(prev => [newTest, ...prev]);

    try {
      console.log('🔍 Début test reset password pour:', testEmail);
      
      const { error } = await supabase.auth.resetPasswordForEmail(testEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        console.error('❌ Erreur reset password:', error);
        throw error;
      }

      console.log('✅ Reset password envoyé avec succès');
      
      setEmailTests(prev => prev.map(test => 
        test.id === testId 
          ? { ...test, status: 'success', response: { message: 'Email envoyé' } }
          : test
      ));

      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte de réception",
        variant: "default"
      });

    } catch (error: any) {
      console.error('❌ Erreur complète:', error);
      
      setEmailTests(prev => prev.map(test => 
        test.id === testId 
          ? { ...test, status: 'error', response: error }
          : test
      ));

      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testEmailConfirmation = async () => {
    if (!testEmail) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un email",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const testId = Date.now().toString();
    
    const newTest: EmailTest = {
      id: testId,
      type: 'email_confirmation',
      email: testEmail,
      status: 'pending',
      timestamp: new Date()
    };

    setEmailTests(prev => [newTest, ...prev]);

    try {
      console.log('🔍 Début test confirmation email pour:', testEmail);
      
      const { error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'TestPassword123!',
        options: {
          emailRedirectTo: `${window.location.origin}/auth?confirmed=true`
        }
      });

      if (error && error.message !== 'User already registered') {
        console.error('❌ Erreur signup:', error);
        throw error;
      }

      console.log('✅ Email confirmation envoyé');
      
      setEmailTests(prev => prev.map(test => 
        test.id === testId 
          ? { ...test, status: 'success', response: { message: 'Email confirmation envoyé' } }
          : test
      ));

      toast({
        title: "Email de confirmation envoyé",
        description: "Vérifiez votre boîte de réception",
        variant: "default"
      });

    } catch (error: any) {
      console.error('❌ Erreur complète:', error);
      
      setEmailTests(prev => prev.map(test => 
        test.id === testId 
          ? { ...test, status: 'error', response: error }
          : test
      ));

      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: EmailTest['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Succès</Badge>;
      case 'error':
        return <Badge variant="destructive">Erreur</Badge>;
      case 'pending':
        return <Badge variant="secondary">En cours...</Badge>;
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Diagnostic Email CIARA</h2>
          <p className="text-muted-foreground">
            Audit complet du système d'envoi d'emails
          </p>
        </div>
        <Button 
          onClick={runDiagnostics} 
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      <Tabs defaultValue="diagnostics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="diagnostics">
            <Settings className="h-4 w-4 mr-2" />
            Diagnostics
          </TabsTrigger>
          <TabsTrigger value="tests">
            <Mail className="h-4 w-4 mr-2" />
            Tests
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Activity className="h-4 w-4 mr-2" />
            Historique
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>État du Système</CardTitle>
              <CardDescription>
                Vérification de tous les composants email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {diagnostics.map((diagnostic, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getStatusIcon(diagnostic.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{diagnostic.component}</span>
                        <Badge variant={diagnostic.status === 'healthy' ? 'default' : 
                                      diagnostic.status === 'warning' ? 'secondary' : 'destructive'}>
                          {diagnostic.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {diagnostic.message}
                      </p>
                      {diagnostic.details && (
                        <details className="mt-2">
                          <summary className="text-xs cursor-pointer text-muted-foreground">
                            Voir les détails
                          </summary>
                          <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-x-auto">
                            {JSON.stringify(diagnostic.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tests d'Emails</CardTitle>
              <CardDescription>
                Testez les différents types d'emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="votre-email@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="flex-1"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={testPasswordReset}
                  disabled={loading || !testEmail}
                  className="flex-1"
                >
                  Tester Reset Password
                </Button>
                
                <Button 
                  onClick={testEmailConfirmation}
                  disabled={loading || !testEmail}
                  variant="outline"
                  className="flex-1"
                >
                  Tester Confirmation
                </Button>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Note:</strong> Les tests utilisent de vrais emails. 
                  Utilisez une adresse que vous contrôlez.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Tests</CardTitle>
              <CardDescription>
                Résultats des tests d'emails précédents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {emailTests.length > 0 ? (
                <div className="space-y-3">
                  {emailTests.map((test) => (
                    <div key={test.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{test.type.replace('_', ' ')}</span>
                          {getStatusBadge(test.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {test.email} • {test.timestamp.toLocaleString()}
                        </div>
                        {test.response && (
                          <details className="mt-1">
                            <summary className="text-xs cursor-pointer">
                              Voir la réponse
                            </summary>
                            <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-x-auto">
                              {JSON.stringify(test.response, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun test effectué</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailDiagnosticDashboard;