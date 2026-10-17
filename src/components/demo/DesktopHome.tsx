import React from 'react';
import { DemoState, Reservation } from '../../types';
import { formatCurrency, getCleaningsForDay, toLocalDateStr } from '../../data/initialData';
import { addDays, getBalance, isSettled, shortDayLabel } from './mobile/helpers';
import { isOverdue } from '../../lib/reminders';

/** Pantalla "Hoy" de computadora: tres tarjetas y dos listas cortas, mucho aire. */

interface Props {
  demoState: DemoState;
  onSelectReservation: (res: Reservation) => void;
  onQuickCheckIn: (resId: string) => void;
  onNavigateTab: (tab: string) => void;
}

const CARD = 'bg-white dark:bg-[#1A1B20] border border-stone-300 dark:border-zinc-700 rounded-2xl p-5';
const LINK = 'text-[15px] font-bold text-[#A94F12] dark:text-[#F0A46F] hover:underline cursor-pointer text-left';

const MoneyChip: React.FC<{ res: Reservation }> = ({ res }) =>
  isSettled(res) ? (
    <span className="inline-block px-2.5 py-0.5 rounded-full text-[13px] font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">✓ Pagado</span>
  ) : (
    <span className="inline-block px-2.5 py-0.5 rounded-full text-[13px] font-bold bg-orange-100 text-orange-900 dark:bg-[#3A2A18] dark:text-[#FFC48A]">
      Saldo {formatCurrency(getBalance(res))}
    </span>
  );

