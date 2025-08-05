import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { 
  Bot, 
  MessageCircle, 
  MapPin, 
  TrendingUp,
  Shield,
  Zap,
  Brain,
  Target
} from 'lucide-react';

const AIFeaturesPage = () => {
  const aiFeatures = [
    {
      title: "Assistant IA Contextuel",
      description: "Un guide intelligent qui vous accompagne à chaque étape",
      icon: Bot,
      color: "bg-primary/10 text-primary",
      status: "Actif",
      statusColor: "bg-green-100 text-green-800",
      details: [
        "Analyse votre position GPS en temps réel",
        "Comprend le contexte de votre parcours actuel",
        "Adapte ses réponses à votre profil et préférences",
        "Fournit des informations historiques et culturelles",
        "Recommande des activités et restaurants locaux"
      ],
      basedOn: [
        "Votre profil utilisateur (niveau, points, intérêts)",
        "Localisation GPS précise",
        "Base de données des points d'intérêt locaux",
        "Historique de vos parcours précédents",
        "Conditions météorologiques actuelles"
      ]
    },
    {
      title: "Génération de Parcours Automatique",
      description: "L'IA crée des parcours personnalisés selon vos goûts",
      icon: MapPin,
      color: "bg-secondary/10 text-secondary",
      status: "Bêta",
      statusColor: "bg-yellow-100 text-yellow-800",
      details: [
        "Algorithme d'optimisation de trajet avancé",
        "Sélection intelligente des points d'intérêt",
        "Adaptation à votre condition physique",
        "Prise en compte du temps disponible",
        "Intégration des préférences personnelles"
      ],
      basedOn: [
        "Algorithmes de voyageur de commerce (TSP)",
        "Machine learning sur les préférences utilisateurs",
        "Données d'affluence en temps réel",
        "Analyse des patterns de réussite",
        "Météo et conditions de terrain"
      ]
    },
    {
      title: "Recommandations Personnalisées",
      description: "Suggestions intelligentes basées sur votre comportement",
      icon: Target,
      color: "bg-accent/10 text-accent",
      status: "Développement",
      statusColor: "bg-blue-100 text-blue-800",
      details: [
        "Analyse comportementale des utilisateurs similaires",
        "Prédiction des intérêts futurs",
        "Suggestions de nouveaux types de parcours",
        "Recommandations de partenaires pertinents",
        "Optimisation du timing des activités"
      ],
      basedOn: [
        "Algorithmes de filtrage collaboratif",
        "Analyse des patterns de navigation",
        "Données d'engagement et satisfaction",
        "Similarité avec d'autres profils",
        "Tendances saisonnières et locales"
      ]
    },
    {
      title: "Analyse Comportementale Intelligente",
      description: "Compréhension approfondie de vos habitudes d'exploration",
      icon: Brain,
      color: "bg-nature/10 text-nature",
      status: "Recherche",
      statusColor: "bg-purple-100 text-purple-800",
      details: [
        "Détection des patterns de navigation",
        "Identification des préférences implicites",
        "Prédiction des moments d'abandon",
        "Optimisation de l'engagement utilisateur",
        "Personnalisation de l'interface"
      ],
      basedOn: [
        "Réseaux de neurones pour l'analyse séquentielle",
        "Données de géolocalisation anonymisées",
        "Temps passé sur chaque type de contenu",
        "Feedback implicite (scrolling, clics, pauses)",
        "Analyse des sessions et retention"
      ]
    }
  ];

  const privacyPrinciples = [
    {
      title: "Chiffrement de bout en bout",
      description: "Toutes vos données sont protégées par un chiffrement AES-256"
    },
    {
      title: "Anonymisation intelligente",
      description: "L'IA analyse des patterns sans jamais stocker d'informations personnelles identifiables"
    },
    {
      title: "Consentement granulaire",
      description: "Vous contrôlez précisément quelles données l'IA peut utiliser"
    },
    {
      title: "Conformité RGPD",
      description: "Respect strict des réglementations européennes sur la protection des données"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header 
        showBackButton 
        title="Fonctionnalités IA" 
        subtitle="L'intelligence artificielle au service de votre exploration" 
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Introduction */}
          <Card className="mb-8 bg-gradient-primary text-white border-0">
            <CardContent className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-4">
                Intelligence Artificielle CIARA
              </h1>
              <p className="text-xl opacity-90 mb-6 max-w-3xl mx-auto">
                Découvrez comment notre IA révolutionne votre expérience d'exploration en analysant vos préférences, 
                votre comportement et votre contexte pour vous offrir un accompagnement personnalisé et intelligent.
              </p>
              <div className="flex justify-center gap-4">
                <Button size="lg" variant="secondary">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Essayer l'Assistant IA
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  <Shield className="mr-2 h-5 w-5" />
                  Confidentialité
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Features */}
          <div className="space-y-8 mb-12">
            {aiFeatures.map((feature, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center flex-shrink-0`}>
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{feature.title}</CardTitle>
                          <Badge className={feature.statusColor}>
                            {feature.status}
                          </Badge>
                        </div>
                        <CardDescription className="text-base">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        Fonctionnalités
                      </h4>
                      <ul className="space-y-2">
                        {feature.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0 mt-2" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-secondary" />
                        Basé sur
                      </h4>
                      <ul className="space-y-2">
                        {feature.basedOn.map((basis, basisIndex) => (
                          <li key={basisIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 bg-secondary rounded-full flex-shrink-0 mt-2" />
                            {basis}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Privacy Section */}
          <Card className="mb-8">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Confidentialité & Sécurité</CardTitle>
              <CardDescription className="text-lg">
                Votre vie privée est notre priorité absolue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {privacyPrinciples.map((principle, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Shield className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{principle.title}</h4>
                      <p className="text-sm text-muted-foreground">{principle.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Spécifications Techniques</CardTitle>
              <CardDescription>
                Détails sur l'implémentation de notre intelligence artificielle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Modèles IA</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>GPT-4 pour le langage naturel</li>
                    <li>Algorithmes propriétaires CIARA</li>
                    <li>Réseaux de neurones pour l'analyse comportementale</li>
                    <li>Machine learning pour les recommandations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Infrastructure</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Serveurs sécurisés en Europe</li>
                    <li>Traitement en temps réel</li>
                    <li>APIs RESTful et WebSocket</li>
                    <li>Mise à l'échelle automatique</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Performance</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Temps de réponse &lt; 200ms</li>
                    <li>Disponibilité 99.9%</li>
                    <li>Mise à jour continue des modèles</li>
                    <li>Optimisation énergétique</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AIFeaturesPage;