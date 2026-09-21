import React from 'react';
import { Building2, Sparkles, Play, ShieldCheck, MessageSquare, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  onOpenDemo: () => void;
  onOpenContact: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDemo, onOpenContact, theme = 'light', onToggleTheme }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-['Outfit']">
                Loomi <span className="text-rose-600">Suite</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Demo Activa
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden md:block">
              Cabañas • Bed & Breakfasts • Hostales • Posadas
            </p>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          <a href="#preguntas-clave" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            ¿Qué hacemos?
          </a>
          <a href="#preguntas-clave" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            ¿Esto es para vos?
          </a>
          <a href="#preguntas-clave" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            ¿Qué problema te resuelve?
          </a>
          <a href="#preguntas-clave" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            Precios
          </a>
          <a href="#canales" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            Canales OTA
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border border-transparent dark:border-zinc-700"
              title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-600" />
              )}
            </button>
          )}

          <button
            id="btn-nav-contact"
            onClick={onOpenContact}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Hablar con un Asesor</span>
          </button>

          <button
            id="btn-nav-open-demo"
            onClick={onOpenDemo}
            className="flex items-center gap-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-98 px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-xl shadow-md shadow-rose-600/25 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Probar Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};

