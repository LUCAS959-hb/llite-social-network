import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-10 h-10 text-2xl',
    lg: 'w-14 h-14 text-3xl',
  };

  return (
    <div className="flex items-center gap-2.5 select-none cursor-pointer group">
      {/* Original LLite Blue Emblem: White 'L' in Royal Blue with Cyan accent */}
      <div
        className={`${sizeClasses[size]} relative flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#155dfc] via-[#1877F2] to-[#38bdf8] shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200`}
      >
        <span className="font-black text-white font-sans tracking-tight drop-shadow-sm ml-0.5">
          L
        </span>
        <span className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-white shadow-xs"></span>
      </div>

      {showText && (
        <span className="text-2xl font-black tracking-tight text-[#1877F2] font-sans flex items-baseline">
          LLite
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#1877F2] ml-0.5 mb-1 animate-pulse"></span>
        </span>
      )}
    </div>
  );
};
