import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useLoadingState } from '@/hooks/useLoadingState';

interface ProgressiveLoaderProps {
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
  className?: string;
}

export const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({
  children,
  skeleton,
  fallback,
  delay = 0,
  className = ''
}) => {
  const { shouldShowSkeleton, contentReady } = useLoadingState();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (contentReady) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [contentReady, delay]);

  const renderSkeleton = () => {
    if (skeleton) return skeleton;
    if (fallback) return fallback;
    return <Skeleton className="h-6 w-full" />;
  };

  return (
    <div className={className}>
      <AnimatePresence>
        {shouldShowSkeleton || !showContent ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderSkeleton()}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};