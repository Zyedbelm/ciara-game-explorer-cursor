import React from 'npm:react@18.3.1';

// =============================================================================
// UNIFIED EMAIL SYSTEM - PHASE 1 IMPLEMENTATION
// =============================================================================
// This file consolidates all email templates and components into a unified system
// with internationalization, standardized error handling, and consistent branding.

// Enhanced translations with all email types
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
      bonus: "🎁 Bonus de bienvenue : Recevez 50 points offerts pour bien commencer votre aventure !",
      disclaimer: "Si vous n'avez pas créé ce compte, vous pouvez ignorer cet email en toute sécurité.",
      tip: "💡 Astuce : Ajoutez info@ciara.city à vos contacts pour ne manquer aucune de nos communications importantes."
    },
    journey_completion: {
      subject: "🏆 Parcours terminé ! Félicitations {userName}",
      title: "🎉 Félicitations ! Vous avez terminé votre parcours",
      description: "Bravo {userName} ! Vous venez de terminer le parcours '{journeyName}' avec brio.",
      points_earned: "Points gagnés : {pointsEarned}",
      total_points: "Total de vos points : {totalPoints}",
      level_up: "🎊 Nouveau niveau atteint : Niveau {newLevel} !",
      rewards_cta: "Découvrir mes récompenses",
      next_journey: "Prêt pour votre prochaine aventure ?"
    },
    inactive_reminder: {
      subject: "🗺️ Votre aventure CIARA vous attend !",
      title: "Nous vous avons manqué, {userName} !",
      description: "Cela fait {daysSinceLastActivity} jours que vous n'avez pas exploré avec CIARA. Vos parcours vous attendent !",
      incomplete_title: "Parcours en cours :",
      continue_cta: "Continuer l'aventure",
      comeback_offer: "🎁 Offre de retour : Recevez 25 points bonus en reprenant un parcours !"
    },
    reward_notification: {
      subject: "🎁 Nouvelle récompense disponible !",
      title: "Une nouvelle récompense vous attend !",
      description: "Félicitations {userName} ! Une nouvelle récompense est maintenant disponible.",
      reward_details: "Récompense : {rewardName}",
      reward_description: "{rewardDescription}",
      reward_value: "Valeur : {rewardValue}",
      expiration: "Expire le : {expirationDate}",
      redeem_cta: "Échanger maintenant"
    },
    security_alert: {
      subject: "🔒 Alerte de sécurité - Compte CIARA",
      title: "Alerte de sécurité détectée",
      description: "Nous avons détecté une activité inhabituelle sur votre compte.",
      alert_type: "Type d'alerte : {alertType}",
      alert_message: "{alertMessage}",
      timestamp: "Heure : {timestamp}",
      location: "Localisation : {location}",
      device: "Appareil : {deviceInfo}",
      action_required: "Si ce n'était pas vous, contactez-nous immédiatement.",
      support_cta: "Contacter le support"
    },
    partner_welcome: {
      subject: "🤝 Bienvenue chez CIARA - Nouveau partenaire",
      title: "Bienvenue dans le réseau CIARA !",
      description: "Félicitations {partnerName} ! Vous êtes maintenant partenaire officiel CIARA à {cityName}.",
      benefits_title: "En tant que partenaire, vous bénéficiez de :",
      benefit_1: "🎯 Ciblage de visiteurs qualifiés",
      benefit_2: "📧 Notifications par email lors de l'utilisation de vos offres",
      benefit_3: "🎮 Intégration dans nos parcours gamifiés",
      benefit_4: "💰 Augmentation du trafic client",
      next_steps: "Vous recevrez une notification par email chaque fois qu'un client utilisera une de vos offres."
    },
    partner_offer: {
      subject: "📢 Nouvelle offre créée - {offerTitle}",
      title: "Votre nouvelle offre est active !",
      description: "Félicitations ! Votre offre '{offerTitle}' est maintenant disponible pour les utilisateurs CIARA.",
      offer_details: "Détails de l'offre :",
      offer_description: "{offerDescription}",
      points_required: "Points requis : {pointsRequired}",
      validity: "Validité : {validityDays} jours",
      max_redemptions: "Nombre maximum d'échanges : {maxRedemptions}",
      promotion_info: "Votre offre sera promue auprès des utilisateurs de {cityName}."
    },
    new_rewards: {
      subject: "🆕 Nouvelles récompenses à {cityName} !",
      title: "De nouvelles récompenses sont disponibles !",
      description: "Bonjour {userName} ! De nouvelles récompenses exclusives viennent d'arriver à {cityName}.",
      check_rewards: "Découvrir les nouvelles récompenses",
      points_status: "Vos points actuels : {userPoints}"
    },
    email_confirmation: {
      subject: "✅ Confirmez votre adresse email",
      title: "Confirmez votre adresse email",
      description: "Cliquez sur le bouton ci-dessous pour confirmer votre adresse email et activer votre compte CIARA.",
      confirm_cta: "Confirmer mon email",
      security_note: "Si vous n'avez pas demandé cette confirmation, ignorez cet email.",
      expire_note: "Ce lien expire dans 24 heures pour votre sécurité."
    },
    package_inquiry: {
      subject: "📋 Nouvelle demande d'information - Package {packageName}",
      title: "Nouvelle demande d'information reçue",
      description: "Une nouvelle demande d'information a été soumise pour le package {packageName}.",
      prospect_info: "Informations du prospect :",
      company: "Entreprise : {companyName}",
      contact: "Contact : {contactName}",
      email: "Email : {contactEmail}",
      phone: "Téléphone : {contactPhone}",
      city: "Ville : {cityName}",
      next_steps: "Notre équipe commerciale traitera cette demande dans les 24h."
    },
    common: {
      greeting: "Bonjour {name},",
      footer_text: "L'équipe CIARA",
      footer_subtext: "Votre plateforme de tourisme intelligent",
      tagline: "Votre compagnon de voyage intelligent",
      contact_info: "📧 info@ciara.city | 📞 +41 79 301 79 15",
      view_online: "Voir en ligne",
      unsubscribe: "Se désabonner",
      privacy_policy: "Politique de confidentialité",
      terms: "Conditions d'utilisation"
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
      bonus: "🎁 Welcome bonus: Receive 50 free points to start your adventure!",
      disclaimer: "If you didn't create this account, you can safely ignore this email.",
      tip: "💡 Tip: Add info@ciara.city to your contacts to never miss our important communications."
    },
    journey_completion: {
      subject: "🏆 Journey Complete! Congratulations {userName}",
      title: "🎉 Congratulations! You completed your journey",
      description: "Well done {userName}! You have successfully completed the '{journeyName}' journey.",
      points_earned: "Points earned: {pointsEarned}",
      total_points: "Your total points: {totalPoints}",
      level_up: "🎊 New level reached: Level {newLevel}!",
      rewards_cta: "View my rewards",
      next_journey: "Ready for your next adventure?"
    },
    inactive_reminder: {
      subject: "🗺️ Your CIARA adventure awaits!",
      title: "We missed you, {userName}!",
      description: "It's been {daysSinceLastActivity} days since you last explored with CIARA. Your journeys are waiting!",
      incomplete_title: "Journeys in progress:",
      continue_cta: "Continue the adventure",
      comeback_offer: "🎁 Comeback offer: Get 25 bonus points when you resume a journey!"
    },
    reward_notification: {
      subject: "🎁 New reward available!",
      title: "A new reward awaits you!",
      description: "Congratulations {userName}! A new reward is now available for you.",
      reward_details: "Reward: {rewardName}",
      reward_description: "{rewardDescription}",
      reward_value: "Value: {rewardValue}",
      expiration: "Expires: {expirationDate}",
      redeem_cta: "Redeem now"
    },
    security_alert: {
      subject: "🔒 Security Alert - CIARA Account",
      title: "Security alert detected",
      description: "We detected unusual activity on your account.",
      alert_type: "Alert type: {alertType}",
      alert_message: "{alertMessage}",
      timestamp: "Time: {timestamp}",
      location: "Location: {location}",
      device: "Device: {deviceInfo}",
      action_required: "If this wasn't you, please contact us immediately.",
      support_cta: "Contact support"
    },
    partner_welcome: {
      subject: "🤝 Welcome to CIARA - New Partner",
      title: "Welcome to the CIARA network!",
      description: "Congratulations {partnerName}! You are now an official CIARA partner in {cityName}.",
      benefits_title: "As a partner, you benefit from:",
      benefit_1: "🎯 Qualified visitor targeting",
      benefit_2: "📧 Email notifications when customers use your offers",
      benefit_3: "🎮 Integration in our gamified journeys",
      benefit_4: "💰 Increased customer traffic",
      next_steps: "You will receive email notifications each time a customer uses one of your offers."
    },
    partner_offer: {
      subject: "📢 New offer created - {offerTitle}",
      title: "Your new offer is active!",
      description: "Congratulations! Your offer '{offerTitle}' is now available for CIARA users.",
      offer_details: "Offer details:",
      offer_description: "{offerDescription}",
      points_required: "Points required: {pointsRequired}",
      validity: "Validity: {validityDays} days",
      max_redemptions: "Maximum redemptions: {maxRedemptions}",
      promotion_info: "Your offer will be promoted to users in {cityName}."
    },
    new_rewards: {
      subject: "🆕 New rewards in {cityName}!",
      title: "New rewards are available!",
      description: "Hello {userName}! New exclusive rewards have just arrived in {cityName}.",
      check_rewards: "Discover new rewards",
      points_status: "Your current points: {userPoints}"
    },
    email_confirmation: {
      subject: "✅ Confirm your email address",
      title: "Confirm your email address",
      description: "Click the button below to confirm your email address and activate your CIARA account.",
      confirm_cta: "Confirm my email",
      security_note: "If you didn't request this confirmation, ignore this email.",
      expire_note: "This link expires in 24 hours for your security."
    },
    package_inquiry: {
      subject: "📋 New inquiry - Package {packageName}",
      title: "New inquiry received",
      description: "A new inquiry has been submitted for the {packageName} package.",
      prospect_info: "Prospect information:",
      company: "Company: {companyName}",
      contact: "Contact: {contactName}",
      email: "Email: {contactEmail}",
      phone: "Phone: {contactPhone}",
      city: "City: {cityName}",
      next_steps: "Our sales team will process this inquiry within 24 hours."
    },
    common: {
      greeting: "Hello {name},",
      footer_text: "The CIARA Team",
      footer_subtext: "Your intelligent tourism platform",
      tagline: "Your intelligent travel companion",
      contact_info: "📧 info@ciara.city | 📞 +41 79 301 79 15",
      view_online: "View online",
      unsubscribe: "Unsubscribe",
      privacy_policy: "Privacy Policy",
      terms: "Terms of Service"
    }
  }
};

