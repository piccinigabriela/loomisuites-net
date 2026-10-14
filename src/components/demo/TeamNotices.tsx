import React, { useMemo, useState } from 'react';
import { Bell, Check, ChevronDown, ChevronUp, MessageCircle, Plus, Trash2, Users } from 'lucide-react';
import { DemoState, Reservation, TeamContact } from '../../types';
import { formatCurrency } from '../../data/initialData';
import {
  addDays,
  buildCheckInNotice,
  buildDaySummary,
  dayTitle,
  daysBetween,
  fmtDmy,
  platformLabel,
  splitNotes,
  toYmd,
  upcomingCheckIns,
  whatsAppUrl,
} from '../../lib/teamNotices';

const UNIT_COLORS = ['#4F7A3A', '#B4572A', '#7A5BA6', '#2F7EA8', '#B5566B', '#8C7A2E', '#3E8C6A', '#9A4F7A'];
const OTHER_KEY = 'otro';

interface TeamNoticesProps {
  demoState: DemoState;
  isApp: boolean;
  onSaveContacts: (contacts: TeamContact[]) => void;
  onMarkNotified: (reservationId: string, contactKey: string) => void;
  /** Vista de celular: sin márgenes grandes */
  compact?: boolean;
}

export const TeamNotices: React.FC<TeamNoticesProps> = ({ demoState, isApp, onSaveContacts, onMarkNotified, compact }) => {
  const today = toYmd(new Date());
  const contacts = demoState.teamContacts || [];
  const complexName = demoState.welcomeGuide?.propertyName || '';
  const managed = !!demoState.managementSettings?.enabled;
  const mgmtPct = demoState.managementSettings?.percent || 0;

  const [contactsOpen, setContactsOpen] = useState(contacts.length === 0);
  const [draft, setDraft] = useState<TeamContact[]>(contacts);
  const [summaryDay, setSummaryDay] = useState<string>(addDays(today, 1));
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryText, setSummaryText] = useState('');

  React.useEffect(() => {
    setDraft(contacts);
  }, [JSON.stringify(contacts)]);

  const unitIndex = (id: string) => Math.max(0, demoState.properties.findIndex((p) => p.id === id));
  const unitName = (id: string) => demoState.properties.find((p) => p.id === id)?.name || 'Unidad';

  const list = useMemo(() => upcomingCheckIns(demoState.reservations, today, 7), [demoState.reservations, today]);

  const summary = useMemo(
    () =>
      buildDaySummary(summaryDay, demoState.reservations, demoState.properties, {
        complexName,
        guide: demoState.welcomeGuide,
        today,
        isApp,
      }),
    [summaryDay, demoState.reservations, demoState.properties, complexName, demoState.welcomeGuide, today, isApp]
  );

  React.useEffect(() => {
    setSummaryText(summary.text);
  }, [summary.text]);

  const contactName = (key: string) => (key === OTHER_KEY ? 'otro contacto' : contacts.find((c) => c.id === key)?.name || 'contacto');

  const sendNotice = (r: Reservation, contact?: TeamContact) => {
    const text = buildCheckInNotice(r, {
      complexName,
      unitName: unitName(r.propertyId),
      guide: demoState.welcomeGuide,
      today,
      isApp,
    });
    window.open(whatsAppUrl(text, contact?.phone), '_blank');
    onMarkNotified(r.id, contact?.id || OTHER_KEY);
  };

  const sendSummary = (contact?: TeamContact) => {
    window.open(whatsAppUrl(summaryText, contact?.phone), '_blank');
  };

  const draftValid = draft.every((c) => c.name.trim() && c.phone.replace(/\D/g, '').length >= 8);
  const draftDirty = JSON.stringify(draft) !== JSON.stringify(contacts);

  const card = `bg-white dark:bg-[#18191E] rounded-2xl border border-stone-200 dark:border-zinc-800 ${compact ? 'p-4' : 'p-5'}`;
  const waBtn =
    'flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-[#128C5E] hover:bg-[#0E7A51] text-white transition-colors cursor-pointer';
  const ghostBtn =
    'flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-stone-300 dark:border-zinc-600 text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer';
  const inputCls =
    'w-full text-sm font-semibold px-3 py-2 rounded-xl border border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-stone-900 dark:text-white placeholder:text-stone-500 dark:placeholder:text-zinc-400';

  const ContactButtons: React.FC<{ onSend: (c?: TeamContact) => void }> = ({ onSend }) => (
    <div className="flex flex-wrap gap-2">
      {contacts.map((c) => (
        <button key={c.id} type="button" onClick={() => onSend(c)} className={waBtn}>
          <MessageCircle className="w-4 h-4" /> {c.name}
        </button>
      ))}
      <button type="button" onClick={() => onSend(undefined)} className={contacts.length ? ghostBtn : waBtn}>
        <MessageCircle className="w-4 h-4" /> {contacts.length ? 'Otro' : 'Enviar por WhatsApp'}
      </button>
    </div>
  );

  return (
    <div className={`space-y-4 max-w-5xl mx-auto ${compact ? '' : 'font-sans'}`}>
      {/* Encabezado */}
      <div className={card}>
        <span className="text-[10px] tracking-widest text-[#E67E22] uppercase font-bold flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5" /> Avisos al equipo
        </span>
        <h2 className="text-xl font-bold text-stone-900 dark:text-white tracking-tight mt-0.5">Check-ins de los próximos 7 días</h2>
        <p className="text-sm font-medium text-stone-800 dark:text-stone-200 mt-1">
          Mandale el aviso por WhatsApp a quien te ayuda con la limpieza, el mantenimiento o las llaves.
        </p>

        {/* Contactos */}
        <div className="mt-4 pt-3 border-t border-stone-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setContactsOpen((v) => !v)}
            className="w-full flex items-center justify-between text-sm font-bold text-stone-900 dark:text-white cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#E67E22]" />
              Contactos para avisos {contacts.length > 0 && `(${contacts.map((c) => c.name).join(', ')})`}
            </span>
            {contactsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {contactsOpen && (
            <div className="mt-3 space-y-2">
              {draft.length === 0 && (
                <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
                  Agregá a quien le avisás (por ejemplo "Marta limpieza" o "Mantenimiento") y su WhatsApp. Así el aviso le llega
                  directo con un toque.
                </p>
              )}
              {draft.map((c, i) => (
                <div key={c.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                  <input
                    aria-label="Nombre del contacto"
                    value={c.name}
                    placeholder="Nombre (ej: Marta limpieza)"
                    onChange={(e) => setDraft(draft.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                    className={inputCls}
                  />
                  <input
                    aria-label="WhatsApp del contacto"
                    value={c.phone}
                    inputMode="tel"
                    placeholder="WhatsApp (ej: 11 4092 5939)"
                    onChange={(e) => setDraft(draft.map((x, j) => (j === i ? { ...x, phone: e.target.value } : x)))}
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => setDraft(draft.filter((_, j) => j !== i))}
                    className="p-2 rounded-xl text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                    title="Quitar contacto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {draft.length < 6 && (
                  <button
                    type="button"
                    onClick={() => setDraft([...draft, { id: `tc-${Date.now()}`, name: '', phone: '' }])}
                    className={ghostBtn}
                  >
                    <Plus className="w-4 h-4" /> Agregar contacto
                  </button>
                )}
                {draftDirty && (
                  <button
                    type="button"
                    disabled={!draftValid}
                    onClick={() => {
                      onSaveContacts(draft.map((c) => ({ ...c, name: c.name.trim(), phone: c.phone.trim() })));
                      setContactsOpen(false);
                    }}
                    className="text-xs font-bold px-4 py-2 rounded-xl bg-[#E67E22] hover:bg-[#D35400] disabled:opacity-50 text-white cursor-pointer"
                  >
                    Guardar contactos
                  </button>
                )}
                {draftDirty && !draftValid && (
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300">Completá nombre y WhatsApp de cada contacto.</span>
                )}
              </div>
              <p className="text-xs font-medium text-stone-700 dark:text-stone-300">
                Si el número es de Argentina podés escribirlo como lo marcás (11 4092 5939); de otro país, con el código (+598…).
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Resumen del día */}
      <div className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-white">Resumen del día</h3>
            <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
              {dayTitle(summaryDay, today)}: {summary.checkOuts.length} {summary.checkOuts.length === 1 ? 'salida' : 'salidas'} ·{' '}
              {summary.checkIns.length} {summary.checkIns.length === 1 ? 'entrada' : 'entradas'}
            </p>
          </div>
          <div className="flex gap-1 bg-stone-100 dark:bg-zinc-800 p-1 rounded-xl">
            {[0, 1, 2].map((n) => {
              const d = addDays(today, n);
              const active = d === summaryDay;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSummaryDay(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    active ? 'bg-[#E67E22] text-white' : 'text-stone-900 dark:text-white hover:bg-white dark:hover:bg-zinc-700'
                  }`}
                >
                  {n === 0 ? 'Hoy' : n === 1 ? 'Mañana' : 'Pasado'}
                </button>
              );
            })}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSummaryOpen((v) => !v)}
          className="mt-3 text-xs font-bold text-[#E67E22] cursor-pointer flex items-center gap-1"
        >
          {summaryOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {summaryOpen ? 'Ocultar mensaje' : 'Ver y editar el mensaje'}
        </button>
        {summaryOpen && (
          <textarea
            aria-label="Mensaje del resumen"
            value={summaryText}
            onChange={(e) => setSummaryText(e.target.value)}
            rows={Math.min(14, summaryText.split('\n').length + 1)}
            className={`${inputCls} mt-2 font-mono text-xs leading-relaxed`}
          />
        )}
        <div className="mt-3">
          <ContactButtons onSend={sendSummary} />
        </div>
      </div>

      {/* Tarjetas por check-in */}
      {list.length === 0 && (
        <div className={`${card} text-center text-sm font-semibold text-stone-800 dark:text-stone-200`}>
          Sin check-ins en los próximos 7 días.
        </div>
      )}
      <div className={`grid grid-cols-1 ${compact ? '' : 'lg:grid-cols-2'} gap-4`}>
        {list.map((r) => {
          const diff = daysBetween(today, r.checkIn);
          const { nationality, notes } = splitNotes(r.specialNotes);
          const color = UNIT_COLORS[unitIndex(r.propertyId) % UNIT_COLORS.length];
          const net = (r.totalAmount || 0) - (r.commissionPaid || 0);
          const ownerNet = net - (net * mgmtPct) / 100;
          const notified = Object.entries(r.teamNotified || {}).sort((a, b) => b[1].localeCompare(a[1]));
          return (
            <div key={r.id} className="bg-white dark:bg-[#18191E] rounded-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden">
              <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-stone-200 dark:border-zinc-800">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xs font-bold text-white px-2 py-0.5 rounded-md shrink-0" style={{ background: color }}>
                    {unitName(r.propertyId)}
                  </span>
                  <strong className="text-base text-stone-900 dark:text-white truncate">{r.guestName}</strong>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-base font-bold text-stone-900 dark:text-white">{fmtDmy(r.checkIn)}</div>
                  <div
                    className={`text-xs font-bold uppercase ${
                      diff <= 0 ? 'text-rose-600 dark:text-rose-400' : diff <= 2 ? 'text-amber-700 dark:text-amber-300' : 'text-stone-800 dark:text-stone-200'
                    }`}
                  >
                    {diff <= 0 ? '¡Hoy!' : diff === 1 ? 'Mañana' : `En ${diff} días`}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-5 py-4 text-sm">
                {[
                  ['Check-out', fmtDmy(r.checkOut)],
                  ['Noches', String(r.nights)],
                  ['Plataforma', platformLabel(r)],
                  ['Nacionalidad', nationality || '—'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="text-[10px] tracking-widest uppercase font-bold text-stone-700 dark:text-stone-300">{k}</div>
                    <div className="font-semibold text-stone-900 dark:text-white">{v}</div>
                  </div>
                ))}
                {managed && (
                  <div>
                    <div className="text-[10px] tracking-widest uppercase font-bold text-stone-700 dark:text-stone-300">Líquido prop.</div>
                    <div className="font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(ownerNet)}</div>
                  </div>
                )}
                <div className={managed ? '' : 'col-span-2'}>
                  <div className="text-[10px] tracking-widest uppercase font-bold text-stone-700 dark:text-stone-300">Notas</div>
                  <div className="font-semibold text-stone-900 dark:text-white break-words">{notes || '—'}</div>
                </div>
              </div>
              <div className="px-5 py-3.5 bg-stone-50 dark:bg-[#1F2026] border-t border-stone-200 dark:border-zinc-800 space-y-2.5">
                {notified.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {notified.map(([key, iso]) => {
                      const d = new Date(iso);
                      return (
                        <span
                          key={key}
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md"
                        >
                          <Check className="w-3.5 h-3.5" /> Avisado a {contactName(key)} · {d.getDate()}/{d.getMonth() + 1}{' '}
                          {String(d.getHours()).padStart(2, '0')}:{String(d.getMinutes()).padStart(2, '0')}
                        </span>
                      );
                    })}
                  </div>
                )}
                <ContactButtons onSend={(c) => sendNotice(r, c)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
