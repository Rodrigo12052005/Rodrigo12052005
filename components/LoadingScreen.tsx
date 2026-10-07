import React from 'react';
import StahlLogo from './StahlLogo';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-dark-bg flex flex-col items-center justify-center z-[999]">
      <div className="animate-pulse">
        <StahlLogo className="w-48 h-48" />
      </div>
      <div className="loading-bar mt-8">
        <div className="loading-bar-inner"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;