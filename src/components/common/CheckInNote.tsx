/**
 * Nota fija para el check-in (idea de Areca, 5/11): un texto del complejo que aparece cada vez que se da el ingreso
 * ("pedir DNI y patente, explicar la pileta"). Se guarda en tenants/{uid}.checkinNote; la escribe el dueño
 * (Equipo y accesos o desde la misma ventana) y la ven el dueño y Recepción. Sin nota, el check-in se hace directo.
 */
import React, { useEffect, useState } from 'react';
import { Check, ClipboardCheck, X } from 'lucide-react';

export const CHECKIN_NOTE_MAX = 600;

const textareaCls =
  'w-full px-3.5 py-3 rounded-xl border border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-base text-stone-900 dark:text-white placeholder:text-stone-600 dark:placeholder:text-stone-400 focus:outline-none focus:border-[#E67E22]';

/** Ventana que aparece al dar el ingreso, con la nota y el botón para confirmar */
export const CheckInNoteModal: React.FC<{
  guests: Array<{ id: string; name: string; unit: string }>;
  note: string;
  canEdit: boolean;
  onSaveNote: (text: string) => Promise<void> | void;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ guests, note, canEdit, onSaveNote, onConfirm, onCancel }) => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(note);
  useEffect(() => setText(note), [note]);

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onCancel}>
      <div
        role="dialog"
        aria-label="Antes de dar el ingreso"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-white dark:bg-[#18191E] text-stone-900 dark:text-white rounded-t-3xl sm:rounded-3xl border border-stone-200 dark:border-zinc-800 p-6 space-y-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-[#E67E22]" /> Antes de dar el ingreso
            </h3>
            <p className="mt-1 text-base font-semibold text-stone-800 dark:text-stone-200">
              {guests.map((g) => `${g.name}${g.unit ? ` · ${g.unit}` : ''}`).join(', ')}
            </p>
          </div>
          <button type="button" onClick={onCancel} aria-label="Cerrar" className="w-10 h-10 -mt-1 -mr-2 shrink-0 rounded-full flex items-center justify-center hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {editing ? (
          <div className="space-y-2">
            <textarea rows={5} maxLength={CHECKIN_NOTE_MAX} value={text} onChange={(e) => setText(e.target.value)} className={textareaCls} aria-label="Nota para el check-in" />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={async () => {
                  await onSaveNote(text.trim());
                  setEditing(false);
                }}
                className="min-h-[44px] px-5 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-[#111] font-bold cursor-pointer"
              >
                Guardar nota
              </button>
              <button type="button" onClick={() => setEditing(false)} className="min-h-[44px] px-4 rounded-xl font-bold hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer">
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 p-4">
            <p className="text-base leading-relaxed whitespace-pre-line text-amber-950 dark:text-amber-50">{note}</p>
            {canEdit && (
              <button type="button" onClick={() => setEditing(true)} className="mt-2 text-sm font-bold underline underline-offset-4 text-amber-950 dark:text-amber-100 cursor-pointer">
                Cambiar la nota
              </button>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={onConfirm}
          disabled={editing}
          className="w-full min-h-[52px] rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-base font-bold flex items-center justify-center gap-2 cursor-pointer"
        >
          <Check className="w-5 h-5" /> Listo, dar el ingreso
        </button>
      </div>
    </div>
  );
};

/** Tarjeta para escribir la nota (Equipo y accesos) */
export const CheckInNoteCard: React.FC<{ note: string; onSave: (text: string) => Promise<void> | void }> = ({ note, onSave }) => {
  const [text, setText] = useState(note);
  const [saved, setSaved] = useState(false);
  useEffect(() => setText(note), [note]);
  const dirty = text.trim() !== (note || '').trim();
  return (
    <div className="bg-white dark:bg-[#18191E] rounded-2xl border border-stone-200 dark:border-zinc-800 p-5 space-y-3">
      <h3 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
        <ClipboardCheck className="w-5 h-5 text-[#E67E22]" /> Nota para cada check-in
      </h3>
      <p className="text-base text-stone-800 dark:text-stone-200">
        Aparece cada vez que vos o Recepción dan un ingreso. Si la dejás vacía, el ingreso se da directo.
      </p>
      <textarea
        rows={4}
        maxLength={CHECKIN_NOTE_MAX}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Por ejemplo: pedir DNI y patente del auto, explicar el horario de la pileta y dónde se dejan las llaves al salir."
        className={textareaCls}
        aria-label="Nota para cada check-in"
      />
      <div className="flex items-center gap-3">
        {dirty && (
          <button
            type="button"
            onClick={async () => {
              await onSave(text.trim());
              setSaved(true);
              setTimeout(() => setSaved(false), 2500);
            }}
            className="min-h-[44px] px-5 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-[#111] font-bold cursor-pointer"
          >
            Guardar
          </button>
        )}
        {saved && (
          <span className="flex items-center gap-1.5 text-base font-bold text-emerald-800 dark:text-emerald-200">
            <Check className="w-4 h-4" /> Guardada
          </span>
        )}
      </div>
    </div>
  );
};
