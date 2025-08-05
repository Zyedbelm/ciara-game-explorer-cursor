
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Building, Utensils, Mountain, Camera } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface JourneyCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  type: string | null;
}

interface CategoryFilterProps {
  categories: JourneyCategory[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  totalJourneys: number;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  categories, 
  selectedCategory, 
  onCategorySelect, 
  totalJourneys 
}) => {
  const { t } = useLanguage();
  
  const getCategoryIcon = (category: JourneyCategory) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'building': <Building className="h-5 w-5" />,
      'utensils': <Utensils className="h-5 w-5" />,
      'mountain': <Mountain className="h-5 w-5" />,
      'camera': <Camera className="h-5 w-5" />,
    };
    
    return iconMap[category.icon || 'building'] || <Building className="h-5 w-5" />;
  };

  const getCategoryStyle = (category: JourneyCategory) => {
    // Utiliser la couleur de la base de données ou des couleurs par défaut
    const color = category.color || '#7C3AED';
    
    return {
      borderColor: color,
      backgroundColor: `${color}10`, // Transparence 10%
      iconColor: color,
    };
  };

  return (
    <Card className="bg-gradient-to-r from-background via-muted/20 to-background border-border/50">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-3 text-foreground">
          {t('journey_types')}
        </h2>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {/* Bouton "Tous" */}
          <button
            onClick={() => onCategorySelect(null)}
            className={`group relative px-4 py-2 rounded-lg border-2 transition-all duration-200 text-center flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
              selectedCategory === null 
                ? 'border-primary bg-primary/10 text-primary shadow-sm' 
                : 'border-border/50 bg-background hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-primary'
            }`}
          >
            <Star className="h-4 w-4" />
            <span className="font-medium text-sm hidden sm:inline">{t('all')}</span>
            <Badge variant="secondary" className="text-xs ml-1 hidden sm:inline">
              {totalJourneys}
            </Badge>
          </button>
          
          {/* Boutons catégories */}
          {categories.map((category) => {
            const style = getCategoryStyle(category);
            const isSelected = selectedCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => onCategorySelect(category.id)}
                className={`group relative px-4 py-2 rounded-lg border-2 transition-all duration-200 text-center flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
                  isSelected 
                    ? 'shadow-sm' 
                    : 'hover:shadow-sm'
                }`}
                style={{
                  borderColor: isSelected ? style.borderColor : '#e5e7eb',
                  backgroundColor: isSelected ? style.backgroundColor : 'transparent',
                  color: isSelected ? style.iconColor : '#6b7280'
                }}
              >
                <div 
                  className="transition-all duration-200"
                  style={{ color: isSelected ? style.iconColor : '#6b7280' }}
                >
                  {getCategoryIcon(category)}
                </div>
                <span className="font-medium text-sm hidden sm:inline">{category.name}</span>
              </button>
            );
          })}
        </div>
        
        {/* Affichage du titre de la catégorie sélectionnée sur mobile */}
        <div className="sm:hidden mt-3">
          {selectedCategory === null ? (
            <p className="text-center text-sm font-medium text-primary">
              {t('all')} ({totalJourneys})
            </p>
          ) : (
            <p className="text-center text-sm font-medium text-foreground">
              {categories.find(c => c.id === selectedCategory)?.name}
            </p>
          )}
        </div>
        
        {/* Description de la catégorie sélectionnée */}
        {selectedCategory && categories.find(c => c.id === selectedCategory)?.description && (
          <div className="mt-3 p-2 bg-muted/30 rounded-md hidden sm:block">
            <p className="text-xs text-muted-foreground">
              {categories.find(c => c.id === selectedCategory)?.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryFilter;
