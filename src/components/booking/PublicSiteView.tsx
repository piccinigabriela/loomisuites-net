/**
 * Tu Web: la página pública que ve el huésped (sin Firebase: recibe los datos ya cargados).
 * La usan la página real (PublicSitePage), la vista previa de la app y la demo.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Minus, Plus, Users, X, BedDouble, Clock } from 'lucide-react';
import type { CurrencyCode, Property } from '../../types';
import { quoteStay } from '../../lib/pricing';
import { isUnitFree, PublicSiteDoc, PublicSitePhoto, PublicSiteUnit } from '../../lib/publicSite';

type Lang = 'es' | 'en' | 'pt';

const T = {
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
    occupied: 'Ocupados en esas fechas',
    tooSmall: 'Para menos personas',
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
    occupied: 'Booked on those dates',
    tooSmall: 'For fewer guests',
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
    occupied: 'Ocupadas nessas datas',
    tooSmall: 'Para menos pessoas',
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
  },
};

const LOCALE: Record<Lang, string> = { es: 'es-AR', en: 'en-US', pt: 'pt-BR' };
const SYMBOL: Record<CurrencyCode, string> = { ARS: '$', USD: 'US$', BRL: 'R$', EUR: '€' };

const THEMES = {
  noche: {
    '--bg': '#12100E',
    '--surface': '#1C1916',
    '--surface-2': '#26221E',
    '--line': '#3A342D',
    '--fg': '#F5F0E8',
    '--fg-2': '#DDD5C8',
    '--accent': '#E8913A',
    '--accent-ink': '#1A1007',
    colorScheme: 'dark',
  },
  dia: {
    '--bg': '#F7F3EC',
    '--surface': '#FFFFFF',
    '--surface-2': '#EFE8DD',
    '--line': '#DCD3C5',
    '--fg': '#1C1A17',
    '--fg-2': '#3B362F',
    '--accent': '#A64B0C',
    '--accent-ink': '#FFFFFF',
    colorScheme: 'light',
  },
} as const;

function detectLang(): Lang {
  try {
    const l = (navigator.language || 'es').toLowerCase();
    if (l.startsWith('pt')) return 'pt';
    if (l.startsWith('es')) return 'es';
    return 'en';
  } catch {
    return 'es';
  }
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function plusDays(date: string, n: number): string {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function nightsBetween(a: string, b: string): number {
  return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000);
}

function fmtDate(date: string, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALE[lang], { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(
    new Date(date + 'T00:00:00Z')
  );
}

function fmtMoney(amount: number, currency: CurrencyCode): string {
  return `${SYMBOL[currency] || '$'} ${Math.round(amount || 0).toLocaleString('es-AR')}`;
}

function waLink(phone: string, text: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

interface Props {
  site: PublicSiteDoc;
  photos: PublicSitePhoto[];
  /** Vista previa dentro de la app: muestra la página aunque esté desactivada */
  preview?: boolean;
}

