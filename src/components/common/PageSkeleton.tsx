import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Mountain } from 'lucide-react';

interface PageSkeletonProps {
  variant?: 'landing' | 'destination' | 'journey' | 'profile';
  className?: string;
}

export const PageSkeleton: React.FC<PageSkeletonProps> = ({ 
  variant = 'landing',
  className = ''
}) => {
  if (variant === 'landing') {
    return (
      <div className={`min-h-screen bg-background ${className}`}>
        {/* Navigation Skeleton */}
        <nav className="absolute top-0 left-0 right-0 z-10 p-6">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2 text-white">
              <Mountain className="h-6 w-6" />
              <span className="font-bold text-xl">CIARA</span>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-20 bg-white/20" />
              <Skeleton className="h-8 w-8 rounded-full bg-white/20" />
            </div>
          </div>
        </nav>

        {/* Hero Skeleton */}
        <section className="relative overflow-hidden bg-gradient-alpine">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative container mx-auto px-4 py-32 pt-40 text-center">
            <div className="max-w-4xl mx-auto">
              <Skeleton className="h-16 md:h-20 w-full max-w-3xl mx-auto mb-6 bg-white/20" />
              <Skeleton className="h-8 w-full max-w-2xl mx-auto mb-8 bg-white/20" />
              <Skeleton className="h-14 w-48 mx-auto bg-white/30 rounded-lg" />
            </div>
          </div>
        </section>

        {/* Features Skeleton */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Skeleton className="h-10 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, index) => (
                <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="text-center pb-4">
                    <Skeleton className="w-16 h-16 mx-auto mb-4 rounded-full" />
                    <Skeleton className="h-6 w-32 mx-auto" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Destinations Skeleton */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Skeleton className="h-10 w-72 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            
            <div className="flex justify-center mb-12">
              <Skeleton className="h-10 w-48" />
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <Card key={index} className="overflow-hidden border-0 shadow-lg">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Other variants can be added here
  return (
    <div className={`p-6 ${className}`}>
      <Skeleton className="h-8 w-48 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
};
