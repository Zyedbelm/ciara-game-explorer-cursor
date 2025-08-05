
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Calendar, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS, de } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';

interface GeneratedJourneyStep {
  stepId: string;
  order: number;
  customInstructions: string;
}

interface JourneyPreferences {
  duration: string;
  interests: string[];
  difficulty: string;
  groupSize: string;
  startLocation?: string;
}

interface GeneratedJourney {
  name: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedDuration: number;
  steps: GeneratedJourneyStep[];
  totalPoints: number;
  generationParams?: JourneyPreferences;
  generatedAt?: string;
}

interface GeneratedJourneyDisplayProps {
  journey: GeneratedJourney;
}

const GeneratedJourneyDisplay: React.FC<GeneratedJourneyDisplayProps> = ({ journey }) => {
  const { currentLanguage } = useLanguage();

  const getDifficultyDisplay = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '🟢 Facile';
      case 'medium': return '🟡 Modéré';
      case 'hard': return '🔴 Difficile';
      case 'expert': return '⚫ Expert';
      default: return '🟡 Modéré';
    }
  };

  const getInterestDisplay = (interests: string[]) => {
    const interestMap: { [key: string]: string } = {
      'history': 'Histoire',
      'culture': 'Culture',
      'nature': 'Nature',
      'gastronomy': 'Gastronomie',
      'architecture': 'Architecture',
      'sports': 'Sports',
      'shopping': 'Shopping',
      'nightlife': 'Vie nocturne'
    };
    
    return interests.map(interest => interestMap[interest] || interest).join(', ');
  };

  const getGroupSizeDisplay = (groupSize: string) => {
    const groupMap: { [key: string]: string } = {
      'solo': 'Solo',
      'couple': 'En couple',
      'family': 'En famille',
      'friends': 'Entre amis',
      'group': 'En groupe'
    };
    
    return groupMap[groupSize] || groupSize;
  };

  const formatGenerationDate = (dateString?: string): string => {
    const date = dateString ? new Date(dateString) : new Date();
    const localeMap = { fr, en: enUS, de };
    const locale = localeMap[currentLanguage] || fr;
    
    return format(date, 'dd/MM/yyyy à HH:mm', { locale });
  };

  return (
    <div className="space-y-4">
      {/* Critères de génération */}
      {journey.generationParams && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-blue-900">Critères de génération</h4>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-blue-700">Durée :</span>
                <span className="ml-1 text-blue-600">{Math.floor(parseInt(journey.generationParams.duration) / 60)}h{parseInt(journey.generationParams.duration) % 60 > 0 ? ` ${parseInt(journey.generationParams.duration) % 60}min` : ''}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Difficulté :</span>
                <span className="ml-1 text-blue-600">{getDifficultyDisplay(journey.generationParams.difficulty)}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Groupe :</span>
                <span className="ml-1 text-blue-600">{getGroupSizeDisplay(journey.generationParams.groupSize)}</span>
              </div>
              {journey.generationParams.interests.length > 0 && (
                <div>
                  <span className="font-medium text-blue-700">Intérêts :</span>
                  <span className="ml-1 text-blue-600">{getInterestDisplay(journey.generationParams.interests)}</span>
                </div>
              )}
              {journey.generationParams.startLocation && (
                <div className="md:col-span-2">
                  <span className="font-medium text-blue-700">Point de départ :</span>
                  <span className="ml-1 text-blue-600">{journey.generationParams.startLocation}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-blue-300">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Généré le :</span>
              <span className="text-sm text-blue-600">{formatGenerationDate(journey.generatedAt)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parcours généré */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2">{journey.name}</h3>
          <p className="text-muted-foreground mb-4">{journey.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline">
              <Clock className="mr-1 h-3 w-3" />
              {Math.floor(journey.estimatedDuration / 60)}h{journey.estimatedDuration % 60 > 0 ? ` ${journey.estimatedDuration % 60}min` : ''}
            </Badge>
            <Badge variant="outline">
              {getDifficultyDisplay(journey.difficulty)}
            </Badge>
            <Badge variant="outline">
              <MapPin className="mr-1 h-3 w-3" />
              {journey.steps.length} étapes
            </Badge>
            <Badge variant="outline">
              🏆 {journey.totalPoints} points
            </Badge>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Étapes du parcours :</h4>
            {journey.steps.map((step, index) => (
              <div key={step.stepId} className="flex gap-3 p-2 bg-muted rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {step.order}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{step.customInstructions}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneratedJourneyDisplay;
