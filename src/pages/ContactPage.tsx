
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  MessageCircle,
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from '@/contexts/LanguageContext';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'normal'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('send-contact-form', {
        body: formData
      });

      if (error) throw error;

      toast({
        title: language === 'en' ? "Message sent!" : "Message envoyé !",
        description: language === 'en' 
          ? "We will respond as soon as possible." 
          : "Nous vous répondrons dans les plus brefs délais.",
        variant: "default"
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        priority: 'normal'
      });
    } catch (error) {
      toast({
        title: language === 'en' ? "Error sending message" : "Erreur d'envoi",
        description: language === 'en' 
          ? "Please try again later or contact us directly." 
          : "Veuillez réessayer plus tard ou nous contacter directement.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const contactInfo = [
    {
      icon: Mail,
      title: t('contact_email'),
      content: "info@ciara.city",
      description: t('contact_email_response'),
      action: "mailto:info@ciara.city"
    },
    {
      icon: Phone,
      title: t('contact_phone'),
      content: "+41 79 301 79 15",
      description: t('contact_phone_hours'),
      action: "tel:+41793017915"
    },
    {
      icon: MapPin,
      title: t('contact_address'),
      content: language === 'en' ? 'France (Main address)' : 
               language === 'de' ? 'Frankreich (Hauptadresse)' : 
               'France (Adresse principale)',
      description: "3 Rue du Cers, 11200 Ferrals les Corbières, France",
      action: "https://maps.google.com/?q=3+Rue+du+Cers+11200+Ferrals+les+Corbières+France"
    },
    {
      icon: MapPin,
      title: t('contact_address'),
      content: language === 'en' ? 'Switzerland (Operational address)' : 
               language === 'de' ? 'Schweiz (Betriebsadresse)' : 
               'Suisse (Adresse opérationnelle)',
      description: "Rue des Creusets 53, 1950 Sion, Suisse",
      action: "https://maps.google.com/?q=Rue+des+Creusets+53+1950+Sion+Switzerland"
    },
    {
      icon: MessageCircle,
      title: t('contact_chat'),
      content: t('contact_chat_desc'),
      description: t('contact_chat_availability'),
      action: null
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton title={t('contact')} subtitle={t('contact_subtitle')} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Hero Section */}
          <Card className="mb-8 bg-gradient-primary text-white border-0">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h1 className="text-3xl font-bold mb-4">
                {t('contact_team')}
              </h1>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                {t('contact_hero_text')}
              </p>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t('contact_form_title')}</CardTitle>
                  <CardDescription>
                    {t('contact_form_subtitle')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t('contact_form_name')} *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder={t('contact_form_name_placeholder')}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t('contact_form_email')} *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder={t('contact_form_email_placeholder')}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="subject">{t('contact_form_subject')} *</Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => handleInputChange('subject', e.target.value)}
                          placeholder={t('contact_form_subject_placeholder')}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority">{t('contact_form_priority')}</Label>
                        <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">{t('contact_priority_low')}</SelectItem>
                            <SelectItem value="normal">{t('contact_priority_normal')}</SelectItem>
                            <SelectItem value="high">{t('contact_priority_high')}</SelectItem>
                            <SelectItem value="urgent">{t('contact_priority_urgent')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">{t('contact_form_message')} *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder={t('contact_form_message_placeholder')}
                        rows={6}
                        required
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                          {t('contact_form_sending')}
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          {t('contact_form_send')}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <info.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{info.title}</h3>
                        <p className="text-foreground font-medium">{info.content}</p>
                        <p className="text-sm text-muted-foreground">{info.description}</p>
                        {info.action && (
                          <Button 
                            variant="link" 
                            className="p-0 h-auto mt-2" 
                            asChild
                          >
                            <a href={info.action} target={info.action.startsWith('http') ? "_blank" : undefined} rel="noopener noreferrer">{t('contact_action')}</a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {t('contact_hours_title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('contact_hours_weekdays')}</span>
                    <span className="font-medium">9h00 - 18h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('contact_hours_saturday')}</span>
                    <span className="font-medium">10h00 - 16h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('contact_hours_sunday')}</span>
                    <span className="font-medium">{t('contact_hours_closed')}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-muted-foreground">{t('contact_chat_247')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactPage;
