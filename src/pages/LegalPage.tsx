import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, Building, Phone, Mail, MapPin, FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { StandardPageLayout } from '@/components/layout';

const LegalPage = () => {
  const { t, language } = useLanguage();
  
  return (
    <StandardPageLayout
      title={t('legal_title')}
      subtitle={t('legal_subtitle')}
      showBackButton={true}
    >
      {/* Header */}
      <div className="text-center mb-12">
        <Scale className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-4">{t('legal_mentions')}</h1>
        <p className="text-xl text-muted-foreground">
          {t('legal_info_description')}
        </p>
      </div>

      <div className="space-y-8">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              {language === 'en' ? '1. Company Information' : language === 'de' ? '1. Unternehmensinformationen' : '1. Informations sur l\'entreprise'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/30 p-6 rounded-lg">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">{t('legal_company_name')}</h4>
                  <p>
                    {language === 'en' ? 'CIARA and CIARA.city are trademarks of the Micro-Entreprise' : 
                     language === 'de' ? 'CIARA und CIARA.city sind Marken des Micro-Entreprise' : 
                     'CIARA et CIARA.city sont des marques de la Micro-Entreprise'}
                  </p>
                  
                  <h4 className="font-semibold mb-2 mt-4">{t('legal_legal_form')}</h4>
                  <p>
                    {language === 'en' ? 'French Micro-Entreprise' : 
                     language === 'de' ? 'Französisches Micro-Entreprise' : 
                     'Micro-Entreprise française'}
                  </p>
                  
                  <h4 className="font-semibold mb-2 mt-4">SIRET</h4>
                  <p>52270423800016</p>
                  
                  <h4 className="font-semibold mb-2 mt-4">{t('legal_capital')}</h4>
                  <p>
                    {language === 'en' ? 'Not applicable (Micro-Entreprise)' : 
                     language === 'de' ? 'Nicht zutreffend (Micro-Entreprise)' : 
                     'Non applicable (Micro-Entreprise)'}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">{t('legal_headquarters')}</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="font-medium">
                          {language === 'en' ? 'France (Main address)' : 
                           language === 'de' ? 'Frankreich (Hauptadresse)' : 
                           'France (Adresse principale)'}
                        </p>
                        <p>3 Rue du Cers</p>
                        <p>11200 Ferrals les Corbières</p>
                        <p>{language === 'en' ? 'France' : language === 'de' ? 'Frankreich' : 'France'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="font-medium">
                          {language === 'en' ? 'Switzerland (Operational address)' : 
                           language === 'de' ? 'Schweiz (Betriebsadresse)' : 
                           'Suisse (Adresse opérationnelle)'}
                        </p>
                        <p>Rue des Creusets 53</p>
                        <p>1950 Sion</p>
                        <p>{language === 'en' ? 'Switzerland' : language === 'de' ? 'Schweiz' : 'Suisse'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <h4 className="font-semibold mb-2 mt-4">{t('legal_trade_register')}</h4>
                  <p>
                    {language === 'en' ? 'Registered in the French business register' : 
                     language === 'de' ? 'Im französischen Handelsregister eingetragen' : 
                     'Inscrite au Registre du Commerce français'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              {language === 'en' ? '2. Contact Details' : language === 'de' ? '2. Kontaktdaten' : '2. Coordonnées de contact'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Phone className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-2">{t('legal_phone')}</h4>
                <p>+41 79 301 79 15</p>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Mail className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-2">{t('legal_email_general')}</h4>
                <p>info@ciara.city</p>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-2">{t('legal_support')}</h4>
                <p>info@ciara.city</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-semibold mb-3">{t('legal_specialized_contacts')}</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>{t('legal_legal_questions')}:</strong> info@ciara.city</p>
                  <p><strong>{t('legal_data_protection')}:</strong> info@ciara.city</p>
                  <p><strong>{t('legal_partnerships')}:</strong> info@ciara.city</p>
                </div>
                <div>
                  <p><strong>{t('legal_press')}:</strong> info@ciara.city</p>
                  <p><strong>{t('legal_investors')}:</strong> info@ciara.city</p>
                  <p><strong>{t('legal_careers')}:</strong> info@ciara.city</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hosting */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'en' ? '3. Hosting' : language === 'de' ? '3. Hosting' : '3. Hébergement'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">{t('legal_hosting_services')}</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">{t('legal_web_application')}</h5>
                  <p className="text-sm">Lovable.dev</p>
                  <p className="text-sm">77 Geary St 5th Floor</p>
                  <p className="text-sm">San Francisco, CA 94108, USA</p>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">{t('legal_database')}</h5>
                  <p className="text-sm">Supabase Inc.</p>
                  <p className="text-sm">970 Toa Payoh North #07-04</p>
                  <p className="text-sm">Singapore 318992</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">{t('legal_cdn_services')}</h4>
              <div className="text-sm space-y-1">
                <p><strong>{t('legal_images_media')}:</strong> Cloudinary Ltd. (Irlande)</p>
                <p><strong>{t('legal_maps')}:</strong> Mapbox Inc. (États-Unis)</p>
                <p><strong>{t('legal_analytics')}:</strong> Google LLC (États-Unis)</p>
                <p><strong>{t('legal_email')}:</strong> Resend Inc. (États-Unis)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Updates */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'en' ? '4. Updates to Legal Information' : 
               language === 'de' ? '4. Aktualisierung der rechtlichen Informationen' : 
               '4. Mise à jour des mentions légales'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              {language === 'en' 
                ? 'This legal information may be updated at any time to reflect changes in our organization, our services or legal requirements.' 
                : language === 'de'
                ? 'Diese rechtlichen Informationen können jederzeit aktualisiert werden, um Änderungen in unserer Organisation, unseren Dienstleistungen oder rechtlichen Anforderungen widerzuspiegeln.'
                : 'Ces mentions légales peuvent être mises à jour à tout moment pour refléter les changements dans notre organisation, nos services ou les exigences légales.'}
            </p>
            
            <p className="mt-4">
              {language === 'en' 
                ? 'The version in force is always the one published on this page. Last update: ' 
                : language === 'de'
                ? 'Die gültige Version ist immer die auf dieser Seite veröffentlichte. Letzte Aktualisierung: '
                : 'La version en vigueur est toujours celle publiée sur cette page. Dernière mise à jour : '}
              <strong>{new Date().toLocaleDateString(language === 'en' ? 'en-US' : language === 'de' ? 'de-DE' : 'fr-FR')}</strong>
            </p>
          </CardContent>
        </Card>
      </div>
    </StandardPageLayout>
  );
};

export default LegalPage;