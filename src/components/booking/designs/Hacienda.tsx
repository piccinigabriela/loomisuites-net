/**
 * Hacienda (diseño especial): rústico con categoría.
 * Crema y oliva, serif elegante y moderna, sombras de color desplazadas detrás de las fotos,
 * lista de alojamientos con líneas (al elegir uno cambia la foto de al lado) y franja de tres fotos con títulos.
 */
import React, { useState } from 'react';
import { ArrowRight, MapPin, Clock } from 'lucide-react';
import type { PublicSiteUnit } from '../../../lib/publicSite';
import { BookBar, fmtDate, fmtMoney, LangSwitch, Lightbox, SearchForm, SiteViewProps, useGoogleFont, useSiteBooking, waLink } from '../siteKit';

const VARS = {
  '--bg': '#FBF8F2',
  '--cream': '#F2ECE1',
  '--olive': '#8C8565',
  '--olive-dark': '#4F4A36',
  '--line': '#CFC5B2',
  '--fg': '#26231D',
  '--fg-2': '#3E392F',
} as React.CSSProperties;

const serif: React.CSSProperties = { fontFamily: "'Cormorant', 'Cormorant Garamond', Georgia, serif", fontWeight: 600 };

/** Ramito dibujado, como detalle entre secciones */
const Sprig: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 24 48" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className={className} aria-hidden="true">
    <path d="M12 46V6" />
    {[10, 17, 24, 31].map((y) => (
      <React.Fragment key={y}>
        <path d={`M12 ${y + 4}c-4-1-7-4-7-8 4 0 7 3 7 7`} />
        <path d={`M12 ${y + 4}c4-1 7-4 7-8-4 0-7 3-7 7`} />
      </React.Fragment>
    ))}
    <circle cx="12" cy="4" r="2" />
  </svg>
);

/** Foto con un bloque de color desplazado detrás */
const Framed: React.FC<{ src?: string; alt?: string; side?: 'right' | 'left'; className?: string; onClick?: () => void }> = ({
  src,
  alt = '',
  side = 'right',
  className = '',
  onClick,
}) => (
  <div className={`relative ${side === 'right' ? 'mr-4 mb-4 sm:mr-6 sm:mb-6' : 'ml-4 mb-4 sm:ml-6 sm:mb-6'} ${className}`}>
    <div className={`absolute inset-0 bg-[var(--olive)] ${side === 'right' ? 'translate-x-4 translate-y-4 sm:translate-x-6 sm:translate-y-6' : '-translate-x-4 translate-y-4 sm:-translate-x-6 sm:translate-y-6'}`} />
    <button type="button" onClick={onClick} className="relative block w-full h-full overflow-hidden cursor-pointer">
      {src ? <img src={src} alt={alt} loading="lazy" className="w-full h-full object-cover" /> : <span className="block w-full h-full bg-[var(--cream)]" />}
    </button>
  </div>
);

