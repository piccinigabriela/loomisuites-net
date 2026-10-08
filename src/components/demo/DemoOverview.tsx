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
    <div className="space-y-5 sm:space-y-6 font-sans">
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-[#18191E] rounded-2xl p-6 border border-stone-200/70 dark:border-zinc-800/70 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#E67E22] mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Todos los canales sincronizados en tiempo real</span>
          </div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">¡Hola, Anfitrión!</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xl font-medium">
            Hoy tienes <strong>{todayCheckIns.length} check-in</strong> programado y <strong>{todayCheckOuts.length} check-out</strong>. Todas las claves de cerradura y notificaciones automáticas están operativas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('xenia')}
            className="text-xs font-semibold bg-[#E67E22] hover:bg-[#d36d16] text-white px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Bot className="w-4 h-4" />
            <span>Consultar con Xenia IA</span>
          </button>
          <button
            onClick={() => onNavigateTab('calendar')}
            className="text-xs font-semibold bg-stone-50 dark:bg-zinc-800 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-zinc-700 border border-stone-200/80 dark:border-zinc-700 px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Ver Calendario</span>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>
        </div>
      </div>

      {/* Onboarding Real Properties Banner */}
      {onOpenOnboardingWizard && (
        <div className="bg-[#FAF9F6] dark:bg-[#15161A] rounded-2xl p-5 border border-stone-200/80 dark:border-zinc-800/80 shadow-[0_4px_12px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 text-[#E67E22] flex items-center justify-center font-bold shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5 text-[#E67E22]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">¿Quieres probar con tus departamentos reales?</h3>
                <span className="text-[10px] font-semibold bg-orange-50 dark:bg-orange-950/40 text-[#E67E22] px-2 py-0.5 rounded-md border border-orange-200/50">
                  Onboarding Guiado (3 min)
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
                Carga los nombres de tus unidades, precios y WiFi para ver tu operación real en el calendario y la guía de huéspedes.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenOnboardingWizard}
            className="w-full sm:w-auto text-xs font-semibold bg-white dark:bg-zinc-800 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-zinc-700 border border-stone-200/80 dark:border-zinc-700 px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs shrink-0"
          >
            <Sparkles className="w-4 h-4 text-[#E67E22]" />
            <span>Configurar Mis Departamentos</span>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>
        </div>
      )}

      {/* Xenia Quick Insight Bar */}
      <div className="bg-white dark:bg-[#18191E] rounded-2xl p-4 border border-stone-200/70 dark:border-zinc-800/70 shadow-[0_4px_12px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/50 flex items-center justify-center text-[#E67E22] shrink-0 shadow-xs">
            <Bot className="w-5 h-5 text-[#E67E22]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-stone-900 dark:text-stone-100">Xenia Copilot</span>
              <span className="text-[10px] font-medium text-[#E67E22] bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-md border border-orange-200/40">
                Rendición de Cuentas & Manual
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
              Pregúntale a Xenia cuánto ingresó este mes, qué saldos restan cobrar o cómo usar cualquier función de la plataforma.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('xenia')}
          className="text-xs font-semibold text-[#E67E22] hover:underline flex items-center gap-1 whitespace-nowrap cursor-pointer"
        >
          <span>Abrir Xenia</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {!isEmployeeMode ? (
          <div className="bg-white dark:bg-[#18191E] rounded-2xl p-5 border border-stone-200/70 dark:border-zinc-800/70 shadow-[0_4px_12px_rgba(0,0,0,0.01)] transition-colors">
            <div className="flex items-center justify-between text-stone-400 dark:text-stone-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Ingresos del Mes</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+24.5% respecto al mes anterior</span>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#18191E] rounded-2xl p-5 border border-stone-200/70 dark:border-zinc-800/70 shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
            <div className="flex items-center justify-between text-stone-400 dark:text-stone-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Modo Día a Día</span>
              <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 flex items-center justify-center font-bold text-xs">
                👷
              </div>
            </div>
            <div className="text-lg font-bold text-stone-900 dark:text-stone-100">
              Operaciones & Huéspedes
            </div>
            <div className="mt-1 text-xs text-stone-400 dark:text-stone-500 font-medium">
              Datos financieros y tarifas confidenciales ocultos
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-5 border border-stone-200/70 dark:border-zinc-800/70 shadow-[0_4px_12px_rgba(0,0,0,0.01)] transition-colors">
          <div className="flex items-center justify-between text-stone-400 dark:text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Check-ins de Hoy</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            2 llegadas
          </div>
          <div className="mt-1 text-xs text-stone-400 dark:text-stone-500 font-medium">
            1 ya ingresado · 1 pendiente de llegada
          </div>
        </div>

        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-5 border border-stone-200/70 dark:border-zinc-800/70 shadow-[0_4px_12px_rgba(0,0,0,0.01)] transition-colors">
          <div className="flex items-center justify-between text-stone-400 dark:text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Limpiezas Pendientes</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-[#E67E22] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#E67E22] tracking-tight">
            {pendingCleanings.length} tareas
          </div>
          <div className="mt-1 text-xs text-stone-400 dark:text-stone-500 font-medium">
            1 en progreso actualmente
          </div>
        </div>

        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-5 border border-stone-200/70 dark:border-zinc-800/70 shadow-[0_4px_12px_rgba(0,0,0,0.01)] transition-colors">
          <div className="flex items-center justify-between text-stone-400 dark:text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Ocupación Actual</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            75%
          </div>
          <div className="mt-1 text-xs text-stone-400 dark:text-stone-500 font-medium">
            3 de 4 unidades ocupadas hoy
          </div>
        </div>
      </div>
      {/* Main Row: Today's Arrivals/Departures + Cleanings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Today's Operations (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Check-ins Section */}
          <div className="bg-white dark:bg-[#18191E] rounded-2xl border border-stone-200/70 dark:border-zinc-800/70 p-5 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                  Check-ins de Hoy ({todayCheckIns.length})
                </h3>
              </div>
              <span className="text-xs text-stone-400 dark:text-stone-500 font-medium">Auto-checkin activo</span>
            </div>

            {todayCheckIns.length === 0 ? (
              <p className="text-xs text-stone-400 dark:text-stone-500 py-6 text-center font-medium">No hay más check-ins programados para hoy.</p>
            ) : (
              <div className="space-y-3">
                {todayCheckIns.map((res) => {
                  const prop = getProperty(res.propertyId);
                  return (
                    <div
                      key={res.id}
                      className="p-4 rounded-xl border border-stone-100 dark:border-zinc-800 bg-[#FAF9F6] dark:bg-[#15161A] hover:border-stone-200 dark:hover:border-zinc-700 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={res.guestAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                          alt={res.guestName}
                          className="w-10 h-10 rounded-full object-cover border border-stone-200 dark:border-zinc-700 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">{res.guestName}</h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                                res.platform === 'airbnb'
                                  ? 'bg-orange-50 text-[#E67E22] dark:bg-orange-950/40 dark:text-[#E67E22]'
                                  : res.platform === 'booking'
                                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                                  : res.platform === 'direct'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                  : 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                              }`}
                            >
                              {res.platform}
                            </span>
                            {res.platform === 'airbnb' && res.airbnbFeeMode === 'traditional_3' && (
                              <span className="text-[10px] font-semibold bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 px-2 py-0.5 rounded-md">
                                Airbnb 3% tradicional
                              </span>
                            )}
                            {res.earlyCheckIn && (
                              <span className="text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md">
                                ⏰ Early Check-in (10hs)
                              </span>
                            )}
                            {demoState.reservations.some(
                              (r) =>
                                r.id !== res.id &&
                                r.propertyId === res.propertyId &&
                                r.status !== 'cancelled' &&
                                r.checkOut === res.checkIn
                            ) && (
                              <span className="text-[10px] font-bold bg-orange-50 text-[#E67E22] px-2 py-0.5 rounded-md flex items-center gap-1">
                                <RotateCw className="w-2.5 h-2.5 text-[#E67E22] animate-spin-slow" />
                                <span>Recambio Hoy</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
                            {prop?.name} • {res.nights} noches ({formatDisplayDate(res.checkIn)} - {formatDisplayDate(res.checkOut)})
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-400 dark:text-stone-500 font-mono">
                            <KeyRound className="w-3.5 h-3.5 text-[#E67E22]" />
                            <span>PIN Cerradura: <strong className="text-stone-800 dark:text-stone-200">{res.pinCode}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => onSelectReservation(res)}
                          className="text-xs font-semibold text-stone-700 dark:text-stone-200 bg-white dark:bg-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-700 border border-stone-200/80 dark:border-zinc-700 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                        >
                          Ver Detalle
                        </button>
                        {res.status === 'confirmed' && (
                          <button
                            onClick={() => onQuickCheckIn(res.id)}
                            className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer shadow-xs"
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
          <div className="bg-white dark:bg-[#18191E] rounded-2xl border border-stone-200/70 dark:border-zinc-800/70 p-5 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                  Check-outs de Hoy ({todayCheckOuts.length})
                </h3>
              </div>
              <span className="text-xs text-stone-400 dark:text-stone-500 font-medium">Límite estándar: 10:00 hs</span>
            </div>

            {todayCheckOuts.length === 0 ? (
              <p className="text-xs text-stone-400 dark:text-stone-500 py-4 text-center font-medium">No hay salidas programadas para hoy.</p>
            ) : (
              <div className="space-y-3">
                {todayCheckOuts.map((res) => {
                  const prop = getProperty(res.propertyId);
                  return (
                    <div
                      key={res.id}
                      className="p-4 rounded-xl border border-stone-100 dark:border-zinc-800 bg-[#FAF9F6] dark:bg-[#15161A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">{res.guestName}</h4>
                          <span className="text-[10px] bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded-md font-semibold uppercase">
                            {res.platform}
                          </span>
                          {(res.lateCheckOut || res.specialNotes?.toLowerCase().includes('late')) && (
                            <span className="text-[10px] font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 px-2 py-0.5 rounded-md">
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
                            <span className="text-[10px] font-bold bg-orange-50 text-[#E67E22] px-2 py-0.5 rounded-md flex items-center gap-1">
                              <RotateCw className="w-2.5 h-2.5 text-[#E67E22] animate-spin-slow" />
                              <span>Entra huésped hoy</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
                          {prop?.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => onSelectReservation(res)}
                          className="text-xs font-semibold text-stone-700 dark:text-stone-200 bg-white dark:bg-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-700 border border-stone-200/80 dark:border-zinc-700 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                        >
                          Ver Reserva
                        </button>
                        <button
                          onClick={() => onNavigateTab('housekeeping')}
                          className="text-xs font-semibold text-[#E67E22] bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100/70 border border-orange-200/50 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
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
          <div className="bg-white dark:bg-[#18191E] rounded-2xl border border-stone-200/70 dark:border-zinc-800/70 p-5 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                Equipo de Limpieza
              </h3>
              <button
                onClick={() => onNavigateTab('housekeeping')}
                className="text-xs font-semibold text-[#E67E22] hover:underline cursor-pointer"
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
                    className="p-3.5 rounded-xl border border-stone-100 dark:border-zinc-800 bg-[#FAF9F6] dark:bg-[#15161A] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate max-w-[150px]">
                        {prop?.name}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          task.status === 'in_progress'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                            : task.status === 'inspected'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        {task.status === 'in_progress'
                          ? 'En progreso'
                          : task.status === 'inspected'
                          ? 'Listo'
                          : 'Pendiente'}
                      </span>
                    </div>

                    <div className="text-xs text-stone-400 dark:text-stone-500 flex items-center justify-between font-medium">
                      <span>{task.cleanerName}</span>
                      <span>{task.scheduledTime}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-stone-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${(completedItems / totalItems) * 100}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-stone-400 text-right font-medium">
                      {completedItems}/{totalItems} tareas completadas
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Channel Share */}
          <div className="bg-white dark:bg-[#18191E] rounded-2xl border border-stone-200/70 dark:border-zinc-800/70 p-5 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-colors">
            <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider mb-4">
              Canales de Venta Activos
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-100/60 dark:border-orange-900/30">
                <span className="font-semibold text-[#E67E22]">Airbnb</span>
                <span className="text-stone-900 dark:text-stone-100 font-bold">{platformCount.airbnb} reservas</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100/60 dark:border-emerald-900/30">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">Directa (0% com)</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">{platformCount.direct} reservas</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100/60 dark:border-blue-900/30">
                <span className="font-semibold text-blue-700 dark:text-blue-300">Booking.com</span>
                <span className="text-stone-900 dark:text-stone-100 font-bold">{platformCount.booking} reservas</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100/60 dark:border-purple-900/30">
                <span className="font-semibold text-purple-700 dark:text-purple-300">VRBO</span>
                <span className="text-stone-900 dark:text-stone-100 font-bold">{platformCount.vrbo} reservas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
