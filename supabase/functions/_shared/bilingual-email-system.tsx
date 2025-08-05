import React from 'npm:react@18.3.1';

// Base email template interface
export interface BilingualEmailProps {
  children: React.ReactNode;
  previewText?: string;
  trackingId?: string;
}

// Button component interface
export interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

// Card component interface
export interface EmailCardProps {
  children: React.ReactNode;
  title?: string;
  variant?: 'default' | 'warning' | 'info';
}

// Unified Bilingual Email Template
export const BilingualEmailTemplate: React.FC<BilingualEmailProps> = ({ 
  children, 
  previewText, 
  trackingId 
}) => {
  return React.createElement('html', { lang: 'fr' },
    React.createElement('head', {},
      React.createElement('meta', { charSet: "UTF-8" }),
      React.createElement('meta', { name: "viewport", content: "width=device-width, initial-scale=1.0" }),
      React.createElement('title', {}, "CIARA - Votre compagnon de voyage intelligent"),
      previewText && React.createElement('meta', { name: "description", content: previewText })
    ),
    React.createElement('body', { 
      style: { 
        margin: '0', 
        padding: '0', 
        backgroundColor: '#fef7ed', 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif' 
      } 
    },
      // Header with orange to pink gradient
      React.createElement('div', { 
        style: { 
          background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)', 
          padding: '40px 20px', 
          textAlign: 'center' 
        } 
      },
        React.createElement('div', { style: { maxWidth: '600px', margin: '0 auto' } },
          React.createElement('h1', { 
            style: { 
              margin: '0', 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: 'white', 
              letterSpacing: '2px' 
            } 
          }, "CIARA"),
          React.createElement('div', { 
            style: { 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '20px', 
              marginTop: '8px', 
              flexWrap: 'wrap' 
            } 
          },
            React.createElement('p', { 
              style: { 
                margin: '0', 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontSize: '14px',
                textAlign: 'center'
              } 
            }, "🇫🇷 Votre compagnon de voyage intelligent"),
            React.createElement('span', { 
              style: { 
                color: 'rgba(255, 255, 255, 0.6)', 
                fontSize: '14px' 
              } 
            }, "•"),
            React.createElement('p', { 
              style: { 
                margin: '0', 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontSize: '14px',
                textAlign: 'center'
              } 
            }, "🇬🇧 Your intelligent travel companion")
          )
        )
      ),
      
      // Main content container
      React.createElement('div', { 
        style: { 
          maxWidth: '600px', 
          margin: '0 auto', 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          marginTop: '-20px', 
          position: 'relative', 
          zIndex: '1', 
          boxShadow: '0 10px 30px rgba(249, 115, 22, 0.15)' 
        } 
      },
        React.createElement('div', { style: { padding: '40px 30px' } },
          children
        )
      ),
      
      // Footer
      React.createElement('div', { 
        style: { 
          maxWidth: '600px', 
          margin: '30px auto', 
          padding: '0 20px' 
        } 
      },
        React.createElement('div', { 
          style: { 
            textAlign: 'center', 
            padding: '30px 0', 
            borderTop: '1px solid #e5e7eb' 
          } 
        },
          React.createElement('div', { 
            style: { 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '20px', 
              marginBottom: '10px', 
              flexWrap: 'wrap' 
            } 
          },
            React.createElement('p', { 
              style: { 
                margin: '0', 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#1f2937' 
              } 
            }, "🇫🇷 L'équipe CIARA"),
            React.createElement('span', { 
              style: { 
                color: '#d1d5db' 
              } 
            }, "•"),
            React.createElement('p', { 
              style: { 
                margin: '0', 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#1f2937' 
              } 
            }, "🇬🇧 The CIARA Team")
          ),
          React.createElement('div', { 
            style: { 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '20px', 
              marginBottom: '15px', 
              flexWrap: 'wrap' 
            } 
          },
            React.createElement('p', { 
              style: { 
                margin: '0', 
                fontSize: '14px', 
                color: '#6b7280' 
              } 
            }, "🇫🇷 Votre plateforme de tourisme intelligent"),
            React.createElement('span', { 
              style: { 
                color: '#d1d5db' 
              } 
            }, "•"),
            React.createElement('p', { 
              style: { 
                margin: '0', 
                fontSize: '14px', 
                color: '#6b7280' 
              } 
            }, "🇬🇧 Your intelligent tourism platform")
          ),
          React.createElement('div', { style: { margin: '20px 0' } },
            React.createElement('a', { 
              href: "https://ciara.city", 
              style: { 
                color: '#f97316', 
                textDecoration: 'none', 
                margin: '0 10px', 
                fontSize: '14px' 
              } 
            }, "ciara.city"),
            React.createElement('span', { 
              style: { 
                color: '#d1d5db', 
                margin: '0 5px' 
              } 
            }, "•"),
            React.createElement('a', { 
              href: "mailto:info@ciara.city", 
              style: { 
                color: '#f97316', 
                textDecoration: 'none', 
                margin: '0 10px', 
                fontSize: '14px' 
              } 
            }, "Contact")
          )
        )
      ),
      
      // Tracking pixel
      trackingId && React.createElement('img', { 
        src: `https://track.ciara.city/pixel.gif?id=${trackingId}`, 
        width: '1', 
        height: '1', 
        style: { display: 'block' } 
      })
    )
  );
};

// Bilingual Email Button Component
export const BilingualEmailButton: React.FC<EmailButtonProps> = ({ 
  href, 
  children, 
  variant = 'primary' 
}) => {
  const buttonStyle = {
    display: 'inline-block',
    background: variant === 'primary' 
      ? 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)'
      : 'transparent',
    color: variant === 'primary' ? 'white' : '#f97316',
    border: variant === 'secondary' ? '2px solid #f97316' : 'none',
    textDecoration: 'none',
    padding: '16px 32px',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '16px',
    textAlign: 'center' as const,
    boxShadow: variant === 'primary' ? '0 4px 15px rgba(249, 115, 22, 0.4)' : 'none',
    transition: 'all 0.3s ease'
  };

  return React.createElement('a', { href, style: buttonStyle }, children);
};

// Bilingual Email Card Component
export const BilingualEmailCard: React.FC<EmailCardProps> = ({ 
  children, 
  title, 
  variant = 'default' 
}) => {
  let cardStyle = {
    backgroundColor: '#f8fafc',
    padding: '20px',
    borderRadius: '8px',
    margin: '24px 0'
  };

  if (variant === 'warning') {
    cardStyle.backgroundColor = '#fef3c7';
    cardStyle = { ...cardStyle, borderLeft: '4px solid #f59e0b' };
  } else if (variant === 'info') {
    cardStyle.backgroundColor = '#e0f2fe';
    cardStyle = { ...cardStyle, borderLeft: '4px solid #0ea5e9' };
  }

  return React.createElement('div', { style: cardStyle },
    title && React.createElement('h3', { 
      style: { 
        margin: '0 0 15px 0', 
        fontSize: '18px', 
        fontWeight: 'bold', 
        color: '#1f2937' 
      } 
    }, title),
    children
  );
};

// Bilingual Section Component for side-by-side content
export const BilingualSection: React.FC<{
  frenchContent: React.ReactNode;
  englishContent: React.ReactNode;
}> = ({ frenchContent, englishContent }) => {
  return React.createElement('div', { 
    style: { 
      display: 'grid', 
      gridTemplateColumns: '1fr 1fr', 
      gap: '20px', 
      margin: '30px 0',
      '@media (max-width: 600px)': {
        gridTemplateColumns: '1fr'
      }
    } 
  },
    React.createElement('div', { 
      style: { 
        padding: '20px', 
        backgroundColor: '#fef7ed', 
        borderRadius: '8px',
        borderLeft: '4px solid #f97316'
      } 
    },
      React.createElement('div', { 
        style: { 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '10px' 
        } 
      },
        React.createElement('span', { style: { fontSize: '16px', marginRight: '8px' } }, '🇫🇷'),
        React.createElement('strong', { style: { color: '#1f2937', fontSize: '14px' } }, 'Français')
      ),
      frenchContent
    ),
    React.createElement('div', { 
      style: { 
        padding: '20px', 
        backgroundColor: '#f1f5f9', 
        borderRadius: '8px',
        borderLeft: '4px solid #0ea5e9'
      } 
    },
      React.createElement('div', { 
        style: { 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '10px' 
        } 
      },
        React.createElement('span', { style: { fontSize: '16px', marginRight: '8px' } }, '🇬🇧'),
        React.createElement('strong', { style: { color: '#1f2937', fontSize: '14px' } }, 'English')
      ),
      englishContent
    )
  );
};

// Base text styles
export const textStyles = {
  h1: {
    textAlign: 'center' as const,
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '20px',
    lineHeight: '1.3'
  },
  h2: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '15px',
    lineHeight: '1.3'
  },
  h3: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '10px',
    lineHeight: '1.3'
  },
  p: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#4b5563',
    marginBottom: '16px'
  },
  small: {
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#6b7280'
  },
  list: {
    color: '#475569',
    lineHeight: '1.6',
    margin: '0',
    paddingLeft: '20px'
  },
  listItem: {
    marginBottom: '8px'
  }
};