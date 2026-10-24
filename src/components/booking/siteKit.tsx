/**
 * Tu Web: textos, cálculos y piezas que comparten todos los diseños de la página pública
 * (los incluidos en PublicSiteView y los diseños especiales de designs/).
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Minus, Plus, X } from 'lucide-react';
import type { CurrencyCode, Property } from '../../types';
import { quoteStay } from '../../lib/pricing';
import { isUnitFree, PublicSiteDoc, PublicSitePhoto, PublicSiteUnit } from '../../lib/publicSite';

export type Lang = 'es' | 'en' | 'pt';

export const T = {
  es: {
    arrive: 'Llegada',
    leave: 'Salida',
    guests: 'Personas',
    search: 'Ver disponibilidad',
    stays: 'Alojamientos',
    upTo: (n: number) => `Hasta ${n} ${n === 1 ? 'persona' : 'personas'}`,
    bedrooms: (n: number) => `${n} ${n === 1 ? 'dormitorio' : 'dormitorios'}`,
    pickDates: 'Elegí las fechas para ver precio y disponibilidad.',
    chooseDates: 'Elegir fechas',
    available: 'Disponibles',
    noneTitle: 'Sin lugar en esas fechas',
    nights: (n: number) => `${n} ${n === 1 ? 'noche' : 'noches'}`,
    total: 'Total',
    ask: 'Pedir por WhatsApp',
    askGeneral: 'Consultar por WhatsApp',
    askPrice: 'Precio a consultar',
    minNights: (n: number) => `En estas fechas la estadía mínima es de ${n} noches.`,
    none: 'Probá con otras fechas o escribinos: a veces se libera algo.',
    confirmNote: 'El anfitrión confirma la disponibilidad y el precio final por WhatsApp.',
    checkin: 'Ingreso desde',
    checkout: 'Salida hasta',
    map: 'Ver en el mapa',
    contact: '¿Tenés alguna pregunta?',
    direct: 'Reserva directa con el anfitrión',
    madeWith: 'Página hecha con Loomi Suite',
    badDates: 'La salida tiene que ser después de la llegada.',
    pastDate: 'La llegada no puede ser antes de hoy.',
    gallery: 'Fotos',
    close: 'Cerrar',
    unavailable: 'Esta página no está disponible por ahora.',
    msgHello: (name: string) => `Hola! Quisiera reservar en ${name}:`,
    msgDates: (a: string, b: string, n: string) => `• Llegada: ${a} — Salida: ${b} (${n})`,
    msgGuests: (n: number) => `• ${n} ${n === 1 ? 'persona' : 'personas'}`,
    msgPrice: (p: string) => `• Precio que vi en la web: ${p}`,
    msgQuestion: '¿Está disponible?',
    msgGeneral: (name: string) => `Hola! Les escribo desde la web de ${name}.`,
    book: 'Reservar',
    directShort: 'Reserva directa',
    where: 'Dónde estamos',
    hours: 'Horarios',
    place: 'El lugar',
    address: 'Dirección',
    contactTitle: 'Contacto',
    statUnits: (n: number): string => (n === 1 ? 'alojamiento' : 'alojamientos'),
    statGuests: 'personas como máximo',
    statIn: 'hora de ingreso',
    statOut: 'hora de salida',
  },
  en: {
    arrive: 'Check-in',
    leave: 'Check-out',
    guests: 'Guests',
    search: 'Check availability',
    stays: 'Accommodation',
    upTo: (n: number) => `Up to ${n} ${n === 1 ? 'guest' : 'guests'}`,
    bedrooms: (n: number) => `${n} ${n === 1 ? 'bedroom' : 'bedrooms'}`,
    pickDates: 'Choose your dates to see price and availability.',
    chooseDates: 'Choose dates',
    available: 'Available',
    noneTitle: 'No availability',
    nights: (n: number) => `${n} ${n === 1 ? 'night' : 'nights'}`,
    total: 'Total',
    ask: 'Request on WhatsApp',
    askGeneral: 'Ask on WhatsApp',
    askPrice: 'Price on request',
    minNights: (n: number) => `Minimum stay for these dates is ${n} nights.`,
    none: 'Try other dates or write to us: something may open up.',
    confirmNote: 'The host confirms availability and the final price on WhatsApp.',
    checkin: 'Check-in from',
    checkout: 'Check-out until',
    map: 'See on the map',
    contact: 'Any questions?',
    direct: 'Book directly with the host',
    madeWith: 'Page made with Loomi Suite',
    badDates: 'Check-out must be after check-in.',
    pastDate: 'Check-in can’t be in the past.',
    gallery: 'Photos',
    close: 'Close',
    unavailable: 'This page is not available right now.',
    msgHello: (name: string) => `Hi! I’d like to book at ${name}:`,
    msgDates: (a: string, b: string, n: string) => `• Check-in: ${a} — Check-out: ${b} (${n})`,
    msgGuests: (n: number) => `• ${n} ${n === 1 ? 'guest' : 'guests'}`,
    msgPrice: (p: string) => `• Price I saw on the website: ${p}`,
    msgQuestion: 'Is it available?',
    msgGeneral: (name: string) => `Hi! I’m writing from the ${name} website.`,
    book: 'Book',
    directShort: 'Book direct',
    where: 'Where we are',
    hours: 'Hours',
    place: 'The place',
    address: 'Address',
    contactTitle: 'Contact',
    statUnits: (n: number): string => (n === 1 ? 'place to stay' : 'places to stay'),
    statGuests: 'guests at most',
    statIn: 'check-in time',
    statOut: 'check-out time',
  },
  pt: {
    arrive: 'Chegada',
    leave: 'Saída',
    guests: 'Pessoas',
    search: 'Ver disponibilidade',
    stays: 'Acomodações',
    upTo: (n: number) => `Até ${n} ${n === 1 ? 'pessoa' : 'pessoas'}`,
    bedrooms: (n: number) => `${n} ${n === 1 ? 'quarto' : 'quartos'}`,
    pickDates: 'Escolha as datas para ver preço e disponibilidade.',
    chooseDates: 'Escolher datas',
    available: 'Disponíveis',
    noneTitle: 'Sem disponibilidade',
    nights: (n: number) => `${n} ${n === 1 ? 'noite' : 'noites'}`,
    total: 'Total',
    ask: 'Pedir pelo WhatsApp',
    askGeneral: 'Perguntar pelo WhatsApp',
    askPrice: 'Preço sob consulta',
    minNights: (n: number) => `Nestas datas a estadia mínima é de ${n} noites.`,
    none: 'Tente outras datas ou fale com a gente: às vezes algo se libera.',
    confirmNote: 'O anfitrião confirma a disponibilidade e o preço final pelo WhatsApp.',
    checkin: 'Entrada a partir das',
    checkout: 'Saída até',
    map: 'Ver no mapa',
    contact: 'Alguma dúvida?',
    direct: 'Reserva direta com o anfitrião',
    madeWith: 'Página feita com Loomi Suite',
    badDates: 'A saída tem que ser depois da chegada.',
    pastDate: 'A chegada não pode ser antes de hoje.',
    gallery: 'Fotos',
    close: 'Fechar',
    unavailable: 'Esta página não está disponível no momento.',
    msgHello: (name: string) => `Olá! Gostaria de reservar em ${name}:`,
    msgDates: (a: string, b: string, n: string) => `• Chegada: ${a} — Saída: ${b} (${n})`,
    msgGuests: (n: number) => `• ${n} ${n === 1 ? 'pessoa' : 'pessoas'}`,
    msgPrice: (p: string) => `• Preço que vi no site: ${p}`,
    msgQuestion: 'Está disponível?',
    msgGeneral: (name: string) => `Olá! Escrevo pelo site de ${name}.`,
    book: 'Reservar',
    directShort: 'Reserva direta',
    where: 'Onde estamos',
    hours: 'Horários',
    place: 'O lugar',
    address: 'Endereço',
    contactTitle: 'Contato',
    statUnits: (n: number): string => (n === 1 ? 'acomodação' : 'acomodações'),
    statGuests: 'pessoas no máximo',
    statIn: 'horário de entrada',
    statOut: 'horário de saída',
  },
};

export const LOCALE: Record<Lang, string> = { es: 'es-AR', en: 'en-US', pt: 'pt-BR' };
export const SYMBOL: Record<CurrencyCode, string> = { ARS: '$', USD: 'US$', BRL: 'R$', EUR: '€' };

export function detectLang(): Lang {
  try {
    const l = (navigator.language || 'es').toLowerCase();
    if (l.startsWith('pt')) return 'pt';
    if (l.startsWith('es')) return 'es';
    return 'en';
  } catch {
    return 'es';
  }
}

export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function plusDays(date: string, n: number): string {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function nightsBetween(a: string, b: string): number {
  return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000);
}

export function fmtDate(date: string, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALE[lang], { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(
    new Date(date + 'T00:00:00Z')
  );
}

export function fmtMoney(amount: number, currency: CurrencyCode): string {
  return `${SYMBOL[currency] || '$'} ${Math.round(amount || 0).toLocaleString('es-AR')}`;
}

export function waLink(phone: string, text: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export const Lightbox: React.FC<{ list: PublicSitePhoto[]; index: number; onClose: () => void; closeLabel: string }> = ({
  list,
  index,
  onClose,
  closeLabel,
}) => {
  const [i, setI] = useState(index);
  const go = (d: number) => setI((x) => (x + d + list.length) % list.length);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  const photo = list[i];
  if (!photo) return null;
  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-3" onClick={onClose}>
      <img src={photo.data} alt="" className="max-w-full max-h-[88vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/15 text-white flex items-center justify-center cursor-pointer"
      >
        <X className="w-6 h-6" />
      </button>
      {list.length > 1 && (
        <>
          <button
            type="button"
            aria-label="‹"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 text-white flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <button
            type="button"
            aria-label="›"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 text-white flex items-center justify-center cursor-pointer"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </>
      )}
    </div>
  );
};

export type SiteTexts = (typeof T)['es'];

/** Carga una tipografía de Google Fonts una sola vez (si no carga, queda la de respaldo) */
export function useGoogleFont(id: string, href: string) {
  useEffect(() => {
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }, [id, href]);
}

