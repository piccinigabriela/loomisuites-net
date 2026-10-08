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
  onSwitchComplex: (complex: 'catalinas' | 'woodcabin' | 'custom') => void;
  activeComplex: 'catalinas' | 'woodcabin' | 'custom';
  currentTab: string;
  isEmployeeMode?: boolean;
  onToggleEmployeeMode?: () => void;
  onOpenGuideWith?: (subTab: 'landing-booking' | 'guest-view' | 'admin-view', template?: LandingTemplate) => void;
  onOpenOnboardingWizard?: () => void;
  onRequestPlan?: () => void;
  onOpenLookbookDossier?: () => void;
}

export const DemoPlanFunctionalBar: React.FC<DemoPlanFunctionalBarProps> = ({
  onSelectTab,
  onSwitchComplex,
  activeComplex,
  currentTab,
  isEmployeeMode = false,
  onToggleEmployeeMode,
  onOpenGuideWith,
  onOpenOnboardingWizard,
  onRequestPlan,
  onOpenLookbookDossier,
}) => {
  const [activePlan, setActivePlan] = useState<'inicial' | 'escala'>('inicial');
  const isSignature = false;

  return (
    <div className="mb-6 rounded-2xl sm:rounded-3xl border shadow-xl p-4 sm:p-5 transition-all duration-300 font-sans relative overflow-hidden bg-[#18191E] text-stone-100 border-[#2B2D35]">
      {/* Background Subtle Tone */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16 bg-[#C85A17]/5" />

      {/* Top Banner: Real PMS Command Center Explanation with Realistic Desktop Dashboard Mockup */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 pb-4 border-b items-center border-white/10">
        {/* Left Column (lg:col-span-7): PMS Identity & Explanation */}
        <div className="lg:col-span-7 space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border shadow-xs bg-stone-800/90 text-stone-300 border-stone-700/60">
              <Activity className="w-3 h-3 text-[#E1500A]" />
              SISTEMA DE GESTIÓN OPERATIVO (PMS)
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono border bg-stone-900 text-stone-400 border-stone-800">
              <MonitorCheck className="w-3 h-3 text-emerald-400/80" />
              Software en tu PC & Móvil
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-base sm:text-xl font-bold tracking-tight flex items-center gap-2">
              <LayoutDashboard
                className={`w-5 h-5 shrink-0 ${isSignature ? 'text-[#D4AF37]' : 'text-[#E1500A]'}`}
              />
              <span className={isSignature ? 'text-[#F5EFE6]' : 'text-white'}>
                {isSignature ? 'Centro Operativo Signature (Luxury & Bodegas)' : 'Panel Operativo del Sistema (PMS)'}
              </span>
            </h2>
            <p className={`text-xs leading-relaxed ${isSignature ? 'text-[#CEC3B2]' : 'text-stone-300'}`}>
              <strong>Estás en tu centro de trabajo diario:</strong> esta interfaz es el software real donde administrás el calendario iCal, asignás limpiezas a mucamas y registrás cobros.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
            <div
              className={`border rounded-lg p-2 flex items-start gap-2 transition-colors ${
                isSignature ? 'bg-[#0D1828] border-[#223855]' : 'bg-[#121316] border-stone-800'
              }`}
            >
              <Calendar className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isSignature ? 'text-[#DFD6C9]' : 'text-stone-400'}`} />
              <div>
                <p className={`font-semibold ${isSignature ? 'text-[#F5EFE6]' : 'text-stone-200'}`}>Calendario iCal</p>
                <p className={`text-[10px] ${isSignature ? 'text-[#A0B0C8]' : 'text-stone-400'}`}>Sincronización total</p>
              </div>
            </div>

            <div
              className={`border rounded-lg p-2 flex items-start gap-2 transition-colors ${
                isSignature ? 'bg-[#0D1828] border-[#223855]' : 'bg-[#121316] border-stone-800'
              }`}
            >
              <DollarSign className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isSignature ? 'text-[#DFD6C9]' : 'text-stone-400'}`} />
              <div>
                <p className={`font-semibold ${isSignature ? 'text-[#F5EFE6]' : 'text-stone-200'}`}>Caja & Cobros</p>
                <p className={`text-[10px] ${isSignature ? 'text-[#A0B0C8]' : 'text-stone-400'}`}>Señas y arqueos</p>
              </div>
            </div>

            <div
              className={`border rounded-lg p-2 flex items-start gap-2 transition-colors ${
                isSignature ? 'bg-[#0D1828] border-[#223855]' : 'bg-[#121316] border-stone-800'
              }`}
            >
              <Smartphone className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isSignature ? 'text-[#DFD6C9]' : 'text-stone-400'}`} />
              <div>
                <p className={`font-semibold ${isSignature ? 'text-[#F5EFE6]' : 'text-stone-200'}`}>
                  {isSignature ? 'Portal VIP & QR' : 'App Mucamas & QR'}
                </p>
                <p className={`text-[10px] ${isSignature ? 'text-[#A0B0C8]' : 'text-stone-400'}`}>
                  {isSignature ? 'Catas y bienvenida' : 'Guía y sábanas'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (lg:col-span-5): Visual Dashboard Screenshot / Window Mockup */}
        <div className="lg:col-span-5">
          <div
            className={`rounded-xl border shadow-lg overflow-hidden transition-colors ${
              isSignature ? 'bg-[#0A1320] border-[#253D5F]' : 'bg-[#111216] border-stone-700/60'
            }`}
          >
            {/* Window Chrome Header */}
            <div
              className={`px-3 py-1.5 border-b flex items-center justify-between text-[11px] font-mono transition-colors ${
                isSignature ? 'bg-[#101D30] border-[#223855] text-[#A0B3CC]' : 'bg-[#18191E] border-stone-800 text-stone-400'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-stone-500" />
                <div className="w-2 h-2 rounded-full bg-stone-500" />
                <div className="w-2 h-2 rounded-full bg-stone-500" />
                <span className={`text-[10px] ml-1 ${isSignature ? 'text-[#EDE7DE]' : 'text-stone-300'}`}>
                  {isSignature ? 'signature.loomi-pms.app/corte-delle-vette' : 'loomi-pms.app/panel'}
                </span>
              </div>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  isSignature ? 'bg-[#162A46] text-[#E0D4C3] border border-[#2B476F]' : 'bg-stone-800 text-stone-300'
                }`}
              >
                {isSignature ? 'SIGNATURE LIVE' : 'OPERATIVO'}
              </span>
            </div>

            {/* Realistic Mini Dashboard UI Mockup */}
            <div className={`p-3 space-y-2 text-xs ${isSignature ? 'bg-[#0A1320]' : 'bg-[#111216]'}`}>
              {/* Top mini summary bar */}
              <div
                className={`flex items-center justify-between gap-2 border-b pb-2 ${
                  isSignature ? 'border-[#1C2F4A]' : 'border-stone-800'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] border ${
                      isSignature
                        ? 'bg-[#162A46] text-[#E5DACD] border-[#2F4E7A]'
                        : 'bg-stone-800 text-stone-200 border-stone-700'
                    }`}
                  >
                    {isSignature ? 'S' : 'L'}
                  </div>
                  <div>
                    <p className={`text-[11px] font-semibold leading-tight ${isSignature ? 'text-[#FAF6F0]' : 'text-white'}`}>
                      {isSignature
                        ? 'Corte delle Vette (Bodega & Lodge)'
                        : activeComplex === 'woodcabin'
                        ? 'Cabañas del Bosque'
                        : activeComplex === 'catalinas'
                        ? 'Catalinas Suites'
                        : 'Mi Complejo'}
                    </p>
                    <p className={`text-[9px] ${isSignature ? 'text-[#96A7BD]' : 'text-stone-400'}`}>
                      {isSignature ? 'Colección Signature • 12 Suites' : '8 Unidades Activas'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[11px] font-mono font-bold ${isSignature ? 'text-[#E5DACD]' : 'text-stone-200'}`}>
                    {isSignature ? '94.0% Ocupación' : '87.5% Ocupación'}
                  </span>
                  <p className={`text-[9px] ${isSignature ? 'text-[#96A7BD]' : 'text-stone-400'}`}>
                    {isSignature ? 'Tarifa VIP' : 'Temporada Alta'}
                  </p>
                </div>
              </div>

              {/* Mini Status Grid */}
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div
                  className={`rounded p-1.5 border ${
                    isSignature ? 'bg-[#0E1A2C] border-[#1E3352]' : 'bg-stone-900/80 border-stone-800'
                  }`}
                >
                  <span className={`text-[9px] block ${isSignature ? 'text-[#90A3BE]' : 'text-stone-400'}`}>
                    {isSignature ? 'Check-ins VIP' : 'Check-ins'}
                  </span>
                  <span className={`text-xs font-mono font-bold ${isSignature ? 'text-[#F5EFE6]' : 'text-white'}`}>
                    {isSignature ? '6 Huéspedes' : '4 Huéspedes'}
                  </span>
                </div>
                <div
                  className={`rounded p-1.5 border ${
                    isSignature ? 'bg-[#0E1A2C] border-[#1E3352]' : 'bg-stone-900/80 border-stone-800'
                  }`}
                >
                  <span className={`text-[9px] block ${isSignature ? 'text-[#90A3BE]' : 'text-stone-400'}`}>
                    {isSignature ? 'Catas / Vinos' : 'Limpiezas'}
                  </span>
                  <span className={`text-xs font-mono font-bold ${isSignature ? 'text-[#DFD6C9]' : 'text-stone-200'}`}>
                    {isSignature ? '3 Reservadas' : '2 Pendientes'}
                  </span>
                </div>
                <div
                  className={`rounded p-1.5 border ${
                    isSignature ? 'bg-[#0E1A2C] border-[#1E3352]' : 'bg-stone-900/80 border-stone-800'
                  }`}
                >
                  <span className={`text-[9px] block ${isSignature ? 'text-[#90A3BE]' : 'text-stone-400'}`}>Caja</span>
                  <span className={`text-xs font-mono font-bold ${isSignature ? 'text-[#DFD6C9]' : 'text-stone-200'}`}>
                    {isSignature ? '$890.000' : '$340.000'}
                  </span>
                </div>
              </div>

              {/* Action buttons inside mockup */}
              <div className="pt-1 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectTab('overview')}
                  className={`flex-1 py-1 rounded text-[10px] font-bold text-center transition-colors cursor-pointer ${
                    isSignature
                      ? 'bg-[#C8B69B] hover:bg-[#BFA98B] text-[#0A1320]'
                      : 'bg-[#E1500A] hover:bg-[#C94305] text-white'
                  }`}
                >
                  Abrir Panel Completo
                </button>
                {onOpenOnboardingWizard && (
                  <button
                    onClick={onOpenOnboardingWizard}
                    className={`flex-1 py-1 rounded text-[10px] font-bold text-center transition-colors cursor-pointer border ${
                      isSignature
                        ? 'bg-[#13233A] hover:bg-[#1B2F4E] text-[#DFD6C9] border-[#25416A]'
                        : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
                    }`}
                  >
                    Cargar Mis Cabañas
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle: 3 Plan Interactive Presets Selector */}
      <div className="relative z-10 pt-4 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#EFECE5]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#E1500A]" />
            <span>Seleccioná el escenario para activar sus funciones reales en este sistema:</span>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#0F1013] rounded-2xl border border-white/10">
            <button
              onClick={() => setActivePlan('inicial')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activePlan === 'inicial'
                  ? 'bg-[#E1500A] text-white shadow-md'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <span>🏡 Inicial (5-10u)</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                activePlan === 'inicial' ? 'bg-black/30 text-white' : 'bg-white/10 text-stone-300'
              }`}>
                $45k
              </span>
            </button>

            <button
              onClick={() => setActivePlan('escala')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activePlan === 'escala'
                  ? 'bg-[#E1500A] text-white shadow-md'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>🏢 Escala (15-20u)</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                activePlan === 'escala' ? 'bg-black/30 text-white' : 'bg-white/10 text-stone-300'
              }`}>
                $60k
              </span>
            </button>
          </div>
        </div>

        {/* Dynamic Detail Card for the Active Plan */}
        <div className="mt-3">
          
          {/* 1. PLAN INICIAL */}
          {activePlan === 'inicial' && (
            <div className="bg-[#202229] rounded-2xl p-4 border border-emerald-500/30 space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono text-[10px] font-bold uppercase border border-emerald-500/30">
                      Plan Inicial • 5 a 10 Cabañas / Anfitriones
                    </span>
                    <span className="text-xs font-mono font-black text-[#FF7A38]">
                      $45.000 ARS / mes (~30 USD)
                    </span>
                  </div>
                  <p className="text-xs text-[#D1D1D6] mt-1 max-w-2xl leading-relaxed">
                    <strong>Herramientas clave activas:</strong> Guía Móvil QR para el huésped (Wi-Fi, mapa de llegada y reglas), cálculo automático de seña del 50% por CBU y sincronización iCal con Airbnb/Booking.
                  </p>
                </div>

                {/* Direct Trigger Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onSwitchComplex('woodcabin');
                      if (onOpenGuideWith) {
                        onOpenGuideWith('guest-view', 'retrato');
                      } else {
                        onSelectTab('welcome-guide');
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer active:scale-98"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>1. Probar Guía Móvil QR & Wi-Fi Huésped</span>
                  </button>

                  <button
                    onClick={() => {
                      onSwitchComplex('woodcabin');
                      onSelectTab('calendar');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#0F1013] hover:bg-black text-white text-xs font-black border border-white/20 transition-all flex items-center gap-1.5 shadow-md cursor-pointer active:scale-98"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#FF7A38]" />
                    <span>2. Probar Calendario iCal</span>
                  </button>

                  <button
                    onClick={() => {
                      onSwitchComplex('woodcabin');
                      if (onOpenGuideWith) {
                        onOpenGuideWith('landing-booking', 'retrato');
                      } else {
                        onSelectTab('welcome-guide');
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                    <span>3. Probar Motor Directo (Retrato/Bay)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. PLAN ESCALA */}
          {activePlan === 'escala' && (
            <div className="bg-[#202229] rounded-2xl p-4 border border-blue-500/30 space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-mono text-[10px] font-bold uppercase border border-blue-500/30">
                      Plan Escala • 15 a 20 Unidades con Personal
                    </span>
                    <span className="text-xs font-mono font-black text-[#FF7A38]">
                      $60.000 ARS / mes (~40 USD)
                    </span>
                  </div>
                  <p className="text-xs text-[#D1D1D6] mt-1 max-w-2xl leading-relaxed">
                    <strong>Herramientas clave activas:</strong> App Móvil para Mucamas (sábanas y limpieza en tiempo real), Caja Diaria & Arqueo por turno y modo empleado sin acceso a números de facturación.
                  </p>
                </div>

                {/* Direct Trigger Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onSwitchComplex('catalinas');
                      onSelectTab('housekeeping');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer active:scale-98"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>1. Probar App Móvil de Mucamas</span>
                  </button>

                  <button
                    onClick={() => {
                      onSwitchComplex('catalinas');
                      onSelectTab('overview');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#0F1013] hover:bg-black text-white text-xs font-black border border-white/20 transition-all flex items-center gap-1.5 shadow-md cursor-pointer active:scale-98"
                  >
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>2. Probar Caja Diaria & Cobros</span>
                  </button>

                  {onToggleEmployeeMode && (
                    <button
                      onClick={onToggleEmployeeMode}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border cursor-pointer active:scale-98 ${
                        isEmployeeMode
                          ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                          : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5 text-[#FF7A38]" />
                      <span>{isEmployeeMode ? 'Volver a Modo Dueño' : '3. Probar Modo Empleado (Sin Finanzas)'}</span>
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
