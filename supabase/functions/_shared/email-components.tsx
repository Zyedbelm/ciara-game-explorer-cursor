import React from 'npm:react@18.3.1';

// Base Email Template with CIARA branding
export interface BaseEmailProps {
  children: React.ReactNode;
  previewText?: string;
}

export const BaseEmail: React.FC<BaseEmailProps> = ({ children, previewText = "Message de CIARA" }) => 
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
          React.createElement('p', { style: styles.tagline }, "Votre compagnon de voyage intelligent")
        )
      ),
      
      // Main content
      React.createElement('div', { style: styles.container },
        React.createElement('div', { style: styles.content }, children)
      ),
      
      // Footer
      React.createElement('div', { style: styles.footer },
        React.createElement('div', { style: styles.footerContent },
          React.createElement('p', { style: styles.footerText }, "CIARA - Plateforme de Tourisme Intelligent"),
          React.createElement('p', { style: styles.footerSubtext }, "Transformez votre destination en expérience de jeu grandeur nature"),
          React.createElement('div', { style: styles.footerLinks },
            React.createElement('a', { href: "https://ciara.city", style: styles.footerLink }, "Site Web"),
            React.createElement('span', { style: styles.footerSeparator }, "•"),
            React.createElement('a', { href: "mailto:info@ciara.city", style: styles.footerLink }, "Contact")
          )
        )
      )
    )
  );

// Reusable Button Component
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

// Card Component for structured content
export interface EmailCardProps {
  children: React.ReactNode;
  title?: string;
}

export const EmailCard: React.FC<EmailCardProps> = ({ children, title }) => 
  React.createElement('div', { style: styles.card },
    title && React.createElement('h3', { style: styles.cardTitle }, title),
    React.createElement('div', { style: styles.cardContent }, children)
  );

// Styles object
const styles = {
  body: {
    margin: '0',
    padding: '0',
    backgroundColor: '#f8fafc',
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
    backgroundColor: '#667eea',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '16px',
    textAlign: 'center' as const,
    margin: '16px 0',
  },
  secondaryButton: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: 'transparent',
    color: '#667eea',
    textDecoration: 'none',
    border: '2px solid #667eea',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '16px',
    textAlign: 'center' as const,
    margin: '16px 0',
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
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '14px',
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
};

export { styles };