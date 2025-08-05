
import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ErrorInfo {
  componentStack?: string;
  errorBoundary?: string;
}

export function useErrorBoundary() {
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const captureError = useCallback((error: Error, errorInfo?: ErrorInfo) => {
    console.error('🚨 Error captured by boundary:', error, errorInfo);
    setError(error);
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      console.error('🚨 Production error:', error);
    }

    // Prevent duplicate toasts for the same error
    const errorKey = `${error.name}_${error.message.substring(0, 50)}`;
    const lastToastKey = localStorage.getItem('lastToastKey');
    const lastToastTime = localStorage.getItem('lastToastTime');
    const now = Date.now();
    
    // Show toast only if different error or 5 seconds have passed
    if (errorKey !== lastToastKey || !lastToastTime || now - parseInt(lastToastTime) > 5000) {
      toast({
        title: "Une erreur inattendue s'est produite",
        description: "Nous avons été notifiés du problème. Veuillez réessayer.",
        variant: "destructive",
      });
      
      localStorage.setItem('lastToastKey', errorKey);
      localStorage.setItem('lastToastTime', now.toString());
    }
  }, [toast]);

  const withErrorBoundary = useCallback(<T extends any[], R>(
    fn: (...args: T) => R | Promise<R>
  ) => {
    return async (...args: T): Promise<R | void> => {
      try {
        const result = await fn(...args);
        return result;
      } catch (error) {
        console.error('🚨 Error in wrapped function:', error);
        captureError(error as Error);
        return undefined; // Return undefined instead of void for better type safety
      }
    };
  }, [captureError]);

  return {
    error,
    resetError,
    captureError,
    withErrorBoundary,
  };
}
