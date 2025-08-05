import React from 'react';
import { Building2, Mountain, MapPin } from 'lucide-react';

interface CityImagePlaceholderProps {
  cityName: string;
  className?: string;
}

const CityImagePlaceholder: React.FC<CityImagePlaceholderProps> = ({ 
  cityName, 
  className = "w-full h-full" 
}) => {
  // Déterminer l'icône basée sur le nom de la ville
  const getIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('mont') || lowerName.includes('mountain') || lowerName.includes('alpine')) {
      return <Mountain className="h-12 w-12 text-white/70" />;
    }
    
    if (lowerName.includes('lake') || lowerName.includes('lac') || lowerName.includes('water')) {
      return <Building2 className="h-12 w-12 text-white/70" />;
    }
    
    return <MapPin className="h-12 w-12 text-white/70" />;
  };

  // Générer un gradient basé sur le nom de la ville
  const getGradient = (name: string) => {
    const gradients = [
      'bg-gradient-to-br from-blue-500 to-blue-700',
      'bg-gradient-to-br from-purple-500 to-purple-700',
      'bg-gradient-to-br from-green-500 to-green-700',
      'bg-gradient-to-br from-orange-500 to-orange-700',
      'bg-gradient-to-br from-red-500 to-red-700',
      'bg-gradient-to-br from-indigo-500 to-indigo-700',
      'bg-gradient-to-br from-pink-500 to-pink-700',
      'bg-gradient-to-br from-teal-500 to-teal-700',
      'bg-gradient-to-br from-cyan-500 to-cyan-700',
      'bg-gradient-to-br from-emerald-500 to-emerald-700',
    ];
    
    // Utiliser le hash du nom pour sélectionner un gradient cohérent
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return gradients[Math.abs(hash) % gradients.length];
  };

  return (
    <div className={`${className} ${getGradient(cityName)} flex items-center justify-center relative overflow-hidden`}>
      {/* Motif de fond */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-white/5 transform rotate-45 scale-150"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-white/5 transform -rotate-45 scale-150"></div>
      </div>
      
      {/* Contenu principal */}
      <div className="relative z-10 text-center">
        {getIcon(cityName)}
        <div className="mt-2 text-white/90 font-medium text-sm">
          {cityName}
        </div>
      </div>
      
      {/* Overlay subtil */}
      <div className="absolute inset-0 bg-black/10"></div>
    </div>
  );
};

export default CityImagePlaceholder; 