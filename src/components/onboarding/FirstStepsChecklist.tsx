/**
 * "Cómo configurar Loomi": la lista de primeros pasos arriba de Hoy (solo en la app real, para el dueño).
 * Idea tomada del onboarding de Areca (4/11): pasos numerados, una línea que explica cada uno y un botón para ir.
 * Cada paso se tilda solo cuando está hecho; algunos se pueden marcar a mano ("No uso Airbnb ni Booking").
 */
import React, { useState } from 'react';
import { Check, ChevronRight, Copy, MapPin, X } from 'lucide-react';
import { WelcomeGuideData, Property, Reservation } from '../../types';

type ChecklistFlags = { calendarios?: boolean; guia?: boolean; diaADia?: boolean; googleMaps?: boolean };

/** Lo opcional que ya está hecho (se calcula en App con los datos de la cuenta) */
export interface FirstStepsExtras {
  pricingDone?: boolean;
  webDone?: boolean;
  xeniaDone?: boolean;
  cleaningChecklistDone?: boolean;
  /** Link de Tu Web publicada ('' si no hay) */
  webUrl?: string;
}

interface FirstStepsChecklistProps {
  welcomeGuide?: WelcomeGuideData;
  properties: Property[];
  reservations: Reservation[];
  onboardingChecklist?: ChecklistFlags;
  checklistDismissed?: boolean;
  extras?: FirstStepsExtras;
  onOpenOnboarding: () => void;
  /** Ir a una pantalla de la app (ids de demoTab) */
  onNavigate: (tab: string) => void;
  /** Tu Web y Guía, en la pestaña que corresponda */
  onOpenGuide: (sub: 'guest-view' | 'landing-booking') => void;
  onUpdateChecklist: (update: ChecklistFlags) => void;
  onDismissChecklist: () => void;
}

/** Estado de cada paso (lo usa también el atajo para volver a la lista). */
export function getFirstStepsStatus({
  welcomeGuide,
  properties = [],
  reservations = [],
  onboardingChecklist = {},
  pricingDone = false,
}: {
  welcomeGuide?: WelcomeGuideData;
  properties?: Property[];
  reservations?: Reservation[];
  onboardingChecklist?: ChecklistFlags;
  pricingDone?: boolean;
}) {
  const name = (welcomeGuide?.propertyName || '').trim();
  const isComplexDone = Boolean(name && !/^mi complejo$/i.test(name) && (welcomeGuide?.locationAddress || '').trim());
  const isUnitsDone = properties.length > 0;
  const isPricingDone = Boolean(pricingDone);
  const hasSync = properties.some((p) => Boolean(p.syncStatus?.airbnb || p.syncStatus?.booking || p.syncStatus?.vrbo || p.icalGoogleUrl));
  const isCalendarsDone = Boolean(onboardingChecklist.calendarios || hasSync);
  const isReservationsDone = reservations.length > 0;
  const isGuideDone = Boolean(
    onboardingChecklist.guia || ((welcomeGuide?.hostPhone || '').trim() && (welcomeGuide?.wifiNetwork || '').trim())
  );
  const flags = [isComplexDone, isUnitsDone, isPricingDone, isCalendarsDone, isReservationsDone, isGuideDone];
  return {
    isComplexDone,
    isUnitsDone,
    isPricingDone,
    isCalendarsDone,
    isReservationsDone,
    isGuideDone,
    completedCount: flags.filter(Boolean).length,
    total: flags.length,
  };
}

