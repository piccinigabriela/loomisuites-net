import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Calendar,
  Shield,
  Check,
  Wine,
  Compass,
  Bed,
  Layers,
  SlidersHorizontal,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { Property } from '../../types';

interface SignatureTriptychLandingProps {
  properties?: Property[];
  onOpenBookingModal?: (propertyId?: string) => void;
  onSelectProperty?: (property: Property) => void;
}

export const SignatureTriptychLanding: React.FC<SignatureTriptychLandingProps> = ({
  properties = [],
  onOpenBookingModal,
  onSelectProperty,
}) => {
  // Active expanded sector: null = home triptych, '01' | '02' | '03' = deep view
  const [expandedSector, setExpandedSector] = useState<'01' | '02' | '03' | null>(null);

  // Layout Controls: Stagger (Desnivel) and Spacing (Separación)
  const [isStaggered, setIsStaggered] = useState<boolean>(true);
  const [separationMode, setSeparationMode] = useState<'none' | 'hairline' | 'soft'>('hairline');
  const [showConfigDrawer, setShowConfigDrawer] = useState<boolean>(false);

  // Custom photo uploads for the 3 bands
  const [bandPhotos, setBandPhotos] = useState<{
    cava: string;
    suite: string;
    pool: string;
  }>({
    cava: 'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?q=80&w=1600&auto=format&fit=crop', // Cava de barricas
    suite: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1600&auto=format&fit=crop', // Suite con ventanal al viñedo
    pool: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1600&auto=format&fit=crop', // Piscina y deck con cordillera
  });

  const [activeUploadSlot, setActiveUploadSlot] = useState<'cava' | 'suite' | 'pool' | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, slot: 'cava' | 'suite' | 'pool') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBandPhotos((prev) => ({
            ...prev,
            [slot]: event.target?.result as string,
          }));
          setActiveUploadSlot(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const sectors = [
    {
      id: '01',
      slotKey: 'cava' as const,
      num: '01',
      tag: '01 • CAVA SUBTERRÁNEA',
      title: 'Cava de Barricas & Vinos',
      subtitle: 'Barricas de roble francés, catas a la luz de las velas y cosechas históricas.',
      bgImage: bandPhotos.cava,
      icon: Wine,
      description: 'Nuestra cava subterránea resguarda las cosechas históricas de Gran Corte en barricas de roble francés, bajo una atmósfera de piedra volcánica y temperatura natural constante.',
      gallery: [
        bandPhotos.cava,
        'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1600&auto=format&fit=crop',
      ],
      highlights: [
        'Cata sensorial privada guiada por enólogo residente',
        'Degustación de barricas y añadas de colección',
        'Maridaje de fuegos en terraza de viñedos',
      ],
    },
    {
      id: '02',
      slotKey: 'suite' as const,
      num: '02',
      tag: '02 • SUITES DE AUTOR',
      title: 'Descanso & Ventanal a la Cordillera',
      subtitle: 'Ventanal de piso a techo, lencería de lino puro y terraza privada sobre la viña.',
      bgImage: bandPhotos.suite,
      icon: Bed,
      description: 'Suites independientes construidas en piedra bola y madera noble, con vistas francas al amanecer sobre los viñedos y la cordillera nevada.',
      gallery: [
        bandPhotos.suite,
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1600&auto=format&fit=crop',
      ],
      highlights: [
        'Cama King Size con lencería de lino egipcio',
        'Deck exterior privado con fogonero y reposeras',
        'Baño escultural de piedra con tina de inmersión',
      ],
    },
    {
      id: '03',
      slotKey: 'pool' as const,
      num: '03',
      tag: '03 • TERRAZA & PAISAJE',
      title: 'Piscina Sinfín & Viñedos',
      subtitle: 'Deck de madera, atardeceres dorados y el silencio sagrado de los Andes.',
      bgImage: bandPhotos.pool,
      icon: Compass,
      description: 'Piscina templada integrada al manto de viñedos, con solárium de madera, faroles al atardecer y vista panorámica ininterrumpida a los picos nevados.',
      gallery: [
        bandPhotos.pool,
        'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=1600&auto=format&fit=crop',
        '/catalinas/edificio.jpg',
      ],
      highlights: [
        'Piscina infinita templada sobre los viñedos',
        'Servicio de copa de vino al atardecer en el deck',
        'Mirador astronómico y sendero botánico privado',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C2723] font-serif relative overflow-x-hidden selection:bg-[#2C2723] selection:text-[#FAF8F5] pb-16 flex flex-col justify-between">
      
      {/* ========================================================================= */}
      {/* 1. MINIMALIST TOP: "EL LOGO Y NADA MÁS" EN BLANCO APAGADO SUTIL          */}
      {/* ========================================================================= */}
      <header className="relative z-30 max-w-5xl mx-auto px-4 sm:px-8 pt-4 sm:pt-10 pb-2 sm:pb-6 text-center select-none">
        
        {/* Refined Luxury Monogram & Brand Logo */}
        <div className="space-y-0.5 sm:space-y-1 inline-block">
          <span className="text-[8px] sm:text-[9px] font-mono tracking-[0.35em] uppercase text-[#8C827A] block font-medium">
            VALLE DE UCO • MENDOZA
          </span>
          <h1 className="text-xl sm:text-3xl font-light tracking-[0.2em] uppercase text-[#1F1B18] font-serif">
            CORTE DELLE VETTE
          </h1>
          <div className="w-6 sm:w-8 h-px bg-[#C8C0B7] mx-auto mt-1 sm:mt-2" />
        </div>

        {/* Subtle Discretionary Controls (Float Bottom/Right) */}
        <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 flex items-center gap-2">
          <button
            onClick={() => setShowConfigDrawer(!showConfigDrawer)}
            className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full bg-white/95 hover:bg-white text-stone-800 border border-stone-300 text-[11px] sm:text-xs font-mono shadow-xl backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
            title="Ajustar Desnivel, Separación o Subir Fotos"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-stone-700" />
            <span className="hidden sm:inline">Ajustar Tríptico</span>
            <span className="sm:hidden">Ajustes</span>
          </button>
        </div>

        {/* Config Drawer / Modal */}
        {showConfigDrawer && (
          <div className="fixed bottom-14 right-3 sm:bottom-16 sm:right-4 z-50 bg-white/95 text-stone-900 border border-stone-200 p-4 rounded-2xl shadow-2xl backdrop-blur-md w-[calc(100vw-24px)] max-w-xs sm:w-80 space-y-3 font-sans text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <span className="font-bold text-[11px] uppercase tracking-wider text-stone-700">
                Ajustes de Maquetación
              </span>
              <button
                onClick={() => setShowConfigDrawer(false)}
                className="w-5 h-5 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Desnivel Toggle */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-stone-500 uppercase">Alineación de Bandas:</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setIsStaggered(true)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                    isStaggered ? 'bg-[#1F1B18] text-white font-bold' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  Con Desnivel (Escalonado)
                </button>
                <button
                  onClick={() => setIsStaggered(false)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                    !isStaggered ? 'bg-[#1F1B18] text-white font-bold' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  Alineadas (Niveladas)
                </button>
              </div>
            </div>

            {/* Separación Toggle */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-stone-500 uppercase">Separación entre Bandas:</span>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => setSeparationMode('none')}
                  className={`py-1.5 px-1.5 rounded-lg text-[11px] transition-all text-center ${
                    separationMode === 'none' ? 'bg-[#1F1B18] text-white font-bold' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  Sin Separar
                </button>
                <button
                  onClick={() => setSeparationMode('hairline')}
                  className={`py-1.5 px-1.5 rounded-lg text-[11px] transition-all text-center ${
                    separationMode === 'hairline' ? 'bg-[#1F1B18] text-white font-bold' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  Línea Fina (4px)
                </button>
                <button
                  onClick={() => setSeparationMode('soft')}
                  className={`py-1.5 px-1.5 rounded-lg text-[11px] transition-all text-center ${
                    separationMode === 'soft' ? 'bg-[#1F1B18] text-white font-bold' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  Aireada (12px)
                </button>
              </div>
            </div>

            {/* Upload Custom Cut Photos */}
            <div className="pt-2 border-t border-stone-100 space-y-1.5">
              <span className="text-[10px] font-mono text-stone-500 uppercase block">Subir tus imágenes de GIMP:</span>
              <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                <label className="p-2 bg-stone-50 hover:bg-stone-100 rounded-lg border border-dashed border-stone-300 text-center cursor-pointer block">
                  <span>1. Cava</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'cava')}
                  />
                </label>
                <label className="p-2 bg-stone-50 hover:bg-stone-100 rounded-lg border border-dashed border-stone-300 text-center cursor-pointer block">
                  <span>2. Suite</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'suite')}
                  />
                </label>
                <label className="p-2 bg-stone-50 hover:bg-stone-100 rounded-lg border border-dashed border-stone-300 text-center cursor-pointer block">
                  <span>3. Pileta</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'pool')}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN TRIPTYCH CONTAINER: 3 SLENDER VERTICAL BANDS (ALWAYS 3 COLUMNS)   */}
      {/* ========================================================================= */}
      {!expandedSector && (
        <main className="relative z-20 max-w-4xl mx-auto px-2 sm:px-6 my-auto pt-1 pb-6 sm:pb-10">
          
          <div
            className={`grid grid-cols-3 items-center transition-all duration-700 w-full ${
              separationMode === 'none'
                ? 'gap-0 rounded-2xl overflow-hidden shadow-2xl'
                : separationMode === 'hairline'
                ? 'gap-1 sm:gap-1.5'
                : 'gap-2 sm:gap-4'
            }`}
          >
            {sectors.map((sector, index) => {
              // Stagger offsets on both mobile and desktop
              const staggerClass = isStaggered
                ? index === 0
                  ? 'translate-y-4 sm:translate-y-8' // Left band (Cava) slightly down
                  : index === 1
                  ? '-translate-y-4 sm:-translate-y-8' // Center band (Suite) lifted up
                  : 'translate-y-1 sm:translate-y-3' // Right band (Pool) balanced
                : 'translate-y-0';

              const roundedClass =
                separationMode === 'none'
                  ? 'rounded-none'
                  : 'rounded-lg sm:rounded-2xl';

              return (
                <div
                  key={sector.id}
                  onClick={() => setExpandedSector(sector.id as any)}
                  className={`group relative overflow-hidden cursor-pointer transition-all duration-700 hover:z-20 hover:scale-[1.02] shadow-lg sm:shadow-xl hover:shadow-2xl ${staggerClass} ${roundedClass} h-[56vh] sm:h-[680px] min-h-[420px] flex flex-col justify-end p-2.5 sm:p-6 border border-[#E5E0D8] bg-[#EFECE6]`}
                >
                  {/* Band Vertical Photo (Ultra Slender Vertical Aspect) */}
                  <div className="absolute inset-0 z-0 overflow-hidden">
                    <img
                      src={sector.bgImage}
                      alt={sector.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 filter brightness-95 contrast-105"
                    />
                    
                    {/* Delicate Gradient: Translucent to Subtle Dark at bottom for micro-caption */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent group-hover:from-black/90 transition-all duration-500" />
                  </div>

                  {/* Micro Sector Identifier on Hover / Idle */}
                  <div className="relative z-10 text-white space-y-0.5 sm:space-y-1">
                    <div className="flex items-center justify-between text-[8px] sm:text-[10px] font-mono tracking-wider text-[#E8E2D8] uppercase">
                      <span className="truncate">{sector.tag}</span>
                      <span className="opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">→</span>
                    </div>
                    
                    <h3 className="text-xs sm:text-lg font-normal text-white font-serif tracking-wide leading-tight line-clamp-2">
                      {sector.title}
                    </h3>

                    <p className="hidden sm:block text-[11px] text-[#D8CEBE] font-serif italic line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {sector.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </main>
      )}

      {/* ========================================================================= */}
      {/* 3. EXPANDED SECTOR VIEW (AL HACER CLIC EN CUALQUIERA DE LAS 3 BANDAS)     */}
      {/* ========================================================================= */}
      {expandedSector && (
        <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 py-6 animate-in fade-in duration-400">
          
          {/* Top Return Bar */}
          <div className="flex items-center justify-between pb-6 border-b border-stone-200">
            <button
              onClick={() => setExpandedSector(null)}
              className="px-4 py-2 rounded-full bg-[#1F1B18] hover:bg-black text-[#FAF8F5] text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Volver a la Portada Tríptico</span>
            </button>

            {/* Quick Switcher */}
            <div className="flex items-center gap-1 bg-stone-200/80 p-1 rounded-full text-xs font-mono">
              <button
                onClick={() => setExpandedSector('01')}
                className={`px-3 py-1 rounded-full transition-all ${
                  expandedSector === '01' ? 'bg-white text-stone-950 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                01. Cava
              </button>
              <button
                onClick={() => setExpandedSector('02')}
                className={`px-3 py-1 rounded-full transition-all ${
                  expandedSector === '02' ? 'bg-white text-stone-950 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                02. Suites
              </button>
              <button
                onClick={() => setExpandedSector('03')}
                className={`px-3 py-1 rounded-full transition-all ${
                  expandedSector === '03' ? 'bg-white text-stone-950 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                03. Piscina
              </button>
            </div>
          </div>

          {/* Sector Detailed Content */}
          {(() => {
            const current = sectors.find((s) => s.id === expandedSector) || sectors[0];
            return (
              <div className="py-8 space-y-8 bg-white p-6 sm:p-10 rounded-3xl shadow-xl mt-6 border border-stone-200">
                
                {/* Header */}
                <div className="space-y-2 max-w-2xl">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#8C7A6B]">
                    {current.tag}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-light text-[#1F1B18] tracking-tight font-serif">
                    {current.title}
                  </h2>
                  <p className="text-base text-stone-600 leading-relaxed italic font-serif">
                    {current.description}
                  </p>
                </div>

                {/* Gallery */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {current.gallery.map((img, idx) => (
                    <div key={idx} className="rounded-2xl overflow-hidden shadow-md h-64 sm:h-72 group border border-stone-100">
                      <img
                        src={img}
                        alt="Detalle"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  ))}
                </div>

                {/* Features & Direct Booking Action */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-[#FAF8F5] p-6 sm:p-8 rounded-2xl border border-stone-200">
                  <div className="md:col-span-7 space-y-3">
                    <h3 className="text-base font-serif font-bold text-[#1F1B18] uppercase tracking-wide">
                      Experiencias & Comodidades Incluidas
                    </h3>
                    <ul className="space-y-2">
                      {current.highlights.map((h, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs sm:text-sm text-stone-700">
                          <Check className="w-4 h-4 text-[#8C7A6B] shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3 text-center">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C7A6B] block font-bold">
                      RESERVA DIRECTA OFICIAL
                    </span>
                    <p className="text-xs text-stone-500 italic font-serif">
                      Seña del 50% por transferencia CBU / Alias directo al anfitrión.
                    </p>
                    <button
                      onClick={() => {
                        if (onOpenBookingModal) {
                          onOpenBookingModal();
                        } else {
                          alert('Abriendo motor de reservas directas...');
                        }
                      }}
                      className="w-full py-3 bg-[#1F1B18] hover:bg-black text-[#FAF8F5] text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Consultar Estadía
                    </button>
                  </div>
                </div>

              </div>
            );
          })()}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ULTRA-MINIMALIST FOOTER                                                */}
      {/* ========================================================================= */}
      <footer className="relative z-20 max-w-4xl mx-auto px-4 text-center text-[10px] font-mono text-[#A89F95] pt-4 select-none">
        <span>CORTE DELLE VETTE • MAQUETACIÓN EDITORIAL TRÍPTICO</span>
      </footer>

    </div>
  );
};