// Enhanced translation helper with error handling
export const t = (
  key: string, 
  lang: 'fr' | 'en' = 'fr', 
  replacements: Record<string, string> = {}
): string => {
  try {
    const keys = key.split('.');
    let value: any = translations[lang];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        value = undefined;
        break;
      }
    }
    
    if (typeof value !== 'string') {
      // Fallback to English if French translation not found
      if (lang === 'fr') {
        return t(key, 'en', replacements);
      }
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    
    // Replace placeholders with error handling
    let result = value;
    for (const [placeholder, replacement] of Object.entries(replacements)) {
      if (replacement !== undefined && replacement !== null) {
        result = result.replace(new RegExp(`{${placeholder}}`, 'g'), String(replacement));
      }
    }
    
    return result;
  } catch (error) {
    console.error(`Translation error for key ${key}:`, error);
    return key;
  }
};

// Unified Base Email Template with enhanced features
export interface UnifiedEmailProps {
  children: React.ReactNode;
  previewText?: string;
  lang?: 'fr' | 'en';
  emailType?: string;
  trackingId?: string;
}

export const UnifiedEmailTemplate: React.FC<UnifiedEmailProps> = ({ 
  children, 
  previewText, 
  lang = 'fr',
  emailType = 'general',
  trackingId
}) => {
  const trackingPixel = trackingId ? 
    React.createElement('img', {
              src: `${Deno.env.get('SUPABASE_URL')}/functions/v1/track-email-open?id=${trackingId}`,
      width: '1',
      height: '1',
      style: { display: 'none' }
    }) : null;

  return React.createElement('html', { lang },
    React.createElement('head', {},
      React.createElement('meta', { charSet: "UTF-8" }),
      React.createElement('meta', { name: "viewport", content: "width=device-width, initial-scale=1.0" }),
      React.createElement('meta', { name: "x-apple-disable-message-reformatting" }),
      React.createElement('title', {}, previewText || t('common.tagline', lang))
    ),
    React.createElement('body', { style: styles.body },
      // Preview text
      previewText && React.createElement('div', { style: styles.preview }, previewText),
      
      // Tracking pixel
      trackingPixel,
      
      // Header with CIARA branding
      React.createElement('div', { style: styles.header },
        React.createElement('div', { style: styles.headerContent },
          React.createElement('h1', { style: styles.logo }, "CIARA"),
          React.createElement('p', { style: styles.tagline }, t('common.tagline', lang))
        )
      ),
      
      // Main content container
      React.createElement('div', { style: styles.container },
        React.createElement('div', { style: styles.content }, children)
      ),
      
      // Enhanced footer with all links
      React.createElement('div', { style: styles.footer },
        React.createElement('div', { style: styles.footerContent },
          React.createElement('p', { style: styles.footerText }, t('common.footer_text', lang)),
          React.createElement('p', { style: styles.footerSubtext }, t('common.footer_subtext', lang)),
          
          React.createElement('div', { style: styles.footerLinks },
            React.createElement('a', { 
              href: "https://ciara.city", 
              style: styles.footerLink 
            }, "ciara.city"),
            React.createElement('span', { style: styles.footerSeparator }, "•"),
            React.createElement('a', { 
              href: "mailto:info@ciara.city", 
              style: styles.footerLink 
            }, "Contact"),
            React.createElement('span', { style: styles.footerSeparator }, "•"),
            React.createElement('a', { 
              href: "https://ciara.city/privacy", 
              style: styles.footerLink 
            }, t('common.privacy_policy', lang)),
            React.createElement('span', { style: styles.footerSeparator }, "•"),
            React.createElement('a', { 
              href: "https://ciara.city/terms", 
              style: styles.footerLink 
            }, t('common.terms', lang))
          ),
          
          React.createElement('p', { style: { ...styles.footerSubtext, marginTop: '12px' } }, 
            t('common.contact_info', lang)
          )
        )
      )
    )
  );
};

