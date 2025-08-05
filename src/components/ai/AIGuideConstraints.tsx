import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bot, Shield, Info } from 'lucide-react';

interface AIGuideConstraintsProps {
  language?: string;
}

const AIGuideConstraints: React.FC<AIGuideConstraintsProps> = ({ language = 'fr' }) => {
  const getTranslations = () => {
    switch (language) {
      case 'en':
        return {
          title: 'AI Guide Constraints',
          subtitle: 'CIARA is limited to its tourism guide role',
          description: 'CIARA is an intelligent tourism assistant specialized in discovering destinations. Its responses are automatically filtered to remain within this scope.',
          allowedTopics: 'Allowed Topics',
          restrictedTopics: 'Restricted Topics',
          securityNote: 'Security Note',
          securityDescription: 'All AI conversations are monitored to ensure content quality and safety.',
          allowed: [
            'Tourist sites and monuments',
            'Local gastronomy and restaurants',
            'Historical and cultural information',
            'Activities and entertainment',
            'Transportation and routes',
            'Practical advice for travelers',
            'Local events and festivals',
            'Nature and hiking'
          ],
          restricted: [
            'Political subjects',
            'Personal or private information',
            'Medical or legal advice',
            'Commercial recommendations outside tourism',
            'Technical subjects unrelated to travel',
            'Personal opinions on sensitive subjects',
            'Information about other platforms or competitors'
          ]
        };
      case 'de':
        return {
          title: 'KI-Reiseführer Beschränkungen',
          subtitle: 'CIARA ist auf ihre Rolle als Tourismusführer beschränkt',
          description: 'CIARA ist ein intelligenter Tourismusassistent, spezialisiert auf die Entdeckung von Reisezielen. Ihre Antworten werden automatisch gefiltert, um in diesem Bereich zu bleiben.',
          allowedTopics: 'Erlaubte Themen',
          restrictedTopics: 'Eingeschränkte Themen',
          securityNote: 'Sicherheitshinweis',
          securityDescription: 'Alle KI-Gespräche werden überwacht, um die Qualität und Sicherheit der Inhalte zu gewährleisten.',
          allowed: [
            'Touristische Sehenswürdigkeiten und Denkmäler',
            'Lokale Gastronomie und Restaurants',
            'Historische und kulturelle Informationen',
            'Aktivitäten und Unterhaltung',
            'Transport und Routen',
            'Praktische Reisetipps',
            'Lokale Veranstaltungen und Festivals',
            'Natur und Wandern'
          ],
          restricted: [
            'Politische Themen',
            'Persönliche oder private Informationen',
            'Medizinische oder rechtliche Beratung',
            'Kommerzielle Empfehlungen außerhalb des Tourismus',
            'Technische Themen, die nicht mit Reisen zu tun haben',
            'Persönliche Meinungen zu sensiblen Themen',
            'Informationen über andere Plattformen oder Konkurrenten'
          ]
        };
      default: // French
        return {
          title: 'Contraintes IA Guide',
          subtitle: 'CIARA est limitée à son rôle de guide touristique',
          description: 'CIARA est un assistant touristique intelligent spécialisé dans la découverte de destinations. Ses réponses sont automatiquement filtrées pour rester dans ce périmètre.',
          allowedTopics: 'Sujets Autorisés',
          restrictedTopics: 'Sujets Restreints',
          securityNote: 'Note de Sécurité',
          securityDescription: 'Toutes les conversations IA sont surveillées pour garantir la qualité et la sécurité du contenu.',
          allowed: [
            'Sites touristiques et monuments',
            'Gastronomie locale et restaurants',
            'Informations historiques et culturelles',
            'Activités et divertissements',
            'Transports et itinéraires',
            'Conseils pratiques pour voyageurs',
            'Événements et festivals locaux',
            'Nature et randonnées'
          ],
          restricted: [
            'Sujets politiques',
            'Informations personnelles ou privées',
            'Conseils médicaux ou juridiques',
            'Recommandations commerciales hors tourisme',
            'Sujets techniques non liés au voyage',
            'Opinions personnelles sur sujets sensibles',
            'Informations sur d\'autres plateformes ou concurrents'
          ]
        };
    }
  };

  const t = getTranslations();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">{t.title}</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">{t.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t.allowedTopics}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {t.allowed.map((topic, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-800">{topic}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t.restrictedTopics}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {t.restricted.map((topic, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-red-800">{topic}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>{t.securityNote}:</strong> {t.securityDescription}
        </AlertDescription>
      </Alert>

      <div className="flex flex-wrap gap-2 justify-center">
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Filtrage automatique
        </Badge>
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          Contenu vérifié
        </Badge>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Réponses sécurisées
        </Badge>
      </div>
    </div>
  );
};

export default AIGuideConstraints;