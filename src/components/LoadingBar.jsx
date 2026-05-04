import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const LoadingContext = createContext();

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setProgress(0);
    setTimeout(() => setProgress(70), 50); // Jump to 70%
  }, []);

  const stopLoading = useCallback(() => {
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 300); // Wait for transition to complete before hiding
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      <LoadingBar isLoading={isLoading} progress={progress} />
    </LoadingContext.Provider>
  );
}

function LoadingBar({ isLoading, progress }) {
  if (!isLoading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-[3px] z-[9999] bg-transparent overflow-hidden pointer-events-none">
      <div 
        className="h-full bg-accent relative transition-all ease-out"
        style={{ 
          width: `${progress}%`,
          transitionDuration: progress === 100 ? '200ms' : '400ms'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]"></div>
      </div>
    </div>
  );
}
