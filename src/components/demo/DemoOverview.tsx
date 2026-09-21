import React from 'react';
import {
  DollarSign,
  TrendingUp,
  CalendarCheck,
  Sparkles,
  ArrowUpRight,
  Clock,
  KeyRound,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Bot,
  Compass,
  RotateCw,
} from 'lucide-react';
import { DemoState, Reservation, CleaningTask } from '../../types';
import { formatCurrency, formatDisplayDate, getRelativeDate } from '../../data/initialData';

interface DemoOverviewProps {
  demoState: DemoState;
  onSelectReservation: (res: Reservation) => void;
  onOpenNewReservation: () => void;
  onNavigateTab: (tab: string) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: CleaningTask['status']) => void;
  onQuickCheckIn: (resId: string) => void;
  onOpenOnboardingWizard?: () => void;
  isEmployeeMode?: boolean;
}

export const DemoOverview: React.FC<DemoOverviewProps> = ({
  demoState,
  onSelectReservation,
  onOpenNewReservation,
  onNavigateTab,
  onUpdateTaskStatus,
  onQuickCheckIn,
  onOpenOnboardingWizard,
  isEmployeeMode = false,
}) => {
  const today = getRelativeDate(0);

  // Metrics calculation
  const totalRevenue = demoState.reservations
    .filter((r) => r.status !== 'cancelled')
    .reduce((acc, r) => acc + r.totalAmount, 0);

  const todayCheckIns = demoState.reservations.filter(
    (r) => r.checkIn === today && r.status !== 'cancelled'
  );

  const todayCheckOuts = demoState.reservations.filter(
    (r) => r.checkOut === today && r.status !== 'cancelled'
  );

  const pendingCleanings = demoState.cleaningTasks.filter(
    (c) => c.status !== 'completed' && c.status !== 'inspected'
  );

  const platformCount = {
    airbnb: demoState.reservations.filter((r) => r.platform === 'airbnb').length,
    direct: demoState.reservations.filter((r) => r.platform === 'direct').length,
    booking: demoState.reservations.filter((r) => r.platform === 'booking').length,
    vrbo: demoState.reservations.filter((r) => r.platform === 'vrbo').length,
  };

  const getProperty = (propId: string) =>
    demoState.properties.find((p) => p.id === propId);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-[#1c1b18] dark:bg-[#141414] rounded-2xl p-6 text-white border border-[#2e2a25] dark:border-[#222] shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#d88d5e] mb-1">
            <span className="w-2 h-2 rounded-full bg-[#3e6645] dark:bg-[#78b37e]" />
            <span>Todos los canales sincronizados • Última sync: hace 12 seg</span>
          </div>
          <h2 className="text-2xl font-bold font-['Outfit']">¡Hola, Anfitrión!</h2>
          <p className="text-xs text-[#ded9cd] mt-1 max-w-xl">
            Hoy tienes <strong>{todayCheckIns.length} check-in</strong> programado y <strong>{todayCheckOuts.length} check-out</strong>. Todas las claves de cerradura y notificaciones automáticas están operativas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('xenia')}
            className="text-xs font-bold bg-[#c46d45] hover:bg-[#b55e37] text-white px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Bot className="w-4 h-4" />
            <span>Consultar con Xenia IA</span>
          </button>
          <button
            onClick={() => onNavigateTab('calendar')}
            className="text-xs font-bold bg-white text-[#1c1b18] hover:bg-[#f8f6f2] px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <span>Ver Calendario</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Onboarding Real Properties Banner */}
      {onOpenOnboardingWizard && (
        <div className="bg-[#24211d] rounded-2xl p-5 text-white border border-[#48372b] shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d88d5e] to-[#c46d45] flex items-center justify-center text-stone-950 font-bold shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">¿Quieres probar con tus departamentos reales?</h3>
                <span className="text-[10px] font-semibold bg-[#c46d45]/20 text-[#e2b896] px-2 py-0.5 rounded-full border border-[#c46d45]/40">
                  Onboarding Guiado (3 min)
                </span>
              </div>
              <p className="text-xs text-[#ded9cd] mt-0.5">
                Carga los nombres de tus unidades, precios y WiFi para ver tu operación real en el calendario y la guía de huéspedes.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenOnboardingWizard}
            className="w-full sm:w-auto text-xs font-bold bg-white text-[#1c1b18] hover:bg-[#f8f6f2] px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs shrink-0 active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-[#c46d45]" />
            <span>Configurar Mis Departamentos</span>
            <ChevronRight className="w-4 h-4 text-[#c46d45]" />
          </button>
        </div>
      )}

      {/* Xenia Quick Insight Bar */}
      <div className="bg-[#f4eee7] dark:bg-[#1e1b18] rounded-xl p-4 border border-[#e4d6c9] dark:border-[#48372b] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#c46d45] flex items-center justify-center text-white shrink-0 shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-[#1c1b18] dark:text-[#f4f2ee]">Xenia Copilot</span>
              <span className="text-[10px] font-semibold text-[#9c512a] dark:text-[#d88d5e] bg-[#f8f6f2] dark:bg-[#2c221a] px-2 py-0.5 rounded-full border border-[#ded9cd] dark:border-[#533928]">
                Rendición de Cuentas & Manual
              </span>
            </div>
            <p className="text-xs text-[#78746c] dark:text-[#8e8c87] mt-0.5">
              Pregúntale a Xenia cuánto ingresó este mes, qué saldos restan cobrar o cómo usar cualquier función de la plataforma.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('xenia')}
          className="text-xs font-bold text-[#c46d45] dark:text-[#d88d5e] hover:underline flex items-center gap-1 whitespace-nowrap cursor-pointer"
        >
          <span>Abrir Xenia</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Wood Cabin Welcome Guide & Landing Quick Bar */}
      <div className="bg-[#1c1b18] rounded-xl p-4 border border-[#3f3932] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#8d5637] flex items-center justify-center text-white shrink-0 font-extrabold shadow-xs">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-white">Guía de Bienvenida & Landing de Reservas Directas</span>
              <span className="text-[10px] font-semibold text-[#d88d5e] bg-[#c46d45]/20 px-2 py-0.5 rounded-full border border-[#c46d45]/30">
                Caso Real: Los Bananos Wood Cabin
              </span>
            </div>
            <p className="text-xs text-[#ded9cd] mt-0.5">
              Tus huéspedes tienen WiFi en 1 clic, modos de llegar, entradas a Cataratas y leña. Tú ahorras consultas repetitivas y cobras señas directas.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('welcome-guide')}
          className="text-xs font-bold bg-[#c46d45] hover:bg-[#b55e37] text-white px-3.5 py-1.5 rounded-lg flex items-center gap-1 whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
        >
          <span>Ver Guía & Admin</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {!isEmployeeMode ? (
          <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-5 border border-[#ded9cd] dark:border-[#2a2a2a] shadow-xs transition-colors">
            <div className="flex items-center justify-between text-[#78746c] dark:text-[#8e8c87] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Ingresos del Mes</span>
              <div className="w-8 h-8 rounded-lg bg-[#f8f6f2] dark:bg-[#252525] text-[#3e6645] dark:text-[#78b37e] flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#1c1b18] dark:text-[#f4f2ee] font-['Outfit']">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-[#3e6645] dark:text-[#78b37e] font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+24.5% respecto al mes anterior</span>
            </div>
          </div>
        ) : (
          <div className="bg-[#f4eee7] dark:bg-[#1e1b18] rounded-xl p-5 border border-[#e4d6c9] dark:border-[#48372b] shadow-xs">
            <div className="flex items-center justify-between text-[#9c512a] dark:text-[#d88d5e] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Modo Día a Día</span>
              <div className="w-8 h-8 rounded-lg bg-[#f8f6f2] dark:bg-[#28221c] text-[#c46d45] dark:text-[#d88d5e] flex items-center justify-center font-bold text-xs">
                👷
              </div>
            </div>
            <div className="text-lg font-extrabold text-[#1c1b18] dark:text-[#f4f2ee] font-['Outfit']">
              Operaciones & Huéspedes
            </div>
            <div className="mt-1 text-[11px] text-[#78746c] dark:text-[#8e8c87] font-medium">
              Datos financieros y tarifas confidenciales ocultos
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-5 border border-[#ded9cd] dark:border-[#2a2a2a] shadow-xs transition-colors">
          <div className="flex items-center justify-between text-[#78746c] dark:text-[#8e8c87] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Check-ins de Hoy</span>
            <div className="w-8 h-8 rounded-lg bg-[#f8f6f2] dark:bg-[#252525] text-[#4a7298] dark:text-[#7aa2c8] flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#1c1b18] dark:text-[#f4f2ee] font-['Outfit']">
            2 llegadas
          </div>
          <div className="mt-1 text-[11px] text-[#3e6645] dark:text-[#78b37e] font-medium">
            1 ya ingresado · 1 pendiente de llegada
          </div>
        </div>

        <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-5 border border-[#ded9cd] dark:border-[#2a2a2a] shadow-xs transition-colors">
          <div className="flex items-center justify-between text-[#78746c] dark:text-[#8e8c87] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Limpiezas Pendientes</span>
            <div className="w-8 h-8 rounded-lg bg-[#f4eee7] dark:bg-[#252525] text-[#c46d45] dark:text-[#d88d5e] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#c46d45] dark:text-[#d88d5e] font-['Outfit']">
            {pendingCleanings.length} tareas
          </div>
          <div className="mt-1 text-[11px] text-[#78746c] dark:text-[#8e8c87]">
            1 en progreso actualmente
          </div>
        </div>
      </div>
      {/* Main Row: Today's Arrivals/Departures + Cleanings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Today's Operations (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Check-ins Section */}
          <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#ded9cd] dark:border-[#2a2a2a] p-5 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3e6645] dark:bg-[#78b37e]" />
                <h3 className="text-sm font-bold text-[#1c1b18] dark:text-[#f4f2ee] uppercase tracking-wider">
                  Check-ins de Hoy ({todayCheckIns.length})
                </h3>
              </div>
              <span className="text-xs text-[#78746c] dark:text-[#8e8c87]">Auto-checkin activo</span>
            </div>

            {todayCheckIns.length === 0 ? (
              <p className="text-xs text-[#78746c] dark:text-[#8e8c87] py-4 text-center">No hay más check-ins programados para hoy.</p>
            ) : (
              <div className="space-y-3">
                {todayCheckIns.map((res) => {
                  const prop = getProperty(res.propertyId);
                  return (
                    <div
                      key={res.id}
                      className="p-4 rounded-xl border border-[#ded9cd] dark:border-[#2a2a2a] bg-[#f8f6f2] dark:bg-[#252525] hover:border-[#c46d45]/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={res.guestAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                          alt={res.guestName}
                          className="w-10 h-10 rounded-full object-cover border border-[#ded9cd] dark:border-[#383838] shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-[#1c1b18] dark:text-[#f4f2ee]">{res.guestName}</h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                res.platform === 'airbnb'
                                  ? 'bg-[#f4eee7] text-[#9c512a] dark:bg-[#33221a] dark:text-[#d88d5e]'
                                  : res.platform === 'booking'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                  : res.platform === 'direct'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                              }`}
                            >
                              {res.platform}
                            </span>
                            {res.platform === 'airbnb' && res.airbnbFeeMode === 'traditional_3' && (
                              <span className="text-[10px] font-extrabold bg-[#f4eee7] dark:bg-[#33221a] text-[#9c512a] dark:text-[#d88d5e] border border-[#e4d6c9] dark:border-[#4d3324] px-1.5 py-0.5 rounded-full">
                                Airbnb 3% tradicional
                              </span>
                            )}
                            {res.earlyCheckIn && (
                              <span className="text-[10px] font-extrabold bg-[#f8f6f2] dark:bg-[#332b24] text-[#9c512a] dark:text-[#d88d5e] border border-[#ded9cd] dark:border-[#4d3d30] px-1.5 py-0.5 rounded-full">
                                ⏰ Early Check-in (10hs)
                              </span>
                            )}
                            {res.customDiscountPercent ? (
                              <span className="text-[10px] font-bold bg-[#f4eee7] dark:bg-[#252525] text-[#3e6645] dark:text-[#78b37e] px-1.5 py-0.5 rounded-full border border-[#ded9cd] dark:border-[#383838]">
                                🏷️ {res.customDiscountPercent}% Desc.
                              </span>
                            ) : null}
                            {demoState.reservations.some(
                              (r) =>
                                r.id !== res.id &&
                                r.propertyId === res.propertyId &&
                                r.status !== 'cancelled' &&
                                r.checkOut === res.checkIn
                            ) && (
                              <span className="text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/80 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                <RotateCw className="w-2.5 h-2.5 text-amber-600 animate-spin-slow" />
                                <span>🔄 Recambio Hoy</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#78746c] dark:text-[#8e8c87]">
                            {prop?.name} • {res.nights} noches ({formatDisplayDate(res.checkIn)} - {formatDisplayDate(res.checkOut)})
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-[#78746c] dark:text-[#8e8c87] font-mono">
                            <KeyRound className="w-3.5 h-3.5 text-[#c46d45] dark:text-[#d88d5e]" />
                            <span>PIN Cerradura: <strong className="text-[#1c1b18] dark:text-[#f4f2ee]">{res.pinCode}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => onSelectReservation(res)}
                          className="text-xs font-semibold text-[#1c1b18] dark:text-[#f4f2ee] bg-white dark:bg-[#1c1c1c] hover:bg-[#f8f6f2] dark:hover:bg-[#282828] border border-[#ded9cd] dark:border-[#333] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Ver Detalle
                        </button>
                        {res.status === 'confirmed' && (
                          <button
                            onClick={() => onQuickCheckIn(res.id)}
                            className="text-xs font-bold text-white bg-[#3e6645] hover:bg-[#34563a] px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
                          >
                            Registrar Llegada
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Check-outs Section */}
          <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#ded9cd] dark:border-[#2a2a2a] p-5 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#c46d45]" />
                <h3 className="text-sm font-bold text-[#1c1b18] dark:text-[#f4f2ee] uppercase tracking-wider">
                  Check-outs de Hoy ({todayCheckOuts.length})
                </h3>
              </div>
              <span className="text-xs text-[#78746c] dark:text-[#8e8c87]">Límite estándar: 11:00 hs</span>
            </div>

            {todayCheckOuts.length === 0 ? (
              <p className="text-xs text-[#78746c] dark:text-[#8e8c87] py-3 text-center">No hay salidas programadas para hoy.</p>
            ) : (
              <div className="space-y-3">
                {todayCheckOuts.map((res) => {
                  const prop = getProperty(res.propertyId);
                  return (
                    <div
                      key={res.id}
                      className="p-4 rounded-xl border border-[#ded9cd] dark:border-[#2a2a2a] bg-[#f8f6f2] dark:bg-[#252525] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-[#1c1b18] dark:text-[#f4f2ee]">{res.guestName}</h4>
                          <span className="text-[10px] bg-[#ded9cd] dark:bg-[#333] text-[#1c1b18] dark:text-[#ded9cd] px-2 py-0.5 rounded-full font-semibold uppercase">
                            {res.platform}
                          </span>
                          {(res.lateCheckOut || res.specialNotes?.toLowerCase().includes('late')) && (
                            <span className="text-[10px] font-extrabold bg-[#f4eee7] dark:bg-[#332b24] text-[#9c512a] dark:text-[#d88d5e] border border-[#e4d6c9] dark:border-[#4d3d30] px-1.5 py-0.5 rounded-full">
                              ⏰ Late Check-out solicitado
                            </span>
                          )}
                          {demoState.reservations.some(
                            (r) =>
                              r.id !== res.id &&
                              r.propertyId === res.propertyId &&
                              r.status !== 'cancelled' &&
                              r.checkIn === res.checkOut
                          ) && (
                            <span className="text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/80 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                              <RotateCw className="w-2.5 h-2.5 text-amber-600 animate-spin-slow" />
                              <span>🔄 Entra huésped hoy</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#78746c] dark:text-[#8e8c87] mt-0.5">
                          {prop?.name}
                        </p>
                        {res.specialNotes && (
                          <p className="text-[11px] text-[#9c512a] dark:text-[#d88d5e] bg-[#f4eee7] dark:bg-[#2c221a] px-2 py-0.5 rounded mt-1 border border-[#e4d6c9] dark:border-[#533928]">
                            Nota: {res.specialNotes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => onSelectReservation(res)}
                          className="text-xs font-semibold text-[#1c1b18] dark:text-[#f4f2ee] bg-white dark:bg-[#1c1c1c] hover:bg-[#f8f6f2] dark:hover:bg-[#282828] border border-[#ded9cd] dark:border-[#333] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Ver Reserva
                        </button>
                        <button
                          onClick={() => onNavigateTab('housekeeping')}
                          className="text-xs font-bold text-[#9c512a] dark:text-[#d88d5e] bg-[#f4eee7] dark:bg-[#2c221a] hover:bg-[#ebdccf] dark:hover:bg-[#382b20] border border-[#e4d6c9] dark:border-[#533928] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Ver Limpieza
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Housekeeping status + Quick links (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Housekeeping Widget */}
          <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#ded9cd] dark:border-[#2a2a2a] p-5 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#1c1b18] dark:text-[#f4f2ee] uppercase tracking-wider">
                Equipo de Limpieza
              </h3>
              <button
                onClick={() => onNavigateTab('housekeeping')}
                className="text-xs font-bold text-[#c46d45] dark:text-[#d88d5e] hover:underline cursor-pointer"
              >
                Ver todas →
              </button>
            </div>

            <div className="space-y-3">
              {demoState.cleaningTasks.slice(0, 3).map((task) => {
                const prop = getProperty(task.propertyId);
                const completedItems = task.checklist.filter((c) => c.completed).length;
                const totalItems = task.checklist.length;

                return (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl border border-[#ded9cd] dark:border-[#2a2a2a] bg-[#f8f6f2] dark:bg-[#252525] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1c1b18] dark:text-[#f4f2ee] truncate max-w-[150px]">
                        {prop?.neighborhood || prop?.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          task.status === 'in_progress'
                            ? 'bg-[#f4eee7] dark:bg-[#332b24] text-[#9c512a] dark:text-[#d88d5e]'
                            : task.status === 'inspected'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200'
                            : 'bg-[#ded9cd] dark:bg-[#333] text-[#78746c] dark:text-[#a8a39b]'
                        }`}
                      >
                        {task.status === 'in_progress'
                          ? 'En progreso'
                          : task.status === 'inspected'
                          ? 'Listo'
                          : 'Pendiente'}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#78746c] dark:text-[#8e8c87] flex items-center justify-between">
                      <span>{task.cleanerName}</span>
                      <span>{task.scheduledTime}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-[#ded9cd] dark:bg-[#383838] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#3e6645] dark:bg-[#78b37e] h-full rounded-full transition-all"
                        style={{ width: `${(completedItems / totalItems) * 100}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-[#78746c] dark:text-[#8e8c87] text-right">
                      {completedItems}/{totalItems} tareas completadas
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Channel Share */}
          <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-[#ded9cd] dark:border-[#2a2a2a] p-5 shadow-xs transition-colors">
            <h3 className="text-sm font-bold text-[#1c1b18] dark:text-[#f4f2ee] uppercase tracking-wider mb-4">
              Canales de Venta Activos
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#f4eee7] dark:bg-[#25221e] border border-[#e4d6c9] dark:border-[#3a352e]">
                <span className="font-semibold text-[#9c512a] dark:text-[#d88d5e]">Airbnb</span>
                <span className="text-[#1c1b18] dark:text-[#ded9cd] font-bold">{platformCount.airbnb} reservas</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 dark:bg-[#1e2720] border border-emerald-100 dark:border-[#29422d]">
                <span className="font-semibold text-emerald-900 dark:text-emerald-300">Directa (0% com)</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">{platformCount.direct} reservas</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/50 dark:bg-[#1e2329] border border-blue-100 dark:border-[#243345]">
                <span className="font-semibold text-blue-900 dark:text-blue-300">Booking.com</span>
                <span className="text-[#1c1b18] dark:text-[#ded9cd] font-bold">{platformCount.booking} reservas</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#f8f6f2] dark:bg-[#252525] border border-[#ded9cd] dark:border-[#383838]">
                <span className="font-semibold text-[#1c1b18] dark:text-[#ded9cd]">VRBO</span>
                <span className="text-[#78746c] dark:text-[#8e8c87] font-bold">{platformCount.vrbo} reservas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
