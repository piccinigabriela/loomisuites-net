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
}

export const DemoOverview: React.FC<DemoOverviewProps> = ({
  demoState,
  onSelectReservation,
  onOpenNewReservation,
  onNavigateTab,
  onUpdateTaskStatus,
  onQuickCheckIn,
}) => {
  const today = getRelativeDate(0);

  // Metrics calculation
  const totalRevenue = demoState.reservations
    .filter((r) => r.status !== 'cancelled')
    .reduce((acc, r) => acc + r.totalAmount, 0);

  const directSavings = demoState.reservations
    .filter((r) => r.platform === 'direct' && r.status !== 'cancelled')
    .reduce((acc, r) => acc + (r.totalAmount * 0.15), 0);

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

      {/* Xenia Quick Insight Bar */}
      <div className="bg-gradient-to-r from-rose-50 via-white to-amber-50 rounded-xl p-4 border border-rose-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-zinc-900">Xenia Copilot</span>
              <span className="text-[10px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                Rendición de Cuentas & Manual
              </span>
            </div>
            <p className="text-xs text-zinc-600 mt-0.5">
              Pregúntale a Xenia cuánto ingresó este mes, qué saldos restan cobrar o cómo usar cualquier función de la plataforma.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('xenia')}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 whitespace-nowrap cursor-pointer"
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
        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Ingresos del Mes</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-zinc-900 font-['Outfit']">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+24.5% respecto al mes anterior</span>
          </div>
        </div>

       <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Check-ins de Hoy</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-zinc-900 font-['Outfit']">
            2 llegadas
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 font-medium">
            1 ya ingresado · 1 pendiente de llegada
          </div>
        </div>

       Check-ins de Hoy
      {/* Main Row: Today's Arrivals/Departures + Cleanings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Today's Operations (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Check-ins Section */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                  Check-ins de Hoy ({todayCheckIns.length})
                </h3>
              </div>
              <span className="text-xs text-zinc-500">Auto-checkin activo</span>
            </div>

            {todayCheckIns.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No hay más check-ins programados para hoy.</p>
            ) : (
              <div className="space-y-3">
                {todayCheckIns.map((res) => {
                  const prop = getProperty(res.propertyId);
                  return (
                    <div
                      key={res.id}
                      className="p-4 rounded-xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-zinc-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={res.guestAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                          alt={res.guestName}
                          className="w-10 h-10 rounded-full object-cover border border-zinc-300 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-zinc-900">{res.guestName}</h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                res.platform === 'airbnb'
                                  ? 'bg-rose-100 text-rose-800'
                                  : res.platform === 'booking'
                                  ? 'bg-blue-100 text-blue-800'
                                  : res.platform === 'direct'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}
                            >
                              {res.platform}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500">
                            {prop?.name} • {res.nights} noches ({formatDisplayDate(res.checkIn)} - {formatDisplayDate(res.checkOut)})
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-600 font-mono">
                            <KeyRound className="w-3.5 h-3.5 text-zinc-500" />
                            <span>PIN Cerradura: <strong>{res.pinCode}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => onSelectReservation(res)}
                          className="text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
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
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                  Check-outs de Hoy ({todayCheckOuts.length})
                </h3>
              </div>
              <span className="text-xs text-zinc-500">Límite estándar: 11:00 hs</span>
            </div>

            {todayCheckOuts.length === 0 ? (
              <p className="text-xs text-zinc-500 py-3 text-center">No hay salidas programadas para hoy.</p>
            ) : (
              <div className="space-y-3">
                {todayCheckOuts.map((res) => {
                  const prop = getProperty(res.propertyId);
                  return (
                    <div
                      key={res.id}
                      className="p-4 rounded-xl border border-zinc-200/80 bg-zinc-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-zinc-900">{res.guestName}</h4>
                          <span className="text-[10px] bg-zinc-200 text-zinc-800 px-2 py-0.5 rounded-full font-semibold uppercase">
                            {res.platform}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {prop?.name}
                        </p>
                        {res.specialNotes && (
                          <p className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded mt-1 border border-amber-200/60">
                            Nota: {res.specialNotes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => onSelectReservation(res)}
                          className="text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Ver Reserva
                        </button>
                        <button
                          onClick={() => onNavigateTab('housekeeping')}
                          className="text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
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
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                Equipo de Limpieza
              </h3>
              <button
                onClick={() => onNavigateTab('housekeeping')}
                className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
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
                    className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900 truncate max-w-[150px]">
                        {prop?.neighborhood || prop?.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          task.status === 'in_progress'
                            ? 'bg-amber-100 text-amber-800'
                            : task.status === 'inspected'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-zinc-200 text-zinc-700'
                        }`}
                      >
                        {task.status === 'in_progress'
                          ? 'En progreso'
                          : task.status === 'inspected'
                          ? 'Listo'
                          : 'Pendiente'}
                      </span>
                    </div>

                    <div className="text-[11px] text-zinc-500 flex items-center justify-between">
                      <span>{task.cleanerName}</span>
                      <span>{task.scheduledTime}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${(completedItems / totalItems) * 100}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-zinc-400 text-right">
                      {completedItems}/{totalItems} tareas completadas
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Channel Share */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4">
              Canales de Venta Activos
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50/50 border border-rose-100">
                <span className="font-semibold text-rose-900">Airbnb</span>
                <span className="text-zinc-600 font-bold">{platformCount.airbnb} reservas</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 border border-emerald-100">
                <span className="font-semibold text-emerald-900">Directa (0% com)</span>
                <span className="text-emerald-700 font-bold">{platformCount.direct} reservas</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/50 border border-blue-100">
                <span className="font-semibold text-blue-900">Booking.com</span>
                <span className="text-zinc-600 font-bold">{platformCount.booking} reservas</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-50/50 border border-indigo-100">
                <span className="font-semibold text-indigo-900">VRBO</span>
                <span className="text-zinc-600 font-bold">{platformCount.vrbo} reservas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
