
import React from 'react';
import { Card } from '@/components/ui/card';

interface ClientLogo {
  id: string;
  name: string;
  name_en?: string;
  name_de?: string;
  logo_url: string;
  website_url?: string;
  description?: string;
  description_en?: string;
  description_de?: string;
  category: string;
}

interface ClientLogosGridProps {
  logos: ClientLogo[];
  language: string;
}

export const ClientLogosGrid: React.FC<ClientLogosGridProps> = ({ 
  logos, 
  language 
}) => {
  const getLocalizedText = (base: string, en?: string, de?: string) => {
    switch (language) {
      case 'en': return en || base;
      case 'de': return de || base;
      default: return base;
    }
  };

  const groupedLogos = logos.reduce((acc, logo) => {
    const category = logo.category || 'partner';
    if (!acc[category]) acc[category] = [];
    acc[category].push(logo);
    return acc;
  }, {} as Record<string, ClientLogo[]>);

  return (
    <div className="space-y-12">
      {Object.entries(groupedLogos).map(([category, categoryLogos]) => (
        <div key={category}>
          {Object.keys(groupedLogos).length > 1 && (
            <h4 className="text-lg font-medium text-center mb-8 text-muted-foreground capitalize">
              {category}s
            </h4>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categoryLogos.map((logo) => {
              const name = getLocalizedText(logo.name, logo.name_en, logo.name_de);
              const description = logo.description ? getLocalizedText(logo.description, logo.description_en, logo.description_de) : undefined;

              const LogoContent = (
                <Card className="overflow-hidden border border-border/50 transition-all duration-300 hover:scale-105 hover:shadow-lg group aspect-[3/2] relative">
                  <img 
                    src={logo.logo_url}
                    alt={name}
                    className="w-full h-full object-cover filter grayscale transition-all duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
                    <div className="text-sm font-medium text-white truncate">
                      {name}
                    </div>
                    {description && (
                      <div className="text-xs text-white/80 mt-1 truncate">
                        {description}
                      </div>
                    )}
                  </div>
                </Card>
              );

              if (logo.website_url) {
                return (
                  <a
                    key={logo.id}
                    href={logo.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    {LogoContent}
                  </a>
                );
              }

              return (
                <div key={logo.id}>
                  {LogoContent}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
