import React from 'react';
import {
  Building2,
  RotateCcw,
  Plus,
  ArrowLeft,
  FileJson,
  CheckCircle2,
  Sparkles,
  UserCheck,
  Shield,
  EyeOff,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
} from 'lucide-react';

interface DemoHeaderProps {
  onBackToLanding: () => void;
  onResetData: () => void;
  onOpenNewReservation: () => void;
  onOpenJsonModal: () => void;
  onOpenContactModal: () => void;
  onOpenOnboardingWizard?: () => void;
  isEmployeeMode?: boolean;
  onToggleEmployeeMode?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  isAppMode?: boolean;
  currentUser?: any;
  onSignOut?: () => void;
  complexName?: string;
}

export const DemoHeader: React.FC<DemoHeaderProps> = ({
  onBackToLanding,
  onResetData,
  onOpenNewReservation,
  onOpenJsonModal,
  onOpenContactModal,
  onOpenOnboardingWizard,
  isEmployeeMode = false,
  onToggleEmployeeMode,
  theme = 'light',
  onToggleTheme,
  isAppMode = false,
  currentUser,
  onSignOut,
  complexName = 'Mi complejo',
}) => {
  return (
    <div className="bg-[#18191E] dark:bg-[#0C0D0F] text-white border-b border-stone-800 dark:border-zinc-800 sticky top-0 z-40 font-sans">
      {/* Top Demo Banner: Only shown in demo mode, hidden in App mode */}
      {!isAppMode && (
        <div className="bg-[#E67E22] px-4 py-1.5 text-xs text-white flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
            <span className="text-xs font-semibold tracking-wide">
              Modo Demo Interactiva en Vivo • Cualquier cambio se guarda en tu memoria local
            </span>
          </div>
          <div className="flex items-center gap-3">
            {onToggleEmployeeMode && (
              <button
                onClick={onToggleEmployeeMode}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isEmployeeMode
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'bg-black/25 hover:bg-black/40 text-white border border-white/25'
                }`}
                title="Alternar entre vista de Dueño/Administrador y Modo Empleado Día a Día"
              >
                {isEmployeeMode ? <UserCheck className="w-3.5 h-3.5 text-stone-900" /> : <Shield className="w-3.5 h-3.5 text-white" />}
                <span>{isEmployeeMode ? 'Modo Día a Día' : 'Vista Dueño'}</span>
              </button>
            )}
            <span className="text-white/40">|</span>
            <button
              onClick={onResetData}
              className="hover:underline text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer Datos</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand + Back */}
        <div className="flex items-center gap-4">
          {!isAppMode && (
            <>
              <button
                onClick={onBackToLanding}
                className="flex items-center gap-1.5 text-xs font-semibold text-stone-300 hover:text-white bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl transition-colors cursor-pointer border border-white/10"
                title="Volver a la landing"
              >
                <span>← Inicio</span>
              </button>

              <div className="h-6 w-px bg-white/10 hidden sm:block" />
            </>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E67E22] flex items-center justify-center text-white font-bold text-sm shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">
                  Loomi <span className="text-[#E67E22]">Suite</span>
                </span>
                {isAppMode && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    App
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400 font-medium leading-none hidden sm:block">
                {isAppMode
                  ? currentUser?.email || complexName
                  : `${complexName} • Puerto Iguazú`}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {onOpenOnboardingWizard && (
            <button
              onClick={onOpenOnboardingWizard}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-xl transition-all cursor-pointer border border-white/10"
              title="Configurar unidades y complejo paso a paso"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E67E22]" />
              <span className="hidden sm:inline">Configurar Complejo</span>
              <span className="inline sm:hidden">Configurar</span>
            </button>
          )}

          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 border border-white/10 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#E67E22]" />
              )}
              <span className="hidden sm:inline">
                {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
              </span>
            </button>
          )}

          <button
            onClick={onOpenNewReservation}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#E67E22] hover:bg-[#d36d16] px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">+ Nueva Reserva</span>
            <span className="inline xs:hidden sm:hidden">+ Reserva</span>
          </button>

          {!isAppMode && (
            <button
              onClick={onOpenContactModal}
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-stone-900 bg-white hover:bg-stone-100 px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E67E22]" />
              <span>Activar Loomi</span>
            </button>
          )}

          {/* Botón Cerrar Sesión en Modo App */}
          {isAppMode && onSignOut && (
            <button
              onClick={onSignOut}
              className="flex items-center gap-1.5 text-xs font-semibold text-stone-300 hover:text-white bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl transition-colors cursor-pointer border border-white/10"
              title="Cerrar sesión en Loomi Suite"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
