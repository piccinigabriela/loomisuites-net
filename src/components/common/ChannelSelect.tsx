/**
 * Selector "Canal de origen" de las reservas: Directa, Airbnb, Booking, Vrbo y los orígenes propios del complejo
 * (src/lib/origins.ts). Con "+ Nuevo origen…" se crea uno en el momento (nombre + comisión), y si está elegido uno propio
 * se puede cambiar su comisión ahí mismo.
 */
import React, { useState } from 'react';
import type { ReservationOrigin } from '../../types';
import { BUILTIN_CHANNELS, decodeChannel, newOriginId } from '../../lib/origins';

const NEW = '__nuevo__';

export const ChannelSelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  origins: ReservationOrigin[];
  /** Guarda la lista entera de orígenes (alta o cambio de comisión). Sin esto no se pueden crear. */
  onSaveOrigins?: (list: ReservationOrigin[]) => void;
  className: string;
}> = ({ value, onChange, origins, onSaveOrigins, className }) => {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [pct, setPct] = useState('');
  const [editingPct, setEditingPct] = useState<string | null>(null);
  const current = decodeChannel(value).origin ? origins.find((o) => o.id === decodeChannel(value).origin) : undefined;

  const small = 'w-full text-xs font-semibold p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100';

  const create = () => {
    const label = name.trim().slice(0, 40);
    if (!label || !onSaveOrigins) return;
    const existing = origins.find((o) => o.label.toLowerCase() === label.toLowerCase());
    if (existing) {
      onChange(`o:${existing.id}`);
    } else {
      const o: ReservationOrigin = { id: newOriginId(), label, commission: Math.min(50, Math.max(0, Math.round(Number(pct) || 0))) };
      onSaveOrigins([...origins, o]);
      onChange(`o:${o.id}`);
    }
    setCreating(false);
    setName('');
    setPct('');
  };

  return (
    <div className="space-y-2">
      <select
        value={creating ? NEW : value}
        onChange={(e) => {
          if (e.target.value === NEW) return setCreating(true);
          setCreating(false);
          onChange(e.target.value);
        }}
        className={className}
      >
        {BUILTIN_CHANNELS.map((c) => (
          <option key={c.value} value={c.value}>
            {c.value === 'direct' ? 'Directa (sin comisión)' : c.label}
          </option>
        ))}
        {origins.map((o) => (
          <option key={o.id} value={`o:${o.id}`}>
            {o.label}
            {o.commission ? ` (${o.commission} %)` : ''}
          </option>
        ))}
        {onSaveOrigins && <option value={NEW}>+ Nuevo origen…</option>}
      </select>

      {creating && (
        <div className="p-3 rounded-xl border border-zinc-300 dark:border-zinc-600 space-y-2">
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Instagram, Agencia Sur, Despegar" className={small} aria-label="Nombre del origen" />
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={50}
              inputMode="numeric"
              value={pct}
              onChange={(e) => setPct(e.target.value)}
              placeholder="0"
              className={`${small} w-20 text-center`}
              aria-label="Comisión en porcentaje"
            />
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">% de comisión (0 si no cobra)</span>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={create} disabled={!name.trim()} className="px-3 py-2 rounded-xl bg-[#E67E22] text-[#111] text-xs font-bold disabled:opacity-50 cursor-pointer">
              Sumar origen
            </button>
            <button type="button" onClick={() => setCreating(false)} className="px-3 py-2 rounded-xl text-xs font-bold cursor-pointer">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {current && onSaveOrigins && !creating && (
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
          {editingPct === null ? (
            <>
              <span>Comisión de {current.label}: {current.commission} %</span>
              <button type="button" onClick={() => setEditingPct(String(current.commission))} className="underline underline-offset-2 font-bold cursor-pointer">
                Cambiar
              </button>
            </>
          ) : (
            <>
              <input
                type="number"
                min={0}
                max={50}
                value={editingPct}
                onChange={(e) => setEditingPct(e.target.value)}
                className={`${small} w-20 text-center`}
                aria-label={`Comisión de ${current.label}`}
              />
              <span>%</span>
              <button
                type="button"
                onClick={() => {
                  onSaveOrigins(origins.map((o) => (o.id === current.id ? { ...o, commission: Math.min(50, Math.max(0, Math.round(Number(editingPct) || 0))) } : o)));
                  setEditingPct(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#E67E22] text-[#111] font-bold cursor-pointer"
              >
                Guardar
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
