/**
 * Tu Web: la página pública que ve el huésped (sin Firebase: recibe los datos ya cargados).
 * La usan la página real (PublicSitePage), la vista previa de la app y la demo.
 * Noche, Día, Clara y Tierra se arman acá; los diseños especiales con otra estructura están en designs/.
 */
import React, { useRef, useState } from 'react';
import { MapPin, Users, BedDouble, Clock } from 'lucide-react';
import type { PublicSiteDoc, PublicSitePhoto, PublicSiteUnit } from '../../lib/publicSite';
import { fmtDate, fmtMoney, LangSwitch, Lightbox, SearchForm, SiteTexts, useGoogleFont, useSiteBooking, waLink } from './siteKit';
import { SPECIAL_LAYOUTS } from './designs';

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
    '--accent-fg': '#E8913A',
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
    '--accent-fg': '#A64B0C',
    colorScheme: 'light',
  },
  // Clara: verde bosque sobre casi negro, letra fina (la plantilla "Clara" de la guía)
  clara: {
    '--bg': '#0C0E0D',
    '--surface': '#141816',
    '--surface-2': '#1D2420',
    '--line': '#2C3631',
    '--fg': '#EFECE6',
    '--fg-2': '#D6D1C7',
    '--accent': '#047857',
    '--accent-ink': '#FFFFFF',
    '--accent-fg': '#34D399',
    colorScheme: 'dark',
  },
  // Tierra (diseño especial): revoque cálido, título editorial enorme y fotos flotando sobre la portada
  tierra: {
    '--bg': '#EDE6DC',
    '--surface': '#F7F2EA',
    '--surface-2': '#E3D9CB',
    '--line': '#CBBDA9',
    '--fg': '#1D1A16',
    '--fg-2': '#3D352C',
    '--accent': '#2C2720',
    '--accent-ink': '#F3ECE1',
    '--accent-fg': '#7A4E24',
    colorScheme: 'light',
  },
} as const;

interface Props {
  site: PublicSiteDoc;
  photos: PublicSitePhoto[];
  /** Vista previa dentro de la app: muestra la página aunque esté desactivada */
  preview?: boolean;
}

export const PublicSiteView: React.FC<Props> = (props) => {
  const Special = props.site.theme ? SPECIAL_LAYOUTS[props.site.theme] : undefined;
  if (Special && (props.site.enabled || props.preview)) return <Special {...props} />;
  return <BaseSiteView {...props} />;
};

