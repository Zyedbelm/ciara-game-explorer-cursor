import { useEffect, useCallback, useRef } from 'react';

interface PreloadOptions {
  priority?: 'high' | 'medium' | 'low';
  async?: boolean;
  timeout?: number;
}

interface AssetCache {
  [url: string]: {
    loaded: boolean;
    error: boolean;
    timestamp: number;
  };
}

// Cache global pour les assets préchargés
const assetCache: AssetCache = {};
const PRELOAD_TIMEOUT = 10000; // 10 secondes

export function usePreloadAssets() {
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fonction de préchargement d'image optimisée
  const preloadImage = useCallback((url: string, options: PreloadOptions = {}): Promise<boolean> => {
    return new Promise((resolve) => {
      // Vérifier le cache d'abord
      if (assetCache[url]) {
        if (assetCache[url].loaded) {
          resolve(true);
          return;
        }
        if (assetCache[url].error) {
          resolve(false);
          return;
        }
      }

      // Initialiser dans le cache
      assetCache[url] = {
        loaded: false,
        error: false,
        timestamp: Date.now()
      };

      const img = new Image();
      const timeout = options.timeout || PRELOAD_TIMEOUT;

      const timeoutId = setTimeout(() => {
        img.src = '';
        assetCache[url].error = true;
        resolve(false);
      }, timeout);

      img.onload = () => {
        clearTimeout(timeoutId);
        assetCache[url].loaded = true;
        resolve(true);
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        assetCache[url].error = true;
        resolve(false);
      };

      // Définir la priorité via fetchPriority si supporté
      if ('fetchPriority' in img) {
        (img as any).fetchPriority = options.priority || 'medium';
      }

      img.src = url;
    });
  }, []);

  // Préchargement en lot avec gestion de la concurrence
  const preloadImages = useCallback(async (
    urls: string[], 
    options: PreloadOptions = {}
  ): Promise<{ success: number; failed: number }> => {
    const validUrls = urls.filter(url => url && !assetCache[url]?.loaded);
    
    if (validUrls.length === 0) {
      return { success: 0, failed: 0 };
    }

    let success = 0;
    let failed = 0;

    // Limiter la concurrence selon la priorité
    const concurrency = options.priority === 'high' ? 6 : options.priority === 'medium' ? 4 : 2;
    const chunks = [];
    
    for (let i = 0; i < validUrls.length; i += concurrency) {
      chunks.push(validUrls.slice(i, i + concurrency));
    }

    for (const chunk of chunks) {
      const results = await Promise.allSettled(
        chunk.map(url => preloadImage(url, options))
      );
      
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          success++;
        } else {
          failed++;
        }
      });

      // Petite pause entre les chunks pour éviter de surcharger
      if (chunks.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    return { success, failed };
  }, [preloadImage]);

  // Préchargement de CSS
  const preloadCSS = useCallback((url: string, options: PreloadOptions = {}): Promise<boolean> => {
    return new Promise((resolve) => {
      if (assetCache[url]) {
        resolve(assetCache[url].loaded);
        return;
      }

      assetCache[url] = {
        loaded: false,
        error: false,
        timestamp: Date.now()
      };

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = url;

      const timeoutId = setTimeout(() => {
        assetCache[url].error = true;
        resolve(false);
      }, options.timeout || PRELOAD_TIMEOUT);

      link.onload = () => {
        clearTimeout(timeoutId);
        assetCache[url].loaded = true;
        resolve(true);
      };

      link.onerror = () => {
        clearTimeout(timeoutId);
        assetCache[url].error = true;
        resolve(false);
      };

      document.head.appendChild(link);
    });
  }, []);

  // Préchargement de JavaScript
  const preloadJS = useCallback((url: string, options: PreloadOptions = {}): Promise<boolean> => {
    return new Promise((resolve) => {
      if (assetCache[url]) {
        resolve(assetCache[url].loaded);
        return;
      }

      assetCache[url] = {
        loaded: false,
        error: false,
        timestamp: Date.now()
      };

      const script = document.createElement('script');
      script.src = url;
      script.async = options.async !== false;

      const timeoutId = setTimeout(() => {
        assetCache[url].error = true;
        resolve(false);
      }, options.timeout || PRELOAD_TIMEOUT);

      script.onload = () => {
        clearTimeout(timeoutId);
        assetCache[url].loaded = true;
        resolve(true);
      };

      script.onerror = () => {
        clearTimeout(timeoutId);
        assetCache[url].error = true;
        resolve(false);
      };

      document.head.appendChild(script);
    });
  }, []);

  // Nettoyage du cache expiré
  const cleanupCache = useCallback(() => {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes

    Object.keys(assetCache).forEach(url => {
      if (now - assetCache[url].timestamp > maxAge) {
        delete assetCache[url];
      }
    });
  }, []);

  // Préchargement intelligent basé sur la visibilité
  const preloadVisibleAssets = useCallback((urls: string[], options: PreloadOptions = {}) => {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const url = entry.target.getAttribute('data-url');
            if (url) {
              preloadImage(url, options);
            }
          }
        });
      }, {
        rootMargin: '50px'
      });

      // Créer des éléments invisibles pour observer
      urls.forEach(url => {
        const element = document.createElement('div');
        element.setAttribute('data-url', url);
        element.style.position = 'absolute';
        element.style.top = '-1000px';
        element.style.left = '-1000px';
        document.body.appendChild(element);
        observer.observe(element);
      });

      return () => observer.disconnect();
    } else {
      // Fallback pour les navigateurs sans IntersectionObserver
      preloadImages(urls, options);
    }
  }, [preloadImage, preloadImages]);

  // Annuler les préchargements en cours
  const cancelPreloads = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Nettoyage automatique
  useEffect(() => {
    const interval = setInterval(cleanupCache, 5 * 60 * 1000); // Toutes les 5 minutes
    return () => clearInterval(interval);
  }, [cleanupCache]);

  // Nettoyage à la destruction
  useEffect(() => {
    return () => {
      cancelPreloads();
    };
  }, [cancelPreloads]);

  return {
    preloadImage,
    preloadImages,
    preloadCSS,
    preloadJS,
    preloadVisibleAssets,
    cancelPreloads,
    cleanupCache,
    getCacheStats: () => ({
      total: Object.keys(assetCache).length,
      loaded: Object.values(assetCache).filter(asset => asset.loaded).length,
      failed: Object.values(assetCache).filter(asset => asset.error).length
    })
  };
}