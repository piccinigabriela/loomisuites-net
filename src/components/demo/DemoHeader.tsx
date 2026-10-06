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
    <div className="bg-[#18181B] dark:bg-[#0C0D0F] text-white border-b border-[#222328] sticky top-0 z-40 font-sans">
      {/* Top Demo Banner */}
      <div className="bg-[#E1500A] px-4 py-1.5 text-xs text-white flex flex-wrap items-center justify-between gap-2 font-mono">
        <div className="flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-none bg-white animate-ping shrink-0" />
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Modo Demo Interactiva en Vivo: Cualquier cambio se guarda en tu memoria local
          </span>
        </div>
        <div className="flex items-center gap-3">
          {onToggleEmployeeMode && (
            <button
              onClick={onToggleEmployeeMode}
              className={`px-2.5 py-0.5 rounded-none text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                isEmployeeMode
                  ? 'bg-white text-[#18181B] ring-1 ring-white shadow-xs'
                  : 'bg-black/30 hover:bg-black/50 text-white border border-white/30'
              }`}
              title="Alternar entre vista de Dueño/Administrador y Modo Empleado Día a Día"
            >
              {isEmployeeMode ? <UserCheck className="w-3 h-3 text-[#18181B]" /> : <Shield className="w-3 h-3 text-white" />}
              <span>{isEmployeeMode ? 'Modo Día a Día' : 'Vista Dueño'}</span>
            </button>
          )}
          <span className="text-white/40">|</span>
          <button
            onClick={onResetData}
            className="hover:underline text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
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
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#DCD8CE] hover:text-white bg-[#222328] hover:bg-[#2E3036] px-3 py-1.5 rounded-none transition-colors cursor-pointer border border-[#3A3C44]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Volver a la Landing</span>
          </button>

          <div className="h-6 w-px bg-[#222328] hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-none bg-[#E1500A] flex items-center justify-center text-white font-bold text-sm shadow-2xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-black text-white tracking-tight uppercase">
                Loomi <span className="text-[#E1500A]">Suite</span> Demo
              </span>
              <p className="text-[10px] text-[#8E8E93] font-mono leading-none hidden sm:block uppercase">
                Cabañas • Departamentos • B&B • Hostales
              </p>
            </div>
          </div>

          {/* Property Complex / Tier Presets Switcher */}
          <div className="hidden lg:flex items-center bg-[#141518] p-1 rounded-xl border border-[#222328] ml-2 gap-1">
            <button
              onClick={() => onSwitchComplex('woodcabin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                activeComplex === 'woodcabin'
                  ? 'bg-[#E1500A] text-white shadow-xs'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
              title="Plan Inicial: Cabañas & Anfitriones (5 a 10 unidades • $45.000 ARS)"
            >
              <span>🏡 Cabañas & Glampings</span>
              <span className="text-[10px] opacity-75 font-mono">(5-10u • $45k)</span>
            </button>

            <button
              onClick={() => onSwitchComplex('catalinas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                activeComplex === 'catalinas'
                  ? 'bg-[#E1500A] text-white shadow-xs'
                  : 'text-[#8E8E93] hover:text-white'
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
                className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 bg-emerald-700 text-white shadow-xs cursor-pointer"
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
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white bg-[#222328] hover:bg-[#2E3036] active:scale-98 px-3 py-2 rounded-none shadow-2xs transition-all cursor-pointer border border-[#3A3C44]"
              title="Cargar mis departamentos reales paso a paso"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E1500A]" />
              <span className="hidden sm:inline">Cargar Mis Departamentos</span>
              <span className="inline sm:hidden">Mis Deptos</span>
            </button>
          )}

          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 sm:px-3 py-2 rounded-none bg-[#222328] hover:bg-[#2E3036] text-[#DCD8CE] border border-[#3A3C44] transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#E1500A]" />
              )}
              <span className="hidden sm:inline">
                {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
              </span>
            </button>
          )}

          <button
            onClick={onOpenNewReservation}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white bg-[#E1500A] hover:bg-[#C44307] active:scale-98 px-3 sm:px-3.5 py-2 rounded-none shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">+ Nueva Reserva</span>
            <span className="inline xs:hidden sm:hidden">+ Reserva</span>
          </button>

          <button
            onClick={onOpenContactModal}
            className="hidden md:flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#18181B] bg-white hover:bg-[#F4F2EE] px-3.5 py-2 rounded-none transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E1500A]" />
            <span>Activar Loomi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
