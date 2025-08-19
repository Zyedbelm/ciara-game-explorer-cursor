
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import JourneyPreferencesForm from '@/components/ai/JourneyPreferencesForm';
import GeneratedJourneyDisplay from '@/components/ai/GeneratedJourneyDisplay';
import AuthRequiredModal from '@/components/ai/AuthRequiredModal';
import { useJourneyGeneration } from '@/hooks/useJourneyGeneration';

interface JourneyGeneratorProps {
  cityId?: string;
  onJourneyGenerated?: (journey: any) => void;
}

interface JourneyPreferences {
  duration: string;
  interests: string[];
  difficulty: string;
  groupSize: string;
  startLocation?: string;
}

const JourneyGenerator: React.FC<JourneyGeneratorProps> = ({ 
  cityId, 
  onJourneyGenerated 
}) => {
  const { user, profile, loading, isAuthenticated, hasRole, signOut } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [preferences, setPreferences] = useState<JourneyPreferences>({
    duration: '60',
    interests: [],
    difficulty: 'medium',
    groupSize: '',
    startLocation: ''
  });

  const {
    isGenerating,
    generatedJourney,
    generateJourney,
    saveJourney,
    resetJourney
  } = useJourneyGeneration();

  // Initialize preferences with user's profile interests
  useEffect(() => {
    if (profile?.interests && profile.interests.length > 0) {
      setPreferences(prev => ({
        ...prev,
        interests: profile.interests
      }));
    }
  }, [profile?.interests]);

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    const result = await generateJourney(preferences);
    if (result && onJourneyGenerated) {
      // Convert the generated journey to the expected format for the callback
      const journeyForCallback = {
        id: result.categoryId, // Temporary ID
        name: result.name,
        description: result.description,
        difficulty: result.difficulty,
        estimated_duration: result.estimatedDuration,
        total_points: result.totalPoints
      };
      onJourneyGenerated(journeyForCallback);
    }
  };

  const handleSave = async () => {
    if (!generatedJourney) return;
    
    const success = await saveJourney(generatedJourney);
    if (success) {
      resetForm();
      // Navigation vers "Mes parcours" avec message
      navigate('/my-journeys', { 
        state: { 
          message: "Votre parcours a été sauvegardé ! Vous pouvez le retrouver ici dans 'Mes parcours'.",
          newJourneyName: generatedJourney.name 
        } 
      });
    }
  };

  const resetForm = () => {
    resetJourney();
    setPreferences({
      duration: '60',
      interests: profile?.interests || [],
      difficulty: 'medium',
      groupSize: '',
      startLocation: ''
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Générer un parcours personnalisé
            {!isAuthenticated && <Lock className="h-4 w-4 text-muted-foreground" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isAuthenticated ? (
            <div className="text-center py-8 space-y-4">
              <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <p className="font-medium mb-2">Connexion requise</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Connectez-vous pour utiliser le générateur de parcours IA et sauvegarder vos créations.
                </p>
                <Button onClick={() => setShowAuthModal(true)}>
                  Se connecter
                </Button>
              </div>
            </div>
          ) : !generatedJourney ? (
            <>
              <JourneyPreferencesForm
                preferences={preferences}
                onPreferencesChange={setPreferences}
              />

              <div className="pt-4">
                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Générer mon parcours
                    </>
                  )}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>💡 L'IA créera un parcours unique basé sur vos préférences et les attractions disponibles dans la ville.</p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <GeneratedJourneyDisplay journey={generatedJourney} />
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  <strong>Après sauvegarde :</strong> Retrouvez votre parcours dans "Mes parcours" pour le démarrer et suivre votre progression.
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={resetForm} variant="outline" className="flex-1">
                  Générer un autre
                </Button>
                <Button onClick={handleSave} className="flex-1">
                  Enregistrer le parcours
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        feature="le générateur de parcours IA"
      />
    </>
  );
};

export default JourneyGenerator;
