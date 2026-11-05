/**
 * Reservas → Huéspedes: cada persona una sola vez, cuántas veces vino y cuándo vuelve (src/lib/guests.ts).
 * Para reconocer al que vuelve y escribirle en temporada. La ven el dueño y Recepción.
 */
import React, { useMemo, useState } from 'react';
import { MessageCircle, Search, Users } from 'lucide-react';
import type { DemoState, PreCheckin, Reservation } from '../../types';
import { buildGuestList } from '../../lib/guests';
import { whatsappDigits } from '../../lib/publicSite';

type Filter = 'todos' | 'volvieron' | 'proximos';

const fmt = (s: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || '');
  if (!m) return '';
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
};
const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const GuestsView: React.FC<{
  demoState: DemoState;
  precheckins?: Record<string, PreCheckin>;
  onSelectReservation: (r: Reservation) => void;
}> = ({ demoState, precheckins = {}, onSelectReservation }) => {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('todos');
  const today = localToday();
  const guests = useMemo(() => buildGuestList(demoState.reservations || [], today, precheckins), [demoState.reservations, today, precheckins]);
  const unitName = (id: string) => demoState.properties.find((p) => p.id === id)?.name || '';
  const byId = useMemo(() => new Map((demoState.reservations || []).map((r) => [r.id, r])), [demoState.reservations]);

  const returning = guests.filter((g) => g.stays > 1).length;
  const upcoming = guests.filter((g) => g.nextStay).length;
  const term = q.trim().toLowerCase();
  const shown = guests.filter((g) => {
    if (filter === 'volvieron' && g.stays < 2) return false;
    if (filter === 'proximos' && !g.nextStay) return false;
    if (!term) return true;
    return g.name.toLowerCase().includes(term) || g.phone.replace(/\D/g, '').includes(term.replace(/\D/g, '') || '§') || g.email.toLowerCase().includes(term);
  });

  const chip = (id: Filter, label: string, n: number) => (
    <button
      key={id}
      type="button"
      onClick={() => setFilter(id)}
      aria-pressed={filter === id}
      className={`min-h-[40px] px-3.5 rounded-xl text-sm font-bold border-2 cursor-pointer ${
        filter === id ? 'bg-[#E67E22] border-[#E67E22] text-[#111]' : 'border-stone-300 dark:border-zinc-600 text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-zinc-800'
      }`}
    >
      {label} ({n})
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-5 font-sans text-stone-900 dark:text-white">
      <div>
        <h2 className="text-2xl font-bold">Huéspedes</h2>
        <p className="mt-1 text-base text-stone-800 dark:text-stone-200">Se arma sola con tus reservas: cada persona una vez, con las veces que vino.</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {chip('todos', 'Todos', guests.length)}
          {chip('volvieron', 'Volvieron', returning)}
          {chip('proximos', 'Con próxima reserva', upcoming)}
        </div>
        <label className="relative sm:ml-auto sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-700 dark:text-stone-300" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o teléfono"
            aria-label="Buscar huésped"
            className="w-full min-h-[44px] pl-9 pr-3 rounded-xl border-2 border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-base text-stone-900 dark:text-white placeholder:text-stone-600 dark:placeholder:text-stone-400 focus:outline-none focus:border-[#E67E22]"
          />
        </label>
      </div>

      {guests.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-stone-300 dark:border-zinc-700 p-10 text-center">
          <Users className="w-8 h-8 mx-auto text-[#E67E22]" />
          <p className="mt-3 text-lg font-bold">Todavía no hay huéspedes</p>
          <p className="mt-1 text-base text-stone-800 dark:text-stone-200">Aparecen solos cuando cargás reservas con nombre. Las de Airbnb y Booking, cuando completás el nombre.</p>
        </div>
      ) : shown.length === 0 ? (
        <p className="text-base font-semibold">No hay huéspedes con ese filtro.</p>
      ) : (
        <ul className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-[#18191E] divide-y divide-stone-200 dark:divide-zinc-800 overflow-hidden">
          {shown.map((g) => {
            const wa = whatsappDigits(g.phone);
            const latest = byId.get(g.reservationIds[0]);
            const details = [
              g.lastStay ? `Última vez: ${fmt(g.lastStay)}${g.lastUnitId ? ` · ${unitName(g.lastUnitId)}` : ''}` : '',
              g.nights ? `${g.nights} ${g.nights === 1 ? 'noche' : 'noches'}` : '',
              g.country,
            ].filter(Boolean);
            return (
              <li key={g.key} className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-base font-bold">
                    <span className="truncate">{g.name}</span>
                    {g.stays > 1 && (
                      <span className="px-2 py-0.5 rounded-lg text-sm font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100">
                        Vino {g.stays} veces
                      </span>
                    )}
                    {g.nextStay && (
                      <span className="px-2 py-0.5 rounded-lg text-sm font-bold bg-amber-100 text-amber-950 dark:bg-amber-900/50 dark:text-amber-100">
                        {g.stays > 0 ? 'Vuelve' : 'Llega'} el {fmt(g.nextStay)}
                      </span>
                    )}
                  </p>
                  {details.length > 0 && <p className="mt-0.5 text-sm text-stone-800 dark:text-stone-200">{details.join(' · ')}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {wa && (
                    <a
                      href={`https://wa.me/${wa}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[40px] px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </a>
                  )}
                  {latest && (
                    <button
                      type="button"
                      onClick={() => onSelectReservation(latest)}
                      className="min-h-[40px] px-3.5 rounded-xl border-2 border-stone-300 dark:border-zinc-600 text-sm font-bold hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      Ver reserva
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default GuestsView;
