import React from 'react';
import PageLayout from './PageLayout';

interface CenteredPageLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
  maxWidth?: string;
}

/**
 * Layout centré pour les pages avec contenu au centre (auth, erreurs, etc.)
 * Le contenu est centré verticalement et horizontalement
 */
const CenteredPageLayout: React.FC<CenteredPageLayoutProps> = ({
  children,
  showBackButton = false,
  title,
  subtitle,
  className = "",
  maxWidth = "max-w-md"
}) => {
  return (
    <PageLayout
      showHeader={!!title}
      showFooter={true}
      headerProps={{
        showBackButton,
        title,
        subtitle
      }}
      className={className}
      contentClassName="flex-1 flex items-center justify-center"
    >
      <div className={`${maxWidth} w-full mx-auto px-4`}>
        {children}
      </div>
    </PageLayout>
  );
};

export default CenteredPageLayout;