export const PublicSiteView: React.FC<Props> = ({ site, photos, preview }) => {
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

  const theme = THEMES[site.theme === 'dia' ? 'dia' : 'noche'];
  const general = photos.filter((p) => !p.unitId);
  const cover = general[0] || photos[0];
  const unitPhotos = (id: string) => photos.filter((p) => p.unitId === id);
  const maxCapacity = Math.max(1, ...site.units.map((u) => u.maxGuests || 1));
  const whatsapp = site.whatsapp;

  useEffect(() => {
    if (preview) return;
    if (site.name) document.title = site.name;
    document.documentElement.lang = lang;
  }, [site.name, lang, preview]);

  useEffect(() => {
    // Tipografía de los títulos (si no carga, queda Georgia)
    if (document.getElementById('loomi-site-font')) return;
    const link = document.createElement('link');
    link.id = 'loomi-site-font';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap';
    document.head.appendChild(link);
  }, []);

  const results = useMemo(() => {
    if (!searched) return null;
    const n = nightsBetween(searched.in, searched.out);
    const free: Array<{ unit: PublicSiteUnit; total: number; minNights: number; below: boolean }> = [];
    const busy: PublicSiteUnit[] = [];
    const small: PublicSiteUnit[] = [];
    for (const u of site.units) {
      if (!isUnitFree(site.busy?.[u.id], searched.in, searched.out)) {
        busy.push(u);
        continue;
      }
      if (u.maxGuests && u.maxGuests < searched.guests) {
        small.push(u);
        continue;
      }
      const q = quoteStay(site.pricing, { id: u.id, basePrice: u.basePrice } as Property, searched.in, searched.out);
      free.push({ unit: u, total: q.total, minNights: q.minNights, below: q.belowMinimum });
    }
    free.sort((a, b) => Number(a.below) - Number(b.below));
    return { n, free, busy, small };
  }, [searched, site]);

  const doSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!checkIn || !checkOut) {
      setError(t.pickDates);
      return;
    }
    if (checkIn < today) {
      setError(t.pastDate);
      return;
    }
    if (checkOut <= checkIn) {
      setError(t.badDates);
      return;
    }
    setError('');
    setSearched({ in: checkIn, out: checkOut, guests });
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
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

  const goSearch = () => {
    searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (!site.enabled && !preview) {
    return (
      <div style={theme as React.CSSProperties} className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex items-center justify-center p-6 text-center">
        <p className="text-lg font-medium">{t.unavailable}</p>
      </div>
    );
  }

  const headingFont = { fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif" };
  const btnPrimary =
    'inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] font-bold text-base hover:brightness-110 transition cursor-pointer';
  const btnGhost =
    'inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-full border border-[var(--line)] text-[var(--fg)] font-semibold text-sm hover:bg-[var(--surface-2)] transition cursor-pointer';

  return (
    <div style={theme as React.CSSProperties} className="relative min-h-screen bg-[var(--bg)] text-[var(--fg)] font-sans antialiased">
      {/* Idioma */}
      <div className="absolute top-3 right-3 z-20 flex gap-1 rounded-full bg-black/45 backdrop-blur p-1">
        {(['es', 'en', 'pt'] as Lang[]).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            aria-pressed={lang === l}
            className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase cursor-pointer ${
              lang === l ? 'bg-white text-stone-900' : 'text-white'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Portada */}
      <header className="relative min-h-[58vh] sm:min-h-[64vh] flex items-end overflow-hidden">
        {cover ? (
          <img src={cover.data} alt={site.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[var(--surface-2)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
        <div className="relative w-full max-w-5xl mx-auto px-5 sm:px-8 pb-24 sm:pb-28 pt-20 text-white">
          {site.city && (
            <p className="flex items-center gap-1.5 text-sm font-semibold tracking-wide mb-3">
              <MapPin className="w-4 h-4" /> {site.city}
            </p>
          )}
          <h1 style={headingFont} className="text-4xl sm:text-6xl font-semibold leading-[1.05] text-balance">
            {site.name}
          </h1>
          {site.tagline && <p className="mt-3 text-lg sm:text-xl font-medium max-w-2xl text-white/95">{site.tagline}</p>}
        </div>
      </header>

      {/* Buscador */}
      <div ref={searchRef} className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 -mt-16 sm:-mt-20">
        <form
          onSubmit={doSearch}
          className="rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-2xl p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-[1fr_1fr_auto_auto] gap-3 items-end"
        >
          <label className="flex flex-col gap-1.5 min-w-0">
            <span className="text-sm font-bold">{t.arrive}</span>
            <input
              type="date"
              value={checkIn}
              min={today}
              onChange={(e) => {
                const v = e.target.value;
                setCheckIn(v);
                if (v && (!checkOut || checkOut <= v)) setCheckOut(plusDays(v, 2));
              }}
              className="w-full min-h-[48px] px-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--fg)] text-base font-semibold"
              style={{ colorScheme: theme.colorScheme }}
            />
          </label>
          <label className="flex flex-col gap-1.5 min-w-0">
            <span className="text-sm font-bold">{t.leave}</span>
            <input
              type="date"
              value={checkOut}
              min={checkIn ? plusDays(checkIn, 1) : plusDays(today, 1)}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full min-h-[48px] px-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--fg)] text-base font-semibold"
              style={{ colorScheme: theme.colorScheme }}
            />
          </label>
          <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
            <span className="text-sm font-bold">{t.guests}</span>
            <div className="flex items-center justify-between gap-2 min-h-[48px] px-1.5 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
              <button
                type="button"
                aria-label="-"
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--surface-2)] cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-base font-bold tabular-nums w-6 text-center">{guests}</span>
              <button
                type="button"
                aria-label="+"
                onClick={() => setGuests((g) => Math.min(maxCapacity, g + 1))}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--surface-2)] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <button type="submit" className={`${btnPrimary} col-span-2 sm:col-span-1`}>
            {t.search}
          </button>
          {error && <p className="col-span-2 sm:col-span-4 text-sm font-bold text-[var(--accent)]">{error}</p>}
        </form>
      </div>

      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-14 space-y-16">
        {site.description && (
          <section className="max-w-2xl">
            <p className="text-lg leading-relaxed text-[var(--fg-2)] whitespace-pre-line">{site.description}</p>
          </section>
        )}

        {/* Resultados o lista de alojamientos */}
        <section ref={resultsRef} className="scroll-mt-6 space-y-6">
          {results ? (
            <>
              <div>
                <h2 style={headingFont} className="text-3xl font-semibold">
                  {results.free.length ? t.available : t.noneTitle}
                </h2>
                <p className="mt-1 text-base font-semibold text-[var(--fg-2)]">
                  {fmtDate(searched!.in, lang)} → {fmtDate(searched!.out, lang)} · {t.nights(results.n)} · {t.msgGuests(searched!.guests).slice(2)}
                </p>
              </div>
              {results.free.length === 0 ? (
                <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
                  <p className="text-base font-semibold">{t.none}</p>
                  {whatsapp && (
                    <a href={waLink(whatsapp, t.msgGeneral(site.name))} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
                      {t.askGeneral}
                    </a>
                  )}
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {results.free.map(({ unit, total, minNights, below }) => (
                    <UnitCard key={unit.id} unit={unit} photos={unitPhotos(unit.id)} t={t} onOpen={(i) => setLightbox({ list: unitPhotos(unit.id), index: i })}>
                      <div className="pt-4 mt-auto border-t border-[var(--line)] space-y-3">
                        {below ? (
                          <p className="text-base font-semibold">{t.minNights(minNights)}</p>
                        ) : total > 0 ? (
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="text-sm font-bold">
                              {t.total} · {t.nights(results.n)}
                            </span>
                            <span className="text-2xl font-bold tabular-nums">{fmtMoney(total, site.currency)}</span>
                          </div>
                        ) : (
                          <p className="text-base font-semibold">{t.askPrice}</p>
                        )}
                        {whatsapp && (
                          <a
                            href={waLink(whatsapp, requestText(unit, below ? 0 : total))}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${btnPrimary} w-full`}
                          >
                            {below ? t.askGeneral : t.ask}
                          </a>
                        )}
                      </div>
                    </UnitCard>
                  ))}
                </div>
              )}
              {(results.busy.length > 0 || results.small.length > 0) && (
                <div className="space-y-1 text-base text-[var(--fg-2)]">
                  {results.busy.length > 0 && (
                    <p>
                      <span className="font-bold text-[var(--fg)]">{t.occupied}:</span> {results.busy.map((u) => u.name).join(', ')}
                    </p>
                  )}
                  {results.small.length > 0 && (
                    <p>
                      <span className="font-bold text-[var(--fg)]">{t.tooSmall}:</span> {results.small.map((u) => u.name).join(', ')}
                    </p>
                  )}
                </div>
              )}
              {results.free.length > 0 && <p className="text-sm font-medium text-[var(--fg-2)]">{t.confirmNote}</p>}
            </>
          ) : (
            <>
              <h2 style={headingFont} className="text-3xl font-semibold">
                {t.stays}
              </h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {site.units.map((unit) => (
                  <UnitCard key={unit.id} unit={unit} photos={unitPhotos(unit.id)} t={t} onOpen={(i) => setLightbox({ list: unitPhotos(unit.id), index: i })}>
                    <div className="pt-4 mt-auto">
                      <button type="button" onClick={goSearch} className={`${btnGhost} w-full`}>
                        {t.chooseDates}
                      </button>
                    </div>
                  </UnitCard>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Fotos generales */}
        {general.length > 1 && (
          <section className="space-y-5">
            <h2 style={headingFont} className="text-3xl font-semibold">
              {t.gallery}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {general.slice(1).map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setLightbox({ list: general, index: i + 1 })}
                  className="aspect-[4/3] overflow-hidden rounded-2xl cursor-pointer"
                >
                  <img src={p.data} alt="" loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Datos útiles y contacto */}
        <section className="grid gap-6 sm:grid-cols-2">
          {(site.checkinHour || site.checkoutHour || site.address) && (
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 space-y-3">
              {site.checkinHour && (
                <p className="flex items-center gap-2 text-base">
                  <Clock className="w-5 h-5 text-[var(--accent)] shrink-0" />
                  <span>
                    <span className="font-bold">{t.checkin}</span> {site.checkinHour}
                  </span>
                </p>
              )}
              {site.checkoutHour && (
                <p className="flex items-center gap-2 text-base">
                  <Clock className="w-5 h-5 text-[var(--accent)] shrink-0" />
                  <span>
                    <span className="font-bold">{t.checkout}</span> {site.checkoutHour}
                  </span>
                </p>
              )}
              {site.address && (
                <p className="flex items-start gap-2 text-base">
                  <MapPin className="w-5 h-5 text-[var(--accent)] shrink-0 mt-0.5" />
                  <span>
                    {site.address}
                    {site.mapsUrl && (
                      <>
                        {' · '}
                        <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline underline-offset-4">
                          {t.map}
                        </a>
                      </>
                    )}
                  </span>
                </p>
              )}
            </div>
          )}
          {whatsapp && (
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 flex flex-col justify-between gap-4">
              <p style={headingFont} className="text-2xl font-semibold">
                {t.contact}
              </p>
              <a href={waLink(whatsapp, t.msgGeneral(site.name))} target="_blank" rel="noopener noreferrer" className={`${btnGhost} self-start`}>
                {t.askGeneral}
              </a>
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-[var(--line)] py-10 px-5 text-center space-y-2">
        <p style={headingFont} className="text-xl font-semibold">
          {site.name}
        </p>
        <p className="text-sm font-semibold text-[var(--fg-2)]">{t.direct}</p>
        <a href="https://loomisuite.net" target="_blank" rel="noopener" className="inline-block text-sm font-semibold text-[var(--fg-2)] underline underline-offset-4">
          {t.madeWith}
        </a>
      </footer>

      {lightbox && (
        <Lightbox list={lightbox.list} index={lightbox.index} onClose={() => setLightbox(null)} closeLabel={t.close} />
      )}
    </div>
  );
};

const UnitCard: React.FC<{
  unit: PublicSiteUnit;
  photos: PublicSitePhoto[];
  t: (typeof T)['es'];
  onOpen: (index: number) => void;
  children: React.ReactNode;
}> = ({ unit, photos, t, onOpen, children }) => {
  const [index, setIndex] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const onScroll = () => {
    const el = scroller.current;
    if (el) setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
  };
  return (
    <article className="rounded-3xl overflow-hidden border border-[var(--line)] bg-[var(--surface)] flex flex-col">
      {photos.length > 0 ? (
        <div className="relative">
          <div ref={scroller} onScroll={onScroll} className="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {photos.map((p, i) => (
              <button key={p.id} type="button" onClick={() => onOpen(i)} className="w-full shrink-0 snap-center aspect-[4/3] cursor-pointer">
                <img src={p.data} alt={unit.name} loading="lazy" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          {photos.length > 1 && (
            <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/65 text-white text-xs font-bold tabular-nums">
              {index + 1} / {photos.length}
            </span>
          )}
        </div>
      ) : null}
      <div className="p-5 flex flex-col gap-2 flex-1">
        <h3 className="text-xl font-bold">{unit.name}</h3>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-[var(--fg-2)]">
          {unit.maxGuests > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Users className="w-4 h-4" /> {t.upTo(unit.maxGuests)}
            </span>
          )}
          {unit.bedrooms > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <BedDouble className="w-4 h-4" /> {t.bedrooms(unit.bedrooms)}
            </span>
          )}
        </p>
        {unit.description && <p className="text-base leading-relaxed text-[var(--fg-2)] whitespace-pre-line">{unit.description}</p>}
        {children}
      </div>
    </article>
  );
};

const Lightbox: React.FC<{ list: PublicSitePhoto[]; index: number; onClose: () => void; closeLabel: string }> = ({
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
