import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ClientRow, ClientState, activateClient, fetchClients, saveClientNote, saveClientWebDesigns, suspendClient } from '../../lib/adminClients';
import { SPECIAL_THEMES } from '../../lib/publicSite';
import { BillingConfig, DEFAULT_BILLING, PaymentNotice, fetchPendingNotices, formatArs, formatUsd, markNoticeHandled, saveBillingConfig, subscribeToBilling } from '../../lib/billing';

interface Props {
  onClose: () => void;
  /** Para pruebas: de dónde salen los clientes (por defecto, Firestore). Recibe los días de gracia. */
  loader?: (graceDays: number) => Promise<ClientRow[]>;
}

const STATE_LABEL: Record<ClientState, string> = { active: 'Activo', trial: 'En prueba', grace: 'En días de gracia', expired: 'Vencido', suspended: 'Suspendido' };
const FILTERS: Array<['all' | ClientState, string]> = [
  ['all', 'Todos'],
  ['trial', 'En prueba'],
  ['active', 'Activos'],
  ['grace', 'En gracia'],
  ['expired', 'Vencidos'],
  ['suspended', 'Suspendidos'],
];

const fmt = (d: Date | null) => (d ? d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

function detail(r: ClientRow): string {
  if (r.state === 'trial') return `Le quedan ${r.daysLeft} ${r.daysLeft === 1 ? 'día' : 'días'} de prueba`;
  if (r.state === 'active') return r.activeUntil ? `Hasta el ${fmt(r.activeUntil)}${r.daysLeft !== null && r.daysLeft <= 7 ? ` (en ${Math.max(r.daysLeft, 0)} días)` : ''}` : 'Sin fecha de vencimiento';
  if (r.state === 'grace') return `Venció el ${fmt(r.activeUntil)} · le ${r.daysLeft === 1 ? 'queda 1 día' : `quedan ${r.daysLeft} días`} de gracia`;
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

  const [billing, setBilling] = useState<BillingConfig | null>(null);
  const [notices, setNotices] = useState<PaymentNotice[]>([]);
  useEffect(() => subscribeToBilling(setBilling), []);

  const load = useCallback(async () => {
    setError('');
    try {
      setRows(await loader(billing?.graceDays ?? DEFAULT_BILLING.graceDays));
      setNotices(await fetchPendingNotices().catch(() => []));
    } catch (e) {
      console.warn('Error cargando clientes:', e);
      setError('No pude leer los clientes. Revisá que las reglas nuevas estén publicadas y que hayas entrado con tu cuenta de administración.');
      setRows([]);
    }
  }, [loader, billing?.graceDays]);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows?.length || 0, trial: 0, active: 0, grace: 0, expired: 0, suspended: 0 };
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

        {notices.length > 0 && rows && (
          <section className="rounded-2xl border-2 border-emerald-600 dark:border-emerald-400 bg-white dark:bg-[#18191E] p-5 flex flex-col gap-3">
            <h2 className="text-[20px] font-bold">Avisos de pago</h2>
            {notices.map((n) => {
              const row = rows.find((r) => r.uid === n.uid);
              const when = n.createdAt?.toDate ? fmt(n.createdAt.toDate()) : '';
              return (
                <div key={n.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 dark:border-zinc-700 pt-3 first:border-0 first:pt-0">
                  <div className="text-[16px] font-medium">
                    <strong>{n.complexName || n.email}</strong> avisó que pagó {n.currency === 'USD' ? `${formatUsd(n.amount)} por Payoneer` : `${formatArs(n.amount)} por transferencia`}
                    {when ? ` el ${when}` : ''} · plan {n.plan === 'complejo' ? 'Loomi Suite' : 'Loomi'}
                    {n.currency === 'ARS' && n.rate ? ` (MEP ${formatArs(n.rate)})` : ''}
                  </div>
                  <div className="flex gap-2">
                    {row && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          run(async () => {
                            await activateClient(row, 1, n.plan);
                            await markNoticeHandled(n.id);
                          }, `${row.complexName}: renovado 1 mes.`)
                        }
                        className={primary}
                      >
                        Renovar 1 mes
                      </button>
                    )}
                    <button type="button" disabled={busy} onClick={() => run(() => markNoticeHandled(n.id), 'Aviso archivado.')} className={outline}>
                      Archivar
                    </button>
                  </div>
                </div>
              );
            })}
            {notice && !openUid && <p role="status" className="text-[15px] font-bold">{notice}</p>}
          </section>
        )}

        {billing && <BillingSettings value={billing} />}

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
                    {notices.some((n) => n.uid === r.uid) && <span className="text-[14px] font-bold text-emerald-800 dark:text-emerald-300">Avisó que pagó</span>}
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

                    <div className="flex flex-col gap-2">
                      <span className="text-[15px] font-bold">Diseños especiales de Tu Web</span>
                      <div className="flex flex-wrap gap-2">
                        {SPECIAL_THEMES.map((d) => {
                          const on = r.webDesigns.includes(d.id);
                          return (
                            <button
                              key={d.id}
                              type="button"
                              disabled={busy}
                              aria-pressed={on}
                              onClick={() =>
                                run(
                                  () => saveClientWebDesigns(r.uid, on ? r.webDesigns.filter((x) => x !== d.id) : [...r.webDesigns, d.id]),
                                  on ? `${d.name}: deshabilitado.` : `${d.name}: habilitado.`
                                )
                              }
                              className={on ? primary : outline}
                            >
                              {on ? '✓ ' : ''}
                              {d.name}
                            </button>
                          );
                        })}
                      </div>
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

