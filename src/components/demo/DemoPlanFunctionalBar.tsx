import React, { useState } from 'react';
import {
  Sparkles,
  Smartphone,
  Calendar,
  CheckCircle2,
  DollarSign,
  Shield,
  Crown,
  Building2,
  Globe,
  Wine,
  ArrowRight,
  LayoutDashboard,
  Activity,
  SlidersHorizontal,
  MonitorCheck,
  Laptop,
  Check,
  RefreshCw,
  Bell,
  Lock,
} from 'lucide-react';

import { LandingTemplate } from '../booking/DirectBookingLanding';

interface DemoPlanFunctionalBarProps {
  onSelectTab: (tab: string) => void;
  currentTab: string;
  isEmployeeMode?: boolean;
  onToggleEmployeeMode?: () => void;
  onOpenGuideWith?: (subTab: 'landing-booking' | 'guest-view' | 'admin-view', template?: LandingTemplate) => void;
  onOpenOnboardingWizard?: () => void;
  onRequestPlan?: () => void;
  onDismiss?: () => void;
}

export const DemoPlanFunctionalBar: React.FC<DemoPlanFunctionalBarProps> = ({
  onSelectTab,
  currentTab,
  isEmployeeMode = false,
  onToggleEmployeeMode,
  onOpenGuideWith,
  onOpenOnboardingWizard,
  onRequestPlan,
  onDismiss,
}) => {
  const [activePlan, setActivePlan] = useState<'inicial' | 'escala'>('inicial');

  return (
    <div className="mb-6 rounded-2xl sm:rounded-3xl border shadow-[0_4px_16px_rgba(0,0,0,0.02)] p-4 sm:p-5 transition-all duration-300 font-sans relative overflow-hidden bg-white dark:bg-[#18191E] text-stone-800 dark:text-stone-100 border-stone-200/70 dark:border-zinc-800/70">
      {/* Background Subtle Tone */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16 bg-[#E67E22]/5" />

      {/* Dismiss / Close button if onDismiss is provided */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-3.5 right-3.5 z-20 flex items-center gap-1 text-[11px] font-medium text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 bg-stone-100/70 dark:bg-zinc-800/70 hover:bg-stone-200/80 dark:hover:bg-zinc-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer border border-stone-200/60 dark:border-zinc-700/60"
          title="Ocultar esta barra de demostración"
        >
          <span>Ocultar guía demo</span>
          <span className="font-bold">✕</span>
        </button>
      )}

      {/* Top Banner: Real PMS Command Center Explanation with Realistic Desktop Dashboard Mockup */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 pb-4 border-b items-center border-stone-200/70 dark:border-zinc-800/70">
        {/* Left Column (lg:col-span-7): PMS Identity & Explanation */}
        <div className="lg:col-span-7 space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border bg-stone-100/80 dark:bg-zinc-800/80 text-stone-600 dark:text-stone-300 border-stone-200/70 dark:border-zinc-700/70">
              <Activity className="w-3 h-3 text-[#E67E22]" />
              SISTEMA DE GESTIÓN OPERATIVO (PMS)
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono border bg-stone-50 dark:bg-zinc-900 text-stone-600 dark:text-stone-300 border-stone-200/60 dark:border-zinc-800">
              <MonitorCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              Software en tu PC & Móvil
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-base sm:text-xl font-bold tracking-tight flex items-center gap-2 text-stone-900 dark:text-stone-100">
              <LayoutDashboard
                className="w-5 h-5 shrink-0 text-[#E67E22]"
              />
              <span>Panel Operativo del Sistema (PMS)</span>
            </h2>
            <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-300 font-normal">
              <strong>Estás en tu centro de trabajo diario:</strong> esta interfaz es el software real donde administrás el calendario iCal, asignás limpiezas a mucamas y registrás cobros.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
            <div className="border rounded-xl p-2.5 flex items-start gap-2 transition-colors bg-[#FAF9F6] dark:bg-[#15161A] border-stone-200/70 dark:border-zinc-800">
              <Calendar className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#E67E22]" />
              <div>
                <p className="font-semibold text-stone-800 dark:text-stone-200">Calendario iCal</p>
                <p className="text-[10px] text-stone-600 dark:text-stone-400">Sincronización total</p>
              </div>
            </div>

            <div className="border rounded-xl p-2.5 flex items-start gap-2 transition-colors bg-[#FAF9F6] dark:bg-[#15161A] border-stone-200/70 dark:border-zinc-800">
              <DollarSign className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-semibold text-stone-800 dark:text-stone-200">Caja & Cobros</p>
                <p className="text-[10px] text-stone-600 dark:text-stone-400">Señas y arqueos</p>
              </div>
            </div>

            <div className="border rounded-xl p-2.5 flex items-start gap-2 transition-colors bg-[#FAF9F6] dark:bg-[#15161A] border-stone-200/70 dark:border-zinc-800">
              <Smartphone className="w-3.5 h-3.5 shrink-0 mt-0.5 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="font-semibold text-stone-800 dark:text-stone-200">App Mucamas & QR</p>
                <p className="text-[10px] text-stone-600 dark:text-stone-400">Guía y sábanas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (lg:col-span-5): Visual Dashboard Screenshot / Window Mockup */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border shadow-xs overflow-hidden transition-colors bg-stone-50 dark:bg-[#111216] border-stone-200/80 dark:border-zinc-800">
            {/* Window Chrome Header */}
            <div className="px-3 py-1.5 border-b flex items-center justify-between text-[11px] font-mono transition-colors bg-white dark:bg-[#18191E] border-stone-200/70 dark:border-zinc-800 text-stone-400">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-600" />
                <div className="w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-600" />
                <div className="w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-600" />
                <span className="text-[10px] ml-1 text-stone-500 dark:text-stone-400">
                  loomi-pms.app/panel
                </span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold bg-orange-50 dark:bg-orange-950/40 text-[#E67E22] border border-orange-200/40">
                OPERATIVO
              </span>
            </div>

            {/* Realistic Mini Dashboard UI Mockup */}
            <div className="p-3 space-y-2 text-xs bg-white dark:bg-[#111216]">
              {/* Top mini summary bar */}
              <div className="flex items-center justify-between gap-2 border-b border-stone-100 dark:border-zinc-800 pb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] bg-orange-50 dark:bg-orange-950/40 text-[#E67E22] border border-orange-200/50">
                    L
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-stone-800 dark:text-stone-200 leading-tight">
                      Mi complejo
                    </p>
                    <p className="text-[10px] text-stone-400">
                      4 Cabañas Activas
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono font-bold text-[#E67E22]">
                    75% Ocupación
                  </span>
                  <p className="text-[10px] text-stone-400">
                    En Tiempo Real
                  </p>
                </div>
              </div>

              {/* Mini Status Grid */}
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="rounded-lg p-1.5 border bg-stone-50/70 dark:bg-zinc-800/40 border-stone-200/60 dark:border-zinc-700/60">
                  <span className="text-[9px] block text-stone-400">
                    Check-ins
                  </span>
                  <span className="text-xs font-mono font-bold text-stone-800 dark:text-stone-200">
                    2 Huéspedes
                  </span>
                </div>
                <div className="rounded-lg p-1.5 border bg-stone-50/70 dark:bg-zinc-800/40 border-stone-200/60 dark:border-zinc-700/60">
                  <span className="text-[9px] block text-stone-400">
                    Limpiezas
                  </span>
                  <span className="text-xs font-mono font-bold text-stone-800 dark:text-stone-200">
                    3 Tareas
                  </span>
                </div>
                <div className="rounded-lg p-1.5 border bg-stone-50/70 dark:bg-zinc-800/40 border-stone-200/60 dark:border-zinc-700/60">
                  <span className="text-[9px] block text-stone-400">Caja</span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    $340.000
                  </span>
                </div>
              </div>

              {/* Action buttons inside mockup */}
              <div className="pt-1 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectTab('overview')}
                  className="flex-1 py-1.5 rounded-lg text-[10px] font-bold text-center transition-colors cursor-pointer bg-[#E67E22] hover:bg-[#d36d16] text-white"
                >
                  Abrir Panel Completo
                </button>
                {onOpenOnboardingWizard && (
                  <button
                    onClick={onOpenOnboardingWizard}
                    className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold text-center transition-colors cursor-pointer border bg-stone-50 dark:bg-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-700 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-zinc-700"
                  >
                    Cargar Mis Unidades
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Plan Interactive Presets Selector */}
      <div className="relative z-10 pt-4 pb-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-700 dark:text-stone-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#E67E22]" />
            <span>Seleccioná el escenario para activar sus funciones reales en este sistema:</span>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-stone-100/80 dark:bg-zinc-800/60 rounded-xl border border-stone-200/80 dark:border-zinc-700/80">
            <button
              onClick={() => setActivePlan('inicial')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activePlan === 'inicial'
                  ? 'bg-white dark:bg-zinc-700 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <span>🏡 Loomi (Hasta 5u)</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                activePlan === 'inicial' ? 'bg-orange-50 text-[#E67E22]' : 'bg-stone-200/60 dark:bg-zinc-600 text-stone-600 dark:text-stone-300'
              }`}>
                $45k
              </span>
            </button>

            <button
              onClick={() => setActivePlan('escala')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activePlan === 'escala'
                  ? 'bg-white dark:bg-zinc-700 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>🏢 Loomi Suite (Full)</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                activePlan === 'escala' ? 'bg-orange-50 text-[#E67E22]' : 'bg-stone-200/60 dark:bg-zinc-600 text-stone-600 dark:text-stone-300'
              }`}>
                $60k
              </span>
            </button>
          </div>
        </div>

        {/* Dynamic Detail Card for the Active Plan */}
        <div className="mt-2">
          {/* 1. PLAN LOOMI */}
          {activePlan === 'inicial' && (
            <div className="bg-[#FAF9F6] dark:bg-[#15161A] rounded-2xl p-4 border border-emerald-200/60 dark:border-emerald-900/40 space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold uppercase border border-emerald-200/60">
                      Plan Propietario • Loomi
                    </span>
                    <span className="text-xs font-mono font-bold text-[#E67E22]">
                      $45.000 ARS / mes
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 max-w-2xl leading-relaxed font-medium">
                    <strong>Ideado para dueños de 4 a 10 unidades sin personal:</strong> Calendario Rack (Modo Light móvil), gestión de reservas directas y rendimiento básico. Sin cobro por habitación.
                  </p>
                </div>

                {/* Direct Trigger Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      if (onOpenGuideWith) {
                        onOpenGuideWith('guest-view', 'retrato');
                      } else {
                        onSelectTab('welcome-guide');
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>1. Probar Guía Móvil QR & Wi-Fi Huésped</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectTab('calendar');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#E67E22]" />
                    <span>2. Probar Calendario iCal</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onOpenGuideWith) {
                        onOpenGuideWith('landing-booking', 'retrato');
                      } else {
                        onSelectTab('welcome-guide');
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-700 text-stone-700 dark:text-stone-200 text-xs font-semibold border border-stone-200 dark:border-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    <span>3. Probar Motor Directo</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. PLAN LOOMI SUITE */}
          {activePlan === 'escala' && (
            <div className="bg-[#FAF9F6] dark:bg-[#15161A] rounded-2xl p-4 border border-blue-200/60 dark:border-blue-900/40 space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold uppercase border border-blue-200/60">
                      Plan Complejo • Loomi Suite
                    </span>
                    <span className="text-xs font-mono font-bold text-[#E67E22]">
                      $60.000 ARS / mes
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 max-w-2xl leading-relaxed font-medium">
                    <strong>Ecosistema ilimitado para todo el complejo:</strong> Módulo Housekeeping en vivo para mucamas, modo recepción multisuario, asistente Xenia AI 24/7 y Portal de Bienvenida del Huésped.
                  </p>
                </div>

                {/* Direct Trigger Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onSelectTab('housekeeping');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>1. Probar App Móvil de Mucamas</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectTab('overview');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>2. Probar Caja Diaria & Cobros</span>
                  </button>

                  {onToggleEmployeeMode && (
                    <button
                      onClick={onToggleEmployeeMode}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border cursor-pointer ${
                        isEmployeeMode
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-white dark:bg-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-700 text-stone-700 dark:text-stone-200 border-stone-200 dark:border-zinc-700'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5 text-[#E67E22]" />
                      <span>{isEmployeeMode ? 'Volver a Modo Dueño' : '3. Probar Modo Empleado'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