export const HaciendaSite: React.FC<SiteViewProps> = ({ site, photos, preview }) => {
  const b = useSiteBooking(site, photos, preview);
  const { t, lang, results, searched, general, cover, unitPhotos, setLightbox } = b;
  useGoogleFont('loomi-font-cormorant', 'https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,500;0,600;1,500&display=swap');

  const unitList: Array<{ unit: PublicSiteUnit; total?: number; below?: boolean; minNights?: number }> = results
    ? results.free
    : site.units.map((unit) => ({ unit }));
  const [activeId, setActiveId] = useState<string>('');
  const active = unitList.find((u) => u.unit.id === activeId) || unitList[0];
  const activePhotos = active ? unitPhotos(active.unit.id) : [];
  const trio = general.slice(1, 4);
  const more = general.slice(4);

  const btn =
    'inline-flex items-center justify-center gap-2 min-h-[48px] px-6 border-2 border-[var(--olive-dark)] text-[var(--olive-dark)] text-sm font-bold uppercase tracking-[0.14em] hover:bg-[var(--olive-dark)] hover:text-white transition cursor-pointer';
  const btnSolid =
    'inline-flex items-center justify-center gap-2 min-h-[48px] px-6 bg-[var(--olive-dark)] text-white text-sm font-bold uppercase tracking-[0.14em] hover:brightness-125 transition cursor-pointer';

  return (
    <div style={VARS} className="relative min-h-screen bg-[var(--bg)] text-[var(--fg)] font-sans antialiased">
      {/* Portada: foto con el nombre arriba y tres palabras guía */}
      <header className="relative h-[72vh] min-h-[460px] max-h-[760px] overflow-hidden">
        {cover && <img src={cover.data} alt={site.name} className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/40" />
        <div className="absolute top-0 inset-x-0 flex items-center justify-between gap-4 px-5 sm:px-10 pt-5">
          <span className="hidden sm:block text-xs font-bold uppercase tracking-[0.22em] text-white">{site.city}</span>
          <LangSwitch b={b} className="ml-auto flex gap-0.5 rounded-full bg-black/35 backdrop-blur p-1" activeCls="bg-white text-stone-900" idleCls="text-white" />
        </div>
        <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-6">
          <h1 style={serif} className="text-[clamp(2.4rem,8vw,5.5rem)] leading-none uppercase tracking-[0.08em] text-balance">
            {site.name}
          </h1>
          <nav className="mt-10 sm:mt-14 flex flex-wrap justify-center gap-x-10 sm:gap-x-24 gap-y-3">
            {[
              [t.stays, 'h-aloj'],
              [t.gallery, 'h-fotos'],
              [t.where, 'h-donde'],
            ].map(([label, id]) => (
              <button
                key={id}
                type="button"
                onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                style={serif}
                className="text-2xl sm:text-3xl hover:underline underline-offset-8 decoration-1 cursor-pointer"
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Bienvenida */}
      <section className="max-w-3xl mx-auto px-6 pt-16 sm:pt-20 text-center">
        <Sprig className="w-6 h-12 mx-auto text-[var(--olive)]" />
        {site.tagline && (
          <p style={serif} className="mt-6 text-2xl sm:text-3xl leading-snug text-balance">
            {site.tagline}
          </p>
        )}
        {site.description && <p className="mt-5 text-base sm:text-lg leading-relaxed text-[var(--fg-2)] whitespace-pre-line">{site.description}</p>}
      </section>

      {/* Buscador */}
      <div ref={b.searchRef} className="max-w-4xl mx-auto px-5 sm:px-8 pt-12 scroll-mt-8">
        <div className="bg-[var(--cream)] p-5 sm:p-7">
          <SearchForm
            b={b}
            colorScheme="light"
            formCls="grid grid-cols-2 sm:grid-cols-[1fr_1fr_auto_auto] gap-x-4 gap-y-4 items-end"
            labelCls="text-xs font-bold uppercase tracking-[0.16em]"
            fieldCls="bg-[var(--bg)] border border-[var(--line)] text-[var(--fg)]"
            stepBtnCls="w-10 h-10 flex items-center justify-center hover:bg-[var(--cream)] cursor-pointer"
            submitCls={btnSolid}
            errorCls="text-sm font-bold text-[#8A2E12]"
          />
        </div>
      </div>

      {/* Alojamientos: lista con líneas a la izquierda, foto con sombra a la derecha */}
      <section id="h-aloj" ref={b.resultsRef} className="max-w-6xl mx-auto px-5 sm:px-10 pt-20 sm:pt-28 scroll-mt-6">
        {results && results.free.length === 0 ? (
          <div className="max-w-xl space-y-5">
            <h2 style={serif} className="text-4xl">
              {t.noneTitle}
            </h2>
            <p className="text-lg text-[var(--fg-2)]">{t.none}</p>
            {b.generalLink && (
              <a href={b.generalLink} target="_blank" rel="noopener noreferrer" className={btnSolid}>
                {t.askGeneral}
              </a>
            )}
          </div>
        ) : (
          <div className="grid gap-12 sm:grid-cols-2 sm:gap-16 items-start">
            <div className="sm:sticky sm:top-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--olive-dark)]">{site.name}</p>
              <h2 style={serif} className="mt-2 text-4xl sm:text-5xl leading-tight">
                {results && searched ? `${fmtDate(searched.in, lang)} → ${fmtDate(searched.out, lang)}` : t.stays}
              </h2>
              {results && searched && (
                <p className="mt-2 text-base font-semibold text-[var(--fg-2)]">
                  {t.nights(results.n)} · {t.msgGuests(searched.guests).slice(2)}
                </p>
              )}
              <ul className="mt-8">
                {unitList.map(({ unit, total, below }) => {
                  const on = active?.unit.id === unit.id;
                  return (
                    <li key={unit.id} className="border-b border-[var(--line)]">
                      <button
                        type="button"
                        onMouseEnter={() => setActiveId(unit.id)}
                        onFocus={() => setActiveId(unit.id)}
                        onClick={() => setActiveId(unit.id)}
                        aria-pressed={on}
                        className={`w-full flex items-baseline justify-between gap-4 py-4 text-left cursor-pointer transition ${on ? 'pl-3' : ''}`}
                      >
                        <span style={serif} className={`text-2xl ${on ? 'text-[var(--olive-dark)]' : ''}`}>
                          {unit.name}
                        </span>
                        <span className="shrink-0 text-sm font-semibold text-[var(--fg-2)] tabular-nums">
                          {results ? (below ? '—' : total && total > 0 ? fmtMoney(total, site.currency) : t.askPrice) : t.upTo(unit.maxGuests)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {active && (
              <div className="space-y-6">
                <Framed
                  src={activePhotos[0]?.data}
                  alt={active.unit.name}
                  className="aspect-[4/5] sm:aspect-[4/5]"
                  onClick={() => activePhotos.length && setLightbox({ list: activePhotos, index: 0 })}
                />
                <div className="space-y-3 pr-4 sm:pr-6">
                  <h3 style={serif} className="text-3xl">
                    {active.unit.name}
                  </h3>
                  <p className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--olive-dark)]">
                    {[active.unit.maxGuests > 0 ? t.upTo(active.unit.maxGuests) : '', active.unit.bedrooms > 0 ? t.bedrooms(active.unit.bedrooms) : ''].filter(Boolean).join(' · ')}
                  </p>
                  {active.unit.description && <p className="text-base leading-relaxed text-[var(--fg-2)] whitespace-pre-line">{active.unit.description}</p>}
                  {activePhotos.length > 1 && (
                    <button type="button" onClick={() => setLightbox({ list: activePhotos, index: 1 })} className="text-sm font-semibold underline underline-offset-4 cursor-pointer">
                      {t.gallery} ({activePhotos.length})
                    </button>
                  )}
                  <div className="pt-2">
                    {results ? (
                      <div className="space-y-3">
                        {active.below ? (
                          <p className="text-base font-semibold">{t.minNights(active.minNights || 0)}</p>
                        ) : active.total && active.total > 0 ? (
                          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <span className="text-xs font-bold uppercase tracking-[0.14em]">
                              {t.total} · {t.nights(results.n)}
                            </span>
                            <span style={serif} className="text-3xl tabular-nums">
                              {fmtMoney(active.total, site.currency)}
                            </span>
                          </p>
                        ) : (
                          <p className="text-base font-semibold">{t.askPrice}</p>
                        )}
                        {site.whatsapp && (
                          <a
                            href={waLink(site.whatsapp, b.requestText(active.unit, active.below ? 0 : active.total || 0))}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={btnSolid}
                          >
                            {active.below ? t.askGeneral : t.ask}
                          </a>
                        )}
                      </div>
                    ) : (
                      <button type="button" onClick={b.goSearch} className={btn}>
                        {t.chooseDates}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {results && results.free.length > 0 && <p className="mt-10 text-sm font-medium text-[var(--fg-2)]">{t.confirmNote}</p>}
      </section>

      {/* Franja de tres fotos con títulos */}
      {trio.length > 0 && (
        <section id="h-fotos" className={`mt-24 sm:mt-32 grid ${['', 'sm:grid-cols-1', 'sm:grid-cols-2', 'sm:grid-cols-3'][trio.length]} scroll-mt-4`}>
          {trio.map((p, i) => (
            <button key={p.id} type="button" onClick={() => setLightbox({ list: general, index: i + 1 })} className="relative h-72 sm:h-[460px] overflow-hidden cursor-pointer group">
              <img src={p.data} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/35 group-hover:bg-black/25 transition" />
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
                <span style={serif} className="text-3xl sm:text-4xl">
                  {[t.place, site.city?.split(',')[0] || t.where, t.gallery][i]}
                </span>
                <span className="w-10 h-10 border border-white flex items-center justify-center" aria-hidden="true">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </span>
            </button>
          ))}
        </section>
      )}
      {more.length > 0 && (
        <section className={`max-w-6xl mx-auto px-5 sm:px-10 pt-6 grid grid-cols-2 ${['', 'sm:grid-cols-1', 'sm:grid-cols-2', 'sm:grid-cols-3'][more.length] || 'sm:grid-cols-4'} gap-3`}>
          {more.map((p, i) => (
            <button key={p.id} type="button" onClick={() => setLightbox({ list: general, index: i + 4 })} className="aspect-square overflow-hidden cursor-pointer">
              <img src={p.data} alt="" loading="lazy" className="w-full h-full object-cover hover:scale-[1.04] transition-transform duration-700" />
            </button>
          ))}
        </section>
      )}

      {/* Dónde estamos: texto a la derecha, foto con sombra a la izquierda */}
      <section id="h-donde" className="max-w-6xl mx-auto px-5 sm:px-10 pt-24 sm:pt-32 pb-20 grid gap-12 sm:grid-cols-2 sm:gap-16 items-center scroll-mt-6">
        {general[0] && <Framed src={general[general.length - 1]?.data || general[0].data} side="left" className="aspect-[4/3]" onClick={() => setLightbox({ list: general, index: general.length - 1 })} />}
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--olive-dark)]">{t.where}</p>
          <h2 style={serif} className="text-4xl sm:text-5xl leading-tight">
            {site.city || site.name}
          </h2>
          {site.address && (
            <p className="flex items-start gap-2 text-base">
              <MapPin className="w-5 h-5 shrink-0 mt-0.5" /> {site.address}
            </p>
          )}
          {(site.checkinHour || site.checkoutHour) && (
            <p className="flex items-start gap-2 text-base">
              <Clock className="w-5 h-5 shrink-0 mt-0.5" />
              <span>
                {site.checkinHour && `${t.checkin} ${site.checkinHour}`}
                {site.checkinHour && site.checkoutHour && ' · '}
                {site.checkoutHour && `${t.checkout} ${site.checkoutHour}`}
              </span>
            </p>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            {site.mapsUrl && (
              <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className={btn}>
                {t.map}
              </a>
            )}
            {b.generalLink && (
              <a href={b.generalLink} target="_blank" rel="noopener noreferrer" className={btnSolid}>
                {t.askGeneral} <ArrowRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </section>

      <BookBar b={b} className="w-full sm:w-auto min-h-[56px] px-10 bg-[var(--olive-dark)] text-white text-sm font-bold uppercase tracking-[0.16em] shadow-[0_-4px_20px_rgba(0,0,0,0.15)] sm:shadow-xl" />

      <footer className="bg-[var(--olive-dark)] text-white px-6 py-14 text-center space-y-3">
        <Sprig className="w-5 h-10 mx-auto text-white" />
        <p style={serif} className="text-3xl uppercase tracking-[0.08em]">
          {site.name}
        </p>
        <p className="text-sm font-semibold">{t.direct}</p>
        <a href="https://loomisuite.net" target="_blank" rel="noopener" className="inline-block text-sm font-semibold underline underline-offset-4">
          {t.madeWith}
        </a>
      </footer>


      {b.lightbox && <Lightbox list={b.lightbox.list} index={b.lightbox.index} onClose={() => setLightbox(null)} closeLabel={t.close} />}
    </div>
  );
};
