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
  RotateCw,
  DoorOpen,
  DoorClosed,
  DollarSign,
  CreditCard,
  AlertCircle,
  TrendingUp,
  MessageCircle,
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const today = getRelativeDate(0);
  const totalUnits = demoState.properties.length;

  // Stays overlapping today (in-house)
  const inHouseStays = demoState.reservations.filter(
    (r) =>
      r.status !== 'cancelled' &&
      ((r.checkIn <= today && r.checkOut > today) ||
        (r.checkIn === today && (r.status === 'checked_in' || r.status === 'confirmed')))
  );

  const occupiedPropertyIds = new Set(inHouseStays.map((r) => r.propertyId));
  const occupiedUnitsCount = totalUnits > 0 ? Math.min(totalUnits, occupiedPropertyIds.size) : 0;
  const occupancyPercent = totalUnits > 0 ? Math.round((occupiedUnitsCount / totalUnits) * 100) : 0;

  // Today's arrivals and departures
  const todayCheckIns = demoState.reservations.filter(
    (r) => r.checkIn === today && r.status !== 'cancelled'
  );

  const todayCheckOuts = demoState.reservations.filter(
    (r) => r.checkOut === today && r.status !== 'cancelled'
  );

  // Cleaning tasks for today
  const cleaningTasks = demoState.cleaningTasks;
  const pendingCleanings = cleaningTasks.filter(
    (c) => c.status !== 'completed' && c.status !== 'inspected'
  );

  // Cobros & señas pendientes de cobro (estadías de hoy o en curso)
  const next7Days = getRelativeDate(7);
  const currentAndUpcomingStays = demoState.reservations.filter(
    (r) => r.status !== 'cancelled' && r.checkOut >= today && r.checkIn <= next7Days
  );

  const pendingPaymentStays = currentAndUpcomingStays.filter(
    (r) => r.paymentStatus !== 'paid'
  );

  const pendingPaymentAmount = pendingPaymentStays.reduce(
    (sum, r) => sum + (r.totalAmount || 0),
    0
  );

  // Monthly revenue & nights calculation: strictly for the current month
  const currentMonthPrefix = today.slice(0, 7);
  const currentMonthStays = demoState.reservations.filter(
    (r) =>
      r.status !== 'cancelled' &&
      (r.checkIn.startsWith(currentMonthPrefix) || r.checkOut.startsWith(currentMonthPrefix))
  );

  const monthlyNights = totalUnits > 0
    ? (currentMonthStays.reduce((acc, r) => acc + (r.nights || 0), 0) || Math.round(totalUnits * 30 * 0.72))
    : 0;
  const monthlyRevenue = totalUnits > 0
    ? (currentMonthStays.reduce((acc, r) => acc + (r.totalAmount || 0), 0) || 4850)
    : 0;

  // Cash movements for frontdesk preview
  const openingCash = totalUnits > 0 ? 50000 : 0;
  const cashMovements = demoState.cashMovements || [];
  const cashMovementsOnly = cashMovements.filter((m) => m.paymentMethod === 'efectivo');
  const cashIn = cashMovementsOnly
    .filter((m) => m.type === 'ingreso')
    .reduce((sum, m) => sum + m.amount, 0);
  const currentCashBalance = openingCash + cashIn;

  // Property resolvers
  const getProp = (propId: string) => {
    return demoState.properties.find((p) => p.id === propId);
  };

  const getPropName = (propId: string) => {
    const p = getProp(propId);
    if (p) return p.name;
    return 'Sin unidad asignada';
  };

  // Quick mark paid
  const handleMarkPaid = (resId: string, guestName: string) => {
    const res = demoState.reservations.find((r) => r.id === resId);
    if (res) {
      res.paymentStatus = 'paid';
      showToast(`✓ Cobro registrado con éxito para ${guestName}`);
    }
  };

  // Quick check-out
  const handleQuickCheckOut = (resId: string, guestName: string) => {
    const res = demoState.reservations.find((r) => r.id === resId);
    if (res) {
      res.status = 'checked_out';
      showToast(`✓ Salida registrada para ${guestName}. Unidad enviada a Limpieza.`);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-stone-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-[#E67E22]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header: Titular Operativo y Estado en Vivo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-stone-100 dark:border-zinc-800/80 gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#E67E22] bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-md inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Guardia Operativa en Vivo
            </span>
            <span className="text-xs text-stone-400 font-light">
              • {totalUnits} unidades activas
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-light text-stone-900 dark:text-stone-100 tracking-tight">
            Hoy en el <span className="font-semibold text-stone-800 dark:text-stone-200">Complejo</span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-stone-600 dark:text-zinc-300 bg-white dark:bg-zinc-800/50 px-3.5 py-1.5 rounded-xl border border-stone-200/70 dark:border-zinc-700/60 shadow-2xs">
            {formatDisplayDate(today)}
          </span>
          <button
            onClick={onOpenNewReservation}
            className="text-xs font-semibold bg-[#E67E22] hover:bg-[#d36d16] text-white px-3.5 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1"
          >
            <span>+ Nueva Reserva</span>
          </button>
        </div>
      </div>

      {/* Aviso destacado para configurar el complejo si no hay unidades cargadas */}
      {demoState.properties.length === 0 && (
        <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-emerald-500/10 border-2 border-dashed border-[#E67E22]/40 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#E67E22]/15 text-[#E67E22] flex items-center justify-center shadow-inner">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              Configurá tu complejo
            </h3>
            <p className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed">
              Todavía no tenés cabañas o departamentos dados de alta. Iniciá el asistente de configuración para cargar tus unidades, fotos, reglas y servicios en pocos minutos.
            </p>
          </div>
          {onOpenOnboardingWizard && (
            <button
              onClick={onOpenOnboardingWizard}
              className="inline-flex items-center gap-2 bg-[#E67E22] hover:bg-[#d36d16] text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Configurar mi complejo ahora</span>
            </button>
          )}
        </div>
      )}

      {/* 4 Bento KPI Cards: Métricas Coherentes con el Complejo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Ocupación Hoy */}
        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-4 sm:p-5 border border-stone-200/70 dark:border-zinc-800/80 shadow-[0_4px_16px_rgba(0,0,0,0.015)] transition-all flex flex-col justify-between hover:border-orange-200/50">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
            <span className="text-[11px] font-semibold text-stone-600 dark:text-zinc-400 truncate">
              Ocupación Hoy
            </span>
            <span className="w-2 h-2 rounded-full bg-[#E67E22] shadow-[0_0_8px_rgba(230,126,34,0.4)] shrink-0" />
          </div>
          <div className="my-2 text-2xl sm:text-3xl font-light text-stone-900 dark:text-stone-100 tracking-tight flex items-baseline gap-1.5">
            <span className="font-bold text-stone-800 dark:text-stone-100">
              {occupiedUnitsCount}/{totalUnits}
            </span>
            <span className="text-xs font-medium text-stone-500 dark:text-zinc-400">
              unidades
            </span>
          </div>
          <div className="text-[11px] font-medium text-[#E67E22] bg-orange-50/70 dark:bg-orange-950/40 px-2 py-0.5 rounded-md inline-block w-max">
            {occupancyPercent}% ocupado hoy
          </div>
        </div>

        {/* Card 2: Movimientos del Día (Llegadas & Salidas) */}
        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-4 sm:p-5 border border-stone-200/70 dark:border-zinc-800/80 shadow-[0_4px_16px_rgba(0,0,0,0.015)] transition-all flex flex-col justify-between hover:border-blue-200/50">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
            <span className="text-[11px] font-semibold text-stone-600 dark:text-zinc-400 truncate">
              Movimientos Hoy
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
          </div>
          <div className="my-2 text-2xl sm:text-3xl font-light text-stone-900 dark:text-stone-100 tracking-tight flex items-baseline gap-1.5">
            <span className="font-bold text-stone-800 dark:text-stone-100">
              {todayCheckIns.length}
            </span>
            <span className="text-xs font-normal text-stone-500">llegadas</span>
            <span className="text-stone-300 dark:text-zinc-600">•</span>
            <span className="font-bold text-stone-800 dark:text-stone-100">
              {todayCheckOuts.length}
            </span>
            <span className="text-xs font-normal text-stone-500">salidas</span>
          </div>
          <div className="text-[11px] font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md inline-block w-max">
            Check-in 14hs • Out 10hs
          </div>
        </div>

        {/* Card 3: Limpiezas & Recambios */}
        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-4 sm:p-5 border border-stone-200/70 dark:border-zinc-800/80 shadow-[0_4px_16px_rgba(0,0,0,0.015)] transition-all flex flex-col justify-between hover:border-amber-200/50">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
            <span className="text-[11px] font-semibold text-stone-600 dark:text-zinc-400 truncate">
              Limpiezas de Hoy
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          </div>
          <div className="my-2 text-2xl sm:text-3xl font-light text-stone-900 dark:text-stone-100 tracking-tight flex items-baseline gap-1.5">
            <span className="font-bold text-[#E67E22]">
              {pendingCleanings.length}
            </span>
            <span className="text-xs font-normal text-stone-500">
              por preparar
            </span>
          </div>
          <div className="text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md inline-block w-max">
            {cleaningTasks.length - pendingCleanings.length} de {cleaningTasks.length} listas OK
          </div>
        </div>

        {/* Card 4: Cobros & Señas Pendientes */}
        <div className="bg-white dark:bg-[#18191E] rounded-2xl p-4 sm:p-5 border border-stone-200/70 dark:border-zinc-800/80 shadow-[0_4px_16px_rgba(0,0,0,0.015)] transition-all flex flex-col justify-between hover:border-emerald-200/50">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
            <span className="text-[11px] font-semibold text-stone-600 dark:text-zinc-400 truncate">
              Cobros / Señas Pendientes
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          </div>
          <div className="my-2 text-2xl sm:text-3xl font-light text-stone-900 dark:text-stone-100 tracking-tight flex items-baseline gap-1.5">
            <span className="font-bold text-stone-800 dark:text-stone-100">
              {formatCurrency(pendingPaymentAmount, 'USD')}
            </span>
          </div>
          <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md inline-block w-max">
            {pendingPaymentStays.length} saldo{pendingPaymentStays.length === 1 ? '' : 's'} a cobrar
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* JERARQUÍA OPERATIVA MÁXIMA: LOS 4 PILARES URGENTES DE HOY               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ===================================================================== */}
        {/* PILAR 1: 🚪 QUIÉN LLEGA HOY (Check-ins)                               */}
        {/* ===================================================================== */}
        <div className="bg-white dark:bg-[#18191E] rounded-3xl p-5 sm:p-6 border border-stone-200/70 dark:border-zinc-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
              <h2 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider font-mono">
                Quién Llega Hoy ({todayCheckIns.length})
              </h2>
            </div>
            <span className="text-[11px] font-medium text-stone-500 dark:text-zinc-400">
              Ingresos a partir de 14:00 hs
            </span>
          </div>

          {todayCheckIns.length === 0 ? (
            <div className="py-10 text-center text-xs text-stone-400 font-light border border-dashed border-stone-200 dark:border-zinc-800 rounded-2xl">
              No hay más check-ins programados para el día de hoy.
            </div>
          ) : (
            <div className="space-y-3">
              {todayCheckIns.map((res) => {
                const isCheckedIn = res.status === 'checked_in';
                const isPaid = res.paymentStatus === 'paid';

                return (
                  <div
                    key={res.id}
                    className="p-4 rounded-2xl bg-[#FCFAF8] dark:bg-zinc-900/60 border border-stone-200/80 dark:border-zinc-800/80 hover:border-orange-200/80 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        {/* Nombre de la unidad destacado */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-stone-900 text-white dark:bg-white dark:text-stone-900">
                            {getPropName(res.propertyId)}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase bg-orange-50 text-[#E67E22] dark:bg-orange-950/40">
                            {res.platform} • {res.nights} noches
                          </span>
                          {res.earlyCheckIn && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/40">
                              ⏰ Early Check-in
                            </span>
                          )}
                        </div>

                        {/* Nombre del huésped y teléfono */}
                        <div className="flex items-center gap-2 pt-0.5">
                          <h3 className="text-sm font-bold text-stone-900 dark:text-white truncate">
                            {res.guestName}
                          </h3>
                          {res.guestPhone && (
                            <span className="text-[11px] font-mono text-stone-400">
                              {res.guestPhone}
                            </span>
                          )}
                        </div>

                        {/* Clave de cerradura y cobro */}
                        <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-zinc-400 flex-wrap pt-0.5">
                          <span className="flex items-center gap-1 font-mono text-stone-700 dark:text-zinc-300">
                            <KeyRound className="w-3.5 h-3.5 text-[#E67E22]" />
                            PIN: <strong>{res.pinCode || '4001'}</strong>
                          </span>
                          <span>• Total: <strong>{formatCurrency(res.totalAmount, 'USD')}</strong></span>
                          <span className={isPaid ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                            • {isPaid ? 'Pagado 100%' : 'Saldo pendiente'}
                          </span>
                        </div>
                      </div>

                      {/* Estado visual */}
                      <div className="shrink-0">
                        {isCheckedIn ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-xl">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Ingresado
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-stone-400 bg-stone-100 dark:bg-zinc-800 px-2.5 py-1 rounded-xl">
                            Por llegar
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Botones de acción directa */}
                    <div className="flex items-center justify-between pt-1 border-t border-stone-200/50 dark:border-zinc-800/60">
                      <button
                        onClick={() => onSelectReservation(res)}
                        className="text-xs font-medium text-stone-600 dark:text-zinc-300 hover:text-stone-900 cursor-pointer"
                      >
                        Ver Ficha Completa →
                      </button>

                      <div className="flex items-center gap-2">
                        {!isCheckedIn && (
                          <button
                            onClick={() => onQuickCheckIn(res.id)}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#E67E22] hover:bg-[#d36d16] text-white transition-all cursor-pointer shadow-xs flex items-center gap-1"
                          >
                            <DoorOpen className="w-3.5 h-3.5" />
                            <span>Registrar Llegada</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ===================================================================== */}
        {/* PILAR 2: 🏃 QUIÉN SE VA HOY (Check-outs)                              */}
        {/* ===================================================================== */}
        <div className="bg-white dark:bg-[#18191E] rounded-3xl p-5 sm:p-6 border border-stone-200/70 dark:border-zinc-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs" />
              <h2 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider font-mono">
                Quién Se Va Hoy ({todayCheckOuts.length})
              </h2>
            </div>
            <span className="text-[11px] font-medium text-stone-500 dark:text-zinc-400">
              Límite hasta las 10:00 hs
            </span>
          </div>

          {todayCheckOuts.length === 0 ? (
            <div className="py-10 text-center text-xs text-stone-400 font-light border border-dashed border-stone-200 dark:border-zinc-800 rounded-2xl">
              No hay salidas previstas para hoy.
            </div>
          ) : (
            <div className="space-y-3">
              {todayCheckOuts.map((res) => {
                const isCheckedOut = res.status === 'checked_out';
                const hasSameDayChangeover = todayCheckIns.some(
                  (inRes) => inRes.propertyId === res.propertyId
                );

                return (
                  <div
                    key={res.id}
                    className="p-4 rounded-2xl bg-[#FCFAF8] dark:bg-zinc-900/60 border border-stone-200/80 dark:border-zinc-800/80 hover:border-rose-200/80 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        {/* Nombre de la unidad destacado */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-stone-900 text-white dark:bg-white dark:text-stone-900">
                            {getPropName(res.propertyId)}
                          </span>
                          {hasSameDayChangeover && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase bg-orange-100 text-[#E67E22] dark:bg-orange-950/50 flex items-center gap-1">
                              <RotateCw className="w-2.5 h-2.5 animate-spin-slow" />
                              <span>Recambio Hoy</span>
                            </span>
                          )}
                          <span className="text-[10px] text-stone-400 font-mono">
                            {res.nights} noches concluidas
                          </span>
                        </div>

                        {/* Huésped */}
                        <div className="flex items-center gap-2 pt-0.5">
                          <h3 className="text-sm font-bold text-stone-900 dark:text-white truncate">
                            {res.guestName}
                          </h3>
                          {res.specialNotes && (
                            <span className="text-[11px] text-stone-500 font-light truncate max-w-xs">
                              • {res.specialNotes}
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-stone-500 font-light">
                          Total estadía: <strong>{formatCurrency(res.totalAmount, 'USD')}</strong>
                        </div>
                      </div>

                      {/* Estado */}
                      <div className="shrink-0">
                        {isCheckedOut ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500 bg-stone-100 dark:bg-zinc-800 px-2.5 py-1 rounded-xl">
                            Salida Realizada
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-xl">
                            Salida Pendiente
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center justify-between pt-1 border-t border-stone-200/50 dark:border-zinc-800/60">
                      <button
                        onClick={() => onSelectReservation(res)}
                        className="text-xs font-medium text-stone-600 dark:text-zinc-300 hover:text-stone-900 cursor-pointer"
                      >
                        Ver Detalle →
                      </button>

                      {!isCheckedOut && (
                        <button
                          onClick={() => handleQuickCheckOut(res.id, res.guestName)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-stone-900 hover:bg-black text-white dark:bg-white dark:text-stone-900 transition-all cursor-pointer shadow-xs flex items-center gap-1"
                        >
                          <DoorClosed className="w-3.5 h-3.5" />
                          <span>Registrar Salida</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ===================================================================== */}
        {/* PILAR 3: 🧹 UNIDADES PENDIENTES DE LIMPIEZA & RECAMBIO               */}
        {/* ===================================================================== */}
        <div className="bg-white dark:bg-[#18191E] rounded-3xl p-5 sm:p-6 border border-stone-200/70 dark:border-zinc-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />
              <h2 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider font-mono">
                Limpiezas de Unidades ({cleaningTasks.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('housekeeping')}
              className="text-xs font-semibold text-[#E67E22] hover:underline cursor-pointer"
            >
              Abrir App Mucamas →
            </button>
          </div>

          <div className="space-y-3">
            {cleaningTasks.map((task) => {
              const isCompleted =
                task.status === 'completed' || task.status === 'inspected';
              const isUrgent = task.notes?.toLowerCase().includes('recambio');

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                    isCompleted
                      ? 'bg-emerald-50/25 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40'
                      : 'bg-[#FCFAF8] dark:bg-zinc-900/60 border-stone-200/80 dark:border-zinc-800/80 hover:border-amber-200/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      {/* NOMBRE DE LA UNIDAD BIEN CLARO Y VISIBLE */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-stone-900 text-white dark:bg-white dark:text-stone-900">
                          {getPropName(task.propertyId)}
                        </span>
                        {isUrgent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/50">
                            ⚡ Prioridad Recambio
                          </span>
                        )}
                        <span className="text-xs text-stone-500 font-light">
                          {task.scheduledTime}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-zinc-300">
                        <span>Mucama asignada: <strong>{task.cleanerName}</strong></span>
                      </div>

                      {task.notes && (
                        <p className="text-[11px] text-stone-500 dark:text-zinc-400 font-light truncate max-w-sm">
                          {task.notes}
                        </p>
                      )}
                    </div>

                    {/* Botón rápido táctil: Lista OK */}
                    <div className="shrink-0">
                      <button
                        onClick={() =>
                          onUpdateTaskStatus(
                            task.id,
                            isCompleted ? 'pending' : 'inspected'
                          )
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border shadow-2xs ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-800'
                            : 'bg-amber-500 hover:bg-amber-600 text-white border-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{isCompleted ? 'Unidad Lista OK' : 'Marcar Lista'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* PILAR 4: 💳 COBROS & SEÑAS PENDIENTES                                 */}
        {/* ===================================================================== */}
        <div className="bg-white dark:bg-[#18191E] rounded-3xl p-5 sm:p-6 border border-stone-200/70 dark:border-zinc-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
              <h2 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider font-mono">
                Cobros & Señas Pendientes ({pendingPaymentStays.length})
              </h2>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              Total: {formatCurrency(pendingPaymentAmount, 'USD')}
            </span>
          </div>

          {pendingPaymentStays.length === 0 ? (
            <div className="py-10 text-center text-xs text-stone-400 font-light border border-dashed border-stone-200 dark:border-zinc-800 rounded-2xl">
              ¡Al día! No hay cobros ni señas pendientes registradas en este período.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPaymentStays.map((res) => (
                <div
                  key={res.id}
                  className="p-4 rounded-2xl bg-[#FCFAF8] dark:bg-zinc-900/60 border border-stone-200/80 dark:border-zinc-800/80 hover:border-emerald-200/80 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      {/* Unidad destacada */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-stone-900 text-white dark:bg-white dark:text-stone-900">
                          {getPropName(res.propertyId)}
                        </span>
                        <span className="text-xs text-stone-400 font-light">
                          Llegada: {formatDisplayDate(res.checkIn)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-0.5">
                        <h3 className="text-sm font-bold text-stone-900 dark:text-white truncate">
                          {res.guestName}
                        </h3>
                        {res.guestPhone && (
                          <span className="text-[11px] font-mono text-stone-400">
                            {res.guestPhone}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                        Saldo a cobrar: {formatCurrency(res.totalAmount, 'USD')} ({res.platform.toUpperCase()})
                      </div>
                    </div>

                    {/* Botón rápido para asentar cobro */}
                    <div className="shrink-0">
                      <button
                        onClick={() => handleMarkPaid(res.id, res.guestName)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer shadow-xs flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Cobro Recibido</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN SECUNDARIA (Menor prioridad visual, al pie de la pantalla)        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2">
        {/* Resumen Mensual Coherente */}
        <div className="bg-white dark:bg-[#18191E] rounded-3xl p-5 border border-stone-200/70 dark:border-zinc-800/80 shadow-[0_4px_16px_rgba(0,0,0,0.015)] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-zinc-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Rendimiento del Mes
            </span>
            <span className="text-xs font-bold text-emerald-600">
              {formatCurrency(monthlyRevenue, 'USD')}
            </span>
          </div>
          <p className="text-xs text-stone-500 font-light">
            {monthlyNights} noches vendidas en el mes ({Math.round((monthlyNights / (totalUnits * 30)) * 100)}% ocupación promedio).
          </p>
          <div className="flex items-center justify-between text-xs text-stone-400 pt-1">
            <span>Caja Chica Mostrador:</span>
            <strong className="text-stone-800 dark:text-stone-200 font-mono">
              {formatCurrency(currentCashBalance, 'ARS')}
            </strong>
          </div>
        </div>

        {/* Canales Activos */}
        <div className="bg-white dark:bg-[#18191E] rounded-3xl p-5 border border-stone-200/70 dark:border-zinc-800/80 shadow-[0_4px_16px_rgba(0,0,0,0.015)] space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block pb-1 border-b border-stone-100 dark:border-zinc-800">
            Canales de Venta Sincronizados
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2 rounded-xl bg-orange-50/70 text-[#E67E22] dark:bg-orange-950/40 font-medium text-center">
              Airbnb iCal (OK)
            </div>
            <div className="p-2 rounded-xl bg-emerald-50/70 text-emerald-700 dark:bg-emerald-950/40 font-medium text-center">
              Directa 0% (OK)
            </div>
            <div className="p-2 rounded-xl bg-blue-50/70 text-blue-700 dark:bg-blue-950/40 font-medium text-center">
              Booking.com (OK)
            </div>
            <div className="p-2 rounded-xl bg-purple-50/70 text-purple-700 dark:bg-purple-950/40 font-medium text-center">
              Portal Huésped (OK)
            </div>
          </div>
        </div>

        {/* Onboarding Asistido (Discreto, menor peso visual) */}
        <div className="bg-[#FAF9F6] dark:bg-[#15161A] rounded-3xl p-5 border border-stone-200/80 dark:border-zinc-800/80 flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[10px] font-bold text-[#E67E22] uppercase tracking-wider">
              Configuración del Alojamiento
            </span>
            <h4 className="text-xs font-bold text-stone-800 dark:text-stone-100 mt-1">
              ¿Querés cargar más cabañas o departamentos?
            </h4>
            <p className="text-[11px] text-stone-500 font-light mt-0.5">
              Configurá fotos, WiFi y cerraduras inteligentes en minutos.
            </p>
          </div>
          {onOpenOnboardingWizard && (
            <button
              onClick={onOpenOnboardingWizard}
              className="text-xs font-semibold text-stone-700 dark:text-stone-200 hover:text-stone-900 bg-white dark:bg-zinc-800 border border-stone-200/80 dark:border-zinc-700 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer self-start"
            >
              Configurar Unidades →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
