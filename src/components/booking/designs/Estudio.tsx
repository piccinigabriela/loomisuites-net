/**
 * Estudio (diseño especial): crema y negro, nombre con una palabra en cursiva y el resto en mayúsculas,
 * secciones numeradas 01, 02, 03, cifras del complejo y cierre oscuro con los contactos.
 * Pensado para departamentos en la ciudad, pero sirve para cualquier complejo con estilo moderno.
 */
import React from 'react';
import { ArrowDownRight } from 'lucide-react';
import type { PublicSitePhoto, PublicSiteUnit } from '../../../lib/publicSite';
import { fmtDate, fmtMoney, LangSwitch, Lightbox, SearchForm, SiteTexts, SiteViewProps, useGoogleFont, useSiteBooking, waLink } from '../siteKit';

const VARS = {
  '--bg': '#EDEAE3',
  '--surface': '#F6F4EF',
  '--line': '#1A1A1A',
  '--fg': '#141414',
  '--fg-2': '#2E2D2A',
  '--ink': '#1B1B1B',
} as React.CSSProperties;

const sans: React.CSSProperties = { fontFamily: "'Montserrat', 'Helvetica Neue', Arial, sans-serif" };
const serif: React.CSSProperties = { fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontWeight: 500 };

/** "Corte delle Vette" → la primera palabra en cursiva y el resto en mayúsculas */
const SplitName: React.FC<{ text: string; big?: boolean }> = ({ text, big }) => {
  const [first, ...rest] = (text || '').trim().split(/\s+/);
  if (!rest.length) {
    return <span style={sans} className="uppercase font-medium tracking-[-0.01em]">{first}</span>;
  }
  return (
    <>
      <span style={serif} className={`block normal-case ${big ? 'text-[0.62em] leading-none mb-1' : 'text-[0.9em] leading-tight'}`}>
        {first}
      </span>
      <span style={sans} className="block uppercase font-medium tracking-[-0.01em]">
        {rest.join(' ')}
      </span>
    </>
  );
};

const SectionHead: React.FC<{ n: number; title: string; id?: string }> = ({ n, title, id }) => (
  <div id={id} className="flex items-baseline justify-between gap-4 border-b border-[var(--line)] pb-3 mb-8 scroll-mt-6">
    <h2 style={sans} className="text-xl sm:text-2xl font-medium uppercase tracking-[0.02em]">
      {title}
    </h2>
    <span style={sans} className="text-xl sm:text-2xl font-medium tabular-nums">
      {String(n).padStart(2, '0')}
    </span>
  </div>
);