/** Cobro y precios: lo que ven los clientes en "Mi plan". Los datos bancarios viven solo en Firestore (el repo es público). */
const BillingSettings: React.FC<{ value: BillingConfig }> = ({ value }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<BillingConfig>(value);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => setForm(value), [value]);

  const field = 'min-h-[44px] w-full rounded-xl border border-stone-400 dark:border-zinc-500 bg-white dark:bg-zinc-800 px-3 text-[16px] font-semibold text-stone-900 dark:text-stone-50';
  const lbl = 'flex flex-col gap-1.5 text-[15px] font-bold';
  const set = (patch: Partial<BillingConfig>) => setForm((f) => ({ ...f, ...patch }));
  const setPlan = (id: 'propietario' | 'complejo', patch: Partial<{ name: string; usd: number }>) =>
    setForm((f) => ({ ...f, plans: { ...f.plans, [id]: { ...f.plans[id], ...patch } } }));

  const save = async () => {
    setSaving(true);
    setMsg('');
    try {
      await saveBillingConfig(form);
      setMsg('Guardado. Los clientes ya lo ven en Mi plan.');
    } catch {
      setMsg('No se pudo guardar. Revisá que las reglas nuevas estén publicadas.');
    }
    setSaving(false);
  };

  return (
    <section className="rounded-2xl border border-stone-300 dark:border-zinc-600 bg-white dark:bg-[#18191E]">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="w-full text-left p-5 flex items-center justify-between gap-3 cursor-pointer">
        <span className="flex flex-col">
          <span className="text-[18px] font-bold">Cobro y precios</span>
          <span className="text-[15px] font-medium text-stone-800 dark:text-stone-100">
            {formatUsd(value.plans.propietario.usd)} y {formatUsd(value.plans.complejo.usd)} por mes
            {!value.alias && !value.cbu ? ' · faltan los datos de transferencia' : ''}
          </span>
        </span>
        <span className="text-[22px] font-bold" aria-hidden>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="border-t border-stone-300 dark:border-zinc-600 p-5 flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {(['propietario', 'complejo'] as const).map((id) => (
              <div key={id} className="flex flex-col gap-3">
                <label className={lbl}>
                  Plan {id === 'propietario' ? '(propietario)' : '(complejo)'}
                  <input className={field} value={form.plans[id].name} onChange={(e) => setPlan(id, { name: e.target.value })} />
                </label>
                <label className={lbl}>
                  Precio por mes en dólares
                  <input className={field} type="number" inputMode="decimal" min={0} value={form.plans[id].usd || ''} onChange={(e) => setPlan(id, { usd: Number(e.target.value) || 0 })} />
                </label>
              </div>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={lbl}>Titular<input className={field} value={form.holder} onChange={(e) => set({ holder: e.target.value })} /></label>
            <label className={lbl}>CUIT/CUIL<input className={field} value={form.cuit} onChange={(e) => set({ cuit: e.target.value })} /></label>
            <label className={lbl}>Alias<input className={field} value={form.alias} onChange={(e) => set({ alias: e.target.value })} /></label>
            <label className={lbl}>CBU<input className={field} inputMode="numeric" value={form.cbu} onChange={(e) => set({ cbu: e.target.value.replace(/\s/g, '') })} /></label>
            <label className={lbl}>Banco (opcional)<input className={field} value={form.bank} onChange={(e) => set({ bank: e.target.value })} /></label>
            <label className={lbl}>Número de cuenta (opcional)<input className={field} value={form.account} onChange={(e) => set({ account: e.target.value })} /></label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={lbl}>Mail de Payoneer (vacío = no se ofrece)<input className={field} type="email" value={form.payoneerEmail} onChange={(e) => set({ payoneerEmail: e.target.value.trim() })} /></label>
            <label className={lbl}>Descuento por Payoneer (%)<input className={field} type="number" min={0} max={50} value={form.payoneerDiscount} onChange={(e) => set({ payoneerDiscount: Number(e.target.value) || 0 })} /></label>
            <label className={lbl}>Días de gracia después del vencimiento<input className={field} type="number" min={0} max={30} value={form.graceDays} onChange={(e) => set({ graceDays: Number(e.target.value) || 0 })} /></label>
            <label className={lbl}>Dólar MEP de respaldo (si no carga el del día)<input className={field} type="number" min={0} value={form.mepFallback || ''} onChange={(e) => set({ mepFallback: Number(e.target.value) || 0 })} /></label>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" disabled={saving} onClick={save} className="min-h-[44px] px-5 rounded-xl text-[15px] font-bold cursor-pointer disabled:opacity-60 bg-[#A94F12] text-white dark:bg-[#F0A46F] dark:text-[#1A1206]">
              Guardar
            </button>
            {msg && <p role="status" className="text-[15px] font-bold">{msg}</p>}
          </div>
        </div>
      )}
    </section>
  );
};
