import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, ClipboardCheck, Loader2 } from 'lucide-react';
import { PreCheckin, submitPreCheckin } from '../../lib/precheckin';

type Lang = 'es' | 'en' | 'pt';

const T: Record<Lang, Record<string, string>> = {
  es: {
    title: 'Pre check-in online',
    intro: 'Completalo antes de llegar (1 minuto). Al llegar solo vas a mostrar tu documento y te entregamos las llaves.',
    start: 'Completar pre check-in',
    fullName: 'Nombre y apellido',
    docType: 'Tipo de documento',
    dni: 'DNI',
    pasaporte: 'Pasaporte',
    otro: 'Otro',
    docNumber: 'Número de documento',
    nationality: 'Nacionalidad',
    guests: 'Cantidad de personas (incluyéndote)',
    arrival: 'Hora estimada de llegada',
    arrivalPh: 'Ej: 15:30',
    phone: 'WhatsApp / teléfono',
    companions: 'Nombres de quienes te acompañan (opcional)',
    comments: 'Comentarios para tu anfitrión (opcional)',
    rules: 'Leí y acepto las normas de la casa',
    privacy: 'Tus datos los recibe el alojamiento para registrar tu ingreso y se guardan en Loomi Suite, el sistema que usa. No se usan para otros fines ni se comparten con terceros. Podés pedir verlos, corregirlos o borrarlos al alojamiento o a contacto@loomisuite.net.',
    privacyLink: 'Política de privacidad',
    seeRules: 'Ver normas',
    send: 'Enviar pre check-in',
    sending: 'Enviando…',
    done: '¡Listo! Recibimos tu pre check-in.',
    doneSub: 'Al llegar solo mostrás tu documento. ¡Te esperamos!',
    required: 'Completá nombre, documento, nacionalidad y aceptá las normas.',
    error: 'No se pudo enviar. Si ya lo enviaste antes no hace falta repetirlo; si no, avisale a tu anfitrión por WhatsApp.',
  },
  en: {
    title: 'Online pre check-in',
    intro: 'Fill it in before you arrive (1 minute). On arrival you will only show your ID and get your keys.',
    start: 'Start pre check-in',
    fullName: 'Full name',
    docType: 'ID type',
    dni: 'National ID',
    pasaporte: 'Passport',
    otro: 'Other',
    docNumber: 'ID / passport number',
    nationality: 'Nationality',
    guests: 'Number of guests (including you)',
    arrival: 'Estimated arrival time',
    arrivalPh: 'e.g. 3:30 pm',
    phone: 'WhatsApp / phone',
    companions: 'Names of other guests (optional)',
    comments: 'Comments for your host (optional)',
    rules: 'I have read and accept the house rules',
    privacy: 'Your details go to the property to register your check-in and are stored in Loomi Suite, the system it uses. They are not used for anything else or shared with third parties. You can ask the property or contacto@loomisuite.net to see, correct or delete them.',
    privacyLink: 'Privacy policy (Spanish)',
    seeRules: 'See rules',
    send: 'Send pre check-in',
    sending: 'Sending…',
    done: 'Done! We received your pre check-in.',
    doneSub: 'On arrival just show your ID. See you soon!',
    required: 'Please fill in name, ID, nationality and accept the house rules.',
    error: 'It could not be sent. If you already sent it, there is no need to repeat it; otherwise please message your host on WhatsApp.',
  },
  pt: {
    title: 'Pré check-in online',
    intro: 'Preencha antes de chegar (1 minuto). Ao chegar, você só mostra seu documento e recebe as chaves.',
    start: 'Fazer pré check-in',
    fullName: 'Nome completo',
    docType: 'Tipo de documento',
    dni: 'RG / documento',
    pasaporte: 'Passaporte',
    otro: 'Outro',
    docNumber: 'Número do documento',
    nationality: 'Nacionalidade',
    guests: 'Número de pessoas (incluindo você)',
    arrival: 'Horário estimado de chegada',
    arrivalPh: 'Ex: 15:30',
    phone: 'WhatsApp / telefone',
    companions: 'Nomes dos acompanhantes (opcional)',
    comments: 'Comentários para o anfitrião (opcional)',
    rules: 'Li e aceito as regras da casa',
    privacy: 'Seus dados vão para a hospedagem para registrar sua entrada e ficam guardados no Loomi Suite, o sistema que ela usa. Não são usados para outros fins nem compartilhados com terceiros. Você pode pedir para vê-los, corrigi-los ou apagá-los à hospedagem ou a contacto@loomisuite.net.',
    privacyLink: 'Política de privacidade (em espanhol)',
    seeRules: 'Ver regras',
    send: 'Enviar pré check-in',
    sending: 'Enviando…',
    done: 'Pronto! Recebemos seu pré check-in.',
    doneSub: 'Ao chegar, é só mostrar seu documento. Até logo!',
    required: 'Preencha nome, documento, nacionalidade e aceite as regras.',
    error: 'Não foi possível enviar. Se já enviou antes, não precisa repetir; caso contrário, avise seu anfitrião pelo WhatsApp.',
  },
};

