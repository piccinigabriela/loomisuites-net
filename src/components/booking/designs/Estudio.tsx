/**
 * Estudio (diseño especial, oscuro): gris pizarra y verde salvia, el nombre con letras separadas,
 * la foto de portada enmarcada con las secciones arriba, y todo armado en paneles que mezclan
 * fotos, bloques de color, las cifras reales del complejo y un dibujo de líneas.
 */
import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { PublicSitePhoto, PublicSiteUnit } from '../../../lib/publicSite';
import { BookBar, fmtDate, fmtMoney, LangSwitch, Lightbox, SearchForm, SiteTexts, SiteViewProps, useGoogleFont, useSiteBooking, waLink } from '../siteKit';

const VARS = {
  '--bg': '#172123',
  '--panel': '#202D2F',
  '--panel-2': '#2A3A3B',
  '--sage': '#4E625E',
  '--line': '#3C4E4E',
  '--fg': '#EEF1EC',
  '--fg-2': '#D4DAD3',
  '--light': '#E6EBE4',
} as React.CSSProperties;

const thin: React.CSSProperties = { fontFamily: "'Questrial', 'Avenir Next', system-ui, sans-serif", fontWeight: 400 };

/** "Corte delle Vette" → C·O·R·T·E  D·E·L·L·E  V·E·T·T·E (si es corto); si es largo, letras espaciadas */
function spaced(name: string): string {
  const clean = (name || '').trim().toUpperCase();
  if (clean.replace(/\s/g, '').length <= 9) return clean.split(' ').map((w) => w.split('').join('·')).join('  ');
  return clean;
}

/** Dibujo de líneas (círculos y rayos), como bordado, para los paneles de color */
const Ornament: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="0.8" className={className} aria-hidden="true">
    {[18, 34, 50, 66, 82, 96].map((r) => (
      <circle key={r} cx="100" cy="100" r={r} />
    ))}
    {Array.from({ length: 24 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2;
      return <line key={i} x1={100 + Math.cos(a) * 18} y1={100 + Math.sin(a) * 18} x2={100 + Math.cos(a) * 96} y2={100 + Math.sin(a) * 96} />;
    })}
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return <circle key={`p${i}`} cx={100 + Math.cos(a) * 58} cy={100 + Math.sin(a) * 58} r="8" />;
    })}
  </svg>
);

