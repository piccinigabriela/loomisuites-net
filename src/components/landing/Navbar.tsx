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
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#121316]/90 backdrop-blur-md border-b border-gray-100 dark:border-white/5 transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-2">
          <span className="text-xl font-light tracking-widest text-gray-800 dark:text-gray-100">
            loomi<span className="font-semibold text-[#E67E22]">suite</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4 sm:space-x-6 text-xs font-medium text-gray-500 dark:text-gray-400">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors cursor-pointer flex items-center gap-1.5"
              title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#E67E22]" />
                  <span className="hidden md:inline text-xs">Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-gray-500" />
                  <span className="hidden md:inline text-xs">Modo Oscuro</span>
                </>
              )}
            </button>
          )}

          {onOpenLogin && (
            <button
              id="btn-nav-login"
              onClick={onOpenLogin}
              className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              Ingresar
            </button>
          )}

          <button
            id="btn-nav-contact"
            onClick={onOpenContact}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer hidden sm:inline"
          >
            Hablar con un Asesor
          </button>

          <button
            id="btn-nav-open-demo"
            onClick={onOpenDemo}
            className="bg-[#E67E22]/10 text-[#E67E22] px-4 py-2 rounded-xl font-semibold hover:bg-[#E67E22]/20 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            Probar Demo
          </button>
        </div>
      </div>
    </header>
  );
};


