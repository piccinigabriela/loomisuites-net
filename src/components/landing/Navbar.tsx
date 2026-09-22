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
    <header className="sticky top-0 z-40 w-full bg-[#fbf9f5]/95 dark:bg-[#161616]/95 backdrop-blur-md border-b border-[#e8e4dc] dark:border-[#282828] shadow-2xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <LoomiLogo size="md" theme={isDark ? 'dark' : 'light'} />
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold bg-[#edf4ed] dark:bg-[#1f2b20] text-[#3e6645] dark:text-[#a4cca8] px-2.5 py-0.5 rounded-full border border-[#d2e4d2] dark:border-[#344836]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5a9c65] animate-pulse"></span>
            loomisuite.net
          </span>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-[#66625a] dark:text-[#a8a5a0]">
          <a href="#preguntas-clave" className="hover:text-[#1c1b18] dark:hover:text-[#f4f2ee] transition-colors">
            ¿Qué hacemos?
          </a>
          <a href="#preguntas-clave" className="hover:text-[#1c1b18] dark:hover:text-[#f4f2ee] transition-colors">
            ¿Esto es para vos?
          </a>
          <a href="#preguntas-clave" className="hover:text-[#1c1b18] dark:hover:text-[#f4f2ee] transition-colors">
            ¿Qué resuelve?
          </a>
          <a href="#preguntas-clave" className="hover:text-[#1c1b18] dark:hover:text-[#f4f2ee] transition-colors">
            Precios
          </a>
          <a href="#canales" className="hover:text-[#1c1b18] dark:hover:text-[#f4f2ee] transition-colors">
            Canales OTA
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-[#66625a] dark:text-[#a8a5a0] hover:bg-[#edeae2] dark:hover:bg-[#262626] border border-[#ded9cd] dark:border-[#333] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden md:inline text-[11px] text-[#e0deda]">Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-[#66625a]" />
                  <span className="hidden md:inline text-[11px] text-[#55514a]">Modo Oscuro</span>
                </>
              )}
            </button>
          )}

          {onOpenLogin && (
            <button
              id="btn-nav-login"
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 text-xs font-bold text-[#1c1b18] dark:text-[#f4f2ee] px-3 py-2 rounded-xl hover:bg-[#edeae2] dark:hover:bg-[#262626] border border-[#ded9cd] dark:border-[#333] transition-all cursor-pointer shadow-2xs"
            >
              <Lock className="w-3.5 h-3.5 text-[#c46d45] dark:text-[#d88d5e]" />
              <span>Ingresar</span>
            </button>
          )}

          <button
            id="btn-nav-contact"
            onClick={onOpenContact}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#44403a] dark:text-[#d0cdc8] hover:text-[#1c1b18] dark:hover:text-[#ffffff] px-3 py-2 rounded-xl hover:bg-[#edeae2] dark:hover:bg-[#262626] border border-transparent hover:border-[#ded9cd] dark:hover:border-[#333] transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-[#4f7858] dark:text-[#78b37e]" />
            <span>Hablar con un Asesor</span>
          </button>

          <button
            id="btn-nav-open-demo"
            onClick={onOpenDemo}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white bg-[#c46d45] hover:bg-[#b85e35] active:scale-98 px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-xl shadow-md shadow-[#c46d45]/20 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Probar Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};


