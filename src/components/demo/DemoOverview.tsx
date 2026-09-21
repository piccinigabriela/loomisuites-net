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
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-2xl p-6 text-white border border-zinc-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Todos los canales sincronizados • Última sync: hace 12 seg</span>
          </div>
          <h2 className="text-2xl font-bold font-['Outfit']">¡Hola, Anfitrión!</h2>
          <p className="text-xs text-zinc-300 mt-1 max-w-xl">
            Hoy tienes <strong>{todayCheckIns.length} check-in</strong> programado y <strong>{todayCheckOuts.length} check-out</strong>. Todas las claves de cerradura y notificaciones automáticas están operativas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('xenia')}
            className="text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Bot className="w-4 h-4" />
            <span>Consultar con Xenia IA</span>
          </button>
          <button
            onClick={() => onNavigateTab('calendar')}
            className="text-xs font-bold bg-white text-zinc-900 hover:bg-zinc-100 px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <span>Ver Calendario</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Onboarding Real Properties Banner */}
      {onOpenOnboardingWizard && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-zinc-900 rounded-2xl p-5 text-white border border-purple-500/40 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-stone-950 font-bold shrink-0 shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">¿Quieres probar con tus departamentos reales?</h3>
                <span className="text-[10px] font-semibold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                  Onboarding Guiado (3 min)
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-0.5">
                Carga los nombres de tus unidades, precios y WiFi para ver tu operación real en el calendario y la guía de huéspedes.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenOnboardingWizard}
            className="w-full sm:w-auto text-xs font-bold bg-white text-purple-950 hover:bg-purple-50 px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shrink-0 active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Configurar Mis Departamentos</span>
            <ChevronRight className="w-4 h-4 text-purple-600" />
          </button>
        </div>
      )}

      {/* Xenia Quick Insight Bar */}
      <div className="bg-gradient-to-r from-rose-50 via-white to-amber-50 dark:from-rose-950/40 dark:via-zinc-900 dark:to-amber-950/40 rounded-xl p-4 border border-rose-200/80 dark:border-rose-900/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Xenia Copilot</span>
              <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200/60 dark:border-rose-800/60">
                Rendición de Cuentas & Manual
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
              Pregúntale a Xenia cuánto ingresó este mes, qué saldos restan cobrar o cómo usar cualquier función de la plataforma.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('xenia')}
          className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:underline flex items-center gap-1 whitespace-nowrap cursor-pointer"
        >
          <span>Abrir Xenia</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Wood Cabin Welcome Guide & Landing Quick Bar */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 rounded-xl p-4 border border-amber-600/40 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-stone-950 shrink-0 font-extrabold shadow-xs">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-white">Guía de Bienvenida & Landing de Reservas Directas</span>
              <span className="text-[10px] font-semibold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                Caso Real: Los Bananos Wood Cabin
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-0.5">
              Tus huéspedes tienen WiFi en 1 clic, modos de llegar, entradas a Cataratas y leña. Tú ahorras consultas repetitivas y cobras señas directas.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('welcome-guide')}
          className="text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 px-3.5 py-1.5 rounded-lg flex items-center gap-1 whitespace-nowrap cursor-pointer transition-colors shadow-xs"
        >
          <span>Ver Guía & Admin</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {!isEmployeeMode ? (
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Ingresos del Mes</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 font-['Outfit']">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+24.5% respecto al mes anterior</span>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50/70 dark:bg-amber-950/30 rounded-xl p-5 border border-amber-200 dark:border-amber-900/60 shadow-xs">
            <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Modo Día a Día</span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 flex items-center justify-center font-bold text-xs">
                👷
              </div>
            </div>
            <div className="text-lg font-extrabold text-amber-950 dark:text-amber-100 font-['Outfit']">
              Operaciones & Huéspedes
            </div>
            <div className="mt-1 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
              Datos financieros y tarifas confidenciales ocultos
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Check-ins de Hoy</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 font-['Outfit']">
            2 llegadas
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
            1 ya ingresado · 1 pendiente de llegada
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Limpiezas Pendientes</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-['Outfit']">
            {pendingCleanings.length} tareas
          </div>
          <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
            1 en progreso actualmente
          </div>
        </div>
      </div>
      {/* Main Row: Today's Arrivals/Departures + Cleanings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Today's Operations (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Check-ins Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Check-ins de Hoy ({todayCheckIns.length})
                </h3>
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Auto-checkin activo</span>
            </div>

            {todayCheckIns.length === 0 ? (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 py-4 text-center">No hay más check-ins programados para hoy.</p>
            ) : (
              <div className="space-y-3">
                {todayCheckIns.map((res) => {
                  const prop = getProperty(res.propertyId);
                  return (
                    <div
                      key={res.id}
                      className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={res.guestAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                          alt={res.guestName}
                          className="w-10 h-10 rounded-full object-cover border border-zinc-300 dark:border-zinc-700 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{res.guestName}</h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                res.platform === 'airbnb'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
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
                              <span className="text-[10px] font-extrabold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-1.5 py-0.5 rounded-full">
                                Airbnb 3% tradicional
                              </span>
                            )}
                            {res.earlyCheckIn && (
                              <span className="text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 px-1.5 py-0.5 rounded-full">
                                ⏰ Early Check-in (10hs)
                              </span>
                            )}
                            {res.customDiscountPercent ? (
                              <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.5 rounded-full">
                                🏷️ {res.customDiscountPercent}% Desc.
                              </span>
                            ) : null}
                          </div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {prop?.name} • {res.nights} noches ({formatDisplayDate(res.checkIn)} - {formatDisplayDate(res.checkOut)})
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-600 dark:text-zinc-300 font-mono">
                            <KeyRound className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                            <span>PIN Cerradura: <strong>{res.pinCode}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => onSelectReservation(res)}
                          className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Ver Detalle
                        </button>
                        {res.status === 'confirmed' && (
                          <button
                            onClick={() => onQuickCheckIn(res.id)}
                            className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
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
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Check-outs de Hoy ({todayCheckOuts.length})
                </h3>
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Límite estándar: 11:00 hs</span>
            </div>

            {todayCheckOuts.length === 0 ? (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 py-3 text-center">No hay salidas programadas para hoy.</p>
            ) : (
              <div className="space-y-3">
                {todayCheckOuts.map((res) => {
                  const prop = getProperty(res.propertyId);
                  return (
                    <div
                      key={res.id}
                      className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{res.guestName}</h4>
                          <span className="text-[10px] bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-2 py-0.5 rounded-full font-semibold uppercase">
                            {res.platform}
                          </span>
                          {(res.lateCheckOut || res.specialNotes?.toLowerCase().includes('late')) && (
                            <span className="text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 px-1.5 py-0.5 rounded-full">
                              ⏰ Late Check-out solicitado
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {prop?.name}
                        </p>
                        {res.specialNotes && (
                          <p className="text-[11px] text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded mt-1 border border-amber-200/60 dark:border-amber-900/60">
                            Nota: {res.specialNotes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => onSelectReservation(res)}
                          className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Ver Reserva
                        </button>
                        <button
                          onClick={() => onNavigateTab('housekeeping')}
                          className="text-xs font-bold text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
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
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Equipo de Limpieza
              </h3>
              <button
                onClick={() => onNavigateTab('housekeeping')}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
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
                    className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[150px]">
                        {prop?.neighborhood || prop?.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          task.status === 'in_progress'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200'
                            : task.status === 'inspected'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200'
                            : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {task.status === 'in_progress'
                          ? 'En progreso'
                          : task.status === 'inspected'
                          ? 'Listo'
                          : 'Pendiente'}
                      </span>
                    </div>

                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                      <span>{task.cleanerName}</span>
                      <span>{task.scheduledTime}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${(completedItems / totalItems) * 100}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-zinc-400 dark:text-zinc-500 text-right">
                      {completedItems}/{totalItems} tareas completadas
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Channel Share */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs transition-colors">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4">
              Canales de Venta Activos
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
                <span className="font-semibold text-rose-900 dark:text-rose-200">Airbnb</span>
                <span className="text-zinc-600 dark:text-zinc-300 font-bold">{platformCount.airbnb} reservas</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                <span className="font-semibold text-emerald-900 dark:text-emerald-200">Directa (0% com)</span>
                <span className="text-emerald-700 dark:text-emerald-300 font-bold">{platformCount.direct} reservas</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                <span className="font-semibold text-blue-900 dark:text-blue-200">Booking.com</span>
                <span className="text-zinc-600 dark:text-zinc-300 font-bold">{platformCount.booking} reservas</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                <span className="font-semibold text-indigo-900 dark:text-indigo-200">VRBO</span>
                <span className="text-zinc-600 dark:text-zinc-300 font-bold">{platformCount.vrbo} reservas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
