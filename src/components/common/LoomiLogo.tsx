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
            ? 'bg-[#18181B] border border-[#27272A] shadow-inner'
            : 'bg-[#18181B] border border-[#27272A] shadow-sm'
        } flex items-center justify-center relative p-1.5 shrink-0`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Top Accent Orange dot */}
          <circle cx="16" cy="7.5" r="3.2" fill="#E1500A" />
          
          {/* Middle Alabaster & Orange pill bar */}
          <rect x="7" y="13.5" width="8" height="5" rx="2.5" fill="#EFECE5" />
          <rect x="17" y="13.5" width="8" height="5" rx="2.5" fill="#E1500A" />
          
          {/* Bottom Accent Orange dot */}
          <circle cx="16" cy="24.5" r="3.2" fill="#E1500A" />
        </svg>
      </div>

      {/* Typography: Geometric 'loomi' + rounded 'SUITE' pill */}
      {showText && (
        <div className="flex items-baseline gap-1.5">
          <span
            className={`font-black tracking-tight ${
              size === 'sm' ? 'text-base' : size === 'md' ? 'text-lg' : 'text-2xl'
            } ${isDark ? 'text-[#FAF7F2]' : 'text-[#18181B]'}`}
            style={{ fontWeight: 900 }}
          >
            loomi
          </span>
          <span
            className={`font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full text-[9px] ${
              isDark
                ? 'bg-[#27272A] text-[#E1500A] border border-[#3F3F46]'
                : 'bg-[#18181B] text-white border border-[#27272A]'
            }`}
          >
            SUITE
          </span>
        </div>
      )}
    </div>
  );
};
