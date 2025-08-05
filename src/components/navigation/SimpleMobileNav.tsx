
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import {
  Menu,
  MapPin,
  BookOpen
} from 'lucide-react';

interface SimpleMobileNavProps {
  variant?: 'default' | 'transparent';
}

const SimpleMobileNav: React.FC<SimpleMobileNavProps> = ({ 
  variant = 'default' 
}) => {
  const { t } = useLanguage();
  const isTransparent = variant === 'transparent';

  // Get proper translations, falling back to static text if translation key is returned
  const getTranslation = (key: string, fallback: string) => {
    const translation = t(key);
    return translation === key ? fallback : translation;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className={isTransparent ? 'text-white hover:bg-white/10' : ''}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link to="/cities" className="flex items-center">
            <MapPin className="mr-2 h-4 w-4" />
            <span>{getTranslation('our_cities', 'Nos villes')}</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/blog" className="flex items-center">
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Blog</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SimpleMobileNav;
