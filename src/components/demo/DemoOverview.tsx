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
  const todayStr = getRelativeDate(0);

  const todayArrivals = demoState.reservations.filter(
    (r) => r.checkIn === todayStr && r.status !== 'cancelled'
  );

  const todayDepartures = demoState.reservations.filter(
    (r) => r.checkOut === todayStr && r.status !== 'cancelled'
  );

  const pendingCleanings = demoState.cleanings.filter(
    (c) => c.status === 'pending' || c.status === 'in_progress'
  );

  const unreadMessages = demoState.messages.filter((m) => m.unread);

  const directReservationsCount = demoState.reservations.filter(
    (r) => r.platform === 'direct' && r.status !== 'cancelled'
  ).length;

  const totalMonthlyIncome = demoState.finances.monthlyBreakdown[0]?.gross || 5800;

  return (
    <div className="space-y-6">
      {/* Top Banner Alert (Operational Summary) */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Panel Operativo en Vivo
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Sincronización Activa
              </span>
            </h3>
            <p className="text-xs text-zinc-300 mt-0.5">
              Hoy tienes {todayArrivals.length} llegada(s), {todayDepartures.length} salida(s) y{' '}
              {pendingCleanings.length} limpieza(s) programada(s).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('calendar')}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            Ver Calendario
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenNewReservation}
            className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-semibold text-white transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            + Nueva Reserva
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Ingresos del Mes</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-zinc-900 font-['Outfit']">
            {formatCurrency(totalMonthlyIncome)}
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% vs mes anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Ocupación General</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-zinc-900 font-['Outfit']">
            87.5%
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">
            28 de 32 noches reservadas en tus 4 alojamientos
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Check-ins de Hoy</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-zinc-900 font-['Outfit']">
            {todayArrivals.length} llegadas
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 font-medium">
            1 ya ingresado · {Math.max(0, todayArrivals.length - 1)} pendiente
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Limpiezas Pendientes</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 font-['Outfit']">
            {pendingCleanings.length} tareas
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">
            1 en progreso actualmente
          </div>
        </div>
      </div>

      {/* Main Row: Today's Arrivals/Departures + Cleanings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Today's Operations (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Today's Arrivals */}
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h4 className="font-bold text-xs text-zinc-900 uppercase tracking-wider">
                  Check-ins de Hoy ({todayArrivals.length})
                </h4>
              </div>
              <span className="text-[11px] text-zinc-500">
                {formatDisplayDate(todayStr)}
              </span>
            </div>

            <div className="divide-y divide-zinc-100">
              {todayArrivals.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-500">
                  No hay check-ins programados para hoy.
                </div>
              ) : (
                todayArrivals.map((res) => {
                  const property = demoState.properties.find((p) => p.id === res.propertyId);
                  const isCheckedIn = res.checkInStatus === 'checked_in';

                  return (
                    <div
                      key={res.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/60 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-zinc-100 text-zinc-700 font-bold text-xs flex items-center justify-center shrink-0 border border-zinc-200">
                          {res.guestName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-zinc-900">{res.guestName}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                                res.platform === 'airbnb'
                                  ? 'bg-rose-100 text-rose-700'
                                  : res.platform === 'booking'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {res.platform}
                            </span>
                            {res.hasSmartLock && (
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-zinc-100 text-zinc-700 flex items-center gap-1"
                                title={`PIN Cerradura: ${res.pinCode}`}
                              >
                                <KeyRound className="w-3 h-3 text-zinc-500" />
                                PIN: {res.pinCode}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-zinc-500 mt-0.5">
                            {property?.name} · {res.guestsCount} huésped(es) · Salida:{' '}
                            {formatDisplayDate(res.checkOut)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => onSelectReservation(res)}
                          className="px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-xs font-semibold text-zinc-700 transition-colors cursor-pointer"
                        >
                          Detalles
                        </button>
                        {isCheckedIn ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Ingresado
                          </span>
                        ) : (
                          <button
                            onClick={() => onQuickCheckIn(res.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs"
                          >
                            Marcar Check-in
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Today's Departures */}
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h4 className="font-bold text-xs text-zinc-900 uppercase tracking-wider">
                  Check-outs de Hoy ({todayDepartures.length})
                </h4>
              </div>
              <span className="text-[11px] text-zinc-500">
                Horario límite: 11:00 AM
              </span>
            </div>

            <div className="divide-y divide-zinc-100">
              {todayDepartures.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-500">
                  No hay check-outs programados para hoy.
                </div>
              ) : (
                todayDepartures.map((res) => {
                  const property = demoState.properties.find((p) => p.id === res.propertyId);

                  return (
                    <div
                      key={res.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/60 transition-colors"
                    >
                      <div>
                        <div className="font-bold text-sm text-zinc-900">{res.guestName}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">
                          {property?.name} · {res.nights} noches de estadía
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectReservation(res)}
                          className="px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-xs font-semibold text-zinc-700 transition-colors cursor-pointer"
                        >
                          Ver Reserva
                        </button>
                        <button
                          onClick={() => onNavigateTab('housekeeping')}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs"
                        >
                          Ver Limpieza
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Operative Sidebar (Cleanings + Direct Booking engine) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Cleaning Tasks Widget */}
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h4 className="font-bold text-xs text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                Turno de Limpieza
              </h4>
              <button
                onClick={() => onNavigateTab('housekeeping')}
                className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
              >
                Ver todas
              </button>
            </div>

            <div className="divide-y divide-zinc-100">
              {pendingCleanings.slice(0, 3).map((task) => {
                const property = demoState.properties.find((p) => p.id === task.propertyId);

                return (
                  <div key={task.id} className="p-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-xs text-zinc-900">{property?.name}</div>
                        <div className="text-[11px] text-zinc-500">
                          Asignado: <span className="font-medium text-zinc-700">{task.assignedTo}</span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          task.status === 'in_progress'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        {task.status === 'in_progress' ? 'En curso' : 'Pendiente'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-zinc-500">Costo: ${task.cost}</span>
                      <button
                        onClick={() => onUpdateTaskStatus(task.id, 'completed')}
                        className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                      >
                        ✓ Marcar limpia
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Direct Booking Promo Box */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-200/60 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Motor de Reservas Directas
            </div>
            <p className="text-xs text-emerald-900/80 leading-relaxed">
              Tu enlace público para huéspedes está activo. Puedes aceptar pagos directos sin comisiones del 18%.
            </p>
            <div className="pt-1 flex items-center gap-2">
              <button
                onClick={() => onNavigateTab('booking')}
                className="w-full py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                Abrir Portal de Reservas
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
