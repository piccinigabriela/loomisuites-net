import React, { useEffect, useState } from 'react';
import {
  ChannelAdminState,
  ChannelUnitSetting,
  channelActionLabel,
  disconnectChannel,
  fmtChannelTime,
  getChannelState,
  saveChannelSettings,
} from '../../lib/channelAdmin';

/**
 * Panel de clientes → un cliente → Channel manager (Aiosell).
 * Conecta la cuenta a su hotel de Aiosell, dice qué habitación es cada unidad, prueba o real, y si se mandan precios.
 * Muestra los últimos avisos de Aiosell y el último envío. Escribe por functions/api/channel/admin.js.
 */
export const ChannelManagerAdmin: React.FC<{ uid: string }> = ({ uid }) => {
  const [state, setState] = useState<ChannelAdminState | null>(null);
  const [loadError, setLoadError] = useState('');
  const [hotelCode, setHotelCode] = useState('');
  const [mode, setMode] = useState<'prueba' | 'real'>('prueba');
  const [units, setUnits] = useState<Record<string, ChannelUnitSetting>>({});
  const [sendRates, setSendRates] = useState(false);
  const [percent, setPercent] = useState('0');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [confirmReal, setConfirmReal] = useState(false);
  const [confirmOff, setConfirmOff] = useState(false);

  const load = async () => {
    setLoadError('');
    try {
      const s = await getChannelState(uid);
      setState(s);
      const cm = s.channelManager;
      setHotelCode(cm?.hotelCode || '');
      setMode(s.hotel?.mode === 'real' ? 'real' : 'prueba');
      setUnits(cm?.units || {});
      setSendRates(cm?.rates?.send === true);
      setPercent(String(cm?.rates?.percent ?? 0));
    } catch (e: any) {
      setLoadError(e?.message || 'No se pudo leer el estado.');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const connected = !!(state?.channelManager?.enabled && state?.hotel);
  const wasReal = state?.hotel?.mode === 'real';

  const setUnit = (id: string, patch: Partial<ChannelUnitSetting>) => setUnits((u) => ({ ...u, [id]: { ...u[id], ...patch } }));

  const save = async () => {
    if (mode === 'real' && !wasReal && !confirmReal) {
      setConfirmReal(true);
      return;
    }
    setBusy(true);
    setErr('');
    setMsg('');
    try {
      const r = await saveChannelSettings({ uid, hotelCode: hotelCode.trim(), mode, units, rates: { send: sendRates, percent: Number(percent) || 0 } });
      setMsg(r.message);
      setConfirmReal(false);
      await load();
    } catch (e: any) {
      setErr(e?.message || 'No se pudo guardar.');
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    setBusy(true);
    setErr('');
    setMsg('');
    try {
      const r = await disconnectChannel(uid);
      setMsg(r.message);
      setConfirmOff(false);
      await load();
    } catch (e: any) {
      setErr(e?.message || 'No se pudo desconectar.');
    } finally {
      setBusy(false);
    }
  };

  const btn = 'min-h-[44px] px-5 rounded-xl text-[15px] font-bold cursor-pointer disabled:opacity-60';
  const primary = `${btn} bg-[#A94F12] text-white dark:bg-[#F0A46F] dark:text-[#1A1206] hover:opacity-90`;
  const outline = `${btn} border border-stone-400 dark:border-zinc-500 text-stone-900 dark:text-stone-50 bg-white dark:bg-zinc-800`;
  const input =
    'min-h-[44px] rounded-xl border border-stone-400 dark:border-zinc-500 bg-white dark:bg-zinc-800 px-3 text-[15px] font-semibold text-stone-900 dark:text-stone-50 w-full';

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-stone-300 dark:border-zinc-600 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[16px] font-bold">Channel manager (Aiosell)</span>
        {state && (
          <span
            className={`text-[14px] font-bold px-3 py-1 rounded-full ${
              connected
                ? wasReal
                  ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100'
                  : 'bg-amber-100 text-amber-950 dark:bg-amber-900/50 dark:text-amber-50'
                : 'bg-stone-200 text-stone-900 dark:bg-zinc-700 dark:text-stone-50'
            }`}
          >
            {connected ? (wasReal ? 'Conectado · real' : 'Conectado · prueba') : 'Sin conectar'}
          </span>
        )}
      </div>

      {loadError && (
        <p className="text-[15px] font-semibold text-rose-800 dark:text-rose-200">
          {loadError}{' '}
          <button type="button" onClick={load} className="underline cursor-pointer">
            Reintentar
          </button>
        </p>
      )}
      {!state && !loadError && <p className="text-[15px] font-semibold">Cargando…</p>}

      {state && (
        <>
          <label className="flex flex-col gap-1.5 text-[15px] font-bold">
            Código del hotel en Aiosell
            <input value={hotelCode} onChange={(e) => setHotelCode(e.target.value)} placeholder="el que da Aiosell, por ejemplo sandbox-pms" className={input} />
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="text-[15px] font-bold">Modo</span>
            <div className="flex flex-wrap gap-2">
              <button type="button" aria-pressed={mode === 'prueba'} onClick={() => { setMode('prueba'); setConfirmReal(false); }} className={mode === 'prueba' ? primary : outline}>
                Prueba
              </button>
              <button type="button" aria-pressed={mode === 'real'} onClick={() => setMode('real')} className={mode === 'real' ? primary : outline}>
                Real
              </button>
            </div>
            <span className="text-[14px] font-medium">
              {mode === 'prueba'
                ? 'Prueba: anota lo que haría con cada aviso de Aiosell, sin tocar reservas, y no les manda nada a las plataformas.'
                : 'Real: los avisos de Aiosell crean, cambian y cancelan reservas, y Loomi le manda la disponibilidad cada 10 minutos.'}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[15px] font-bold">Unidades → habitación en Aiosell</span>
            {state.units.length === 0 && <span className="text-[15px] font-medium">Esta cuenta todavía no tiene unidades.</span>}
            {state.units.map((u) => (
              <div key={u.id} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr] gap-2 items-center">
                <span className="text-[15px] font-semibold">{u.name}</span>
                <input aria-label={`Habitación de ${u.name}`} value={units[u.id]?.roomCode || ''} onChange={(e) => setUnit(u.id, { roomCode: e.target.value })} placeholder="Código de habitación" className={input} />
                <input aria-label={`Tarifa de ${u.name}`} value={units[u.id]?.rateplanCode || ''} onChange={(e) => setUnit(u.id, { rateplanCode: e.target.value })} placeholder="Tarifa (opcional, STD)" className={input} />
              </div>
            ))}
            <span className="text-[14px] font-medium">Una unidad sin código no se conecta. Los códigos los da Aiosell al dar de alta el hotel.</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-[15px] font-bold cursor-pointer">
              <input type="checkbox" checked={sendRates} onChange={(e) => setSendRates(e.target.checked)} className="w-5 h-5" />
              Mandar los precios de Tarifas y la estadía mínima
            </label>
            {sendRates && (
              <label className="flex items-center gap-2 text-[15px] font-bold">
                Ajuste
                <input type="number" value={percent} onChange={(e) => setPercent(e.target.value)} className={`${input.replace(' w-full', '')} w-24`} />
                %
              </label>
            )}
          </div>

          {confirmReal && (
            <p className="rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-950 dark:text-amber-50 p-4 text-[15px] font-semibold">
              En modo real, Aiosell va a crear y cancelar reservas en esta cuenta, y Loomi va a cerrar fechas en las plataformas. Tocá "Guardar" de nuevo para confirmar.
            </p>
          )}
          {err && <p className="text-[15px] font-bold text-rose-800 dark:text-rose-200">{err}</p>}
          {msg && <p className="text-[15px] font-bold text-emerald-800 dark:text-emerald-200">{msg}</p>}

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" disabled={busy} onClick={save} className={primary}>
              {busy ? 'Guardando…' : confirmReal ? 'Guardar en modo real' : 'Guardar'}
            </button>
            {connected &&
              (confirmOff ? (
                <>
                  <span className="text-[15px] font-bold">¿Desconectar? Aiosell deja de poder cargar reservas acá.</span>
                  <button type="button" disabled={busy} onClick={disconnect} className={`${btn} bg-rose-800 text-white dark:bg-rose-300 dark:text-rose-950`}>
                    Sí, desconectar
                  </button>
                  <button type="button" onClick={() => setConfirmOff(false)} className={outline}>
                    No
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => setConfirmOff(true)} className={`${btn} border border-rose-700 dark:border-rose-300 text-rose-800 dark:text-rose-200`}>
                  Desconectar
                </button>
              ))}
          </div>

          {(state.sync || state.log.length > 0) && (
            <div className="flex flex-col gap-2 border-t border-stone-300 dark:border-zinc-600 pt-3">
              {state.sync && (
                <span className="text-[14px] font-medium">
                  Último aviso de Aiosell: {state.sync.lastAt ? `${fmtChannelTime(state.sync.lastAt)} (${channelActionLabel(state.sync.lastAction)})` : 'ninguno'} · Último envío a Aiosell:{' '}
                  {state.sync.lastSendAt ? fmtChannelTime(state.sync.lastSendAt) : 'ninguno'}
                  {state.sync.lastSendError && <span className="font-bold text-rose-800 dark:text-rose-200"> · Error: {state.sync.lastSendError}</span>}
                </span>
              )}
              {state.log.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                  {state.log.map((l, i) => (
                    <li key={i} className="text-[14px] font-medium">
                      <span className="font-bold">
                        {fmtChannelTime(l.at)} · {channelActionLabel(l.action)}
                        {l.channel ? ` · ${l.channel}` : ''}
                        {l.mode === 'prueba' ? ' · prueba' : ''}
                      </span>
                      {l.summary.length > 0 && <span> — {l.summary.join(' · ')}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
