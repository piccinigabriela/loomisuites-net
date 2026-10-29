/**
 * Mi plan: estado del abono (precio en dólares), cómo pagar (transferencia en pesos al MEP del día, o Payoneer con descuento) y "Ya pagué".
 * Se abre desde el menú de la cuenta, desde el aviso de vencimiento y desde la pantalla de cuenta pausada.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, Loader2, MessageCircle, X } from 'lucide-react';
import type { AccessStatus, SubscriptionDoc } from '../../lib/subscription';
import {
  BillingConfig,
  fetchMep,
  fetchMyNotices,
  formatArs,
  MepQuote,
  PayMethod,
  PaymentNotice,
  PlanId,
  sendPaymentNotice,
  arsAmount,
  payoneerAmount,
  formatUsd,
} from '../../lib/billing';

interface Props {
  uid: string;
  email: string;
  complexName: string;
  subscription: SubscriptionDoc | null;
  access: AccessStatus | null;
  billing: BillingConfig;
  /** Si viene, se muestra como ventana con botón de cerrar */
  onClose?: () => void;
}

const SUPPORT_WA = '5491140925939';
const fmtDate = (d?: Date) => (d ? d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }) : '');

const card = 'rounded-2xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-[#18191E] p-5 space-y-3';
const label = 'text-sm font-bold text-stone-900 dark:text-white';
const text = 'text-base font-medium text-stone-900 dark:text-stone-100';
const primary =
  'inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-xl bg-[#A94F12] hover:bg-[#8F420F] dark:bg-[#F0A46F] dark:hover:bg-[#F5B583] text-white dark:text-[#1A1206] text-base font-bold cursor-pointer disabled:opacity-60';
const ghost =
  'inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl border border-stone-400 dark:border-zinc-500 text-stone-900 dark:text-white text-base font-bold hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer disabled:opacity-60';

const CopyRow: React.FC<{ name: string; value: string; mono?: boolean }> = ({ name, value, mono }) => {
  const [done, setDone] = useState(false);
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-sm font-bold text-stone-800 dark:text-stone-200">{name}</div>
        <div className={`text-base font-bold text-stone-900 dark:text-white break-all ${mono ? 'font-mono' : ''}`}>{value}</div>
      </div>
      <button
        type="button"
        aria-label={`Copiar ${name}`}
        onClick={() =>
          navigator.clipboard?.writeText(value).then(() => {
            setDone(true);
            setTimeout(() => setDone(false), 1800);
          })
        }
        className="shrink-0 w-11 h-11 rounded-xl border border-stone-300 dark:border-zinc-600 flex items-center justify-center text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer"
      >
        {done ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
      </button>
    </div>
  );
};

