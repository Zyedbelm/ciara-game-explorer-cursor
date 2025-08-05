import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown, Mail, Phone } from 'lucide-react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const PricingPage = () => {
  const { t, currentLanguage } = useLanguage();
  const navigate = useNavigate();

  const handlePackageInquiry = () => {
    navigate('/contact');
  };

  const plans = [
    {
      name: currentLanguage === 'en' ? 'Starter' : currentLanguage === 'de' ? 'Starter' : 'Starter',
      price: 'CHF 5\'000',
      period: currentLanguage === 'en' ? 'per year' : currentLanguage === 'de' ? 'pro Jahr' : 'par an',
      description: currentLanguage === 'en' ? 'Perfect for small destinations getting started' : currentLanguage === 'de' ? 'Perfekt für kleine Reiseziele, die anfangen' : 'Parfait pour les petites destinations qui débutent',
      features: [
        currentLanguage === 'en' ? '2 pre-configured journeys' : currentLanguage === 'de' ? '2 vorkonfigurierte Reisen' : '2 parcours pré-configurés',
        currentLanguage === 'en' ? 'Maximum 200 users/month' : currentLanguage === 'de' ? 'Maximal 200 Benutzer/Monat' : '200 utilisateurs/mois maximum',
        currentLanguage === 'en' ? 'Basic analytics (visitors, completion)' : currentLanguage === 'de' ? 'Basis-Analytics (Besucher, Abschluss)' : 'Analytics basiques (visiteurs, complétion)',
        currentLanguage === 'en' ? 'Discrete CIARA branding' : currentLanguage === 'de' ? 'Dezentes CIARA-Branding' : 'Branding CIARA discret',
        currentLanguage === 'en' ? 'Standard email support' : currentLanguage === 'de' ? 'Standard-E-Mail-Support' : 'Support email standard',
        currentLanguage === 'en' ? 'Basic data export (monthly CSV)' : currentLanguage === 'de' ? 'Basis-Datenexport (monatliches CSV)' : 'Export données basique (CSV mensuel)'
      ],
      icon: Star,
      popular: false
    },
    {
      name: currentLanguage === 'en' ? 'Professional' : currentLanguage === 'de' ? 'Professional' : 'Professional',
      price: '',
      period: '',
      description: currentLanguage === 'en' ? 'Complete solution for medium-sized destinations' : currentLanguage === 'de' ? 'Komplettlösung für mittlere Reiseziele' : 'Solution complète pour destinations moyennes',
      features: [
        currentLanguage === 'en' ? '8 journeys (6 additional)' : currentLanguage === 'de' ? '8 Reisen (6 zusätzliche)' : '8 parcours (6 supplémentaires)',
        currentLanguage === 'en' ? '1,000 users/month' : currentLanguage === 'de' ? '1.000 Benutzer/Monat' : '1000 utilisateurs/mois',
        currentLanguage === 'en' ? 'Advanced analytics + heatmaps' : currentLanguage === 'de' ? 'Erweiterte Analytics + Heatmaps' : 'Analytics avancées + heatmaps',
        currentLanguage === 'en' ? 'Automated monthly reports (PDF)' : currentLanguage === 'de' ? 'Automatisierte monatliche Berichte (PDF)' : 'Rapports mensuels automatiques (PDF)',
        currentLanguage === 'en' ? 'Integrable city logo' : currentLanguage === 'de' ? 'Integrierbares Stadtlogo' : 'Logo ville intégrable',
        currentLanguage === 'en' ? 'Priority support (response <24h)' : currentLanguage === 'de' ? 'Prioritätssupport (Antwort <24h)' : 'Support prioritaire (réponse <24h)',
        currentLanguage === 'en' ? 'Customization options' : currentLanguage === 'de' ? 'Anpassungsoptionen' : 'Personnalisation',
        currentLanguage === 'en' ? 'Advanced data export' : currentLanguage === 'de' ? 'Erweiterter Datenexport' : 'Export données avancé'
      ],
      icon: Zap,
      popular: true
    },
    {
      name: currentLanguage === 'en' ? 'Enterprise' : currentLanguage === 'de' ? 'Enterprise' : 'Enterprise',
      price: '',
      period: '',
      description: currentLanguage === 'en' ? 'Complete suite for large destinations' : currentLanguage === 'de' ? 'Komplette Suite für große Reiseziele' : 'Suite complète pour grandes destinations',
      features: [
        currentLanguage === 'en' ? 'Unlimited journeys + continuous creation' : currentLanguage === 'de' ? 'Unbegrenzte Reisen + kontinuierliche Erstellung' : 'Parcours illimités + création continue',
        currentLanguage === 'en' ? '8,000 users/month' : currentLanguage === 'de' ? '8.000 Benutzer/Monat' : '8000 utilisateurs/mois',
        currentLanguage === 'en' ? 'Dedicated Account Manager (10h/month)' : currentLanguage === 'de' ? 'Dedizierter Account Manager (10h/Monat)' : 'Account Manager dédié (10h/mois)',
        currentLanguage === 'en' ? 'Personalized executive reports' : currentLanguage === 'de' ? 'Personalisierte Executive-Berichte' : 'Rapports exécutifs personnalisés',
        currentLanguage === 'en' ? 'Advanced integrations (event calendar)' : currentLanguage === 'de' ? 'Erweiterte Integrationen (Veranstaltungskalender)' : 'Intégrations avancées (calendrier événements)',
        currentLanguage === 'en' ? 'Benchmarking with other cities + Heatmap' : currentLanguage === 'de' ? 'Benchmarking mit anderen Städten + Heatmap' : 'Benchmarking avec autres villes + Heatmap',
        currentLanguage === 'en' ? '24/7 support (emergencies)' : currentLanguage === 'de' ? '24/7 Support (Notfälle)' : 'Support 24/7 (urgences)',
        currentLanguage === 'en' ? 'Strategic consulting included' : currentLanguage === 'de' ? 'Strategische Beratung inklusive' : 'Conseil stratégique inclus'
      ],
      icon: Crown,
      popular: false
    }
  ];


  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton={true} />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">
              {currentLanguage === 'en' ? 'Choose Your CIARA Plan' : currentLanguage === 'de' ? 'Wählen Sie Ihren CIARA-Plan' : 'Choisissez votre formule CIARA'}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {currentLanguage === 'en' 
                ? 'Transform your destination into an interactive gaming experience. We handle the technology, you focus on your visitors.' 
                : currentLanguage === 'de' 
                ? 'Verwandeln Sie Ihr Reiseziel in ein interaktives Spielerlebnis. Wir kümmern uns um die Technologie, Sie konzentrieren sich auf Ihre Besucher.'
                : 'Transformez votre destination en expérience de jeu interactive. Nous nous occupons de la technologie, vous vous concentrez sur vos visiteurs.'
              }
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {plans.map((plan) => {
              const IconComponent = plan.icon;
              return (
                <Card 
                  key={plan.name} 
                  className={`relative overflow-hidden ${plan.popular ? 'border-primary shadow-xl scale-105' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 bg-primary text-white text-center py-2 text-sm font-medium">
                      {currentLanguage === 'en' ? 'Most Popular' : currentLanguage === 'de' ? 'Am beliebtesten' : 'Le plus populaire'}
                    </div>
                  )}
                  
                  <CardHeader className={`text-center ${plan.popular ? 'pt-12' : 'pt-6'}`}>
                    <div className="flex justify-center mb-4">
                      <div className={`p-3 rounded-full ${plan.popular ? 'bg-primary text-white' : 'bg-muted'}`}>
                        <IconComponent className="h-8 w-8" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    {plan.price && (
                      <div className="text-3xl font-bold text-primary mt-4">
                        {plan.price}
                        <span className="text-base font-normal text-muted-foreground">/{plan.period}</span>
                      </div>
                    )}
                    <p className="text-muted-foreground mt-2">{plan.description}</p>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                      onClick={handlePackageInquiry}
                    >
                      {currentLanguage === 'en' ? 'Request Information' : currentLanguage === 'de' ? 'Informationen anfordern' : 'Demander des informations'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>


          {/* What We Do For You */}
          <Card className="mb-16 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {currentLanguage === 'en' ? 'What CIARA Does For You' : currentLanguage === 'de' ? 'Was CIARA für Sie tut' : 'Ce que CIARA fait pour vous'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="font-semibold mb-2">
                    {currentLanguage === 'en' ? 'Content Creation' : currentLanguage === 'de' ? 'Content-Erstellung' : 'Création de contenu'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {currentLanguage === 'en' ? 'You manage your journey and step content' : currentLanguage === 'de' ? 'Sie verwalten die Inhalte Ihrer Reisen und Etappen' : 'Vous administrez le contenu de vos itinéraires et étapes'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚙️</span>
                  </div>
                  <h3 className="font-semibold mb-2">
                    {currentLanguage === 'en' ? 'Technical Setup' : currentLanguage === 'de' ? 'Technische Einrichtung' : 'Configuration technique'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {currentLanguage === 'en' ? 'Complete technical infrastructure' : currentLanguage === 'de' ? 'Komplette technische Infrastruktur' : 'Infrastructure technique complète'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎮</span>
                  </div>
                  <h3 className="font-semibold mb-2">
                    {currentLanguage === 'en' ? 'Gamification' : currentLanguage === 'de' ? 'Gamification' : 'Gamification'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {currentLanguage === 'en' ? 'Complete points & rewards system' : currentLanguage === 'de' ? 'Komplettes Punkte- & Belohnungssystem' : 'Système complet de points et récompenses'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="font-semibold mb-2">
                    {currentLanguage === 'en' ? 'Analytics' : currentLanguage === 'de' ? 'Analytics' : 'Analytics'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {currentLanguage === 'en' ? 'Detailed engagement insights' : currentLanguage === 'de' ? 'Detaillierte Engagement-Einblicke' : 'Insights détaillés d\'engagement'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact CTA */}
          <Card className="text-center bg-gradient-to-r from-primary to-secondary text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">
                {currentLanguage === 'en' ? 'Ready to Transform Your Destination?' : currentLanguage === 'de' ? 'Bereit, Ihr Reiseziel zu transformieren?' : 'Prêt à transformer votre destination ?'}
              </h3>
              <p className="mb-6 text-white/90">
                {currentLanguage === 'en' 
                  ? 'Contact our team to discuss your specific needs and get a customized proposal.' 
                  : currentLanguage === 'de' 
                  ? 'Kontaktieren Sie unser Team, um Ihre spezifischen Bedürfnisse zu besprechen und ein maßgeschneidertes Angebot zu erhalten.'
                  : 'Contactez notre équipe pour discuter de vos besoins spécifiques et obtenir une proposition personnalisée.'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary" className="whitespace-nowrap">
                  <Mail className="mr-2 h-4 w-4" />
                  info@ciara.city
                </Button>
                <Button variant="secondary" className="whitespace-nowrap">
                  <Phone className="mr-2 h-4 w-4" />
                  +41 79 301 79 15
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PricingPage;