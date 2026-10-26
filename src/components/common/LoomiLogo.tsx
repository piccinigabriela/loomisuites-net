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
      <div className={`${iconSizes[size]} shrink-0`}>
        <svg viewBox="0 0 1000 1000" className="w-full h-full" aria-hidden="true">
          <rect width="1000" height="1000" rx="220" fill="#0B0F17" />
          <path d="M 809.3 385 A 330 330 0 1 1 612.9 189.9" fill="none" stroke="#EFECE5" strokeWidth="110" strokeLinecap="round" />
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
