
import React from 'react';
import { TestimonialCard } from './TestimonialCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Testimonial {
  id: string;
  name: string;
  name_en?: string;
  name_de?: string;
  title: string;
  title_en?: string;
  title_de?: string;
  content: string;
  content_en?: string;
  content_de?: string;
  company?: string;
  company_en?: string;
  company_de?: string;
  avatar_url?: string;
  rating: number;
  featured: boolean;
}


export const SocialProofSection: React.FC = () => {
  const { t, currentLanguage } = useLanguage();

  // Helper function to get text with fallback
  const getTextWithFallback = (key: string, fallback: string) => {
    const translated = t(key);
    // If translation returns the key itself (no translation found), use fallback
    return translated === key ? fallback : translated;
  };

  const { data: testimonials = [], isLoading: testimonialsLoading, error: testimonialsError } = useQuery({
    queryKey: ['testimonials', currentLanguage],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Testimonial[];
    }
  });


  // Handle errors
  if (testimonialsError) {
    console.error('Social proof data loading error:', testimonialsError);
    return null; // Gracefully fail without breaking the page
  }

  if (testimonialsLoading) {
    return (
      <section className="py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-variant bg-clip-text text-transparent">
            {getTextWithFallback('social_proof.title', 'Ils nous font confiance')}
          </h2>
          {testimonials.length > 0 && (
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {getTextWithFallback('social_proof.testimonials_subtitle', 'Découvrez ce que nos utilisateurs pensent de CIARA')}
            </p>
          )}
        </div>

        {/* Testimonials Section */}
        {testimonials.length > 0 && (
          <div className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <TestimonialCard 
                  key={testimonial.id} 
                  testimonial={testimonial}
                  language={currentLanguage}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
