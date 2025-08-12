import React, { useState, useEffect, useMemo } from 'react';
import { useStableAuth } from '@/hooks/useStableAuth';
import { useOptimizedUserStats } from '@/hooks/useOptimizedUserStats';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSearchParams } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import BadgeDisplay from '@/components/profile/BadgeDisplay';
import AvatarUpload from '@/components/profile/AvatarUpload';
import MonthlyStatsCard from '@/components/profile/MonthlyStatsCard';
import FitnessSegmented from '@/components/profile/FitnessSegmented';
import { 
  User, 
  MapPin, 
  Calendar, 
  Trophy, 
  Star,
  Settings,
  Edit,
  Save,
  X,
  Mail,
  Lock,
  Shield,
  CheckCircle,
  Loader2,
  Check,
  ChevronsUpDown,
  Heart,
  Zap,
  Camera
} from 'lucide-react';

const ProfilePage = () => {
  const { user, profile, loading, isAuthenticated, refreshProfile, updateProfile, updateEmail, updatePassword } = useStableAuth();
  const { stats, loading: statsLoading } = useOptimizedUserStats();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [cityName, setCityName] = useState<string>('');
  const { toast } = useToast();

  // Loading states
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  
  // Form states
  const [cities, setCities] = useState<any[]>([]);
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [cityPopoverOpen, setCityPopoverOpen] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  
  // Password form (sans current password)
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Available interests
  const availableInterests = [
    'nature', 'culture', 'gastronomy', 'sports', 'history', 
    'art', 'heritage', 'adventure', 'museums', 'architecture'
  ];

  // Editable form data
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    city_name: '',
    fitness_level: profile?.fitness_level || '3',
    preferred_languages: profile?.preferred_languages || ['fr'],
    interests: profile?.interests || []
  });

  // Load cities
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const { data, error } = await supabase
          .from('cities')
          .select('id, name, country')
          .order('name');
        
        if (!error && data) {
          setCities(data);
        }
      } catch (error) {
        console.warn('Error loading cities:', error);
      }
    };
    fetchCities();
  }, []);

  // Optimisation : Récupérer le nom de la ville avec cache
  useEffect(() => {
    const fetchCityName = async () => {
      if (profile?.city_id) {
        try {
          const { data: city, error } = await supabase
            .from('cities')
            .select('name')
            .eq('id', profile.city_id)
            .single();
          
          if (city && !error) {
            setCityName(city.name);
          }
        } catch (error) {
          console.warn('Erreur lors de la récupération du nom de la ville:', error);
        }
      } else {
        setCityName('');
      }
    };

    fetchCityName();
  }, [profile?.city_id]);

  // Sync form data with profile
  useEffect(() => {
    if (profile) {
      const getCityName = async () => {
        let cityName = '';
        if (profile.city_id) {
          const city = cities.find(c => c.id === profile.city_id);
          if (city) {
            cityName = `${city.name}, ${city.country}`;
          }
        }
        
        setFormData({
          full_name: profile.full_name || '',
          city_name: cityName,
          fitness_level: profile.fitness_level || '3',
          preferred_languages: profile.preferred_languages || ['fr'],
          interests: profile.interests || []
        });
      };
      
      getCityName();
    }
  }, [profile, cities]);

  // Optimisation : Calculs mémorisés
  const userInitials = useMemo(() => {
    if (profile?.full_name) {
      const names = profile.full_name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return profile.full_name[0].toUpperCase();
    }
    return profile?.email?.[0]?.toUpperCase() || 'U';
  }, [profile?.full_name, profile?.email]);

  const levelInfo = useMemo(() => {
    const points = profile?.total_points || 0;
    if (points < 100) return { level: 1, name: t('profile.badges.explorer'), progress: points };
    if (points < 500) return { level: 2, name: t('profile.badges.adventurer'), progress: ((points - 100) / 400) * 100 };
    if (points < 1000) return { level: 3, name: t('profile.badges.expert'), progress: ((points - 500) / 500) * 100 };
    return { level: 4, name: t('profile.badges.ambassador'), progress: 100 };
  }, [profile?.total_points, t]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInterestToggle = (interest: string) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter(i => i !== interest)
      : [...formData.interests, interest];
    handleInputChange('interests', newInterests);
  };

  const handleSave = async () => {
    setIsProfileLoading(true);
    
    try {
      const selectedCity = cities.find(city => 
        `${city.name}, ${city.country}` === formData.city_name
      );
      
      const result = await updateProfile({
        full_name: formData.full_name,
        city_id: selectedCity?.id || null,
        fitness_level: formData.fitness_level,
        preferred_languages: formData.preferred_languages,
        interests: formData.interests
      });

      if (result?.error) {
        throw result.error;
      }

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès",
      });

      setIsEditing(false);
      refreshProfile();
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowEmailChange(false);
    setShowPasswordChange(false);
    setNewEmail('');
    setPasswords({ newPassword: '', confirmPassword: '' });
    setPasswordErrors([]);
    
    // Reset form data to original profile data
    if (profile) {
      const getCityName = async () => {
        let cityName = '';
        if (profile.city_id) {
          const city = cities.find(c => c.id === profile.city_id);
          if (city) {
            cityName = `${city.name}, ${city.country}`;
          }
        }
        
        setFormData({
          full_name: profile.full_name || '',
          city_name: cityName,
          fitness_level: profile.fitness_level || '3',
          preferred_languages: profile.preferred_languages || ['fr'],
          interests: profile.interests || []
        });
      };
      
      getCityName();
    }
  };

  const handleCitySelect = (cityName: string) => {
    handleInputChange('city_name', cityName);
    setCityPopoverOpen(false);
  };

  const filteredCities = cities.filter(city =>
    `${city.name}, ${city.country}`.toLowerCase().includes(formData.city_name.toLowerCase())
  ).slice(0, 10);

  // Password functions (sans current password)
  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }
    if (password.length > 128) {
      errors.push('Le mot de passe ne doit pas dépasser 128 caractères');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }
    
    const commonPasswords = ['password', 'password123', '123456', 'qwerty', 'admin'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      errors.push('Le mot de passe ne doit pas contenir de mots communs');
    }
    
    return errors;
  };

  const handlePasswordChange = (field: 'newPassword' | 'confirmPassword', value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
    
    if (field === 'newPassword' && value.length > 0) {
      const errors = validatePassword(value);
      if (passwords.confirmPassword && value !== passwords.confirmPassword) {
        errors.push('Les mots de passe ne correspondent pas');
      }
      setPasswordErrors(errors);
    } else if (field === 'confirmPassword' && value.length > 0) {
      const errors = validatePassword(passwords.newPassword);
      if (passwords.newPassword !== value) {
        errors.push('Les mots de passe ne correspondent pas');
      }
      setPasswordErrors(errors);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validatePassword(passwords.newPassword);
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      errors.push('Les mots de passe ne correspondent pas');
    }
    
    if (errors.length > 0) {
      setPasswordErrors(errors);
      return;
    }
    
    setIsPasswordLoading(true);
    setPasswordErrors([]);
    
    try {
      const result = await updatePassword(passwords.newPassword);
      
      if (result?.error) {
        throw result.error;
      }
      
      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été modifié avec succès",
      });
      
      setPasswords({ newPassword: '', confirmPassword: '' });
      setShowPasswordChange(false);
      setPasswordErrors([]);
      
    } catch (error: any) {
      console.error('Erreur lors du changement de mot de passe:', error);
      
      const errorMessage = 'Impossible de modifier le mot de passe. Veuillez réessayer.';
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      
      setPasswordErrors([errorMessage]);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleEmailChange = async () => {
    if (!newEmail) return;
    
    setIsEmailLoading(true);
    
    try {
      const result = await updateEmail(newEmail);
      
      if (result?.error) {
        throw result.error;
      }
      
      toast({
        title: "Email modifié",
        description: "Un email de confirmation a été envoyé",
      });
      
      setShowEmailChange(false);
      setNewEmail('');
    } catch (error: any) {
      console.error('Erreur lors du changement d\'email:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier l'email",
        variant: "destructive",
      });
    } finally {
      setIsEmailLoading(false);
    }
  };

  // État de chargement optimisé
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span>Chargement du profil...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <StandardPageLayout 
      showBackButton 
      title={t('profile.title')}
      className="space-y-4"
    >
      {/* LAYOUT GRID 2x2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* LIGNE 1 : MODE NORMAL = PROFIL (span 2) | MODE ÉDITION = PROFIL + MOT DE PASSE */}
        {!isEditing ? (
          /* MODE NORMAL - Profil sur 2 colonnes */
          <Card className="lg:col-span-2 border-l-2 border-l-primary bg-gradient-to-br from-primary/5 via-primary/3 to-background shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <Avatar className="h-20 w-20 border-4 border-white shadow-xl ring-2 ring-primary/20">
              <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary to-primary-light text-primary-foreground">
                {userInitials}
              </AvatarFallback>
            </Avatar>
                </div>
            
            <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-primary-dark truncate">{profile?.full_name || 'Utilisateur'}</h2>
                  <p className="text-primary/80 truncate">{profile?.email}</p>
              {cityName && (
                    <div className="flex items-center gap-1 text-sm text-primary/70 mt-1">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{cityName}</span>
                </div>
              )}
            </div>
            
            <Button
              variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="border-primary/30 text-primary hover:bg-primary/5 flex-shrink-0 ml-2"
            >
                  <Edit className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Modifier</span>
            </Button>
          </div>
        </CardContent>
      </Card>
        ) : (
          /* MODE ÉDITION - Profil + Mot de passe côte à côte */
          <>
            {/* Profil (colonne 1) */}
            <Card className="border-l-2 border-l-primary bg-gradient-to-br from-primary/5 via-primary/3 to-background shadow-lg">
              <CardContent className="p-5">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative group">
                      <Avatar className="h-16 w-16 border-4 border-white shadow-xl ring-2 ring-primary/20">
                        <AvatarImage src={profile?.avatar_url || ''} />
                        <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-primary to-primary-light text-primary-foreground">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1">
                        <Button size="sm" className="h-6 w-6 p-0 bg-primary hover:bg-primary-dark rounded-full shadow-lg">
                          <Camera className="h-3 w-3" />
                        </Button>
                        <AvatarUpload 
                          onUploadComplete={refreshProfile}
                          showUploadButton={false}
                          size="sm"
                          className="absolute inset-0 opacity-0"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary-dark">Profil</h3>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="full_name" className="text-sm font-medium text-primary-dark">Nom complet</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        placeholder="Votre nom complet"
                        className="mt-1 border-primary/30 focus:border-primary"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-primary-dark">Ville</Label>
                      <Popover open={cityPopoverOpen} onOpenChange={setCityPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={cityPopoverOpen}
                            className="w-full justify-between mt-1 border-primary/30 focus:border-primary"
                          >
                            {formData.city_name || "Sélectionner une ville..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput
                              placeholder="Rechercher une ville..."
                              value={formData.city_name}
                              onValueChange={(value) => handleInputChange('city_name', value)}
                            />
                            <CommandEmpty>Aucune ville trouvée.</CommandEmpty>
                            <CommandGroup>
                              <CommandList>
                                {filteredCities.map((city) => (
                                  <CommandItem
                                    key={city.id}
                                    value={`${city.name}, ${city.country}`}
                                    onSelect={() => handleCitySelect(`${city.name}, ${city.country}`)}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        formData.city_name === `${city.name}, ${city.country}` ? "opacity-100" : "opacity-0"
                                      }`}
                                    />
                                    {city.name}, {city.country}
                                  </CommandItem>
                                ))}
                              </CommandList>
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={handleSave}
                      disabled={isProfileLoading}
                      className="bg-primary hover:bg-primary-dark"
                    >
                      {isProfileLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {!isProfileLoading && <Save className="h-4 w-4 mr-2" />}
                      Sauvegarder
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleCancel}
                      className="border-primary/30 text-primary hover:bg-primary/5"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Annuler
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mot de passe (colonne 2) */}
            <Card className="border-l-2 border-l-nature bg-gradient-to-br from-nature/5 via-nature/3 to-background shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-nature-dark">
                  <Shield className="h-5 w-5 text-nature" />
                  {t('profile.security_title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Email Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="flex items-center gap-2 text-nature-dark">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <p className="text-sm text-nature/70">{profile?.email}</p>
                    </div>
                    {!showEmailChange && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowEmailChange(true)}
                        className="border-nature/30 text-nature hover:bg-nature/5"
                      >
                        Modifier
                      </Button>
                    )}
                  </div>
                  
                  {showEmailChange && (
                    <div className="mt-2 space-y-2">
                      <Input
                        placeholder="Nouvelle adresse email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        type="email"
                        className="border-nature/30 focus:border-nature"
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleEmailChange}
                          disabled={isEmailLoading || !newEmail}
                          className="bg-primary hover:bg-primary-dark"
                        >
                          {isEmailLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                          {!isEmailLoading && <Mail className="h-4 w-4 mr-1" />}
                          Confirmer
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowEmailChange(false);
                            setNewEmail('');
                          }}
                          className="border-nature/30 text-nature hover:bg-nature/5"
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Password Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="flex items-center gap-2 text-nature-dark">
                        <Lock className="h-4 w-4" />
                        Mot de passe
                      </Label>
                      <p className="text-xs text-nature/70 mt-1">
                        Modifiez votre mot de passe de connexion
                      </p>
                    </div>
                    {!showPasswordChange && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPasswordChange(true)}
                        className="border-nature/30 text-nature hover:bg-nature/5"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Modifier
                      </Button>
                    )}
                  </div>
                  
                  {showPasswordChange && (
                    <form onSubmit={handlePasswordSubmit} className="mt-3 space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-sm font-medium">
                          Nouveau mot de passe *
                        </Label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="Entrez votre nouveau mot de passe"
                          value={passwords.newPassword}
                          onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                          className={`border-nature/30 focus:border-nature ${passwordErrors.length > 0 ? 'border-red-300' : ''}`}
                          autoComplete="new-password"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium">
                          Confirmer le nouveau mot de passe *
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirmez votre nouveau mot de passe"
                          value={passwords.confirmPassword}
                          onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                          className={`border-nature/30 focus:border-nature ${passwordErrors.some(e => e.includes('correspondent')) ? 'border-red-300' : ''}`}
                          autoComplete="new-password"
                        />
                      </div>
                      
                      {passwordErrors.length > 0 && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                          <div className="flex items-start gap-2">
                            <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <p className="font-medium text-red-800 mb-1">
                                Exigences du mot de passe :
                              </p>
                              <ul className="text-red-700 space-y-1">
                                {passwordErrors.map((error, index) => (
                                  <li key={index} className="flex items-start gap-1">
                                    <span className="text-xs">•</span>
                                    <span className="text-xs">{error}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2 pt-2">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={
                            isPasswordLoading || 
                            passwordErrors.length > 0 || 
                            !passwords.newPassword || 
                            !passwords.confirmPassword
                          }
                          className="flex-1 bg-primary hover:bg-primary-dark"
                        >
                          {isPasswordLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                          {!isPasswordLoading && <Lock className="h-4 w-4 mr-1" />}
                          {isPasswordLoading ? 'Modification...' : 'Modifier'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowPasswordChange(false);
                            setPasswords({ newPassword: '', confirmPassword: '' });
                            setPasswordErrors([]);
                          }}
                          className="border-nature/30 text-nature hover:bg-nature/5"
                        >
                          Annuler
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* LIGNE 2 COL 1 : Niveau et Points */}
        <Card className="border-l-2 border-l-secondary bg-gradient-to-br from-secondary/5 via-secondary/3 to-background shadow-lg">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-secondary-dark">
              <Trophy className="h-5 w-5 text-secondary" />
              {t('profile.level_and_points')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
                <p className="font-medium text-secondary-dark">{levelInfo.name}</p>
                <p className="text-sm text-secondary/80">Niveau {levelInfo.level}</p>
            </div>
              <Badge className="bg-secondary/20 text-secondary-dark border-secondary/30">{profile?.total_points || 0} points</Badge>
          </div>
          
          <div className="space-y-2">
              <div className="flex justify-between text-sm text-secondary-dark">
              <span>Progression</span>
              <span>{Math.round(levelInfo.progress)}%</span>
            </div>
              <Progress value={levelInfo.progress} className="h-3 bg-secondary/20" />
          </div>
        </CardContent>
      </Card>

        {/* LIGNE 2 COL 2 : Badges */}
        <Card className="border-l-2 border-l-primary bg-gradient-to-br from-primary/5 via-primary/3 to-background shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-primary-dark">
              <Trophy className="h-5 w-5 text-primary" />
              {t('profile.badges.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <BadgeDisplay currentPoints={profile?.total_points || 0} className="border-0 shadow-none bg-transparent p-0" />
          </CardContent>
        </Card>

        {/* LIGNE 3 COL 1 : Stats mensuelles */}
        <div className="lg:col-span-1">
      {!statsLoading && stats && (
        <MonthlyStatsCard stats={stats} />
      )}
        </div>

        {/* LIGNE 3 COL 2 : Préférences */}
        <Card className="border-l-2 border-l-accent bg-gradient-to-br from-accent/5 via-accent/3 to-background shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent-dark">
              <Heart className="h-5 w-5 text-accent" />
              {t('profile.preferences_title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-accent-dark">Niveau de forme physique</Label>
              <div className="mt-2">
                <FitnessSegmented 
                  value={parseInt(formData.fitness_level || '3')}
                  editable={isEditing}
                  onChange={(n) => handleInputChange('fitness_level', String(n))}
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-accent-dark">Centres d'intérêt</Label>
              <div className="mt-2 space-y-2">
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-2">
                    {availableInterests.map((interest) => (
                      <Badge 
                        key={interest} 
                        variant={formData.interests.includes(interest) ? "default" : "outline"}
                        className={`cursor-pointer transition-all hover:scale-105 ${
                          formData.interests.includes(interest) 
                            ? 'bg-accent text-accent-foreground' 
                            : 'border-accent/30 text-accent-dark hover:bg-accent/10'
                        }`}
                        onClick={() => handleInterestToggle(interest)}
                      >
                        {t(`profile_interest_categories_${interest}`)}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {formData.interests.length > 0 ? formData.interests.map((interest, index) => (
                      <Badge key={index} className="bg-accent/20 text-accent-dark border-accent/30">
                        {t(`profile_interest_categories_${interest}`)}
                      </Badge>
                    )) : (
                      <p className="text-sm text-accent/70 italic">Aucun centre d'intérêt sélectionné</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StandardPageLayout>
  );
};

export default ProfilePage;