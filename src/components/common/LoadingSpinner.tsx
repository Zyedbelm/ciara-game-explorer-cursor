import React from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text, 
  className = '',
  fullScreen = false
}) => {
  const { t } = useLanguage();
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const displayText = text || t('loading');

  const spinnerContent = (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <Loader2 className={`animate-spin text-primary ${sizeClasses[size]}`} />
      {displayText && (
        <span className={`text-muted-foreground ${textSizeClasses[size]}`}>
          {displayText}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className={`animate-spin text-primary ${sizeClasses[size]}`} />
          {displayText && (
            <span className={`text-muted-foreground ${textSizeClasses[size]}`}>
              {displayText}
            </span>
          )}
        </div>
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;