export const EstudioSite: React.FC<SiteViewProps> = ({ site, photos, preview }) => {
  const b = useSiteBooking(site, photos, preview);
  const { t, lang, results, searched, general, cover, unitPhotos, setLightbox } = b;
  useGoogleFont(
    'loomi-font-estudio',
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,400;1,500&family=Montserrat:wght@400;500;600&display=swap'
  );

  const initials = site.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((w) => w[0]?.toUpperCase())
    .join('.');
  const gallery = general.slice(1);
  const unitList: Array<{ unit: PublicSiteUnit; total?: number; below?: boolean; minNights?: number }> = results
    ? results.free
    : site.units.map((unit) => ({ unit }));
  const stats = [
    site.units.length ? { n: String(site.units.length), label: t.statUnits(site.units.length) } : null,
    b.maxCapacity > 1 ? { n: String(b.maxCapacity), label: t.statGuests } : null,
    site.checkinHour ? { n: site.checkinHour, label: t.statIn } : null,
    site.checkoutHour ? { n: site.checkoutHour, label: t.statOut } : null,
  ].filter(Boolean) as Array<{ n: string; label: string }>;

  const btnDark =
    'inline-flex items-center justify-center gap-2 min-h-[50px] px-6 bg-[var(--ink)] text-white text-sm font-semibold uppercase tracking-[0.08em] hover:bg-black transition cursor-pointer';
  let sec = 0;

  return (
    <div style={{ ...VARS, ...sans }} className="relative min-h-screen bg-[var(--bg)] text-[var(--fg)] antialiased">
      <div className="max-w-6xl mx-auto px-5 sm:px-10">
        {/* Barra de arriba */}
        <div className="flex items-center justify-between gap-4 pt-5 pb-4 text-xs font-semibold uppercase tracking-[0.06em]">
          <span>{initials}</span>
          {site.city && <span className="hidden sm:block truncate">{site.city}</span>}
          <LangSwitch b={b} className="flex gap-0.5 border border-[var(--line)] rounded-full p-0.5" activeCls="bg-[var(--ink)] text-white" idleCls="text-[var(--fg)]" />
        </div>

        {/* Portada */}
        <header className="pt-16 sm:pt-24 pb-12 sm:pb-16 text-center">
          <h1 className="text-[clamp(2.6rem,11vw,7.5rem)] leading-[0.95] text-balance">
            <SplitName text={site.name} big />
          </h1>
          {site.tagline && <p className="mt-6 mx-auto max-w-md text-sm sm:text-base font-medium uppercase tracking-[0.06em] text-[var(--fg-2)]">{site.tagline}</p>}
        </header>
      </div>

      {cover && (
        <button type="button" onClick={() => setLightbox({ list: general.length ? general : [cover], index: 0 })} className="block w-full max-w-6xl mx-auto sm:px-10 cursor-pointer">
          <img src={cover.data} alt={site.name} className="w-full aspect-[4/3] sm:aspect-[21/9] object-cover" />
        </button>
      )}

      <div className="max-w-6xl mx-auto px-5 sm:px-10">
        {/* Buscador */}
        <div ref={b.searchRef} className="-mt-px bg-[var(--ink)] text-white p-5 sm:p-7 scroll-mt-6">
          <SearchForm
            b={b}
            colorScheme="dark"
            formCls="grid grid-cols-2 sm:grid-cols-[1fr_1fr_auto_auto] gap-x-4 gap-y-4 items-end"
            labelCls="text-xs font-semibold uppercase tracking-[0.08em]"
            fieldCls="bg-transparent border border-white/70 text-white"
            stepBtnCls="w-10 h-10 flex items-center justify-center hover:bg-white/15 cursor-pointer"
            submitCls="inline-flex items-center justify-center min-h-[48px] px-6 bg-[var(--bg)] text-[var(--ink)] text-sm font-semibold uppercase tracking-[0.08em] hover:bg-white transition cursor-pointer"
            errorCls="text-sm font-semibold text-[#FFD7A8]"
          />
        </div>

        {/* El lugar */}
        {(site.description || stats.length > 0) && (
          <section className="pt-20 sm:pt-28">
            <SectionHead n={++sec} title={t.place} />
            <div className="grid gap-10 sm:grid-cols-2 sm:gap-16">
              {site.description && <p className="text-lg sm:text-xl leading-relaxed text-[var(--fg-2)] whitespace-pre-line">{site.description}</p>}
              {stats.length > 0 && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-8 content-start">
                  {stats.map((s) => (
                    <div key={s.label} className="border-t border-[var(--line)] pt-3">
                      <p className="text-4xl sm:text-5xl font-medium tabular-nums tracking-[-0.02em]">{s.n}</p>
                      <p className="mt-2 text-sm font-medium text-[var(--fg-2)]">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Alojamientos o resultados */}
        <section ref={b.resultsRef} className="pt-20 sm:pt-28 scroll-mt-6">
          <SectionHead n={++sec} title={results ? (results.free.length ? t.available : t.noneTitle) : t.stays} />
          {results && searched && (
            <p className="-mt-4 mb-8 text-base font-semibold text-[var(--fg-2)]">
              {fmtDate(searched.in, lang)} → {fmtDate(searched.out, lang)} · {t.nights(results.n)} · {t.msgGuests(searched.guests).slice(2)}
            </p>
          )}
          {!results && site.units.length > 1 && (
            <ul className="mb-14 border-t border-[var(--line)]">
              {site.units.map((u) => (
                <li key={u.id} className="border-b border-[var(--line)]">
                  <a href={`#u-${u.id}`} className="flex items-center justify-between gap-4 py-4 text-base sm:text-lg font-medium hover:pl-2 transition-all">
                    <span>{u.name}</span>
                    <ArrowDownRight className="w-5 h-5 shrink-0" />
                  </a>
                </li>
              ))}
            </ul>
          )}

          {results && results.free.length === 0 ? (
            <div className="space-y-6">
              <p className="text-lg text-[var(--fg-2)]">{t.none}</p>
              {b.generalLink && (
                <a href={b.generalLink} target="_blank" rel="noopener noreferrer" className={btnDark}>
                  {t.askGeneral}
                </a>
              )}
            </div>
          ) : (
            <div className="grid gap-16 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-20">
              {unitList.map(({ unit, total, below, minNights }, i) => (
                <UnitBlock key={unit.id} n={i + 1} unit={unit} photos={unitPhotos(unit.id)} t={t} onOpen={(idx) => setLightbox({ list: unitPhotos(unit.id), index: idx })}>
                  {results ? (
                    <div className="space-y-4 pt-2">
                      {below ? (
                        <p className="text-base font-semibold">{t.minNights(minNights || 0)}</p>
                      ) : total && total > 0 ? (
                        <p className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-[var(--line)] pt-3">
                          <span className="text-sm font-semibold uppercase tracking-[0.06em]">
                            {t.total} · {t.nights(results.n)}
                          </span>
                          <span className="text-3xl font-medium tabular-nums">{fmtMoney(total, site.currency)}</span>
                        </p>
                      ) : (
                        <p className="text-base font-semibold">{t.askPrice}</p>
                      )}
                      {site.whatsapp && (
                        <a href={waLink(site.whatsapp, b.requestText(unit, below ? 0 : total || 0))} target="_blank" rel="noopener noreferrer" className={`${btnDark} w-full`}>
                          {below ? t.askGeneral : t.ask}
                        </a>
                      )}
                    </div>
                  ) : (
                    <button type="button" onClick={b.goSearch} className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.06em] underline underline-offset-[6px] decoration-2 cursor-pointer">
                      {t.chooseDates} <ArrowDownRight className="w-4 h-4" />
                    </button>
                  )}
                </UnitBlock>
              ))}
            </div>
          )}
          {results && results.free.length > 0 && <p className="mt-12 text-sm font-medium text-[var(--fg-2)]">{t.confirmNote}</p>}
        </section>

        {/* Fotos */}
        {gallery.length > 0 && (
          <section className="pt-20 sm:pt-28">
            <SectionHead n={++sec} title={t.gallery} />
            <div className="grid grid-cols-2 sm:grid-cols-3 sm:auto-rows-[clamp(160px,18vw,250px)] gap-2 sm:gap-4">
              {gallery.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setLightbox({ list: general, index: i + 1 })}
                  className={`overflow-hidden cursor-pointer ${i === 0 ? 'col-span-2 aspect-[16/10] sm:row-span-2' : 'aspect-square'} sm:aspect-auto`}
                >
                  <img src={p.data} alt="" loading="lazy" className="w-full h-full object-cover grayscale-[15%] hover:grayscale-0 hover:scale-[1.03] transition duration-700" />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Contacto */}
      <footer className="mt-24 sm:mt-32 bg-[var(--ink)] text-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-10 py-16 sm:py-20 grid gap-12 sm:grid-cols-2">
          <div className="space-y-5">
            <h2 className="text-4xl sm:text-5xl leading-[0.95]">
              <SplitName text={site.name} />
            </h2>
            {(site.address || site.city) && <p className="text-base font-medium">{[site.address, site.city].filter(Boolean).join(' · ')}</p>}
            {(site.checkinHour || site.checkoutHour) && (
              <p className="text-base font-medium">
                {site.checkinHour && `${t.checkin} ${site.checkinHour}`}
                {site.checkinHour && site.checkoutHour && ' · '}
                {site.checkoutHour && `${t.checkout} ${site.checkoutHour}`}
              </p>
            )}
          </div>
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.08em]">{t.contactTitle}</p>
            <ul className="border-t border-white/60">
              {b.generalLink && (
                <li className="border-b border-white/60">
                  <a href={b.generalLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-4 py-4 text-lg font-medium">
                    {t.askGeneral} <ArrowDownRight className="w-5 h-5 -rotate-90" />
                  </a>
                </li>
              )}
              {site.mapsUrl && (
                <li className="border-b border-white/60">
                  <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-4 py-4 text-lg font-medium">
                    {t.map} <ArrowDownRight className="w-5 h-5 -rotate-90" />
                  </a>
                </li>
              )}
              <li className="border-b border-white/60">
                <button type="button" onClick={b.goSearch} className="w-full flex items-center justify-between gap-4 py-4 text-lg font-medium cursor-pointer">
                  {t.search} <ArrowDownRight className="w-5 h-5 -rotate-90" />
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-5 sm:px-10 pb-10 flex flex-wrap justify-between gap-3 text-sm font-semibold">
          <span>{t.direct}</span>
          <a href="https://loomisuite.net" target="_blank" rel="noopener" className="underline underline-offset-4">
            {t.madeWith}
          </a>
        </div>
      </footer>

      {b.lightbox && <Lightbox list={b.lightbox.list} index={b.lightbox.index} onClose={() => setLightbox(null)} closeLabel={t.close} />}
    </div>
  );
};

const UnitBlock: React.FC<{
  n: number;
  unit: PublicSiteUnit;
  photos: PublicSitePhoto[];
  t: SiteTexts;
  onOpen: (index: number) => void;
  children: React.ReactNode;
}> = ({ n, unit, photos, t, onOpen, children }) => (
  <article id={`u-${unit.id}`} className="flex flex-col gap-4 scroll-mt-6">
    <p className="text-sm font-semibold tabular-nums">{String(n).padStart(2, '0')}</p>
    <h3 className="text-3xl sm:text-4xl leading-[1.02]">
      <SplitName text={unit.name} />
    </h3>
    {photos[0] ? (
      <button type="button" onClick={() => onOpen(0)} className="block w-full aspect-[4/3] overflow-hidden cursor-pointer">
        <img src={photos[0].data} alt={unit.name} loading="lazy" className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700" />
      </button>
    ) : null}
    <p className="text-sm font-semibold uppercase tracking-[0.06em]">
      {[unit.maxGuests > 0 ? t.upTo(unit.maxGuests) : '', unit.bedrooms > 0 ? t.bedrooms(unit.bedrooms) : ''].filter(Boolean).join(' · ')}
      {photos.length > 1 && (
        <button type="button" onClick={() => onOpen(1)} className="block mt-1 sm:inline sm:mt-0 sm:ml-3 underline underline-offset-4 cursor-pointer">
          {t.gallery} ({photos.length})
        </button>
      )}
    </p>
    {unit.description && <p className="text-base leading-relaxed text-[var(--fg-2)] whitespace-pre-line">{unit.description}</p>}
    <div className="mt-auto">{children}</div>
  </article>
);
