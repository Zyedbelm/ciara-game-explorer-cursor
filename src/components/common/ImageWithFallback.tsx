import React, { useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
  placeholder?: React.ReactNode;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc,
  onLoad,
  onError,
  loading = 'lazy',
  placeholder
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = useCallback(() => {
    setImageState('loaded');
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      // Reset state to try loading the fallback
      setImageState('loading');
    } else {
      setImageState('error');
      onError?.();
    }
  }, [fallbackSrc, currentSrc, onError]);

  const renderPlaceholder = () => {
    if (placeholder) return placeholder;
    return <Skeleton className={`${className} animate-pulse`} />;
  };

  if (imageState === 'error' && (!fallbackSrc || currentSrc === fallbackSrc)) {
    return (
      <div className={`${className} bg-muted flex items-center justify-center`}>
        <span className="text-muted-foreground text-sm">Image non disponible</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {imageState === 'loading' && (
        <div className="absolute inset-0 z-10">
          {renderPlaceholder()}
        </div>
      )}
      <img
        src={currentSrc}
        alt={alt}
        className={`${className} ${imageState === 'loading' ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        loading={loading}
      />
    </div>
  );
};