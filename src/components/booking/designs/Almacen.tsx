/**
 * Almacén (diseño especial): papel con textura, letra de máquina de escribir, un sello con las iniciales,
 * fotos con tono cálido y la lista de alojamientos como una lista de precios con línea punteada.
 * Rústico y con personalidad: posadas, casas de campo, lugares con historia.
 */
import React from 'react';
import type { PublicSitePhoto, PublicSiteUnit } from '../../../lib/publicSite';
import { fmtDate, fmtMoney, LangSwitch, Lightbox, SearchForm, SiteTexts, SiteViewProps, useGoogleFont, useSiteBooking, waLink } from '../siteKit';

const PAPER =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .35 0 0 0 0 .3 0 0 0 0 .22 0 0 0 .16 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const VARS = {
  '--bg': '#E9E4D8',
  '--paper': '#F3EFE6',
  '--line': '#1C1A16',
  '--fg': '#1C1A16',
  '--fg-2': '#34302A',
  '--ink': '#1D1C1A',
  '--clay': '#9C9285',
} as React.CSSProperties;

const type: React.CSSProperties = { fontFamily: "'Special Elite', 'Courier New', monospace" };
const mono: React.CSSProperties = { fontFamily: "'Courier Prime', 'Courier New', monospace" };
const warm = 'object-cover [filter:sepia(.18)_saturate(.82)_contrast(1.02)]';

const paperBg: React.CSSProperties = { backgroundImage: PAPER };

/** Sello redondo con las iniciales */
const Stamp: React.FC<{ name: string; size?: string; light?: boolean }> = ({ name, size = 'w-24 h-24', light }) => {
  // Primera y última palabra con peso ("Corte delle Vette" → CV)
  const words = name.split(/\s+/).filter((w) => w.length > 2);
  const initials = (words.length > 1 ? [words[0], words[words.length - 1]] : words.slice(0, 1)).map((w) => w[0]?.toUpperCase()).join('');
  return (
    <span
      style={type}
      className={`${size} rounded-full border-[3px] ${light ? 'border-white text-white' : 'border-[var(--ink)] text-[var(--ink)]'} flex items-center justify-center text-3xl -rotate-6 relative`}
      aria-hidden="true"
    >
      <span className={`absolute inset-1.5 rounded-full border ${light ? 'border-white/80' : 'border-[var(--ink)]/80'} border-dashed`} />
      {initials}
    </span>
  );
};

/** Renglón con línea punteada entre el texto y el valor */
const Leader: React.FC<{ left: React.ReactNode; right: React.ReactNode; strong?: boolean }> = ({ left, right, strong }) => (
  <div className={`flex items-end gap-2 ${strong ? 'text-base sm:text-xl font-bold' : 'text-base sm:text-lg'}`}>
    <span className="min-w-0">{left}</span>
    <span className="flex-1 min-w-[24px] border-b-2 border-dotted border-[var(--line)]/70 mb-[0.4em]" />
    <span className="shrink-0 tabular-nums">{right}</span>
  </div>
);

