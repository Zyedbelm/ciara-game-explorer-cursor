
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({ 
  isOpen, 
  onClose, 
  feature 
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogin = () => {
    onClose();
    navigate('/auth');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            {t('auth_required')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              {t('login_required_message').replace('{feature}', feature || t('ai_journey_generator_feature'))}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('create_account_message')}
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline" className="flex-1">
              {t('cancel')}
            </Button>
            <Button onClick={handleLogin} className="flex-1">
              <LogIn className="mr-2 h-4 w-4" />
              {t('login')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthRequiredModal;
