/**
 * Tarjeta del anfitrión para Xenia en la guía y en Tu Web: activar/apagar y contador del mes.
 * Se muestra arriba en Tu Web y Guía (solo el dueño, en la app). El uso lo escribe el servidor en xeniaUsage/{uid}/months/{AAAA-MM}
 * y los temas que no supo responder en xeniaUsage/{uid}/questions (el dueño los borra con "Listo").
 */
import React, { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { XENIA_GUEST_EXTRA_USD, XENIA_GUEST_MONTH_LIMIT } from '../../lib/guestXenia';

const monthKey = () => new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 7);

export const GuestXeniaSettings: React.FC<{
  uid: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => Promise<void>;
  /** Hay un WhatsApp cargado (guía o Tu Web) para pasarle las consultas */
  hasWhatsapp: boolean;
}> = ({ uid, enabled, onToggle, hasWhatsapp }) => {
  const [usage, setUsage] = useState<{ conversations: number; handoffs: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [missing, setMissing] = useState<Array<{ id: string; topic: string; count: number }>>([]);

  // Lo que Xenia no supo responder porque no estaba en la guía ni en Tu Web
  useEffect(() => {
    if (!uid || !db || !enabled) return;
    return onSnapshot(
      query(collection(db, 'xeniaUsage', uid, 'questions'), orderBy('count', 'desc'), limit(8)),
      (snap) => setMissing(snap.docs.map((d) => ({ id: d.id, topic: String(d.data().topic || ''), count: Number(d.data().count) || 1 }))),
      () => setMissing([])
    );
  }, [uid, enabled]);

  const markDone = async (id: string) => {
    setMissing((prev) => prev.filter((m) => m.id !== id));
    try {
      await deleteDoc(doc(db!, 'xeniaUsage', uid, 'questions', id));
    } catch {}
  };

  useEffect(() => {
    if (!uid || !db || !enabled) return;
    return onSnapshot(
      doc(db, 'xeniaUsage', uid, 'months', monthKey()),
      (snap) => {
        const d = snap.data() || {};
        setUsage({ conversations: Number(d.conversations) || 0, handoffs: Number(d.handoffs) || 0 });
      },
      () => setUsage(null)
    );
  }, [uid, enabled]);

  const toggle = async () => {
    setSaving(true);
    setError('');
    try {
      await onToggle(!enabled);
    } catch {
      setError('No se pudo guardar. Probá de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const used = usage?.conversations || 0;
  const pct = Math.min(100, Math.round((used / XENIA_GUEST_MONTH_LIMIT) * 100));

  return (
    <section className="bg-white dark:bg-[#18191E] rounded-2xl p-5 sm:p-6 border border-stone-200 dark:border-zinc-800">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <img src="/xenia.jpg" alt="" className="w-14 h-14 rounded-full object-cover shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-stone-900 dark:text-white">Xenia responde a tus huéspedes</h3>
          <p className="mt-1 text-base text-stone-800 dark:text-stone-100 leading-relaxed">
            En tu guía y en Tu Web, en español, inglés y portugués, con lo que cargaste. Pagos, cambios de reserva, problemas y lo
            que no sabe te lo pasa por WhatsApp con la consulta escrita.
          </p>
        </div>
        <button
          type="button"
          onClick={toggle}
          disabled={saving}
          className={`shrink-0 min-h-[48px] px-5 rounded-2xl text-base font-bold cursor-pointer disabled:opacity-60 ${
            enabled
              ? 'border-2 border-stone-400 dark:border-zinc-500 text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-zinc-800'
              : 'bg-[#E67E22] hover:bg-[#d35400] text-[#111]'
          }`}
        >
          {saving ? 'Guardando…' : enabled ? 'Apagar' : 'Activar'}
        </button>
      </div>

      {error && <p className="mt-3 text-base font-bold text-red-700 dark:text-red-300">{error}</p>}

      {enabled && !hasWhatsapp && (
        <p className="mt-4 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-950 dark:text-amber-50 p-3 text-base font-semibold">
          Falta tu WhatsApp: cargalo en Ajustes de la guía para que Xenia pueda pasarte las consultas.
        </p>
      )}

      {enabled && (
        <div className="mt-5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-base font-semibold text-stone-900 dark:text-white">
              Este mes: {used.toLocaleString('es-AR')} de {XENIA_GUEST_MONTH_LIMIT.toLocaleString('es-AR')} conversaciones
            </p>
            {usage && usage.handoffs > 0 && (
              <p className="text-sm text-stone-800 dark:text-stone-200">{usage.handoffs} pasadas a vos</p>
            )}
          </div>
          <div className="mt-2 h-2.5 rounded-full bg-stone-200 dark:bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full ${pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {pct >= 100 ? (
            <p className="mt-3 text-base font-semibold text-red-700 dark:text-red-300">
              Llegaste al tope del mes: Xenia ofrece a tus huéspedes escribirte por WhatsApp hasta el mes que viene. Si querés sumar{' '}
              {XENIA_GUEST_MONTH_LIMIT.toLocaleString('es-AR')} más por USD {XENIA_GUEST_EXTRA_USD} por mes, escribinos.
            </p>
          ) : pct >= 80 ? (
            <p className="mt-3 text-base font-semibold text-amber-800 dark:text-amber-200">
              Ya usaste el {pct}% del mes. Al llegar al tope, Xenia ofrece a tus huéspedes escribirte por WhatsApp. Si preferís que
              siga respondiendo, podés sumar {XENIA_GUEST_MONTH_LIMIT.toLocaleString('es-AR')} más por USD {XENIA_GUEST_EXTRA_USD} por mes: escribinos.
            </p>
          ) : null}
        </div>
      )}

      {enabled && missing.length > 0 && (
        <div className="mt-6">
          <h4 className="text-base font-bold text-stone-900 dark:text-white">Lo que Xenia no supo responder</h4>
          <p className="text-sm text-stone-800 dark:text-stone-200 mb-3">
            Sumalo a tu guía o a Tu Web y la próxima vez lo responde sola. Cuando lo cargues, tocá "Listo".
          </p>
          <ul className="space-y-2">
            {missing.map((m) => (
              <li key={m.id} className="flex items-center gap-3 rounded-xl border border-stone-200 dark:border-zinc-700 px-4 py-2.5">
                <span className="flex-1 min-w-0 text-base text-stone-900 dark:text-white">
                  {m.topic.charAt(0).toUpperCase() + m.topic.slice(1)}
                  {m.count > 1 && <span className="ml-2 text-sm font-semibold text-stone-800 dark:text-stone-200">({m.count} veces)</span>}
                </span>
                <button
                  type="button"
                  onClick={() => markDone(m.id)}
                  className="shrink-0 min-h-[40px] px-4 rounded-xl border-2 border-stone-400 dark:border-zinc-500 text-sm font-bold text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Listo
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 text-sm text-stone-800 dark:text-stone-200 leading-relaxed">
        Incluida en tu plan: hasta {XENIA_GUEST_MONTH_LIMIT.toLocaleString('es-AR')} conversaciones por mes. Si necesitás más, sumás
        otras {XENIA_GUEST_MONTH_LIMIT.toLocaleString('es-AR')} por USD {XENIA_GUEST_EXTRA_USD} por mes, solo si lo pedís. Nunca se cobra sola.
      </p>
    </section>
  );
};
