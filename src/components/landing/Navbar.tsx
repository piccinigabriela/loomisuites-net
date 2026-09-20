import React from 'react';
import { Building2, Sparkles, Play, ShieldCheck, MessageSquare } from 'lucide-react';

interface NavbarProps {
  onOpenDemo: () => void;
  onOpenContact: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDemo, onOpenContact }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-zinc-900 font-['Outfit']">
                Loomi <span className="text-rose-600">Suite</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Demo Activa
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 hidden md:block">
              Cabañas • Bed & Breakfasts • Hostales • Posadas
            </p>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-zinc-600">
          <a href="#preguntas-clave" className="hover:text-zinc-900 transition-colors">
            ¿Qué hacemos?
          </a>
          <a href="#preguntas-clave" className="hover:text-zinc-900 transition-colors">
            ¿Esto es para vos?
          </a>
          <a href="#preguntas-clave" className="hover:text-zinc-900 transition-colors">
            ¿Qué problema te resuelve?
          </a>
          <a href="#preguntas-clave" className="hover:text-zinc-900 transition-colors">
            Precios
          </a>
          <a href="#canales" className="hover:text-zinc-900 transition-colors">
            Canales OTA
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            id="btn-nav-contact"
            onClick={onOpenContact}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-900 px-3 py-2 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Hablar con un Asesor</span>
          </button>

          <button
            id="btn-nav-open-demo"
            onClick={onOpenDemo}
            className="flex items-center gap-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-98 px-4.5 py-2.5 rounded-xl shadow-md shadow-rose-600/25 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Probar Demo en Vivo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
