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
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Onboarding & Plan Request Banner (Only in Public Demo mode for visitors) */}
      {!isLoggedIn && !isBannerDismissed && (
        <div className="bg-[#18181B] dark:bg-[#0C0D0F] rounded-none p-4 sm:p-5 text-white border border-[#27272A] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 relative">
          <button
            onClick={handleDismissBanner}
            className="absolute top-2 right-2 text-zinc-400 hover:text-white p-1 rounded-none transition-colors cursor-pointer"
            title="Ocultar aviso"
            aria-label="Cerrar aviso"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-3 pr-6 md:pr-0">
            <div className="w-9 h-9 rounded-none bg-[#E1500A] flex items-center justify-center text-white font-black shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs sm:text-sm font-black text-[#EFECE5] uppercase tracking-wide">
                  ¿Querés probar con tus departamentos o cabañas reales?
                </h3>
                <span className="text-[9px] sm:text-[10px] font-black bg-[#E1500A]/20 text-[#E1500A] px-2 py-0.5 rounded-none border border-[#E1500A]/40 uppercase">
                  Paso a Paso (2 min)
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#A1A1AA] mt-0.5 line-clamp-1 sm:line-clamp-none max-w-2xl font-medium">
                Cargá los nombres de tus unidades, tarifas y WiFi para ver tu operación real en el calendario, la guía de huéspedes y con Xenia.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            {onOpenOnboardingWizard && (
              <button
                onClick={onOpenOnboardingWizard}
                className="flex-1 md:flex-initial text-xs font-black bg-white text-[#18181B] hover:bg-[#EFECE5] px-3.5 py-2 rounded-none transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs shrink-0 active:scale-98 uppercase tracking-wider"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#E1500A]" />
                <span>Configurar Mis Deptos</span>
              </button>
            )}
            {onRequestPlan && (
              <button
                onClick={onRequestPlan}
                className="flex-1 md:flex-initial text-xs font-black bg-[#E1500A] hover:bg-[#C94305] text-white px-3.5 py-2 rounded-none transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs shrink-0 active:scale-98 uppercase tracking-wider"
              >
                <Send className="w-3 h-3" />
                <span>Solicitar Plan</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Title & Subtitle */}
      <div className="flex items-center justify-between pb-2 border-b border-[#C8C4B7] dark:border-[#222328]">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#71717A] dark:text-[#8E8E93]">
            PANEL PRINCIPAL / DÍA A DÍA
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#18181B] dark:text-white tracking-tight">Hoy en el Complejo</h2>
        </div>
        {isBannerDismissed && onOpenOnboardingWizard && (
          <button
            onClick={onOpenOnboardingWizard}
            className="text-[11px] font-black uppercase tracking-wider text-[#18181B] dark:text-white hover:text-[#E1500A] bg-[#EAE8E3] dark:bg-[#0C0D0F] border border-[#C8C4B7] dark:border-[#222328] px-3 py-1.5 rounded-none transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E1500A]" />
            <span className="hidden sm:inline">Configurar Mis Deptos</span>
            <span className="sm:hidden">Mis Deptos</span>
          </button>
        )}
      </div>

      {/* Top 4 Bento Metric Cards (2x2 on mobile, 4 columns on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Card 1: Ocupados Hoy */}
        <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none p-3.5 sm:p-4 border border-[#C8C4B7] dark:border-[#222328] transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#C8C4B7] dark:border-[#222328]">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#71717A] dark:text-[#8E8E93] truncate">
              Ocupados Hoy
            </span>
            <span className="w-2 h-2 rounded-full bg-[#E1500A] shrink-0" />
          </div>
          <div className="my-2 text-2xl sm:text-3xl font-black text-[#18181B] dark:text-white tracking-tight flex items-baseline gap-1">
            <span>{demoState.properties.length > 0 ? `1` : `0`}</span>
            <span className="text-xs font-bold text-[#71717A] dark:text-[#8E8E93]">
              /{demoState.properties.length}
            </span>
          </div>
          <div className="text-[10px] sm:text-[11px] font-bold text-[#71717A] dark:text-[#8E8E93] truncate">
            Unidades activas
          </div>
        </div>

        {/* Card 2: Ingresos Mes */}
        {userRole === 'admin' ? (
          <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none p-3.5 sm:p-4 border border-[#C8C4B7] dark:border-[#222328] transition-colors flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-[#C8C4B7] dark:border-[#222328]">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#71717A] dark:text-[#8E8E93] truncate">
                Ingresos Mes
              </span>
              <span className="w-2 h-2 rounded-full bg-[#18181B] dark:bg-white shrink-0" />
            </div>
            <div className="my-2 text-xl sm:text-2xl font-black text-[#18181B] dark:text-white tracking-tight truncate">
              USD {totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-[#71717A] dark:text-[#8E8E93] truncate">
              Neto USD {(totalRevenue * 0.76).toFixed(0)}
            </div>
          </div>
        ) : userRole === 'frontdesk' ? (
          <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none p-3.5 sm:p-4 border border-[#C8C4B7] dark:border-[#222328] transition-colors flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-[#C8C4B7] dark:border-[#222328]">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#71717A] dark:text-[#8E8E93] truncate">
                Caja Mostrador
              </span>
              <span className="w-2 h-2 rounded-full bg-[#E1500A] shrink-0" />
            </div>
            <div className="my-2 text-xl sm:text-2xl font-black text-[#18181B] dark:text-white tracking-tight truncate">
              ${currentCashBalance.toLocaleString('es-AR')}
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-[#71717A] dark:text-[#8E8E93] truncate">
              Fondo: $50.000 ARS
            </div>
          </div>
        ) : (
          <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none p-3.5 sm:p-4 border border-[#C8C4B7] dark:border-[#222328] transition-colors flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-[#C8C4B7] dark:border-[#222328]">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#71717A] dark:text-[#8E8E93] truncate">
                Modo Operativo
              </span>
              <span className="w-2 h-2 rounded-full bg-[#18181B] dark:bg-white shrink-0" />
            </div>
            <div className="my-2 text-xl sm:text-2xl font-black text-[#18181B] dark:text-white">
              Día a Día
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-[#71717A] dark:text-[#8E8E93] truncate">
              Métricas ocultas
            </div>
          </div>
        )}

        {/* Card 3: Noches Mes */}
        <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none p-3.5 sm:p-4 border border-[#C8C4B7] dark:border-[#222328] transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#C8C4B7] dark:border-[#222328]">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#71717A] dark:text-[#8E8E93] truncate">
              Noches Mes
            </span>
            <span className="w-2 h-2 rounded-full bg-[#18181B] dark:bg-white shrink-0" />
          </div>
          <div className="my-2 text-2xl sm:text-3xl font-black text-[#18181B] dark:text-white tracking-tight flex items-baseline gap-1">
            <span>{totalNights}</span>
            <span className="text-xs font-bold text-[#71717A] dark:text-[#8E8E93]">~2x</span>
          </div>
          <div className="text-[10px] sm:text-[11px] font-bold text-[#71717A] dark:text-[#8E8E93] truncate">
            Vendidas · prom.
          </div>
        </div>

        {/* Card 4: Check-ins 7D */}
        <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none p-3.5 sm:p-4 border border-[#C8C4B7] dark:border-[#222328] transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#C8C4B7] dark:border-[#222328]">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#71717A] dark:text-[#8E8E93] truncate">
              Check-ins 7D
            </span>
            <span className="w-2 h-2 rounded-full bg-[#E1500A] shrink-0" />
          </div>
          <div className="my-2 text-2xl sm:text-3xl font-black text-[#18181B] dark:text-white tracking-tight">
            {activeReservationsCount}
          </div>
          <div className="text-[10px] sm:text-[11px] font-bold text-[#71717A] dark:text-[#8E8E93] truncate">
            Próximas llegadas
          </div>
        </div>
      </div>

      {/* Row 2: Check-ins HOY, Check-outs HOY, A Limpiar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3">
        {/* Check-ins HOY */}
        <div className="lg:col-span-4 bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none p-4 sm:p-5 border border-[#C8C4B7] dark:border-[#222328] flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#C8C4B7] dark:border-[#222328] mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#71717A] dark:text-[#8E8E93]">
                LLEGADAS / CHECK-INS HOY ({todayCheckIns.length})
              </span>
              <span className="w-2 h-2 rounded-full bg-[#E1500A]" />
            </div>

            {todayCheckIns.length === 0 ? (
              <div className="text-center py-6 text-xs font-bold text-[#71717A] dark:text-[#8E8E93]">
                Sin check-ins para hoy
              </div>
            ) : (
              <div className="space-y-2">
                {todayCheckIns.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => onSelectReservation(res)}
                    className="p-2.5 rounded-none bg-white dark:bg-[#18181B] hover:border-[#18181B] dark:hover:border-white border border-[#C8C4B7] dark:border-[#222328] transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-none bg-[#18181B] text-white dark:bg-white dark:text-[#18181B]">
                        {getPropShortCode(res.propertyId)}
                      </span>
                      <span className="text-xs font-bold text-[#18181B] dark:text-white">
                        {res.guestName}
                      </span>
                    </div>
                    {res.status === 'confirmed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickCheckIn(res.id);
                        }}
                        className="text-[10px] font-black bg-[#E1500A] text-white hover:bg-[#C94305] px-2.5 py-1 rounded-none transition-colors cursor-pointer uppercase"
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
        <div className="lg:col-span-4 bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none p-4 sm:p-5 border border-[#C8C4B7] dark:border-[#222328] flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#C8C4B7] dark:border-[#222328] mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#71717A] dark:text-[#8E8E93]">
                SALIDAS / CHECK-OUTS HOY ({todayCheckOuts.length})
              </span>
              <span className="w-2 h-2 rounded-full bg-[#18181B] dark:bg-white" />
            </div>

            {todayCheckOuts.length === 0 ? (
              <div className="text-center py-6 text-xs font-bold text-[#71717A] dark:text-[#8E8E93]">
                Sin check-outs para hoy
              </div>
            ) : (
              <div className="space-y-2">
                {todayCheckOuts.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => onSelectReservation(res)}
                    className="p-2.5 rounded-none bg-white dark:bg-[#18181B] hover:border-[#18181B] dark:hover:border-white border border-[#C8C4B7] dark:border-[#222328] transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-none bg-[#71717A] text-white">
                        {getPropShortCode(res.propertyId)}
                      </span>
                      <span className="text-xs font-bold text-[#18181B] dark:text-white">
                        {res.guestName}
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-[#71717A] dark:text-[#8E8E93] bg-[#EAE8E3] dark:bg-[#0C0D0F] px-2 py-0.5 rounded-none border border-[#C8C4B7] dark:border-[#222328] uppercase">
                      ✓ Salida
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* A Limpiar */}
        <div className="lg:col-span-4 bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none p-4 sm:p-5 border border-[#C8C4B7] dark:border-[#222328] flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#C8C4B7] dark:border-[#222328] mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#71717A] dark:text-[#8E8E93]">
                OPERACIONES / MUCAMAS ({cleaningTasks.length})
              </span>
              <button
                onClick={() => onNavigateTab('housekeeping')}
                className="text-[10px] font-black text-[#E1500A] hover:underline cursor-pointer uppercase"
              >
                Ver todas →
              </button>
            </div>

            <div className="space-y-2 max-h-48 sm:max-h-56 overflow-y-auto pr-1">
              {cleaningTasks.slice(0, 6).map((task) => {
                const isCompleted = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2 rounded-none bg-white dark:bg-[#18181B] border border-[#C8C4B7] dark:border-[#222328] text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-none bg-[#18181B] text-white dark:bg-white dark:text-[#18181B]">
                        {getPropShortCode(task.propertyId)}
                      </span>
                      <span className="text-[11px] font-bold text-[#71717A] dark:text-[#8E8E93]">
                        {formatDisplayDate(task.date)}
                      </span>
                      <span className="text-xs font-bold text-[#18181B] dark:text-white">
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
                      className={`px-2.5 py-0.5 rounded-none text-[10px] font-black flex items-center gap-1 transition-colors cursor-pointer border uppercase ${
                        isCompleted
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-[#E1500A] text-white border-[#E1500A] hover:bg-[#C94305]'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>{isCompleted ? 'Limpio' : 'Marcar'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Próximos Check-ins (7 días) & Últimas Reservas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-3">
        {/* Próximos Check-ins (7 días) */}
        <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none p-4 sm:p-5 border border-[#C8C4B7] dark:border-[#222328] transition-colors">
          <div className="flex items-center justify-between pb-2 border-b border-[#C8C4B7] dark:border-[#222328] mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#71717A] dark:text-[#8E8E93]">
              PRÓXIMAS LLEGADAS (7 DÍAS)
            </span>
            <span className="w-2 h-2 rounded-full bg-[#18181B] dark:bg-white" />
          </div>

          <div className="space-y-2">
            {demoState.reservations
              .filter((r) => r.status !== 'cancelled')
              .slice(0, 4)
              .map((res) => (
                <div
                  key={res.id}
                  onClick={() => onSelectReservation(res)}
                  className="p-2.5 rounded-none bg-white dark:bg-[#18181B] hover:border-[#18181B] dark:hover:border-white border border-[#C8C4B7] dark:border-[#222328] transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-none bg-[#18181B] text-white dark:bg-white dark:text-[#18181B]">
                      {getPropShortCode(res.propertyId)}
                    </span>
                    <span className="text-xs font-bold text-[#18181B] dark:text-white">
                      {res.guestName}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#71717A] dark:text-[#8E8E93]">
                    {formatDisplayDate(res.checkIn)}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Últimas Reservas */}
        <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none p-4 sm:p-5 border border-[#C8C4B7] dark:border-[#222328] transition-colors">
          <div className="flex items-center justify-between pb-2 border-b border-[#C8C4B7] dark:border-[#222328] mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#71717A] dark:text-[#8E8E93]">
              ÚLTIMAS RESERVAS INGRESADAS
            </span>
            <span className="w-2 h-2 rounded-full bg-[#E1500A]" />
          </div>

          <div className="space-y-2">
            {demoState.reservations
              .filter((r) => r.status !== 'cancelled')
              .slice(0, 4)
              .map((res) => (
                <div
                  key={res.id}
                  onClick={() => onSelectReservation(res)}
                  className="p-2.5 rounded-none bg-white dark:bg-[#18181B] hover:border-[#18181B] dark:hover:border-white border border-[#C8C4B7] dark:border-[#222328] transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-none bg-[#E1500A] text-white">
                      {getPropShortCode(res.propertyId)}
                    </span>
                    <span className="text-xs font-bold text-[#18181B] dark:text-white">
                      {res.guestName}
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-none border border-emerald-500/20 uppercase tracking-wider">
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
