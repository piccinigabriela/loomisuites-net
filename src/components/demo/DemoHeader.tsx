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
    <div className="bg-[#1c1b18] text-white border-b border-[#2e2a25] sticky top-0 z-40">
      {/* Top Demo Banner */}
      <div className="bg-gradient-to-r from-[#c46d45] to-[#a87848] px-4 py-1.5 text-xs text-white flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
          <span>
            <strong>Modo Demo Interactiva en Vivo:</strong> Cualquier cambio (reservas, limpiezas, tarifas) se guarda en tu <code>localStorage</code>.
          </span>
        </div>
        <div className="flex items-center gap-3">
          {onToggleEmployeeMode && (
            <button
              onClick={onToggleEmployeeMode}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isEmployeeMode
                  ? 'bg-amber-300 text-stone-950 ring-2 ring-white shadow-xs'
                  : 'bg-black/30 hover:bg-black/50 text-white border border-white/30'
              }`}
              title="Alternar entre vista de Dueño/Administrador y Modo Empleado Día a Día"
            >
              {isEmployeeMode ? <UserCheck className="w-3 h-3 text-stone-950" /> : <Shield className="w-3 h-3 text-emerald-300" />}
              <span>{isEmployeeMode ? 'Modo Día a Día (Empleado Activo)' : 'Vista Dueño (Finanzas Visibles)'}</span>
            </button>
          )}
          <span className="text-white/40">|</span>
          <button
            onClick={onOpenJsonModal}
            className="hover:underline text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Importar / Exportar Datos</span>
          </button>
          <span className="text-white/40">|</span>
          <button
            onClick={onResetData}
            className="hover:underline text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer Datos de Muestra</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand + Back */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#ded9cd] hover:text-white bg-[#2a2622] hover:bg-[#38332d] px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-[#3f3932]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Volver a la Landing</span>
          </button>

          <div className="h-6 w-px bg-[#3f3932] hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c46d45] flex items-center justify-center text-white font-bold text-sm shadow-2xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-tight">
                Loomi <span className="text-[#d88d5e]">Suite</span> Demo
              </span>
              <p className="text-[10px] text-[#a8a39b] leading-none hidden sm:block">
                Cabañas • Departamentos • B&B • Hostales
              </p>
            </div>
          </div>

          {/* Property Complex Switcher */}
          <div className="hidden md:flex items-center bg-[#25221e] p-1 rounded-xl border border-[#3a352e] ml-2">
            <button
              onClick={() => onSwitchComplex('catalinas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeComplex === 'catalinas'
                  ? 'bg-[#c46d45] text-white shadow-xs'
                  : 'text-[#a8a39b] hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Catalinas Apartamentos</span>
              <span className="text-[10px] opacity-80 font-normal">(4 Deptos CABA)</span>
            </button>
            <button
              onClick={() => onSwitchComplex('woodcabin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeComplex === 'woodcabin'
                  ? 'bg-[#8d5637] text-white shadow-xs'
                  : 'text-[#a8a39b] hover:text-white'
              }`}
            >
              <span>🌲 Wood Cabin</span>
              <span className="text-[10px] opacity-80 font-normal">(Iguazú)</span>
            </button>
            {activeComplex === 'custom' && (
              <button
                onClick={() => onSwitchComplex('custom')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 bg-[#3e6645] text-white shadow-xs cursor-pointer"
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
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#8d5637] hover:bg-[#a16441] active:scale-98 px-3 py-2 rounded-lg shadow-2xs transition-all cursor-pointer border border-[#b87850]/40"
              title="Cargar mis departamentos reales paso a paso"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#e2b896]" />
              <span className="hidden sm:inline">Cargar Mis Departamentos</span>
              <span className="inline sm:hidden">Mis Deptos</span>
            </button>
          )}

          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-lg bg-[#2a2622] hover:bg-[#38332d] text-[#ded9cd] border border-[#3f3932] transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#d88d5e]" />
              )}
              <span className="hidden sm:inline">
                {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
              </span>
            </button>
          )}

          <button
            onClick={onOpenNewReservation}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#c46d45] hover:bg-[#b55e37] active:scale-98 px-3 sm:px-3.5 py-2 rounded-lg shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">+ Nueva Reserva</span>
            <span className="inline xs:hidden sm:hidden">+ Reserva</span>
          </button>

          <button
            onClick={onOpenContactModal}
            className="hidden md:flex items-center gap-1.5 text-xs font-bold text-white bg-[#3e6645] hover:bg-[#34563a] px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#b3dbb8]" />
            <span>Activar Loomi Suite</span>
          </button>
        </div>
      </div>
    </div>
  );
};
