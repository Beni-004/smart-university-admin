import React, { Suspense, useState } from 'react';
import Spline from '@splinetool/react-spline';
import type { Application } from '@splinetool/runtime';

interface SplineHeroProps {
  onLoad?: (splineApp: Application) => void;
}

export const SplineHero: React.FC<SplineHeroProps> = ({ onLoad }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = (splineApp: Application) => {
    console.log('✅ Spline 3D scene loaded successfully');
    setIsLoaded(true);

    // Optional: Add event listeners for interactivity
    splineApp.addEventListener('mouseDown', (e: any) => {
      console.log('3D object clicked:', e.target?.name);
    });

    splineApp.addEventListener('mouseHover', (e: any) => {
      if (e.target?.name) {
        // Add cursor pointer effect or other interactions
      }
    });

    // Call parent onLoad handler if provided
    if (onLoad) {
      onLoad(splineApp);
    }
  };

  const handleError = () => {
    console.error('Failed to load Spline 3D scene');
    setError(true);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Loading State */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 border-3 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin mx-auto" />
            <p className="text-zinc-400 text-sm">Loading 3D Experience...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="text-center space-y-4 max-w-md mx-auto px-6">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
              <span className="text-red-400 text-2xl">⚠</span>
            </div>
            <h3 className="text-zinc-200 text-lg font-medium">Failed to Load 3D Scene</h3>
            <p className="text-zinc-400 text-sm">Please check your connection and try refreshing the page.</p>
          </div>
        </div>
      )}

      {/* Spline 3D Scene */}
      <Suspense fallback={null}>
        <Spline
          scene="https://prod.spline.design/OC9-QHrIYJURCTbx/scene.splinecode"
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </Suspense>

      {/* Scroll Indicator */}
      {isLoaded && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex flex-col items-center space-y-2 animate-bounce">
            <p className="text-white/60 text-sm font-medium">Scroll to explore</p>
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};