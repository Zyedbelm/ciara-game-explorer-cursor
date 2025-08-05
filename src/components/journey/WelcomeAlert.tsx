
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface WelcomeAlertProps {
  hasAnyJourneys: boolean;
}

const WelcomeAlert: React.FC<WelcomeAlertProps> = ({ hasAnyJourneys }) => {
  const { t } = useLanguage();

  if (hasAnyJourneys) {
    return null;
  }

  return (
    <Alert className="mb-6">
      <Info className="h-4 w-4" />
      <AlertDescription>
        <div className="flex flex-col gap-2">
          <span className="font-medium">{t('welcome_alert.title')}</span>
          <span className="text-sm">
            {t('welcome_alert.description')}
          </span>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default WelcomeAlert;
