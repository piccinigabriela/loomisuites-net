import React, { useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { Zap } from 'lucide-react';
import { db } from '../../lib/firebase';
import type { ChannelManagerSettings } from '../../lib/aiosell';
import type { Property } from '../../types';
import { saveChannelRatesDoc } from '../../lib/tenantStore';

interface LogItem {
  at: string;
  mode: string;
  action: string;
  channel: string;
  summary: string[];
}

const ACTION: Record<string, string> = { book: 'Reserva nueva', modify: 'Cambio', cancel: 'Cancelación' };

const fmt = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

/**
 * Unidades → "Conexión directa con las plataformas" (solo el dueño y solo si la administración lo conectó).
 * Dice si está activa o en prueba, qué unidades están conectadas, deja elegir si se mandan los precios de Tarifas
 * y muestra lo último que llegó. Nunca nombra al proveedor. Lee tenants/{uid}/channelLog y sync/aiosell (reglas del dueño).
 */
export const ChannelConnectionCard: React.FC<{ uid: string; cm: ChannelManagerSettings; properties: Property[] }> = ({ uid, cm, properties }) => {
  const [log, setLog] = useState<LogItem[] | null>(null);
  const [live, setLive] = useState<boolean | null>(null);
  const [sendRates, setSendRates] = useState(cm.rates?.send === true);
  const [percent, setPercent] = useState(String(cm.rates?.percent ?? 0));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setSendRates(cm.rates?.send === true);
    setPercent(String(cm.rates?.percent ?? 0));
  }, [cm.rates?.send, cm.rates?.percent]);

  useEffect(() => {
    if (!db || !uid) return;
    let off = false;
    (async () => {
      try {
        const [snap, sync] = await Promise.all([
          getDocs(query(collection(db!, 'tenants', uid, 'channelLog'), orderBy('at', 'desc'), limit(5))),
          getDoc(doc(db!, 'tenants', uid, 'sync', 'aiosell')),
        ]);
        if (off) return;
        setLog(snap.docs.map((d) => d.data() as LogItem));
        setLive(sync.exists() ? sync.get('mode') === 'real' : null);
      } catch {
        if (!off) setLog([]);
      }
    })();
    return () => {
      off = true;
    };
  }, [uid]);

  const units = Object.entries(cm.units || {}).filter(([, u]) => u && u.enabled !== false && u.roomCode);
  const names = units.map(([pid]) => properties.find((p) => p.id === pid)?.name || pid);
  const changed = sendRates !== (cm.rates?.send === true) || (Number(percent) || 0) !== (Number(cm.rates?.percent) || 0);

  const save = async () => {
    setSaving(true);
    setMsg('');
    try {
      await saveChannelRatesDoc(uid, { send: sendRates, percent: Number(percent) || 0 });
      setMsg('Guardado. Se aplica en los próximos minutos.');
    } catch {
      setMsg('No se pudo guardar. Probá de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (!cm.enabled) return null;

  return (
    <section className="mb-5 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-[#18191E] p-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[17px] font-bold text-stone-900 dark:text-white">
          <Zap className="w-5 h-5 text-[#C2410C] dark:text-[#F0A46F]" />
          Conexión directa con las plataformas
        </h2>
        <span
          className={`text-[14px] font-bold px-3 py-1 rounded-full ${
            live === false
              ? 'bg-amber-100 text-amber-950 dark:bg-amber-900/50 dark:text-amber-50'
              : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100'
          }`}
        >
          {live === false ? 'En prueba' : live ? 'Activa' : 'Conectada'}
        </span>
      </div>

      <p className="text-[15px] text-stone-800 dark:text-stone-100">
        {live === false
          ? 'La estamos probando: por ahora las reservas siguen entrando por los calendarios, como siempre.'
          : 'Las reservas de Airbnb, Booking y las demás plataformas llegan al instante, y Loomi les avisa qué fechas están ocupadas.'}
      </p>

      {names.length > 0 && (
        <p className="text-[15px] text-stone-900 dark:text-stone-50">
          <span className="font-bold">Unidades conectadas:</span> {names.join(', ')}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-[15px] font-semibold text-stone-900 dark:text-stone-50 cursor-pointer">
          <input type="checkbox" checked={sendRates} onChange={(e) => setSendRates(e.target.checked)} className="w-5 h-5 accent-[#C2410C]" />
          Mandar mis precios de Tarifas a las plataformas
        </label>
        {sendRates && (
          <label className="flex items-center gap-2 text-[15px] font-semibold text-stone-900 dark:text-stone-50">
            con un ajuste de
            <input
              type="number"
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
              className="w-20 min-h-[40px] rounded-xl border border-stone-400 dark:border-zinc-500 bg-white dark:bg-zinc-800 px-3 text-[15px] font-semibold"
            />
            %
          </label>
        )}
        {changed && (
          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="min-h-[40px] px-4 rounded-xl text-[15px] font-bold bg-[#A94F12] text-white dark:bg-[#F0A46F] dark:text-[#1A1206] cursor-pointer disabled:opacity-60"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        )}
      </div>
      {!sendRates && (
        <p className="text-[14px] text-stone-800 dark:text-stone-200 -mt-2">Los precios los seguís manejando en cada plataforma.</p>
      )}
      {msg && <p className="text-[14px] font-bold text-stone-900 dark:text-stone-50">{msg}</p>}

      {log && log.length > 0 && (
        <div className="border-t border-stone-200 dark:border-zinc-800 pt-3 flex flex-col gap-1.5">
          <span className="text-[14px] font-bold text-stone-900 dark:text-stone-50">Lo último que llegó</span>
          <ul className="flex flex-col gap-1">
            {log.map((l, i) => (
              <li key={i} className="text-[14px] text-stone-800 dark:text-stone-100">
                <span className="font-semibold">
                  {fmt(l.at)} · {ACTION[l.action] || l.action}
                  {l.channel ? ` · ${l.channel}` : ''}
                  {l.mode === 'prueba' ? ' (prueba)' : ''}
                </span>
                {l.summary?.length ? ` — ${l.summary.join(' · ')}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