/** Todo lo que necesita cualquier diseño: idioma, buscador, resultados, pedido por WhatsApp y fotos */
export function useSiteBooking(site: PublicSiteDoc, photos: PublicSitePhoto[], preview?: boolean) {
  const [lang, setLang] = useState<Lang>(detectLang);
  const t = T[lang];
  const today = todayStr();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [searched, setSearched] = useState<{ in: string; out: string; guests: number } | null>(null);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState<{ list: PublicSitePhoto[]; index: number } | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const general = photos.filter((p) => !p.unitId);
  const cover = general[0] || photos[0];
  const unitPhotos = (id: string) => photos.filter((p) => p.unitId === id);
  const maxCapacity = Math.max(1, ...site.units.map((u) => u.maxGuests || 1));

  useEffect(() => {
    if (preview) return;
    if (site.name) document.title = site.name;
    document.documentElement.lang = lang;
  }, [site.name, lang, preview]);

  const results = useMemo(() => {
    if (!searched) return null;
    const n = nightsBetween(searched.in, searched.out);
    const free: Array<{ unit: PublicSiteUnit; total: number; minNights: number; below: boolean }> = [];
    for (const u of site.units) {
      if (!isUnitFree(site.busy?.[u.id], searched.in, searched.out)) continue;
      if (u.maxGuests && u.maxGuests < searched.guests) continue;
      const q = quoteStay(site.pricing, { id: u.id, basePrice: u.basePrice } as Property, searched.in, searched.out);
      free.push({ unit: u, total: q.total, minNights: q.minNights, below: q.belowMinimum });
    }
    free.sort((a, b) => Number(a.below) - Number(b.below));
    return { n, free };
  }, [searched, site]);

  const doSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!checkIn || !checkOut) return setError(t.pickDates);
    if (checkIn < today) return setError(t.pastDate);
    if (checkOut <= checkIn) return setError(t.badDates);
    setError('');
    setSearched({ in: checkIn, out: checkOut, guests });
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const pickCheckIn = (v: string) => {
    setCheckIn(v);
    if (v && (!checkOut || checkOut <= v)) setCheckOut(plusDays(v, 2));
  };

  const requestText = (unit: PublicSiteUnit, total: number) => {
    if (!searched) return '';
    const lines = [
      t.msgHello(site.name || ''),
      `• ${unit.name}`,
      t.msgDates(fmtDate(searched.in, lang), fmtDate(searched.out, lang), t.nights(nightsBetween(searched.in, searched.out))),
      t.msgGuests(searched.guests),
    ];
    if (total > 0) lines.push(t.msgPrice(fmtMoney(total, site.currency)));
    lines.push('', t.msgQuestion);
    return lines.join('\n');
  };

  const goSearch = () => searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const generalLink = site.whatsapp ? waLink(site.whatsapp, t.msgGeneral(site.name)) : '';

  return {
    lang, setLang, t, today,
    checkIn, pickCheckIn, checkOut, setCheckOut, guests, setGuests, maxCapacity,
    searched, error, results, doSearch, requestText, goSearch, generalLink,
    general, cover, unitPhotos,
    lightbox, setLightbox, searchRef, resultsRef,
  };
}

