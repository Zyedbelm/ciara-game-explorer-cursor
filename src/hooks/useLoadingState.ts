import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface LoadingStateOptions {
  minimumLoadingTime?: number;
  showSkeletonUntilReady?: boolean;
}

export function useLoadingState(options: LoadingStateOptions = {}) {
  const { minimumLoadingTime = 800, showSkeletonUntilReady = true } = options;
  const { isLoading: translationsLoading } = useLanguage();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    // Minimum loading time to prevent flicker
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, minimumLoadingTime);

    return () => clearTimeout(timer);
  }, [minimumLoadingTime]);

  useEffect(() => {
    // Content is ready when translations are loaded and initial loading is done
    if (!translationsLoading && !isInitialLoading) {
      setContentReady(true);
    }
  }, [translationsLoading, isInitialLoading]);

  const shouldShowSkeleton = showSkeletonUntilReady ? !contentReady : translationsLoading || isInitialLoading;

  return {
    isLoading: translationsLoading || isInitialLoading,
    contentReady,
    shouldShowSkeleton,
    translationsLoading,
    isInitialLoading,
  };
}