import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Reminder, ReminderRepeat } from '../../../types';
import { newReminder, REPEAT_LABEL } from '../../../lib/reminders';

interface ReminderSheetProps {
  /** Si viene, se edita; si no, es uno nuevo */
  reminder?: Reminder;
  defaultDate: string;
  onSave: (r: Reminder) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  onClose: () => void;
}

const REPEATS: ReminderRepeat[] = ['none', 'monthly', 'yearly'];

export const ReminderSheet: React.FC<ReminderSheetProps> = ({ reminder, defaultDate, onSave, onDelete, onClose }) => {
  const [date, setDate] = useState(reminder?.date || defaultDate);
  const [text, setText] = useState(reminder?.text || '');
  const [repeat, setRepeat] = useState<ReminderRepeat>(reminder?.repeat || 'none');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async () => {
    if (!text.trim()) {
      setError('Escribí qué querés recordar.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError('Elegí una fecha.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      if (reminder) {
        // Si cambió la fecha o la repetición, la serie arranca de la fecha nueva
        const changed = date !== reminder.date || repeat !== reminder.repeat;
        await onSave({
          ...reminder,
          text: text.trim(),
          date,
          repeat,
          anchor: changed ? date : reminder.anchor || date,
          done: changed ? false : reminder.done,
        });
      } else {
        await onSave(newReminder(date, text, repeat));
      }
      onClose();
    } catch {
      setError('No se pudo guardar. Probá de nuevo.');
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!reminder) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setBusy(true);
    try {
      await onDelete(reminder.id);
      onClose();
    } catch {
      setError('No se pudo borrar. Probá de nuevo.');
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={reminder ? 'Editar recordatorio' : 'Nuevo recordatorio'}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#1A1B20] text-stone-900 dark:text-gray-100 rounded-t-[28px] sm:rounded-[28px] p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold">📌 {reminder ? 'Editar recordatorio' : 'Nuevo recordatorio'}</h3>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="w-10 h-10 rounded-full bg-[#E8E2D8] dark:bg-zinc-700 text-stone-900 dark:text-gray-100 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="rem-text" className="block text-sm font-bold">¿Qué querés recordar?</label>
          <textarea
            id="rem-text"
            rows={3}
            maxLength={200}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ej: Pagar la factura de la luz"
            className="w-full text-base p-3 rounded-2xl border-2 border-stone-400 dark:border-zinc-500 bg-white dark:bg-[#111215] text-stone-900 dark:text-gray-100 placeholder-stone-600 dark:placeholder-gray-400 focus:outline-none focus:border-[#A8480F] dark:focus:border-[#FFB27F]"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="rem-date" className="block text-sm font-bold">Fecha</label>
          <input
            id="rem-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full text-base p-3 rounded-2xl border-2 border-stone-400 dark:border-zinc-500 bg-white dark:bg-[#111215] text-stone-900 dark:text-gray-100 focus:outline-none focus:border-[#A8480F] dark:focus:border-[#FFB27F] dark:[color-scheme:dark]"
          />
        </div>

        <div className="space-y-1.5">
          <span className="block text-sm font-bold">Repetir</span>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Repetir">
            {REPEATS.map((opt) => (
              <button
                key={opt}
                type="button"
                role="radio"
                aria-checked={repeat === opt}
                onClick={() => setRepeat(opt)}
                className={`py-2.5 px-1 rounded-xl text-sm font-bold border-2 cursor-pointer transition-colors ${
                  repeat === opt
                    ? 'bg-stone-900 text-white border-stone-900 dark:bg-[#FFB27F] dark:text-stone-900 dark:border-[#FFB27F]'
                    : 'bg-white text-stone-900 border-stone-400 dark:bg-[#111215] dark:text-gray-100 dark:border-zinc-500'
                }`}
              >
                {opt === 'none' ? 'Nunca' : opt === 'monthly' ? 'Mensual' : 'Anual'}
              </button>
            ))}
          </div>
          {repeat !== 'none' && (
            <p className="text-xs font-semibold text-stone-800 dark:text-gray-200">
              {REPEAT_LABEL[repeat]}: al tildarlo aparece el siguiente.
            </p>
          )}
        </div>

        {error && (
          <p role="alert" className="text-sm font-bold text-red-800 dark:text-red-300">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 pt-1">
          {reminder && (
            <button
              onClick={handleDelete}
              disabled={busy}
              className={`px-4 py-3 rounded-2xl text-sm font-bold border-2 cursor-pointer disabled:opacity-60 ${
                confirmDelete
                  ? 'bg-red-700 text-white border-red-700'
                  : 'bg-white text-red-800 border-red-700 dark:bg-transparent dark:text-red-300 dark:border-red-400'
              }`}
            >
              {confirmDelete ? 'Tocá de nuevo para borrar' : 'Borrar'}
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={busy}
            className="flex-1 py-3 rounded-2xl text-sm font-extrabold bg-[#A8480F] text-white dark:bg-[#FFB27F] dark:text-stone-900 cursor-pointer disabled:opacity-60"
          >
            {busy ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};
