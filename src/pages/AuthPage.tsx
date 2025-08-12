import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mountain, Mail, Lock, User, ArrowLeft, Loader2, AlertCircle, Chrome } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { PasswordResetService } from '@/services/passwordResetService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Footer from '@/components/common/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, isAuthenticated, hasRole, signOut, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const { t, refreshTranslations } = useLanguage();
  
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: ''
  });

  // Force refresh translations on mount to ensure magic link translations are loaded
  useEffect(() => {
    refreshTranslations();
  }, [refreshTranslations]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(formData.email, formData.password);
    
    if (!error) {
      navigate('/', { replace: true });
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return; // Toast will be shown by validation
    }
    
    setLoading(true);
    
    const { error } = await signUp(formData.email, formData.password, {
      firstName: formData.firstName,
      lastName: formData.lastName
    });
    
    setLoading(false);
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast({
        title: t('email_required'),
        description: t('enter_email'),
        variant: "destructive"
      });
      return;
    }

    setResetLoading(true);
    
    try {
      const result = await PasswordResetService.sendResetEmail(resetEmail);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "Email envoyé",
        description: "Un lien de réinitialisation a été envoyé à votre adresse email. Vérifiez votre boîte de réception.",
        variant: "default"
      });
      
      setResetEmail('');
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer l'email de réinitialisation",
        variant: "destructive"
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!resetEmail) {
      toast({
        title: t('email_required'),
        description: t('enter_email'),
        variant: "destructive"
      });
      return;
    }

    setMagicLinkLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: resetEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: t('magic_link_sent'),
        description: t('check_email_magic_link'),
        variant: "default"
      });
      
      setResetEmail('');
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || "Impossible d'envoyer le Magic Link",
        variant: "destructive"
      });
    } finally {
      setMagicLinkLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || "Erreur lors de la connexion avec Google",
        variant: "destructive"
      });
      setGoogleLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>{t('loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-alpine relative overflow-hidden">
      {/* Background with mountain effect */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Back to home button */}
      <div className="absolute top-6 left-6 z-10">
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('back_to_home')}
        </Button>
      </div>

      <div className="relative container mx-auto px-4 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Logo and title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Mountain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {t('welcome_to_ciara')}
            </h1>
            <p className="text-white/80">
              {t('your_adventure_starts')}
            </p>
          </div>

          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 p-1">
                <TabsTrigger 
                  value="signin" 
                  className="tab-blue-klein"
                >
                  {t('sign_in')}
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {t('sign_up')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <CardHeader>
                  <CardTitle className="text-center">{t('sign_in_title')}</CardTitle>
                  <CardDescription className="text-center">
                    {t('sign_in_subtitle')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">{t('email')}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          name="email"
                          type="email"
                          placeholder={t('email_placeholder')}
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">{t('password')}</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          name="password"
                          type="password"
                          placeholder={t('password_placeholder')}
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-klein hover:bg-blue-klein-dark text-white"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('signing_in')}
                        </>
                      ) : (
                        t('connect')
                      )}
                    </Button>

                    {/* Séparateur */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground">
                          {t('or')}
                        </span>
                      </div>
                    </div>

                    {/* Bouton Google */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-gray-300 hover:bg-gray-50"
                      onClick={handleGoogleSignIn}
                      disabled={googleLoading}
                    >
                      {googleLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('connecting')}
                        </>
                      ) : (
                        <>
                          <Chrome className="mr-2 h-4 w-4" />
                          {t('continue_with_google')}
                        </>
                      )}
                    </Button>
                    
                    {/* Lien mot de passe oublié */}
                    <div className="text-center mt-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button 
                            type="button"
                            className="text-sm text-muted-foreground hover:text-primary underline"
                          >
                            {t('forgot_password')}
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <Mail className="h-5 w-5" />
                              {t('password_reset_title')}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('password_reset_instruction')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="py-4">
                            <Label htmlFor="reset-email">{t('email_address')}</Label>
                            <Input
                              id="reset-email"
                              type="email"
                              placeholder={t('email_placeholder')}
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              className="mt-2"
                            />
                            
                            {/* Magic Link Option */}
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-sm text-blue-700 mb-3">
                                {t('magic_link_option')}
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleMagicLink}
                                disabled={magicLinkLoading || resetLoading}
                                className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                              >
                                {magicLinkLoading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('sending_magic_link')}
                                  </>
                                ) : (
                                  <>
                                    <Mail className="mr-2 h-4 w-4" />
                                    {t('send_magic_link')}
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={handlePasswordReset}
                              disabled={resetLoading || magicLinkLoading}
                            >
                              {resetLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  {t('sending')}
                                </>
                              ) : (
                                t('send_reset_link')
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </form>
                </CardContent>
              </TabsContent>

              <TabsContent value="signup">
                <CardHeader>
                  <CardTitle className="text-center">{t('create_account')}</CardTitle>
                  <CardDescription className="text-center">
                    {t('join_ciara_community')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">{t('first_name')}</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="firstName"
                            name="firstName"
                            type="text"
                            placeholder={t('first_name_placeholder')}
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName">{t('last_name')}</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          placeholder={t('last_name_placeholder')}
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">{t('email')}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          name="email"
                          type="email"
                          placeholder={t('email_placeholder')}
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">{t('password')}</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          name="password"
                          type="password"
                          placeholder={t('password_placeholder')}
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pl-10"
                          minLength={6}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">{t('confirm_password')}</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder={t('password_placeholder')}
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="text-sm text-destructive">
                          {t('passwords_not_match')}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={loading || formData.password !== formData.confirmPassword}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('signing_up')}
                        </>
                      ) : (
                        t('create_my_account')
                      )}
                    </Button>

                    {/* Séparateur */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground">
                          {t('or')}
                        </span>
                      </div>
                    </div>

                    {/* Bouton Google */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-gray-300 hover:bg-gray-50"
                      onClick={handleGoogleSignIn}
                      disabled={googleLoading}
                    >
                      {googleLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('connecting')}
                        </>
                      ) : (
                        <>
                          <Chrome className="mr-2 h-4 w-4" />
                          {t('continue_with_google')}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>

          <div className="text-center mt-6">
            <p className="text-white/70 text-sm">
              {t('terms_privacy_text')}{' '}
              <Link to="/terms" className="underline hover:text-white">
                {t('terms_of_use')}
              </Link>
              {' '}{t('and_our')}{' '}
              <Link to="/privacy" className="underline hover:text-white">
                {t('privacy_policy')}
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AuthPage;