// Enhanced component library
export interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'medium' | 'large';
  trackingId?: string;
}

export const EmailButton: React.FC<EmailButtonProps> = ({ 
  href, 
  children, 
  variant = 'primary',
  size = 'medium',
  trackingId
}) => {
  const buttonStyles = {
    ...styles.baseButton,
    ...styles[`${variant}Button` as keyof typeof styles],
    ...styles[`${size}Button` as keyof typeof styles]
  };

  const trackingUrl = trackingId ? 
    `${href}?utm_source=email&utm_campaign=${trackingId}` : href;

  return React.createElement('a', {
    href: trackingUrl,
    style: buttonStyles,
    target: '_blank',
    rel: 'noopener noreferrer'
  }, children);
};

export interface EmailCardProps {
  children: React.ReactNode;
  title?: string;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'error';
  icon?: string;
}

export const EmailCard: React.FC<EmailCardProps> = ({ 
  children, 
  title, 
  variant = 'default',
  icon 
}) => {
  const cardStyles = {
    ...styles.card,
    ...styles[`${variant}Card` as keyof typeof styles]
  };

  return React.createElement('div', { style: cardStyles },
    (title || icon) && React.createElement('div', { style: styles.cardHeader },
      icon && React.createElement('span', { style: styles.cardIcon }, icon),
      title && React.createElement('h3', { style: styles.cardTitle }, title)
    ),
    React.createElement('div', { style: styles.cardContent }, children)
  );
};

