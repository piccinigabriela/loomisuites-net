/**
 * Calma (diseño especial): crema y tonos madera, títulos en una romana fina en mayúsculas,
 * portada con el texto a la izquierda y la foto fundida a la derecha, filas numeradas que alternan
 * foto y texto, las unidades en una grilla de tarjetas y una franja con foto para el contacto.
 */
import React from 'react';
import { MapPin, Clock } from 'lucide-react';
import type { PublicSitePhoto, PublicSiteUnit } from '../../../lib/publicSite';
import { fmtDate, fmtMoney, LangSwitch, Lightbox, SearchForm, SiteTexts, SiteViewProps, useGoogleFont, useSiteBooking, waLink } from '../siteKit';

const VARS = {
  '--bg': '#F5F1EA',
  '--surface': '#ECE5DA',
  '--card': '#FBF9F5',
  '--line': '#CFC4B4',
  '--fg': '#1F1B16',
  '--fg-2': '#3B342B',
  '--wood': '#3A2F23',
} as React.CSSProperties;

const roman: React.CSSProperties = { fontFamily: "'Marcellus', 'Cormorant Garamond', Georgia, serif", fontWeight: 400 };

const pillDark =
  'inline-flex items-center justify-center gap-2 min-h-[48px] px-7 rounded-full bg-[var(--wood)] text-white text-sm font-semibold uppercase tracking-[0.12em] hover:brightness-125 transition cursor-pointer';
const pillLine =
  'inline-flex items-center justify-center gap-2 min-h-[46px] px-7 rounded-full border border-[var(--fg)] text-[var(--fg)] text-sm font-semibold uppercase tracking-[0.12em] hover:bg-[var(--fg)] hover:text-[var(--bg)] transition cursor-pointer';

/** Fila numerada: foto de un lado y texto del otro (alterna) */
const Row: React.FC<{ n: number; title: string; photo?: PublicSitePhoto; flip?: boolean; onOpen?: () => void; children: React.ReactNode }> = ({
  n,
  title,
  photo,
  flip,
  onOpen,
  children,
}) => (
  <div className="grid gap-8 sm:gap-14 sm:grid-cols-2 items-center">
    {photo && (
      <button type="button" onClick={onOpen} className={`block overflow-hidden aspect-[4/3] cursor-pointer ${flip ? 'sm:order-2' : ''}`}>
        <img src={photo.data} alt="" loading="lazy" className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700" />
      </button>
    )}
    <div className={`space-y-4 ${photo ? '' : 'sm:col-span-2 max-w-2xl'}`}>
      <p style={roman} className="text-4xl sm:text-5xl tabular-nums">
        {String(n).padStart(2, '0')}
      </p>
      <h2 style={roman} className="text-2xl sm:text-3xl uppercase tracking-[0.06em]">
        {title}
      </h2>
      <div className="text-base sm:text-lg leading-relaxed text-[var(--fg-2)]">{children}</div>
    </div>
  </div>
);

