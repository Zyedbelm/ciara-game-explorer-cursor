
import React from 'react';
import { 
  Building,
  Utensils, 
  Mountain,
  Camera,
  MapPin
} from 'lucide-react';

interface CategoryIconProps {
  category?: {
    icon?: string | null;
    color?: string | null;
    name: string;
  } | null;
  size?: number;
  className?: string;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  category, 
  size = 20, 
  className = "" 
}) => {
  // Mapping des icônes standardisées
  const getIconComponent = () => {
    if (!category) return MapPin;
    
    const iconName = category.icon?.toLowerCase();
    
    // Mapping des icônes standardisées
    const iconMap: Record<string, React.ComponentType> = {
      'building': Building,
      'utensils': Utensils,
      'mountain': Mountain,
      'camera': Camera,
    };

    return iconMap[iconName || 'building'] || Building;
  };

  const IconComponent = getIconComponent();
  const iconColor = category?.color || 'currentColor';

  return (
    <IconComponent 
      size={size} 
      className={className}
      style={{ color: iconColor }}
    />
  );
};

export default CategoryIcon;
