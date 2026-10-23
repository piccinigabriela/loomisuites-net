/**
 * Hilo de notas de una limpieza. Administración/Recepción dejan indicaciones; Limpieza responde o avisa un problema.
 */
import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import type { CleaningNote, CleaningTask } from '../../types';
import { NOTE_MAX, taskNotes } from '../../lib/cleaningNotes';

const QUICK = ['Faltan insumos', 'Algo está roto', 'Todo en orden'];

function when(at: string): string {
  if (!at) return '';
  const d = new Date(at);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export const CleaningNotes: React.FC<{
  task: CleaningTask;
  /** Quién está mirando: cambia el texto de ayuda y los atajos */
  role: 'admin' | 'limpieza';
  onAdd: (text: string) => Promise<void> | void;
  /** Se abre solo (por ejemplo si hay avisos nuevos) */
  defaultOpen?: boolean;
  onOpen?: () => void;
}> = ({ task, role, onAdd, defaultOpen, onOpen }) => {
  const notes = taskNotes(task);
  const [open, setOpen] = useState(!!defaultOpen);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const send = async (value: string) => {
    const t = value.trim().slice(0, NOTE_MAX);
    if (!t) return;
    setSending(true);
    setError('');
    try {
      await onAdd(t);
      setText('');
    } catch {
      setError('No se pudo enviar. Probá de nuevo.');
    }
    setSending(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          onOpen?.();
        }}
        className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl border border-stone-300 dark:border-zinc-600 text-sm font-bold text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer"
      >
        <MessageSquare className="w-4 h-4" />
        {notes.length ? `Notas (${notes.length})` : role === 'limpieza' ? 'Avisar algo' : 'Dejar una nota'}
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-900 p-3 space-y-3">
      {notes.length === 0 && (
        <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
          {role === 'limpieza' ? 'Avisá si falta algo o si encontraste algo roto.' : 'Dejá una indicación para quien limpie.'}
        </p>
      )}
      {notes.map((n: CleaningNote, i) => (
        <div
          key={i}
          className={`rounded-xl px-3 py-2 text-sm ${
            n.by === 'limpieza'
              ? 'bg-amber-100 text-amber-950 dark:bg-amber-900/40 dark:text-amber-50'
              : 'bg-white text-stone-900 dark:bg-zinc-800 dark:text-white border border-stone-200 dark:border-zinc-700'
          }`}
        >
          <div className="text-xs font-bold mb-0.5">
            {n.by === 'limpieza' ? 'Limpieza' : 'Administración'}
            {n.name ? ` · ${n.name}` : ''}
            {when(n.at) ? ` · ${when(n.at)}` : ''}
          </div>
          <div className="font-medium whitespace-pre-line break-words">{n.text}</div>
        </div>
      ))}
      {role === 'limpieza' && (
        <div className="flex flex-wrap gap-2">
          {QUICK.map((q) => (
            <button
              key={q}
              type="button"
              disabled={sending}
              onClick={() => setText((t) => (t ? `${t} ${q}` : q))}
              className="px-3 py-1.5 rounded-full border border-stone-300 dark:border-zinc-600 text-xs font-bold text-stone-900 dark:text-white cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          maxLength={NOTE_MAX}
          placeholder={role === 'limpieza' ? 'Ej: falta papel higiénico, la canilla del baño gotea' : 'Ej: cambiar las cortinas, dejar leña extra'}
          className="flex-1 min-w-0 text-base font-medium p-2.5 rounded-xl border border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 text-stone-900 dark:text-white placeholder:text-stone-500 dark:placeholder:text-zinc-400"
        />
        <button
          type="button"
          aria-label="Enviar nota"
          disabled={sending || !text.trim()}
          onClick={() => send(text)}
          className="shrink-0 w-12 h-12 rounded-xl bg-[#A94F12] dark:bg-[#F0A46F] text-white dark:text-[#1A1206] flex items-center justify-center cursor-pointer disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      {error && <p className="text-sm font-bold text-rose-700 dark:text-rose-300">{error}</p>}
    </div>
  );
};
