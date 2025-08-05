import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const EmailTestPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const testPasswordReset = async () => {
    if (!email) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un email",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://ciara.city/reset-password'
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte de réception",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testSignup = async () => {
    if (!email) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un email",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: 'Test123!',
        options: {
          emailRedirectTo: 'https://ciara.city/',
          data: {
            first_name: 'Test',
            last_name: 'User'
          }
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Email d'inscription envoyé",
        description: "Vérifiez votre boîte de réception",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Test des Emails CIARA</CardTitle>
          <CardDescription>
            Testez les fonctions d'envoi d'email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            placeholder="votre-email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <div className="space-y-2">
            <Button 
              onClick={testPasswordReset}
              disabled={loading}
              className="w-full"
            >
              Tester Reset Password
            </Button>
            
            <Button 
              onClick={testSignup}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Tester Inscription
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>🔍 Debug Info:</strong></p>
            <p>• Auth webhook: Configuré et actif</p>
            <p>• Redirection: https://ciara.city</p>
            <p>• Domaine email: info@ciara.city</p>
            <hr className="my-3" />
            <p><strong>✅ Tests effectués:</strong></p>
            <p>• Templates stylés avec gradient CIARA</p>
            <p>• URLs forcées vers ciara.city</p>
            <p>• CORS headers configurés</p>
            <p>• Logs détaillés pour debug</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTestPage;