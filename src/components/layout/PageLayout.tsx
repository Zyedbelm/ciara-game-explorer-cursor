import React from 'react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  headerProps?: {
    showBackButton?: boolean;
    title?: string;
    subtitle?: string;
  };
  className?: string;
  contentClassName?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  showHeader = true,
  showFooter = true,
  headerProps,
  className = "",
  contentClassName = ""
}) => {
  return (
    <div className={`min-h-screen bg-background flex flex-col ${className}`}>
      {/* Header */}
      {showHeader && headerProps && (
        <Header 
          showBackButton={headerProps.showBackButton}
          title={headerProps.title}
          subtitle={headerProps.subtitle}
        />
      )}
      
      {/* Main Content - flex-1 ensures it takes all available space */}
      <main className={`flex-1 flex flex-col ${contentClassName}`}>
        {children}
      </main>
      
      {/* Footer - always at bottom */}
      {showFooter && <Footer />}
    </div>
  );
};

export default PageLayout;