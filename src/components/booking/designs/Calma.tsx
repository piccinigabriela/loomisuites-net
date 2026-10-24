/**
 * Calma (diseño especial): verde profundo y tono arena, todo armado como un mosaico de baldosas
 * (fotos y bloques de color con texto encajados), una palabra vertical al costado y títulos en una
 * serif clásica y liviana. Para lugares en la naturaleza.
 */
import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { PublicSitePhoto, PublicSiteUnit } from '../../../lib/publicSite';
import { BookBar, ExperiencesSection, fmtDate, fmtMoney, LangSwitch, Lightbox, SearchForm, SiteTexts, SiteViewProps, useGoogleFont, useSiteBooking, waLink } from '../siteKit';

const VARS = {
  '--bg': '#1E2A22',
  '--green': '#2F3E33',
  '--moss': '#3E5143',
  '--sand': '#7A6E5C',
  '--sand-2': '#A39478',
  '--fg': '#F1ECE2',
  '--fg-2': '#DDD5C6',
} as React.CSSProperties;

const serif: React.CSSProperties = { fontFamily: "'Marcellus', 'Cormorant Garamond', Georgia, serif", fontWeight: 400 };

export const CalmaSite: React.FC<SiteViewProps> = ({ site, photos, preview }) => {
  const b = useSiteBooking(site, photos, preview);
  const { t, lang, results, searched, general, cover, unitPhotos, setLightbox } = b;
  useGoogleFont('loomi-font-marcellus', 'https://fonts.googleapis.com/css2?family=Marcellus&display=swap');

  const open = (i: number) => () => setLightbox({ list: general, index: i });
  const unitList: Array<{ unit: PublicSiteUnit; total?: number; below?: boolean; minNights?: number }> = results
    ? results.free
    : site.units.map((unit) => ({ unit }));
  const tile = 'relative overflow-hidden min-h-[220px]';
  const btn =
    'inline-flex items-center justify-center gap-2 min-h-[48px] px-6 bg-[var(--fg)] text-[var(--bg)] text-sm font-bold uppercase tracking-[0.12em] hover:bg-white transition cursor-pointer';

  return (
    <div style={VARS} className="relative min-h-screen bg-[var(--bg)] text-[var(--fg)] font-sans antialiased">
      <div className="relative max-w-6xl mx-auto px-3 sm:px-14 pt-3 sm:pt-8 pb-14">
        {/* Palabra vertical al costado (compu) */}
        <span
          aria-hidden="true"
          style={serif}
          className="hidden lg:block absolute right-2 top-10 text-3xl tracking-[0.5em] uppercase [writing-mode:vertical-rl] text-[var(--fg)]"
        >
          {(site.city || site.name).split(',')[0]}
        </span>

        {/* Portada */}
        <header className="relative h-[78vh] min-h-[460px] max-h-[760px] overflow-hidden">
          {cover && <img src={cover.data} alt={site.name} className="absolute inset-0 w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/10" />
          <div className="absolute top-0 inset-x-0 flex justify-end p-4 sm:p-6">
            <LangSwitch b={b} className="flex gap-0.5 rounded-full bg-black/35 backdrop-blur p-1" activeCls="bg-[var(--fg)] text-[var(--bg)]" idleCls="text-white" />
          </div>
          <div className="relative h-full flex flex-col justify-end p-6 sm:p-12 max-w-2xl">
            {site.city && <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white mb-4">{site.city}</p>}
            <h1 style={serif} className="text-[clamp(2.6rem,9vw,6.5rem)] leading-[0.95] text-white text-balance">
              {site.name}
            </h1>
            {site.tagline && <p className="mt-5 text-lg sm:text-xl text-white max-w-md">{site.tagline}</p>}
          </div>
        </header>

        {/* Buscador en franja arena */}
        <div ref={b.searchRef} className="bg-[var(--sand)] p-4 sm:p-6 scroll-mt-4">
          <SearchForm
            b={b}
            colorScheme="dark"
            formCls="grid grid-cols-2 sm:grid-cols-[1fr_1fr_auto_auto] gap-x-3 gap-y-3 items-end"
            labelCls="text-xs font-bold uppercase tracking-[0.14em] text-white"
            fieldCls="bg-[var(--green)] border border-white/30 text-white"
            stepBtnCls="w-10 h-10 flex items-center justify-center hover:bg-white/15 cursor-pointer"
            submitCls={btn}
            errorCls="text-sm font-bold text-white"
          />
        </div>

        {/* Mosaico del lugar: texto, foto, bloque, foto */}
        <section className="grid grid-cols-1 sm:grid-cols-3">
          <div className={`${tile} bg-[var(--sand-2)] p-6 sm:p-8 flex flex-col justify-end`}>
            {site.description && <p className="text-base leading-relaxed text-[#1E2A22] font-medium whitespace-pre-line">{site.description}</p>}
          </div>
          <div className={`${tile} bg-[var(--moss)] p-6 sm:p-8 flex flex-col justify-center`}>
            <h2 style={serif} className="text-3xl sm:text-4xl">
              {t.place}
            </h2>
            {(site.checkinHour || site.checkoutHour) && (
              <p className="mt-4 text-sm font-semibold text-[var(--fg-2)]">
                {site.checkinHour && `${t.checkin} ${site.checkinHour}`}
                {site.checkinHour && site.checkoutHour && ' · '}
                {site.checkoutHour && `${t.checkout} ${site.checkoutHour}`}
              </p>
            )}
          </div>
          {general[1] ? (
            <button type="button" onClick={open(1)} className={`${tile} cursor-pointer sm:row-span-2`}>
              <img src={general[1].data} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover hover:scale-[1.04] transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/25" />
              <p style={serif} className="absolute inset-x-6 top-1/2 -translate-y-1/2 text-2xl sm:text-3xl text-white text-center">
                {t.direct}
              </p>
            </button>
          ) : (
            <div className={`${tile} bg-[var(--green)] sm:row-span-2`} />
          )}
          {general[2] && (
            <button type="button" onClick={open(2)} className={`${tile} cursor-pointer sm:col-span-2`}>
              <img src={general[2].data} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover hover:scale-[1.04] transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 to-transparent" />
              <span className="absolute left-6 sm:left-8 bottom-6 sm:bottom-8 inline-flex items-center gap-3 text-white">
                <span style={serif} className="text-3xl sm:text-4xl">
                  {t.gallery}
                </span>
                <ArrowRight className="w-6 h-6" />
              </span>
            </button>
          )}
        </section>

        {/* Alojamientos o resultados: cada uno una baldosa doble (foto + bloque) */}
        <section ref={b.resultsRef} className="pt-10 sm:pt-14 scroll-mt-4">
          <div className="bg-[var(--green)] p-6 sm:p-8 flex flex-wrap items-end justify-between gap-3">
            <h2 style={serif} className="text-3xl sm:text-5xl">
              {results ? (results.free.length ? t.available : t.noneTitle) : t.stays}
            </h2>
            {results && searched && (
              <p className="text-base font-semibold text-[var(--fg-2)]">
                {fmtDate(searched.in, lang)} → {fmtDate(searched.out, lang)} · {t.nights(results.n)} · {t.msgGuests(searched.guests).slice(2)}
              </p>
            )}
          </div>
          {results && results.free.length === 0 ? (
            <div className="bg-[var(--moss)] p-6 sm:p-8 space-y-5">
              <p className="text-lg">{t.none}</p>
              {b.generalLink && (
                <a href={b.generalLink} target="_blank" rel="noopener noreferrer" className={btn}>
                  {t.askGeneral}
                </a>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2">
              {unitList.map(({ unit, total, below, minNights }, i) => (
                <UnitTile key={unit.id} unit={unit} photos={unitPhotos(unit.id)} tone={(['sand', 'moss', 'moss', 'sand'] as const)[i % 4]} t={t} onOpen={(idx) => setLightbox({ list: unitPhotos(unit.id), index: idx })}>
                  {results ? (
                    <div className="space-y-3">
                      {below ? (
                        <p className="text-base font-semibold">{t.minNights(minNights || 0)}</p>
                      ) : total && total > 0 ? (
                        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span className="text-xs font-bold uppercase tracking-[0.14em]">
                            {t.total} · {t.nights(results.n)}
                          </span>
                          <span style={serif} className="text-3xl tabular-nums">
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
                    <button type="button" onClick={b.goSearch} className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] border-b-2 border-current pb-1 cursor-pointer">
                      {t.chooseDates} <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </UnitTile>
              ))}
              {unitList.length % 2 === 1 && (
                <button
                  type="button"
                  onClick={b.goSearch}
                  className="hidden sm:flex relative overflow-hidden flex-col justify-end gap-3 p-8 text-left cursor-pointer group"
                >
                  {general[0] && <img src={general[0].data} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />}
                  <div className="absolute inset-0 bg-[var(--bg)]/70" />
                  <span style={serif} className="relative text-4xl text-white">
                    {t.search}
                  </span>
                  <ArrowRight className="relative w-7 h-7 text-white" />
                </button>
              )}
            </div>
          )}
          {results && results.free.length > 0 && <p className="mt-5 text-sm font-medium text-[var(--fg-2)]">{t.confirmNote}</p>}
        </section>

        <ExperiencesSection
          b={b}
          site={site}
          css={{
            section: 'pt-10 sm:pt-14',
            heading: 'bg-[var(--sand)] text-white p-6 sm:p-8 text-3xl sm:text-5xl',
            headingStyle: serif,
            grid: 'grid sm:grid-cols-2 lg:grid-cols-3',
            card: 'bg-[var(--moss)] even:bg-[var(--green)] flex flex-col',
            body: 'p-6 flex flex-col gap-3 flex-1',
            title: 'text-2xl',
            titleStyle: serif,
            price: 'text-sm font-bold uppercase tracking-[0.12em]',
            text: 'text-base leading-relaxed text-[var(--fg-2)]',
            link: 'font-bold underline underline-offset-4',
            btn: 'inline-flex items-center justify-center min-h-[44px] px-5 border-2 border-[var(--fg)] text-xs font-bold uppercase tracking-[0.12em]',
            btnOn: 'inline-flex items-center justify-center min-h-[44px] px-5 bg-[var(--fg)] text-[var(--bg)] border-2 border-[var(--fg)] text-xs font-bold uppercase tracking-[0.12em]',
          }}
        />

        {/* Más fotos: tira de baldosas */}
        {general.length > 3 && (
          <section className={`pt-10 sm:pt-14 grid grid-cols-2 ${['', 'sm:grid-cols-1', 'sm:grid-cols-2', 'sm:grid-cols-3'][general.length - 3] || 'sm:grid-cols-4'}`}>
            {general.slice(3).map((p, i) => (
              <button key={p.id} type="button" onClick={open(i + 3)} className="relative aspect-square overflow-hidden cursor-pointer">
                <img src={p.data} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover hover:scale-[1.04] transition-transform duration-700" />
              </button>
            ))}
          </section>
        )}

        {/* Contacto: tres baldosas */}
        <footer className="pt-10 sm:pt-14 grid sm:grid-cols-3">
          <div className={`${tile} bg-[var(--sand)] p-6 sm:p-8 flex flex-col justify-end gap-3`}>
            <h2 style={serif} className="text-3xl text-white">
              {t.contactTitle}
            </h2>
            {b.generalLink && (
              <a href={b.generalLink} target="_blank" rel="noopener noreferrer" className={`${btn} self-start whitespace-nowrap px-5`}>
                {t.askGeneral}
              </a>
            )}
          </div>
          <div className={`${tile} bg-[var(--moss)] p-6 sm:p-8 flex flex-col justify-end gap-3`}>
            <p className="text-sm font-bold uppercase tracking-[0.14em]">{t.where}</p>
            {(site.address || site.city) && <p className="text-lg">{[site.address, site.city].filter(Boolean).join(', ')}</p>}
            {site.mapsUrl && (
              <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold underline underline-offset-4">
                {t.map} <ArrowRight className="w-4 h-4" />
              </a>
            )}
          </div>
          {general[general.length - 1] && general.length > 1 ? (
            <div className={`${tile} flex flex-col justify-end p-6 sm:p-8`}>
              <img src={general[general.length - 1].data} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/55" />
              <p className="relative text-sm font-bold text-white">{t.direct}</p>
              <a href="https://loomisuite.net" target="_blank" rel="noopener" className="relative mt-1 text-sm font-bold text-white underline underline-offset-4">
                {t.madeWith}
              </a>
            </div>
          ) : (
            <div className={`${tile} bg-[var(--green)] flex flex-col justify-end p-6 sm:p-8`}>
              <p className="text-sm font-bold">{t.direct}</p>
              <a href="https://loomisuite.net" target="_blank" rel="noopener" className="mt-1 text-sm font-bold underline underline-offset-4">
                {t.madeWith}
              </a>
            </div>
          )}
        </footer>
      </div>

      <BookBar b={b} className="w-full sm:w-auto min-h-[56px] px-10 bg-[var(--fg)] text-[var(--bg)] text-sm font-bold uppercase tracking-[0.16em] shadow-[0_-4px_20px_rgba(0,0,0,0.3)] sm:shadow-xl" />

      {b.lightbox && <Lightbox list={b.lightbox.list} index={b.lightbox.index} onClose={() => setLightbox(null)} closeLabel={t.close} />}
    </div>
  );
};

/** Una unidad: arriba la foto con su nombre, abajo el bloque de color con los datos */
const UnitTile: React.FC<{
  unit: PublicSiteUnit;
  photos: PublicSitePhoto[];
  tone: 'sand' | 'moss';
  t: SiteTexts;
  onOpen: (index: number) => void;
  children: React.ReactNode;
}> = ({ unit, photos, tone, t, onOpen, children }) => (
  <article className="flex flex-col">
    <button type="button" onClick={() => photos[0] && onOpen(0)} className="relative aspect-[4/3] overflow-hidden bg-[var(--green)] cursor-pointer">
      {photos[0] && <img src={photos[0].data} alt={unit.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover hover:scale-[1.04] transition-transform duration-700" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <h3 style={serif} className="absolute left-6 right-6 bottom-5 text-3xl text-white text-left">
        {unit.name}
      </h3>
    </button>
    <div className={`${tone === 'sand' ? 'bg-[var(--sand)]' : 'bg-[var(--moss)]'} p-6 flex-1 flex flex-col gap-3`}>
      <p className="text-sm font-bold uppercase tracking-[0.12em]">
        {[unit.maxGuests > 0 ? t.upTo(unit.maxGuests) : '', unit.bedrooms > 0 ? t.bedrooms(unit.bedrooms) : ''].filter(Boolean).join(' · ')}
      </p>
      {unit.description && <p className="text-base leading-relaxed whitespace-pre-line">{unit.description}</p>}
      {photos.length > 1 && (
        <button type="button" onClick={() => onOpen(1)} className="self-start text-sm font-semibold underline underline-offset-4 cursor-pointer">
          {t.gallery} ({photos.length})
        </button>
      )}
      <div className="mt-auto pt-1">{children}</div>
    </div>
  </article>
);
