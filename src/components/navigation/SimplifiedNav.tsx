
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Map, 
  Compass, 
  Trophy, 
  Gift, 
  Sparkles,
  Clock,
  MapPin,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCitySlug } from '@/hooks/useCitySlug';
import JourneyGeneratorModal from '@/components/ai/JourneyGeneratorModal';
import { useIsMobile } from '@/hooks/use-mobile';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  badge?: string;
  variant?: 'default' | 'secondary' | 'accent';
}

const SimplifiedNav: React.FC = () => {
  const navigate = useNavigate();
  const citySlug = useCitySlug();
  const isMobile = useIsMobile();

  const quickActions: QuickAction[] = [
    {
      id: 'explore',
      title: 'Parcours disponibles',
      description: 'Découvrez tous les parcours',
      icon: <Map className="h-5 w-5" />,
      action: () => navigate(`/destinations/${citySlug}`),
      badge: 'Popular',
      variant: 'default'
    },
    {
      id: 'my-journeys',
      title: 'Mes parcours',
      description: 'Suivez vos aventures',
      icon: <Compass className="h-5 w-5" />,
      action: () => navigate('/my-journeys'),
      variant: 'secondary'
    },
    {
      id: 'rewards',
      title: 'Récompenses',
      description: 'Échangez vos points',
      icon: <Gift className="h-5 w-5" />,
      action: () => navigate('/rewards'),
      badge: 'New',
      variant: 'accent'
    },
    {
      id: 'profile',
      title: 'Mon profil',
      description: 'Gérez votre compte',
      icon: <Users className="h-5 w-5" />,
      action: () => navigate('/profile'),
      variant: 'secondary'
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Hero Section */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">Nouvelle expérience !</h2>
              <p className="text-sm text-muted-foreground">Créez votre parcours avec l'IA</p>
            </div>
          </div>
          
          <JourneyGeneratorModal 
            trigger={
              <Button className="w-full" size={isMobile ? "default" : "lg"}>
                <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">Créer un parcours personnalisé</span>
              </Button>
            }
          />
        </CardContent>
      </Card>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {quickActions.map((action) => (
          <Card 
            key={action.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={action.action}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
                  action.variant === 'default' ? 'bg-primary/20 text-primary' :
                  action.variant === 'accent' ? 'bg-accent/20 text-accent-foreground' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm sm:text-base truncate">{action.title}</h3>
                    {action.badge && (
                      <Badge variant="secondary" className="text-[10px] sm:text-xs whitespace-nowrap">
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {action.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
            <Trophy className="h-4 w-4" />
            Vos statistiques
          </h3>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div>
              <p className="text-xl sm:text-2xl font-bold text-primary">0</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Parcours terminés</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-accent">0</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Points gagnés</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-secondary">0</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Badges obtenus</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplifiedNav;
