import React from 'react';

interface UnitIconProps {
  unit?: string;
  className?: string;
}

const unitEmojiMap: { [key: string]: string } = {
    'Falcão': '🦅',
    'Águia': '🦅',
    'Panda': '🐼',
    'Puma': '🐆',
};

const UnitIcon: React.FC<UnitIconProps> = ({ unit, className = 'w-10 h-10 text-2xl' }) => {
  if (!unit) return null;

  const emoji = unitEmojiMap[unit];
  let dynamicClasses = 'bg-gradient-to-br from-gray-700 to-gray-900 shadow-gray-500/30';
  switch (unit) {
      case 'Falcão':
      case 'Águia':
          dynamicClasses = 'bg-gradient-to-br from-slate-700 to-slate-900 shadow-slate-500/30';
          break;
      case 'Panda':
          dynamicClasses = 'bg-gradient-to-br from-zinc-700 to-zinc-900 shadow-zinc-500/30';
          break;
      case 'Puma':
          dynamicClasses = 'bg-gradient-to-br from-stone-700 to-stone-900 shadow-stone-500/30';
          break;
  }

  return (
    <div
      className={`
        ${className} 
        ${dynamicClasses}
        rounded-full flex items-center justify-center 
        text-white/90
        border-2 border-white/10 shadow-lg
      `}
    >
      {emoji ? (
        <span className="leading-none" style={{ textShadow: '0px 2px 3px rgba(0,0,0,0.5)' }} role="img" aria-label={unit}>{emoji}</span>
      ) : (
        <span className="font-heading font-bold" style={{ textShadow: '0px 2px 3px rgba(0,0,0,0.5)' }}>
          {unit.charAt(0)}
        </span>
      )}
    </div>
  );
};

export default UnitIcon;