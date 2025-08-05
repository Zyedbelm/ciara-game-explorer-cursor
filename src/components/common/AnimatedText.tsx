import React from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useLoadingState } from '@/hooks/useLoadingState';

interface AnimatedTextProps {
  children: React.ReactNode;
  className?: string;
  skeletonClassName?: string;
  delay?: number;
  animation?: 'fade' | 'slide' | 'scale';
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  className = '',
  skeletonClassName = '',
  delay = 0,
  animation = 'fade'
}) => {
  const { shouldShowSkeleton } = useLoadingState();

  const getAnimationProps = () => {
    switch (animation) {
      case 'slide':
        return {
          initial: { opacity: 0, x: -20 },
          animate: { opacity: 1, x: 0 },
          transition: { duration: 0.5, delay, type: "tween" as const }
        };
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.4, delay, type: "tween" as const }
        };
      default: // fade
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.6, delay, type: "tween" as const }
        };
    }
  };

  if (shouldShowSkeleton) {
    return (
      <Skeleton className={`h-6 w-full ${skeletonClassName}`} />
    );
  }

  return (
    <motion.div
      className={className}
      {...getAnimationProps()}
    >
      {children}
    </motion.div>
  );
};