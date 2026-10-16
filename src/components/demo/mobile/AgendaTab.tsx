import React, { useState } from 'react';
import { Search, X, Plus, ChevronDown, ChevronRight, MessageCircle, Phone, ArrowRight, Check } from 'lucide-react';
import type { DemoState, Reservation, Reminder } from '../../../types';
import { formatCurrency, getGuestInitials, getCleaningsForDay } from '../../../data/initialData';
import { completeReminder, reopenReminder, isOverdue, REPEAT_LABEL } from '../../../lib/reminders';
import { addDays, compareForDirectory, daysBetween, formatShortDateRange, getBalance, isSettled, shortDayLabel } from './helpers';
import { ReminderSheet } from './ReminderSheet';

export type AgendaView = 'day' | 'list';

interface AgendaTabProps {
  demoState: DemoState;
  reminders: Reminder[];
  todayStr: string;
  view: AgendaView;
  onChangeView: (v: AgendaView) => void;
  onOpenWhatsApp: (res: Reservation) => void;
  onOpenReservationDetail: (res: Reservation) => void;
  onToggleCleaningStatus: (taskId: string, currentStatus: string) => void;
  onSaveReminder: (r: Reminder) => Promise<void> | void;
  onDeleteReminder: (id: string) => Promise<void> | void;
}

/** Cuántos días después de "Mañana" se muestran (solo los que tienen movimiento) */
const UPCOMING_DAYS = 14;
const SEARCH_LIMIT = 40;

type Tag = { label: string; cls: string };
const TAG_IN: Tag = { label: '🟢 Ingresa', cls: 'bg-emerald-100 text-emerald-950 dark:bg-emerald-900/60 dark:text-emerald-50' };
const TAG_OUT: Tag = { label: '🔴 Sale', cls: 'bg-rose-100 text-rose-950 dark:bg-rose-900/60 dark:text-rose-50' };

const CARD =
  'bg-white dark:bg-[#1A1B20] border border-stone-300/80 dark:border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.04)]';

/* ------------------------------------------------------------------ */
/* Botones de acción: WhatsApp · llamar · ficha                        */
/* ------------------------------------------------------------------ */
const ActionButtons: React.FC<{ res: Reservation; onWhatsApp: () => void; onDetail: () => void }> = ({ res, onWhatsApp, onDetail }) => (
  <div className="flex items-center gap-2 shrink-0">
    <button
      onClick={onWhatsApp}
      aria-label={`WhatsApp y guía para ${res.guestName}`}
      title="Enviar WhatsApp & Guía"
      className="w-10 h-10 rounded-xl bg-[#D4F2DC] hover:bg-[#C2ECCD] dark:bg-[#1C3B24] dark:hover:bg-[#254C2E] text-[#136B36] dark:text-[#6EE08F] flex items-center justify-center transition-colors cursor-pointer"
    >
      <MessageCircle className="w-5 h-5 stroke-[2.2]" />
    </button>
    <a
      href={`tel:${res.guestPhone}`}
      aria-label={`Llamar a ${res.guestName}`}
      title="Llamar al huésped"
      className="w-10 h-10 rounded-xl bg-[#E4DDD1] hover:bg-[#D9D0C1] dark:bg-[#2A2B32] dark:hover:bg-[#34353E] text-[#3A352D] dark:text-gray-100 flex items-center justify-center transition-colors cursor-pointer"
    >
      <Phone className="w-5 h-5 stroke-[2.2]" />
    </a>
    <button
      onClick={onDetail}
      aria-label={`Abrir ficha de ${res.guestName}`}
      title="Ver ficha completa"
      className="w-10 h-10 rounded-xl bg-[#F6D2B8] hover:bg-[#F0C2A0] dark:bg-[#3E281C] dark:hover:bg-[#4E3324] text-[#8F3B08] dark:text-[#FFB27F] flex items-center justify-center transition-colors cursor-pointer"
    >
      <ArrowRight className="w-5 h-5 stroke-[2.5]" />
    </button>
  </div>
);

const BalanceText: React.FC<{ res: Reservation }> = ({ res }) =>
  isSettled(res) ? (
    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">✓ Pagado</span>
  ) : (
    <span className="text-xs font-bold text-[#8F3B08] dark:text-[#FFB27F]">Saldo {formatCurrency(getBalance(res))} pendiente</span>
  );

