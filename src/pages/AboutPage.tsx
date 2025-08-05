import React from 'react';
import { useSimplifiedTranslations } from '@/hooks/useSimplifiedTranslations';
import { translations } from '@/utils/translations';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Mountain, 
  Target, 
  Heart, 
  Users, 
  Lightbulb, 
  Leaf,
  Brain,
  MapPin,
  Globe,
  Smartphone,
  BarChart3,
  Settings,
  Store,
  MessageCircle,
  Navigation,
  Languages,
  Award
} from 'lucide-react';

const AboutPage: React.FC = () => {
  const { currentLanguage } = useSimplifiedTranslations();

  // Simple translation function using static translations
  const t = (key: string): string => {
    const translation = translations[key as keyof typeof translations];
    if (translation && typeof translation === 'object') {
      return (translation as any)[currentLanguage] || (translation as any).fr || key;
    }
    return key;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton={true} title={t('about_us')} />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Mountain className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {t('about_title')}
            </h1>
          </div>
          <p className="text-xl font-semibold text-primary mb-4">
            City Interactive Assistant for Regional Adventures
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('about_subtitle')}
          </p>
        </div>

        {/* Section 1: Vision et Mission */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Target className="h-7 w-7 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">
                {t('about_vision_mission_title')}
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {t('about_vision_mission_description')}
            </p>
          </CardContent>
        </Card>

        {/* Section 2: Notre Solution */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="h-7 w-7 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">
                {t('about_solution_title')}
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed text-lg mb-8">
              {t('about_solution_description')}
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Brain className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {t('about_smart_itineraries')}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t('about_smart_itineraries_desc')}
                </p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Award className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {t('about_gamified_content')}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t('about_gamified_content_desc')}
                </p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Store className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {t('about_local_economy')}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t('about_local_economy_desc')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Pour les Professionnels */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="h-7 w-7 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">
                {t('about_professionals_title')}
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed text-lg mb-8">
              {t('about_professionals_description')}
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold text-foreground">
                    {t('about_analytics_tools')}
                  </h3>
                </div>
                <p className="text-muted-foreground">
                  {t('about_analytics_tools_desc')}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold text-foreground">
                    {t('about_content_management')}
                  </h3>
                </div>
                <p className="text-muted-foreground">
                  {t('about_content_management_desc')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Technologie & Innovation */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Smartphone className="h-7 w-7 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">
                {t('about_technology_title')}
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed text-lg mb-8">
              {t('about_technology_description')}
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <MessageCircle className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold text-foreground">
                    {t('about_ai_conversation')}
                  </h3>
                </div>
                <p className="text-muted-foreground">
                  {t('about_ai_conversation_desc')}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Navigation className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold text-foreground">
                    {t('about_smart_geolocation')}
                  </h3>
                </div>
                <p className="text-muted-foreground">
                  {t('about_smart_geolocation_desc')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Impact et Valeurs */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="h-7 w-7 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">
                {t('about_impact_title')}
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed text-lg mb-8">
              {t('about_impact_description')}
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Globe className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {t('about_heritage_promotion')}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t('about_heritage_promotion_desc')}
                </p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Store className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {t('about_local_business')}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t('about_local_business_desc')}
                </p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Leaf className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {t('about_sustainable_tourism')}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t('about_sustainable_tourism_desc')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 6: Notre Équipe */}
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="h-7 w-7 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">
                {t('about_team_title')}
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {t('about_team_description')}
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default AboutPage;