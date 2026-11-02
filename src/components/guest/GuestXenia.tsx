/**
 * Chat de Xenia para huéspedes, flotando en la guía (/guia/...) y en Tu Web (/web/...).
 * Solo aparece si el anfitrión la activó (xeniaGuest en lo publicado). Lo que no sabe, los pagos y los problemas
 * los pasa al anfitrión con un botón de WhatsApp con la consulta ya escrita.
 */
import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import {
  askGuestXenia,
  conversationId,
  guessLang,
  hostWhatsappLink,
  type GuestXeniaKind,
  type GuestXeniaLang,
} from '../../lib/guestXenia';

type Msg = { role: 'user' | 'assistant'; content: string; handoff?: string; system?: boolean };

const T: Record<
  GuestXeniaLang,
  {
    launcher: string;
    title: string;
    sub: (place: string) => string;
    hello: (place: string, web: boolean) => string;
    suggestions: (web: boolean) => string[];
    placeholder: string;
    send: string;
    close: string;
    write: () => string;
    waIntro: (place: string, web: boolean) => string;
    conv: () => string;
    busy: () => string;
    thinking: string;
    note: string;
    privacy: string;
  }
> = {
  es: {
    launcher: 'Preguntale a Xenia',
    title: 'Xenia',
    sub: (p) => `Asistente de ${p}`,
    hello: (p, web) =>
      web
        ? `¡Hola! Soy Xenia, la asistente de ${p}. Te ayudo con dudas sobre el lugar. Para ver precio y disponibilidad, elegí las fechas en el buscador de la página. Las reservas y los pagos los coordina el alojamiento.`
        : `¡Hola! Soy Xenia, la asistente de ${p}. Te ayudo con horarios, cómo llegar, normas y qué hacer cerca. Para pagos o cambios en tu reserva, te comunico con el alojamiento.`,
    suggestions: (web) => (web ? ['¿Cuántas personas entran?', '¿Cómo se reserva?', '¿Qué hay para hacer cerca?'] : ['¿A qué hora es el check-in?', '¿Cuál es la clave del wifi?', '¿Dónde puedo comer cerca?']),
    placeholder: 'Escribí tu pregunta',
    send: 'Enviar',
    close: 'Cerrar',
    write: () => 'Escribir al alojamiento por WhatsApp',
    waIntro: (p, web) => `Hola, te escribo desde ${web ? 'la web' : 'la guía'} de ${p}.`,
    conv: () => 'Para seguir con tu consulta, escribí directamente al alojamiento.',
    busy: () => 'Ahora no puedo responder. Escribí al alojamiento, que te contesta por WhatsApp.',
    thinking: 'Xenia está escribiendo…',
    note: 'Asistente automática: puede equivocarse.',
    privacy: 'Privacidad',
  },
  en: {
    launcher: 'Ask Xenia',
    title: 'Xenia',
    sub: (p) => `${p}'s assistant`,
    hello: (p, web) =>
      web
        ? `Hi! I'm Xenia, ${p}'s assistant. I can help with questions about the place. To see prices and availability, pick your dates in the search box on this page. Bookings and payments are handled by the property.`
        : `Hi! I'm Xenia, ${p}'s assistant. I can help with check-in times, directions, house rules and things to do nearby. For payments or changes to your booking, I'll put you in touch with the property.`,
    suggestions: (web) => (web ? ['How many guests fit?', 'How do I book?', 'What is there to do nearby?'] : ['What time is check-in?', "What's the wifi password?", 'Where can I eat nearby?']),
    placeholder: 'Type your question',
    send: 'Send',
    close: 'Close',
    write: () => 'Message the property on WhatsApp',
    waIntro: (p, web) => `Hi, I'm writing from ${p}'s ${web ? 'website' : 'guide'}.`,
    conv: () => 'To continue, please message the property directly.',
    busy: () => "I can't answer right now. Please message the property on WhatsApp.",
    thinking: 'Xenia is typing…',
    note: 'Automated assistant: it can make mistakes.',
    privacy: 'Privacy',
  },
  pt: {
    launcher: 'Pergunte à Xenia',
    title: 'Xenia',
    sub: (p) => `Assistente de ${p}`,
    hello: (p, web) =>
      web
        ? `Olá! Sou a Xenia, assistente de ${p}. Ajudo com dúvidas sobre o lugar. Para ver preço e disponibilidade, escolha as datas na busca desta página. Reservas e pagamentos são com a hospedagem.`
        : `Olá! Sou a Xenia, assistente de ${p}. Ajudo com horários, como chegar, regras da casa e o que fazer por perto. Para pagamentos ou mudanças na reserva, coloco você em contato com a hospedagem.`,
    suggestions: (web) => (web ? ['Quantas pessoas cabem?', 'Como faço a reserva?', 'O que fazer por perto?'] : ['Qual o horário do check-in?', 'Qual é a senha do wi-fi?', 'Onde comer por perto?']),
    placeholder: 'Escreva sua pergunta',
    send: 'Enviar',
    close: 'Fechar',
    write: () => 'Falar com a hospedagem no WhatsApp',
    waIntro: (p, web) => `Olá, escrevo pelo ${web ? 'site' : 'guia'} de ${p}.`,
    conv: () => 'Para continuar, fale diretamente com a hospedagem.',
    busy: () => 'Agora não consigo responder. Fale com a hospedagem pelo WhatsApp.',
    thinking: 'Xenia está digitando…',
    note: 'Assistente automática: pode errar.',
    privacy: 'Privacidade',
  },
};

