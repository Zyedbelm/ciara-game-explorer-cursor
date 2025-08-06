
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, MapPin, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import JourneyPreferencesForm from './JourneyPreferencesForm';
import GeneratedJourneyDisplay from './GeneratedJourneyDisplay';
import AuthRequiredModal from './AuthRequiredModal';
import { useJourneyGeneration } from '@/hooks/useJourneyGeneration';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface JourneyPreferences {
  duration: string;
  interests: string[];
  difficulty: string;
  groupSize: string;
  startLocation?: string;
}

const JourneyGeneratorModal: React.FC<{ trigger?: React.ReactNode }> = ({ trigger }) => {
  const [open, setOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [preferences, setPreferences] = useState<JourneyPreferences>({
    duration: '',
    interests: [],
    difficulty: '',
    groupSize: '',
    startLocation: ''
  });

  const navigate = useNavigate();
  const { user, profile, loading, isAuthenticated, hasRole, signOut } = useAuth();
  const { t } = useLanguage();

  const {
    isGenerating,
    generatedJourney,
    generateJourney,
    saveJourney,
    resetJourney
  } = useJourneyGeneration();

  const handleTriggerClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setOpen(true);
  };

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // Validate that we have the minimum required fields
    if (!preferences.duration || !preferences.difficulty || preferences.interests.length === 0) {
      return;
    }

    const result = await generateJourney(preferences);
    if (result) {
      } else {
      }
  };

  const handleSave = async () => {
    if (!generatedJourney) {
      return;
    }
    
    const success = await saveJourney(generatedJourney);
    if (success) {
      setOpen(false);
      resetForm();
      // Navigation claire vers "Mes parcours" avec indication
      navigate('/my-journeys', { 
        state: { 
          message: "Votre parcours a été sauvegardé ! Vous pouvez le retrouver ici dans 'Mes parcours'.",
          newJourneyName: generatedJourney.name 
        } 
      });
    }
  };

  const resetForm = () => {
    setPreferences({
      duration: '',
      interests: [],
      difficulty: '',
      groupSize: '',
      startLocation: ''
    });
    resetJourney();
  };

  const handleGenerateAnother = () => {
    resetJourney();
  };

  const canGenerate = preferences.duration && preferences.difficulty && preferences.interests.length > 0;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild onClick={handleTriggerClick}>
          {trigger || (
            <Button className="w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              {t('create_ai_journey')}
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {t('ai_journey_generator')}
            </DialogTitle>
          </DialogHeader>

          {!generatedJourney ? (
            <div className="space-y-6">
              <JourneyPreferencesForm
                preferences={preferences}
                onPreferencesChange={setPreferences}
              />

              {!canGenerate && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Veuillez remplir au minimum la durée, la difficulté et sélectionner au moins un centre d'intérêt pour générer un parcours.
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !canGenerate}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Zap className="mr-2 h-4 w-4 animate-pulse" />
                    {t('generating')}...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t('generate_my_journey')}
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <GeneratedJourneyDisplay journey={generatedJourney} />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">
                      {t('after_saving')}
                    </p>
                    <p className="text-sm text-blue-700">
                      {t('journey_will_be_accessible')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleGenerateAnother} variant="outline" className="flex-1">
                  {t('generate_another')}
                </Button>
                <Button onClick={handleSave} className="flex-1">
                  {t('save_journey')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        feature={t('ai_journey_generator_feature')}
      />
    </>
  );
};

export default JourneyGeneratorModal;