const detectLang = (): Lang => {
  const fromUrl = new URLSearchParams(window.location.search).get('lang');
  if (fromUrl === 'en' || fromUrl === 'pt' || fromUrl === 'es') return fromUrl;
  const nav = (navigator.language || 'es').toLowerCase();
  if (nav.startsWith('pt')) return 'pt';
  if (nav.startsWith('es')) return 'es';
  return 'en';
};

interface PreCheckinCardProps {
  hostUid: string;
  reservationId: string;
  defaultName?: string;
  rules?: { title: string; description: string }[];
}

export const PreCheckinCard: React.FC<PreCheckinCardProps> = ({ hostUid, reservationId, defaultName, rules = [] }) => {
  const storageKey = `loomi_precheckin_${hostUid}_${reservationId}`;
  const [lang, setLang] = useState<Lang>(detectLang);
  const t = T[lang];
  const [done, setDone] = useState<boolean>(() => {
    try {
      return localStorage.getItem(storageKey) === '1';
    } catch {
      return false;
    }
  });
  const [open, setOpen] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: defaultName || '',
    docType: 'pasaporte' as PreCheckin['docType'],
    docNumber: '',
    nationality: '',
    guests: '1',
    arrivalTime: '',
    phone: '',
    companions: '',
    comments: '',
    acceptedRules: false,
  });

  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.fullName.trim().length < 2 || form.docNumber.trim().length < 3 || !form.nationality.trim() || !form.acceptedRules) {
      setError(t.required);
      return;
    }
    setSending(true);
    try {
      await submitPreCheckin(hostUid, {
        reservationId,
        fullName: form.fullName.trim().slice(0, 119),
        docType: form.docType,
        docNumber: form.docNumber.trim().slice(0, 39),
        nationality: form.nationality.trim().slice(0, 59),
        guests: Math.min(30, Math.max(1, parseInt(form.guests, 10) || 1)),
        arrivalTime: form.arrivalTime.trim().slice(0, 39),
        phone: form.phone.trim().slice(0, 39),
        companions: form.companions.trim().slice(0, 599),
        comments: form.comments.trim().slice(0, 999),
        acceptedRules: true,
        lang,
      });
      try {
        localStorage.setItem(storageKey, '1');
      } catch {}
      setDone(true);
    } catch (err) {
      console.warn('Pre check-in no enviado:', err);
      setError(t.error);
    } finally {
      setSending(false);
    }
  };

  const input =
    'w-full text-base font-semibold px-3 py-2.5 rounded-xl border border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-stone-900 dark:text-white placeholder:text-stone-500 dark:placeholder:text-zinc-400 focus:outline-none focus:border-[#E67E22]';
  const label = 'block text-sm font-bold text-stone-900 dark:text-white mb-1';

  return (
    <div id="pre-checkin" className="max-w-4xl mx-auto mb-4 bg-white dark:bg-[#18191E] rounded-2xl border-2 border-[#E67E22]/60 p-4 sm:p-5 font-sans">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {done ? (
            <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <ClipboardCheck className="w-7 h-7 text-[#E67E22] shrink-0" />
          )}
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-white">{done ? t.done : t.title}</h2>
            <p className="text-sm font-medium text-stone-800 dark:text-stone-200 mt-0.5">{done ? t.doneSub : t.intro}</p>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          {(['es', 'en', 'pt'] as Lang[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={`px-2 py-1 rounded-lg text-xs font-bold uppercase cursor-pointer ${
                lang === l ? 'bg-[#E67E22] text-white' : 'text-stone-900 dark:text-white border border-stone-300 dark:border-zinc-600'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {!done && !open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 w-full sm:w-auto px-5 py-3 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-white font-bold text-base cursor-pointer"
        >
          {t.start}
        </button>
      )}

      {!done && open && (
        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className={label} htmlFor="pc-name">{t.fullName} *</label>
            <input id="pc-name" className={input} value={form.fullName} onChange={(e) => set('fullName', e.target.value)} autoComplete="name" />
          </div>
          <div>
            <label className={label} htmlFor="pc-doctype">{t.docType}</label>
            <select id="pc-doctype" className={input} value={form.docType} onChange={(e) => set('docType', e.target.value)}>
              <option value="pasaporte">{t.pasaporte}</option>
              <option value="dni">{t.dni}</option>
              <option value="otro">{t.otro}</option>
            </select>
          </div>
          <div>
            <label className={label} htmlFor="pc-doc">{t.docNumber} *</label>
            <input id="pc-doc" className={input} value={form.docNumber} onChange={(e) => set('docNumber', e.target.value)} />
          </div>
          <div>
            <label className={label} htmlFor="pc-nat">{t.nationality} *</label>
            <input id="pc-nat" className={input} value={form.nationality} onChange={(e) => set('nationality', e.target.value)} />
          </div>
          <div>
            <label className={label} htmlFor="pc-guests">{t.guests}</label>
            <input id="pc-guests" type="number" min={1} max={30} className={input} value={form.guests} onChange={(e) => set('guests', e.target.value)} />
          </div>
          <div>
            <label className={label} htmlFor="pc-arrival">{t.arrival}</label>
            <input id="pc-arrival" className={input} placeholder={t.arrivalPh} value={form.arrivalTime} onChange={(e) => set('arrivalTime', e.target.value)} />
          </div>
          <div>
            <label className={label} htmlFor="pc-phone">{t.phone}</label>
            <input id="pc-phone" type="tel" className={input} value={form.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" />
          </div>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="pc-comp">{t.companions}</label>
            <textarea id="pc-comp" rows={2} className={input} value={form.companions} onChange={(e) => set('companions', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="pc-comments">{t.comments}</label>
            <textarea id="pc-comments" rows={2} className={input} value={form.comments} onChange={(e) => set('comments', e.target.value)} />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <label className="flex items-start gap-2.5 text-base font-bold text-stone-900 dark:text-white cursor-pointer">
              <input
                type="checkbox"
                checked={form.acceptedRules}
                onChange={(e) => set('acceptedRules', e.target.checked)}
                className="w-5 h-5 mt-0.5 accent-[#E67E22] cursor-pointer"
              />
              {t.rules} *
            </label>
            {rules.length > 0 && (
              <button type="button" onClick={() => setShowRules((v) => !v)} className="text-sm font-bold text-[#E67E22] flex items-center gap-1 cursor-pointer">
                {showRules ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />} {t.seeRules}
              </button>
            )}
            {showRules && (
              <ul className="space-y-1.5 text-sm text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-zinc-900 rounded-xl p-3">
                {rules.map((r, i) => (
                  <li key={i}>
                    <strong>{r.title}</strong>
                    {r.description ? ` — ${r.description}` : ''}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="sm:col-span-2 text-sm leading-relaxed text-stone-800 dark:text-stone-200">
            {t.privacy}{' '}
            <a href="https://loomisuite.net/privacidad" target="_blank" rel="noreferrer" className="font-bold text-[#B5520B] dark:text-[#F5A35C] underline underline-offset-2">
              {t.privacyLink}
            </a>
          </p>
          {error && <p className="sm:col-span-2 text-sm font-bold text-rose-700 dark:text-rose-300">{error}</p>}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={sending}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#E67E22] hover:bg-[#D35400] disabled:opacity-60 text-white font-bold text-base cursor-pointer flex items-center justify-center gap-2"
            >
              {sending && <Loader2 className="w-4 h-4 animate-spin" />}
              {sending ? t.sending : t.send}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
