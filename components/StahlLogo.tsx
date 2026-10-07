import React from 'react';

const StahlLogo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`inline-block ${className}`}>
        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary-purple-hover)" />
                    <stop offset="100%" stopColor="var(--primary-purple)" />
                </linearGradient>
            </defs>
            <path d="M50 0L95.11 25V75L50 100L4.89 75V25L50 0Z" fill="url(#logo-gradient)"/>
            <path d="M50 12L84.5 31V69L50 88L15.5 69V31L50 12Z" fill="var(--dark-bg)"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M62.5 35H37.5V40H52.5L37.5 60H62.5V55H47.5L62.5 40V35Z" fill="url(#logo-gradient)"/>
        </svg>
    </div>
  );
};

export default StahlLogo;