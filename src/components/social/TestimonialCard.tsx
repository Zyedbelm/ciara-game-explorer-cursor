import React from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

interface TestimonialCardProps {
  testimonial: Testimonial;
  language: string;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({ 
  testimonial, 
  language 
}) => {
  const getLocalizedText = (base: string, en?: string, de?: string) => {
    switch (language) {
      case 'en': return en || base;
      case 'de': return de || base;
      default: return base;
    }
  };

  const name = getLocalizedText(testimonial.name, testimonial.name_en, testimonial.name_de);
  const title = getLocalizedText(testimonial.title, testimonial.title_en, testimonial.title_de);
  const content = getLocalizedText(testimonial.content, testimonial.content_en, testimonial.content_de);
  const company = testimonial.company ? getLocalizedText(testimonial.company, testimonial.company_en, testimonial.company_de) : undefined;

  return (
    <Card className={`h-full bg-card/50 backdrop-blur-sm border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
      testimonial.featured ? 'border-primary/50 ring-2 ring-primary/20' : 'border-border/50'
    }`}>
      <CardContent className="p-6">
        {/* Rating Stars */}
        <div className="flex items-center mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${
                i < testimonial.rating 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-muted-foreground/30'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <blockquote className="text-muted-foreground mb-6 leading-relaxed italic">
          "{content}"
        </blockquote>

        {/* Author Info */}
        <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12">
            <AvatarImage 
              src={testimonial.avatar_url} 
              alt={name}
            />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <div className="font-semibold text-foreground">{name}</div>
            <div className="text-sm text-muted-foreground">
              {title}
              {company && (
                <>
                  <span className="mx-1">•</span>
                  <span className="text-primary">{company}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Featured Badge */}
        {testimonial.featured && (
          <div className="absolute top-3 right-3">
            <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
              ⭐ Featured
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};