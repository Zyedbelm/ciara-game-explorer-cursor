
import React from 'react';
import { Link } from 'react-router-dom';
import { Mountain, Mail } from 'lucide-react';
import { useSimplifiedTranslations } from '@/hooks/useSimplifiedTranslations';
import { useIsMobile } from '@/hooks/use-mobile';
import { translations } from '@/utils/translations';

const Footer: React.FC = () => {
  const { currentLanguage } = useSimplifiedTranslations();
  const isMobile = useIsMobile();

  // Simple translation function using static translations
  const t = (key: string): string => {
    const translation = translations[key as keyof typeof translations];
    if (translation && typeof translation === 'object') {
      return (translation as any)[currentLanguage] || (translation as any).fr || key;
    }
    return key;
  };

  return (
    <footer className="bg-foreground text-white py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
          {/* Company Info */}
          <div className="space-y-3 sm:space-y-4 col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <Mountain className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="font-bold text-lg sm:text-xl">CIARA</span>
            </div>
            <p className="text-white/70 text-xs sm:text-sm">
              {t('footer_company_description')}
            </p>
            <div className="flex space-x-4">
              <a href="mailto:info@ciara.city" className="text-white/60 hover:text-white transition-colors" aria-label="Email">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-base sm:text-lg">{t('footer_quick_links')}</h3>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <Link to="/cities" className="block text-white/70 hover:text-white transition-colors">
                {t('our_cities')}
              </Link>
              <Link to="/rewards" className="block text-white/70 hover:text-white transition-colors">
                {t('rewards')}
              </Link>
              <Link to="/my-journeys" className="block text-white/70 hover:text-white transition-colors">
                {t('my_journeys')}
              </Link>
              <Link to="/profile" className="block text-white/70 hover:text-white transition-colors">
                {t('profile')}
              </Link>
            </div>
          </div>

          {/* Explore */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-base sm:text-lg">{t('footer_explore')}</h3>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <Link to="/about" className="block text-white/70 hover:text-white transition-colors">
                {t('about_us')}
              </Link>
              <Link to="/blog" className="block text-white/70 hover:text-white transition-colors">
                {t('blog')}
              </Link>
              <Link to="/pricing" className="block text-white/70 hover:text-white transition-colors">
                {t('pricing')}
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-base sm:text-lg">{t('footer_support')}</h3>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <Link to="/faq" className="block text-white/70 hover:text-white transition-colors">
                {t('faq')}
              </Link>
              <Link to="/contact" className="block text-white/70 hover:text-white transition-colors">
                {t('contact_us')}
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-base sm:text-lg">{t('footer_legal')}</h3>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <Link to="/privacy" className="block text-white/70 hover:text-white transition-colors">
                {t('privacy')}
              </Link>
              <Link to="/terms" className="block text-white/70 hover:text-white transition-colors">
                {t('terms')}
              </Link>
              <Link to="/cookies" className="block text-white/70 hover:text-white transition-colors">
                {t('cookies')}
              </Link>
              <Link to="/legal" className="block text-white/70 hover:text-white transition-colors">
                {t('legal')}
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-6 pt-6 sm:mt-8 sm:pt-8 text-center">
          <p className="text-white/60 text-xs sm:text-sm">
            © {new Date().getFullYear()} CIARA. {t('footer_rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
