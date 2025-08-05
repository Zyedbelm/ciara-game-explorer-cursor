import React from 'react';
import PageLayout from './PageLayout';

interface StandardPageLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
  containerClassName?: string;
}

/**
 * Layout standard pour les pages avec Header + contenu container + Footer
 * Le contenu s'étend automatiquement pour éviter l'espace blanc en bas
 */
const StandardPageLayout: React.FC<StandardPageLayoutProps> = ({
  children,
  showBackButton = true,
  title,
  subtitle,
  className = "",
  containerClassName = ""
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
      contentClassName="flex-1"
    >
      <div className={`container mx-auto px-4 py-8 flex-1 ${containerClassName}`}>
        {children}
      </div>
    </PageLayout>
  );
};

export default StandardPageLayout;