export const FirstStepsChecklist: React.FC<FirstStepsChecklistProps> = ({
  welcomeGuide,
  properties = [],
  reservations = [],
  onboardingChecklist = {},
  checklistDismissed = false,
  extras = {},
  onOpenOnboarding,
  onNavigate,
  onOpenGuide,
  onUpdateChecklist,
  onDismissChecklist,
}) => {
  const [mapsOpen, setMapsOpen] = useState(false);
  if (checklistDismissed) return null;

  const s = getFirstStepsStatus({ welcomeGuide, properties, reservations, onboardingChecklist, pricingDone: extras.pricingDone });

  const steps: Array<{
    id: string;
    title: string;
    text: string;
    done: boolean;
    action: () => void;
    actionText?: string;
    manual?: { label: string; onClick: () => void };
  }> = [
    { id: 'complex', title: 'Tu complejo', text: 'Nombre, dirección y horarios de check-in y check-out.', done: s.isComplexDone, action: onOpenOnboarding },
    { id: 'units', title: 'Tus unidades', text: 'Cabañas o departamentos, con capacidad, fotos y wifi.', done: s.isUnitsDone, action: () => onNavigate('properties') },
    { id: 'pricing', title: 'Tus tarifas', text: 'Precio normal, temporadas, fines de semana y findes largos. Con esto se calculan las reservas y Tu Web.', done: s.isPricingDone, action: () => onNavigate('pricing') },
    {
      id: 'calendars',
      title: 'Airbnb y Booking',
      text: 'Pegá el calendario de cada portal en su unidad para que Loomi traiga las reservas y no haya doble reserva.',
      done: s.isCalendarsDone,
      action: () => onNavigate('properties'),
      manual: { label: 'No uso Airbnb ni Booking', onClick: () => onUpdateChecklist({ calendarios: true }) },
    },
    { id: 'reservations', title: 'Tus reservas', text: 'Cargá las que ya tenés, a mano o importando un Excel, para ver la ocupación real.', done: s.isReservationsDone, action: () => onNavigate('calendar') },
    {
      id: 'guide',
      title: 'La guía de tus huéspedes',
      text: 'Tu WhatsApp, el wifi, cómo llegar y las normas. Se comparte con un link o con el QR.',
      done: s.isGuideDone,
      action: () => onOpenGuide('guest-view'),
      manual: { label: 'Ya está', onClick: () => onUpdateChecklist({ guia: true }) },
    },
  ];

  const optional: Array<{ id: string; title: string; text: string; done?: boolean; action: () => void }> = [
    { id: 'team', title: 'Tu equipo', text: 'Cuentas para Recepción y Limpieza, cada una con lo suyo.', action: () => onNavigate('team') },
    { id: 'web', title: 'Tu Web', text: 'Tu página de reservas directas, sin comisiones.', done: extras.webDone, action: () => onOpenGuide('landing-booking') },
    { id: 'xenia', title: 'Xenia para huéspedes', text: 'Responde dudas en tu guía y en Tu Web.', done: extras.xeniaDone, action: () => onOpenGuide('guest-view') },
    { id: 'cleaning', title: 'Tu checklist de limpieza', text: 'Las tareas de cada limpieza y las de cada unidad.', done: extras.cleaningChecklistDone, action: () => onNavigate('housekeeping') },
    { id: 'messages', title: 'Mensajes de WhatsApp', text: 'Confirmación, llegada y pedido de reseña, listos para enviar.', action: () => onNavigate('messages') },
    // Con Tu Web publicada: el link en el perfil de Google, para que quien busca el complejo en Maps reserve directo
    ...(extras.webUrl
      ? [{ id: 'maps', title: 'Tu Web en Google Maps', text: 'Que quien te busca en Google reserve directo, sin comisión.', done: onboardingChecklist?.googleMaps, action: () => setMapsOpen(true) }]
      : []),
  ];

  const pct = Math.round((s.completedCount / s.total) * 100);
  const allDone = s.completedCount === s.total;

  return (
    <section className="w-full mb-6 rounded-3xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-[#18191E] p-5 sm:p-7 text-stone-900 dark:text-white">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Cómo configurar Loomi</h2>
          <p className="mt-1 text-base text-stone-800 dark:text-stone-100">
            {allDone ? 'Tu complejo está listo.' : `${s.completedCount} de ${s.total} listos. Lo que hagas se tilda solo.`}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismissChecklist}
          className="min-h-[40px] px-4 rounded-xl border-2 border-stone-300 dark:border-zinc-600 text-sm font-bold hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer"
        >
          {allDone ? 'Cerrar la guía' : 'Ocultar por ahora'}
        </button>
      </div>

      <div className="mt-4 h-2 rounded-full bg-stone-200 dark:bg-zinc-800 overflow-hidden">
        <div className="h-full rounded-full bg-[#E67E22] transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      <ol className="mt-5 divide-y divide-stone-200 dark:divide-zinc-800 rounded-2xl border border-stone-200 dark:border-zinc-800">
        {steps.map((st, i) => (
          <li key={st.id} className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 ${st.done ? '' : 'bg-orange-50/40 dark:bg-white/[0.02]'}`}>
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <span
                className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${
                  st.done ? 'bg-emerald-600 text-white' : 'border-2 border-stone-400 dark:border-zinc-500 text-stone-900 dark:text-white'
                }`}
                aria-hidden
              >
                {st.done ? <Check className="w-4 h-4" /> : i + 1}
              </span>
              <div className="min-w-0">
                <p className={`text-base font-bold ${st.done ? 'line-through decoration-2 decoration-emerald-600/60' : ''}`}>{st.title}</p>
                <p className="text-sm text-stone-800 dark:text-stone-200 leading-relaxed">{st.text}</p>
                {!st.done && st.manual && (
                  <button
                    type="button"
                    onClick={st.manual.onClick}
                    className="mt-1 text-sm font-semibold text-[#A94F12] dark:text-[#F5A35C] underline underline-offset-4 cursor-pointer"
                  >
                    {st.manual.label}
                  </button>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={st.action}
              className={`self-start sm:self-center ml-11 sm:ml-0 shrink-0 min-h-[40px] px-4 rounded-xl text-sm font-bold flex items-center gap-1 cursor-pointer ${
                st.done
                  ? 'text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-zinc-800'
                  : 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:bg-black dark:hover:bg-stone-100'
              }`}
            >
              {st.done ? 'Ver' : 'Configurar'} <ChevronRight className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ol>

      <h3 className="mt-7 text-base font-bold">Pasos opcionales</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {optional.map((op) => (
          <button
            key={op.id}
            type="button"
            onClick={op.action}
            className="text-left rounded-2xl border border-stone-200 dark:border-zinc-800 p-4 hover:border-[#E67E22] cursor-pointer"
          >
            <span className="flex items-center gap-2 text-base font-bold">
              {op.done && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              {op.title}
            </span>
            <span className="block mt-1 text-sm text-stone-800 dark:text-stone-200">{op.text}</span>
          </button>
        ))}
      </div>

      {mapsOpen && extras.webUrl && (
        <GoogleMapsHelp
          url={extras.webUrl}
          done={!!onboardingChecklist?.googleMaps}
          onDone={() => {
            onUpdateChecklist({ googleMaps: true });
            setMapsOpen(false);
          }}
          onClose={() => setMapsOpen(false)}
        />
      )}
    </section>
  );
};

/** Cómo poner el link de Tu Web en el perfil de Google del complejo (lo que aparece en Maps). Gratis y sin programar nada. */
const GoogleMapsHelp: React.FC<{ url: string; done: boolean; onDone: () => void; onClose: () => void }> = ({ url, done, onDone, onClose }) => {
  const [copied, setCopied] = useState(false);
  const copy = () =>
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  const steps = [
    'Buscá tu complejo en Google con la cuenta que lo administra (o entrá a business.google.com) y tocá "Editar perfil".',
    'En "Contacto", pegá el link en "Sitio web". Si te aparece "Vínculos de reserva", pegalo también ahí.',
    'Guardá. Google puede tardar unos días en mostrarlo.',
  ];
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-label="Tu Web en Google Maps"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg bg-white dark:bg-[#18191E] text-stone-900 dark:text-white rounded-t-3xl sm:rounded-3xl border border-stone-200 dark:border-zinc-800 p-6 space-y-5"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#E67E22]" /> Tu Web en Google Maps
          </h3>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="w-10 h-10 -mt-1 -mr-2 rounded-full flex items-center justify-center hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-base text-stone-800 dark:text-stone-200">
          Mucha gente busca el complejo en Google antes de reservar. Con tu link ahí, reservan directo con vos, sin comisión.
        </p>
        <div className="flex items-center gap-2 rounded-xl border-2 border-stone-300 dark:border-zinc-600 p-2 pl-3">
          <span className="flex-1 min-w-0 truncate text-base font-bold">{url.replace('https://', '')}</span>
          <button type="button" onClick={copy} className="shrink-0 min-h-[40px] px-3 rounded-lg bg-[#E67E22] hover:bg-[#D35400] text-[#111] text-sm font-bold flex items-center gap-1.5 cursor-pointer">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
        <ol className="space-y-3">
          {steps.map((t, i) => (
            <li key={i} className="flex gap-3 text-base">
              <span className="w-7 h-7 shrink-0 rounded-full border-2 border-stone-400 dark:border-zinc-500 flex items-center justify-center text-sm font-bold">{i + 1}</span>
              <span>{t}</span>
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={onDone}
          className="w-full min-h-[48px] rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-base font-bold cursor-pointer"
        >
          {done ? 'Listo' : 'Ya lo puse'}
        </button>
      </div>
    </div>
  );
};
