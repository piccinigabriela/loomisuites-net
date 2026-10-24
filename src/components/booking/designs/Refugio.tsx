/**
 * Refugio (diseño especial): portada con una foto a pantalla completa y el texto abajo,
 * después mucho blanco, una foto ancha y las unidades alternadas con una foto chica redonda.
 * Inspirado en las webs de hospedajes de montaña: tranquilo y con la foto como protagonista.
 */
import React from 'react';
import { ArrowRight, MapPin, Clock } from 'lucide-react';
import type { PublicSitePhoto, PublicSiteUnit } from '../../../lib/publicSite';
import {
  fmtDate,
  fmtMoney,
  LangSwitch,
  Lightbox,
  SearchForm,
  SiteTexts,
  SiteViewProps,
  useGoogleFont,
  useSiteBooking,
  waLink,
} from '../siteKit';

const VARS = {
  '--bg': '#FFFFFF',
  '--surface': '#F4F2EE',
  '--line': '#D6D1C8',
  '--fg': '#151515',
  '--fg-2': '#333331',
  '--accent': '#1E2A24',
  '--accent-ink': '#FFFFFF',
  '--sun': '#E9D54A',
} as React.CSSProperties;

const display: React.CSSProperties = { fontFamily: "'Jost', 'Avenir Next', system-ui, sans-serif" };

