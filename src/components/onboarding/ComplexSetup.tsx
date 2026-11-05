/**
 * "Tu complejo" paso a paso (5/11, idea de Areca): nombre, ubicación, contacto y horarios, de a un tema por pantalla.
 * Arranca con lo que ya está cargado y guarda solo estos datos (welcomeGuide + complexName/city/address + moneda),
 * sin tocar unidades, guía, opcionales ni mensajes. Reemplaza en la app real al asistente viejo (OnboardingWizardModal),
 * que pisaba la guía entera y la fecha de alta; ese queda solo para la demo.
 */
import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import type { CurrencyCode, WelcomeGuideData } from '../../types';

export interface ComplexSetupData {
  complexName: string;
  tagline: string;
  address: string;
  city: string;
  googleMapsUrl: string;
  hostPhone: string;
  checkinHour: string;
  checkoutHour: string;
  currency: CurrencyCode;
}

const STEPS = ['Nombre', 'Ubicación', 'Contacto', 'Horarios'] as const;

const HOURS = Array.from({ length: 36 }, (_, i) => {
  const mins = 6 * 60 + i * 30; // de 06:00 a 23:30
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${mins % 60 ? '30' : '00'}`;
});

const cleanHour = (v?: string) => {
  const m = /^(\d{1,2})(?:[:.](\d{2}))?/.exec((v || '').trim());
  if (!m) return '';
  return `${m[1].padStart(2, '0')}:${m[2] || '00'}`;
};

const inputCls =
  'mt-1.5 w-full min-h-[48px] px-3.5 rounded-xl border-2 border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-base text-stone-900 dark:text-white placeholder:text-stone-600 dark:placeholder:text-stone-400 focus:outline-none focus:border-[#E67E22]';

const Field: React.FC<{ label: string; hint?: string; optional?: boolean; children: React.ReactNode }> = ({ label, hint, optional, children }) => (
  <label className="block">
    <span className="text-base font-bold text-stone-900 dark:text-white">
      {label}
      {optional && <span className="font-semibold text-stone-800 dark:text-stone-200"> · opcional</span>}
    </span>
    {hint && <span className="block mt-0.5 text-sm text-stone-800 dark:text-stone-200">{hint}</span>}
    {children}
  </label>
);

export const ComplexSetup: React.FC<{
  isOpen: boolean;
  guide?: WelcomeGuideData;
  city?: string;
  currency?: CurrencyCode;
  onSave: (data: ComplexSetupData) => Promise<void> | void;
  onClose: () => void;
  /** "Seguir con tus unidades" al terminar */
  onNext?: () => void;
}> = ({ isOpen, guide, city, currency, onSave, onClose, onNext }) => {
  const initial = (): ComplexSetupData => ({
    complexName: /^mi complejo$/i.test((guide?.propertyName || '').trim()) ? '' : guide?.propertyName || '',
    tagline: /^cabañas & alojamiento$/i.test((guide?.tagline || '').trim()) ? '' : guide?.tagline || '',
    address: guide?.locationAddress || '',
    city: city || '',
    googleMapsUrl: guide?.googleMapsUrl || '',
    hostPhone: guide?.hostPhone || '',
    checkinHour: cleanHour(guide?.checkinHour) || '14:00',
    checkoutHour: cleanHour(guide?.checkoutHour) || '10:00',
    currency: currency === 'USD' ? 'USD' : 'ARS',
  });
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ComplexSetupData>(initial);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setData(initial());
      setStep(0);
      setError('');
      setDone(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const set = (k: keyof ComplexSetupData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setData((d) => ({ ...d, [k]: e.target.value }));
    setError('');
  };

  const missing = (): string => {
    if (step === 0 && !data.complexName.trim()) return 'Escribí el nombre del complejo.';
    if (step === 1 && (!data.address.trim() || !data.city.trim())) return 'Completá la dirección y la ciudad.';
    if (step === 2 && data.hostPhone.replace(/\D/g, '').length < 8) return 'Escribí el WhatsApp con código de área.';
    return '';
  };

  const next = async () => {
    const m = missing();
    if (m) {
      setError(m);
      return;
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    setSaving(true);
    try {
      await onSave({ ...data, complexName: data.complexName.trim(), tagline: data.tagline.trim(), address: data.address.trim(), city: data.city.trim(), googleMapsUrl: data.googleMapsUrl.trim(), hostPhone: data.hostPhone.trim() });
      setDone(true);
    } catch {
      setError('No se pudo guardar. Revisá la conexión y probá de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const hourOptions = (value: string) => (HOURS.includes(value) ? HOURS : [value, ...HOURS]).map((h) => (
    <option key={h} value={h}>
      {h} hs
    </option>
  ));

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true" aria-label="Datos de tu complejo">
      <div className="w-full sm:max-w-lg max-h-[100dvh] sm:max-h-[92vh] overflow-y-auto bg-white dark:bg-[#18191E] text-stone-900 dark:text-white rounded-t-3xl sm:rounded-3xl shadow-2xl font-sans">
        <div className="px-5 sm:px-7 pt-5 sm:pt-6 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Tu complejo</h2>
            {!done && (
              <p className="mt-0.5 text-sm font-semibold text-stone-800 dark:text-stone-200">
                Paso {step + 1} de {STEPS.length} · {STEPS[step]}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!done && (
          <div className="px-5 sm:px-7 mt-3 flex gap-1.5" aria-hidden="true">
            {STEPS.map((s, i) => (
              <span key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-[#E67E22]' : 'bg-stone-200 dark:bg-zinc-700'}`} />
            ))}
          </div>
        )}

        <div className="px-5 sm:px-7 py-6 space-y-5">
          {done ? (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <p className="text-lg font-bold">Listo, {data.complexName} quedó cargado.</p>
              <dl className="rounded-2xl border border-stone-200 dark:border-zinc-700 divide-y divide-stone-200 dark:divide-zinc-700 text-base">
                {[
                  ['Dirección', `${data.address}, ${data.city}`],
                  ['WhatsApp', data.hostPhone],
                  ['Horarios', `Ingreso desde las ${data.checkinHour} · salida hasta las ${data.checkoutHour}`],
                  ['Moneda', data.currency === 'USD' ? 'Dólares' : 'Pesos'],
                ].map(([k, v]) => (
                  <div key={k} className="px-4 py-2.5 flex flex-col sm:flex-row sm:gap-3">
                    <dt className="sm:w-28 shrink-0 text-sm font-bold text-stone-800 dark:text-stone-200">{k}</dt>
                    <dd className="font-semibold break-words">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-base text-stone-800 dark:text-stone-200">Lo podés cambiar cuando quieras desde Cómo configurar Loomi.</p>
            </div>
          ) : step === 0 ? (
            <>
              <Field label="Nombre del complejo" hint="Así lo ven tus huéspedes en la guía, en los mensajes y en Tu Web.">
                <input autoFocus value={data.complexName} onChange={set('complexName')} placeholder="Ej.: Cabañas del Río" className={inputCls} maxLength={60} />
              </Field>
              <Field label="Frase corta" optional hint="Aparece debajo del nombre.">
                <input value={data.tagline} onChange={set('tagline')} placeholder="Ej.: Departamentos a una cuadra del mar" className={inputCls} maxLength={80} />
              </Field>
            </>
          ) : step === 1 ? (
            <>
              <Field label="Dirección">
                <input autoFocus value={data.address} onChange={set('address')} placeholder="Ej.: Av. Libertador 1234" className={inputCls} maxLength={120} />
              </Field>
              <Field label="Ciudad">
                <input value={data.city} onChange={set('city')} placeholder="Ej.: San Carlos de Bariloche" className={inputCls} maxLength={60} />
              </Field>
              <Field label="Link de Google Maps" optional hint="En Google Maps buscá tu complejo, tocá Compartir y Copiar vínculo.">
                <input value={data.googleMapsUrl} onChange={set('googleMapsUrl')} placeholder="https://maps.app.goo.gl/…" className={inputCls} inputMode="url" />
              </Field>
            </>
          ) : step === 2 ? (
            <Field label="WhatsApp del alojamiento" hint="Con código de país y área. Lo usan tus huéspedes desde la guía y llegan ahí los pedidos de Tu Web.">
              <input autoFocus value={data.hostPhone} onChange={set('hostPhone')} placeholder="Ej.: +54 9 11 1234-5678" className={inputCls} inputMode="tel" maxLength={30} />
            </Field>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Ingreso desde">
                  <select value={data.checkinHour} onChange={set('checkinHour')} className={inputCls}>
                    {hourOptions(data.checkinHour)}
                  </select>
                </Field>
                <Field label="Salida hasta">
                  <select value={data.checkoutHour} onChange={set('checkoutHour')} className={inputCls}>
                    {hourOptions(data.checkoutHour)}
                  </select>
                </Field>
              </div>
              <fieldset>
                <legend className="text-base font-bold">¿En qué moneda cobrás?</legend>
                <span className="block mt-0.5 text-sm text-stone-800 dark:text-stone-200">La de tus tarifas e informes.</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(['ARS', 'USD'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setData((d) => ({ ...d, currency: c }))}
                      aria-pressed={data.currency === c}
                      className={`min-h-[48px] rounded-xl border-2 text-base font-bold cursor-pointer ${
                        data.currency === c
                          ? 'bg-[#E67E22] border-[#E67E22] text-[#111]'
                          : 'border-stone-300 dark:border-zinc-600 hover:bg-stone-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {c === 'ARS' ? 'Pesos' : 'Dólares'}
                    </button>
                  ))}
                </div>
              </fieldset>
            </>
          )}

          {error && <p className="text-base font-bold text-red-700 dark:text-red-300" role="alert">{error}</p>}
        </div>

        <div className="px-5 sm:px-7 pb-6 flex items-center gap-2">
          {done ? (
            <>
              {onNext && (
                <button
                  type="button"
                  onClick={onNext}
                  className="flex-1 min-h-[48px] rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-[#111] text-base font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  Seguir con tus unidades <ArrowRight className="w-5 h-5" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="min-h-[48px] px-5 rounded-xl border-2 border-stone-300 dark:border-zinc-600 text-base font-bold hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cerrar
              </button>
            </>
          ) : (
            <>
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setStep(step - 1);
                    setError('');
                  }}
                  className="min-h-[48px] px-4 rounded-xl border-2 border-stone-300 dark:border-zinc-600 text-base font-bold flex items-center gap-1.5 hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" /> Atrás
                </button>
              )}
              <button
                type="button"
                disabled={saving}
                onClick={next}
                className="flex-1 min-h-[48px] rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-[#111] text-base font-bold flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {step < STEPS.length - 1 ? (
                  <>
                    Siguiente <ArrowRight className="w-5 h-5" />
                  </>
                ) : saving ? (
                  'Guardando…'
                ) : (
                  'Guardar'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplexSetup;
