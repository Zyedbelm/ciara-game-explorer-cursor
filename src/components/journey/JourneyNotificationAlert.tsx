
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles } from 'lucide-react';

interface JourneyNotificationAlertProps {
  message?: string;
  newJourneyName?: string;
}

const JourneyNotificationAlert: React.FC<JourneyNotificationAlertProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const notificationMessage = location.state?.message;
  const newJourneyName = location.state?.newJourneyName;

  useEffect(() => {
    // Clear location state after displaying the message
    if (notificationMessage) {
      const timer = setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} });
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [notificationMessage, navigate, location.pathname]);

  if (!notificationMessage) {
    return null;
  }

  return (
    <Alert className="mb-6 border-green-200 bg-green-50">
      <Sparkles className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        <div className="flex flex-col gap-1">
          <span className="font-medium">{notificationMessage}</span>
          {newJourneyName && (
            <span className="text-sm">
              Recherchez le parcours <strong>"{newJourneyName}"</strong> dans l'onglet "Sauvegardés" ci-dessous.
            </span>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default JourneyNotificationAlert;
