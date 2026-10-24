/**
 * Revista (diseño especial): armado de revista de viajes. Nombre en un recuadro como cabecera,
 * fotos grandes, una columna angosta de texto al costado, títulos en una serif de estilo japonés
 * y etiquetas chicas en mayúsculas con una línea. Luce con fotos de paisaje y naturaleza.
 */
import React from 'react';
import type { PublicSitePhoto, PublicSiteUnit } from '../../../lib/publicSite';
import { fmtDate, fmtMoney, LangSwitch, Lightbox, SearchForm, SiteTexts, SiteViewProps, useGoogleFont, useSiteBooking, waLink } from '../siteKit';

const VARS = {
  '--bg': '#F3F3F0',
  '--paper': '#FFFFFF',
  '--line': '#BDBDB6',
  '--fg': '#151515',
  '--fg-2': '#2F2F2C',
  '--moss': '#2E4636',
} as React.CSSProperties;

const mincho: React.CSSProperties = { fontFamily: "'Shippori Mincho', 'Noto Serif', Georgia, serif", fontWeight: 600 };

const btn =
  'inline-flex items-center justify-center gap-2 min-h-[48px] px-6 bg-[var(--moss)] text-white text-sm font-bold uppercase tracking-[0.14em] hover:brightness-125 transition cursor-pointer';

/** Etiqueta chica en mayúsculas con una línea debajo */
const Kicker: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`inline-block text-xs font-bold uppercase tracking-[0.18em] border-b-2 border-[var(--fg)] pb-1 ${className}`}>{children}</p>
);

/** Cabecera: el nombre dentro de un recuadro, como el logo de una revista */
const Masthead: React.FC<{ name: string; small?: boolean }> = ({ name, small }) => (
  <div className={`inline-flex flex-col items-center border-2 border-[var(--fg)] ${small ? 'px-4 py-1.5' : 'px-5 py-2'}`}>
    <span style={mincho} className={`${small ? 'text-base' : 'text-lg sm:text-xl'} uppercase tracking-[0.22em] leading-tight text-center`}>
      {name}
    </span>
  </div>
);

