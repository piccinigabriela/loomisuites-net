import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Shield,
  KeyRound,
  Eye,
  Building,
  Send,
  ChevronRight,
  X,
  Sparkle,
  ArrowUpRight,
} from 'lucide-react';
import { DemoState, Reservation, CleaningTask } from '../../types';
import { formatCurrency, formatDisplayDate, getRelativeDate } from '../../data/initialData';

interface CleanTodayProps {
  demoState: DemoState;
  onSelectReservation: (res: Reservation) => void;
  onOpenNewReservation: () => void;
  onNavigateTab: (tab: string) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: CleaningTask['status']) => void;
  onQuickCheckIn: (resId: string) => void;
  onOpenOnboardingWizard?: () => void;
  onRequestPlan?: () => void;
  isEmployeeMode?: boolean;
  userRole?: 'admin' | 'frontdesk' | 'housekeeping';
  isLoggedIn?: boolean;
}

export const CleanToday: React.FC<CleanTodayProps> = ({
  demoState,
  onSelectReservation,
  onOpenNewReservation,
  onNavigateTab,
  onUpdateTaskStatus,
  onQuickCheckIn,
  onOpenOnboardingWizard,
  onRequestPlan,
  isEmployeeMode = false,
  userRole = 'admin',
  isLoggedIn = false,
}) => {
  const [isBannerDismissed, setIsBannerDismissed] = useState(() => {
    try {
      return localStorage.getItem('loomi_dismiss_onboarding_banner') === 'true';
    } catch {
      return false;
    }
  });

  const handleDismissBanner = () => {
    setIsBannerDismissed(true);
    try {
      localStorage.setItem('loomi_dismiss_onboarding_banner', 'true');
    } catch {
      // ignore
    }
  };

  const today = getRelativeDate(0);

  // Total monthly revenue calculation
  const totalRevenue = demoState.reservations
    .filter((r) => r.status !== 'cancelled')
    .reduce((acc, r) => acc + r.totalAmount, 0);

  // Cash drawer calculation for frontdesk preview
  const openingCash = 50000;
  const cashMovements = demoState.cashMovements || [];
  const cashMovementsOnly = cashMovements.filter((m) => m.paymentMethod === 'efectivo');
  const cashIn = cashMovementsOnly.filter((m) => m.type === 'ingreso').reduce((sum, m) => sum + m.amount, 0);
  const currentCashBalance = openingCash + cashIn;

  const totalNights = demoState.reservations
    .filter((r) => r.status !== 'cancelled')
    .reduce((acc, r) => acc + r.nights, 0);

  const activeReservationsCount = demoState.reservations.filter(
    (r) => r.status !== 'cancelled'
  ).length;

  const todayCheckIns = demoState.reservations.filter(
    (r) => r.checkIn === today && r.status !== 'cancelled'
  );

  const todayCheckOuts = demoState.reservations.filter(
    (r) => r.checkOut === today && r.status !== 'cancelled'
  );

  // Cleaning list
  const cleaningTasks = demoState.cleaningTasks;

  const getPropName = (propId: string) => {
    const p = demoState.properties.find((item) => item.id === propId);
    return p ? p.name : propId;
  };

  const getPropShortCode = (propId: string) => {
    const p = demoState.properties.find((item) => item.id === propId);
    if (!p) return '1A';
    const match = p.name.match(/\b([0-9][A-Za-z]|[0-9]+)\b/);
    if (match) return match[1].toUpperCase();
    return p.name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Title & Subtitle with Ma (airy breathing room) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-gray-100 dark:border-zinc-800/80 gap-2">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#E67E22] bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-md inline-block">
            Panel Operativo • Día a Día
          </span>
          <h2 className="text-xl sm:text-2xl font-light text-gray-900 dark:text-gray-100 tracking-tight">
            Hoy en el <span className="font-semibold text-gray-800 dark:text-gray-200">Complejo</span>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-light text-gray-400 dark:text-zinc-500 bg-white dark:bg-zinc-800/50 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-zinc-700/60 shadow-2xs">
            {formatDisplayDate(today)}
          </span>
        </div>
      </div>

      {/* Top 4 Bento Metric Cards (Floating clean aesthetic with soft pastel highlights) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Ocupación Hoy */}
        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-zinc-800/80 shadow-[0_4px_16px_rgba(0,0,0,0.015)] transition-all flex flex-col justify-between hover:border-orange-200/50">
          <div className="flex items-center justify-between pb-2 border-b border-gray-50 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-gray-400 dark:text-zinc-400 truncate">
              Ocupación Hoy
            </span>
            <span className="w-2 h-2 rounded-full bg-[#E67E22] shadow-[0_0_8px_rgba(230,126,34,0.4)] shrink-0" />
          </div>
          <div className="my-2 text-2xl sm:text-3xl font-light text-gray-900 dark:text-gray-100 tracking-tight flex items-baseline gap-1">
            <span className="font-normal text-gray-800 dark:text-gray-100">{demoState.properties.length > 0 ? `1` : `0`}</span>
            <span className="text-xs font-light text-gray-400 dark:text-zinc-500">
              /{demoState.properties.length}
            </span>
          </div>
          <div className="text-[11px] font-light text-[#E67E22] bg-orange-50/60 dark:bg-orange-950/30 px-2 py-0.5 rounded-md inline-block w-max">
            1 Ocupada
          </div>
        </div>

        {/* Card 2: Ingresos Mes */}
        {userRole === 'admin' ? (
          <div className="bg-white dark:bg-[#18191E] rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-zinc-800/80 shadow-[0_4px_16px_rgba(0,0,0,0.015)] transition-all flex flex-col justify-between hover:border-emerald-200/50">
            <div className="flex items-center justify-between pb-2 border-b border-gray-50 dark:border-zinc-800">
              <span className="text-[11px] font-medium text-gray-400 dark:text-zinc-400 truncate">
                Ingresos Mes
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] shrink-0" />
            </div>
            <div className="my-2 text-xl sm:text-2xl font-light text-gray-900 dark:text-gray-100 tracking-tight truncate">
              USD <span className="font-normal text-gray-800 dark:text-gray-100">{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
            <div className="text-[11px] font-light text-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md inline-block w-max">
              Neto USD {(totalRevenue * 0.76).toFixed(0)}
            </div>
          </div>
        ) : userRole === 'frontdesk' ? (
          <div className="bg-white dark:bg-[#18191E] rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-zinc-800/80 shadow-[0_4px_16px_rgba(0,0,0,0.015)] transition-all flex flex-col justify-between hover:border-orange-200/50">
            <div className="flex items-center justify-between pb-2 border-b border-gray-50 dark:border-zinc-800">
              <span className="text-[11px] font-medium text-gray-400 dark:text-zinc-400 truncate">
                Caja Mostrador
              </span>
              <span className="w-2 h-2 rounded-full bg-[#E67E22] shrink-0" />
            </div>
            <div className="my-2 text-xl sm:text-2xl font-light text-gray-900 dark:text-gray-100 tracking-tight truncate">
              $<span className="font-normal">{currentCashBalance.toLocaleString('es-AR')}</span>
            </div>
            <div className="text-[11px] font-light text-gray-400 dark:text-zinc-500">
              Fondo $50.000 ARS
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#18191E] rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-zinc-800/80 shadow-[0_4px_16px_rgba(0,0,0,0.015)] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-gray-50 dark:border-zinc-800">
              <span className="text-[11px] font-medium text-gray-400 dark:text-zinc-400 truncate">
                Modo Operativo
              </span>
              <span className="w-2 h-2 rounded-full bg-stone-300 dark:bg-zinc-600 shrink-0" />
            </div>
            <div className="my-2 text-xl sm:text-2xl font-normal text-gray-800 dark:text-gray-100">
              Día a Día
            </div>
            <div className="text-[11px] font-light text-gray-400 dark:text-zinc-500 truncate">
              Métricas ocultas
            </div>
          </div>
        )}

        {/* Card 3: Noches Mes */}
        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-zinc-800/80 shadow-[0_4px_16px_rgba(0,0,0,0.015)] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-gray-50 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-gray-400 dark:text-zinc-400 truncate">
              Noches Vendidas
            </span>
            <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-zinc-600 shrink-0" />
          </div>
          <div className="my-2 text-2xl sm:text-3xl font-light text-gray-900 dark:text-gray-100 tracking-tight flex items-baseline gap-1">
            <span className="font-normal text-gray-800 dark:text-gray-100">{totalNights}</span>
            <span className="text-xs font-light text-gray-400 dark:text-zinc-500">noches</span>
          </div>
          <div className="text-[11px] font-light text-gray-400 dark:text-zinc-500 truncate">
            Promedio mensual
          </div>
        </div>

        {/* Card 4: Llegadas Próximas */}
        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-zinc-800/80 shadow-[0_4px_16px_rgba(0,0,0,0.015)] transition-all flex flex-col justify-between hover:border-orange-200/50">
          <div className="flex items-center justify-between pb-2 border-b border-gray-50 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-gray-400 dark:text-zinc-400 truncate">
              Llegadas Próximas
            </span>
            <span className="w-2 h-2 rounded-full bg-[#E67E22] shrink-0" />
          </div>
          <div className="my-2 text-2xl sm:text-3xl font-light text-gray-900 dark:text-gray-100 tracking-tight">
            <span className="font-normal text-gray-800 dark:text-gray-100">{activeReservationsCount}</span>
          </div>
          <div className="text-[11px] font-light text-[#E67E22] bg-orange-50/60 dark:bg-orange-950/30 px-2 py-0.5 rounded-md inline-block w-max">
            Próximos 7 días
          </div>
        </div>
      </div>

      {/* Row 2: Check-ins HOY, Check-outs HOY, A Limpiar (Recambio con naranja pastel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Check-ins HOY */}
        <div className="lg:col-span-4 bg-white dark:bg-[#18191E] rounded-2xl p-5 border border-gray-100 dark:border-zinc-800/80 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-50 dark:border-zinc-800 mb-3.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E67E22]" /> LLEGADAS HOY ({todayCheckIns.length})
              </span>
              <span className="text-[10px] font-light text-gray-400">Check-in 14:00</span>
            </div>

            {todayCheckIns.length === 0 ? (
              <div className="text-center py-8 text-xs font-light text-gray-400 dark:text-zinc-500">
                Sin llegadas programadas para hoy
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayCheckIns.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => onSelectReservation(res)}
                    className="p-3 rounded-xl bg-gray-50/60 dark:bg-zinc-800/40 hover:bg-orange-50/40 dark:hover:bg-zinc-800 border border-gray-100 dark:border-zinc-700/60 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-orange-50 text-[#E67E22] dark:bg-orange-950/50 dark:text-orange-300 font-mono border border-orange-100 dark:border-orange-900/40">
                        {getPropShortCode(res.propertyId)}
                      </span>
                      <div>
                        <span className="text-xs font-medium text-gray-800 dark:text-gray-100 block">
                          {res.guestName}
                        </span>
                        <span className="text-[10px] font-light text-gray-400 dark:text-zinc-500">
                          {getPropName(res.propertyId)}
                        </span>
                      </div>
                    </div>
                    {res.status === 'confirmed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickCheckIn(res.id);
                        }}
                        className="text-xs font-medium bg-orange-50 hover:bg-orange-100 text-[#E67E22] px-3 py-1 rounded-xl transition-colors cursor-pointer border border-orange-100"
                      >
                        Ingresar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Check-outs HOY */}
        <div className="lg:col-span-4 bg-white dark:bg-[#18191E] rounded-2xl p-5 border border-gray-100 dark:border-zinc-800/80 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-50 dark:border-zinc-800 mb-3.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-zinc-600" /> SALIDAS HOY ({todayCheckOuts.length})
              </span>
              <span className="text-[10px] font-light text-gray-400">Check-out 10:00</span>
            </div>

            {todayCheckOuts.length === 0 ? (
              <div className="text-center py-8 text-xs font-light text-gray-400 dark:text-zinc-500">
                Sin salidas para hoy
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayCheckOuts.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => onSelectReservation(res)}
                    className="p-3 rounded-xl bg-gray-50/60 dark:bg-zinc-800/40 hover:bg-gray-100/70 dark:hover:bg-zinc-800 border border-gray-100 dark:border-zinc-700/60 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 font-mono">
                        {getPropShortCode(res.propertyId)}
                      </span>
                      <div>
                        <span className="text-xs font-medium text-gray-800 dark:text-gray-100 block">
                          {res.guestName}
                        </span>
                        <span className="text-[10px] font-light text-gray-400 dark:text-zinc-500">
                          {getPropName(res.propertyId)}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-light text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-md">
                      Salida
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* A Limpiar / Alerta Recambio */}
        <div className="lg:col-span-4 bg-white dark:bg-[#18191E] rounded-2xl p-5 border border-gray-100 dark:border-zinc-800/80 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-50 dark:border-zinc-800 mb-3.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> LIMPIEZAS & RECAMBIO ({cleaningTasks.length})
              </span>
              <button
                onClick={() => onNavigateTab('housekeeping')}
                className="text-xs font-medium text-[#E67E22] hover:underline cursor-pointer"
              >
                Ver agenda →
              </button>
            </div>

            <div className="space-y-2.5 max-h-52 sm:max-h-60 overflow-y-auto pr-1">
              {cleaningTasks.slice(0, 6).map((task) => {
                const isCompleted =
                  task.status === 'completed' ||
                  task.status === 'inspected' ||
                  (task.checklist && task.checklist.length > 0 && task.checklist.every((c) => c.completed));
                return (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all duration-300 ${
                      isCompleted
                        ? 'bg-green-50/30 dark:bg-emerald-950/20 border-green-200/50 dark:border-emerald-800/40'
                        : 'bg-gray-50/60 dark:bg-zinc-800/40 border-gray-100 dark:border-zinc-700/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-zinc-200 font-mono">
                        {getPropShortCode(task.propertyId)}
                      </span>
                      <span className="text-xs font-light text-gray-400 dark:text-zinc-400">
                        {formatDisplayDate(task.date)}
                      </span>
                      <span className={`text-xs font-medium transition-colors ${isCompleted ? 'text-stone-400 dark:text-stone-500 line-through' : 'text-gray-800 dark:text-gray-100'}`}>
                        {task.cleanerName.split(' ')[0]}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        onUpdateTaskStatus(
                          task.id,
                          isCompleted ? 'pending' : 'inspected'
                        )
                      }
                      className={`px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:border-emerald-900/40'
                          : 'bg-orange-50 text-[#E67E22] border-orange-100 hover:bg-orange-100/70 dark:bg-orange-950/40 dark:border-orange-900/40'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isCompleted ? 'Lista' : 'Recambio'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Próximos Check-ins (7 días) & Últimas Reservas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Próximos Check-ins (7 días) */}
        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-5 border border-gray-100 dark:border-zinc-800/80 shadow-[0_4px_16px_rgba(0,0,0,0.015)] transition-colors">
          <div className="flex items-center justify-between pb-2.5 border-b border-gray-50 dark:border-zinc-800 mb-3.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-zinc-600" /> PRÓXIMAS LLEGADAS (7 DÍAS)
            </span>
            <span className="text-[10px] font-light text-gray-400">Calendario</span>
          </div>

          <div className="space-y-2.5">
            {demoState.reservations
              .filter((r) => r.status !== 'cancelled')
              .slice(0, 4)
              .map((res) => (
                <div
                  key={res.id}
                  onClick={() => onSelectReservation(res)}
                  className="p-3 rounded-xl bg-gray-50/60 dark:bg-zinc-800/40 hover:bg-gray-100/70 dark:hover:bg-zinc-800 border border-gray-100 dark:border-zinc-700/60 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-zinc-200 font-mono">
                      {getPropShortCode(res.propertyId)}
                    </span>
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-100">
                      {res.guestName}
                    </span>
                  </div>
                  <span className="text-xs font-light text-gray-500 dark:text-zinc-400">
                    {formatDisplayDate(res.checkIn)}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Últimas Reservas */}
        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-5 border border-gray-100 dark:border-zinc-800/80 shadow-[0_4px_16px_rgba(0,0,0,0.015)] transition-colors">
          <div className="flex items-center justify-between pb-2.5 border-b border-gray-50 dark:border-zinc-800 mb-3.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E67E22]" /> ÚLTIMAS RESERVAS INGRESADAS
            </span>
            <span className="text-[10px] font-light text-gray-400">Canales</span>
          </div>

          <div className="space-y-2.5">
            {demoState.reservations
              .filter((r) => r.status !== 'cancelled')
              .slice(0, 4)
              .map((res) => (
                <div
                  key={res.id}
                  onClick={() => onSelectReservation(res)}
                  className="p-3 rounded-xl bg-gray-50/60 dark:bg-zinc-800/40 hover:bg-gray-100/70 dark:hover:bg-zinc-800 border border-gray-100 dark:border-zinc-700/60 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-orange-50 text-[#E67E22] border border-orange-100 dark:bg-orange-950/40 dark:border-orange-900/40 font-mono">
                      {getPropShortCode(res.propertyId)}
                    </span>
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-100">
                      {res.guestName}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-100/60 dark:border-emerald-900/40">
                    Confirmada
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
