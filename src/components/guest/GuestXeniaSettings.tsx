/**
 * Tarjeta del anfitrión para Xenia en la guía y en Tu Web: activar/apagar y contador del mes.
 * Se muestra arriba en Tu Web y Guía (solo el dueño, en la app). El uso lo escribe el servidor en xeniaUsage/{uid}/months/{AAAA-MM}.
 */
import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { XENIA_GUEST_MONTH_LIMIT, XENIA_GUEST_TRIAL_END } from '../../lib/guestXenia';

const monthKey = () => new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 7);
const trialEnd = new Date(`${XENIA_GUEST_TRIAL_END}T12:00:00Z`).toLocaleDateString('es-AR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

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
              Llegaste al tope del mes: Xenia ofrece escribirte por WhatsApp hasta el mes que viene. Si necesitás más, escribinos.
            </p>
          ) : pct >= 80 ? (
            <p className="mt-3 text-base font-semibold text-amber-800 dark:text-amber-200">
              Ya usaste el {pct}% del mes. Al llegar al tope, Xenia ofrece escribirte por WhatsApp.
            </p>
          ) : null}
        </div>
      )}

      <p className="mt-4 text-sm text-stone-800 dark:text-stone-200 leading-relaxed">
        Sin cargo durante el lanzamiento, hasta el {trialEnd}. Incluye hasta {XENIA_GUEST_MONTH_LIMIT.toLocaleString('es-AR')}{' '}
        conversaciones por mes. Antes de cualquier cambio te avisamos con 30 días, y nunca se cobra sola.
      </p>
    </section>
  );
};
