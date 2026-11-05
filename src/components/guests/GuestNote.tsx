/**
 * Nota del huésped (5/11): "viene con su perro", "aniversario", "prefiere planta baja".
 * Se guarda en la reserva (guestNote) y aparece en todas las reservas de esa persona (src/lib/guests.ts).
 */
import React, { useEffect, useState } from 'react';
import { StickyNote } from 'lucide-react';
import { GUEST_NOTE_MAX } from '../../lib/guests';

export const GuestNoteBox: React.FC<{
  note: string;
  /** Sin onSave se muestra sin poder editarla */
  onSave?: (text: string) => Promise<void> | void;
  /** Abrir directamente para escribir (desde la lista de Huéspedes) */
  initialEditing?: boolean;
  /** Al guardar o cancelar */
  onDone?: () => void;
}> = ({ note, onSave, initialEditing = false, onDone }) => {
  const [editing, setEditing] = useState(initialEditing);
  const [text, setText] = useState(note);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!editing) setText(note);
  }, [note, editing]);

  if (!note && !onSave) return null;

  if (!editing) {
    if (!note) {
      return (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="w-full min-h-[44px] px-4 rounded-2xl border-2 border-dashed border-amber-400 dark:border-amber-700 text-sm font-bold text-amber-950 dark:text-amber-100 flex items-center gap-2 hover:bg-amber-50 dark:hover:bg-amber-950/30 cursor-pointer"
        >
          <StickyNote className="w-4 h-4 shrink-0" />
          <span>Agregar una nota del huésped</span>
          <span className="font-semibold text-stone-800 dark:text-stone-200">· se recuerda cuando vuelve</span>
        </button>
      );
    }
    return (
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-start gap-3">
        <StickyNote className="w-5 h-5 shrink-0 mt-0.5 text-amber-700 dark:text-amber-300" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-900 dark:text-amber-200">Nota del huésped</p>
          <p className="mt-0.5 text-sm font-semibold text-stone-900 dark:text-white whitespace-pre-line break-words">{note}</p>
        </div>
        {onSave && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 min-h-[36px] px-3 rounded-xl border-2 border-amber-400 dark:border-amber-700 text-sm font-bold text-amber-950 dark:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-900/40 cursor-pointer"
          >
            Editar
          </button>
        )}
      </div>
    );
  }

  const save = async (value: string) => {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave(value.trim().slice(0, GUEST_NOTE_MAX));
      setEditing(false);
      onDone?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-2">
      <label className="block">
        <span className="text-sm font-bold text-stone-900 dark:text-white">Nota del huésped</span>
        <span className="block text-sm text-stone-800 dark:text-stone-200">Aparece cada vez que esta persona vuelve a reservar.</span>
        <textarea
          autoFocus
          value={text}
          maxLength={GUEST_NOTE_MAX}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Ej.: viene con su perro · prefiere planta baja · aniversario en marzo"
          className="mt-2 w-full p-3 rounded-xl border-2 border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-base text-stone-900 dark:text-white placeholder:text-stone-600 dark:placeholder:text-stone-400 focus:outline-none focus:border-[#E67E22]"
        />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => save(text)}
          className="min-h-[40px] px-4 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-[#111] text-sm font-bold disabled:opacity-60 cursor-pointer"
        >
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={() => {
            setText(note);
            setEditing(false);
            onDone?.();
          }}
          className="min-h-[40px] px-4 rounded-xl border-2 border-stone-300 dark:border-zinc-600 text-sm font-bold text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer"
        >
          Cancelar
        </button>
        {note && (
          <button
            type="button"
            disabled={saving}
            onClick={() => save('')}
            className="ml-auto min-h-[40px] px-3 rounded-xl text-sm font-bold text-red-800 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
          >
            Borrar nota
          </button>
        )}
      </div>
    </div>
  );
};
