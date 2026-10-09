import React from 'react';

interface LemaLogoProps {
  variant?: 'full' | 'horizontal' | 'icon' | 'badge';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  theme?: 'dark' | 'light' | 'auto';
  className?: string;
  showSlogan?: boolean;
}

export const LemaLogo: React.FC<LemaLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  theme = 'auto',
  className = '',
  showSlogan = true,
}) => {
  // Resolve numeric dimensions
  const getDimension = () => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'xs':
        return 24;
      case 'sm':
        return 32;
      case 'md':
        return 44;
      case 'lg':
        return 64;
      case 'xl':
        return 96;
      default:
        return 44;
    }
  };

  const dim = getDimension();

  // Emblem Component (The 3D Letter 'L', Wi-Fi Waves & Orbital Swoosh)
  const renderEmblem = (emblemSize: number) => (
    <svg
      viewBox="0 0 400 400"
      width={emblemSize}
      height={emblemSize}
      className="shrink-0 drop-shadow-sm select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="emblemWifiBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D2FF" />
          <stop offset="50%" stopColor="#0084FF" />
          <stop offset="100%" stopColor="#0044FF" />
        </linearGradient>

        <linearGradient id="emblemSwoosh" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00F0FF" />
          <stop offset="45%" stopColor="#0088FF" />
          <stop offset="100%" stopColor="#0044FF" />
        </linearGradient>

        <linearGradient id="emblemLetterL" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#F1F5F9" />
          <stop offset="80%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>

        <filter id="emblemGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0066ff" floodOpacity="0.35" />
        </filter>
      </defs>

      <g transform="translate(200, 200)">
        {/* 1. Orbiting Swoosh Crescent */}
        <path
          d="M -180 30 C -220 -20, -170 -100, -80 -140 C -120 -90, -150 -10, -110 40 C -60 100, 40 115, 130 70 C 175 45, 195 15, 195 15 C 195 15, 150 75, 75 98 C -15 120, -120 90, -180 30 Z"
          fill="url(#emblemSwoosh)"
          filter="url(#emblemGlow)"
        />

        {/* 2. Wi-Fi Signal Waves (Top-Right) */}
        <g transform="translate(48, -55)" filter="url(#emblemGlow)">
          <path
            d="M -95 -45 A 120 120 0 0 1 95 -45"
            fill="none"
            stroke="url(#emblemWifiBlue)"
            strokeWidth="24"
            strokeLinecap="round"
          />
          <path
            d="M -65 -15 A 82 82 0 0 1 65 -15"
            fill="none"
            stroke="url(#emblemWifiBlue)"
            strokeWidth="22"
            strokeLinecap="round"
          />
          <path
            d="M -38 15 A 46 46 0 0 1 38 15"
            fill="none"
            stroke="url(#emblemWifiBlue)"
            strokeWidth="20"
            strokeLinecap="round"
          />
          <circle cx="0" cy="48" r="18" fill="url(#emblemWifiBlue)" />
        </g>

        {/* 3. The 3D Metallic Letter 'L' */}
        <g filter="url(#emblemGlow)">
          {/* Shadow Facet */}
          <path
            d="M -145 -125 L -75 -125 L -35 45 L 60 45 L 50 95 L -175 95 Z"
            fill="#475569"
            opacity="0.35"
            transform="translate(4, 5)"
          />

          {/* Front Beveled Face */}
          <path
            d="M -145 -125 L -75 -125 L -35 45 L 60 45 L 50 95 L -175 95 Z"
            fill="url(#emblemLetterL)"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Gloss Highlight line */}
          <path
            d="M -145 -125 L -75 -125 L -115 45 L -35 45 L 60 45"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            opacity="0.8"
          />
        </g>

        {/* Dynamic Forefront Swoosh Arc Accent */}
        <path
          d="M -160 45 C -80 110, 60 110, 165 40 C 80 90, -60 90, -135 40 Z"
          fill="url(#emblemSwoosh)"
          opacity="0.9"
        />
      </g>
    </svg>
  );

  // 1. Variant: Icon Only
  if (variant === 'icon') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{renderEmblem(dim)}</div>;
  }

  // 2. Variant: Badge (Icon inside a styled glossy container)
  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-2xl bg-gradient-to-tr from-slate-900 via-sky-950 to-slate-900 border border-sky-500/30 shadow-lg shadow-sky-500/15 p-1.5 ${className}`}
        style={{ width: dim, height: dim }}
      >
        {renderEmblem(dim * 0.82)}
      </div>
    );
  }

  // Text color determinations based on theme
  const isLightMode = theme === 'light';
  const lemaTextColor = isLightMode ? 'text-slate-900' : 'text-white';
  const lemaTextStroke = isLightMode ? 'drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]' : 'drop-shadow-[0_2px_4px_rgba(0,102,255,0.25)]';
  const wifiTextColor = isLightMode ? 'text-slate-800' : 'text-slate-100';

  // 3. Variant: Horizontal (Emblem on left + Wordmark on right)
  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
        {renderEmblem(dim)}
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center tracking-wider">
            {/* LEMA */}
            <span
              className={`font-black italic tracking-widest uppercase relative ${lemaTextColor} ${lemaTextStroke}`}
              style={{ fontSize: Math.max(15, dim * 0.42), letterSpacing: '0.12em' }}
            >
              LEM
              <span className="relative inline-block">
                A
                {/* Blue triangle accent inside 'A' counter */}
                <span
                  className="absolute bottom-[35%] left-[28%] w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-[#0080FF]"
                  style={{ transform: 'translateX(-50%)' }}
                />
              </span>
            </span>
          </div>

          {/* FAST WiFi */}
          <div className="flex items-center gap-1.5 mt-0.5">
            {/* Speed trail bars */}
            <div className="flex flex-col gap-[2px] pr-0.5">
              <span className="w-2.5 h-[2px] bg-gradient-to-r from-transparent to-[#0099FF] rounded-full" />
              <span className="w-3.5 h-[2px] bg-[#0088FF] rounded-full" />
              <span className="w-2 h-[2px] bg-gradient-to-r from-transparent to-[#00A3FF] rounded-full" />
            </div>

            <span
              className="font-black italic text-transparent bg-clip-text bg-gradient-to-r from-[#0077FF] via-[#0099FF] to-[#00D2FF]"
              style={{ fontSize: Math.max(11, dim * 0.28), letterSpacing: '0.04em' }}
            >
              FAST
            </span>
            <span
              className={`font-extrabold tracking-wide ${wifiTextColor}`}
              style={{ fontSize: Math.max(11, dim * 0.28) }}
            >
              WiFi
            </span>
          </div>

          {showSlogan && dim >= 48 && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-3 h-[1px] bg-sky-500/50" />
              <span className="text-[8px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                Connecting you faster
              </span>
              <span className="w-3 h-[1px] bg-sky-500/50" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. Variant: Full / Stacked (Emblem on top, Wordmark below)
  return (
    <div className={`inline-flex flex-col items-center text-center select-none ${className}`}>
      {renderEmblem(dim)}
      <div className="mt-2 flex flex-col items-center">
        {/* LEMA */}
        <span
          className={`font-black italic tracking-widest uppercase relative ${lemaTextColor} ${lemaTextStroke}`}
          style={{ fontSize: Math.max(18, dim * 0.32), letterSpacing: '0.14em' }}
        >
          LEM
          <span className="relative inline-block">
            A
            <span
              className="absolute bottom-[35%] left-[28%] w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[6px] border-b-[#0080FF]"
              style={{ transform: 'translateX(-50%)' }}
            />
          </span>
        </span>

        {/* FAST WiFi */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="flex flex-col gap-[2px] pr-1">
            <span className="w-3 h-[2px] bg-gradient-to-r from-transparent to-[#0099FF] rounded-full" />
            <span className="w-4 h-[2px] bg-[#0088FF] rounded-full" />
            <span className="w-2.5 h-[2px] bg-gradient-to-r from-transparent to-[#00A3FF] rounded-full" />
          </div>
          <span
            className="font-black italic text-transparent bg-clip-text bg-gradient-to-r from-[#0077FF] via-[#0099FF] to-[#00D2FF]"
            style={{ fontSize: Math.max(13, dim * 0.22), letterSpacing: '0.04em' }}
          >
            FAST
          </span>
          <span
            className={`font-extrabold tracking-wide ${wifiTextColor}`}
            style={{ fontSize: Math.max(13, dim * 0.22) }}
          >
            WiFi
          </span>
        </div>

        {showSlogan && (
          <div className="flex items-center gap-2 mt-1.5">
            <span className="w-5 h-[1.5px] bg-sky-500/70" />
            <span className="text-[9px] font-bold tracking-[0.22em] text-slate-400 uppercase">
              Connecting You Faster
            </span>
            <span className="w-5 h-[1.5px] bg-sky-500/70" />
          </div>
        )}
      </div>
    </div>
  );
};