export type SiteBooking = ReturnType<typeof useSiteBooking>;

/** Selector de idioma (las clases cambian según el diseño) */
export const LangSwitch: React.FC<{ b: SiteBooking; className?: string; activeCls?: string; idleCls?: string }> = ({
  b,
  className = 'flex gap-1 rounded-full bg-black/45 backdrop-blur p-1',
  activeCls = 'bg-white text-stone-900',
  idleCls = 'text-white',
}) => (
  <div className={className}>
    {(['es', 'en', 'pt'] as Lang[]).map((l) => (
      <button
        key={l}
        type="button"
        onClick={() => b.setLang(l)}
        aria-pressed={b.lang === l}
        className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase cursor-pointer ${b.lang === l ? activeCls : idleCls}`}
      >
        {l}
      </button>
    ))}
  </div>
);

/** Buscador de fechas y personas; cada diseño le pasa sus clases */
export const SearchForm: React.FC<{
  b: SiteBooking;
  colorScheme: 'light' | 'dark';
  formCls: string;
  labelCls: string;
  fieldCls: string;
  stepBtnCls: string;
  submitCls: string;
  errorCls: string;
}> = ({ b, colorScheme, formCls, labelCls, fieldCls, stepBtnCls, submitCls, errorCls }) => {
  const { t } = b;
  return (
    <form onSubmit={b.doSearch} className={formCls}>
      <label className="flex flex-col gap-1.5 min-w-0">
        <span className={labelCls}>{t.arrive}</span>
        <input
          type="date"
          value={b.checkIn}
          min={b.today}
          onChange={(e) => b.pickCheckIn(e.target.value)}
          className={`w-full min-h-[48px] px-3 text-base font-semibold ${fieldCls}`}
          style={{ colorScheme }}
        />
      </label>
      <label className="flex flex-col gap-1.5 min-w-0">
        <span className={labelCls}>{t.leave}</span>
        <input
          type="date"
          value={b.checkOut}
          min={b.checkIn ? plusDays(b.checkIn, 1) : plusDays(b.today, 1)}
          onChange={(e) => b.setCheckOut(e.target.value)}
          className={`w-full min-h-[48px] px-3 text-base font-semibold ${fieldCls}`}
          style={{ colorScheme }}
        />
      </label>
      <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
        <span className={labelCls}>{t.guests}</span>
        <div className={`flex items-center justify-between gap-2 min-h-[48px] px-1.5 ${fieldCls}`}>
          <button type="button" aria-label="-" onClick={() => b.setGuests((g) => Math.max(1, g - 1))} className={stepBtnCls}>
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-base font-bold tabular-nums w-6 text-center">{b.guests}</span>
          <button type="button" aria-label="+" onClick={() => b.setGuests((g) => Math.min(b.maxCapacity, g + 1))} className={stepBtnCls}>
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      <button type="submit" className={`${submitCls} col-span-2 sm:col-span-1`}>
        {t.search}
      </button>
      {b.error && <p className={`col-span-2 sm:col-span-4 ${errorCls}`}>{b.error}</p>}
    </form>
  );
};

export interface SiteViewProps {
  site: PublicSiteDoc;
  photos: PublicSitePhoto[];
  /** Vista previa dentro de la app: muestra la página aunque esté desactivada */
  preview?: boolean;
}

/**
 * Barra "Reservar" que acompaña al bajar (abajo de todo, siempre a mano en el celular) y lleva al buscador.
 * Se esconde mientras el buscador está a la vista. Es sticky, no fixed: dentro de la vista previa de la app no se escapa.
 */
export const BookBar: React.FC<{ b: SiteBooking; className: string; label?: string }> = ({ b, className, label }) => {
  const [searchVisible, setSearchVisible] = useState(true);
  useEffect(() => {
    const el = b.searchRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setSearchVisible(entry.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [b.searchRef]);
  // En la compu, la portada ya tiene su botón: la barra aparece al bajar
  const [pastHero, setPastHero] = useState(false);
  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.6 || window.innerWidth < 640);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  const hidden = searchVisible || !!b.lightbox || !pastHero;
  return (
    <div className={`sticky bottom-0 z-40 pointer-events-none transition-all duration-300 ${hidden ? 'opacity-0 invisible' : 'opacity-100 visible'}`} aria-hidden={hidden}>
      <div className="flex justify-center sm:justify-end px-0 sm:px-6 pb-0 sm:pb-6 pb-[env(safe-area-inset-bottom,0px)]">
        <button type="button" tabIndex={hidden ? -1 : 0} onClick={b.goSearch} className={`pointer-events-auto cursor-pointer ${className}`}>
          {label || (b.results ? b.t.chooseDates : b.t.book)}
        </button>
      </div>
    </div>
  );
};
