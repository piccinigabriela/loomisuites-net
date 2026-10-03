import React from 'react';
import { Play, MessageSquare, Sun, Moon, LogIn, Lock } from 'lucide-react';
import { LoomiLogo } from '../common/LoomiLogo';

interface NavbarProps {
  onOpenDemo: () => void;
  onOpenContact: () => void;
  onOpenLogin?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDemo,
  onOpenContact,
  onOpenLogin,
  theme = 'light',
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#EAE8E3]/95 dark:bg-[#0C0D0F]/95 backdrop-blur-md border-b border-[#D4D0C5] dark:border-[#222328] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <LoomiLogo size="md" theme={isDark ? 'dark' : 'light'} />
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold bg-transparent text-[#18181B] dark:text-[#EFECE5] px-2 py-0.5 border border-[#D4D0C5] dark:border-[#222328]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E1500A] animate-pulse"></span>
            loomisuite.net
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white border border-[#D4D0C5] dark:border-[#222328] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#E1500A]" />
                  <span className="hidden md:inline text-[11px] text-[#EFECE5]">Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#18181B]" />
                  <span className="hidden md:inline text-[11px] text-[#18181B]">Oscuro</span>
                </>
              )}
            </button>
          )}

          {onOpenLogin && (
            <button
              id="btn-nav-login"
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 text-xs font-bold text-[#18181B] dark:text-[#EFECE5] px-3.5 py-1.5 border border-[#D4D0C5] dark:border-[#222328] hover:bg-[#18181B] hover:text-white dark:hover:bg-white dark:hover:text-[#18181B] transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-[#E1500A]" />
              <span>Ingresar</span>
            </button>
          )}

          <button
            id="btn-nav-contact"
            onClick={onOpenContact}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-white px-3 py-1.5 border border-[#D4D0C5] dark:border-[#222328] transition-all cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#E1500A]" />
            <span>Hablar con un Asesor</span>
          </button>

          <button
            id="btn-nav-open-demo"
            onClick={onOpenDemo}
            className="flex items-center gap-1.5 text-xs font-black text-white bg-[#E1500A] hover:bg-[#C94305] active:scale-98 px-4 sm:px-5 py-1.5 transition-all cursor-pointer"
          >
            <Play className="w-3 h-3 fill-white" />
            <span>Probar Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};


