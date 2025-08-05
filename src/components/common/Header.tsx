
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mountain, ArrowLeft, Menu } from 'lucide-react';
import UserMenu from '@/components/navigation/UserMenu';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSimplifiedTranslations } from '@/hooks/useSimplifiedTranslations';
import { translations } from '@/utils/translations';
import SimpleMobileNav from '@/components/navigation/SimpleMobileNav';
import NotificationCenter from '@/components/layout/NotificationCenter';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

interface HeaderProps {
  showBackButton?: boolean;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'transparent';
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  showBackButton = false, 
  title,
  subtitle,
  variant = 'default',
  className = '' 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const { currentLanguage } = useSimplifiedTranslations();

  // Fallback translation function using static translations
  const tFallback = (key: string): string => {
    const translation = translations[key as keyof typeof translations];
    if (translation && typeof translation === 'object') {
      return (translation as any)[currentLanguage] || (translation as any).fr || key;
    }
    return key;
  };

  // Use fallback if primary translation returns the key
  const translate = (key: string): string => {
    const primaryTranslation = t(key);
    return primaryTranslation === key ? tFallback(key) : primaryTranslation;
  };

  const handleBackClick = () => {
    const currentPath = location.pathname;
    
    // Si on est sur une page de détail de parcours, retourner vers la page destination
    if (currentPath.includes('/journey/')) {
      const pathSegments = currentPath.split('/');
      const cityIndex = pathSegments.findIndex(segment => segment === 'destinations');
      if (cityIndex !== -1 && pathSegments[cityIndex + 1]) {
        const citySlug = pathSegments[cityIndex + 1];
        navigate(`/destinations/${citySlug}`);
        return;
      }
    }
    
    // Si on est sur une page de destination, retourner vers l'accueil
    if (currentPath.startsWith('/destinations/') && !currentPath.includes('/journey/')) {
      navigate('/');
      return;
    }
    
    // Par défaut, utiliser navigate(-1) ou retourner à l'accueil si pas d'historique
    try {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/');
      }
    } catch {
      navigate('/');
    }
  };

  const isTransparent = variant === 'transparent';
  const baseClass = isTransparent 
    ? 'absolute top-0 left-0 right-0 z-10 bg-transparent'
    : 'border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50';

  return (
    <nav className={`${baseClass} ${className} w-full`}>
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
        {/* Mobile layout avec titre */}
        {isMobile && title ? (
          <div className="space-y-2">
            {/* Première ligne : bouton retour + CIARA + contrôles */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {showBackButton && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBackClick}
                    className={`${isTransparent ? 'text-white hover:bg-white/20' : 'hover:bg-muted'} cursor-pointer`}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <Link 
                  to="/" 
                  className={`flex items-center gap-2 font-bold text-xl clickable ${
                    isTransparent ? 'text-white' : 'text-foreground'
                  }`}
                >
                  <Mountain className="h-5 w-5" />
                  <span>CIARA</span>
                </Link>
              </div>
              
              <div className="flex items-center gap-1">
                <SimpleMobileNav variant={variant} />
                <LanguageSelector variant={isTransparent ? 'transparent' : 'default'} />
                <NotificationCenter />
                <UserMenu variant={isTransparent ? 'transparent' : 'default'} />
              </div>
            </div>
            
            {/* Deuxième ligne : titre */}
            <div className="text-center">
              <h1 className={`text-lg font-semibold leading-tight ${
                isTransparent ? 'text-white' : 'text-foreground'
              }`}>
                {title}
              </h1>
              {subtitle && (
                <p className={`text-sm leading-tight mt-1 ${
                  isTransparent ? 'text-white/80' : 'text-muted-foreground'
                }`}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Layout par défaut (desktop ou mobile sans titre) */
          <div className="flex items-center justify-between flex-wrap">
            <div className="flex items-center gap-2 sm:gap-4 flex-grow flex-shrink-0">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackClick}
                  className={`${isTransparent ? 'text-white hover:bg-white/20' : 'hover:bg-muted'} cursor-pointer`}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <Link 
                to="/" 
                className={`flex items-center gap-2 font-bold text-xl clickable ${
                  isTransparent ? 'text-white' : 'text-foreground'
                }`}
              >
                <Mountain className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="hidden xs:inline">CIARA</span>
              </Link>
              {title && !isMobile && (
                <div className="ml-2 sm:ml-4 truncate max-w-[150px] sm:max-w-none">
                  <h1 className={`text-base sm:text-lg font-semibold truncate ${
                    isTransparent ? 'text-white' : 'text-foreground'
                  }`}>
                    {title}
                  </h1>
                  {subtitle && (
                    <p className={`text-xs sm:text-sm truncate ${
                      isTransparent ? 'text-white/80' : 'text-muted-foreground'
                    }`}>
                      {subtitle}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {/* Navigation Menu - Desktop Only */}
            {!isMobile && !title && (
              <NavigationMenu className="hidden md:flex mr-8">
                <NavigationMenuList className="gap-6">
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link 
                        to="/cities" 
                        className={`text-sm font-medium link-hover ${
                          isTransparent ? 'text-white hover:text-white/80' : 'text-muted-foreground'
                        }`}
                      >
                        {translate('our_cities')}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link 
                        to="/blog" 
                        className={`text-sm font-medium transition-colors hover:text-primary ${
                          isTransparent ? 'text-white hover:text-white/80' : 'text-muted-foreground'
                        }`}
                      >
                        Blog
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            )}
            
            <div className="flex items-center gap-1 sm:gap-2">
              {isMobile && !title && <SimpleMobileNav variant={variant} />}
              <LanguageSelector variant={isTransparent ? 'transparent' : 'default'} />
              <NotificationCenter />
              <UserMenu variant={isTransparent ? 'transparent' : 'default'} />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
