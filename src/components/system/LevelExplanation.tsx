import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { Trophy, Star, Target, TrendingUp, Crown, Award } from 'lucide-react';

interface LevelExplanationProps {
  currentLevel?: number;
  currentPoints?: number;
  language?: string;
}

const LevelExplanation: React.FC<LevelExplanationProps> = ({ 
  currentLevel = 1, 
  currentPoints = 0,
  language = 'fr' 
}) => {
  const { t } = useLanguage();

  const getLevelData = () => {
    return [
      {
        level: 1,
        name: {
          fr: 'Explorateur Novice',
          en: 'Novice Explorer',
          de: 'Entdecker-Anfänger'
        },
        pointsRequired: 0,
        pointsToNext: 100,
        icon: TrendingUp,
        color: 'from-green-400 to-blue-500',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        description: {
          fr: 'Premiers pas dans l\'exploration urbaine',
          en: 'First steps in urban exploration',
          de: 'Erste Schritte in der Stadterkundung'
        },
        benefits: {
          fr: ['Accès aux parcours de base', 'Points doublés sur les premiers quiz'],
          en: ['Access to basic routes', 'Double points on first quizzes'],
          de: ['Zugang zu Grundrouten', 'Doppelte Punkte bei ersten Quiz']
        }
      },
      {
        level: 2,
        name: {
          fr: 'Aventurier Confirmé',
          en: 'Confirmed Adventurer',
          de: 'Bestätigter Abenteurer'
        },
        pointsRequired: 100,
        pointsToNext: 200,
        icon: Target,
        color: 'from-blue-400 to-cyan-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        description: {
          fr: 'Maîtrise des bases de l\'exploration',
          en: 'Master the basics of exploration',
          de: 'Beherrschung der Grundlagen der Erkundung'
        },
        benefits: {
          fr: ['Parcours intermédiaires débloqués', 'Bonus de 10% sur les récompenses'],
          en: ['Intermediate routes unlocked', '10% bonus on rewards'],
          de: ['Mittlere Routen freigeschaltet', '10% Bonus auf Belohnungen']
        }
      },
      {
        level: 3,
        name: {
          fr: 'Expert Local',
          en: 'Local Expert',
          de: 'Lokaler Experte'
        },
        pointsRequired: 300,
        pointsToNext: 300,
        icon: Star,
        color: 'from-purple-400 to-pink-500',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        description: {
          fr: 'Connaissance approfondie de la destination',
          en: 'Deep knowledge of the destination',
          de: 'Tiefes Wissen über das Reiseziel'
        },
        benefits: {
          fr: ['Tous les parcours disponibles', 'Récompenses exclusives', 'Badge expert'],
          en: ['All routes available', 'Exclusive rewards', 'Expert badge'],
          de: ['Alle Routen verfügbar', 'Exklusive Belohnungen', 'Experten-Abzeichen']
        }
      },
      {
        level: 4,
        name: {
          fr: 'Ambassadeur',
          en: 'Ambassador',
          de: 'Botschafter'
        },
        pointsRequired: 600,
        pointsToNext: 400,
        icon: Trophy,
        color: 'from-yellow-400 to-orange-500',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        description: {
          fr: 'Représentant officiel de la destination',
          en: 'Official destination representative',
          de: 'Offizieller Vertreter des Reiseziels'
        },
        benefits: {
          fr: ['Accès aux événements VIP', 'Réductions exclusives 20%', 'Création de parcours personnalisés'],
          en: ['VIP events access', '20% exclusive discounts', 'Custom route creation'],
          de: ['VIP-Veranstaltungen Zugang', '20% exklusive Rabatte', 'Benutzerdefinierte Routen erstellen']
        }
      },
      {
        level: 5,
        name: {
          fr: 'Légende Urbaine',
          en: 'Urban Legend',
          de: 'Urbane Legende'
        },
        pointsRequired: 1000,
        pointsToNext: 0,
        icon: Crown,
        color: 'from-yellow-500 to-red-500',
        bgColor: 'bg-gradient-to-br from-yellow-50 to-red-50',
        borderColor: 'border-yellow-300',
        description: {
          fr: 'Maître incontesté de l\'exploration',
          en: 'Undisputed master of exploration',
          de: 'Unbestrittener Meister der Erkundung'
        },
        benefits: {
          fr: ['Tous les avantages précédents', 'Statut permanent', 'Reconnaissance officielle'],
          en: ['All previous benefits', 'Permanent status', 'Official recognition'],
          de: ['Alle vorherigen Vorteile', 'Dauerstatus', 'Offizielle Anerkennung']
        }
      }
    ];
  };

  const levels = getLevelData();
  const currentLevelData = levels.find(l => l.level === currentLevel) || levels[0];
  const nextLevelData = levels.find(l => l.level === currentLevel + 1);
  
  const pointsInCurrentLevel = currentPoints - currentLevelData.pointsRequired;
  const pointsNeededForNext = nextLevelData ? nextLevelData.pointsRequired - currentPoints : 0;
  const progressPercentage = nextLevelData 
    ? (pointsInCurrentLevel / currentLevelData.pointsToNext) * 100 
    : 100;

  const getText = (textObj: any) => {
    return textObj[language] || textObj.fr;
  };

  const IconComponent = currentLevelData.icon;

  return (
    <div className="space-y-6">
      {/* Current Level Display */}
      <Card className={`${currentLevelData.bgColor} ${currentLevelData.borderColor} border-2`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${currentLevelData.color} flex items-center justify-center text-white shadow-lg`}>
              <IconComponent className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">Niveau {currentLevel}</span>
                <Badge className={`bg-gradient-to-r ${currentLevelData.color} text-white border-0`}>
                  {getText(currentLevelData.name)}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                {getText(currentLevelData.description)}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress to next level */}
            {nextLevelData && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Progression vers {getText(nextLevelData.name)}
                  </span>
                  <span className="font-medium">
                    {pointsInCurrentLevel}/{currentLevelData.pointsToNext} points
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  Plus que {pointsNeededForNext} points pour atteindre le niveau suivant
                </p>
              </div>
            )}

            {/* Current Level Benefits */}
            <div>
              <h4 className="font-semibold mb-2 text-sm">Avantages actuels :</h4>
              <div className="space-y-1">
                {getText(currentLevelData.benefits).map((benefit: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-green-600" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Levels Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Système de Niveaux CIARA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {levels.map((level) => {
              const LevelIcon = level.icon;
              const isCurrentLevel = level.level === currentLevel;
              const isUnlocked = currentLevel >= level.level;
              
              return (
                <div 
                  key={level.level}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                    isCurrentLevel 
                      ? `${level.bgColor} ${level.borderColor} border-2 shadow-md` 
                      : isUnlocked 
                        ? 'bg-muted/30' 
                        : 'bg-muted/10 opacity-60'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${level.color} flex items-center justify-center text-white flex-shrink-0`}>
                    <LevelIcon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">Niveau {level.level}</span>
                      <Badge variant={isCurrentLevel ? "default" : "outline"} className="text-xs">
                        {getText(level.name)}
                      </Badge>
                      {isCurrentLevel && (
                        <Badge variant="secondary" className="text-xs">Actuel</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {getText(level.description)}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {level.pointsRequired} points requis
                      {level.pointsToNext > 0 && ` • ${level.pointsToNext} points pour le niveau suivant`}
                    </div>
                  </div>

                  <div className="text-right">
                    {isUnlocked ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        ✓ Débloqué
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Verrouillé
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LevelExplanation;