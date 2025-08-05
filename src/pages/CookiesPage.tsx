import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cookie, Settings, Eye, BarChart3, Shield, Mail } from 'lucide-react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
const CookiesPage = () => {
  const {
    t,
    currentLanguage
  } = useLanguage();
  return <div className="min-h-screen bg-background">
      <Header showBackButton={true} />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Cookie className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">{t('cookies_policy')}</h1>
            <p className="text-xl text-muted-foreground">
              {t('last_updated')}: {new Date().toLocaleDateString(currentLanguage === 'fr' ? 'fr-FR' : currentLanguage === 'en' ? 'en-US' : 'de-DE')}
            </p>
          </div>

          <div className="space-y-8">
            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cookie className="h-5 w-5 text-primary" />
                  1. {t('what_is_cookie')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{t('cookie_intro_1')}</p>
                <p>{t('cookie_intro_2')}</p>
              </CardContent>
            </Card>

            {/* Types of Cookies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  2. {t('types_cookies')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3 text-lg">2.1 {t('essential_cookies')}</h4>
                  <p className="mb-2">{t('essential_cookies_desc')}</p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>{t('authentication')} :</strong> {currentLanguage === 'en' ? 'Maintain your login session' : currentLanguage === 'de' ? 'Ihre Anmeldesitzung aufrechterhalten' : 'Maintenir votre session connectée'}</li>
                      <li><strong>{t('security')} :</strong> {currentLanguage === 'en' ? 'Protection against CSRF attacks' : currentLanguage === 'de' ? 'Schutz vor CSRF-Angriffen' : 'Protection contre les attaques CSRF'}</li>
                      <li><strong>{t('preferences')} :</strong> {currentLanguage === 'en' ? 'Selected language, display theme' : currentLanguage === 'de' ? 'Ausgewählte Sprache, Anzeigedesign' : 'Langue sélectionnée, thème d\'affichage'}</li>
                      <li><strong>{t('cart')} :</strong> {currentLanguage === 'en' ? 'Memorization of selected rewards' : currentLanguage === 'de' ? 'Speicherung ausgewählter Belohnungen' : 'Mémorisation des récompenses sélectionnées'}</li>
                    </ul>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>{t('conservation_duration')} :</strong> {currentLanguage === 'en' ? 'Session or up to 30 days' : currentLanguage === 'de' ? 'Sitzung oder bis zu 30 Tage' : 'Session ou jusqu\'à 30 jours'}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 text-lg">2.2 {t('performance_cookies')}</h4>
                  <p className="mb-2">{t('performance_cookies_desc')}</p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>{t('usage_analysis')} :</strong> {currentLanguage === 'en' ? 'Pages visited, session duration' : currentLanguage === 'de' ? 'Besuchte Seiten, Sitzungsdauer' : 'Pages visitées, durée des sessions'}</li>
                      <li><strong>{t('performance')} :</strong> {currentLanguage === 'en' ? 'Loading times, technical errors' : currentLanguage === 'de' ? 'Ladezeiten, technische Fehler' : 'Temps de chargement, erreurs techniques'}</li>
                      <li><strong>{t('ab_testing')} :</strong> {currentLanguage === 'en' ? 'Testing new features' : currentLanguage === 'de' ? 'Testen neuer Funktionen' : 'Tests de nouvelles fonctionnalités'}</li>
                      <li><strong>{t('heatmaps')} :</strong> {currentLanguage === 'en' ? 'Interface interaction zones' : currentLanguage === 'de' ? 'Interface-Interaktionszonen' : 'Zones d\'interaction sur l\'interface'}</li>
                    </ul>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>{t('conservation_duration')} :</strong> {currentLanguage === 'en' ? '24 months maximum' : currentLanguage === 'de' ? 'Maximal 24 Monate' : '24 mois maximum'}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 text-lg">2.3 {t('personalization_cookies')}</h4>
                  <p className="mb-2">{t('personalization_cookies_desc')}</p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>{t('recommendations')} :</strong> {currentLanguage === 'en' ? 'Suggested journeys based on your tastes' : currentLanguage === 'de' ? 'Vorgeschlagene Touren basierend auf Ihren Vorlieben' : 'Parcours suggérés basés sur vos goûts'}</li>
                      <li><strong>{t('history')} :</strong> {currentLanguage === 'en' ? 'Last consulted journeys' : currentLanguage === 'de' ? 'Zuletzt aufgerufene Touren' : 'Derniers parcours consultés'}</li>
                      <li><strong>{t('favorites')} :</strong> {currentLanguage === 'en' ? 'Preferred destinations and activities' : currentLanguage === 'de' ? 'Bevorzugte Ziele und Aktivitäten' : 'Destinations et activités préférées'}</li>
                      <li><strong>{t('settings')} :</strong> {currentLanguage === 'en' ? 'User interface configuration' : currentLanguage === 'de' ? 'Benutzeroberflächenkonfiguration' : 'Configuration de l\'interface utilisateur'}</li>
                    </ul>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>{t('conservation_duration')} :</strong> {currentLanguage === 'en' ? '12 months' : currentLanguage === 'de' ? '12 Monate' : '12 mois'}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 text-lg">2.4 {t('advertising_cookies')}</h4>
                  <p className="mb-2">{t('advertising_cookies_desc')}</p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>{t('targeting')} :</strong> {currentLanguage === 'en' ? 'Advertisements based on your interests' : currentLanguage === 'de' ? 'Werbung basierend auf Ihren Interessen' : 'Publicités basées sur vos centres d\'intérêt'}</li>
                      <li><strong>{t('measurement')} :</strong> {currentLanguage === 'en' ? 'Advertising campaign effectiveness' : currentLanguage === 'de' ? 'Effektivität von Werbekampagnen' : 'Efficacité des campagnes publicitaires'}</li>
                      <li><strong>{t('remarketing')} :</strong> {currentLanguage === 'en' ? 'Reminders for unfinished journeys' : currentLanguage === 'de' ? 'Erinnerungen an unvollendete Touren' : 'Rappels de parcours non terminés'}</li>
                    </ul>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>{t('conservation_duration')} :</strong> {currentLanguage === 'en' ? '13 months maximum' : currentLanguage === 'de' ? 'Maximal 13 Monate' : '13 mois maximum'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Third Party Cookies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  3. {t('third_party_cookies')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{t('third_party_intro')}</p>
                
                <div className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Google Analytics</h4>
                    <p className="text-sm text-muted-foreground">
                      {currentLanguage === 'en' ? 'Statistical analysis of our platform usage.' : currentLanguage === 'de' ? 'Statistische Analyse der Nutzung unserer Plattform.' : 'Analyse statistique de l\'utilisation de notre plateforme.'}
                      <a href="https://policies.google.com/privacy" className="text-primary hover:underline ml-1" target="_blank" rel="noopener noreferrer">
                        {currentLanguage === 'en' ? 'Google Privacy Policy' : currentLanguage === 'de' ? 'Google Datenschutzrichtlinie' : 'Politique de confidentialité Google'}
                      </a>
                    </p>
                  </div>
                  
                  
                  
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Supabase</h4>
                    <p className="text-sm text-muted-foreground">
                      {currentLanguage === 'en' ? 'Database and authentication infrastructure.' : currentLanguage === 'de' ? 'Datenbank- und Authentifizierungsinfrastruktur.' : 'Infrastructure de base de données et d\'authentification.'}
                      <a href="https://supabase.com/privacy" className="text-primary hover:underline ml-1" target="_blank" rel="noopener noreferrer">
                        {currentLanguage === 'en' ? 'Supabase Privacy Policy' : currentLanguage === 'de' ? 'Supabase Datenschutzrichtlinie' : 'Politique de confidentialité Supabase'}
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cookie Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  4. {t('cookie_management')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">4.1 {t('app_settings')}</h4>
                  <p>{t('app_settings_desc')}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Chrome</h4>
                    <p className="text-sm text-muted-foreground">
                      {currentLanguage === 'en' ? 'Settings → Privacy and security → Cookies' : currentLanguage === 'de' ? 'Einstellungen → Datenschutz und Sicherheit → Cookies' : 'Paramètres → Confidentialité et sécurité → Cookies'}
                    </p>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Firefox</h4>
                    <p className="text-sm text-muted-foreground">
                      {currentLanguage === 'en' ? 'Settings → Privacy and security → Cookies' : currentLanguage === 'de' ? 'Einstellungen → Datenschutz und Sicherheit → Cookies' : 'Paramètres → Vie privée et sécurité → Cookies'}
                    </p>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Safari</h4>
                    <p className="text-sm text-muted-foreground">
                      {currentLanguage === 'en' ? 'Preferences → Privacy → Cookies' : currentLanguage === 'de' ? 'Einstellungen → Datenschutz → Cookies' : 'Préférences → Confidentialité → Cookies'}
                    </p>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Edge</h4>
                    <p className="text-sm text-muted-foreground">
                      {currentLanguage === 'en' ? 'Settings → Cookies and site permissions' : currentLanguage === 'de' ? 'Einstellungen → Cookies und Website-Berechtigungen' : 'Paramètres → Cookies et autorisations de site'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">4.3 {t('disable_impact')}</h4>
                  <p>{t('disable_impact_desc')}</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>{t('essential_cookies')} : {currentLanguage === 'en' ? 'Service malfunctions' : currentLanguage === 'de' ? 'Funktionsstörungen des Dienstes' : 'Dysfonctionnements du service'}</li>
                    <li>{t('performance_cookies')} : {currentLanguage === 'en' ? 'No impact on usage' : currentLanguage === 'de' ? 'Keine Auswirkung auf die Nutzung' : 'Pas d\'impact sur l\'utilisation'}</li>
                    <li>{t('personalization_cookies')} : {currentLanguage === 'en' ? 'Less tailored experience' : currentLanguage === 'de' ? 'Weniger angepasste Erfahrung' : 'Expérience moins adaptée'}</li>
                    <li>{t('advertising_cookies')} : {currentLanguage === 'en' ? 'Less relevant advertisements' : currentLanguage === 'de' ? 'Weniger relevante Werbung' : 'Publicités moins pertinentes'}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Apps */}
            <Card>
              <CardHeader>
                <CardTitle>5. {t('mobile_apps')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{t('mobile_apps_desc')}</p>
                
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>{currentLanguage === 'en' ? 'Unique identifiers' : currentLanguage === 'de' ? 'Eindeutige Kennungen' : 'Identifiants uniques'} :</strong> {currentLanguage === 'en' ? 'To personalize your experience' : currentLanguage === 'de' ? 'Um Ihre Erfahrung zu personalisieren' : 'Pour personnaliser votre expérience'}</li>
                  <li><strong>{currentLanguage === 'en' ? 'Local storage' : currentLanguage === 'de' ? 'Lokaler Speicher' : 'Stockage local'} :</strong> {currentLanguage === 'en' ? 'For offline data' : currentLanguage === 'de' ? 'Für Offline-Daten' : 'Pour les données hors ligne'}</li>
                  <li><strong>{currentLanguage === 'en' ? 'Push notifications' : currentLanguage === 'de' ? 'Push-Benachrichtigungen' : 'Push notifications'} :</strong> {currentLanguage === 'en' ? 'To keep you informed' : currentLanguage === 'de' ? 'Um Sie zu informieren' : 'Pour vous tenir informé'}</li>
                  <li><strong>Analytics SDK :</strong> {currentLanguage === 'en' ? 'To improve our services' : currentLanguage === 'de' ? 'Um unsere Dienste zu verbessern' : 'Pour améliorer nos services'}</li>
                </ul>
                
                <p className="mt-4">
                  {currentLanguage === 'en' ? 'You can control these features via your device settings or directly in the application.' : currentLanguage === 'de' ? 'Sie können diese Funktionen über die Einstellungen Ihres Geräts oder direkt in der Anwendung steuern.' : 'Vous pouvez contrôler ces fonctionnalités via les paramètres de votre appareil ou directement dans l\'application.'}
                </p>
              </CardContent>
            </Card>

            {/* Data Transfer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  6. {t('data_transfers')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{t('data_transfers_desc')}</p>
                
                <ul className="list-disc pl-6 space-y-1">
                  <li>{currentLanguage === 'en' ? 'Countries with an adequacy decision from the European Commission' : currentLanguage === 'de' ? 'Länder mit einer Angemessenheitsentscheidung der Europäischen Kommission' : 'Pays bénéficiant d\'une décision d\'adéquation de la Commission européenne'}</li>
                  <li>{currentLanguage === 'en' ? 'Appropriate guarantees (standard contractual clauses, BCR, etc.)' : currentLanguage === 'de' ? 'Angemessene Garantien (Standardvertragsklauseln, BCR usw.)' : 'Garanties appropriées (clauses contractuelles types, BCR, etc.)'}</li>
                  <li>{currentLanguage === 'en' ? 'Derogations for specific situations' : currentLanguage === 'de' ? 'Ausnahmen für spezifische Situationen' : 'Dérogations pour des situations spécifiques'}</li>
                </ul>
                
                <p>
                  {currentLanguage === 'en' ? 'For more information on these transfers, see our' : currentLanguage === 'de' ? 'Für weitere Informationen zu diesen Übertragungen siehe unsere' : 'Pour plus d\'informations sur ces transferts, consultez notre'}
                  <a href="/privacy" className="text-primary hover:underline ml-1">
                    {currentLanguage === 'en' ? 'privacy policy' : currentLanguage === 'de' ? 'Datenschutzrichtlinie' : 'politique de confidentialité'}
                  </a>.
                </p>
              </CardContent>
            </Card>

            {/* Updates */}
            <Card>
              <CardHeader>
                <CardTitle>7. {t('policy_updates')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{t('policy_updates_desc')}</p>
                
                <p className="mt-4">
                  {currentLanguage === 'en' ? 'Any significant changes will be communicated to you via the application or by email before they take effect.' : currentLanguage === 'de' ? 'Alle wesentlichen Änderungen werden Ihnen über die Anwendung oder per E-Mail mitgeteilt, bevor sie in Kraft treten.' : 'Toute modification importante vous sera communiquée via l\'application ou par email avant son entrée en vigueur.'}
                </p>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
      
      <Footer />
    </div>;
};
export default CookiesPage;