export const AlmacenSite: React.FC<SiteViewProps> = ({ site, photos, preview }) => {
  const b = useSiteBooking(site, photos, preview);
  const { t, lang, results, searched, general, cover, unitPhotos, setLightbox } = b;
  useGoogleFont('loomi-font-almacen', 'https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Special+Elite&display=swap');

  const gallery = general.slice(2);
  const unitList: Array<{ unit: PublicSiteUnit; total?: number; below?: boolean; minNights?: number }> = results
    ? results.free
    : site.units.map((unit) => ({ unit }));
  const btn =
    'inline-flex items-center justify-center gap-2 min-h-[50px] px-6 bg-[var(--ink)] text-[var(--paper)] text-base font-bold uppercase tracking-[0.08em] hover:bg-black transition cursor-pointer';

  return (
    <div style={{ ...VARS, ...mono, ...paperBg }} className="relative min-h-screen bg-[var(--bg)] text-[var(--fg)] antialiased">
      {/* Esquinas */}
      <div className="flex items-center justify-between gap-4 px-5 sm:px-10 pt-5 text-sm sm:text-base font-bold">
        <span className="truncate">{site.city || site.name}</span>
        <LangSwitch b={b} className="flex gap-0.5 border-2 border-[var(--ink)] p-0.5" activeCls="bg-[var(--ink)] text-[var(--paper)] rounded-none!" idleCls="text-[var(--ink)] rounded-none!" />
      </div>

      {/* Portada */}
      <header className="px-6 pt-16 sm:pt-20 pb-14 flex flex-col items-center text-center gap-6">
        <Stamp name={site.name} />
        <h1 style={type} className="text-[clamp(2.2rem,7.5vw,4.5rem)] leading-[1.05] text-balance">
          {site.name}
        </h1>
        {site.tagline && <p className="text-lg sm:text-xl max-w-xl text-[var(--fg-2)]">{site.tagline}</p>}
      </header>

      {cover && (
        <div className="max-w-5xl mx-auto px-5 sm:px-10">
          <button type="button" onClick={() => setLightbox({ list: general.length ? general : [cover], index: 0 })} className="block w-full cursor-pointer bg-[var(--paper)] p-2.5 sm:p-3 shadow-[0_10px_30px_rgba(40,30,15,0.18)]">
            <img src={cover.data} alt={site.name} className={`w-full aspect-[4/3] sm:aspect-[16/8] ${warm}`} />
          </button>
        </div>
      )}

      {/* Buscador */}
      <div ref={b.searchRef} className="max-w-5xl mx-auto px-5 sm:px-10 pt-12 scroll-mt-6">
        <div style={paperBg} className="bg-[var(--paper)] border-2 border-[var(--ink)] p-5 sm:p-7">
          <p style={type} className="text-2xl mb-5">
            {t.chooseDates}
          </p>
          <SearchForm
            b={b}
            colorScheme="light"
            formCls="grid grid-cols-2 sm:grid-cols-[1fr_1fr_auto_auto] gap-x-4 gap-y-4 items-end"
            labelCls="text-sm font-bold uppercase tracking-[0.06em]"
            fieldCls="bg-transparent border-0 border-b-2 border-dashed border-[var(--ink)] text-[var(--fg)]"
            stepBtnCls="w-10 h-10 flex items-center justify-center hover:bg-[var(--bg)] cursor-pointer"
            submitCls={btn}
            errorCls="text-base font-bold text-[#8A2312]"
          />
        </div>
      </div>

      {/* El lugar */}
      {site.description && (
        <section className="max-w-5xl mx-auto px-5 sm:px-10 pt-20 sm:pt-24">
          <div className="grid gap-8 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-center">
            {general[1] && (
              <button type="button" onClick={() => setLightbox({ list: general, index: 1 })} className="block bg-[var(--clay)] p-5 sm:p-7 cursor-pointer">
                <img src={general[1].data} alt="" loading="lazy" className={`w-full aspect-[4/5] ${warm}`} />
              </button>
            )}
            <div className="space-y-5">
              <h2 style={type} className="text-3xl sm:text-4xl">
                {t.place}
              </h2>
              <p className="text-lg leading-relaxed text-[var(--fg-2)] whitespace-pre-line">{site.description}</p>
            </div>
          </div>
        </section>
      )}

      {/* Lista de alojamientos (o resultados) sobre fondo oscuro */}
      <section ref={b.resultsRef} className="mt-20 sm:mt-24 bg-[var(--ink)] py-14 sm:py-20 scroll-mt-4">
        <div className="max-w-5xl mx-auto px-5 sm:px-10 flex gap-6">
          <div style={paperBg} className="flex-1 min-w-0 bg-[var(--paper)] p-5 sm:p-10">
            <h2 style={type} className="text-4xl sm:text-5xl uppercase">
              {results ? (results.free.length ? t.available : t.noneTitle) : t.stays}
            </h2>
            {results && searched && (
              <p className="mt-2 text-base font-bold">
                {fmtDate(searched.in, lang)} → {fmtDate(searched.out, lang)} · {t.nights(results.n)} · {t.msgGuests(searched.guests).slice(2)}
              </p>
            )}

            {results && results.free.length === 0 ? (
              <div className="mt-8 space-y-5">
                <p className="text-lg">{t.none}</p>
                {b.generalLink && (
                  <a href={b.generalLink} target="_blank" rel="noopener noreferrer" className={btn}>
                    {t.askGeneral}
                  </a>
                )}
              </div>
            ) : (
              <>
                <div className={`mt-8 space-y-4 ${results ? '' : 'hidden sm:block'}`}>
                  {unitList.map(({ unit, total, below }) => (
                    <a key={unit.id} href={`#a-${unit.id}`} className="block hover:opacity-75">
                      <Leader
                        left={<span>• {unit.name}</span>}
                        right={results ? (below ? '—' : total && total > 0 ? fmtMoney(total, site.currency) : t.askPrice) : t.upTo(unit.maxGuests)}
                        strong={!!results}
                      />
                    </a>
                  ))}
                </div>
                <div className="mt-12 space-y-12">
                  {unitList.map(({ unit, total, below, minNights }) => (
                    <UnitEntry key={unit.id} unit={unit} photos={unitPhotos(unit.id)} t={t} onOpen={(i) => setLightbox({ list: unitPhotos(unit.id), index: i })}>
                      {results ? (
                        <div className="space-y-3">
                          {below ? (
                            <p className="text-base font-bold">{t.minNights(minNights || 0)}</p>
                          ) : total && total > 0 ? (
                            <Leader left={`${t.total} · ${t.nights(results.n)}`} right={fmtMoney(total, site.currency)} strong />
                          ) : (
                            <p className="text-base font-bold">{t.askPrice}</p>
                          )}
                          {site.whatsapp && (
                            <a href={waLink(site.whatsapp, b.requestText(unit, below ? 0 : total || 0))} target="_blank" rel="noopener noreferrer" className={btn}>
                              {below ? t.askGeneral : t.ask}
                            </a>
                          )}
                        </div>
                      ) : (
                        <button type="button" onClick={b.goSearch} className="text-base font-bold underline underline-offset-4 decoration-2 cursor-pointer">
                          → {t.chooseDates}
                        </button>
                      )}
                    </UnitEntry>
                  ))}
                </div>
                {results && results.free.length > 0 && <p className="mt-10 text-sm font-bold">{t.confirmNote}</p>}
              </>
            )}
          </div>
          {/* Cintas con el nombre, como etiquetas (solo en compu) */}
          <div className="hidden md:flex gap-3 shrink-0" aria-hidden="true">
            {[0, 1].map((k) => (
              <div key={k} style={{ ...paperBg, ...type }} className={`w-11 bg-[var(--paper)] text-[var(--ink)] text-lg flex items-start justify-center py-6 overflow-hidden ${k ? 'mt-24' : ''}`}>
                <span className="[writing-mode:vertical-rl] whitespace-nowrap">
                  {site.name} · {site.name} · {site.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fotos */}
      {gallery.length > 0 && (
        <section className="max-w-5xl mx-auto px-5 sm:px-10 pt-20 sm:pt-24">
          <h2 style={type} className="text-3xl sm:text-4xl mb-10">
            {t.gallery}
          </h2>
          <div className={`grid grid-cols-2 ${['', 'sm:grid-cols-1', 'sm:grid-cols-2', 'sm:grid-cols-3', 'sm:grid-cols-4', 'sm:grid-cols-3', 'sm:grid-cols-3', 'sm:grid-cols-4', 'sm:grid-cols-4'][gallery.length] || 'sm:grid-cols-3'} gap-4 sm:gap-7`}>
            {gallery.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setLightbox({ list: general, index: i + 2 })}
                className={`bg-[var(--paper)] p-2 sm:p-2.5 pb-6 sm:pb-8 shadow-[0_8px_22px_rgba(40,30,15,0.16)] cursor-pointer transition-transform hover:rotate-0 ${
                  i % 2 ? 'rotate-[1.2deg]' : '-rotate-[1.2deg]'
                }`}
              >
                <img src={p.data} alt="" loading="lazy" className={`w-full aspect-square ${warm}`} />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Ficha: horarios y dirección */}
      <section className="max-w-3xl mx-auto px-5 sm:px-10 pt-20 sm:pt-24 pb-20 space-y-4">
        {site.checkinHour && <Leader left={t.checkin} right={site.checkinHour} />}
        {site.checkoutHour && <Leader left={t.checkout} right={site.checkoutHour} />}
        {(site.address || site.city) && (
          <div className="pt-2 text-base sm:text-lg">
            <span className="font-bold">{t.address}:</span> {[site.address, site.city].filter(Boolean).join(', ')}
            {site.mapsUrl && (
              <>
                {' '}
                <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline underline-offset-4 decoration-2">
                  ({t.map})
                </a>
              </>
            )}
          </div>
        )}
      </section>

      <footer className="bg-[var(--ink)] text-[var(--paper)] px-6 py-16 flex flex-col items-center text-center gap-5">
        <Stamp name={site.name} size="w-20 h-20" light />
        <p style={type} className="text-2xl sm:text-3xl">
          {t.contact}
        </p>
        {b.generalLink && (
          <a
            href={b.generalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center min-h-[50px] px-6 bg-[var(--paper)] text-[var(--ink)] text-base font-bold uppercase tracking-[0.08em] hover:bg-white transition"
          >
            {t.askGeneral}
          </a>
        )}
        <p className="pt-4 text-sm font-bold">{t.direct}</p>
        <a href="https://loomisuite.net" target="_blank" rel="noopener" className="text-sm font-bold underline underline-offset-4">
          {t.madeWith}
        </a>
      </footer>

      {b.lightbox && <Lightbox list={b.lightbox.list} index={b.lightbox.index} onClose={() => setLightbox(null)} closeLabel={t.close} />}
    </div>
  );
};

const UnitEntry: React.FC<{
  unit: PublicSiteUnit;
  photos: PublicSitePhoto[];
  t: SiteTexts;
  onOpen: (index: number) => void;
  children: React.ReactNode;
}> = ({ unit, photos, t, onOpen, children }) => (
  <article id={`a-${unit.id}`} className="grid gap-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-start border-t-2 border-dashed border-[var(--line)] pt-8 scroll-mt-6">
    {photos[0] ? (
      <button type="button" onClick={() => onOpen(0)} className="block cursor-pointer">
        <img src={photos[0].data} alt={unit.name} loading="lazy" className={`w-full aspect-[4/3] ${warm}`} />
      </button>
    ) : (
      <span />
    )}
    <div className="space-y-3">
      <h3 style={type} className="text-2xl sm:text-3xl">
        {unit.name}
      </h3>
      <p className="text-base font-bold">
        {[unit.maxGuests > 0 ? t.upTo(unit.maxGuests) : '', unit.bedrooms > 0 ? t.bedrooms(unit.bedrooms) : ''].filter(Boolean).join(' · ')}
      </p>
      {unit.description && <p className="text-base leading-relaxed text-[var(--fg-2)] whitespace-pre-line">{unit.description}</p>}
      {photos.length > 1 && (
        <button type="button" onClick={() => onOpen(1)} className="text-base font-bold underline underline-offset-4 cursor-pointer">
          {t.gallery} ({photos.length})
        </button>
      )}
      <div className="pt-1">{children}</div>
    </div>
  </article>
);