export const DesktopHome: React.FC<Props> = ({ demoState, onSelectReservation, onQuickCheckIn, onNavigateTab }) => {
  const todayStr = toLocalDateStr(new Date());
  const unitName = (id: string) => demoState.properties.find((p) => p.id === id)?.name || 'Unidad';
  const active = demoState.reservations.filter((r) => r.status !== 'cancelled');

  const arrivals = active.filter((r) => r.checkIn === todayStr);
  const departures = active.filter((r) => r.checkOut === todayStr);
  // Alojados: los que ya estaban, o los que llegaron hoy y ya hicieron el ingreso
  const staying = active.filter((r) => r.checkIn <= todayStr && r.checkOut > todayStr && (r.checkIn < todayStr || r.status === 'checked_in'));

  const dayTitle = shortDayLabel(todayStr).replace(/^(\S+)\s/, '$1 ');

  // Para atender
  const soonLimit = addDays(todayStr, 7);
  const owing = active.filter((r) => r.checkOut >= todayStr && r.checkIn <= soonLimit && !isSettled(r));
  const owedTotal = owing.reduce((s, r) => s + getBalance(r), 0);
  const cleanings = getCleaningsForDay(demoState.cleaningTasks, todayStr);
  const cleaningDone = cleanings.filter(
    (t) => t.status === 'completed' || t.status === 'inspected' || (t.checklist.length > 0 && t.checklist.every((c) => c.completed))
  ).length;
  const overdueReminders = (demoState.reminders || []).filter((r) => isOverdue(r, todayStr)).length;

  // Próximos movimientos: desde mañana, 7 días
  const upcoming: Array<{ key: string; res: Reservation; when: string; kind: 'in' | 'out' }> = [];
  for (let i = 1; i <= 7; i++) {
    const day = addDays(todayStr, i);
    const label = i === 1 ? 'mañana' : shortDayLabel(day).toLowerCase();
    active.filter((r) => r.checkIn === day).forEach((r) => upcoming.push({ key: `in-${r.id}`, res: r, when: label, kind: 'in' }));
    active.filter((r) => r.checkOut === day).forEach((r) => upcoming.push({ key: `out-${r.id}`, res: r, when: label, kind: 'out' }));
  }
  const upcomingShown = upcoming.slice(0, 5);

  const Row: React.FC<{ label: string; count: string; warn?: boolean; tab: string }> = ({ label, count, warn, tab }) => (
    <button
      type="button"
      onClick={() => onNavigateTab(tab)}
      className="w-full min-h-[48px] flex items-center justify-between gap-3 border-t border-stone-300 dark:border-zinc-700 text-left text-[16px] font-semibold text-stone-900 dark:text-stone-50 cursor-pointer hover:bg-stone-50 dark:hover:bg-zinc-900/60"
    >
      <span>{label}</span>
      <span
        className={`min-w-[34px] text-center px-2 py-1 rounded-[10px] font-bold ${
          warn ? 'bg-orange-100 text-orange-900 dark:bg-[#3A2A18] dark:text-[#FFC48A]' : 'bg-stone-200 text-stone-900 dark:bg-zinc-800 dark:text-stone-50'
        }`}
      >
        {count}
      </span>
    </button>
  );

  const GuestLine: React.FC<{ res: Reservation; extra?: React.ReactNode }> = ({ res, extra }) => (
    <button type="button" onClick={() => onSelectReservation(res)} className="text-left cursor-pointer group">
      <div className="text-[16px] font-bold text-stone-900 dark:text-stone-50 group-hover:underline">{unitName(res.propertyId)}</div>
      <div className="text-[15px] font-semibold text-stone-700 dark:text-stone-200">{res.guestName}</div>
      <div className="mt-1.5 flex flex-wrap items-center gap-2">{extra}</div>
    </button>
  );

  return (
    <div className="w-full max-w-[1000px] mx-auto flex flex-col gap-6 py-4">
      <h1 className="text-[28px] font-bold text-stone-900 dark:text-white tracking-tight">Hoy · {dayTitle}</h1>

      <div className="flex flex-wrap gap-4">
        {/* Llegan hoy */}
        <section className={`${CARD} flex-1 basis-[260px] min-w-0 flex flex-col gap-3.5`}>
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-[16px] font-bold text-stone-700 dark:text-stone-200">Llegan hoy</h2>
            <span className="text-[44px] leading-none font-bold text-stone-900 dark:text-white">{arrivals.length}</span>
          </div>
          <div className="flex-1 flex flex-col gap-3">
            {arrivals.length === 0 && <p className="text-[15px] font-semibold text-stone-700 dark:text-stone-200">Hoy no llega nadie.</p>}
            {arrivals.slice(0, 3).map((r) => (
              <GuestLine
                key={r.id}
                res={r}
                extra={
                  <>
                    <MoneyChip res={r} />
                  </>
                }
              />
            ))}
          </div>
          {arrivals.some((r) => r.status === 'confirmed') && (
            <button
              type="button"
              onClick={() => arrivals.filter((r) => r.status === 'confirmed').forEach((r) => onQuickCheckIn(r.id))}
              className="min-h-[40px] rounded-[10px] bg-[#A94F12] text-white dark:bg-[#F0A46F] dark:text-[#1A1206] font-bold text-[15px] cursor-pointer"
            >
              Registrar ingreso
            </button>
          )}
          <button type="button" onClick={() => onNavigateTab('calendar')} className={LINK}>
            Ver el calendario →
          </button>
        </section>

        {/* Salen hoy */}
        <section className={`${CARD} flex-1 basis-[260px] min-w-0 flex flex-col gap-3.5`}>
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-[16px] font-bold text-stone-700 dark:text-stone-200">Salen hoy</h2>
            <span className="text-[44px] leading-none font-bold text-stone-900 dark:text-white">{departures.length}</span>
          </div>
          <div className="flex-1 flex flex-col gap-3">
            {departures.length === 0 && <p className="text-[15px] font-semibold text-stone-700 dark:text-stone-200">Hoy no sale nadie.</p>}
            {departures.slice(0, 3).map((r) => (
              <GuestLine key={r.id} res={r} extra={<MoneyChip res={r} />} />
            ))}
          </div>
          <button type="button" onClick={() => onNavigateTab('housekeeping')} className={LINK}>
            Ver limpiezas →
          </button>
        </section>

        {/* Alojados ahora */}
        <section className={`${CARD} flex-1 basis-[260px] min-w-0 flex flex-col gap-3.5`}>
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-[16px] font-bold text-stone-700 dark:text-stone-200">Alojados ahora</h2>
            <span className="text-[44px] leading-none font-bold text-stone-900 dark:text-white">{staying.length}</span>
          </div>
          <div className="flex-1 flex flex-col gap-3">
            {staying.length === 0 && <p className="text-[15px] font-semibold text-stone-700 dark:text-stone-200">No hay huéspedes alojados.</p>}
            {staying.slice(0, 3).map((r) => (
              <GuestLine
                key={r.id}
                res={r}
                extra={
                  <>
                    <span className="text-[14px] font-semibold text-stone-700 dark:text-stone-200">sale {shortDayLabel(r.checkOut).toLowerCase()}</span>
                    <MoneyChip res={r} />
                  </>
                }
              />
            ))}
          </div>
          <button type="button" onClick={() => onNavigateTab('bookings')} className={LINK}>
            Ver todos →
          </button>
        </section>
      </div>

      <div className="flex flex-wrap gap-4">
        <section className={`${CARD} flex-1 basis-[320px] min-w-0`}>
          <h2 className="text-[20px] font-semibold text-stone-900 dark:text-white mb-2">Para atender</h2>
          <Row label="Cobros pendientes (7 días)" count={owing.length === 0 ? '0' : `${owing.length} · ${formatCurrency(owedTotal)}`} warn={owing.length > 0} tab="bookings" />
          <Row label="Limpieza de hoy" count={`${cleaningDone}/${cleanings.length}`} tab="housekeeping" />
          <Row label="Recordatorios atrasados" count={String(overdueReminders)} warn={overdueReminders > 0} tab="overview" />
        </section>

        <section className={`${CARD} flex-1 basis-[320px] min-w-0`}>
          <h2 className="text-[20px] font-semibold text-stone-900 dark:text-white mb-2">Próximos movimientos</h2>
          {upcomingShown.length === 0 && (
            <p className="border-t border-stone-300 dark:border-zinc-700 pt-3 text-[15px] font-semibold text-stone-700 dark:text-stone-200">
              No hay movimientos en los próximos 7 días.
            </p>
          )}
          {upcomingShown.map((u) => (
            <button
              key={u.key}
              type="button"
              onClick={() => onSelectReservation(u.res)}
              className="w-full min-h-[56px] py-1.5 flex items-center justify-between gap-3 border-t border-stone-300 dark:border-zinc-700 text-left cursor-pointer hover:bg-stone-50 dark:hover:bg-zinc-900/60"
            >
              <span className="flex flex-col leading-snug min-w-0">
                <span className="text-[16px] font-bold text-stone-900 dark:text-stone-50 truncate">{u.res.guestName}</span>
                <span className="text-[14px] font-semibold text-stone-700 dark:text-stone-200 truncate">
                  {unitName(u.res.propertyId)} · {u.kind === 'in' ? 'ingresa' : 'sale'} {u.when}
                </span>
              </span>
              {isSettled(u.res) ? (
                <span className="text-[14px] font-bold text-emerald-800 dark:text-emerald-300 shrink-0">Pagado</span>
              ) : (
                <span className="text-[14px] font-bold text-orange-900 dark:text-[#FFC48A] shrink-0">Cobrar {formatCurrency(getBalance(u.res))}</span>
              )}
            </button>
          ))}
        </section>
      </div>
    </div>
  );
};
