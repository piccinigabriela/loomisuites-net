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
} from 'lucide-react';

interface DemoHeaderProps {
  onBackToLanding: () => void;
  onResetData: () => void;
  onOpenNewReservation: () => void;
  onOpenJsonModal: () => void;
  onOpenContactModal: () => void;
  onOpenOnboardingWizard?: () => void;
  activeComplex: 'catalinas' | 'woodcabin' | 'custom';
  onSwitchComplex: (complex: 'catalinas' | 'woodcabin' | 'custom') => void;
  isEmployeeMode?: boolean;
  onToggleEmployeeMode?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const DemoHeader: React.FC<DemoHeaderProps> = ({
  onBackToLanding,
  onResetData,
  onOpenNewReservation,
  onOpenJsonModal,
  onOpenContactModal,
  onOpenOnboardingWizard,
  activeComplex,
  onSwitchComplex,
  isEmployeeMode = false,
  onToggleEmployeeMode,
  theme = 'light',
  onToggleTheme,
}) => {
  return (
    <div className="bg-[#18191E] dark:bg-[#0C0D0F] text-white border-b border-stone-800 dark:border-zinc-800 sticky top-0 z-40 font-sans">
      {/* Top Demo Banner */}
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

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand + Back */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-300 hover:text-white bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl transition-colors cursor-pointer border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Volver a la Landing</span>
          </button>

          <div className="h-6 w-px bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E67E22] flex items-center justify-center text-white font-bold text-sm shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-tight">
                Loomi <span className="text-[#E67E22]">Suite</span>
              </span>
              <p className="text-[11px] text-stone-400 font-medium leading-none hidden sm:block">
                Cabañas • Departamentos • B&B • Hostales
              </p>
            </div>
          </div>

          {/* Property Complex / Tier Presets Switcher */}
          <div className="hidden lg:flex items-center bg-stone-900/80 p-1 rounded-xl border border-stone-800 ml-2 gap-1">
            <button
              onClick={() => onSwitchComplex('woodcabin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeComplex === 'woodcabin'
                  ? 'bg-[#E67E22] text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="Plan Inicial: Cabañas & Anfitriones (5 a 10 unidades • $45.000 ARS)"
            >
              <span>🏡 Cabañas & Glampings</span>
              <span className="text-[10px] opacity-75 font-mono">(5-10u • $45k)</span>
            </button>

            <button
              onClick={() => onSwitchComplex('catalinas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeComplex === 'catalinas'
                  ? 'bg-[#E67E22] text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="Plan Escala: Complejos con Personal & Limpieza (15 a 20 unidades • $60.000 ARS)"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Complejos & Aparts</span>
              <span className="text-[10px] opacity-75 font-mono">(15-20u • $60k)</span>
            </button>

            {activeComplex === 'custom' && (
              <button
                onClick={() => onSwitchComplex('custom')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 bg-emerald-700 text-white shadow-xs cursor-pointer"
              >
                <span>✨ Mi Complejo Real</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {onOpenOnboardingWizard && (
            <button
              onClick={onOpenOnboardingWizard}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-xl transition-all cursor-pointer border border-white/10"
              title="Cargar mis departamentos reales paso a paso"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E67E22]" />
              <span className="hidden sm:inline">Cargar Mis Unidades</span>
              <span className="inline sm:hidden">Mis Deptos</span>
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

          <button
            onClick={onOpenContactModal}
            className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-stone-900 bg-white hover:bg-stone-100 px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E67E22]" />
            <span>Activar Loomi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
