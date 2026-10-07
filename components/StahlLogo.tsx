import React from 'react';
import StahlBrand from './BrandAssets';

const StahlLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <StahlBrand className={className} />
);

export default StahlLogo;
