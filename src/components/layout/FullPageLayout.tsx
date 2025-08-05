import React from 'react';
import PageLayout from './PageLayout';

interface FullPageLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  headerProps?: {
    showBackButton?: boolean;
    title?: string;
    subtitle?: string;
  };
  className?: string;
}

/**
 * Layout pleine page pour les pages complexes (landing, destination, etc.)
 * Contrôle total sur l'affichage du header et footer
 */
const FullPageLayout: React.FC<FullPageLayoutProps> = ({
  children,
  showHeader = false,
  showFooter = true,
  headerProps,
  className = ""
}) => {
  return (
    <PageLayout
      showHeader={showHeader}
      showFooter={showFooter}
      headerProps={headerProps}
      className={className}
      contentClassName="flex-1"
    >
      {children}
    </PageLayout>
  );
};

export default FullPageLayout;