// Typography helpers
export const EmailHeading = ({ level = 1, children, style = {} }: {
  level?: 1 | 2 | 3;
  children: React.ReactNode;
  style?: Record<string, any>;
}) => React.createElement(`h${level}`, {
  style: { ...styles[`h${level}` as keyof typeof styles], ...style }
}, children);

export const EmailText = ({ children, variant = 'body', style = {} }: {
  children: React.ReactNode;
  variant?: 'body' | 'small' | 'caption';
  style?: Record<string, any>;
}) => React.createElement('p', {
  style: { ...styles[variant === 'body' ? 'p' : variant], ...style }
}, children);

// List components
export const EmailList = ({ items, ordered = false }: {
  items: string[];
  ordered?: boolean;
}) => {
  const ListTag = ordered ? 'ol' : 'ul';
  return React.createElement(ListTag, { style: styles.list },
    ...items.map((item, index) => 
      React.createElement('li', { key: index, style: styles.listItem }, item)
    )
  );
};

// Enhanced styles with all variants
const styles = {
  body: {
    margin: '0',
    padding: '0',
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
    lineHeight: '1.6',
    color: '#374151',
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  content: {
    padding: '40px 30px',
  },
  
  // Card variants
  card: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '24px',
    margin: '20px 0',
  },
  successCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  warningCard: {
    backgroundColor: '#fffbeb',
    borderColor: '#fed7aa',
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  errorCard: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
  },
  cardIcon: {
    marginRight: '8px',
    fontSize: '20px',
  },
  cardTitle: {
    margin: '0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
  },
  cardContent: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#475569',
  },
  
  // Button variants and sizes
  baseButton: {
    display: 'inline-block',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    textAlign: 'center' as const,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  primaryButton: {
    backgroundColor: '#667eea',
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#667eea',
    border: '2px solid #667eea',
  },
  successButton: {
    backgroundColor: '#10b981',
    color: '#ffffff',
  },
  warningButton: {
    backgroundColor: '#f59e0b',
    color: '#ffffff',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
  },
  smallButton: {
    padding: '8px 16px',
    fontSize: '14px',
  },
  mediumButton: {
    padding: '12px 24px',
    fontSize: '16px',
  },
  largeButton: {
    padding: '16px 32px',
    fontSize: '18px',
  },
  
  // Footer
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
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.3s ease',
  },
  footerSeparator: {
    color: '#64748b',
    margin: '0 12px',
  },
  
  // Typography
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
  small: {
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#6b7280',
    margin: '0 0 12px 0',
  },
  caption: {
    fontSize: '12px',
    lineHeight: '1.4',
    color: '#9ca3af',
    margin: '0 0 8px 0',
  },
  
  // Lists
  list: {
    margin: '16px 0',
    paddingLeft: '20px',
  },
  listItem: {
    margin: '8px 0',
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#475569',
  },
  
  // Utility classes
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

// Export all components and utilities
export { 
  styles, 
  translations,
  UnifiedEmailTemplate as BaseEmailI18n // Backward compatibility alias
};

// Email type definitions for better TypeScript support
export interface EmailTemplateData {
  [key: string]: any;
}

export interface EmailConfig {
  templateType: string;
  lang: 'fr' | 'en';
  trackingId?: string;
  data: EmailTemplateData;
}