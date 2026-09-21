import React from 'react';

interface LoomiLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  theme?: 'dark' | 'light';
  className?: string;
}

export const LoomiLogo: React.FC<LoomiLogoProps> = ({
  size = 'md',
  showText = true,
  theme = 'dark',
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const isDark = theme === 'dark';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Exact Vector Emblem of Loomi Suite */}
      <div
        className={`${iconSizes[size]} rounded-xl ${
          isDark
            ? 'bg-[#1c1a17] border border-[#383028] shadow-inner'
            : 'bg-[#22201d] border border-[#443c32] shadow-sm'
        } flex items-center justify-center relative p-1.5 shrink-0`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Top Peach/Terracotta dot */}
          <circle cx="16" cy="7.5" r="3.2" fill="#d9916e" />
          
          {/* Middle Sage green pill bar (split/solid) */}
          <rect x="7" y="13.5" width="8" height="5" rx="2.5" fill="#8ea689" />
          <rect x="17" y="13.5" width="8" height="5" rx="2.5" fill="#688063" />
          
          {/* Bottom Warm Terracotta dot */}
          <circle cx="16" cy="24.5" r="3.2" fill="#c46d45" />
        </svg>
      </div>

      {/* Typography: Serif/Grotesk 'loomi' + rounded 'SUITE' pill */}
      {showText && (
        <div className="flex items-baseline gap-1.5">
          <span
            className={`font-black tracking-tight ${
              size === 'sm' ? 'text-base' : size === 'md' ? 'text-lg' : 'text-2xl'
            } ${isDark ? 'text-[#f4f2ee]' : 'text-[#242b20]'} font-serif`}
            style={{ fontFamily: 'Georgia, serif', fontWeight: 900 }}
          >
            loomi
          </span>
          <span
            className={`font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full text-[9px] ${
              isDark
                ? 'bg-[#263024] text-[#a5c49f] border border-[#364832]'
                : 'bg-[#e4eedf] text-[#3d5936] border border-[#c6dcb7]'
            }`}
          >
            SUITE
          </span>
        </div>
      )}
    </div>
  );
};
