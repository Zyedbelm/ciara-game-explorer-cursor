
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Lock, Users, Database, Mail } from 'lucide-react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

const PrivacyPage = () => {
  const { language } = useLanguage();
  
  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton={true} title={language === 'en' ? "Privacy Policy" : language === 'de' ? "Datenschutzrichtlinie" : "Politique de Confidentialité"} />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">
              {language === 'en' 
                ? "Privacy Policy" 
                : language === 'de' 
                  ? "Datenschutzrichtlinie" 
                  : "Politique de Confidentialité"
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
                  <Eye className="h-5 w-5 text-primary" />
                  {language === 'en' ? "1. Introduction" : language === 'de' ? "1. Einleitung" : "1. Introduction"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  {language === 'en' 
                    ? "CIARA (hereinafter \"we\", \"our\" or \"the company\") is committed to protecting the privacy and personal data of its users. This privacy policy describes how we collect, use, store and protect your personal information in accordance with the European General Data Protection Regulation (GDPR) and the Swiss Federal Data Protection Act (DPA)."
                    : language === 'de'
                      ? "CIARA (im Folgenden \"wir\", \"uns\" oder \"das Unternehmen\") verpflichtet sich, die Privatsphäre und personenbezogenen Daten seiner Benutzer zu schützen. Diese Datenschutzrichtlinie beschreibt, wie wir Ihre persönlichen Informationen in Übereinstimmung mit der Europäischen Datenschutz-Grundverordnung (DSGVO) und dem Schweizerischen Bundesgesetz über den Datenschutz (DSG) sammeln, verwenden, speichern und schützen."
                      : "CIARA (ci-après \"nous\", \"notre\" ou \"la société\") s'engage à protéger la vie privée et les données personnelles de ses utilisateurs. Cette politique de confidentialité décrit comment nous collectons, utilisons, stockons et protégeons vos informations personnelles conformément au Règlement Général sur la Protection des Données (RGPD) européen et à la Loi fédérale suisse sur la protection des données (LPD)."
                  }
                </p>
                <p>
                  {language === 'en' 
                    ? "By using our CIARA intelligent tourism platform, you accept the practices described in this policy."
                    : language === 'de'
                      ? "Durch die Nutzung unserer intelligenten Tourismusplattform CIARA akzeptieren Sie die in dieser Richtlinie beschriebenen Praktiken."
                      : "En utilisant notre plateforme de tourisme intelligent CIARA, vous acceptez les pratiques décrites dans cette politique."
                  }
                </p>
              </CardContent>
            </Card>

            {/* Data Collection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  {language === 'en' ? "2. Data We Collect" : language === 'de' ? "2. Daten, die wir sammeln" : "2. Données que nous collectons"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">
                    {language === 'en' ? "2.1 Data provided directly" : language === 'de' ? "2.1 Direkt bereitgestellte Daten" : "2.1 Données fournies directement"}
                  </h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      {language === 'en' 
                        ? "Name, first name and email address during registration" 
                        : language === 'de' 
                          ? "Name, Vorname und E-Mail-Adresse bei der Registrierung" 
                          : "Nom, prénom et adresse email lors de l'inscription"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "Travel preferences and interests" 
                        : language === 'de' 
                          ? "Reisepräferenzen und Interessen" 
                          : "Préférences de voyage et centres d'intérêt"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "Fitness level" 
                        : language === 'de' 
                          ? "Fitnesslevel" 
                          : "Niveau de forme physique"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "Profile pictures (optional)" 
                        : language === 'de' 
                          ? "Profilbilder (optional)" 
                          : "Photos de profil (facultatif)"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "Communications with our customer support" 
                        : language === 'de' 
                          ? "Kommunikation mit unserem Kundensupport" 
                          : "Communications avec notre support client"
                      }
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">
                    {language === 'en' ? "2.2 Data collected automatically" : language === 'de' ? "2.2 Automatisch gesammelte Daten" : "2.2 Données collectées automatiquement"}
                  </h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      {language === 'en' 
                        ? "Location data (with your consent)" 
                        : language === 'de' 
                          ? "Standortdaten (mit Ihrer Zustimmung)" 
                          : "Données de localisation (avec votre consentement)"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "Information about app usage" 
                        : language === 'de' 
                          ? "Informationen über die Nutzung der App" 
                          : "Informations sur l'utilisation de l'application"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "Technical data (device type, browser, IP address)" 
                        : language === 'de' 
                          ? "Technische Daten (Gerätetyp, Browser, IP-Adresse)" 
                          : "Données techniques (type d'appareil, navigateur, adresse IP)"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "Completed journeys and game progression" 
                        : language === 'de' 
                          ? "Abgeschlossene Reiserouten und Spielfortschritt" 
                          : "Parcours complétés et progression dans les jeux"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "Points and rewards earned" 
                        : language === 'de' 
                          ? "Gesammelte Punkte und Belohnungen" 
                          : "Points et récompenses obtenus"
                      }
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Data Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {language === 'en' ? "3. How We Use Your Data" : language === 'de' ? "3. Wie wir Ihre Daten verwenden" : "3. Comment nous utilisons vos données"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">
                    {language === 'en' ? "3.1 Main purposes" : language === 'de' ? "3.1 Hauptzwecke" : "3.1 Finalités principales"}
                  </h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      {language === 'en' 
                        ? "Provide and personalize our intelligent tourism services" 
                        : language === 'de' 
                          ? "Bereitstellung und Personalisierung unserer intelligenten Tourismusdienste" 
                          : "Fournir et personnaliser nos services de tourisme intelligent"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "Create journeys adapted to your preferences" 
                        : language === 'de' 
                          ? "Erstellung von Reiserouten, die an Ihre Präferenzen angepasst sind" 
                          : "Créer des parcours adaptés à vos préférences"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "Manage your account and progress" 
                        : language === 'de' 
                          ? "Verwaltung Ihres Kontos und Ihres Fortschritts" 
                          : "Gérer votre compte et votre progression"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "Process rewards and partnerships" 
                        : language === 'de' 
                          ? "Verarbeitung von Belohnungen und Partnerschaften" 
                          : "Traiter les récompenses et partenariats"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "Improve our platform and develop new features" 
                        : language === 'de' 
                          ? "Verbesserung unserer Plattform und Entwicklung neuer Funktionen" 
                          : "Améliorer notre plateforme et développer de nouvelles fonctionnalités"
                      }
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">
                    {language === 'en' ? "3.2 Communication" : language === 'de' ? "3.2 Kommunikation" : "3.2 Communication"}
                  </h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      {language === 'en' 
                        ? "Send you important notifications about the service" 
                        : language === 'de' 
                          ? "Zusendung wichtiger Benachrichtigungen über den Dienst" 
                          : "Vous envoyer des notifications importantes sur le service"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "Respond to your support requests" 
                        : language === 'de' 
                          ? "Beantwortung Ihrer Support-Anfragen" 
                          : "Répondre à vos demandes de support"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "Inform you about new features (with your consent)" 
                        : language === 'de' 
                          ? "Sie über neue Funktionen informieren (mit Ihrer Zustimmung)" 
                          : "Vous informer de nouvelles fonctionnalités (avec votre consentement)"
                      }
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  {language === 'en' ? "4. Data Security and Protection" : language === 'de' ? "4. Datensicherheit und -schutz" : "4. Sécurité et protection des données"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  {language === 'en' 
                    ? "We implement appropriate technical and organizational security measures to protect your personal data against unauthorized access, modification, disclosure or destruction."
                    : language === 'de'
                      ? "Wir setzen angemessene technische und organisatorische Sicherheitsmaßnahmen ein, um Ihre personenbezogenen Daten vor unbefugtem Zugriff, Änderung, Offenlegung oder Zerstörung zu schützen."
                      : "Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données personnelles contre l'accès non autorisé, la modification, la divulgation ou la destruction."
                  }
                </p>
                
                <div>
                  <h4 className="font-semibold mb-2">
                    {language === 'en' ? "Security measures:" : language === 'de' ? "Sicherheitsmaßnahmen:" : "Mesures de sécurité :"}
                  </h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      {language === 'en' 
                        ? "Encryption of data in transit and at rest" 
                        : language === 'de' 
                          ? "Verschlüsselung der Daten während der Übertragung und im Ruhezustand" 
                          : "Chiffrement des données en transit et au repos"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "Secure authentication" 
                        : language === 'de' 
                          ? "Sichere Authentifizierung" 
                          : "Authentification sécurisée"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "Limited access to data on a need-to-know basis" 
                        : language === 'de' 
                          ? "Eingeschränkter Zugriff auf Daten nach dem Need-to-know-Prinzip" 
                          : "Accès limité aux données selon le principe du besoin d'en connaître"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "Continuous security monitoring" 
                        : language === 'de' 
                          ? "Kontinuierliche Sicherheitsüberwachung" 
                          : "Surveillance continue de la sécurité"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "Regular and secure backups" 
                        : language === 'de' 
                          ? "Regelmäßige und sichere Backups" 
                          : "Sauvegardes régulières et sécurisées"
                      }
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* User Rights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  {language === 'en' ? "5. Your Rights" : language === 'de' ? "5. Ihre Rechte" : "5. Vos droits"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  {language === 'en' 
                    ? "In accordance with the GDPR and Swiss DPA, you have the following rights:"
                    : language === 'de'
                      ? "Gemäß der DSGVO und dem schweizerischen DSG haben Sie folgende Rechte:"
                      : "Conformément au RGPD et à la LPD suisse, vous disposez des droits suivants :"
                  }
                </p>
                
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>
                    {language === 'en' 
                      ? "Right of access" 
                      : language === 'de' 
                        ? "Recht auf Auskunft" 
                        : "Droit d'accès"
                    }
                  </strong>: 
                    {language === 'en' 
                      ? " obtain a copy of your personal data" 
                      : language === 'de' 
                        ? " eine Kopie Ihrer personenbezogenen Daten erhalten" 
                        : " obtenir une copie de vos données personnelles"
                    }
                  </li>
                  <li><strong>
                    {language === 'en' 
                      ? "Right to rectification" 
                      : language === 'de' 
                        ? "Recht auf Berichtigung" 
                        : "Droit de rectification"
                    }
                  </strong>: 
                    {language === 'en' 
                      ? " correct inaccurate data" 
                      : language === 'de' 
                        ? " ungenaue Daten korrigieren" 
                        : " corriger des données inexactes"
                    }
                  </li>
                  <li><strong>
                    {language === 'en' 
                      ? "Right to erasure" 
                      : language === 'de' 
                        ? "Recht auf Löschung" 
                        : "Droit à l'effacement"
                    }
                  </strong>: 
                    {language === 'en' 
                      ? " request deletion of your data" 
                      : language === 'de' 
                        ? " die Löschung Ihrer Daten beantragen" 
                        : " demander la suppression de vos données"
                    }
                  </li>
                  <li><strong>
                    {language === 'en' 
                      ? "Right to data portability" 
                      : language === 'de' 
                        ? "Recht auf Datenübertragbarkeit" 
                        : "Droit à la portabilité"
                    }
                  </strong>: 
                    {language === 'en' 
                      ? " receive your data in a structured format" 
                      : language === 'de' 
                        ? " Ihre Daten in einem strukturierten Format erhalten" 
                        : " recevoir vos données dans un format structuré"
                    }
                  </li>
                  <li><strong>
                    {language === 'en' 
                      ? "Right to object" 
                      : language === 'de' 
                        ? "Widerspruchsrecht" 
                        : "Droit d'opposition"
                    }
                  </strong>: 
                    {language === 'en' 
                      ? " object to the processing of your data" 
                      : language === 'de' 
                        ? " der Verarbeitung Ihrer Daten widersprechen" 
                        : " vous opposer au traitement de vos données"
                    }
                  </li>
                  <li><strong>
                    {language === 'en' 
                      ? "Right to restriction" 
                      : language === 'de' 
                        ? "Recht auf Einschränkung" 
                        : "Droit de limitation"
                    }
                  </strong>: 
                    {language === 'en' 
                      ? " limit the processing of your data" 
                      : language === 'de' 
                        ? " die Verarbeitung Ihrer Daten einschränken" 
                        : " limiter le traitement de vos données"
                    }
                  </li>
                </ul>
                
                <p>
                  {language === 'en' 
                    ? "To exercise these rights, contact us at: "
                    : language === 'de'
                      ? "Um diese Rechte auszuüben, kontaktieren Sie uns unter: "
                      : "Pour exercer ces droits, contactez-nous à l'adresse : "
                  }
                  <strong>privacy@ciara.city</strong>
                </p>
              </CardContent>
            </Card>

            {/* Data Retention */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  {language === 'en' ? "6. Data Retention" : language === 'de' ? "6. Datenspeicherung" : "6. Conservation des données"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  {language === 'en' 
                    ? "We retain your personal data for as long as necessary for the purposes described in this policy:"
                    : language === 'de'
                      ? "Wir bewahren Ihre personenbezogenen Daten so lange auf, wie es für die in dieser Richtlinie beschriebenen Zwecke erforderlich ist:"
                      : "Nous conservons vos données personnelles aussi longtemps que nécessaire pour les finalités décrites dans cette politique :"
                  }
                </p>
                
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    {language === 'en' 
                      ? "Account data: as long as your account is active" 
                      : language === 'de' 
                        ? "Kontodaten: solange Ihr Konto aktiv ist" 
                        : "Données de compte : tant que votre compte est actif"
                    }
                  </li>
                  <li>
                    {language === 'en' 
                      ? "Journey data: 3 years after last activity" 
                      : language === 'de' 
                        ? "Reisedaten: 3 Jahre nach der letzten Aktivität" 
                        : "Données de parcours : 3 ans après la dernière activité"
                    }
                  </li>
                  <li>
                    {language === 'en' 
                      ? "Communication data: 2 years" 
                      : language === 'de' 
                        ? "Kommunikationsdaten: 2 Jahre" 
                        : "Données de communication : 2 ans"
                    }
                  </li>
                  <li>
                    {language === 'en' 
                      ? "Technical data: 12 months maximum" 
                      : language === 'de' 
                        ? "Technische Daten: maximal 12 Monate" 
                        : "Données techniques : 12 mois maximum"
                    }
                  </li>
                </ul>
                
                <p>
                  {language === 'en' 
                    ? "After these periods, data is either anonymized or securely deleted."
                    : language === 'de'
                      ? "Nach diesen Zeiträumen werden die Daten entweder anonymisiert oder sicher gelöscht."
                      : "Après ces périodes, les données sont soit anonymisées soit supprimées de manière sécurisée."
                  }
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  {language === 'en' ? "7. Contact and Complaints" : language === 'de' ? "7. Kontakt und Beschwerden" : "7. Contact et réclamations"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  {language === 'en' 
                    ? "For any questions regarding this privacy policy or to exercise your rights, you can contact us:"
                    : language === 'de'
                      ? "Bei Fragen zu dieser Datenschutzrichtlinie oder zur Ausübung Ihrer Rechte können Sie uns kontaktieren:"
                      : "Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, vous pouvez nous contacter :"
                  }
                </p>
                
                <div className="bg-muted p-4 rounded-lg">
                  <p><strong>Email :</strong> info@ciara.city</p>
                  <p><strong>
                    {language === 'en' ? "Address" : language === 'de' ? "Adresse" : "Adresse"}
                  </strong>: CIARA, {language === 'en' ? "Data Protection" : language === 'de' ? "Datenschutz" : "Protection des Données"}, Rue des Creusets 53, 1950 Sion, {language === 'en' ? "Switzerland" : language === 'de' ? "Schweiz" : "Suisse"}</p>
                </div>
                
                <p>
                  {language === 'en' 
                    ? "You also have the right to lodge a complaint with the competent supervisory authority:"
                    : language === 'de'
                      ? "Sie haben auch das Recht, eine Beschwerde bei der zuständigen Aufsichtsbehörde einzureichen:"
                      : "Vous avez également le droit de déposer une plainte auprès de l'autorité de contrôle compétente :"
                  }
                </p>
                
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>
                    {language === 'en' ? "In Switzerland" : language === 'de' ? "In der Schweiz" : "En Suisse"}
                  </strong>: 
                    {language === 'en' 
                      ? " Federal Data Protection and Information Commissioner (FDPIC)" 
                      : language === 'de' 
                        ? " Eidgenössischer Datenschutz- und Öffentlichkeitsbeauftragter (EDÖB)" 
                        : " Préposé fédéral à la protection des données et à la transparence (PFPDT)"
                    }
                  </li>
                  <li><strong>
                    {language === 'en' ? "In France" : language === 'de' ? "In Frankreich" : "En France"}
                  </strong>: 
                    {language === 'en' 
                      ? " National Commission on Informatics and Liberty (CNIL)" 
                      : language === 'de' 
                        ? " Nationale Kommission für Informatik und Freiheiten (CNIL)" 
                        : " Commission Nationale de l'Informatique et des Libertés (CNIL)"
                    }
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Updates */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'en' ? "8. Changes to this Policy" : language === 'de' ? "8. Änderungen dieser Richtlinie" : "8. Modifications de cette politique"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  {language === 'en' 
                    ? "We may modify this privacy policy from time to time. Any changes will be communicated via email and/or through a notification in the application. The date of last update will be indicated at the top of this page."
                    : language === 'de'
                      ? "Wir können diese Datenschutzrichtlinie von Zeit zu Zeit ändern. Alle Änderungen werden per E-Mail und/oder über eine Benachrichtigung in der Anwendung mitgeteilt. Das Datum der letzten Aktualisierung wird oben auf dieser Seite angezeigt."
                      : "Nous pouvons modifier cette politique de confidentialité occasionnellement. Toute modification sera communiquée par email et/ou via une notification dans l'application. La date de dernière mise à jour sera indiquée en haut de cette page."
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

export default PrivacyPage;
