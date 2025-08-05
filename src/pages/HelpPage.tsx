import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { 
  Book, 
  MessageCircle, 
  Video, 
  Download, 
  Users, 
  Headphones,
  ExternalLink,
  ArrowRight 
} from 'lucide-react';

const HelpPage = () => {
  const helpSections = [
    {
      title: "Guides d'utilisation",
      description: "Apprenez à utiliser toutes les fonctionnalités de CIARA",
      icon: Book,
      color: "bg-primary/10 text-primary",
      items: [
        "Guide de démarrage rapide",
        "Comment créer son profil",
        "Gérer ses préférences",
        "Comprendre le système de points"
      ],
      action: "Voir les guides"
    },
    {
      title: "Vidéos tutoriels",
      description: "Suivez nos tutoriels vidéo étape par étape",
      icon: Video,
      color: "bg-secondary/10 text-secondary",
      items: [
        "Votre premier parcours",
        "Utiliser la géolocalisation",
        "Échanger vos points",
        "Fonctionnalités avancées"
      ],
      action: "Regarder les vidéos"
    },
    {
      title: "Intelligence Artificielle",
      description: "Découvrez comment l'IA enrichit votre expérience CIARA",
      icon: MessageCircle,
      color: "bg-accent/10 text-accent",
      items: [
        "Assistant IA contextuel",
        "Recommandations personnalisées",
        "Génération de parcours automatique",
        "Analyse comportementale intelligente"
      ],
      action: "Explorer l'IA CIARA"
    },
    {
      title: "Support technique",
      description: "Assistance personnalisée pour vos problèmes techniques",
      icon: Headphones,
      color: "bg-accent/10 text-accent",
      items: [
        "Chat en direct",
        "Support par email",
        "Diagnostic automatique",
        "Signaler un bug"
      ],
      action: "Contacter le support"
    },
    {
      title: "Communauté",
      description: "Échangez avec d'autres utilisateurs CIARA",
      icon: Users,
      color: "bg-nature/10 text-nature",
      items: [
        "Forum communautaire",
        "Groupes locaux",
        "Conseils d'explorateurs",
        "Événements CIARA"
      ],
      action: "Rejoindre la communauté"
    }
  ];

  const quickActions = [
    {
      title: "Centre de téléchargement",
      description: "Guides PDF et ressources",
      icon: Download,
      link: "/downloads"
    },
    {
      title: "État du service",
      description: "Vérifier la disponibilité",
      icon: ExternalLink,
      link: "/status"
    },
    {
      title: "Nous contacter",
      description: "Support direct",
      icon: MessageCircle,
      link: "/contact"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton title="Centre d'aide" subtitle="Tout ce dont vous avez besoin pour utiliser CIARA" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Hero Section */}
          <Card className="mb-8 bg-gradient-primary text-white border-0">
            <CardContent className="text-center py-12">
              <h1 className="text-3xl font-bold mb-4">
                Comment pouvons-nous vous aider aujourd'hui ?
              </h1>
              <p className="text-xl opacity-90 mb-6 max-w-2xl mx-auto">
                Découvrez nos ressources d'aide, guides et support pour tirer le meilleur parti de votre expérience CIARA
              </p>
              <div className="flex justify-center">
                <Button size="lg" variant="secondary">
                  <Book className="mr-2 h-5 w-5" />
                  Guide de démarrage
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Help Sections */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {helpSections.map((section, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg ${section.color} flex items-center justify-center flex-shrink-0`}>
                      <section.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {section.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => {
                      if (section.title === "Intelligence Artificielle") {
                        window.location.href = "/ai-features";
                      }
                    }}
                  >
                    {section.action}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
              <CardDescription>
                Accès direct aux ressources les plus demandées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <Card key={index} className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <action.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="mt-8 border-destructive/20 bg-destructive/5">
            <CardContent className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Besoin d'aide urgente ?</h3>
              <p className="text-muted-foreground mb-4">
                Notre équipe de support est disponible pour vous aider rapidement
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="destructive">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Chat en direct
                </Button>
                <Button variant="outline">
                  support@ciara.app
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

export default HelpPage;