import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { GenerationCriteria } from '@/services/userJourneysService';
import { 
  Clock, 
  TrendingUp, 
  Heart, 
  Users, 
  MapPin, 
  Languages,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface GenerationCriteriaDisplayProps {
  criteria: GenerationCriteria;
  generatedAt?: string;
  className?: string;
}

const GenerationCriteriaDisplay: React.FC<GenerationCriteriaDisplayProps> = ({ 
  criteria, 
  generatedAt, 
  className = "" 
}) => {
  const { currentLanguage } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  const formatGenerationDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(currentLanguage, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDifficultyLabel = (difficulty: string) => {
    const difficultyMap: { [key: string]: string } = {
      'easy': 'Facile',
      'moderate': 'Modéré',
      'hard': 'Difficile'
    };
    return difficultyMap[difficulty] || difficulty;
  };

  const getGroupSizeLabel = (groupSize: string) => {
    const groupSizeMap: { [key: string]: string } = {
      'solo': 'Solo',
      'couple': 'En couple',
      'family': 'En famille',
      'group': 'En groupe'
    };
    return groupSizeMap[groupSize] || groupSize;
  };

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
    }
    return `${minutes}min`;
  };

  return (
    <div className={`bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-lg border border-purple-200 dark:border-purple-800 ${className}`}>
      {/* Header minimaliste avec bouton déroulant */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between p-3 h-auto hover:bg-white/50 dark:hover:bg-gray-800/50"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
            Parcours généré par IA
          </span>
          {generatedAt && (
            <span className="text-xs text-muted-foreground">
              - {formatGenerationDate(generatedAt)}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        )}
      </Button>

      {/* Contenu détaillé déroulant */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 bg-white/30 dark:bg-gray-900/30 rounded-b-lg">
          <Separator className="opacity-50" />
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            {criteria.duration && (
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                <span className="text-muted-foreground">Durée :</span>
                <Badge variant="secondary" className="text-xs h-5">
                  {typeof criteria.duration === 'string' ? criteria.duration : formatDuration(criteria.duration)}
                </Badge>
              </div>
            )}

            {criteria.difficulty && (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                <span className="text-muted-foreground">Difficulté :</span>
                <Badge variant="secondary" className="text-xs h-5">
                  {getDifficultyLabel(criteria.difficulty)}
                </Badge>
              </div>
            )}

            {criteria.groupSize && (
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                <span className="text-muted-foreground">Groupe :</span>
                <Badge variant="secondary" className="text-xs h-5">
                  {getGroupSizeLabel(criteria.groupSize)}
                </Badge>
              </div>
            )}

            {criteria.startLocation && (
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                <span className="text-muted-foreground">Départ :</span>
                <Badge variant="secondary" className="text-xs h-5">
                  {criteria.startLocation}
                </Badge>
              </div>
            )}
          </div>

          {criteria.interests && criteria.interests.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Heart className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                <span className="text-xs text-muted-foreground">Intérêts :</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {criteria.interests.map((interest, index) => (
                  <Badge key={index} variant="outline" className="text-xs h-5">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GenerationCriteriaDisplay;