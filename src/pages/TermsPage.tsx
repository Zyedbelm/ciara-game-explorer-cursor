
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Shield, AlertTriangle, Gavel, Mail } from 'lucide-react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

const TermsPage = () => {
  const { language } = useLanguage();
  
  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton={true} title={language === 'en' ? "Terms of Use" : language === 'de' ? "Nutzungsbedingungen" : "Conditions d'Utilisation"} />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <FileText className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">
              {language === 'en' 
                ? "Terms of Use" 
                : language === 'de' 
                  ? "Nutzungsbedingungen" 
                  : "Conditions d'Utilisation"
              }
            </h1>
            <p className="text-xl text-muted-foreground">
              {language === 'en' 
                ? "Last updated: " 
                : language === 'de' 
                  ? "Letzte Aktualisierung: " 
                  : "Dernière mise à jour : "
              }
              {new Date().toLocaleDateString(
                language === 'en' ? 'en-US' : language === 'de' ? 'de-DE' : 'fr-FR'
              )}
            </p>
          </div>

          <div className="space-y-8">
            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {language === 'en' ? "1. Acceptance of Terms" : language === 'de' ? "1. Annahme der Bedingungen" : "1. Acceptation des conditions"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  {language === 'en' 
                    ? "Welcome to CIARA, the intelligent tourism platform. These terms of use (the \"Terms\") govern your use of our services, applications and websites (collectively, the \"Service\")."
                    : language === 'de'
                      ? "Willkommen bei CIARA, der intelligenten Tourismusplattform. Diese Nutzungsbedingungen (die \"Bedingungen\") regeln Ihre Nutzung unserer Dienste, Anwendungen und Websites (zusammen der \"Dienst\")."
                      : "Bienvenue sur CIARA, la plateforme de tourisme intelligent. Ces conditions d'utilisation (les \"Conditions\") régissent votre utilisation de nos services, applications et sites web (collectivement, le \"Service\")."
                  }
                </p>
                <p>
                  {language === 'en' 
                    ? "By accessing or using our services, you agree to be bound by these Terms. If you do not agree to these terms, please do not use our services."
                    : language === 'de'
                      ? "Durch den Zugriff auf unsere Dienste oder deren Nutzung erklären Sie sich mit diesen Bedingungen einverstanden. Wenn Sie diesen Bedingungen nicht zustimmen, nutzen Sie bitte unsere Dienste nicht."
                      : "En accédant à nos services ou en les utilisant, vous acceptez d'être lié par ces Conditions. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services."
                  }
                </p>
              </CardContent>
            </Card>

            {/* Service Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {language === 'en' ? "2. Service Description" : language === 'de' ? "2. Beschreibung des Dienstes" : "2. Description du service"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  {language === 'en' 
                    ? "CIARA offers an intelligent tourism platform that allows users to:"
                    : language === 'de'
                      ? "CIARA bietet eine intelligente Tourismusplattform, die es Benutzern ermöglicht:"
                      : "CIARA propose une plateforme de tourisme intelligent qui permet aux utilisateurs de :"
                  }
                </p>
                
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    {language === 'en' 
                      ? "Discover destinations through gamified journeys" 
                      : language === 'de' 
                        ? "Reiseziele durch spielerische Reiserouten zu entdecken" 
                        : "Découvrir des destinations à travers des parcours gamifiés"
                    }
                  </li>
                  <li>
                    {language === 'en' 
                      ? "Earn points and unlock rewards" 
                      : language === 'de' 
                        ? "Punkte zu sammeln und Belohnungen freizuschalten" 
                        : "Gagner des points et débloquer des récompenses"
                    }
                  </li>
                  <li>
                    {language === 'en' 
                      ? "Access personalized content based on artificial intelligence" 
                      : language === 'de' 
                        ? "Auf personalisierte Inhalte basierend auf künstlicher Intelligenz zuzugreifen" 
                        : "Accéder à du contenu personnalisé basé sur l'intelligence artificielle"
                    }
                  </li>
                  <li>
                    {language === 'en' 
                      ? "Interact with local partners" 
                      : language === 'de' 
                        ? "Mit lokalen Partnern zu interagieren" 
                        : "Interagir avec des partenaires locaux"
                    }
                  </li>
                  <li>
                    {language === 'en' 
                      ? "Share their experiences with the community" 
                      : language === 'de' 
                        ? "Ihre Erfahrungen mit der Gemeinschaft zu teilen" 
                        : "Partager leurs expériences avec la communauté"
                    }
                  </li>
                </ul>
                
                <p>
                  {language === 'en' 
                    ? "We reserve the right to modify, suspend or discontinue all or part of our services at any time, with or without notice."
                    : language === 'de'
                      ? "Wir behalten uns das Recht vor, unsere Dienste jederzeit ganz oder teilweise zu ändern, auszusetzen oder einzustellen, mit oder ohne vorherige Ankündigung."
                      : "Nous nous réservons le droit de modifier, suspendre ou interrompre tout ou partie de nos services à tout moment, avec ou sans préavis."
                  }
                </p>
              </CardContent>
            </Card>

            {/* User Account */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  {language === 'en' ? "3. User Account" : language === 'de' ? "3. Benutzerkonto" : "3. Compte utilisateur"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">
                    {language === 'en' ? "3.1 Registration" : language === 'de' ? "3.1 Registrierung" : "3.1 Inscription"}
                  </h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      {language === 'en' 
                        ? "You must provide accurate and complete information during registration" 
                        : language === 'de' 
                          ? "Sie müssen bei der Registrierung genaue und vollständige Informationen angeben" 
                          : "Vous devez fournir des informations exactes et complètes lors de l'inscription"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "You are responsible for maintaining the confidentiality of your credentials" 
                        : language === 'de' 
                          ? "Sie sind für die Geheimhaltung Ihrer Zugangsdaten verantwortlich" 
                          : "Vous êtes responsable de maintenir la confidentialité de vos identifiants"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "You must be at least 13 years old to create an account" 
                        : language === 'de' 
                          ? "Sie müssen mindestens 13 Jahre alt sein, um ein Konto zu erstellen" 
                          : "Vous devez avoir au moins 13 ans pour créer un compte"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "One account per person is allowed" 
                        : language === 'de' 
                          ? "Ein Konto pro Person ist erlaubt" 
                          : "Un compte par personne est autorisé"
                      }
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">
                    {language === 'en' ? "3.2 User Responsibilities" : language === 'de' ? "3.2 Verantwortlichkeiten des Benutzers" : "3.2 Responsabilités de l'utilisateur"}
                  </h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      {language === 'en' 
                        ? "Use the service in accordance with applicable laws" 
                        : language === 'de' 
                          ? "Den Dienst in Übereinstimmung mit geltendem Recht nutzen" 
                          : "Utiliser le service de manière conforme aux lois applicables"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "Do not share your account with third parties" 
                        : language === 'de' 
                          ? "Ihr Konto nicht mit Dritten teilen" 
                          : "Ne pas partager votre compte avec des tiers"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "Notify us immediately of any unauthorized use" 
                        : language === 'de' 
                          ? "Uns umgehend über jede unbefugte Nutzung informieren" 
                          : "Nous notifier immédiatement de toute utilisation non autorisée"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "Keep your profile information up to date" 
                        : language === 'de' 
                          ? "Ihre Profilinformationen aktuell halten" 
                          : "Maintenir vos informations de profil à jour"
                      }
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Prohibited Uses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  {language === 'en' ? "4. Prohibited Uses" : language === 'de' ? "4. Verbotene Nutzungen" : "4. Utilisations interdites"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  {language === 'en' 
                    ? "You agree not to:"
                    : language === 'de'
                      ? "Sie verpflichten sich, Folgendes zu unterlassen:"
                      : "Vous vous engagez à ne pas :"
                  }
                </p>
                
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    {language === 'en' 
                      ? "Use the service for illegal or unauthorized purposes" 
                      : language === 'de' 
                        ? "Den Dienst für illegale oder nicht autorisierte Zwecke zu nutzen" 
                        : "Utiliser le service à des fins illégales ou non autorisées"
                    }
                  </li>
                  <li>
                    {language === 'en' 
                      ? "Harass, abuse or harm other users" 
                      : language === 'de' 
                        ? "Andere Benutzer zu belästigen, zu missbrauchen oder zu schädigen" 
                        : "Harceler, abuser ou nuire à d'autres utilisateurs"
                    }
                  </li>
                  <li>
                    {language === 'en' 
                      ? "Post offensive, defamatory or inappropriate content" 
                      : language === 'de' 
                        ? "Beleidigende, diffamierende oder unangemessene Inhalte zu veröffentlichen" 
                        : "Publier du contenu offensant, diffamatoire ou inapproprié"
                    }
                  </li>
                  <li>
                    {language === 'en' 
                      ? "Attempt to circumvent security measures" 
                      : language === 'de' 
                        ? "Zu versuchen, Sicherheitsmaßnahmen zu umgehen" 
                        : "Tenter de contourner les mesures de sécurité"
                    }
                  </li>
                  <li>
                    {language === 'en' 
                      ? "Use robots, scripts or other automated means" 
                      : language === 'de' 
                        ? "Roboter, Skripte oder andere automatisierte Mittel zu verwenden" 
                        : "Utiliser des robots, scripts ou autres moyens automatisés"
                    }
                  </li>
                  <li>
                    {language === 'en' 
                      ? "Collect personal data of other users" 
                      : language === 'de' 
                        ? "Persönliche Daten anderer Benutzer zu sammeln" 
                        : "Collecter des données personnelles d'autres utilisateurs"
                    }
                  </li>
                  <li>
                    {language === 'en' 
                      ? "Create fake accounts or impersonate others" 
                      : language === 'de' 
                        ? "Gefälschte Konten zu erstellen oder sich als andere auszugeben" 
                        : "Créer de faux comptes ou usurper l'identité d'autrui"
                    }
                  </li>
                  <li>
                    {language === 'en' 
                      ? "Interfere with the normal operation of the service" 
                      : language === 'de' 
                        ? "Den normalen Betrieb des Dienstes zu stören" 
                        : "Interférer avec le fonctionnement normal du service"
                    }
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Intellectual Property */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5 text-primary" />
                  {language === 'en' ? "5. Intellectual Property" : language === 'de' ? "5. Geistiges Eigentum" : "5. Propriété intellectuelle"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">
                    {language === 'en' ? "5.1 Our Property" : language === 'de' ? "5.1 Unser Eigentum" : "5.1 Notre propriété"}
                  </h4>
                  <p>
                    {language === 'en' 
                      ? "All content, features and technologies of CIARA, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, data compilations and software, belong to us or are licensed to us."
                      : language === 'de'
                        ? "Alle Inhalte, Funktionen und Technologien von CIARA, einschließlich, aber nicht beschränkt auf Texte, Grafiken, Logos, Symbole, Bilder, Audioclips, digitale Downloads, Datenzusammenstellungen und Software, gehören uns oder sind an uns lizenziert."
                        : "Tous les contenus, fonctionnalités et technologies de CIARA, incluant mais non limités aux textes, graphiques, logos, icônes, images, clips audio, téléchargements numériques, compilations de données et logiciels, nous appartiennent ou sont concédés sous licence."
                    }
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">
                    {language === 'en' ? "5.2 Your Content" : language === 'de' ? "5.2 Ihre Inhalte" : "5.2 Votre contenu"}
                  </h4>
                  <p>
                    {language === 'en' 
                      ? "By posting content on our platform, you grant us a worldwide, non-exclusive, royalty-free license to use, modify, reproduce and distribute this content in connection with our services."
                      : language === 'de'
                        ? "Durch das Veröffentlichen von Inhalten auf unserer Plattform gewähren Sie uns eine weltweite, nicht-exklusive, gebührenfreie Lizenz zur Nutzung, Änderung, Reproduktion und Verbreitung dieser Inhalte im Zusammenhang mit unseren Diensten."
                        : "En publiant du contenu sur notre plateforme, vous nous accordez une licence mondiale, non exclusive, libre de redevances pour utiliser, modifier, reproduire et distribuer ce contenu dans le cadre de nos services."
                    }
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">
                    {language === 'en' ? "5.3 Respect for Copyright" : language === 'de' ? "5.3 Respekt für Urheberrechte" : "5.3 Respect des droits d'auteur"}
                  </h4>
                  <p>
                    {language === 'en' 
                      ? "We respect the intellectual property rights of others and expect our users to do the same."
                      : language === 'de'
                        ? "Wir respektieren die geistigen Eigentumsrechte anderer und erwarten von unseren Benutzern dasselbe."
                        : "Nous respectons les droits de propriété intellectuelle d'autrui et nous attendons de nos utilisateurs qu'ils fassent de même."
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Rewards and Partners */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'en' ? "6. Rewards and Partners" : language === 'de' ? "6. Belohnungen und Partner" : "6. Récompenses et partenaires"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">
                    {language === 'en' ? "6.1 Points System" : language === 'de' ? "6.1 Punktesystem" : "6.1 Système de points"}
                  </h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      {language === 'en' 
                        ? "Points earned have no monetary value" 
                        : language === 'de' 
                          ? "Gesammelte Punkte haben keinen Geldwert" 
                          : "Les points gagnés n'ont aucune valeur monétaire"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "We reserve the right to modify the points system" 
                        : language === 'de' 
                          ? "Wir behalten uns das Recht vor, das Punktesystem zu ändern" 
                          : "Nous nous réservons le droit de modifier le système de points"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "Points may expire according to specific conditions" 
                        : language === 'de' 
                          ? "Punkte können gemäß bestimmten Bedingungen verfallen" 
                          : "Les points peuvent expirer selon les conditions spécifiques"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "Fraud or abuse may result in loss of points" 
                        : language === 'de' 
                          ? "Betrug oder Missbrauch kann zum Verlust von Punkten führen" 
                          : "La fraude ou l'abus peut entraîner la perte de points"
                      }
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">
                    {language === 'en' ? "6.2 Partners and Rewards" : language === 'de' ? "6.2 Partner und Belohnungen" : "6.2 Partenaires et récompenses"}
                  </h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      {language === 'en' 
                        ? "Partner offers are subject to their own terms" 
                        : language === 'de' 
                          ? "Partnerangebote unterliegen ihren eigenen Bedingungen" 
                          : "Les offres partenaires sont soumises à leurs propres conditions"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "We are not responsible for the products/services of our partners" 
                        : language === 'de' 
                          ? "Wir sind nicht verantwortlich für die Produkte/Dienstleistungen unserer Partner" 
                          : "Nous ne sommes pas responsables des produits/services de nos partenaires"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "Rewards may be modified or withdrawn without notice" 
                        : language === 'de' 
                          ? "Belohnungen können ohne vorherige Ankündigung geändert oder zurückgezogen werden" 
                          : "Les récompenses peuvent être modifiées ou retirées sans préavis"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "Some geographic restrictions may apply" 
                        : language === 'de' 
                          ? "Es können einige geografische Einschränkungen gelten" 
                          : "Certaines restrictions géographiques peuvent s'appliquer"
                      }
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Limitation of Liability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  {language === 'en' ? "7. Limitation of Liability" : language === 'de' ? "7. Haftungsbeschränkung" : "7. Limitation de responsabilité"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  {language === 'en' 
                    ? "To the extent permitted by applicable law:"
                    : language === 'de'
                      ? "Soweit nach geltendem Recht zulässig:"
                      : "Dans les limites autorisées par la loi applicable :"
                  }
                </p>
                
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    {language === 'en' 
                      ? "The service is provided \"as is\" without warranty of any kind" 
                      : language === 'de' 
                        ? "Der Dienst wird \"wie besehen\" ohne jegliche Garantie bereitgestellt" 
                        : "Le service est fourni \"en l'état\" sans garantie d'aucune sorte"
                    }
                  </li>
                  <li>
                    {language === 'en' 
                      ? "We do not guarantee that the service will be uninterrupted or error-free" 
                      : language === 'de' 
                        ? "Wir garantieren nicht, dass der Dienst unterbrechungs- oder fehlerfrei sein wird" 
                        : "Nous ne garantissons pas que le service sera ininterrompu ou sans erreur"
                    }
                  </li>
                  <li>
                    {language === 'en' 
                      ? "Our total liability will not exceed the amount paid for the service" 
                      : language === 'de' 
                        ? "Unsere Gesamthaftung wird den für den Dienst gezahlten Betrag nicht überschreiten" 
                        : "Notre responsabilité totale ne dépassera pas le montant payé pour le service"
                    }
                  </li>
                  <li>
                    {language === 'en' 
                      ? "We are not responsible for indirect or consequential damages" 
                      : language === 'de' 
                        ? "Wir sind nicht verantwortlich für indirekte oder Folgeschäden" 
                        : "Nous ne sommes pas responsables des dommages indirects ou consécutifs"
                    }
                  </li>
                  <li>
                    {language === 'en' 
                      ? "You use the service at your own risk" 
                      : language === 'de' 
                        ? "Sie nutzen den Dienst auf eigenes Risiko" 
                        : "Vous utilisez le service à vos propres risques"
                    }
                  </li>
                </ul>
                
                <p>
                  {language === 'en' 
                    ? "This limitation does not apply to cases of gross negligence or willful misconduct on our part."
                    : language === 'de'
                      ? "Diese Einschränkung gilt nicht für Fälle von grober Fahrlässigkeit oder vorsätzlichem Fehlverhalten unsererseits."
                      : "Cette limitation ne s'applique pas aux cas de négligence grave ou de dol de notre part."
                  }
                </p>
              </CardContent>
            </Card>

            {/* Termination */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'en' ? "8. Termination" : language === 'de' ? "8. Kündigung" : "8. Résiliation"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">
                    {language === 'en' ? "8.1 By You" : language === 'de' ? "8.1 Durch Sie" : "8.1 Par vous"}
                  </h4>
                  <p>
                    {language === 'en' 
                      ? "You can stop using our services at any time and delete your account from your profile settings."
                      : language === 'de'
                        ? "Sie können die Nutzung unserer Dienste jederzeit beenden und Ihr Konto in den Profileinstellungen löschen."
                        : "Vous pouvez arrêter d'utiliser nos services à tout moment et supprimer votre compte depuis les paramètres de votre profil."
                    }
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">
                    {language === 'en' ? "8.2 By Us" : language === 'de' ? "8.2 Durch uns" : "8.2 Par nous"}
                  </h4>
                  <p>
                    {language === 'en' 
                      ? "We may suspend or terminate your access in case of violation of these terms, with or without notice, depending on the severity of the violation."
                      : language === 'de'
                        ? "Wir können Ihren Zugang im Falle eines Verstoßes gegen diese Bedingungen mit oder ohne vorherige Ankündigung, je nach Schwere des Verstoßes, aussetzen oder beenden."
                        : "Nous pouvons suspendre ou résilier votre accès en cas de violation de ces conditions, avec ou sans préavis, selon la gravité de la violation."
                    }
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">
                    {language === 'en' ? "8.3 Effect of Termination" : language === 'de' ? "8.3 Wirkung der Kündigung" : "8.3 Effet de la résiliation"}
                  </h4>
                  <p>
                    {language === 'en' 
                      ? "Upon termination, your right to use our services ceases immediately. Provisions that by nature should survive termination remain in force."
                      : language === 'de'
                        ? "Nach der Kündigung endet Ihr Recht zur Nutzung unserer Dienste sofort. Bestimmungen, die aufgrund ihrer Natur die Kündigung überdauern sollten, bleiben in Kraft."
                        : "À la résiliation, votre droit d'utiliser nos services cesse immédiatement. Les dispositions qui par nature devraient survivre à la résiliation demeurent en vigueur."
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Governing Law */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5 text-primary" />
                  {language === 'en' ? "9. Governing Law and Jurisdiction" : language === 'de' ? "9. Geltendes Recht und Gerichtsstand" : "9. Droit applicable et juridiction"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  {language === 'en' 
                    ? "These terms are governed by Swiss law. Any dispute shall be submitted to the exclusive jurisdiction of the courts of Vullierens, Switzerland."
                    : language === 'de'
                      ? "Diese Bedingungen unterliegen schweizerischem Recht. Alle Streitigkeiten unterliegen der ausschließlichen Zuständigkeit der Gerichte von Vullierens, Schweiz."
                      : "Ces conditions sont régies par le droit suisse. Tout litige sera soumis à la juridiction exclusive des tribunaux de Vullierens, Suisse."
                  }
                </p>
                
                <p>
                  {language === 'en' 
                    ? "For consumers residing in the European Union, nothing in these terms limits your legal rights as a consumer."
                    : language === 'de'
                      ? "Für Verbraucher mit Wohnsitz in der Europäischen Union schränken diese Bedingungen Ihre gesetzlichen Rechte als Verbraucher nicht ein."
                      : "Pour les consommateurs résidant dans l'Union européenne, rien dans ces conditions ne limite vos droits légaux en tant que consommateur."
                  }
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  {language === 'en' ? "10. Contact" : language === 'de' ? "10. Kontakt" : "10. Contact"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  {language === 'en' 
                    ? "For any questions regarding these terms of use, contact us:"
                    : language === 'de'
                      ? "Bei Fragen zu diesen Nutzungsbedingungen kontaktieren Sie uns:"
                      : "Pour toute question concernant ces conditions d'utilisation, contactez-nous :"
                  }
                </p>
                
                <div className="bg-muted p-4 rounded-lg mt-4">
                  <p><strong>Email :</strong> info@ciara.city</p>
                  <p><strong>
                    {language === 'en' ? "Address" : language === 'de' ? "Adresse" : "Adresse"}
                  </strong>: CIARA, {language === 'en' ? "Legal Department" : language === 'de' ? "Rechtsabteilung" : "Service Juridique"}, Rue des Creusets 53, 1950 Sion, {language === 'en' ? "Switzerland" : language === 'de' ? "Schweiz" : "Suisse"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Updates */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'en' ? "11. Modifications" : language === 'de' ? "11. Änderungen" : "11. Modifications"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  {language === 'en' 
                    ? "We reserve the right to modify these terms at any time. Significant changes will be communicated by email and/or via a notification in the application at least 30 days before they take effect."
                    : language === 'de'
                      ? "Wir behalten uns das Recht vor, diese Bedingungen jederzeit zu ändern. Wesentliche Änderungen werden mindestens 30 Tage vor ihrem Inkrafttreten per E-Mail und/oder über eine Benachrichtigung in der Anwendung mitgeteilt."
                      : "Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications importantes seront communiquées par email et/ou via une notification dans l'application au moins 30 jours avant leur entrée en vigueur."
                  }
                </p>
                
                <p className="mt-4">
                  {language === 'en' 
                    ? "Your continued use of the service after the effective date of the modifications constitutes your acceptance of the new terms."
                    : language === 'de'
                      ? "Ihre fortgesetzte Nutzung des Dienstes nach dem Datum des Inkrafttretens der Änderungen stellt Ihre Annahme der neuen Bedingungen dar."
                      : "Votre utilisation continue du service après l'entrée en vigueur des modifications constitue votre acceptation des nouvelles conditions."
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TermsPage;
