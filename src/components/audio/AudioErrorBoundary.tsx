import React from 'react';
import { useErrorBoundary } from '@/hooks/useErrorBoundary';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface AudioErrorBoundaryProps {
  children: React.ReactNode;
}

export const AudioErrorBoundary: React.FC<AudioErrorBoundaryProps> = ({ children }) => {
  const { error, resetError } = useErrorBoundary();

  if (error) {
    return (
      <Alert variant="destructive" className="m-2">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Audio functionality is temporarily unavailable. 
          <button 
            onClick={resetError}
            className="ml-2 underline hover:no-underline"
          >
            Try again
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};