export const GuestXenia: React.FC<{
  kind: GuestXeniaKind;
  /** uid (guía) o nombre del link (web) */
  id: string;
  unit?: string;
  placeName: string;
  /** WhatsApp del alojamiento, para pasarle las consultas. Nunca se muestra un nombre de persona. */
  hostPhone?: string;
}> = ({ kind, id, unit, placeName, hostPhone }) => {
  const web = kind === 'web';
  const [lang, setLang] = useState<GuestXeniaLang>(() => guessLang(kind));
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const t = T[lang];
  const place = (placeName || '').trim() || (lang === 'es' ? 'este alojamiento' : lang === 'pt' ? 'esta hospedagem' : 'this place');

  // En Tu Web, el selector de idioma cambia <html lang>: el chat lo sigue
  useEffect(() => {
    if (!web || typeof MutationObserver === 'undefined') return;
    const mo = new MutationObserver(() => setLang(guessLang(kind)));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    return () => mo.disconnect();
  }, [web, kind]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, busy, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (hidden) return null;

  const send = async (raw: string) => {
    const message = raw.trim().slice(0, 600);
    if (!message || busy) return;
    const history = msgs.filter((m) => !m.system).map((m) => ({ role: m.role, content: m.content }));
    setMsgs((prev) => [...prev, { role: 'user', content: message }]);
    setText('');
    setBusy(true);
    const r = await askGuestXenia({ kind, id, unit, conv: conversationId(kind, id), message, history });
    setBusy(false);
    if (r.off) {
      setHidden(true);
      return;
    }
    if (r.reply || r.handoff) {
      setMsgs((prev) => [...prev, { role: 'assistant', content: r.reply || t.busy(), handoff: r.handoff }]);
    } else {
      // Tope o error: se ofrece escribirle al anfitrión con la pregunta tal cual
      setMsgs((prev) => [...prev, { role: 'assistant', content: r.limit === 'conv' ? t.conv() : t.busy(), handoff: message, system: true }]);
    }
  };

  const side = web ? 'left-3 sm:left-6' : 'right-3 sm:right-6';
  // En Tu Web, en el celular, va arriba de la barra "Reservar"
  const bottom = web ? 'bottom-[calc(88px+env(safe-area-inset-bottom,0px))] sm:bottom-6' : 'bottom-[calc(16px+env(safe-area-inset-bottom,0px))] sm:bottom-6';

  return (
    <div className="font-sans" lang={lang}>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`fixed ${side} ${bottom} z-[900] flex items-center gap-2.5 rounded-full bg-[#14161B] text-white pl-1.5 pr-4 py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] border border-white/15 cursor-pointer hover:bg-[#1C1F26]`}
          aria-label={t.launcher}
        >
          <span className="relative">
            <img src="/xenia.jpg" alt="" className="w-11 h-11 rounded-full object-cover" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#14161B]" />
          </span>
          <span className="text-[15px] font-bold">{t.launcher}</span>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label={t.title}
          className={`fixed z-[900] inset-x-2 bottom-[calc(8px+env(safe-area-inset-bottom,0px))] h-[min(82vh,640px)] sm:inset-x-auto ${web ? 'sm:left-6' : 'sm:right-6'} sm:bottom-6 sm:w-[390px] sm:h-[min(80vh,600px)] flex flex-col rounded-3xl bg-[#14161B] text-white border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden`}
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
            <img src="/xenia.jpg" alt="" className="w-10 h-10 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold leading-tight">{t.title}</p>
              <p className="text-sm text-stone-200 truncate">{t.sub(place)}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 cursor-pointer"
              aria-label={t.close}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            <Bubble role="assistant">{t.hello(place, web)}</Bubble>
            {msgs.length === 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {t.suggestions(web).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="px-3.5 py-2 rounded-full border border-[#F5A35C]/60 text-[#FFD2A8] text-sm font-semibold hover:bg-white/5 cursor-pointer text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {msgs.map((m, i) => {
              const wa = m.handoff ? hostWhatsappLink(hostPhone || '', `${t.waIntro(place, web)} ${m.handoff}`) : '';
              return (
                <div key={i} className="space-y-2">
                  <Bubble role={m.role}>{m.content}</Bubble>
                  {wa && (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#25D366] text-[#08260F] text-sm font-bold hover:brightness-105"
                    >
                      <MessageCircle className="w-4 h-4" /> {t.write()}
                    </a>
                  )}
                </div>
              );
            })}
            {busy && <p className="text-sm text-stone-200 animate-pulse">{t.thinking}</p>}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(text);
            }}
            className="border-t border-white/10 px-3 pt-3 pb-2"
          >
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 600))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send(text);
                  }
                }}
                rows={1}
                placeholder={t.placeholder}
                className="flex-1 resize-none max-h-28 rounded-2xl bg-[#0B0D11] border border-white/15 px-4 py-3 text-base text-white placeholder:text-stone-300 focus:outline-none focus:border-[#F5A35C]"
              />
              <button
                type="submit"
                disabled={!text.trim() || busy}
                className="w-12 h-12 shrink-0 rounded-full bg-[#E67E22] text-[#111] flex items-center justify-center disabled:opacity-40 cursor-pointer"
                aria-label={t.send}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-2 text-xs text-stone-200 text-center">
              {t.note}{' '}
              <a href="https://loomisuite.net/privacidad" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                {t.privacy}
              </a>
            </p>
          </form>
        </div>
      )}
    </div>
  );
};

const Bubble: React.FC<{ role: 'user' | 'assistant'; children: React.ReactNode }> = ({ role, children }) => (
  <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
    <p
      className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
        role === 'user' ? 'bg-[#E67E22] text-[#111] rounded-br-md font-medium' : 'bg-[#262A33] text-white rounded-bl-md'
      }`}
    >
      {children}
    </p>
  </div>
);

export default GuestXenia;