const BaseSiteView: React.FC<Props> = ({ site, photos, preview }) => {
  const b = useSiteBooking(site, photos, preview);
  const { t, lang, results, searched, general, cover, unitPhotos, lightbox, setLightbox, searchRef, resultsRef, goSearch, requestText } = b;
  const whatsapp = site.whatsapp;
  useGoogleFont('loomi-site-font', 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap');

  const themeKey: keyof typeof THEMES = site.theme && site.theme in THEMES ? (site.theme as keyof typeof THEMES) : 'noche';
  const theme = THEMES[themeKey];
  const isClara = themeKey === 'clara';
  const isTierra = themeKey === 'tierra';

  if (!site.enabled && !preview) {
    return (
      <div style={theme as React.CSSProperties} className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex items-center justify-center p-6 text-center">
        <p className="text-lg font-medium">{t.unavailable}</p>
      </div>
    );
  }

  const headingFont: React.CSSProperties = isTierra
    ? { fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif", fontWeight: 400 }
    : isClara
    ? { fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 300, letterSpacing: '-0.02em' }
    : { fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif" };
  const btnPrimary =
    'inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] font-bold text-base hover:brightness-110 transition cursor-pointer';
  const btnGhost =
    'inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-full border border-[var(--line)] text-[var(--fg)] font-semibold text-sm hover:bg-[var(--surface-2)] transition cursor-pointer';

  return (
    <div style={theme as React.CSSProperties} className="relative min-h-screen bg-[var(--bg)] text-[var(--fg)] font-sans antialiased">
      {/* Idioma */}
      <LangSwitch b={b} className="absolute top-3 right-3 z-20 flex gap-1 rounded-full bg-black/45 backdrop-blur p-1" />

      {/* Portada */}
      {isTierra ? (
        <TierraHero site={site} cover={cover} floating={[...general.slice(1), ...photos.filter((p) => p.unitId)].slice(0, 3)} headingFont={headingFont} />
      ) : (
      <header className="relative min-h-[58vh] sm:min-h-[64vh] flex items-end overflow-hidden">
        {cover ? (
          <img src={cover.data} alt={site.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[var(--surface-2)]" />
        )}
        <div
          className={`absolute inset-0 ${
            isClara ? 'bg-gradient-to-t from-[#0C0E0D] via-[#0C0E0D]/55 to-black/20' : 'bg-gradient-to-t from-black/85 via-black/35 to-black/10'
          }`}
        />
        <div className="relative w-full max-w-5xl mx-auto px-5 sm:px-8 pb-24 sm:pb-28 pt-20 text-white">
          {site.city &&
            (isClara ? (
              <p className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold uppercase tracking-[0.2em] text-[#34D399] mb-4">
                <span className="w-2 h-2 rounded-full bg-[#34D399]" /> {site.city}
              </p>
            ) : (
              <p className="flex items-center gap-1.5 text-sm font-semibold tracking-wide mb-3">
                <MapPin className="w-4 h-4" /> {site.city}
              </p>
            ))}
          <h1 style={headingFont} className="text-4xl sm:text-6xl font-semibold leading-[1.05] text-balance">
            {site.name}
          </h1>
          {site.tagline && <p className="mt-3 text-lg sm:text-xl font-medium max-w-2xl text-white/95">{site.tagline}</p>}
        </div>
      </header>
      )}

      {/* Buscador */}
      <div ref={searchRef} className={`relative z-10 max-w-5xl mx-auto px-4 sm:px-8 ${isTierra ? '-mt-10 sm:-mt-14' : '-mt-16 sm:-mt-20'}`}>
        <SearchForm
          b={b}
          colorScheme={theme.colorScheme}
          formCls="rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-2xl p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-[1fr_1fr_auto_auto] gap-3 items-end"
          labelCls="text-sm font-bold"
          fieldCls="rounded-xl bg-[var(--bg)] border border-[var(--line)] text-[var(--fg)]"
          stepBtnCls="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--surface-2)] cursor-pointer"
          submitCls={btnPrimary}
          errorCls="text-sm font-bold text-[var(--accent-fg)]"
        />
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
                  <Clock className="w-5 h-5 text-[var(--accent-fg)] shrink-0" />
                  <span>
                    <span className="font-bold">{t.checkin}</span> {site.checkinHour}
                  </span>
                </p>
              )}
              {site.checkoutHour && (
                <p className="flex items-center gap-2 text-base">
                  <Clock className="w-5 h-5 text-[var(--accent-fg)] shrink-0" />
                  <span>
                    <span className="font-bold">{t.checkout}</span> {site.checkoutHour}
                  </span>
                </p>
              )}
              {site.address && (
                <p className="flex items-start gap-2 text-base">
                  <MapPin className="w-5 h-5 text-[var(--accent-fg)] shrink-0 mt-0.5" />
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

/** Portada del diseño Tierra: foto de fondo tenue, nombre enorme al centro y hasta tres fotos flotando (fijas, sin moverse al bajar) */
const TierraHero: React.FC<{
  site: PublicSiteDoc;
  cover?: PublicSitePhoto;
  floating: PublicSitePhoto[];
  headingFont: React.CSSProperties;
}> = ({ site, cover, floating, headingFont }) => {
  const spots = [
    'top-[13%] right-[5%] sm:right-[5%] w-32 sm:w-52 lg:w-64 aspect-[4/3] rotate-[2deg]',
    'bottom-[9%] left-[5%] sm:left-[9%] w-28 sm:w-44 lg:w-56 aspect-[3/4] -rotate-[2deg]',
    'hidden sm:block bottom-[14%] right-[16%] w-36 lg:w-44 aspect-square rotate-[1deg]',
  ];
  return (
    <header className="relative min-h-[88vh] sm:min-h-[92vh] overflow-hidden bg-[var(--bg)]">
      {cover && <img src={cover.data} alt="" className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-multiply" />}
      <div className="absolute inset-0 bg-[radial-gradient(#8C6D46_1px,transparent_1px)] [background-size:36px_36px] opacity-15" />
      <div className="absolute top-16 inset-x-5 sm:inset-x-12 flex items-center justify-between gap-4 border-b border-[#2C2720]/25 pb-3 text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#2C2720]">
        <span className="font-bold truncate" style={{ fontFamily: headingFont.fontFamily }}>
          {site.name}
        </span>
        {site.city && <span className="hidden sm:inline font-mono font-bold text-[#5A4632]">{site.city}</span>}
      </div>
      {floating.map((p, i) => (
        <div key={p.id} className={`absolute z-10 overflow-hidden rounded-xl shadow-[0_18px_40px_rgba(0,0,0,0.22)] border border-[#2C2720]/10 ${spots[i]}`}>
          <img src={p.data} alt="" className="w-full h-full object-cover" />
        </div>
      ))}
      <div className="relative z-20 min-h-[88vh] sm:min-h-[92vh] flex flex-col items-center justify-center text-center px-6 pb-16">
        <svg viewBox="0 0 100 40" fill="none" stroke="#8C6D46" strokeWidth="2" className="w-14 h-9 mb-3" aria-hidden="true">
          <path d="M5 35 L30 10 L50 25 L75 5 L95 35" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h1
          style={headingFont}
          className="text-[clamp(2.4rem,8vw,6rem)] uppercase leading-[0.95] tracking-[0.03em] text-[#191612] text-balance max-w-4xl [text-shadow:0_1px_18px_rgba(237,230,220,0.9)]"
        >
          {site.name}
        </h1>
        {site.tagline && (
          <p
            style={{ fontFamily: headingFont.fontFamily }}
            className="mt-4 text-lg sm:text-xl italic text-[#3D2F20] max-w-xl [text-shadow:0_1px_12px_rgba(237,230,220,0.95)]"
          >
            {site.tagline}
          </p>
        )}
      </div>
    </header>
  );
};

const UnitCard: React.FC<{
  unit: PublicSiteUnit;
  photos: PublicSitePhoto[];
  t: SiteTexts;
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
