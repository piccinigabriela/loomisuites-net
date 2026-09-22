import React, { useState } from 'react';

interface XeniaAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showStatus?: boolean;
  className?: string;
  customSrc?: string;
}

// Curated high quality portraits for Xenia
export const XENIA_PORTRAIT_PRESETS = [
  {
    id: 'xenia-oficial',
    label: 'Xenia Oficial (Foto de Perfil)',
    url: '/xenia.jpeg',
  },
  {
    id: 'concierge-warm',
    label: 'Concierge Cálida (Original)',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'reception-friendly',
    label: 'Hospitality Manager Sonriente',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'host-professional',
    label: 'Anfitriona Profesional',
    url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'lodging-specialist',
    label: 'Especialista en Alojamientos',
    url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80',
  },
];

const LOCAL_STORAGE_KEY = 'loomi_xenia_avatar_url';

export const getStoredXeniaAvatar = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) return saved;
  }
  return XENIA_PORTRAIT_PRESETS[0].url;
};

export const setStoredXeniaAvatar = (url: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, url);
    window.dispatchEvent(new Event('xenia-avatar-changed'));
  }
};

export const XeniaAvatar: React.FC<XeniaAvatarProps> = ({
  size = 'md',
  showStatus = true,
  className = '',
  customSrc,
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(() => customSrc || getStoredXeniaAvatar());
  const [imgError, setImgError] = useState(false);

  React.useEffect(() => {
    if (customSrc) {
      setCurrentSrc(customSrc);
      return;
    }

    const handler = () => {
      setCurrentSrc(getStoredXeniaAvatar());
      setImgError(false);
    };

    window.addEventListener('xenia-avatar-changed', handler);
    return () => window.removeEventListener('xenia-avatar-changed', handler);
  }, [customSrc]);

  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    '2xl': 'w-24 h-24',
  };

  const activeUrl = currentSrc || XENIA_PORTRAIT_PRESETS[0].url;

  const handleImageError = () => {
    if (activeUrl === '/xenia.jpeg' || activeUrl === 'xenia.jpeg') {
      // Automatic fallback to Unsplash photo which represents Xenia's exact appearance in the photo
      setCurrentSrc('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');
    } else {
      setImgError(true);
    }
  };

  return (
    <div className={`relative inline-block shrink-0 select-none ${className}`}>
      <div
        className={`${sizeMap[size]} rounded-full overflow-hidden border border-[#c4774a]/40 shadow-xs bg-[#24201c] flex items-center justify-center`}
      >
        {!imgError ? (
          <img
            src={activeUrl}
            alt="Xenia - Copiloto de Hospitalidad"
            referrerPolicy="no-referrer"
            onError={handleImageError}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="w-full h-full bg-[#3d2e24] text-[#f4f2ee] font-bold flex items-center justify-center text-xs">
            X
          </div>
        )}
      </div>
      {showStatus && (
        <span
          className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#82ba8f] ring-2 ring-[#161616]"
          title="Xenia Conectada 24/7"
        />
      )}
    </div>
  );
};