/* ------------------------------------------------------------------ */
/* Fila de movimiento (ingresa / sale / alojado)                       */
/* ------------------------------------------------------------------ */
const ResRow: React.FC<{
  res: Reservation;
  unit: string;
  tag: Tag;
  onWhatsApp: () => void;
  onDetail: () => void;
}> = ({ res, unit, tag, onWhatsApp, onDetail }) => (
  <div className={`${CARD} rounded-2xl p-3.5 space-y-2`}>
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`text-[11px] font-extrabold px-2 py-1 rounded-lg whitespace-nowrap ${tag.cls}`}>{tag.label}</span>
      <h3 className="text-base font-extrabold text-stone-900 dark:text-gray-100 tracking-tight truncate">{unit}</h3>
      <span className="text-xs font-bold text-stone-800 dark:text-gray-200 whitespace-nowrap">
        {res.nights} {res.nights === 1 ? 'noche' : 'noches'}
      </span>
    </div>
    <p className="text-sm font-semibold text-stone-900 dark:text-gray-100 truncate">{res.guestName}</p>
    <div className="flex items-center justify-between gap-2">
      <BalanceText res={res} />
      <ActionButtons res={res} onWhatsApp={onWhatsApp} onDetail={onDetail} />
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Tarjeta del directorio (Lista y resultados de búsqueda)             */
/* ------------------------------------------------------------------ */
const GuestCard: React.FC<{
  res: Reservation;
  unit: string;
  onWhatsApp: () => void;
  onDetail: () => void;
}> = ({ res, unit, onWhatsApp, onDetail }) => {
  const cancelled = res.status === 'cancelled';
  const paid = isSettled(res);
  return (
    <div className={`${CARD} rounded-[22px] p-4 space-y-2.5 ${cancelled ? 'opacity-90' : ''}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2 min-w-0">
          <h3 className="text-base font-extrabold text-stone-900 dark:text-gray-100 tracking-tight truncate">{unit}</h3>
          <span className="text-xs font-bold text-[#8F3B08] dark:text-[#FFB27F] whitespace-nowrap">
            {formatShortDateRange(res.checkIn, res.checkOut)}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-stone-900 dark:text-gray-100">{formatCurrency(res.totalAmount)}</span>
          {cancelled ? (
            <span className="text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded-md uppercase bg-stone-300 text-stone-900 dark:bg-zinc-700 dark:text-gray-100">
              Cancelada
            </span>
          ) : (
            <span
              className={`text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded-md uppercase ${
                paid
                  ? 'bg-[#D3F1DB] text-[#0F5C2F] dark:bg-[#193A24] dark:text-[#7BE59A]'
                  : 'bg-[#FBE3CB] text-[#7A3306] dark:bg-[#3D2516] dark:text-[#FFB27F]'
              }`}
            >
              {paid ? 'Pagado' : 'Seña pend'}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex items-center gap-2 text-sm text-stone-900 dark:text-gray-100 font-semibold">
          <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-zinc-800 text-stone-900 dark:text-gray-100 flex items-center justify-center font-bold text-[11px] shrink-0 border border-stone-400/60 dark:border-zinc-600 select-none">
            {getGuestInitials(res.guestName)}
          </div>
          <span className="truncate">{res.guestName}</span>
        </div>
        <ActionButtons res={res} onWhatsApp={onWhatsApp} onDetail={onDetail} />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Fila de recordatorio                                                */
/* ------------------------------------------------------------------ */
const ReminderRow: React.FC<{
  r: Reminder;
  overdue?: boolean;
  onToggle: () => void;
  onEdit: () => void;
}> = ({ r, overdue = false, onToggle, onEdit }) => {
  const done = !!r.done;
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border-2 p-3 ${
        overdue
          ? 'bg-rose-50 border-rose-500 text-rose-950 dark:bg-rose-950/50 dark:border-rose-400/70 dark:text-rose-50'
          : 'bg-amber-50 border-amber-400 text-stone-900 dark:bg-amber-950/30 dark:border-amber-500/60 dark:text-amber-50'
      }`}
    >
      <button
        onClick={onToggle}
        aria-label={done ? 'Marcar como pendiente' : 'Marcar como hecho'}
        aria-pressed={done}
        className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
          done
            ? 'bg-emerald-700 border-emerald-700 text-white dark:bg-emerald-500 dark:border-emerald-500 dark:text-emerald-950'
            : overdue
              ? 'bg-white border-rose-700 text-transparent dark:bg-transparent dark:border-rose-300'
              : 'bg-white border-stone-700 text-transparent dark:bg-transparent dark:border-amber-200'
        }`}
      >
        <Check className="w-5 h-5 stroke-[3]" />
      </button>
      <button onClick={onEdit} className="flex-1 min-w-0 text-left cursor-pointer" aria-label={`Editar recordatorio: ${r.text}`}>
        <p className={`text-sm font-bold break-words ${done ? 'line-through' : ''}`}>📌 {r.text}</p>
        {(overdue || r.repeat !== 'none') && (
          <p className="text-xs font-semibold mt-0.5">
            {overdue && <span className="font-extrabold">Venció el {shortDayLabel(r.date)}</span>}
            {overdue && r.repeat !== 'none' && ' · '}
            {r.repeat !== 'none' && <span>↻ {REPEAT_LABEL[r.repeat]}</span>}
          </p>
        )}
      </button>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Pestaña Agenda                                                      */
/* ------------------------------------------------------------------ */
export const AgendaTab: React.FC<AgendaTabProps> = ({
  demoState,
  reminders,
  todayStr,
  view,
  onChangeView,
  onOpenWhatsApp,
  onOpenReservationDetail,
  onToggleCleaningStatus,
  onSaveReminder,
  onDeleteReminder,
}) => {
  const [search, setSearch] = useState('');
  const [stayOpen, setStayOpen] = useState(false);
  const [cleaningsOpen, setCleaningsOpen] = useState(false);
  const [laterOpen, setLaterOpen] = useState(false);
  const [sheet, setSheet] = useState<{ reminder?: Reminder } | null>(null);

  const unitName = (id: string) => demoState.properties.find((p) => p.id === id)?.name || 'Unidad';
  const active = demoState.reservations.filter((r) => r.status !== 'cancelled');
  const tomorrowStr = addDays(todayStr, 1);

  const open = (res: Reservation) => onOpenReservationDetail(res);
  const wa = (res: Reservation) => onOpenWhatsApp(res);

  /* ---------- búsqueda (todas las reservas, también pasadas y canceladas) ---------- */
  const q = search.trim().toLowerCase();
  const qDigits = q.replace(/\D/g, '');
  const searchResults = q
    ? demoState.reservations
        .filter((r) => {
          if (r.guestName.toLowerCase().includes(q)) return true;
          if (unitName(r.propertyId).toLowerCase().includes(q)) return true;
          if ((r.guestPhone || '').toLowerCase().includes(q)) return true;
          return qDigits.length >= 3 && (r.guestPhone || '').replace(/\D/g, '').includes(qDigits);
        })
        .sort(compareForDirectory(todayStr))
    : [];

  /* ---------- movimientos y resumen por día ---------- */
  const movesFor = (day: string) => [
    ...active.filter((r) => r.checkOut === day).map((res) => ({ res, tag: TAG_OUT })),
    ...active.filter((r) => r.checkIn === day).map((res) => ({ res, tag: TAG_IN })),
  ];

  const isCleaningDone = (t: (typeof demoState.cleaningTasks)[number]) =>
    t.status === 'completed' || t.status === 'inspected' || (t.checklist.length > 0 && t.checklist.every((c) => c.completed));

  const summarize = (day: string) => {
    const moves = movesFor(day);
    const ins = moves.filter((m) => m.tag === TAG_IN).length;
    const outs = moves.length - ins;
    const seen = new Set<string>();
    let owed = 0;
    for (const m of moves) {
      if (!seen.has(m.res.id)) {
        seen.add(m.res.id);
        owed += getBalance(m.res);
      }
    }
    const cleanings = day === todayStr ? getCleaningsForDay(demoState.cleaningTasks, day) : demoState.cleaningTasks.filter((t) => t.date === day);
    const done = cleanings.filter(isCleaningDone).length;
    return { moves, ins, outs, owed, cleanings, done };
  };

  /* ---------- recordatorios ---------- */
  const overdue = reminders.filter((r) => isOverdue(r, todayStr)).sort((a, b) => a.date.localeCompare(b.date));
  const remindersOn = (day: string) => reminders.filter((r) => r.date === day);
  const lastWindowDay = addDays(todayStr, 1 + UPCOMING_DAYS);
  const later = reminders.filter((r) => !r.done && r.date > lastWindowDay).sort((a, b) => a.date.localeCompare(b.date));

  const toggleReminder = (r: Reminder) => {
    if (r.done && r.repeat === 'none') onSaveReminder(reopenReminder(r));
    else onSaveReminder(completeReminder(r, todayStr));
  };

  const renderReminders = (list: Reminder[]) =>
    list.map((r) => <ReminderRow key={r.id} r={r} onToggle={() => toggleReminder(r)} onEdit={() => setSheet({ reminder: r })} />);

  /* ---------- bloques ---------- */
  const renderSummary = (day: string, isToday: boolean) => {
    const s = summarize(day);
    const cleaningsShort = s.cleanings.length ? `🧹 ${s.done}/${s.cleanings.length}` : '🧹 0';
    const cleaningsAria = s.cleanings.length ? `Limpiezas: ${s.done} de ${s.cleanings.length} listas` : 'Sin limpiezas';
    const sep = 'pl-3 border-l-2 border-stone-500 dark:border-zinc-500';
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-1 text-xs font-bold text-stone-900 dark:text-gray-100">
        <span>
          {s.ins} {s.ins === 1 ? 'ingreso' : 'ingresos'}
        </span>
        <span className={sep}>
          {s.outs} {s.outs === 1 ? 'salida' : 'salidas'}
        </span>
        <span className={`${sep} ${s.owed > 0 ? 'text-[#8F3B08] dark:text-[#FFB27F]' : ''}`}>
          {s.owed > 0 ? `Cobrar ${formatCurrency(s.owed)}` : 'Nada por cobrar'}
        </span>
        {isToday && s.cleanings.length > 0 ? (
          <button
            onClick={() => setCleaningsOpen((v) => !v)}
            aria-expanded={cleaningsOpen}
            aria-label={cleaningsAria}
            title="Ver el estado de las limpiezas"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E4DDD1] dark:bg-zinc-700 text-stone-900 dark:text-gray-100 font-bold cursor-pointer"
          >
            {cleaningsShort}
            {cleaningsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        ) : (
          <span className={sep} aria-label={cleaningsAria}>
            {cleaningsShort}
          </span>
        )}
      </div>
    );
  };

  const renderCleanings = () => (
    <div className="space-y-2">
      <p className="px-1 text-xs font-extrabold text-stone-900 dark:text-gray-100">🧹 Limpiezas de hoy</p>
      {getCleaningsForDay(demoState.cleaningTasks, todayStr).map((task) => {
        const done = isCleaningDone(task);
        return (
          <div
            key={task.id}
            className={`rounded-2xl p-3 border flex items-center justify-between gap-3 ${
              done
                ? 'bg-emerald-50 border-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-600/60'
                : 'bg-white border-stone-300 dark:bg-[#1A1B20] dark:border-white/10'
            }`}
          >
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-stone-900 dark:text-gray-100 truncate">{unitName(task.propertyId)}</p>
              <p className="text-xs font-semibold text-stone-800 dark:text-gray-200">
                {done ? `✓ Lista por ${task.cleanerName}` : `${task.cleanerName} · ${task.scheduledTime}`}
              </p>
            </div>
            <button
              onClick={() => onToggleCleaningStatus(task.id, task.status)}
              aria-label={done ? 'Desmarcar limpieza' : 'Marcar limpieza como lista'}
              aria-pressed={done}
              className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 cursor-pointer shrink-0 ${
                done
                  ? 'bg-emerald-700 border-emerald-700 text-white dark:bg-emerald-500 dark:border-emerald-500 dark:text-emerald-950'
                  : 'bg-white border-stone-600 text-stone-700 dark:bg-transparent dark:border-gray-300 dark:text-gray-200'
              }`}
            >
              <Check className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
        );
      })}
    </div>
  );

  const renderDay = (day: string, title: string, featured = false) => {
    const { moves } = summarize(day);
    const rems = remindersOn(day);
    return (
      <section className="space-y-2.5" aria-label={`${title} ${shortDayLabel(day)}`}>
        <h2 className="px-1 text-base font-extrabold text-stone-900 dark:text-white">
          {title}
          {title !== shortDayLabel(day) && <span className="font-bold text-stone-800 dark:text-gray-200"> · {shortDayLabel(day)}</span>}
        </h2>
        {featured && renderSummary(day, day === todayStr)}
        {featured && day === todayStr && cleaningsOpen && renderCleanings()}
        {moves.map((m) => (
          <ResRow
            key={`${m.res.id}-${m.tag.label}`}
            res={m.res}
            unit={unitName(m.res.propertyId)}
            tag={m.tag}
            onWhatsApp={() => wa(m.res)}
            onDetail={() => open(m.res)}
          />
        ))}
        {renderReminders(rems)}
        {moves.length === 0 && rems.length === 0 && (
          <p className="px-1 text-sm font-semibold text-stone-800 dark:text-gray-200">Sin ingresos ni salidas.</p>
        )}
      </section>
    );
  };

  const upcomingDays = Array.from({ length: UPCOMING_DAYS }, (_, i) => addDays(todayStr, 2 + i)).filter(
    (d) => movesFor(d).length > 0 || remindersOn(d).length > 0
  );

  const staying = active
    .filter((r) => r.checkIn <= todayStr && r.checkOut > todayStr)
    .sort((a, b) => a.checkOut.localeCompare(b.checkOut));

  const listItems = active.slice().sort(compareForDirectory(todayStr)).slice(0, 20);

  return (
    <div className="space-y-4">
      {/* Buscador */}
      <div className="relative">
        <Search className="w-5 h-5 text-stone-700 dark:text-gray-300 absolute left-4 top-1/2 -translate-y-1/2" aria-hidden />
        <input
          type="search"
          inputMode="search"
          aria-label="Buscar huésped, unidad o teléfono"
          placeholder="Buscar huésped, unidad o teléfono"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm font-semibold bg-white dark:bg-[#1A1B20] border-2 border-stone-400 dark:border-zinc-500 rounded-2xl pl-12 pr-11 py-3.5 text-stone-900 dark:text-gray-100 placeholder-stone-700 dark:placeholder-gray-300 focus:outline-none focus:border-[#A8480F] dark:focus:border-[#FFB27F] [&::-webkit-search-cancel-button]:hidden"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            aria-label="Borrar búsqueda"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-stone-900 dark:text-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Selector de vista + recordatorio */}
      <div className="flex items-center gap-2">
        <div role="tablist" aria-label="Vista de la agenda" className="flex-1 grid grid-cols-2 gap-1 p-1 rounded-2xl bg-[#DDD7CD] dark:bg-zinc-800">
          {(['day', 'list'] as AgendaView[]).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => onChangeView(v)}
              className={`py-2.5 rounded-xl text-sm font-extrabold cursor-pointer transition-colors ${
                view === v
                  ? 'bg-stone-900 text-white dark:bg-[#FFB27F] dark:text-stone-900'
                  : 'text-stone-900 dark:text-gray-100'
              }`}
            >
              {v === 'day' ? 'Por día' : 'Lista'}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSheet({})}
          className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-3 rounded-2xl text-sm font-extrabold bg-[#A8480F] text-white dark:bg-[#FFB27F] dark:text-stone-900 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Recordatorio
        </button>
      </div>

      {/* Atrasado */}
      {overdue.length > 0 && (
        <section className="space-y-2" aria-label="Recordatorios atrasados">
          <h2 className="px-1 text-base font-extrabold text-red-800 dark:text-red-300">⚠️ Atrasado ({overdue.length})</h2>
          {overdue.map((r) => (
            <ReminderRow key={r.id} r={r} overdue onToggle={() => toggleReminder(r)} onEdit={() => setSheet({ reminder: r })} />
          ))}
        </section>
      )}

      {/* Resultados de búsqueda */}
      {q ? (
        <section className="space-y-3" aria-label="Resultados de búsqueda">
          <p className="px-1 text-sm font-bold text-stone-900 dark:text-gray-100">
            {searchResults.length === 0
              ? 'No encontré reservas con eso.'
              : `${searchResults.length} ${searchResults.length === 1 ? 'reserva' : 'reservas'}${
                  searchResults.length > SEARCH_LIMIT ? ` · mostrando ${SEARCH_LIMIT}` : ''
                }`}
          </p>
          {searchResults.slice(0, SEARCH_LIMIT).map((res) => (
            <GuestCard key={res.id} res={res} unit={unitName(res.propertyId)} onWhatsApp={() => wa(res)} onDetail={() => open(res)} />
          ))}
        </section>
      ) : view === 'day' ? (
        <div className="space-y-5">
          {renderDay(todayStr, 'Hoy', true)}
          {renderDay(tomorrowStr, 'Mañana', true)}

          {/* Alojados ahora */}
          <section className="space-y-2.5" aria-label="Alojados ahora">
            <button
              onClick={() => setStayOpen((v) => !v)}
              aria-expanded={stayOpen}
              className={`${CARD} w-full rounded-2xl px-4 py-3.5 flex items-center justify-between cursor-pointer`}
            >
              <span className="text-sm font-extrabold text-stone-900 dark:text-gray-100">🏠 Alojados ahora · {staying.length}</span>
              {stayOpen ? (
                <ChevronDown className="w-5 h-5 text-stone-900 dark:text-gray-100" />
              ) : (
                <ChevronRight className="w-5 h-5 text-stone-900 dark:text-gray-100" />
              )}
            </button>
            {stayOpen &&
              (staying.length === 0 ? (
                <p className="px-1 text-sm font-semibold text-stone-800 dark:text-gray-200">No hay nadie alojado ahora.</p>
              ) : (
                staying.map((res) => {
                  const left = daysBetween(todayStr, res.checkOut);
                  return (
                    <ResRow
                      key={res.id}
                      res={res}
                      unit={unitName(res.propertyId)}
                      tag={{
                        label: `Sale ${shortDayLabel(res.checkOut)} · ${left} ${left === 1 ? 'noche' : 'noches'} más`,
                        cls: 'bg-stone-200 text-stone-900 dark:bg-zinc-700 dark:text-gray-100',
                      }}
                      onWhatsApp={() => wa(res)}
                      onDetail={() => open(res)}
                    />
                  );
                })
              ))}
          </section>

          {/* Próximos días con movimiento */}
          {upcomingDays.length > 0 ? (
            upcomingDays.map((d) => <React.Fragment key={d}>{renderDay(d, shortDayLabel(d))}</React.Fragment>)
          ) : (
            <p className="px-1 text-sm font-semibold text-stone-800 dark:text-gray-200">
              No hay otros movimientos en los próximos {UPCOMING_DAYS} días.
            </p>
          )}

          {/* Recordatorios más allá de la ventana */}
          {later.length > 0 && (
            <section className="space-y-2.5" aria-label="Recordatorios más adelante">
              <button
                onClick={() => setLaterOpen((v) => !v)}
                aria-expanded={laterOpen}
                className={`${CARD} w-full rounded-2xl px-4 py-3.5 flex items-center justify-between cursor-pointer`}
              >
                <span className="text-sm font-extrabold text-stone-900 dark:text-gray-100">📌 Recordatorios más adelante · {later.length}</span>
                {laterOpen ? (
                  <ChevronDown className="w-5 h-5 text-stone-900 dark:text-gray-100" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-stone-900 dark:text-gray-100" />
                )}
              </button>
              {laterOpen &&
                later.map((r) => (
                  <div key={r.id} className="space-y-1">
                    <p className="px-1 text-xs font-extrabold text-stone-900 dark:text-gray-100">{shortDayLabel(r.date)}</p>
                    <ReminderRow r={r} onToggle={() => toggleReminder(r)} onEdit={() => setSheet({ reminder: r })} />
                  </div>
                ))}
            </section>
          )}
        </div>
      ) : (
        <section className="space-y-3" aria-label="Directorio de huéspedes">
          {listItems.map((res) => (
            <GuestCard key={res.id} res={res} unit={unitName(res.propertyId)} onWhatsApp={() => wa(res)} onDetail={() => open(res)} />
          ))}
          {listItems.length === 0 && <p className="px-1 text-sm font-semibold text-stone-800 dark:text-gray-200">Todavía no hay reservas.</p>}
        </section>
      )}

      {sheet && (
        <ReminderSheet
          reminder={sheet.reminder}
          defaultDate={todayStr}
          onSave={onSaveReminder}
          onDelete={onDeleteReminder}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
};