export const CalmaSite: React.FC<SiteViewProps> = ({ site, photos, preview }) => {
  const b = useSiteBooking(site, photos, preview);
  const { t, lang, results, searched, general, cover, unitPhotos, setLightbox } = b;
  useGoogleFont('loomi-font-marcellus', 'https://fonts.googleapis.com/css2?family=Marcellus&display=swap');

  const open = (i: number) => () => setLightbox({ list: general, index: i });
  const band = cover;
  const extra = general.slice(4);
  const extraCols = ['', 'sm:grid-cols-1', 'sm:grid-cols-2', 'sm:grid-cols-3'][extra.length] || 'sm:grid-cols-4';
  const unitList: Array<{ unit: PublicSiteUnit; total?: number; below?: boolean; minNights?: number }> = results
    ? results.free
    : site.units.map((unit) => ({ unit }));
  let n = 0;

  return (
    <div style={VARS} className="relative min-h-screen bg-[var(--bg)] text-[var(--fg)] font-sans antialiased">
      {/* Portada */}
      <header className="relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between gap-4 px-5 sm:px-10 py-5">
          <span style={roman} className="text-base sm:text-lg uppercase tracking-[0.18em] truncate">
            {site.name}
          </span>
          <LangSwitch b={b} className="flex gap-0.5 rounded-full bg-[var(--bg)]/85 backdrop-blur border border-[var(--line)] p-0.5" activeCls="bg-[var(--wood)] text-white" idleCls="text-[var(--fg)]" />
        </div>
        <div className="sm:min-h-[88vh] sm:grid sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {cover && (
            <div className="relative h-[52vh] sm:h-auto sm:order-2">
              <img src={cover.data} alt={site.name} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-[var(--bg)] via-[var(--bg)]/10 to-transparent sm:via-transparent" />
            </div>
          )}
          <div className="relative z-10 px-6 sm:pl-12 lg:pl-20 sm:pr-4 pb-12 pt-4 sm:pt-32 flex flex-col justify-center gap-6">
            <h1 style={roman} className="text-[clamp(2.4rem,6vw,4.75rem)] uppercase leading-[1.04] tracking-[0.02em] text-balance">
              {site.name}
            </h1>
            <span className="block w-14 h-px bg-[var(--fg)]" />
            {site.tagline && <p className="text-lg sm:text-xl leading-relaxed text-[var(--fg-2)] max-w-md">{site.tagline}</p>}
            {site.city && (
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em]">
                <MapPin className="w-4 h-4" /> {site.city}
              </p>
            )}
            <div className="hidden sm:block">
              <button type="button" onClick={b.goSearch} className={pillLine}>
                {t.search}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 sm:px-10">
        {/* Buscador */}
        <div ref={b.searchRef} className="mt-6 sm:mt-10 rounded-[28px] bg-[var(--card)] border border-[var(--line)] p-5 sm:p-7 scroll-mt-8">
          <SearchForm
            b={b}
            colorScheme="light"
            formCls="grid grid-cols-2 sm:grid-cols-[1fr_1fr_auto_auto] gap-x-4 gap-y-4 items-end"
            labelCls="text-xs font-bold uppercase tracking-[0.14em]"
            fieldCls="rounded-full bg-[var(--bg)] border border-[var(--line)] text-[var(--fg)]"
            stepBtnCls="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--surface)] cursor-pointer"
            submitCls={pillDark}
            errorCls="text-sm font-bold text-[#8A2E12]"
          />
        </div>

        {/* El lugar */}
        {site.description && (
          <section className="pt-20 sm:pt-28">
            <Row n={++n} title={t.place} photo={general[1]} onOpen={open(1)}>
              <p className="whitespace-pre-line">{site.description}</p>
            </Row>
          </section>
        )}
      </main>

      {/* Alojamientos o resultados */}
      <section ref={b.resultsRef} className="mt-20 sm:mt-28 bg-[var(--surface)] py-16 sm:py-24 scroll-mt-4">
        <div className="max-w-6xl mx-auto px-5 sm:px-10">
          <div className="text-center mb-10 sm:mb-14">
            <h2 style={roman} className="text-3xl sm:text-4xl uppercase tracking-[0.08em]">
              {results ? (results.free.length ? t.available : t.noneTitle) : t.stays}
            </h2>
            {results && searched && (
              <p className="mt-3 text-base font-semibold text-[var(--fg-2)]">
                {fmtDate(searched.in, lang)} → {fmtDate(searched.out, lang)} · {t.nights(results.n)} · {t.msgGuests(searched.guests).slice(2)}
              </p>
            )}
          </div>
          {results && results.free.length === 0 ? (
            <div className="max-w-lg mx-auto text-center space-y-6">
              <p className="text-lg text-[var(--fg-2)]">{t.none}</p>
              {b.generalLink && (
                <a href={b.generalLink} target="_blank" rel="noopener noreferrer" className={pillDark}>
                  {t.askGeneral}
                </a>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {unitList.map(({ unit, total, below, minNights }) => (
                <UnitCard key={unit.id} unit={unit} photos={unitPhotos(unit.id)} t={t} onOpen={(i) => setLightbox({ list: unitPhotos(unit.id), index: i })}>
                  {results ? (
                    <div className="space-y-3 w-full">
                      {below ? (
                        <p className="text-base font-semibold">{t.minNights(minNights || 0)}</p>
                      ) : total && total > 0 ? (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.14em]">
                            {t.total} · {t.nights(results.n)}
                          </p>
                          <p style={roman} className="text-3xl tabular-nums mt-1">
                            {fmtMoney(total, site.currency)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-base font-semibold">{t.askPrice}</p>
                      )}
                      {site.whatsapp && (
                        <a href={waLink(site.whatsapp, b.requestText(unit, below ? 0 : total || 0))} target="_blank" rel="noopener noreferrer" className={`${pillDark} w-full`}>
                          {below ? t.askGeneral : t.ask}
                        </a>
                      )}
                    </div>
                  ) : (
                    <button type="button" onClick={b.goSearch} className={`${pillLine} w-full`}>
                      {t.chooseDates}
                    </button>
                  )}
                </UnitCard>
              ))}
            </div>
          )}
          {results && results.free.length > 0 && <p className="mt-10 text-center text-sm font-medium text-[var(--fg-2)]">{t.confirmNote}</p>}
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-5 sm:px-10 pt-20 sm:pt-28 space-y-20 sm:space-y-28">
        {(site.checkinHour || site.checkoutHour) && (
          <Row n={++n} title={t.hours} photo={general[2]} flip onOpen={open(2)}>
            <div className="space-y-2">
              {site.checkinHour && (
                <p className="flex items-center gap-2">
                  <Clock className="w-5 h-5 shrink-0" /> <span className="font-bold text-[var(--fg)]">{t.checkin}</span> {site.checkinHour}
                </p>
              )}
              {site.checkoutHour && (
                <p className="flex items-center gap-2">
                  <Clock className="w-5 h-5 shrink-0" /> <span className="font-bold text-[var(--fg)]">{t.checkout}</span> {site.checkoutHour}
                </p>
              )}
            </div>
          </Row>
        )}
        {(site.address || site.city) && (
          <Row n={++n} title={t.where} photo={general[3]} onOpen={open(3)}>
            <p className="flex items-start gap-2">
              <MapPin className="w-5 h-5 shrink-0 mt-1" /> {[site.address, site.city].filter(Boolean).join(' · ')}
            </p>
            {site.mapsUrl && (
              <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className={`${pillLine} mt-5`}>
                {t.map}
              </a>
            )}
          </Row>
        )}
        {extra.length > 0 && (
          <div className={`grid grid-cols-2 ${extraCols} gap-3 sm:gap-4`}>
            {extra.map((p, i) => (
              <button key={p.id} type="button" onClick={open(i + 4)} className={`overflow-hidden cursor-pointer ${extra.length < 3 ? 'aspect-[4/3]' : 'aspect-square'}`}>
                <img src={p.data} alt="" loading="lazy" className="w-full h-full object-cover hover:scale-[1.04] transition-transform duration-700" />
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Franja de contacto */}
      <section className="relative mt-20 sm:mt-28 min-h-[420px] sm:min-h-[480px] flex items-center overflow-hidden bg-[var(--wood)]">
        {band && <img src={band.data} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
        <div className="relative max-w-6xl w-full mx-auto px-6 sm:px-10 py-16 text-white space-y-5">
          <h2 style={roman} className="text-3xl sm:text-5xl uppercase leading-tight tracking-[0.04em] max-w-lg">
            {t.contact}
          </h2>
          <p className="text-lg font-medium max-w-md">{t.direct}</p>
          {b.generalLink && (
            <a
              href={b.generalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center min-h-[48px] px-7 rounded-full border border-white text-white text-sm font-semibold uppercase tracking-[0.12em] hover:bg-white hover:text-[var(--wood)] transition"
            >
              {t.askGeneral}
            </a>
          )}
        </div>
      </section>

      <footer className="px-5 py-10 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-6xl mx-auto text-sm font-semibold">
        <span style={roman} className="text-base uppercase tracking-[0.16em]">
          {site.name}
        </span>
        <a href="https://loomisuite.net" target="_blank" rel="noopener" className="underline underline-offset-4">
          {t.madeWith}
        </a>
      </footer>

      {b.lightbox && <Lightbox list={b.lightbox.list} index={b.lightbox.index} onClose={() => setLightbox(null)} closeLabel={t.close} />}
    </div>
  );
};

const UnitCard: React.FC<{
  unit: PublicSiteUnit;
  photos: PublicSitePhoto[];
  t: SiteTexts;
  onOpen: (index: number) => void;
  children: React.ReactNode;
}> = ({ unit, photos, t, onOpen, children }) => (
  <article className="bg-[var(--card)] flex flex-col">
    {photos[0] ? (
      <button type="button" onClick={() => onOpen(0)} className="block aspect-[4/3] overflow-hidden cursor-pointer">
        <img src={photos[0].data} alt={unit.name} loading="lazy" className="w-full h-full object-cover hover:scale-[1.04] transition-transform duration-700" />
      </button>
    ) : null}
    <div className="p-6 flex flex-col items-center text-center gap-3 flex-1">
      <h3 style={roman} className="text-xl sm:text-2xl uppercase tracking-[0.08em]">
        {unit.name}
      </h3>
      <p className="text-sm font-semibold text-[var(--fg-2)]">
        {[unit.maxGuests > 0 ? t.upTo(unit.maxGuests) : '', unit.bedrooms > 0 ? t.bedrooms(unit.bedrooms) : ''].filter(Boolean).join(' · ')}
      </p>
      {unit.description && <p className="text-base leading-relaxed text-[var(--fg-2)] whitespace-pre-line">{unit.description}</p>}
      {photos.length > 1 && (
        <button type="button" onClick={() => onOpen(1)} className="text-sm font-semibold underline underline-offset-4 cursor-pointer">
          {t.gallery} ({photos.length})
        </button>
      )}
      <div className="mt-auto pt-3 w-full flex justify-center">{children}</div>
    </div>
  </article>
);
