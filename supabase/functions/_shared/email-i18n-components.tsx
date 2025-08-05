import React from 'npm:react@18.3.1';

// Translations object for emails
const translations = {
  fr: {
    welcome: {
      subject: "🎮 Bienvenue dans l'aventure CIARA !",
      title: "Bienvenue dans l'aventure CIARA, {userName} !",
      description: "Nous sommes ravis de vous accueillir sur CIARA, votre compagnon intelligent pour découvrir des destinations extraordinaires de manière ludique et interactive.",
      features_title: "🎮 Avec CIARA, vous pouvez :",
      feature_1: "🗺️ Découvrir des parcours gamifiés uniques dans des villes authentiques",
      feature_2: "🏆 Gagner des points et débloquer des récompenses exclusives",
      feature_3: "🤖 Explorer des destinations avec l'aide de notre IA spécialisée",
      feature_4: "🎁 Profiter d'avantages chez nos partenaires locaux",
      feature_5: "📱 Vivre une expérience mobile immersive et interactive",
      cta_button: "🚀 Commencer l'aventure maintenant",
      next_steps_title: "🌟 Prochaines étapes",
      step_1: "Connectez-vous à votre compte CIARA",
      step_2: "Choisissez votre première destination",
      step_3: "Configurez vos préférences de voyage",
      step_4: "Découvrez votre premier parcours gamifié !",
      bonus: "Nous vous souhaitons une excellente découverte !",
      disclaimer: "Si vous n'avez pas créé ce compte, vous pouvez ignorer cet email en toute sécurité.",
      tip: "💡 Astuce : Ajoutez info@ciara.city à vos contacts pour ne manquer aucune de nos communications importantes."
    },
      common: {
        greeting: "Bonjour {name},",
        footer_text: "L'équipe CIARA",
        footer_subtext: "Votre plateforme de tourisme intelligent",
        tagline: "Votre compagnon de voyage intelligent"
      }
  },
  en: {
    welcome: {
      subject: "🎮 Welcome to the CIARA adventure!",
      title: "Welcome to the CIARA adventure, {userName}!",
      description: "We are delighted to welcome you to CIARA, your intelligent companion for discovering extraordinary destinations in a fun and interactive way.",
      features_title: "🎮 With CIARA, you can:",
      feature_1: "🗺️ Discover unique gamified routes in authentic cities",
      feature_2: "🏆 Earn points and unlock exclusive rewards",
      feature_3: "🤖 Explore destinations with the help of our specialized AI",
      feature_4: "🎁 Enjoy benefits from our local partners",
      feature_5: "📱 Experience immersive and interactive mobile adventures",
      cta_button: "🚀 Start the adventure now",
      next_steps_title: "🌟 Next steps",
      step_1: "Log in to your CIARA account",
      step_2: "Choose your first destination",
      step_3: "Configure your travel preferences",
      step_4: "Discover your first gamified route!",
      bonus: "We wish you an excellent discovery!",
      disclaimer: "If you didn't create this account, you can safely ignore this email.",
      tip: "💡 Tip: Add info@ciara.city to your contacts to never miss our important communications."
    },
      common: {
        greeting: "Hello {name},",
        footer_text: "The CIARA Team",
        footer_subtext: "Your intelligent tourism platform",
        tagline: "Your intelligent travel companion"
      }
  }
};

// Translation helper function
export const t = (key: string, lang: 'fr' | 'en' = 'fr', replacements: Record<string, string> = {}): string => {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  if (typeof value !== 'string') {
    return key; // Fallback to key if translation not found
  }
  
  // Replace placeholders
  let result = value;
  for (const [placeholder, replacement] of Object.entries(replacements)) {
    result = result.replace(new RegExp(`{${placeholder}}`, 'g'), replacement);
  }
  
  return result;
};

// Enhanced Base Email with i18n support
export interface BaseEmailProps {
  children: React.ReactNode;
  previewText?: string;
  lang?: 'fr' | 'en';
}

