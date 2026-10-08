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
    <div className="space-y-5 sm:space-y-6 font-sans">
      {/* Title & Subtitle with Ma (airy breathing room) */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200/70 dark:border-zinc-800/70">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22]" /> PANEL OPERATIVO • DÍA A DÍA
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-800 dark:text-stone-100 tracking-tight mt-0.5">
            Hoy en el Complejo
          </h2>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-xs font-medium text-stone-400 dark:text-stone-500">
            {formatDisplayDate(today)}
          </span>
        </div>
      </div>

      {/* Top 4 Bento Metric Cards (2x2 on mobile, 4 columns on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Ocupados Hoy */}
        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-4 sm:p-5 border border-stone-200/70 dark:border-zinc-800/70 shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 truncate">
              Ocupación Hoy
            </span>
            <span className="w-2 h-2 rounded-full bg-[#E67E22] shrink-0" />
          </div>
          <div className="my-2.5 text-2xl sm:text-3xl font-bold text-stone-800 dark:text-stone-100 tracking-tight flex items-baseline gap-1">
            <span>{demoState.properties.length > 0 ? `1` : `0`}</span>
            <span className="text-xs font-normal text-stone-400 dark:text-stone-500">
              /{demoState.properties.length}
            </span>
          </div>
          <div className="text-[11px] font-medium text-stone-400 dark:text-stone-500 truncate">
            Unidades activas
          </div>
        </div>

        {/* Card 2: Ingresos Mes */}
        {userRole === 'admin' ? (
          <div className="bg-white dark:bg-[#18191E] rounded-2xl p-4 sm:p-5 border border-stone-200/70 dark:border-zinc-800/70 shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
              <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 truncate">
                Ingresos Mes
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            </div>
            <div className="my-2.5 text-xl sm:text-2xl font-bold text-stone-800 dark:text-stone-100 tracking-tight truncate">
              USD {totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div className="text-[11px] font-medium text-stone-400 dark:text-stone-500 truncate">
              Neto USD {(totalRevenue * 0.76).toFixed(0)}
            </div>
          </div>
        ) : userRole === 'frontdesk' ? (
          <div className="bg-white dark:bg-[#18191E] rounded-2xl p-4 sm:p-5 border border-stone-200/70 dark:border-zinc-800/70 shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
              <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 truncate">
                Caja Mostrador
              </span>
              <span className="w-2 h-2 rounded-full bg-[#E67E22] shrink-0" />
            </div>
            <div className="my-2.5 text-xl sm:text-2xl font-bold text-stone-800 dark:text-stone-100 tracking-tight truncate">
              ${currentCashBalance.toLocaleString('es-AR')}
            </div>
            <div className="text-[11px] font-medium text-stone-400 dark:text-stone-500 truncate">
              Fondo: $50.000 ARS
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#18191E] rounded-2xl p-4 sm:p-5 border border-stone-200/70 dark:border-zinc-800/70 shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
              <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 truncate">
                Modo Operativo
              </span>
              <span className="w-2 h-2 rounded-full bg-stone-300 dark:bg-zinc-600 shrink-0" />
            </div>
            <div className="my-2.5 text-xl sm:text-2xl font-bold text-stone-800 dark:text-stone-100">
              Día a Día
            </div>
            <div className="text-[11px] font-medium text-stone-400 dark:text-stone-500 truncate">
              Métricas ocultas
            </div>
          </div>
        )}

        {/* Card 3: Noches Mes */}
        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-4 sm:p-5 border border-stone-200/70 dark:border-zinc-800/70 shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 truncate">
              Noches Vendidas
            </span>
            <span className="w-2 h-2 rounded-full bg-stone-300 dark:bg-zinc-600 shrink-0" />
          </div>
          <div className="my-2.5 text-2xl sm:text-3xl font-bold text-stone-800 dark:text-stone-100 tracking-tight flex items-baseline gap-1">
            <span>{totalNights}</span>
            <span className="text-xs font-normal text-stone-400 dark:text-stone-500">~2x</span>
          </div>
          <div className="text-[11px] font-medium text-stone-400 dark:text-stone-500 truncate">
            Vendidas · prom.
          </div>
        </div>

        {/* Card 4: Check-ins 7D */}
        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-4 sm:p-5 border border-stone-200/70 dark:border-zinc-800/70 shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 truncate">
              Llegadas Próximas
            </span>
            <span className="w-2 h-2 rounded-full bg-[#E67E22] shrink-0" />
          </div>
          <div className="my-2.5 text-2xl sm:text-3xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">
            {activeReservationsCount}
          </div>
          <div className="text-[11px] font-medium text-stone-400 dark:text-stone-500 truncate">
            Próximos 7 días
          </div>
        </div>
      </div>

      {/* Row 2: Check-ins HOY, Check-outs HOY, A Limpiar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Check-ins HOY */}
        <div className="lg:col-span-4 bg-white dark:bg-[#18191E] rounded-2xl p-5 border border-stone-200/70 dark:border-zinc-800/70 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-100 dark:border-zinc-800 mb-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22]" /> LLEGADAS HOY ({todayCheckIns.length})
              </span>
              <span className="text-[11px] font-medium text-stone-400">Check-in</span>
            </div>

            {todayCheckIns.length === 0 ? (
              <div className="text-center py-8 text-xs font-medium text-stone-400 dark:text-stone-500">
                Sin llegadas programadas para hoy
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayCheckIns.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => onSelectReservation(res)}
                    className="p-3 rounded-xl bg-stone-50/70 dark:bg-zinc-800/50 hover:bg-stone-100/80 dark:hover:bg-zinc-800 border border-stone-100 dark:border-zinc-700/60 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-200/80 dark:bg-zinc-700 text-stone-700 dark:text-stone-200 font-mono">
                        {getPropShortCode(res.propertyId)}
                      </span>
                      <span className="text-xs font-semibold text-stone-800 dark:text-stone-100">
                        {res.guestName}
                      </span>
                    </div>
                    {res.status === 'confirmed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickCheckIn(res.id);
                        }}
                        className="text-xs font-semibold bg-orange-50 hover:bg-orange-100 text-[#E67E22] px-3 py-1 rounded-xl transition-colors cursor-pointer"
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
        <div className="lg:col-span-4 bg-white dark:bg-[#18191E] rounded-2xl p-5 border border-stone-200/70 dark:border-zinc-800/70 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-100 dark:border-zinc-800 mb-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-zinc-600" /> SALIDAS HOY ({todayCheckOuts.length})
              </span>
              <span className="text-[11px] font-medium text-stone-400">Check-out</span>
            </div>

            {todayCheckOuts.length === 0 ? (
              <div className="text-center py-8 text-xs font-medium text-stone-400 dark:text-stone-500">
                Sin salidas para hoy
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayCheckOuts.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => onSelectReservation(res)}
                    className="p-3 rounded-xl bg-stone-50/70 dark:bg-zinc-800/50 hover:bg-stone-100/80 dark:hover:bg-zinc-800 border border-stone-100 dark:border-zinc-700/60 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-200/80 dark:bg-zinc-700 text-stone-700 dark:text-stone-200 font-mono">
                        {getPropShortCode(res.propertyId)}
                      </span>
                      <span className="text-xs font-semibold text-stone-800 dark:text-stone-100">
                        {res.guestName}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-md">
                      Salida
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* A Limpiar */}
        <div className="lg:col-span-4 bg-white dark:bg-[#18191E] rounded-2xl p-5 border border-stone-200/70 dark:border-zinc-800/70 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-100 dark:border-zinc-800 mb-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> LIMPIEZAS DEL DÍA ({cleaningTasks.length})
              </span>
              <button
                onClick={() => onNavigateTab('housekeeping')}
                className="text-xs font-semibold text-[#E67E22] hover:underline cursor-pointer"
              >
                Ver todas →
              </button>
            </div>

            <div className="space-y-2.5 max-h-52 sm:max-h-60 overflow-y-auto pr-1">
              {cleaningTasks.slice(0, 6).map((task) => {
                const isCompleted = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50/70 dark:bg-zinc-800/50 border border-stone-100 dark:border-zinc-700/60 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-200/80 dark:bg-zinc-700 text-stone-700 dark:text-stone-200 font-mono">
                        {getPropShortCode(task.propertyId)}
                      </span>
                      <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                        {formatDisplayDate(task.date)}
                      </span>
                      <span className="text-xs font-semibold text-stone-800 dark:text-stone-100">
                        {task.cleanerName.split(' ')[0]}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        onUpdateTaskStatus(
                          task.id,
                          isCompleted ? 'pending' : 'completed'
                        )
                      }
                      className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-900/40'
                          : 'bg-orange-50 text-[#E67E22] border-orange-100 hover:bg-orange-100 dark:bg-orange-950/40 dark:border-orange-900/40'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isCompleted ? 'Lista' : 'Pendiente'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Próximos Check-ins (7 días) & Últimas Reservas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Próximos Check-ins (7 días) */}
        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-5 border border-stone-200/70 dark:border-zinc-800/70 shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-colors">
          <div className="flex items-center justify-between pb-2.5 border-b border-stone-100 dark:border-zinc-800 mb-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-zinc-600" /> PRÓXIMAS LLEGADAS (7 DÍAS)
            </span>
            <span className="text-[11px] font-medium text-stone-400">Calendario</span>
          </div>

          <div className="space-y-2.5">
            {demoState.reservations
              .filter((r) => r.status !== 'cancelled')
              .slice(0, 4)
              .map((res) => (
                <div
                  key={res.id}
                  onClick={() => onSelectReservation(res)}
                  className="p-3 rounded-xl bg-stone-50/70 dark:bg-zinc-800/50 hover:bg-stone-100/80 dark:hover:bg-zinc-800 border border-stone-100 dark:border-zinc-700/60 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-200/80 dark:bg-zinc-700 text-stone-700 dark:text-stone-200 font-mono">
                      {getPropShortCode(res.propertyId)}
                    </span>
                    <span className="text-xs font-semibold text-stone-800 dark:text-stone-100">
                      {res.guestName}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                    {formatDisplayDate(res.checkIn)}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Últimas Reservas */}
        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-5 border border-stone-200/70 dark:border-zinc-800/70 shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-colors">
          <div className="flex items-center justify-between pb-2.5 border-b border-stone-100 dark:border-zinc-800 mb-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22]" /> ÚLTIMAS RESERVAS INGRESADAS
            </span>
            <span className="text-[11px] font-medium text-stone-400">Canales</span>
          </div>

          <div className="space-y-2.5">
            {demoState.reservations
              .filter((r) => r.status !== 'cancelled')
              .slice(0, 4)
              .map((res) => (
                <div
                  key={res.id}
                  onClick={() => onSelectReservation(res)}
                  className="p-3 rounded-xl bg-stone-50/70 dark:bg-zinc-800/50 hover:bg-stone-100/80 dark:hover:bg-zinc-800 border border-stone-100 dark:border-zinc-700/60 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-orange-100 text-[#E67E22] font-mono">
                      {getPropShortCode(res.propertyId)}
                    </span>
                    <span className="text-xs font-semibold text-stone-800 dark:text-stone-100">
                      {res.guestName}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
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
