import React, { useState } from 'react';
import {
  X,
  Printer,
  Sparkles,
  Crown,
  Eye,
  Check,
  ArrowRight,
  ChevronRight,
  Layers,
  Calendar,
  Shield,
  Smartphone,
  Globe,
  Sliders,
} from 'lucide-react';

interface SignatureLookbookDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDirection?: (directionId: string) => void;
}

export const SignatureLookbookDossierModal: React.FC<SignatureLookbookDossierModalProps> = ({
  isOpen,
  onClose,
  onSelectDirection,
}) => {
  const [selectedDirection, setSelectedDirection] = useState<'01' | '02' | '03' | '04' | '05' | '06'>('01');
  const [viewMode, setViewMode] = useState<'scroll-strips' | 'deep-dive'>('scroll-strips');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const cortePhotos = {
    facade: '/entrada.jpeg',
    edificio: '/catalinas/edificio.jpg',
    suite1: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop',
    bathroom: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop',
    suite2: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
    terrace: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop',
    pool: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop',
    cellar: 'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?q=80&w=1200&auto=format&fit=crop',
    sunset: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=1200&auto=format&fit=crop',
  };

  const directions = [
    {
      id: '01',
      title: 'Boutique Heritage & Classic',
      subtitle: 'Inspiración: Hotel Bella Grande (Copenhague) & Casonas de Autor',
      palette: ['#FAF7F2', '#EFE8DE', '#C5B5A2', '#2A2927', '#1A1918'],
      paletteNames: ['Crudo Lino', 'Piedra Cálida', 'Arena Mineral', 'Carbón', 'Ébano'],
      typography: 'Editorial Serif Romana + Sans-serif Espaciada',
      concept: 'Composición clásica, simetría serena y elegancia silenciosa. Ideal para casonas históricas, viñedos tradicionales y aparts boutique.',
    },
    {
      id: '02',
      title: 'The Silent House (Wabi-Sabi)',
      subtitle: 'Inspiración: Refugios de Montaña, Hormigón Visto & Piedra',
      palette: ['#EAE5DE', '#D5CEC4', '#9E9588', '#3C3935', '#161514'],
      paletteNames: ['Yeso Crudo', 'Hormigón Claro', 'Piedra Gris', 'Madera Quemada', 'Sombra'],
      typography: 'Serif Cincelada + Caracteres Verticales Espaciados',
      concept: 'Espacio negativo radical, juego de sombras (komorebi) y foco en la textura de los materiales constructivos.',
    },
    {
      id: '03',
      title: 'Botanical Sanctuary & Moss',
      subtitle: 'Inspiración: Glampings de Bosque, Cabañas de Autor & Rocío',
      palette: ['#F2EFE9', '#D2DDD0', '#5B6F57', '#283626', '#121A11'],
      paletteNames: ['Bruma', 'Eucalipto', 'Musgo Bosque', 'Corteza', 'Noche Verde'],
      typography: 'Serif Itálica Delicada + Monospaced Técnica',
      concept: 'Atmósfera inmersiva para alojamientos rodeados de naturaleza virgen, viñedos agroecológicos o reservas privadas.',
    },
    {
      id: '04',
      title: 'Maison & Vanguard Architecture',
      subtitle: 'Inspiración: Maison & Wilder, Vanguardia & Líneas Puras',
      palette: ['#FFFFFF', '#F0EFEA', '#D0CAC0', '#1F1E1C', '#0A0A0A'],
      paletteNames: ['Blanco Puro', 'Caliza', 'Zinc', 'Grafito', 'Negro Absoluto'],
      typography: 'Sans Geométrica Bold + Serif Ligera de Alto Contraste',
      concept: 'Líneas puras, números gigantes de proyecto (01, 02, 03) y estética de estudio de arquitectura internacional.',
    },
    {
      id: '05',
      title: 'Mineral Parallax & Terroir',
      subtitle: 'Inspiración: Bodegas, Lodges de Cava & Piedra Volcánica',
      palette: ['#EDE6DC', '#D8CEBE', '#8C6246', '#261C14', '#110D0A'],
      paletteNames: ['Arena Toba', 'Lino Crudo', 'Roble Cava', 'Tierra Roja', 'Madera Vieja'],
      typography: 'Corte Cincelado en Mineral + Cursiva de Autor',
      concept: 'Fondo de textura mineral con fotografías flotantes puras que se desprenden al deslizar, transmitiendo terruño y calma.',
    },
    {
      id: '06',
      title: 'Canvas Horizontal Gallery',
      subtitle: 'Inspiración: Galerías de Arte Contemporáneo & Recorridos Cinemáticos',
      palette: ['#12100E', '#1D1A16', '#3D352E', '#C5B49D', '#EDE5D8'],
      paletteNames: ['Noche Carbón', 'Corteza Oscura', 'Bronce Viejo', 'Oro Lino', 'Luz Vela'],
      typography: 'Serif Clásica de Galería + Micro-etiquetas Monospaced',
      concept: 'Navegación horizontal panorámica fluida donde cada pantalla es una obra curada en pantalla completa.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-[#FAF8F5] dark:bg-[#0E1015] text-stone-900 dark:text-stone-100 rounded-3xl border border-stone-300 dark:border-stone-800 shadow-2xl w-full max-w-7xl max-h-[94vh] flex flex-col overflow-hidden font-sans print:max-w-none print:max-h-none print:border-none print:shadow-none print:rounded-none">
        
        {/* Header Bar */}
        <div className="bg-[#14161C] text-white p-4 sm:p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 print:bg-white print:text-black print:border-b-2 print:border-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E5DACD] flex items-center justify-center text-stone-950 shadow-md">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#D8CEBE] font-bold">
                  Loomi Suite • Colección Signature
                </span>
                <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded text-stone-300 font-mono">
                  Dossier de Visualización Web
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-serif italic font-bold text-[#FAF6F0] print:text-black">
                Lookbook de Arquitectura Web & Maquetación Digital
              </h2>
            </div>
          </div>

          {/* Controls & Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-[#E5DACD] hover:bg-[#D8CEBE] text-stone-950 text-xs font-serif italic font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer print:hidden"
              title="Descargar o Guardar como PDF para enviar a tu arquitecto/a o fotógrafo/a"
            >
              <Printer className="w-4 h-4 text-stone-900" />
              <span>Descargar / Imprimir en PDF</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer print:hidden"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Concept Banner */}
        <div className="bg-[#1A1C24] px-4 sm:px-6 py-3 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-stone-300 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E5DACD] shrink-0" />
            <p className="leading-snug">
              <strong>Simulación visual de páginas web completas:</strong> A continuación se muestran las 6 maquetaciones reales aplicadas sobre <em>Corte delle Vette (Mendoza)</em> para evaluar la composición, tipografía y ritmo vertical de cada estilo.
            </p>
          </div>
          <span className="text-[10px] font-mono text-[#D8CEBE] bg-black/40 px-2.5 py-1 rounded-md border border-white/10 whitespace-nowrap">
            Set Fotográfico Unificado: Corte delle Vette
          </span>
        </div>

        {/* Scrollable Gallery Area showing Real Long-Scroll Webpage Mockups */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-12 print:overflow-visible print:p-0 print:space-y-10">
          
          {/* Grid of Long-Scroll Webpage Designs (Style Strips) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* ========================================================================= */}
            {/* DIRECCIÓN 01: BOUTIQUE HERITAGE (Hotel Bella Grande / Classic Copenhagen) */}
            {/* ========================================================================= */}
            <div className="bg-[#FAF7F2] text-[#1E1C1A] rounded-2xl border-2 border-[#D8CEBE] shadow-xl overflow-hidden flex flex-col print:break-inside-avoid">
              {/* Browser / Viewport Frame Header */}
              <div className="bg-[#EFE8DE] px-3 py-2 border-b border-[#D8CEBE] flex items-center justify-between text-[10px] font-mono">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-stone-400" />
                  <div className="w-2 h-2 rounded-full bg-stone-400" />
                  <div className="w-2 h-2 rounded-full bg-stone-400" />
                  <span className="ml-1 font-bold text-stone-700">01 • BOUTIQUE HERITAGE</span>
                </div>
                <span className="text-[9px] bg-white px-1.5 py-0.5 rounded text-stone-600 font-bold">WEB REAL</span>
              </div>

              {/* Complete Long-Scroll Web Page Simulation */}
              <div className="p-4 space-y-6 text-center font-serif">
                {/* 1. Header & Brand Title */}
                <div className="pt-2 pb-1 border-b border-stone-300">
                  <p className="text-[9px] font-mono tracking-widest uppercase text-stone-500">BOUTIQUE RETREAT & LODGE</p>
                  <h3 className="text-xl font-bold tracking-tight text-stone-900 mt-1 uppercase">
                    CORTE DELLE VETTE
                  </h3>
                  <p className="text-[9px] font-mono text-stone-500 mt-0.5">EST. 2024 • MENDOZA, ARGENTINA</p>
                </div>

                {/* 2. Hero Architectural Vignette */}
                <div className="relative overflow-hidden rounded-lg shadow-md border border-stone-300">
                  <img
                    src={cortePhotos.edificio}
                    alt="Boutique Facade"
                    className="w-full h-48 object-cover filter contrast-105"
                  />
                  <div className="p-2.5 bg-[#FAF7F2] text-left border-t border-stone-200">
                    <span className="text-[9px] font-mono uppercase text-stone-400 block">Arquitectura & Calma</span>
                    <p className="text-xs italic text-stone-800">
                      "Un refugio boutique de piedra y silencio en el corazón del terruño."
                    </p>
                  </div>
                </div>

                {/* 3. Triple Photo Grid with Numbers (Like Bella Grande) */}
                <div className="space-y-2 text-left">
                  <span className="text-[9px] font-mono uppercase text-stone-500 font-bold block">01. LAS SUITES & ESPACIOS</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <img src={cortePhotos.suite1} alt="Suite" className="w-full h-20 object-cover rounded" />
                      <span className="text-[8px] font-mono text-stone-500 block mt-0.5">Master Suite</span>
                    </div>
                    <div>
                      <img src={cortePhotos.bathroom} alt="Baño" className="w-full h-20 object-cover rounded" />
                      <span className="text-[8px] font-mono text-stone-500 block mt-0.5">Baño de Piedra</span>
                    </div>
                    <div>
                      <img src={cortePhotos.cellar} alt="Cava" className="w-full h-20 object-cover rounded" />
                      <span className="text-[8px] font-mono text-stone-500 block mt-0.5">Cava Subterránea</span>
                    </div>
                  </div>
                </div>

                {/* 4. Color Management Bar embedded in layout */}
                <div className="bg-[#EFE8DE] p-2 rounded-lg text-left text-[9px] font-mono space-y-1">
                  <span className="text-stone-500 uppercase font-bold">PALETA DE MATERIALES:</span>
                  <div className="flex gap-1 h-3 rounded overflow-hidden">
                    <div className="flex-1 bg-[#FAF7F2]" title="Crudo Lino" />
                    <div className="flex-1 bg-[#EFE8DE]" title="Piedra" />
                    <div className="flex-1 bg-[#C5B5A2]" title="Arena" />
                    <div className="flex-1 bg-[#2A2927]" title="Carbón" />
                  </div>
                </div>

                {/* 5. Direct Booking Callout */}
                <div className="bg-[#1A1918] text-[#FAF7F2] p-3 rounded-xl text-center space-y-1.5 font-sans">
                  <span className="text-[9px] font-mono text-[#D8CEBE] uppercase tracking-wider block">RESERVAS DIRECTAS SIN COMISIÓN</span>
                  <p className="text-xs font-serif italic text-white">Tarifa Oficial con Seña 50% por CBU</p>
                  <button className="w-full py-1.5 bg-[#E5DACD] text-stone-950 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                    Consultar Fechas
                  </button>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* DIRECCIÓN 02: THE SILENT HOUSE (Wabi-Sabi & Concrete Sanctuary)           */}
            {/* ========================================================================= */}
            <div className="bg-[#EAE5DE] text-[#22201E] rounded-2xl border-2 border-[#C5BCAE] shadow-xl overflow-hidden flex flex-col print:break-inside-avoid">
              {/* Browser / Viewport Frame Header */}
              <div className="bg-[#DDD6CB] px-3 py-2 border-b border-[#C5BCAE] flex items-center justify-between text-[10px] font-mono">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-stone-500" />
                  <div className="w-2 h-2 rounded-full bg-stone-500" />
                  <div className="w-2 h-2 rounded-full bg-stone-500" />
                  <span className="ml-1 font-bold text-stone-800">02 • THE SILENT HOUSE</span>
                </div>
                <span className="text-[9px] bg-stone-800 text-stone-200 px-1.5 py-0.5 rounded font-bold">WABI-SABI</span>
              </div>

              {/* Complete Long-Scroll Web Page Simulation */}
              <div className="p-4 space-y-6 text-left font-serif">
                {/* 1. Header Minimal */}
                <div className="flex items-start justify-between border-b border-stone-400/60 pb-2">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight uppercase">THE SILENT RETREAT</h3>
                    <p className="text-[9px] font-mono text-stone-600">A SANCTUARY FOR MIND & LIGHT</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-stone-500">2024</span>
                </div>

                {/* 2. Hero Architectural Frame with Shadow (Komorebi) */}
                <div className="space-y-2">
                  <div className="relative overflow-hidden rounded-lg bg-stone-900 border border-stone-400">
                    <img
                      src={cortePhotos.suite2}
                      alt="Silent Suite"
                      className="w-full h-52 object-cover filter grayscale-20 contrast-110"
                    />
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-mono text-stone-200 uppercase">
                      HORMIGÓN & SOMBRA
                    </div>
                  </div>
                  <p className="text-xs italic text-stone-700 leading-relaxed">
                    "La belleza reside en la serenidad de lo imperfecto y el silencio del entorno."
                  </p>
                </div>

                {/* 3. Vertical Columns & Details */}
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="border border-stone-400/80 p-2 rounded-lg bg-white/40">
                    <span className="font-mono text-[8px] text-stone-500 block uppercase">01. MATERIA</span>
                    <p className="font-bold text-stone-900 mt-0.5">Piedra Volcánica</p>
                    <p className="text-[9px] text-stone-600">Texturas minerales puras sin aditivos químicos.</p>
                  </div>
                  <div className="border border-stone-400/80 p-2 rounded-lg bg-white/40">
                    <span className="font-mono text-[8px] text-stone-500 block uppercase">02. SILENCIO</span>
                    <p className="font-bold text-stone-900 mt-0.5">Aislación Acústica</p>
                    <p className="text-[9px] text-stone-600">12 suites independientes integradas al parque.</p>
                  </div>
                </div>

                {/* 4. Visual Pool & Reflection Vignette */}
                <div className="rounded-lg overflow-hidden border border-stone-400">
                  <img src={cortePhotos.pool} alt="Piscina" className="w-full h-24 object-cover" />
                </div>

                {/* 5. Minimalist Booking Strip */}
                <div className="bg-[#24211E] text-stone-200 p-3 rounded-xl text-center space-y-1.5 font-sans">
                  <p className="text-[10px] font-mono text-stone-400 uppercase">RETIRO EXCLUSIVO • DISPONIBILIDAD DIRECTA</p>
                  <button className="w-full py-1.5 bg-[#C5BCAE] hover:bg-[#B3A999] text-stone-950 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                    Ver Calendario & Tarifas
                  </button>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* DIRECCIÓN 03: BOTANICAL SANCTUARY & MOSS (Selva / Bosque / Glamping)      */}
            {/* ========================================================================= */}
            <div className="bg-[#141E16] text-[#E8ECE5] rounded-2xl border-2 border-[#2E4832] shadow-xl overflow-hidden flex flex-col print:break-inside-avoid">
              {/* Browser / Viewport Frame Header */}
              <div className="bg-[#0D150E] px-3 py-2 border-b border-[#2E4832] flex items-center justify-between text-[10px] font-mono">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-600" />
                  <div className="w-2 h-2 rounded-full bg-emerald-600" />
                  <div className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span className="ml-1 font-bold text-emerald-300">03 • BOTANICAL SANCTUARY</span>
                </div>
                <span className="text-[9px] bg-emerald-950 text-emerald-200 border border-emerald-700/60 px-1.5 py-0.5 rounded font-bold">ECO-LUXURY</span>
              </div>

              {/* Complete Long-Scroll Web Page Simulation */}
              <div className="p-4 space-y-6 text-left font-serif">
                {/* 1. Header Editorial */}
                <div className="border-b border-[#2E4832] pb-2">
                  <span className="text-[9px] font-mono text-emerald-400 tracking-widest uppercase">ODE TO NATURE & VINEYARDS</span>
                  <h3 className="text-xl font-bold tracking-tight text-[#FAF7F2] mt-0.5">
                    CORTE BOTÁNICA
                  </h3>
                </div>

                {/* 2. Hero Image with Organic Overlay */}
                <div className="relative overflow-hidden rounded-lg border border-[#2E4832]">
                  <img
                    src={cortePhotos.sunset}
                    alt="Sunset Vineyard"
                    className="w-full h-48 object-cover filter brightness-95 contrast-105"
                  />
                  <div className="p-2.5 bg-[#19241B] border-t border-[#2E4832]">
                    <p className="text-xs italic text-emerald-100">
                      "Un diálogo continuo entre la vegetación autóctona y el confort refinado."
                    </p>
                  </div>
                </div>

                {/* 3. Sensory Details & Wine Tastings */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[9px] font-mono text-emerald-400">
                    <span>EXPERIENCIAS EN LA RESERVA</span>
                    <span>100% ORGÁNICO</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#19241B] p-2 rounded border border-[#2E4832]">
                      <img src={cortePhotos.cellar} alt="Cava" className="w-full h-16 object-cover rounded mb-1" />
                      <span className="text-[10px] font-bold text-white block">Catas Nocturnas</span>
                      <span className="text-[8px] text-emerald-300 font-mono">Cava bajo tierra</span>
                    </div>
                    <div className="bg-[#19241B] p-2 rounded border border-[#2E4832]">
                      <img src={cortePhotos.terrace} alt="Terraza" className="w-full h-16 object-cover rounded mb-1" />
                      <span className="text-[10px] font-bold text-white block">Fogoneros al Sol</span>
                      <span className="text-[8px] text-emerald-300 font-mono">Deck panorámico</span>
                    </div>
                  </div>
                </div>

                {/* 4. Booking Module */}
                <div className="bg-[#0D150E] p-3 rounded-xl border border-[#2E4832] text-center space-y-1.5 font-sans">
                  <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider block">RESERVA CON GUÍA DIGITAL QR</span>
                  <button className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider">
                    Consultar Estadía
                  </button>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* DIRECCIÓN 04: MAISON & VANGUARD (Maison & Wilder / Studio Architecture)   */}
            {/* ========================================================================= */}
            <div className="bg-white text-stone-950 rounded-2xl border-2 border-stone-400 shadow-xl overflow-hidden flex flex-col print:break-inside-avoid">
              {/* Browser / Viewport Frame Header */}
              <div className="bg-stone-100 px-3 py-2 border-b border-stone-300 flex items-center justify-between text-[10px] font-mono">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-stone-900" />
                  <div className="w-2 h-2 rounded-full bg-stone-900" />
                  <div className="w-2 h-2 rounded-full bg-stone-900" />
                  <span className="ml-1 font-black text-black">04 • MAISON & VANGUARD</span>
                </div>
                <span className="text-[9px] bg-black text-white px-1.5 py-0.5 rounded font-black font-mono">ARCH STUDIO</span>
              </div>

              {/* Complete Long-Scroll Web Page Simulation */}
              <div className="p-4 space-y-5 text-left font-sans">
                {/* 1. Header with Big Numbers & Clean Typography */}
                <div className="border-b-2 border-black pb-2">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-xl font-black tracking-tighter uppercase">
                      MAISON VETTES
                    </h3>
                    <span className="text-xs font-mono font-bold">PROJECT (04)</span>
                  </div>
                  <p className="text-[9px] font-mono text-stone-500 uppercase mt-0.5">ARCHITECTURAL LODGE & PRIVATE SUITES</p>
                </div>

                {/* 2. Asymmetrical Photo Framing */}
                <div className="space-y-1.5">
                  <div className="relative overflow-hidden rounded border border-black">
                    <img src={cortePhotos.facade} alt="Entrada" className="w-full h-44 object-cover filter grayscale-30" />
                    <span className="absolute bottom-2 left-2 bg-black text-white text-[8px] font-mono px-2 py-0.5 font-bold">
                      01 / 12 SUITES
                    </span>
                  </div>
                </div>

                {/* 3. Numbered Discovery Block (01, 02, 03) */}
                <div className="space-y-1.5 border-t border-b border-stone-200 py-2.5">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span>(01) Master Suite & Deck</span>
                    <span className="font-mono text-stone-500">$220 USD</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span>(02) Loft de la Cava</span>
                    <span className="font-mono text-stone-500">$180 USD</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span>(03) Suite de los Viñedos</span>
                    <span className="font-mono text-stone-500">$260 USD</span>
                  </div>
                </div>

                {/* 4. Dual Image Detail Vignette */}
                <div className="grid grid-cols-2 gap-2">
                  <img src={cortePhotos.suite1} alt="Suite" className="w-full h-20 object-cover rounded border border-stone-300" />
                  <img src={cortePhotos.terrace} alt="Terrace" className="w-full h-20 object-cover rounded border border-stone-300" />
                </div>

                {/* 5. Minimal High Contrast Booking */}
                <div className="bg-black text-white p-3 rounded text-center space-y-1">
                  <span className="text-[9px] font-mono uppercase text-stone-400 block">DIRECT BOOKING PMS ENGINE</span>
                  <button className="w-full py-1.5 bg-white text-black font-black text-[10px] uppercase tracking-wider rounded">
                    Reservar Ahora
                  </button>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* DIRECCIÓN 05: MINERAL PARALLAX (Corte delle Vette / Textura Piedra)      */}
            {/* ========================================================================= */}
            <div className="bg-[#EDE6DC] text-[#221B14] rounded-2xl border-2 border-[#C5B49D] shadow-xl overflow-hidden flex flex-col print:break-inside-avoid">
              {/* Browser / Viewport Frame Header */}
              <div className="bg-[#DFD3C3] px-3 py-2 border-b border-[#C5B49D] flex items-center justify-between text-[10px] font-mono">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#8C6246]" />
                  <div className="w-2 h-2 rounded-full bg-[#8C6246]" />
                  <div className="w-2 h-2 rounded-full bg-[#8C6246]" />
                  <span className="ml-1 font-bold text-[#3D2C1E]">05 • MINERAL PARALLAX</span>
                </div>
                <span className="text-[9px] bg-[#3D2C1E] text-[#EDE6DC] px-1.5 py-0.5 rounded font-bold">SIGNATURE VIP</span>
              </div>

              {/* Complete Long-Scroll Web Page Simulation */}
              <div className="p-4 space-y-6 text-center font-serif">
                {/* 1. Brand Header */}
                <div className="border-b border-[#C5B49D] pb-2">
                  <p className="text-[9px] font-mono text-[#8C6246] uppercase tracking-widest">BODEGA, CAVA & SUITES</p>
                  <h3 className="text-xl font-bold tracking-tight text-[#1D1711] mt-0.5">
                    CORTE DELLE VETTE
                  </h3>
                </div>

                {/* 2. Floating Cutout Photo Simulation */}
                <div className="relative py-2">
                  <div className="w-4/5 mx-auto rounded-lg overflow-hidden shadow-2xl border-2 border-white">
                    <img src={cortePhotos.suite1} alt="Master Suite" className="w-full h-44 object-cover" />
                  </div>
                  <div className="w-2/3 -mt-10 ml-auto mr-2 rounded-lg overflow-hidden shadow-2xl border-2 border-white relative z-10">
                    <img src={cortePhotos.cellar} alt="Cava" className="w-full h-28 object-cover" />
                  </div>
                </div>

                {/* 3. Terroir & Wine Text */}
                <p className="text-xs italic text-[#4A3B2C] max-w-xs mx-auto leading-relaxed">
                  "El reposo del vino y la calidez de la piedra tallada en una atmósfera sin tiempo."
                </p>

                {/* 4. Experiences Selector */}
                <div className="bg-[#DFD3C3] p-2.5 rounded-xl text-left text-xs font-sans space-y-1.5">
                  <div className="flex items-center justify-between text-[9px] font-mono text-[#8C6246] font-bold">
                    <span>EXPERIENCIAS VIP</span>
                    <span>RESERVA OPCIONAL</span>
                  </div>
                  <p className="font-serif italic font-bold text-[#1D1711]">Cata Guiada por Enólogo + Tabla de Quesos</p>
                </div>

                {/* 5. Direct Booking Button */}
                <div className="bg-[#261C14] text-[#EDE6DC] p-3 rounded-xl space-y-1.5 font-sans">
                  <span className="text-[9px] font-mono text-[#D8CEBE] uppercase block">MOTOR OFICIAL LOOMI SUITE</span>
                  <button className="w-full py-1.5 bg-[#C5B49D] hover:bg-[#B5A28A] text-stone-950 font-bold rounded-lg text-[10px] uppercase tracking-wider">
                    Reservar Estadía Signature
                  </button>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* DIRECCIÓN 06: CANVAS HORIZONTAL (Galería de Arte Cinemática)               */}
            {/* ========================================================================= */}
            <div className="bg-[#12100E] text-[#EDE5D8] rounded-2xl border-2 border-[#3D352E] shadow-xl overflow-hidden flex flex-col print:break-inside-avoid">
              {/* Browser / Viewport Frame Header */}
              <div className="bg-[#1D1A16] px-3 py-2 border-b border-[#3D352E] flex items-center justify-between text-[10px] font-mono">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#C5B49D]" />
                  <div className="w-2 h-2 rounded-full bg-[#C5B49D]" />
                  <div className="w-2 h-2 rounded-full bg-[#C5B49D]" />
                  <span className="ml-1 font-bold text-[#C5B49D]">06 • CANVAS GALLERY</span>
                </div>
                <span className="text-[9px] bg-[#C5B49D] text-black px-1.5 py-0.5 rounded font-bold">CINEMATIC</span>
              </div>

              {/* Complete Long-Scroll Web Page Simulation */}
              <div className="p-4 space-y-6 text-left font-serif">
                {/* 1. Gallery Header */}
                <div className="border-b border-[#3D352E] pb-2 flex items-baseline justify-between">
                  <h3 className="text-xl font-bold tracking-tight text-[#FAF6F0]">
                    CANVAS VETTES
                  </h3>
                  <span className="text-[9px] font-mono text-[#C5B49D]">EXHIBITION 2024</span>
                </div>

                {/* 2. Panoramic Photo Carousel Simulation */}
                <div className="space-y-2">
                  <div className="rounded-lg overflow-hidden border border-[#3D352E]">
                    <img src={cortePhotos.pool} alt="Panoramic Pool" className="w-full h-44 object-cover" />
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-mono text-[#C5B49D]">
                    <span>PANORAMA 01 • PIEDRA Y AGUA</span>
                    <span>RECORRIDO 360°</span>
                  </div>
                </div>

                {/* 3. Horizontal Story Cards */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#1D1A16] p-2 rounded-lg border border-[#3D352E]">
                    <img src={cortePhotos.suite2} alt="Suite" className="w-full h-16 object-cover rounded mb-1" />
                    <span className="text-[10px] font-bold text-[#EDE5D8] block">Suite del Atardecer</span>
                    <span className="text-[8px] font-mono text-[#C5B49D]">Vista a Cordillera</span>
                  </div>
                  <div className="bg-[#1D1A16] p-2 rounded-lg border border-[#3D352E]">
                    <img src={cortePhotos.cellar} alt="Cava" className="w-full h-16 object-cover rounded mb-1" />
                    <span className="text-[10px] font-bold text-[#EDE5D8] block">Cava Subterránea</span>
                    <span className="text-[8px] font-mono text-[#C5B49D]">Barricas de Roble</span>
                  </div>
                </div>

                {/* 4. Dark Gallery Booking */}
                <div className="bg-[#1D1A16] p-3 rounded-xl border border-[#3D352E] text-center space-y-1.5 font-sans">
                  <span className="text-[9px] font-mono text-[#C5B49D] uppercase block">PORTAL VIP DE RESERVAS</span>
                  <button className="w-full py-1.5 bg-[#C5B49D] hover:bg-[#B5A28A] text-stone-950 font-bold rounded-lg text-[10px] uppercase tracking-wider">
                    Consultar Disponibilidad
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Call to Action for Custom Bespoke Project */}
          <div className="bg-[#181A22] text-[#EDE7DE] p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 print:border-stone-400 print:bg-stone-100 print:text-black">
            <div className="space-y-2 max-w-2xl text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Crown className="w-4 h-4 text-[#E5DACD]" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D8CEBE]">
                  Servicio de Curaduría & Maquetación Exclusiva
                </span>
              </div>
              <h3 className="text-lg sm:text-2xl font-serif italic font-bold text-white print:text-black">
                ¿Querés maquetar tu complejo con una de estas direcciones de autor?
              </h3>
              <p className="text-xs sm:text-sm text-stone-400 print:text-stone-700 leading-relaxed">
                El <strong>Plan Signature ($80.000 ARS/mes)</strong> incluye la curaduría completa de tus fotos, selección de paleta de materiales según tu entorno y conexión con dominio propio oficial.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handlePrint}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer print:hidden"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / PDF Dossier</span>
              </button>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#E5DACD] hover:bg-[#D8CEBE] text-stone-950 text-xs font-serif italic font-bold transition-all shadow-lg cursor-pointer print:hidden"
              >
                <span>Cerrar & Volver al Sistema</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