export const EstudioSite: React.FC<SiteViewProps> = ({ site, photos, preview }) => {
  const b = useSiteBooking(site, photos, preview);
  const { t, lang, results, searched, general, cover, unitPhotos, setLightbox } = b;
  useGoogleFont('loomi-font-questrial', 'https://fonts.googleapis.com/css2?family=Questrial&display=swap');

  const banner = general[1];
  const gallery = general.slice(2);
  const unitList: Array<{ unit: PublicSiteUnit; total?: number; below?: boolean; minNights?: number }> = results
    ? results.free
    : site.units.map((unit) => ({ unit }));
  const stats = [
    site.units.length ? { n: String(site.units.length), label: t.statUnits(site.units.length) } : null,
    b.maxCapacity > 1 ? { n: String(b.maxCapacity), label: t.statGuests } : null,
    site.checkinHour ? { n: site.checkinHour, label: t.statIn } : null,
  ].filter(Boolean) as Array<{ n: string; label: string }>;
  const nav: Array<[string, string]> = [
    [t.place, 'e-lugar'],
    [t.stays, 'e-aloj'],
    [t.gallery, 'e-fotos'],
    [t.contactTitle, 'e-contacto'],
  ];
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const btnLight =
    'inline-flex items-center justify-center gap-2 min-h-[50px] px-6 bg-[var(--light)] text-[#172123] text-sm font-bold uppercase tracking-[0.12em] hover:bg-white transition cursor-pointer';

  return (
    <div style={VARS} className="relative min-h-screen bg-[var(--bg)] text-[var(--fg)] font-sans antialiased">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        {/* Línea de arriba: nombre ——— ciudad */}
        <div className="flex items-center gap-4 pt-5 pb-5 text-sm font-semibold">
          <span style={thin} className="truncate text-base">
            {site.name}
          </span>
          <span className="flex-1 h-px bg-[var(--fg)]/40 min-w-[24px]" />
          <span className="hidden sm:block truncate">{site.city}</span>
          <LangSwitch b={b} className="flex gap-0.5 border border-[var(--fg)]/50 p-0.5" activeCls="bg-[var(--light)] text-[#172123] rounded-none!" idleCls="text-[var(--fg)] rounded-none!" />
        </div>

        {/* Portada enmarcada: secciones arriba, foto con el nombre, buscador abajo */}
        <header className="bg-[var(--panel)]">
          <nav className="grid grid-cols-2 sm:grid-cols-4 text-xs font-bold uppercase tracking-[0.14em]">
            {nav.map(([label, id], i) => (
              <button
                key={id}
                type="button"
                onClick={() => go(id)}
                className={`min-h-[44px] px-3 text-center cursor-pointer hover:bg-[var(--sage)] transition ${['bg-[var(--panel-2)]', 'bg-[var(--panel)]', 'bg-[var(--sage)]', 'bg-[var(--panel-2)]'][i]}`}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="relative h-[62vh] min-h-[380px] max-h-[640px] overflow-hidden">
            {cover && <img src={cover.data} alt={site.name} className="absolute inset-0 w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/35 to-black/55" />
            <div className="relative h-full flex flex-col items-center justify-center text-center px-5">
              <h1 style={thin} className="text-[clamp(1.8rem,6.5vw,4.6rem)] tracking-[0.32em] leading-tight text-balance text-white">
                {spaced(site.name)}
              </h1>
              {site.tagline && <p className="mt-5 max-w-xl text-base sm:text-lg font-medium text-white">{site.tagline}</p>}
            </div>
          </div>
          <div ref={b.searchRef} className="p-4 sm:p-6 scroll-mt-6">
            <SearchForm
              b={b}
              colorScheme="dark"
              formCls="grid grid-cols-2 sm:grid-cols-[1fr_1fr_auto_auto] gap-x-3 gap-y-3 items-end"
              labelCls="text-xs font-bold uppercase tracking-[0.14em]"
              fieldCls="bg-[var(--bg)] border border-[var(--line)] text-[var(--fg)]"
              stepBtnCls="w-10 h-10 flex items-center justify-center hover:bg-[var(--panel-2)] cursor-pointer"
              submitCls={btnLight}
              errorCls="text-sm font-bold text-[#F3C9A8]"
            />
          </div>
        </header>

        {/* El lugar: franja de foto + tres paneles */}
        <section id="e-lugar" className="pt-14 sm:pt-20 scroll-mt-4">
          {banner && (
            <button type="button" onClick={() => setLightbox({ list: general, index: 1 })} className="relative block w-full h-48 sm:h-64 overflow-hidden cursor-pointer">
              <img src={banner.data} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/65 to-black/0" />
              <h2 style={thin} className="absolute left-5 sm:left-8 bottom-5 sm:bottom-8 text-3xl sm:text-5xl text-white text-left">
                {t.place}
              </h2>
            </button>
          )}
          <div className="grid sm:grid-cols-3">
            <div className="bg-[var(--panel)] p-6 sm:p-8 space-y-4">
              {!banner && (
                <h2 style={thin} className="text-3xl">
                  {t.place}
                </h2>
              )}
              {site.description && <p className="text-base leading-relaxed text-[var(--fg-2)] whitespace-pre-line">{site.description}</p>}
            </div>
            <div className="bg-[var(--panel)] sm:border-l border-[var(--line)] p-6 sm:p-8 grid grid-cols-2 sm:grid-cols-1 gap-6 content-start">
              {stats.map((s) => (
                <div key={s.label}>
                  <p style={thin} className="text-4xl sm:text-5xl tabular-nums">
                    {s.n}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--fg-2)]">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="relative bg-[var(--sage)] p-6 sm:p-8 overflow-hidden min-h-[220px] flex flex-col justify-end">
              <Ornament className="absolute -right-10 -top-10 w-64 h-64 text-white/25" />
              {(site.address || site.city) && (
                <p style={thin} className="relative text-2xl sm:text-3xl leading-tight text-white">
                  {[site.address, site.city].filter(Boolean).join(', ')}
                </p>
              )}
              {site.mapsUrl && (
                <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="relative mt-4 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-white underline underline-offset-4">
                  {t.map} <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Alojamientos o resultados */}
        <section id="e-aloj" ref={b.resultsRef} className="pt-14 sm:pt-20 scroll-mt-4">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
            <h2 style={thin} className="text-3xl sm:text-5xl">
              {results ? (results.free.length ? t.available : t.noneTitle) : t.stays}
            </h2>
            {results && searched && (
              <p className="text-base font-semibold text-[var(--fg-2)]">
                {fmtDate(searched.in, lang)} → {fmtDate(searched.out, lang)} · {t.nights(results.n)} · {t.msgGuests(searched.guests).slice(2)}
              </p>
            )}
          </div>
          {results && results.free.length === 0 ? (
            <div className="bg-[var(--panel)] p-6 sm:p-8 space-y-5">
              <p className="text-lg">{t.none}</p>
              {b.generalLink && (
                <a href={b.generalLink} target="_blank" rel="noopener noreferrer" className={btnLight}>
                  {t.askGeneral}
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-px">
              {unitList.map(({ unit, total, below, minNights }, i) => (
                <UnitPanel key={unit.id} unit={unit} photos={unitPhotos(unit.id)} tone={i % 2 ? 'sage' : 'panel'} flip={i % 2 === 1} t={t} onOpen={(idx) => setLightbox({ list: unitPhotos(unit.id), index: idx })}>
                  {results ? (
                    <div className="space-y-3">
                      {below ? (
                        <p className="text-base font-semibold">{t.minNights(minNights || 0)}</p>
                      ) : total && total > 0 ? (
                        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span className="text-xs font-bold uppercase tracking-[0.14em]">
                            {t.total} · {t.nights(results.n)}
                          </span>
                          <span style={thin} className="text-3xl tabular-nums">
                            {fmtMoney(total, site.currency)}
                          </span>
                        </p>
                      ) : (
                        <p className="text-base font-semibold">{t.askPrice}</p>
                      )}
                      {site.whatsapp && (
                        <a href={waLink(site.whatsapp, b.requestText(unit, below ? 0 : total || 0))} target="_blank" rel="noopener noreferrer" className={btnLight}>
                          {below ? t.askGeneral : t.ask}
                        </a>
                      )}
                    </div>
                  ) : (
                    <button type="button" onClick={b.goSearch} className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] border-b-2 border-[var(--fg)] pb-1 cursor-pointer">
                      {t.chooseDates} <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </UnitPanel>
              ))}
            </div>
          )}
          {results && results.free.length > 0 && <p className="mt-6 text-sm font-medium text-[var(--fg-2)]">{t.confirmNote}</p>}
        </section>

        {/* Fotos: baldosas, con un panel de color en el medio */}
        {gallery.length > 0 && (
          <section id="e-fotos" className="pt-14 sm:pt-20 scroll-mt-4">
            <h2 style={thin} className="text-3xl sm:text-5xl mb-6">
              {t.gallery}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-[var(--line)]">
              {gallery.map((p, i) => (
                <React.Fragment key={p.id}>
                  {i === 1 && (
                    <div className="relative bg-[var(--sage)] aspect-square overflow-hidden flex items-end p-5">
                      <Ornament className="absolute inset-0 m-auto w-4/5 h-4/5 text-white/25" />
                      <p style={thin} className="relative text-xl sm:text-2xl text-white">
                        {site.city || site.name}
                      </p>
                    </div>
                  )}
                  <button type="button" onClick={() => setLightbox({ list: general, index: i + 2 })} className="block aspect-square overflow-hidden cursor-pointer">
                    <img src={p.data} alt="" loading="lazy" className="w-full h-full object-cover hover:scale-[1.04] transition-transform duration-700" />
                  </button>
                </React.Fragment>
              ))}
              {/* Relleno para que la grilla no quede con un hueco */}
              <button
                type="button"
                onClick={b.goSearch}
                className={`relative overflow-hidden bg-[var(--light)] text-[#172123] p-5 text-left cursor-pointer hover:bg-white transition ${(gallery.length + 1) % 2 ? 'flex aspect-square' : 'hidden'} ${
                  ['sm:hidden', 'sm:flex sm:col-span-2 sm:aspect-auto', 'sm:flex sm:col-span-1 sm:aspect-square'][(gallery.length + 1) % 3]
                } flex-col justify-end gap-2`}
              >
                <Ornament className="absolute -right-10 -top-10 w-56 h-56 text-[#172123]/15" />
                <span style={thin} className="relative text-2xl sm:text-3xl leading-tight">
                  {t.search}
                </span>
                <ArrowRight className="relative w-6 h-6" />
              </button>
            </div>
          </section>
        )}

        {/* Contacto */}
        <section id="e-contacto" className="pt-14 sm:pt-20 pb-16 scroll-mt-4">
          <div className="grid sm:grid-cols-2">
            <div className="bg-[var(--panel)] p-6 sm:p-10 space-y-4">
              <h2 style={thin} className="text-3xl sm:text-4xl">
                {t.contact}
              </h2>
              {(site.checkinHour || site.checkoutHour) && (
                <p className="text-base font-semibold text-[var(--fg-2)]">
                  {site.checkinHour && `${t.checkin} ${site.checkinHour}`}
                  {site.checkinHour && site.checkoutHour && ' · '}
                  {site.checkoutHour && `${t.checkout} ${site.checkoutHour}`}
                </p>
              )}
              {b.generalLink && (
                <a href={b.generalLink} target="_blank" rel="noopener noreferrer" className={btnLight}>
                  {t.askGeneral}
                </a>
              )}
            </div>
            <div className="relative bg-[var(--panel-2)] p-6 sm:p-10 overflow-hidden flex flex-col justify-end gap-2 min-h-[200px]">
              <Ornament className="absolute -left-12 -bottom-12 w-64 h-64 text-white/15" />
              <p className="relative text-sm font-bold">{t.direct}</p>
              <a href="https://loomisuite.net" target="_blank" rel="noopener" className="relative text-sm font-bold underline underline-offset-4">
                {t.madeWith}
              </a>
            </div>
          </div>
        </section>
      </div>

      <BookBar b={b} className="w-full sm:w-auto min-h-[56px] px-10 bg-[var(--light)] text-[#172123] text-sm font-bold uppercase tracking-[0.16em] shadow-[0_-4px_20px_rgba(0,0,0,0.3)] sm:shadow-xl" />

      {b.lightbox && <Lightbox list={b.lightbox.list} index={b.lightbox.index} onClose={() => setLightbox(null)} closeLabel={t.close} />}
    </div>
  );
};

/** Cada unidad: la foto con su nombre encima y un panel de color con los datos (alternan de lado) */
const UnitPanel: React.FC<{
  unit: PublicSiteUnit;
  photos: PublicSitePhoto[];
  tone: 'panel' | 'sage';
  flip: boolean;
  t: SiteTexts;
  onOpen: (index: number) => void;
  children: React.ReactNode;
}> = ({ unit, photos, tone, flip, t, onOpen, children }) => (
  <article className="grid sm:grid-cols-2">
    <button type="button" onClick={() => photos[0] && onOpen(0)} className={`relative block aspect-[4/3] sm:aspect-auto sm:min-h-[340px] overflow-hidden bg-[var(--panel-2)] cursor-pointer ${flip ? 'sm:order-2' : ''}`}>
      {photos[0] && <img src={photos[0].data} alt={unit.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <h3 style={thin} className="absolute left-5 bottom-5 right-5 text-3xl sm:text-4xl leading-tight text-white text-left">
        {unit.name}
      </h3>
    </button>
    <div className={`${tone === 'sage' ? 'bg-[var(--sage)]' : 'bg-[var(--panel)]'} p-6 sm:p-10 flex flex-col justify-center gap-4 ${flip ? 'sm:order-1' : ''}`}>
      <p className="text-sm font-bold uppercase tracking-[0.12em]">
        {[unit.maxGuests > 0 ? t.upTo(unit.maxGuests) : '', unit.bedrooms > 0 ? t.bedrooms(unit.bedrooms) : ''].filter(Boolean).join(' · ')}
      </p>
      {unit.description && <p className="text-base leading-relaxed text-[var(--fg)] whitespace-pre-line">{unit.description}</p>}
      {photos.length > 1 && (
        <button type="button" onClick={() => onOpen(1)} className="self-start text-sm font-semibold underline underline-offset-4 cursor-pointer">
          {t.gallery} ({photos.length})
        </button>
      )}
      <div className="pt-1">{children}</div>
    </div>
  </article>
);
