/**
 * Muestrario de diseños de Tu Web (loomisuite.net/disenos): los diseños funcionando con un complejo inventado.
 * /disenos → la grilla · /disenos/{id} → el diseño en vivo, con una barra para volver y pedirlo.
 * Los botones de WhatsApp del ejemplo no abren WhatsApp: muestran el mensaje que le llegaría al anfitrión.
 */
import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, MessageCircle, X } from 'lucide-react';
import { PublicSiteView } from '../booking/PublicSiteView';
import { sampleSite, samplePhotos } from '../../lib/sampleSite';

const LOOMI_WA = '5491140925939';
const PRICE = 'USD 70';

const SPECIAL: Array<{ id: string; name: string; line: string }> = [
  { id: 'refugio', name: 'Refugio', line: 'Portada de impacto a pantalla completa. Para lugares en la naturaleza.' },
  { id: 'estudio', name: 'Estudio', line: 'Oscuro y moderno, en paneles. Para departamentos y alojamiento urbano.' },
  { id: 'calma', name: 'Calma', line: 'Mosaico en verde y arena. Para cabañas y lugares de montaña o selva.' },
  { id: 'hacienda', name: 'Hacienda', line: 'Rústico con categoría: crema, oliva y serif elegante. Para fincas y posadas.' },
  { id: 'revista', name: 'Revista', line: 'Armado de revista de viajes, con fotos grandes. Para lugares con paisaje.' },
  { id: 'tierra', name: 'Tierra', line: 'Tonos tierra, título editorial y fotos flotando sobre la portada.' },
];
const INCLUDED: Array<{ id: string; name: string; line: string }> = [
  { id: 'noche', name: 'Noche', line: 'Oscuro y cálido.' },
  { id: 'dia', name: 'Día', line: 'Claro y luminoso.' },
  { id: 'clara', name: 'Clara', line: 'Verde bosque, letra fina.' },
];
const ALL = [...SPECIAL, ...INCLUDED];

const wa = (text: string) => `https://wa.me/${LOOMI_WA}?text=${encodeURIComponent(text)}`;

export const DesignShowcase: React.FC<{ designId?: string }> = ({ designId }) => {
  const design = ALL.find((d) => d.id === designId);
  useEffect(() => {
    document.title = design ? `${design.name} · Diseños de Tu Web · Loomi Suite` : 'Diseños de Tu Web · Loomi Suite';
    document.documentElement.classList.add('dark');
  }, [design]);
  return design ? <Live design={design} special={SPECIAL.some((d) => d.id === design.id)} /> : <Grid />;
};

const Grid: React.FC = () => (
  <div className="min-h-screen bg-[#0F1013] text-white font-sans antialiased">
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-16">
      <a href="https://loomisuite.net" className="inline-flex items-center gap-2 text-sm font-bold text-white">
        <svg viewBox="0 0 1000 1000" className="w-7 h-7" aria-hidden="true">
          <rect width="1000" height="1000" rx="220" fill="#0B0F17" />
          <path d="M 809.3 385 A 330 330 0 1 1 612.9 189.9" fill="none" stroke="#EFECE5" strokeWidth="110" strokeLinecap="round" />
        </svg>
        Loomi Suite
      </a>
      <h1 className="mt-10 text-4xl sm:text-6xl font-bold tracking-tight">Diseños para Tu Web</h1>
      <p className="mt-4 max-w-2xl text-lg text-stone-200">
        Tu página de reservas directas, con tus fotos, tus alojamientos y el precio según tus fechas. Abrí cada diseño para verlo funcionando: buscá
        fechas, mirá las fotos y probá el pedido por WhatsApp.
      </p>
      <p className="mt-3 text-base font-semibold text-stone-300">El complejo de los ejemplos es inventado.</p>

      <div className="mt-12 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-2xl sm:text-3xl font-bold">Diseños especiales</h2>
        <p className="text-lg font-bold text-[#F5A65B]">{PRICE} cada uno · pago único</p>
      </div>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SPECIAL.map((d) => (
          <Card key={d.id} d={d} special />
        ))}
      </div>

      <div className="mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold">Incluidos en todos los planes</h2>
        <p className="mt-2 text-base text-stone-200">Se eligen directamente en Tu Web, sin costo.</p>
      </div>
      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        {INCLUDED.map((d) => (
          <Card key={d.id} d={d} />
        ))}
      </div>

      <div className="mt-16 rounded-3xl bg-[#1A1B20] border border-zinc-700 p-6 sm:p-8 grid gap-6 sm:grid-cols-[1fr_auto] items-center">
        <div>
          <h2 className="text-2xl font-bold">¿Cómo se pide?</h2>
          <ol className="mt-3 space-y-1.5 text-base text-stone-100 list-decimal pl-5">
            <li>Elegís el diseño y nos escribís.</li>
            <li>Lo pagás una sola vez, por transferencia o Payoneer.</li>
            <li>Te lo habilitamos y lo elegís en Tu Web: tu página cambia al instante, con tus fotos.</li>
          </ol>
        </div>
        <a
          href={wa('Hola! Quiero un diseño especial para Tu Web.')}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 min-h-[52px] px-6 rounded-full bg-[#E67E22] hover:bg-[#D35400] text-white text-base font-bold"
        >
          <MessageCircle className="w-5 h-5" /> Escribinos
        </a>
      </div>
    </div>
  </div>
);

