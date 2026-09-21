import React from 'react';

interface XeniaAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  className?: string;
}

export const XeniaAvatar: React.FC<XeniaAvatarProps> = ({
  size = 'md',
  showStatus = true,
  className = '',
}) => {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  // High quality curated portrait matching the warm brunette concierge hospitality avatar
  const avatarUrl =
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80';

  return (
    <div className={`relative inline-block shrink-0 select-none ${className}`}>
      <div
        className={`${sizeMap[size]} rounded-full overflow-hidden border border-[#c4774a]/40 shadow-xs bg-[#24201c]`}
      >
        <img
          src={avatarUrl}
          alt="Xenia - Copiloto de Hospitalidad"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />
      </div>
      {showStatus && (
        <span
          className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#82ba8f] ring-2 ring-[#161616]"
          title="Xenia Conectada"
        />
      )}
    </div>
  );
};
