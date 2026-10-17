import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ClientRow, ClientState, activateClient, fetchClients, saveClientNote, suspendClient } from '../../lib/adminClients';

interface Props {
  onClose: () => void;
  /** Para pruebas: de dónde salen los clientes (por defecto, Firestore) */
  loader?: () => Promise<ClientRow[]>;
}

const STATE_LABEL: Record<ClientState, string> = { active: 'Activo', trial: 'En prueba', expired: 'Vencido', suspended: 'Suspendido' };
const FILTERS: Array<['all' | ClientState, string]> = [
  ['all', 'Todos'],
  ['trial', 'En prueba'],
  ['active', 'Activos'],
  ['expired', 'Vencidos'],
  ['suspended', 'Suspendidos'],
];

const fmt = (d: Date | null) => (d ? d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

function detail(r: ClientRow): string {
  if (r.state === 'trial') return `Le quedan ${r.daysLeft} ${r.daysLeft === 1 ? 'día' : 'días'} de prueba`;
  if (r.state === 'active') return r.activeUntil ? `Hasta el ${fmt(r.activeUntil)}${r.daysLeft !== null && r.daysLeft <= 7 ? ` (en ${Math.max(r.daysLeft, 0)} días)` : ''}` : 'Sin fecha de vencimiento';
  if (r.state === 'expired') return 'Se terminó el acceso';
  return 'Sin acceso hasta que lo actives';
}

export const ClientsPanel: React.FC<Props> = ({ onClose, loader = fetchClients }) => {
  const [rows, setRows] = useState<ClientRow[] | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | ClientState>('all');
  const [search, setSearch] = useState('');
  const [openUid, setOpenUid] = useState<string | null>(null);
  const [months, setMonths] = useState(1);
  const [plan, setPlan] = useState<'propietario' | 'complejo'>('propietario');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [confirmSuspend, setConfirmSuspend] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      setRows(await loader());
    } catch (e) {
      console.warn('Error cargando clientes:', e);
      setError('No pude leer los clientes. Revisá que las reglas nuevas estén publicadas y que hayas entrado con tu cuenta de administración.');
      setRows([]);
    }
  }, [loader]);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows?.length || 0, trial: 0, active: 0, expired: 0, suspended: 0 };
    rows?.forEach((r) => (c[r.state] += 1));
    return c;
  }, [rows]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (rows || []).filter((r) => (filter === 'all' || r.state === filter) && (!q || r.complexName.toLowerCase().includes(q) || r.ownerEmail.toLowerCase().includes(q)));
  }, [rows, filter, search]);

  const open = (r: ClientRow) => {
    setOpenUid(openUid === r.uid ? null : r.uid);
    setPlan(r.plan || 'propietario');
    setMonths(1);
    setNote(r.note);
    setConfirmSuspend(false);
    setNotice('');
  };

  const run = async (fn: () => Promise<void>, ok: string) => {
    setBusy(true);
    setNotice('');
    try {
      await fn();
      await load();
      setNotice(ok);
      setConfirmSuspend(false);
    } catch (e) {
      console.warn('Error en el panel de clientes:', e);
      setNotice('No se pudo guardar. Probá de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  const btn = 'min-h-[44px] px-5 rounded-xl text-[15px] font-bold cursor-pointer disabled:opacity-60';
  const primary = `${btn} bg-[#A94F12] text-white dark:bg-[#F0A46F] dark:text-[#1A1206] hover:opacity-90`;
  const outline = `${btn} border border-stone-400 dark:border-zinc-500 text-stone-900 dark:text-stone-50 bg-white dark:bg-zinc-800`;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#101114] text-stone-900 dark:text-stone-50">
      <div className="max-w-[980px] mx-auto px-4 sm:px-8 py-8 flex flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight">Clientes de Loomi</h1>
            <p className="text-[16px] font-medium text-stone-800 dark:text-stone-100">Activá, renová o suspendé sin entrar a Firestore.</p>
          </div>
          <button type="button" onClick={onClose} className={outline}>
            ← Volver a la app
          </button>
        </header>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtro por estado">
          {FILTERS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={filter === id}
              onClick={() => setFilter(id)}
              className={`min-h-[44px] px-4 rounded-xl text-[15px] font-bold cursor-pointer border ${
                filter === id
                  ? 'bg-[#A94F12] text-white border-[#A94F12] dark:bg-[#F0A46F] dark:text-[#1A1206] dark:border-[#F0A46F]'
                  : 'bg-white dark:bg-zinc-800 text-stone-900 dark:text-stone-50 border-stone-400 dark:border-zinc-500'
              }`}
            >
              {label} · {counts[id] ?? 0}
            </button>
          ))}
        </div>

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por complejo o mail"
          aria-label="Buscar cliente"
          className="min-h-[48px] w-full rounded-xl border border-stone-400 dark:border-zinc-500 bg-white dark:bg-[#18191E] px-4 text-[16px] text-stone-900 dark:text-stone-50 placeholder:text-stone-700 dark:placeholder:text-stone-300"
        />

        {error && <p className="text-[16px] font-semibold text-rose-800 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl p-4">{error}</p>}
        {rows === null && <p className="text-[16px] font-semibold">Cargando clientes…</p>}
        {rows && !error && shown.length === 0 && <p className="text-[16px] font-semibold">No hay clientes para mostrar.</p>}

        <ul className="flex flex-col gap-3">
          {shown.map((r) => {
            const isOpen = openUid === r.uid;
            return (
              <li key={r.uid} className="rounded-2xl border border-stone-300 dark:border-zinc-600 bg-white dark:bg-[#18191E]">
                <button type="button" onClick={() => open(r)} aria-expanded={isOpen} className="w-full text-left p-5 flex flex-wrap items-center justify-between gap-3 cursor-pointer">
                  <span className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[18px] font-bold truncate">{r.complexName}</span>
                    <span className="text-[15px] font-medium text-stone-800 dark:text-stone-100 truncate">{r.ownerEmail || 'Sin mail'}</span>
                  </span>
                  <span className="flex flex-col items-end gap-0.5">
                    <span className="text-[15px] font-bold">
                      {STATE_LABEL[r.state]}
                      {r.plan ? ` · ${r.plan === 'complejo' ? 'Complejo' : 'Propietario'}` : ''}
                    </span>
                    <span className="text-[14px] font-medium text-stone-800 dark:text-stone-100">{detail(r)}</span>
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-stone-300 dark:border-zinc-600 p-5 flex flex-col gap-5">
                    <p className="text-[15px] font-medium">Se registró el {fmt(r.createdAt)}.</p>

                    <div className="flex flex-wrap items-end gap-4">
                      <label className="flex flex-col gap-1.5 text-[15px] font-bold">
                        Plan
                        <select value={plan} onChange={(e) => setPlan(e.target.value as 'propietario' | 'complejo')} className="min-h-[44px] rounded-xl border border-stone-400 dark:border-zinc-500 bg-white dark:bg-zinc-800 px-3 text-[15px] font-semibold text-stone-900 dark:text-stone-50">
                          <option value="propietario">Propietario (sin personal fijo)</option>
                          <option value="complejo">Complejo (con recepción y limpieza)</option>
                        </select>
                      </label>
                      <label className="flex flex-col gap-1.5 text-[15px] font-bold">
                        Por cuánto tiempo
                        <select value={months} onChange={(e) => setMonths(Number(e.target.value))} className="min-h-[44px] rounded-xl border border-stone-400 dark:border-zinc-500 bg-white dark:bg-zinc-800 px-3 text-[15px] font-semibold text-stone-900 dark:text-stone-50">
                          <option value={1}>1 mes</option>
                          <option value={3}>3 meses</option>
                          <option value={6}>6 meses</option>
                          <option value={12}>12 meses</option>
                        </select>
                      </label>
                      <button type="button" disabled={busy} onClick={() => run(() => activateClient(r, months, plan), r.state === 'active' ? 'Renovado.' : 'Activado.')} className={primary}>
                        {r.state === 'active' ? 'Renovar' : 'Activar'}
                      </button>
                    </div>

                    <label className="flex flex-col gap-1.5 text-[15px] font-bold">
                      Nota privada (por ejemplo: pagó por transferencia el 12/11)
                      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={300} className="rounded-xl border border-stone-400 dark:border-zinc-500 bg-white dark:bg-[#101114] p-3 text-[15px] font-medium text-stone-900 dark:text-stone-50" />
                    </label>

                    <div className="flex flex-wrap items-center gap-3">
                      <button type="button" disabled={busy} onClick={() => run(() => saveClientNote(r.uid, note), 'Nota guardada.')} className={outline}>
                        Guardar nota
                      </button>
                      {r.state !== 'suspended' &&
                        (confirmSuspend ? (
                          <>
                            <span className="text-[15px] font-bold">¿Seguro? Pierde el acceso al instante.</span>
                            <button type="button" disabled={busy} onClick={() => run(() => suspendClient(r.uid), 'Suspendido.')} className={`${btn} bg-rose-800 text-white dark:bg-rose-300 dark:text-rose-950`}>
                              Sí, suspender
                            </button>
                            <button type="button" onClick={() => setConfirmSuspend(false)} className={outline}>
                              No
                            </button>
                          </>
                        ) : (
                          <button type="button" onClick={() => setConfirmSuspend(true)} className={`${btn} border border-rose-700 dark:border-rose-300 text-rose-800 dark:text-rose-200`}>
                            Suspender
                          </button>
                        ))}
                    </div>

                    {notice && <p role="status" className="text-[15px] font-bold">{notice}</p>}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