export const RefugioSite: React.FC<SiteViewProps> = ({ site, photos, preview }) => {
  const b = useSiteBooking(site, photos, preview);
  const { t, lang, results, searched, general, cover, unitPhotos, setLightbox } = b;
  useGoogleFont('loomi-font-jost', 'https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&display=swap');

  const wide = general[1];
  const gallery = general.slice(2);
  const btnDark =
    'inline-flex items-center justify-center gap-2 min-h-[50px] px-7 bg-[var(--accent)] text-[var(--accent-ink)] text-sm font-semibold uppercase tracking-[0.18em] hover:brightness-125 transition cursor-pointer';

  const unitList: Array<{ unit: PublicSiteUnit; total?: number; below?: boolean; minNights?: number }> = results
    ? results.free
    : site.units.map((unit) => ({ unit }));

  return (
    <div style={VARS} className="relative min-h-screen bg-[var(--bg)] text-[var(--fg)] font-sans antialiased">
      {/* Portada */}
      <header className="relative h-[100svh] min-h-[560px] max-h-[980px] overflow-hidden bg-[var(--accent)]">
        {cover && <img src={cover.data} alt={site.name} className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/45" />

        <div className="absolute top-0 inset-x-0 z-10 flex items-start justify-between gap-4 px-5 sm:px-10 pt-5 sm:pt-7 text-white">
          <div style={display} className="hidden sm:block min-w-0">
            <p className="text-sm sm:text-base font-medium uppercase tracking-[0.28em] leading-snug truncate">{site.name}</p>
            {site.city && <p className="mt-1 text-xs font-medium tracking-[0.18em] uppercase text-white/90 truncate">{site.city}</p>}
          </div>
          <div className="ml-auto flex items-center gap-3 shrink-0">
            <LangSwitch
              b={b}
              className="flex gap-0.5 rounded-full bg-black/35 backdrop-blur p-1"
              activeCls="bg-white text-stone-900"
              idleCls="text-white"
            />
            <button
              type="button"
              onClick={b.goSearch}
              style={display}
              className="w-[68px] h-[68px] rounded-full bg-[var(--sun)] text-[#1A1A1A] text-[11px] font-semibold uppercase tracking-[0.08em] flex items-center justify-center shadow-lg hover:scale-105 transition cursor-pointer"
            >
              {t.book}
            </button>
          </div>
        </div>

        <div className="absolute z-10 bottom-14 sm:bottom-20 left-6 right-6 sm:left-auto sm:right-24 sm:max-w-md text-white sm:text-right">
          {site.tagline && (
            <p style={display} className="text-xl sm:text-2xl font-light leading-[1.7] tracking-[0.14em] text-balance">
              {site.tagline}
            </p>
          )}
          <p style={display} className="mt-4 text-sm font-medium uppercase tracking-[0.3em]">
            {site.name}
          </p>
        </div>
        <span
          aria-hidden="true"
          className="hidden sm:block absolute z-10 right-8 bottom-20 text-[11px] font-semibold uppercase tracking-[0.3em] text-white [writing-mode:vertical-rl]"
        >
          Scroll
        </span>
      </header>

      {/* Presentación */}
      <section className="px-6 pt-24 pb-16 sm:pt-32 sm:pb-20 text-center">
        <h1 style={display} className="text-[clamp(2rem,7vw,4.25rem)] font-light uppercase tracking-[0.12em] leading-tight text-balance">
          {site.name}
        </h1>
        {site.description && (
          <p className="mt-8 mx-auto max-w-xl text-base sm:text-lg leading-[2] text-[var(--fg-2)] whitespace-pre-line">{site.description}</p>
        )}
      </section>

      {/* Buscador */}
      <div ref={b.searchRef} className="max-w-4xl mx-auto px-5 sm:px-8 scroll-mt-10">
        <div className="border-y border-[var(--line)] py-8 sm:py-10">
          <p style={display} className="text-center text-sm font-medium uppercase tracking-[0.3em] mb-6">
            {t.chooseDates}
          </p>
          <SearchForm
            b={b}
            colorScheme="light"
            formCls="grid grid-cols-2 sm:grid-cols-[1fr_1fr_auto_auto] gap-x-5 gap-y-5 items-end"
            labelCls="text-xs font-bold uppercase tracking-[0.16em]"
            fieldCls="bg-[var(--surface)] border-b-2 border-[var(--fg)] text-[var(--fg)]"
            stepBtnCls="w-10 h-10 flex items-center justify-center hover:bg-[var(--line)] cursor-pointer"
            submitCls={btnDark}
            errorCls="text-sm font-bold text-[#8A1C1C]"
          />
        </div>
      </div>

      {/* Foto ancha */}
      {wide && (
        <button
          type="button"
          onClick={() => setLightbox({ list: general, index: 1 })}
          className="block w-full mt-20 sm:mt-28 h-[46vh] sm:h-[78vh] overflow-hidden cursor-pointer"
        >
          <img src={wide.data} alt="" loading="lazy" className="w-full h-full object-cover" />
        </button>
      )}

      {/* Alojamientos o resultados */}
      <section ref={b.resultsRef} className="max-w-6xl mx-auto px-5 sm:px-10 pt-20 sm:pt-28 scroll-mt-6">
        <div className="text-center mb-14 sm:mb-20">
          <h2 style={display} className="text-2xl sm:text-3xl font-light uppercase tracking-[0.22em]">
            {results ? (results.free.length ? t.available : t.noneTitle) : t.stays}
          </h2>
          {results && searched && (
            <p className="mt-3 text-base font-semibold text-[var(--fg-2)]">
              {fmtDate(searched.in, lang)} → {fmtDate(searched.out, lang)} · {t.nights(results.n)} · {t.msgGuests(searched.guests).slice(2)}
            </p>
          )}
        </div>

        {results && results.free.length === 0 ? (
          <div className="max-w-xl mx-auto text-center space-y-6 pb-8">
            <p className="text-lg text-[var(--fg-2)]">{t.none}</p>
            {b.generalLink && (
              <a href={b.generalLink} target="_blank" rel="noopener noreferrer" className={btnDark}>
                {t.askGeneral}
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-24 sm:space-y-32">
            {unitList.map(({ unit, total, below, minNights }, i) => (
              <UnitRow key={unit.id} unit={unit} photos={unitPhotos(unit.id)} flip={i % 2 === 1} t={t} onOpen={(idx) => setLightbox({ list: unitPhotos(unit.id), index: idx })}>
                {results ? (
                  <div className="space-y-4 pt-2">
                    {below ? (
                      <p className="text-base font-semibold">{t.minNights(minNights || 0)}</p>
                    ) : total && total > 0 ? (
                      <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="text-xs font-bold uppercase tracking-[0.16em]">
                          {t.total} · {t.nights(results.n)}
                        </span>
                        <span style={display} className="text-3xl font-normal tabular-nums">
                          {fmtMoney(total, site.currency)}
                        </span>
                      </p>
                    ) : (
                      <p className="text-base font-semibold">{t.askPrice}</p>
                    )}
                    {site.whatsapp && (
                      <a href={waLink(site.whatsapp, b.requestText(unit, below ? 0 : total || 0))} target="_blank" rel="noopener noreferrer" className={btnDark}>
                        {below ? t.askGeneral : t.ask}
                      </a>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={b.goSearch}
                    className="group inline-flex items-center gap-3 pt-2 text-sm font-bold uppercase tracking-[0.18em] border-b-2 border-[var(--fg)] pb-1 cursor-pointer"
                  >
                    {t.chooseDates} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </UnitRow>
            ))}
          </div>
        )}
        {results && results.free.length > 0 && <p className="mt-16 text-center text-sm font-medium text-[var(--fg-2)]">{t.confirmNote}</p>}
      </section>

      {/* Fotos */}
      {gallery.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 sm:px-10 pt-24 sm:pt-32">
          <h2 style={display} className="text-center text-2xl sm:text-3xl font-light uppercase tracking-[0.22em] mb-12 sm:mb-16">
            {t.gallery}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-12 gap-3 sm:gap-6 items-start">
            {gallery.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setLightbox({ list: general, index: i + 2 })}
                className={`overflow-hidden cursor-pointer ${GALLERY_SPOTS[i % GALLERY_SPOTS.length]}`}
              >
                <img src={p.data} alt="" loading="lazy" className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Horarios, ubicación y contacto */}
      <section className="max-w-5xl mx-auto px-5 sm:px-10 pt-24 sm:pt-32 pb-24 grid gap-12 sm:grid-cols-2">
        {(site.checkinHour || site.checkoutHour) && (
          <div className="border-t border-[var(--fg)] pt-6 space-y-3">
            <h3 style={display} className="text-sm font-medium uppercase tracking-[0.28em]">
              {t.hours}
            </h3>
            {site.checkinHour && (
              <p className="flex items-center gap-2 text-base">
                <Clock className="w-4 h-4 shrink-0" /> <span className="font-bold">{t.checkin}</span> {site.checkinHour}
              </p>
            )}
            {site.checkoutHour && (
              <p className="flex items-center gap-2 text-base">
                <Clock className="w-4 h-4 shrink-0" /> <span className="font-bold">{t.checkout}</span> {site.checkoutHour}
              </p>
            )}
          </div>
        )}
        {(site.address || site.city) && (
          <div className="border-t border-[var(--fg)] pt-6 space-y-3">
            <h3 style={display} className="text-sm font-medium uppercase tracking-[0.28em]">
              {t.where}
            </h3>
            <p className="flex items-start gap-2 text-base">
              <MapPin className="w-4 h-4 shrink-0 mt-1" />
              <span>{[site.address, site.city].filter(Boolean).join(' · ')}</span>
            </p>
            {site.mapsUrl && (
              <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-bold uppercase tracking-[0.16em] border-b-2 border-[var(--fg)] pb-0.5">
                {t.map}
              </a>
            )}
          </div>
        )}
      </section>

      <footer className="bg-[var(--accent)] text-white px-6 py-16 text-center space-y-4">
        <p style={display} className="text-2xl sm:text-3xl font-light uppercase tracking-[0.2em]">
          {site.name}
        </p>
        <p className="text-base font-medium">{t.contact}</p>
        {b.generalLink && (
          <a
            href={b.generalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center min-h-[50px] px-7 bg-[var(--sun)] text-[#1A1A1A] text-sm font-bold uppercase tracking-[0.16em] hover:brightness-105 transition"
          >
            {t.askGeneral}
          </a>
        )}
        <p className="pt-6 text-sm font-semibold">{t.direct}</p>
        <a href="https://loomisuite.net" target="_blank" rel="noopener" className="inline-block text-sm font-semibold underline underline-offset-4">
          {t.madeWith}
        </a>
      </footer>

      {b.lightbox && <Lightbox list={b.lightbox.list} index={b.lightbox.index} onClose={() => setLightbox(null)} closeLabel={t.close} />}
    </div>
  );
};

/** Lugares de la grilla de fotos: alterna tamaños para que no quede una cuadrícula pareja */
const GALLERY_SPOTS = [
  'col-span-2 sm:col-span-7 aspect-[4/3]',
  'col-span-1 sm:col-span-5 sm:mt-24 aspect-[3/4] sm:aspect-[4/5]',
  'col-span-1 sm:col-span-5 aspect-[3/4] sm:aspect-square',
  'col-span-2 sm:col-span-7 sm:mt-16 aspect-[4/3] sm:aspect-[16/10]',
];

const UnitRow: React.FC<{
  unit: PublicSiteUnit;
  photos: PublicSitePhoto[];
  flip: boolean;
  t: SiteTexts;
  onOpen: (index: number) => void;
  children: React.ReactNode;
}> = ({ unit, photos, flip, t, onOpen, children }) => {
  const main = photos[0];
  const detail = photos[1];
  return (
    <article className="grid gap-8 sm:gap-14 sm:grid-cols-12 items-center">
      <div className={`sm:col-span-7 ${flip ? 'sm:order-2' : ''}`}>
        {main ? (
          <button type="button" onClick={() => onOpen(0)} className="block w-full aspect-[4/3] overflow-hidden cursor-pointer">
            <img src={main.data} alt={unit.name} loading="lazy" className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700" />
          </button>
        ) : (
          <div className="aspect-[4/3] bg-[var(--surface)]" />
        )}
      </div>
      <div className={`sm:col-span-5 space-y-4 ${flip ? 'sm:order-1 sm:text-right sm:items-end' : ''} flex flex-col`}>
        <h3 style={display} className="text-2xl sm:text-3xl font-normal uppercase tracking-[0.14em] leading-snug">
          {unit.name}
        </h3>
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--fg-2)]">
          {[unit.maxGuests > 0 ? t.upTo(unit.maxGuests) : '', unit.bedrooms > 0 ? t.bedrooms(unit.bedrooms) : ''].filter(Boolean).join(' · ')}
        </p>
        {unit.description && <p className="text-base leading-[1.9] text-[var(--fg-2)] whitespace-pre-line">{unit.description}</p>}
        {detail && (
          <button
            type="button"
            onClick={() => onOpen(1)}
            aria-label={`${t.gallery}: ${unit.name}`}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden cursor-pointer ring-1 ring-[var(--line)]"
          >
            <img src={detail.data} alt="" loading="lazy" className="w-full h-full object-cover" />
          </button>
        )}
        <div>{children}</div>
      </div>
    </article>
  );
};
