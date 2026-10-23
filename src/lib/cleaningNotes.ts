/**
 * Notas de ida y vuelta en cada limpieza (tenants/{uid}/cleaningTasks/{id}.messages).
 * Se suman con arrayUnion: así Limpieza solo agrega la suya y no pisa las de otros (las reglas lo controlan).
 */
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { CleaningNote, CleaningTask } from '../types';

export const NOTE_MAX = 500;

export async function addCleaningNote(tenantUid: string, taskId: string, note: CleaningNote): Promise<void> {
  if (!db || !tenantUid) return;
  await updateDoc(doc(db, 'tenants', tenantUid, 'cleaningTasks', taskId), { messages: arrayUnion(note) });
}

export async function markCleaningNotesSeen(tenantUid: string, taskId: string, count: number): Promise<void> {
  if (!db || !tenantUid) return;
  await updateDoc(doc(db, 'tenants', tenantUid, 'cleaningTasks', taskId), { notesSeen: count });
}

/** Notas para mostrar: la nota vieja suelta (campo notes) va primero, como indicación de Administración */
export function taskNotes(task: CleaningTask): CleaningNote[] {
  const list = [...(task.messages || [])];
  if (task.notes && task.notes.trim()) list.unshift({ by: 'admin', name: '', text: task.notes.trim(), at: '' });
  return list;
}

/** Avisos de Limpieza que Administración todavía no vio */
export function unseenFromCleaning(task: CleaningTask): CleaningNote[] {
  const msgs = task.messages || [];
  return msgs.slice(task.notesSeen || 0).filter((m) => m.by === 'limpieza');
}

export function noteAuthor(email?: string | null, displayName?: string | null): string {
  const n = (displayName || '').trim().split(/\s+/)[0];
  if (n) return n.slice(0, 40);
  return (email || '').split('@')[0].slice(0, 40);
}
