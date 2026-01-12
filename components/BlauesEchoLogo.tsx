
import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'white';
}

const BlauesEchoLogo: React.FC<LogoProps> = ({ className = "h-12", variant = 'full' }) => {
  const isWhite = variant === 'white';
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Das Logo-Icon mit minimalistischem Flaggen-Symbol */}
      <svg viewBox="0 0 100 100" className="h-full w-auto flex-shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Äußerer Kreis */}
        <circle cx="50" cy="50" r="48" fill={isWhite ? "white" : "#0f172a"} />
        
        {/* Minimalistische Deutschlandflagge als dezente Balkenform */}
        <g transform="translate(0, 2)">
          {/* Schwarz */}
          <rect x="32" y="38" width="36" height="6" rx="1" fill={isWhite ? "#000000" : "#000000"} />
          {/* Rot */}
          <rect x="32" y="47" width="36" height="6" rx="1" fill="#DD0000" />
          {/* Gold */}
          <rect x="32" y="56" width="36" height="6" rx="1" fill="#FFCE00" />
        </g>
        
        {/* Dezente Rahmen-Akzente für Tiefe (optional) */}
        <circle cx="50" cy="50" r="46" stroke={isWhite ? "#f1f5f9" : "white"} strokeWidth="0.5" strokeOpacity="0.2" />
      </svg>
      
      {variant === 'full' && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-baseline gap-1">
            <span className={`text-xl font-black tracking-tighter ${isWhite ? "text-white" : "text-[#3b82f6]"}`}>
              BLAUES
            </span>
            <span className={`text-xl font-light tracking-tighter ${isWhite ? "text-white/80" : "text-slate-400"}`}>
              ECHO
            </span>
          </div>
          <span className={`text-[7px] font-bold uppercase tracking-[0.2em] ${isWhite ? "text-white/60" : "text-slate-500"}`}>
            Ideen & Perspektiven
          </span>
        </div>
      )}
    </div>
  );
};

export default BlauesEchoLogo;