const Card: React.FC<{ d: { id: string; name: string; line: string }; special?: boolean }> = ({ d, special }) => (
  <a href={`/disenos/${d.id}`} className="group block rounded-3xl overflow-hidden bg-[#1A1B20] border border-zinc-700 hover:border-[#E67E22] transition-colors">
    <div className="aspect-[16/10] overflow-hidden bg-zinc-800">
      <img src={`/muestra/d-${d.id}.jpg`} alt={`Diseño ${d.name}`} loading="lazy" className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500" />
    </div>
    <div className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-bold">{d.name}</h3>
        {special && <span className="text-sm font-bold text-[#F5A65B]">{PRICE}</span>}
      </div>
      <p className="mt-1.5 text-base text-stone-200">{d.line}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-base font-bold text-white">
        Verlo funcionando <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </span>
    </div>
  </a>
);

const Live: React.FC<{ design: { id: string; name: string }; special: boolean }> = ({ design, special }) => {
  const [message, setMessage] = useState<string | null>(null);
  // Los WhatsApp del complejo de ejemplo no se abren: se muestra el mensaje que le llegaría al anfitrión
  const onClickCapture = (e: React.MouseEvent) => {
    const a = (e.target as HTMLElement).closest('a[href^="https://wa.me/"]') as HTMLAnchorElement | null;
    if (!a || a.closest('[data-showcase-bar]')) return;
    e.preventDefault();
    const text = new URL(a.href).searchParams.get('text') || '';
    setMessage(text);
  };
  return (
    <div onClickCapture={onClickCapture}>
      <div data-showcase-bar className="sticky top-0 z-[60] bg-[#0F1013] text-white border-b border-zinc-700">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 flex items-center gap-3">
          <a href="/disenos" className="inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-full text-sm font-bold hover:bg-white/10">
            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Diseños</span>
          </a>
          <p className="flex-1 min-w-0 truncate text-sm sm:text-base font-bold">
            {design.name}
            <span className="font-semibold text-stone-300"> · {special ? `${PRICE}, pago único` : 'incluido'}</span>
          </p>
          {special ? (
            <a
              href={wa(`Hola! Quiero el diseño ${design.name} para Tu Web.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 min-h-[40px] px-4 rounded-full bg-[#E67E22] hover:bg-[#D35400] text-white text-sm font-bold"
            >
              Lo quiero
            </a>
          ) : (
            <a href="/disenos" className="inline-flex items-center min-h-[40px] px-4 rounded-full border border-zinc-500 text-sm font-bold">
              Ver otros
            </a>
          )}
        </div>
      </div>

      <PublicSiteView site={sampleSite(design.id)} photos={samplePhotos} preview />

      {message !== null && (
        <div className="fixed inset-0 z-[1100] bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setMessage(null)}>
          <div
            className="w-full sm:max-w-md bg-[#1A1B20] text-white rounded-t-3xl sm:rounded-3xl border border-zinc-700 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold">Así te llega el pedido por WhatsApp</h2>
              <button type="button" onClick={() => setMessage(null)} aria-label="Cerrar" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-2xl bg-[#DCF8C6] text-[#111B21] p-4 text-base whitespace-pre-line">{message}</div>
            <p className="text-sm font-semibold text-stone-200">Es un ejemplo: en tu web, el mensaje va directo a tu WhatsApp y vos confirmás.</p>
          </div>
        </div>
      )}
    </div>
  );
};