export const RevistaSite: React.FC<SiteViewProps> = ({ site, photos, preview }) => {
  const b = useSiteBooking(site, photos, preview);
  const { t, lang, results, searched, general, cover, unitPhotos, setLightbox } = b;
  useGoogleFont('loomi-font-mincho', 'https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;600;700&display=swap');

  const open = (i: number) => () => setLightbox({ list: general, index: i });
  const mosaic = general.slice(1, 4);
  const strip = general.slice(4);
  const unitList: Array<{ unit: PublicSiteUnit; total?: number; below?: boolean; minNights?: number }> = results
    ? results.free
    : site.units.map((unit) => ({ unit }));

  return (
    <div style={VARS} className="relative min-h-screen bg-[var(--bg)] text-[var(--fg)] font-sans antialiased">
      <div className="max-w-6xl mx-auto px-5 sm:px-10">
        {/* Línea de arriba */}
        <div className="flex items-center justify-between gap-4 pt-5 text-xs font-bold uppercase tracking-[0.16em]">
          <span className="truncate">{site.city}</span>
          <LangSwitch b={b} className="flex gap-0.5 border border-[var(--fg)] p-0.5" activeCls="bg-[var(--fg)] text-white rounded-none!" idleCls="text-[var(--fg)] rounded-none!" />
        </div>

        {/* Portada: cabecera y texto a la izquierda, foto grande a la derecha */}
        <header className="pt-10 sm:pt-14 grid gap-8 sm:grid-cols-12 sm:gap-10 items-start">
          <div className="sm:col-span-4 space-y-6 sm:pt-6 order-2 sm:order-1">
            <Masthead name={site.name} />
            {site.tagline && (
              <h1 style={mincho} className="text-2xl sm:text-3xl leading-snug text-balance">
                {site.tagline}
              </h1>
            )}
            {site.description && <p className="text-base leading-[1.9] text-[var(--fg-2)] whitespace-pre-line">{site.description}</p>}
            <div className="hidden sm:block">
              <button type="button" onClick={b.goSearch} className={btn}>
                {t.search}
              </button>
            </div>
          </div>
          {cover && (
            <button type="button" onClick={open(0)} className="sm:col-span-8 order-1 sm:order-2 block overflow-hidden cursor-pointer -mx-5 sm:mx-0">
              <img src={cover.data} alt={site.name} className="w-full aspect-[4/3] sm:aspect-[16/11] object-cover" />
            </button>
          )}
        </header>

        {/* Buscador */}
        <div ref={b.searchRef} className="mt-16 sm:mt-24 bg-[var(--paper)] border border-[var(--line)] p-5 sm:p-7 scroll-mt-6">
          <Kicker className="mb-5">{t.chooseDates}</Kicker>
          <SearchForm
            b={b}
            colorScheme="light"
            formCls="grid grid-cols-2 sm:grid-cols-[1fr_1fr_auto_auto] gap-x-4 gap-y-4 items-end"
            labelCls="text-xs font-bold uppercase tracking-[0.14em]"
            fieldCls="bg-[var(--bg)] border border-[var(--line)] text-[var(--fg)]"
            stepBtnCls="w-10 h-10 flex items-center justify-center hover:bg-white cursor-pointer"
            submitCls={btn}
            errorCls="text-sm font-bold text-[#8A1C1C]"
          />
        </div>

        {/* Alojamientos o resultados */}
        <section ref={b.resultsRef} className="pt-20 sm:pt-28 scroll-mt-6">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-12 sm:mb-16">
            <h2 style={mincho} className="text-4xl sm:text-6xl leading-none">
              {results ? (results.free.length ? t.available : t.noneTitle) : t.stays}
            </h2>
            {results && searched ? (
              <p className="text-base font-bold text-[var(--fg-2)]">
                {fmtDate(searched.in, lang)} → {fmtDate(searched.out, lang)} · {t.nights(results.n)} · {t.msgGuests(searched.guests).slice(2)}
              </p>
            ) : (
              <Kicker>{site.name}</Kicker>
            )}
          </div>

          {results && results.free.length === 0 ? (
            <div className="space-y-6">
              <p className="text-lg text-[var(--fg-2)]">{t.none}</p>
              {b.generalLink && (
                <a href={b.generalLink} target="_blank" rel="noopener noreferrer" className={btn}>
                  {t.askGeneral}
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-20 sm:space-y-28">
              {unitList.map(({ unit, total, below, minNights }, i) => (
                <Spread key={unit.id} n={i + 1} unit={unit} photos={unitPhotos(unit.id)} flip={i % 2 === 1} t={t} onOpen={(idx) => setLightbox({ list: unitPhotos(unit.id), index: idx })}>
                  {results ? (
                    <div className="space-y-3">
                      {below ? (
                        <p className="text-base font-semibold">{t.minNights(minNights || 0)}</p>
                      ) : total && total > 0 ? (
                        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span className="text-xs font-bold uppercase tracking-[0.16em]">
                            {t.total} · {t.nights(results.n)}
                          </span>
                          <span style={mincho} className="text-3xl tabular-nums">
                            {fmtMoney(total, site.currency)}
                          </span>
                        </p>
                      ) : (
                        <p className="text-base font-semibold">{t.askPrice}</p>
                      )}
                      {site.whatsapp && (
                        <a href={waLink(site.whatsapp, b.requestText(unit, below ? 0 : total || 0))} target="_blank" rel="noopener noreferrer" className={btn}>
                          {below ? t.askGeneral : t.ask}
                        </a>
                      )}
                    </div>
                  ) : (
                    <button type="button" onClick={b.goSearch} className="text-sm font-bold uppercase tracking-[0.16em] border-b-2 border-[var(--fg)] pb-1 cursor-pointer">
                      {t.chooseDates} →
                    </button>
                  )}
                </Spread>
              ))}
            </div>
          )}
          {results && results.free.length > 0 && <p className="mt-12 text-sm font-medium text-[var(--fg-2)]">{t.confirmNote}</p>}
        </section>

        {/* Fotos en mosaico */}
        {mosaic.length > 0 && (
          <section className="pt-24 sm:pt-32">
            <div className="flex items-end justify-between gap-4 mb-8">
              <h2 style={mincho} className="text-3xl sm:text-5xl leading-none">
                {t.gallery}
              </h2>
              {site.city && <Kicker>{site.city}</Kicker>}
            </div>
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-12">
              {mosaic.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={open(i + 1)}
                  className={`block overflow-hidden cursor-pointer ${
                    mosaic.length === 1
                      ? 'sm:col-span-12 aspect-[16/9]'
                      : i === 0
                      ? 'sm:col-span-7 sm:row-span-2 aspect-[4/3] sm:aspect-auto'
                      : 'sm:col-span-5 aspect-[4/3]'
                  }`}
                >
                  <img src={p.data} alt="" loading="lazy" className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700" />
                </button>
              ))}
            </div>
            {strip.length > 0 && (
              <div className={`mt-3 sm:mt-4 grid ${strip.length === 1 ? 'grid-cols-1' : strip.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-3 sm:gap-4`}>
                {strip.map((p, i) => (
                  <button key={p.id} type="button" onClick={open(i + 4)} className={`block ${strip.length === 1 ? 'aspect-[16/9]' : 'aspect-[4/5] sm:aspect-[4/3]'} overflow-hidden cursor-pointer`}>
                    <img src={p.data} alt="" loading="lazy" className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700" />
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Datos, en dos columnas de revista */}
        <section className="pt-24 sm:pt-32 pb-20 grid gap-12 sm:grid-cols-2 sm:gap-16 border-b border-[var(--line)]">
          {(site.checkinHour || site.checkoutHour) && (
            <div className="space-y-4">
              <Kicker>{t.hours}</Kicker>
              {site.checkinHour && (
                <p className="text-lg">
                  <span className="font-bold">{t.checkin}</span> {site.checkinHour}
                </p>
              )}
              {site.checkoutHour && (
                <p className="text-lg">
                  <span className="font-bold">{t.checkout}</span> {site.checkoutHour}
                </p>
              )}
            </div>
          )}
          {(site.address || site.city) && (
            <div className="space-y-4">
              <Kicker>{t.where}</Kicker>
              <p className="text-lg">{[site.address, site.city].filter(Boolean).join(', ')}</p>
              {site.mapsUrl && (
                <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-bold uppercase tracking-[0.16em] border-b-2 border-[var(--fg)] pb-1">
                  {t.map} →
                </a>
              )}
            </div>
          )}
        </section>
      </div>

      <footer className="max-w-6xl mx-auto px-5 sm:px-10 py-14 flex flex-col sm:flex-row sm:items-end justify-between gap-8">
        <div className="space-y-5">
          <Masthead name={site.name} small />
          <p style={mincho} className="text-2xl">
            {t.contact}
          </p>
          {b.generalLink && (
            <a href={b.generalLink} target="_blank" rel="noopener noreferrer" className={btn}>
              {t.askGeneral}
            </a>
          )}
        </div>
        <div className="space-y-2 text-sm font-semibold sm:text-right">
          <p>{t.direct}</p>
          <a href="https://loomisuite.net" target="_blank" rel="noopener" className="underline underline-offset-4">
            {t.madeWith}
          </a>
        </div>
      </footer>

      {b.lightbox && <Lightbox list={b.lightbox.list} index={b.lightbox.index} onClose={() => setLightbox(null)} closeLabel={t.close} />}
    </div>
  );
};

/** Cada unidad como una doble página: foto grande, texto en columna y tira con sus otras fotos */
const Spread: React.FC<{
  n: number;
  unit: PublicSiteUnit;
  photos: PublicSitePhoto[];
  flip: boolean;
  t: SiteTexts;
  onOpen: (index: number) => void;
  children: React.ReactNode;
}> = ({ n, unit, photos, flip, t, onOpen, children }) => (
  <article className="grid gap-6 sm:gap-12 sm:grid-cols-12 items-start">
    {photos[0] && (
      <button type="button" onClick={() => onOpen(0)} className={`sm:col-span-7 block overflow-hidden cursor-pointer ${flip ? 'sm:order-2' : ''}`}>
        <img src={photos[0].data} alt={unit.name} loading="lazy" className="w-full aspect-[4/3] object-cover hover:scale-[1.03] transition-transform duration-700" />
      </button>
    )}
    <div className={`sm:col-span-5 space-y-4 ${flip ? 'sm:order-1' : ''} ${photos[0] ? '' : 'sm:col-span-12 max-w-2xl'}`}>
      <p className="text-xs font-bold uppercase tracking-[0.18em]">
        {String(n).padStart(2, '0')} — {t.stays}
      </p>
      <h3 style={mincho} className="text-3xl sm:text-4xl leading-tight">
        {unit.name}
      </h3>
      <span className="block w-full h-px bg-[var(--line)]" />
      <p className="text-sm font-bold uppercase tracking-[0.12em]">
        {[unit.maxGuests > 0 ? t.upTo(unit.maxGuests) : '', unit.bedrooms > 0 ? t.bedrooms(unit.bedrooms) : ''].filter(Boolean).join(' · ')}
      </p>
      {unit.description && <p className="text-base leading-[1.9] text-[var(--fg-2)] whitespace-pre-line">{unit.description}</p>}
      {photos.length > 1 && (
        <div className="grid grid-cols-3 gap-2 pt-1">
          {photos.slice(1, 4).map((p, i) => (
            <button key={p.id} type="button" onClick={() => onOpen(i + 1)} className="block aspect-square overflow-hidden cursor-pointer">
              <img src={p.data} alt="" loading="lazy" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="pt-2">{children}</div>
    </div>
  </article>
);