export const MyPlanView: React.FC<Props> = ({ uid, email, complexName, subscription, access, billing, onClose }) => {
  const [plan, setPlan] = useState<PlanId>(subscription?.plan || 'propietario');
  const [mep, setMep] = useState<MepQuote | null>(null);
  const [mepLoading, setMepLoading] = useState(false);
  const [notices, setNotices] = useState<PaymentNotice[]>([]);
  const [sending, setSending] = useState<PayMethod | null>(null);
  const [sent, setSent] = useState<PayMethod | null>(null);
  const [error, setError] = useState('');
  // Al elegir un plan: confirmación visible y la pantalla baja sola a cómo pagar
  const [chosen, setChosen] = useState(false);
  const payRef = useRef<HTMLDivElement>(null);
  const choosePlan = (id: PlanId) => {
    setPlan(id);
    setChosen(true);
    setTimeout(() => payRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  const usdPrice = billing.plans[plan].usd;
  const hasTransfer = !!(billing.alias || billing.cbu);
  const hasPayoneer = !!billing.payoneerEmail;
  const ars = mep ? arsAmount(usdPrice, mep.rate) : 0;
  const payoneer = payoneerAmount(usdPrice, billing.payoneerDiscount);
  const pending = notices.find((n) => !n.handled);

  useEffect(() => {
    if (!hasTransfer) return;
    let alive = true;
    setMepLoading(true);
    fetchMep(billing.mepFallback)
      .then((q) => alive && setMep(q))
      .finally(() => alive && setMepLoading(false));
    return () => {
      alive = false;
    };
  }, [hasTransfer, billing.mepFallback]);

  useEffect(() => {
    let alive = true;
    fetchMyNotices(uid)
      .then((list) => alive && setNotices(list))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [uid, sent]);

  const notify = async (method: PayMethod) => {
    setSending(method);
    setError('');
    try {
      await sendPaymentNotice({
        uid,
        complexName: complexName || '',
        email: email || '',
        plan,
        method,
        amount: method === 'payoneer' ? payoneer : ars,
        currency: method === 'payoneer' ? 'USD' : 'ARS',
        rate: method === 'transferencia' && mep ? mep.rate : 0,
      });
      setSent(method);
    } catch {
      setError('No se pudo enviar el aviso. Escribinos por WhatsApp y lo vemos.');
    }
    setSending(null);
  };

  let status = '';
  if (access?.state === 'active') status = access.until ? `Activo hasta el ${fmtDate(access.until)}` : 'Activo';
  else if (access?.state === 'trial') status = access.daysLeft === 1 ? 'Prueba gratis: último día' : `Prueba gratis: quedan ${access.daysLeft} días`;
  else if (access?.state === 'grace')
    status = `Venció el ${fmtDate(access.until)}. Tenés ${access.daysLeft} ${access.daysLeft === 1 ? 'día' : 'días'} para pagar antes de que se pause la cuenta.`;
  else if (access?.state === 'expired' && onClose) status = 'La cuenta está en pausa. Tus datos están guardados: al pagar, vuelve a funcionar.';

  const waText = encodeURIComponent(`Hola, quiero consultar por mi plan de Loomi Suite. Mi mail: ${email}`);

  const body = (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Mi plan</h2>
          {status && <p className={`${text} mt-1`}>{status}</p>}
        </div>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Cerrar" className="w-11 h-11 rounded-xl flex items-center justify-center text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Plan */}
      {subscription?.plan ? (
        <div className={card}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-lg font-bold text-stone-900 dark:text-white">{billing.plans[plan].name}</span>
            <span className="text-2xl font-bold text-stone-900 dark:text-white tabular-nums">{formatUsd(usdPrice)}</span>
          </div>
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">Por mes. Se paga en pesos al dólar MEP del día, o en dólares por Payoneer.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className={label}>Elegí tu plan</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {(['propietario', 'complejo'] as PlanId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => choosePlan(id)}
                aria-pressed={plan === id}
                className={`text-left rounded-2xl border-2 p-4 cursor-pointer ${
                  plan === id ? 'border-[#A94F12] dark:border-[#F0A46F] bg-orange-50 dark:bg-orange-950/30' : 'border-stone-300 dark:border-zinc-700 bg-white dark:bg-[#18191E]'
                }`}
              >
                <span className="block text-lg font-bold text-stone-900 dark:text-white">{billing.plans[id].name}</span>
                <span className="block text-sm font-semibold text-stone-800 dark:text-stone-200">
                  {id === 'propietario' ? 'Hasta 5 unidades, sin personal' : 'Con recepción y limpieza'}
                </span>
                <span className="block mt-2 text-xl font-bold text-stone-900 dark:text-white tabular-nums">{formatUsd(billing.plans[id].usd)} / mes</span>
                {plan === id && (
                  <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-[#A94F12] dark:text-[#F0A46F]">
                    <Check className="w-4 h-4" /> Elegido
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">Se paga en pesos al dólar MEP del día, o en dólares por Payoneer.</p>
        </div>
      )}

      {pending && !sent && (
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-4 text-base font-bold text-emerald-900 dark:text-emerald-100">
          Ya nos avisaste que pagaste. Lo confirmamos y renovamos tu plan dentro de las 24 hs hábiles.
        </div>
      )}

      <div ref={payRef} className="scroll-mt-3 space-y-5">
      {chosen && !subscription?.plan && (
        <div role="status" className="rounded-2xl bg-orange-50 dark:bg-orange-950/40 border-2 border-[#A94F12] dark:border-[#F0A46F] p-4">
          <p className="text-base font-bold text-stone-900 dark:text-white">
            Elegiste {billing.plans[plan].name}: {formatUsd(usdPrice)} por mes.
          </p>
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-200 mt-1">Pagá como te quede cómodo y después tocá "Ya transferí" o "Ya pagué".</p>
        </div>
      )}

      {/* Transferencia */}
      <div className={card}>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-lg font-bold text-stone-900 dark:text-white">Transferencia</span>
          {ars > 0 && <span className="text-xl font-bold text-stone-900 dark:text-white tabular-nums">{formatArs(ars)}</span>}
        </div>
        {hasTransfer ? (
          <div className="space-y-3">
            {mepLoading ? (
              <p className={text}>Buscando el dólar MEP de hoy…</p>
            ) : ars > 0 ? (
              <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                {formatUsd(usdPrice)} al dólar MEP {mep?.source === 'hoy' ? 'de hoy' : 'de referencia'}: {formatArs(mep!.rate)}.
              </p>
            ) : (
              <p className={text}>Consultanos el monto en pesos por WhatsApp.</p>
            )}
            <CopyRow name="Alias" value={billing.alias} />
            <CopyRow name="CBU" value={billing.cbu} mono />
            {billing.holder && <p className={text}>Titular: {billing.holder}{billing.cuit ? ` · CUIT ${billing.cuit}` : ''}</p>}
            {(billing.bank || billing.account) && (
              <p className={text}>
                {billing.bank}
                {billing.bank && billing.account ? ' · ' : ''}
                {billing.account ? `Cuenta ${billing.account}` : ''}
              </p>
            )}
            <button type="button" disabled={!!sending || sent === 'transferencia' || !(ars > 0)} onClick={() => notify('transferencia')} className={`${primary} w-full`}>
              {sending === 'transferencia' && <Loader2 className="w-4 h-4 animate-spin" />}
              {sent === 'transferencia' ? <><Check className="w-5 h-5" /> ¡Gracias! Te avisamos al confirmarlo</> : 'Ya transferí'}
            </button>
          </div>
        ) : (
          <p className={text}>Escribinos por WhatsApp y te pasamos los datos.</p>
        )}
      </div>

      {/* Payoneer */}
      {hasPayoneer && (
        <div className={card}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-lg font-bold text-stone-900 dark:text-white">Payoneer</span>
            <span className="text-xl font-bold text-stone-900 dark:text-white tabular-nums">{formatUsd(payoneer)}</span>
          </div>
          {billing.payoneerDiscount > 0 && (
            <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">Con {billing.payoneerDiscount}% de descuento.</p>
          )}
          <CopyRow name="Mail de Payoneer" value={billing.payoneerEmail} />
          <button type="button" disabled={!!sending || sent === 'payoneer'} onClick={() => notify('payoneer')} className={`${ghost} w-full`}>
            {sending === 'payoneer' && <Loader2 className="w-4 h-4 animate-spin" />}
            {sent === 'payoneer' ? <><Check className="w-5 h-5" /> ¡Gracias! Te avisamos al confirmarlo</> : 'Ya pagué por Payoneer'}
          </button>
        </div>
      )}

      </div>

      {error && <p className="text-base font-bold text-rose-700 dark:text-rose-300">{error}</p>}

      <a href={`https://api.whatsapp.com/send?phone=${SUPPORT_WA}&text=${waText}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-base font-bold text-stone-900 dark:text-white underline underline-offset-4">
        <MessageCircle className="w-5 h-5" /> ¿Dudas? Escribinos por WhatsApp
      </a>
    </div>
  );

  if (!onClose) return body;
  return (
    <div className="fixed inset-0 z-[300] bg-black/70 flex justify-center p-3 overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-lg my-auto rounded-3xl bg-stone-50 dark:bg-[#101114] p-5 sm:p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {body}
      </div>
    </div>
  );
};
