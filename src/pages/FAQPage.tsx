import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { HelpCircle, MessageCircle, Book, Map } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const FAQPage = () => {
  const { t } = useLanguage();
  
  const faqs = [
    {
      category: t('faq_category_usage'),
      icon: Map,
      questions: [
        {
          question: t('faq_usage_q1'),
          answer: t('faq_usage_a1')
        },
        {
          question: t('faq_usage_q2'),
          answer: t('faq_usage_a2')
        },
        {
          question: t('faq_usage_q3'),
          answer: t('faq_usage_a3')
        }
      ]
    },
    {
      category: t('faq_category_rewards'),
      icon: HelpCircle,
      questions: [
        {
          question: t('faq_rewards_q1'),
          answer: t('faq_rewards_a1')
        },
        {
          question: t('faq_rewards_q2'),
          answer: t('faq_rewards_a2')
        },
        {
          question: t('faq_rewards_q3'),
          answer: t('faq_rewards_a3')
        }
      ]
    },
    {
      category: t('faq_category_technical'),
      icon: Book,
      questions: [
        {
          question: t('faq_technical_q1'),
          answer: t('faq_technical_a1')
        },
        {
          question: t('faq_technical_q2'),
          answer: t('faq_technical_a2')
        },
        {
          question: t('faq_technical_q3'),
          answer: t('faq_technical_a3')
        }
      ]
    },
    {
      category: t('faq_category_ai'),
      icon: MessageCircle,
      questions: [
        {
          question: t('faq_ai_q1'),
          answer: t('faq_ai_a1')
        },
        {
          question: t('faq_ai_q2'),
          answer: t('faq_ai_a2')
        },
        {
          question: t('faq_ai_q3'),
          answer: t('faq_ai_a3')
        },
        {
          question: t('faq_ai_q4'),
          answer: t('faq_ai_a4')
        },
        {
          question: t('faq_ai_q5'),
          answer: t('faq_ai_a5')
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton title={t('faq')} subtitle={t('faq_subtitle_new')} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <Card className="mb-8">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">{t('faq')}</CardTitle>
              <CardDescription className="text-lg">
                {t('faq_subtitle_new')}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* FAQ Categories */}
          <div className="space-y-8">
            {faqs.map((category, categoryIndex) => (
              <Card key={categoryIndex}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <category.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{category.category}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem 
                        key={faqIndex} 
                        value={`${categoryIndex}-${faqIndex}`}
                        className="border-b"
                      >
                        <AccordionTrigger className="text-left hover:no-underline">
                          <span className="font-medium">{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Section */}
          <Card className="mt-8">
            <CardHeader className="text-center">
              <CardTitle>{t('faq_no_answer')}</CardTitle>
              <CardDescription>
                {t('faq_contact_us')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex justify-center gap-4">
                <a 
                  href="mailto:info@ciara.city" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t('contact_us')}
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FAQPage;