export const BaseEmailI18n: React.FC<BaseEmailProps> = ({ children, previewText, lang = 'fr' }) => 
  React.createElement('html', {},
    React.createElement('head', {},
      React.createElement('meta', { charSet: "UTF-8" }),
      React.createElement('meta', { name: "viewport", content: "width=device-width, initial-scale=1.0" })
    ),
    React.createElement('body', { style: styles.body },
      previewText && React.createElement('div', { style: styles.preview }, previewText),
      
      // Header with CIARA branding
      React.createElement('div', { style: styles.header },
        React.createElement('div', { style: styles.headerContent },
          React.createElement('h1', { style: styles.logo }, "CIARA"),
          React.createElement('p', { style: styles.tagline }, t('common.tagline', lang))
        )
      ),
      
      // Main content
      React.createElement('div', { style: styles.container },
        React.createElement('div', { style: styles.content }, children)
      ),
      
      // Footer
      React.createElement('div', { style: styles.footer },
        React.createElement('div', { style: styles.footerContent },
          React.createElement('p', { style: styles.footerText }, t('common.footer_text', lang)),
          React.createElement('p', { style: styles.footerSubtext }, t('common.footer_subtext', lang)),
          React.createElement('div', { style: styles.footerLinks },
            React.createElement('a', { href: "https://ciara.city", style: styles.footerLink }, "ciara.city"),
            React.createElement('span', { style: styles.footerSeparator }, "•"),
            React.createElement('a', { href: "mailto:info@ciara.city", style: styles.footerLink }, "Contact")
          )
        )
      )
    )
  );

// Rest of the original components with i18n support
export interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const EmailButton: React.FC<EmailButtonProps> = ({ 
  href, 
  children, 
  variant = 'primary' 
}) => React.createElement('a', {
  href,
  style: variant === 'primary' ? styles.primaryButton : styles.secondaryButton
}, children);

export interface EmailCardProps {
  children: React.ReactNode;
  title?: string;
}

export const EmailCard: React.FC<EmailCardProps> = ({ children, title }) => 
  React.createElement('div', { style: styles.card },
    title && React.createElement('h3', { style: styles.cardTitle }, title),
    React.createElement('div', { style: styles.cardContent }, children)
  );

// Enhanced styles with better spacing and colors
const styles = {
  body: {
    margin: '0',
    padding: '0',
    backgroundColor: '#fef7ed',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
  },
  preview: {
    display: 'none',
    overflow: 'hidden',
    lineHeight: '1px',
    opacity: '0',
    maxHeight: '0',
    maxWidth: '0',
  },
  header: {
    background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
    padding: '30px 20px',
    textAlign: 'center' as const,
  },
  headerContent: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  logo: {
    margin: '0',
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: '2px',
  },
  tagline: {
    margin: '8px 0 0 0',
    fontSize: '16px',
    color: '#ffffff',
    opacity: '0.9',
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
  },
  content: {
    padding: '40px 30px',
  },
  card: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '24px',
    margin: '20px 0',
  },
  cardTitle: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
  },
  cardContent: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#475569',
  },
  primaryButton: {
    display: 'inline-block',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '16px',
    textAlign: 'center' as const,
    margin: '16px 0',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4)',
  },
  secondaryButton: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: 'transparent',
    color: '#f97316',
    textDecoration: 'none',
    border: '2px solid #f97316',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '16px',
    textAlign: 'center' as const,
    margin: '16px 0',
    transition: 'all 0.3s ease',
  },
  footer: {
    backgroundColor: '#1e293b',
    padding: '30px 20px',
    textAlign: 'center' as const,
  },
  footerContent: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  footerText: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
  },
  footerSubtext: {
    margin: '0 0 16px 0',
    fontSize: '14px',
    color: '#94a3b8',
    lineHeight: '1.5',
  },
  footerLinks: {
    margin: '16px 0 0 0',
  },
  footerLink: {
    color: '#f97316',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.3s ease',
  },
  footerSeparator: {
    color: '#64748b',
    margin: '0 12px',
  },
  h1: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1e293b',
    margin: '0 0 24px 0',
    lineHeight: '1.2',
  },
  h2: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#334155',
    margin: '24px 0 16px 0',
    lineHeight: '1.3',
  },
  h3: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#475569',
    margin: '20px 0 12px 0',
    lineHeight: '1.4',
  },
  p: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#475569',
    margin: '0 0 16px 0',
  },
  strong: {
    fontWeight: '600',
    color: '#1e293b',
  },
  highlight: {
    backgroundColor: '#fef3c7',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: '600',
  },
  success: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: '600',
  },
  warning: {
    backgroundColor: '#fef3c7',
    color: '#a16207',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: '600',
  },
  error: {
    backgroundColor: '#fecaca',
    color: '#dc2626',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: '600',
  },
};

export { styles, translations };
