import React from 'react';

interface MixxByYasLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | number;
  className?: string;
  showText?: boolean;
}

export const MixxByYasLogo: React.FC<MixxByYasLogoProps> = ({
  size = 'md',
  className = '',
  showText = true,
}) => {
  const getDimension = () => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'xs':
        return 20;
      case 'sm':
        return 32;
      case 'md':
        return 48;
      case 'lg':
        return 80;
      default:
        return 48;
    }
  };

  const dim = getDimension();
  // Width is roughly 1.5x the height for an oval shape
  const width = dim * 1.5;

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <svg
        viewBox="0 0 600 400"
        width={width}
        height={dim}
        className="shrink-0 drop-shadow-xs"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Oval (Dark Blue) */}
        <ellipse cx="300" cy="200" rx="280" ry="180" fill="#003580" />
        
        <g transform="translate(65, 110)">
          {/* Letters "mixx" in Yellow (Slanted/italic bold) */}
          {/* 'm' */}
          <path d="M 15 110 L 15 35 C 15 25, 25 18, 35 18 C 48 18, 55 28, 55 38 L 55 110" fill="none" stroke="#FFCC00" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 55 110 L 55 35 C 55 25, 65 18, 75 18 C 88 18, 95 28, 95 38 L 95 110" fill="none" stroke="#FFCC00" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="110" r="12" fill="#FFCC00" />
          <circle cx="52" cy="110" r="12" fill="#FFCC00" />
          <circle cx="92" cy="110" r="12" fill="#FFCC00" />

          {/* 'i' */}
          <g transform="translate(125, 0)">
            <rect x="0" y="25" width="22" height="85" rx="10" fill="#FFCC00" />
            <circle cx="11" cy="2" r="14" fill="#FFCC00" />
          </g>

          {/* first 'x' */}
          <g transform="translate(170, 20)">
            <line x1="5" y1="5" x2="65" y2="90" stroke="#FFCC00" strokeWidth="24" strokeLinecap="round" />
            <line x1="65" y1="5" x2="5" y2="90" stroke="#FFCC00" strokeWidth="24" strokeLinecap="round" />
          </g>

          {/* second 'x' */}
          <g transform="translate(255, 20)">
            <line x1="5" y1="5" x2="65" y2="90" stroke="#FFCC00" strokeWidth="24" strokeLinecap="round" />
            <line x1="65" y1="5" x2="5" y2="90" stroke="#FFCC00" strokeWidth="24" strokeLinecap="round" />
          </g>
        </g>

        {/* "By" Text in cursive/italic yellow */}
        <text x="405" y="278" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="28" fontWeight="900" fontStyle="italic" fill="#FFCC00">By</text>

        {/* "Yas" Yellow rounded speech-bubble/triangle */}
        <g transform="translate(445, 222)">
          <path d="M 25 5 C 10 5, 2 20, 5 35 C 10 50, 25 70, 50 75 C 75 78, 92 65, 92 50 C 92 25, 75 5, 25 5 Z" fill="#FFCC00" />
          {/* "yas" in dark blue inside bubble */}
          <text x="48" y="52" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="34" fontWeight="900" fontStyle="italic" fill="#003580" textAnchor="middle">yas</text>
        </g>
      </svg>
      {showText && size !== 'xs' && (
        <span className="text-xs font-black tracking-tight text-slate-700 block uppercase">Mixx by Yas</span>
      )}
    </div>
  );
};
