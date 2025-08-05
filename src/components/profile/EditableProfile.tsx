
import React, { useState, useEffect } from 'react';
import { useStableAuth } from '@/hooks/useStableAuth';
import { useUserStats } from '@/hooks/useUserStats';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  User,
  Settings,
  Save,
  X,
  Trophy,
  Star,
  Mail,
  Edit,
  MapPin,
  Check,
  ChevronsUpDown,
  Lock,
  Shield,
  CheckCircle,
  Loader2
} from 'lucide-react';
import AvatarUpload from './AvatarUpload';
import MonthlyStatsCard from './MonthlyStatsCard';
import BadgeDisplay from './BadgeDisplay';

import { profileTranslations } from '@/utils/profileTranslations';

interface EditableProfileProps {
  onSave?: () => void;
  onCancel?: () => void;
}

const EditableProfile: React.FC<EditableProfileProps> = ({ onSave, onCancel }) => {
  const { profile, updateProfile, updateEmail, updatePassword } = useStableAuth();
  const { stats, loading: statsLoading } = useUserStats();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  // Separate loading states for different actions
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  
  const [cities, setCities] = useState<any[]>([]);
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [cityPopoverOpen, setCityPopoverOpen] = useState(false);
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Combined loading state for UI (true if any action is loading)
  const isLoading = isProfileLoading || isEmailLoading || isPasswordLoading;

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    city_name: '',
    fitness_level: profile?.fitness_level || '3',
    preferred_languages: profile?.preferred_languages || ['fr'],
    interests: profile?.interests || []
  });

  // Charger les villes disponibles
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
        console.error('Erreur lors du chargement des villes:', error);
      }
    };
    fetchCities();
  }, []);


  // Synchroniser formData avec le profil quand il change
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

  const handleInputChange = (field: string, value: any) => {
    console.log('Changing field:', field, 'to value:', value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    console.log('🔄 Starting profile update...');
    setIsProfileLoading(true);
    
    try {
      // Find selected city
      const selectedCity = cities.find(city => 
        `${city.name}, ${city.country}` === formData.city_name
      );
      
      // Only update profile - password is handled separately now
      console.log('📝 Updating profile data...');
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

      console.log('✅ Profile updated successfully');

      // Show success toast
      toast({
        title: t('profile.profile_updated'),
        description: t('profile.profile_updated'),
      });

      // Call success callback
      onSave?.();
      
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      toast({
        title: t('profile.update_error'),
        description: `${t('profile.update_error')}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleEmailChange = async () => {
    if (!newEmail) return;
    
    setIsEmailLoading(true);
    console.log('📧 Starting email update...');
    
    try {
      const { error } = await updateEmail(newEmail);
      if (!error) {
        setShowEmailChange(false);
        setNewEmail('');
        console.log('✅ Email update initiated successfully');
      }
    } finally {
      setIsEmailLoading(false);
      console.log('🏁 Email update process completed');
    }
  };

  const handleCitySelect = (cityName: string) => {
    handleInputChange('city_name', cityName);
    setCityPopoverOpen(false);
  };

  const filteredCities = cities.filter(city =>
    `${city.name}, ${city.country}`.toLowerCase().includes(formData.city_name.toLowerCase())
  ).slice(0, 10);


  const getLevel = () => {
    const points = profile?.total_points || 0;
    if (points < 100) return { level: 1, name: 'Explorateur', progress: points };
    if (points < 500) return { level: 2, name: 'Aventurier', progress: ((points - 100) / 400) * 100 };
    if (points < 1000) return { level: 3, name: 'Expert Local', progress: ((points - 500) / 500) * 100 };
    return { level: 4, name: 'Ambassadeur', progress: 100 };
  };

  const levelInfo = getLevel();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Progression - reste identique mais avec des champs éditables */}
      <div className="lg:col-span-2 space-y-6">
        {/* Photo de profil en haut */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {t('profile.profile_photo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <AvatarUpload size="lg" showUploadButton={true} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              {t('profile.progression')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Niveau {levelInfo.level} - {levelInfo.name}</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(levelInfo.progress)}%
                </span>
              </div>
              <Progress value={levelInfo.progress} className="h-3" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {statsLoading ? '...' : stats?.completedJourneys || 0}
                </div>
                <div className="text-sm text-muted-foreground">{t('profile.completed_journeys')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {statsLoading ? '...' : stats?.completedSteps || 0}
                </div>
                <div className="text-sm text-muted-foreground">{t('profile.visited_steps')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {statsLoading ? '...' : (() => {
                    const points = profile?.total_points || 0;
                    return points >= 1000 ? 4 : points >= 500 ? 3 : points >= 100 ? 2 : points >= 50 ? 1 : 0;
                  })()}
                </div>
                <div className="text-sm text-muted-foreground">{t('profile.badges_earned')}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badge Display */}
        <BadgeDisplay currentPoints={profile?.total_points || 0} />

        {/* Informations personnelles - éditables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {t('profile.personal_info')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">{t('profile.full_name')}</Label>
                <Input
                  id="fullName"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Votre nom complet"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="flex gap-2 mt-1">
                  <Input 
                    id="email"
                    value={profile?.email || ''} 
                    placeholder="Votre email"
                    disabled
                    className="bg-muted"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEmailChange(!showEmailChange)}
                    disabled={isLoading}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                {showEmailChange && (
                  <div className="mt-2 space-y-2">
                    <Input
                      placeholder="Nouvelle adresse email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      type="email"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleEmailChange}
                        disabled={isEmailLoading || !newEmail}
                      >
                        {isEmailLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                        {!isEmailLoading && <Mail className="h-4 w-4 mr-1" />}
                        {isEmailLoading ? t('profile.updating_email') : t('profile.confirm_email')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowEmailChange(false);
                          setNewEmail('');
                        }}
                      >
                        {t('profile.cancel')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            

          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Préférences éditables */}
      <div className="space-y-6">
        {/* Préférences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              {t('profile.preferences')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t('profile.fitness_level')}</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handleInputChange('fitness_level', level.toString())}
                    className={`h-6 w-12 rounded transition-colors ${
                      level <= parseInt(formData.fitness_level)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('profile.fitness_scale')}
              </p>
            </div>
            
            <div>
              <Label htmlFor="languages">{t('profile.preferred_languages')}</Label>
              <Select
                value={formData.preferred_languages[0] || 'fr'}
                onValueChange={(value) => handleInputChange('preferred_languages', [value])}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t('profile.select_language')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="it">Italiano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>{t('profile.interests')}</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['nature', 'culture', 'gastronomy', 'sports', 'history', 'art', 'heritage', 'adventure'].map((interest) => (
                  <Badge 
                    key={interest} 
                    variant={formData.interests.includes(interest) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      const newInterests = formData.interests.includes(interest)
                        ? formData.interests.filter(i => i !== interest)
                        : [...formData.interests, interest];
                      handleInputChange('interests', newInterests);
                    }}
                  >
                    {t(`profile.interest_categories.${interest}`)}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Statistiques rapides */}
        <MonthlyStatsCard />

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => handleSubmit()} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {!isLoading && <Save className="h-4 w-4 mr-2" />}
            {isLoading ? t('profile.saving') : t('profile.save_changes')}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            {t('profile.cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditableProfile;
