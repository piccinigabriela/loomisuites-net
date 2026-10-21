import React, { useEffect, useState } from 'react';
import { Plane } from 'lucide-react';
import { Reservation } from '../../types';

interface Props {
  reservation: Reservation;
  /** Hora que dejó el huésped en el pre check-in, si lo completó */
  precheckinArrival?: string;
  onSave?: (updated: Reservation) => void | Promise<void>;
}

/**
 * Recuadro siempre a mano en la ficha de la reserva: vuelo, aeropuerto o terminal,
 * hora estimada de llegada al alojamiento y notas libres. Se edita sin entrar en "Editar".
 */
export const ArrivalNotesCard: React.FC<Props> = ({ reservation, precheckinArrival, onSave }) => {
  const initial = () => ({
    flight: reservation.arrivalFlight || '',
    airport: reservation.arrivalAirport || '',
    eta: reservation.arrivalEta || '',
    notes: reservation.specialNotes || '',
  });
  const [form, setForm] = useState(initial);
  // Lo último guardado: la ficha puede seguir mostrando la reserva vieja después de guardar
  const [base, setBase] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Si cambia la reserva (o llega una versión nueva), se recarga lo guardado
  useEffect(() => {
    setForm(initial());
    setBase(initial());
    setSaved(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservation.id, reservation.arrivalFlight, reservation.arrivalAirport, reservation.arrivalEta, reservation.specialNotes]);

  const dirty =
    form.flight !== base.flight || form.airport !== base.airport || form.eta !== base.eta || form.notes !== base.notes;

  const set = (k: keyof ReturnType<typeof initial>) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSaved(false);
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  const save = async () => {
    if (!onSave || !dirty) return;
    setSaving(true);
    try {
      const clean = {
        flight: form.flight.trim().slice(0, 60),
        airport: form.airport.trim().slice(0, 80),
        eta: form.eta.trim().slice(0, 40),
        notes: form.notes.trim().slice(0, 2000),
      };
      await onSave({
        ...reservation,
        arrivalFlight: clean.flight,
        arrivalAirport: clean.airport,
        arrivalEta: clean.eta,
        specialNotes: clean.notes,
      });
      setForm(clean);
      setBase(clean);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const label = 'block text-[13px] font-bold text-stone-900 dark:text-stone-100 mb-1';
  const input =
    'w-full rounded-xl border border-stone-300 dark:border-zinc-600 bg-white dark:bg-[#101114] text-stone-900 dark:text-stone-50 text-[15px] px-3 py-2.5 focus:outline-none focus:border-[#A94F12] dark:focus:border-[#F0A46F]';
  const readOnly = !onSave;

  return (
    <div className="p-4 bg-white dark:bg-[#1A1B20] rounded-2xl border border-stone-200 dark:border-zinc-700 space-y-3">
      <h3 className="flex items-center gap-2 text-[15px] font-bold text-stone-900 dark:text-stone-50">
        <Plane className="w-4 h-4 text-[#A94F12] dark:text-[#F0A46F]" /> Llegada y notas
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={label} htmlFor="arr-flight">Vuelo</label>
          <input id="arr-flight" className={input} placeholder="Ej: AR 1724" value={form.flight} onChange={set('flight')} readOnly={readOnly} />
        </div>
        <div>
          <label className={label} htmlFor="arr-airport">Aeropuerto o terminal</label>
          <input id="arr-airport" className={input} placeholder="Ej: Aeroparque, 14:20" value={form.airport} onChange={set('airport')} readOnly={readOnly} />
        </div>
        <div className="sm:col-span-2">
          <label className={label} htmlFor="arr-eta">Llegada estimada al alojamiento</label>
          <input id="arr-eta" className={input} placeholder="Ej: 16:00" value={form.eta} onChange={set('eta')} readOnly={readOnly} />
          {precheckinArrival && precheckinArrival !== form.eta && (
            <p className="mt-1 text-[13px] text-stone-900 dark:text-stone-100">
              En el pre check-in dijo: <strong>{precheckinArrival}</strong>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => {
                    setSaved(false);
                    setForm((f) => ({ ...f, eta: precheckinArrival }));
                  }}
                  className="ml-2 font-bold text-[#A94F12] dark:text-[#F0A46F] underline underline-offset-2 cursor-pointer"
                >
                  Usar esta
                </button>
              )}
            </p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label className={label} htmlFor="arr-notes">Notas</label>
          <textarea
            id="arr-notes"
            rows={3}
            className={input}
            placeholder="Lo que quieras recordar de esta reserva"
            value={form.notes}
            onChange={set('notes')}
            readOnly={readOnly}
          />
        </div>
      </div>

      {!readOnly && (dirty || saved) && (
        <div className="flex items-center gap-3">
          {dirty && (
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="min-h-[44px] px-5 rounded-xl bg-[#A94F12] text-white dark:bg-[#F0A46F] dark:text-[#1A1206] text-[15px] font-bold cursor-pointer hover:opacity-90 disabled:opacity-60"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          )}
          {saved && !dirty && <span className="text-[14px] font-bold text-emerald-700 dark:text-emerald-400">✓ Guardado</span>}
        </div>
      )}
    </div>
  );
};
