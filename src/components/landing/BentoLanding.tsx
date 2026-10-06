import React, { useState } from 'react';
import {
  Play,
  Sparkles,
  Calendar,
  Building2,
  ChevronRight,
  X,
  Globe,
  Crown,
  Smartphone,
  CheckCircle2,
  Check,
  KeyRound,
  ShieldCheck,
  Layers,
  ArrowRight,
  Wifi,
} from 'lucide-react';
import {
  getStoredXeniaAvatar,
  setStoredXeniaAvatar,
} from '../xenia/XeniaAvatar';

interface BentoLandingProps {
  onOpenDemo: () => void;
  onOpenContact: (planOrTopic?: string) => void;
  onOpenLogin?: () => void;
  theme?: 'light' | 'dark';
}

type ModuleKey =
  | 'hero'
  | 'xenia'
  | 'calendar'
  | 'whatsapp'
  | 'housekeeping'
  | 'revenue'
  | 'website_signature'
  | 'pricing'
  | 'channels'
  | 'onboarding'
  | 'metrics';

export const BentoLanding: React.FC<BentoLandingProps> = ({
  onOpenDemo,
  onOpenContact,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';

  // Active module for interactive drawer/modal
  const [activeModule, setActiveModule] = useState<ModuleKey | null>(null);

  // Dynamic rotating accommodation types and orange adjectives
  const ROTATING_ITEMS = [
    { type: 'Cabañas & Bungalows', icon: '🌲', adjective: 'Simple' },
    { type: 'Glampings & Domos', icon: '⛺', adjective: 'Ágil' },
    { type: 'Departamentos Turísticos', icon: '🏢', adjective: 'Modular' },
    { type: 'Posadas & Lodges', icon: '🏡', adjective: 'Intuitivo' },
    { type: 'Alquileres Temporarios', icon: '🛎️', adjective: 'Sin Comisiones' },
  ];
  const [rotatingIndex, setRotatingIndex] = useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setRotatingIndex((prev) => (prev + 1) % ROTATING_ITEMS.length);
    }, 2600);
    return () => clearInterval(timer);
  }, [ROTATING_ITEMS.length]);

  // Dynamic Xenia Avatar state synced with app
  const [xeniaAvatarUrl, setXeniaAvatarUrl] = useState<string>(() => getStoredXeniaAvatar());

  React.useEffect(() => {
    const syncAvatar = () => {
      setXeniaAvatarUrl(getStoredXeniaAvatar());
    };
    window.addEventListener('xenia-avatar-changed', syncAvatar);
    return () => window.removeEventListener('xenia-avatar-changed', syncAvatar);
  }, []);

  const plans = [
    {
      id: 'plan-esencial',
      name: '1. Inicial (5 a 10 Unidades)',
      tag: 'Cabañas, Glampings & Anfitriones',
      price: 45000,
      usd: 30,
      highlight: false,
      badge: '5 A 10 UNIDADES',
      description: 'Motor directo con señas 50% por WhatsApp/CBU, Guía QR del huésped y plantillas Bay, Retrato y Urbano.',
      features: [
        'De 5 a 10 cabañas, deptos o unidades',
        'Motor de reservas directo sin comisiones',
        'Cálculo automático de seña (50%) por CBU/Alias',
        'Guía digital del huésped con clave Wi-Fi y mapa',
        'Sincronización con Airbnb y Booking (iCal)',
        'Colección Esencial: Plantillas Bay, Retrato y Urbano',
      ],
    },
    {
      id: 'plan-pro',
      name: '2. Escala (15 a 20 Unidades)',
      tag: 'Complejos Medianos, Aparts & Posadas',
      price: 60000,
      usd: 40,
      highlight: true,
      badge: 'MÁS ELEGIDO • 15 A 20 UNIDADES',
      description: 'Todo lo del plan Inicial + Módulo móvil para Mucamas, Caja Diaria, control de turnos operativos y WhatsApp.',
      features: [
        'De 15 a 20 cabañas, suites o departamentos',
        'Todo lo del Plan Inicial',
        'App móvil para Mucamas (control de sábanas y limpieza)',
        'Caja diaria, balance de señas y cobros pendientes',
        'Calendario multi-usuario y asignación operativa',
        'Soporte prioritario 1:1 por WhatsApp',
      ],
    },
    {
      id: 'plan-luxury',
      name: '3. Signature',
      tag: 'Glamping, Bodegas & Hoteles Boutique',
      price: 80000,
      usd: 55,
      highlight: false,
      badge: 'ALTA GAMA & LUXURY',
      description: 'Webs de Alta Costura (Parallax, Canvas, Bento), Portal VIP coordinado 1:1 y posicionamiento de tarifa premium.',
      features: [
        'Bodegas con hospitalidad, glampings de autor y lodges',
        'Colección Signature: Diseños Parallax, Canvas y Bento',
        'Portal móvil de Bienvenida VIP personalizado',
        'Integración con dominio oficial propio (.com / .com.ar)',
        'Curaduría estética de fotos, historia y gastronomía',
        'Posicionamiento para cobrar tarifas altas por noche',
      ],
    },
  ];

  // Card base styles: modern soft borders, zero spreadsheet feel, comfortable padding
  const cardBaseStyle = isDark
    ? 'bg-zinc-900/80 hover:bg-zinc-900 border border-white/10 shadow-xl shadow-black/20 hover:border-white/20 text-zinc-100'
    : 'bg-white/95 hover:bg-white border border-stone-200/80 shadow-lg shadow-stone-300/30 hover:border-stone-300 text-stone-900';

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#F4F2ED] dark:bg-[#090A0C] text-[#18181B] dark:text-[#EFECE5] transition-colors py-4 sm:py-6 md:py-8 px-3 sm:px-5 lg:px-8 font-sans select-none flex flex-col justify-center">
      <div className="max-w-7xl mx-auto w-full space-y-4 sm:space-y-5">

        {/* ========================================================================= */}
        {/* ROW 1: TOP ASYMMETRICAL HEADER (HERO 8 COLS + METRICS 4 COLS)             */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          
          {/* Tile A: Monumental Core Title (Hero Card) - Mobile-First & Spacious */}
          <div
            onClick={() => setActiveModule('hero')}
            className={`w-full lg:col-span-8 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 group relative overflow-hidden active:scale-[0.99] ${cardBaseStyle}`}
          >
            {/* Top Badge & Indicator */}
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-200/80 dark:border-white/10">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E1500A]" />
                PMS & CANALES / LOOMI SUITE
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E1500A] animate-pulse shrink-0" />
                <span className="text-xs font-mono font-bold text-[#E1500A] group-hover:underline transition-colors">
                  Descubrir +
                </span>
              </div>
            </div>

            {/* Main Headline */}
            <div className="my-5 sm:my-6 space-y-4 sm:space-y-5">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-extrabold tracking-tight leading-[1.18] sm:leading-[1.12] text-stone-900 dark:text-white">
                Software de gestión a la medida de tu alojamiento
              </h1>

              {/* Dynamic Rotator Line: Accommodation Types + Orange Keywords */}
              <div className="flex items-center gap-2.5 flex-wrap pt-1">
                <div className="inline-flex items-center gap-2 bg-stone-900 dark:bg-white text-white dark:text-stone-950 px-4 py-2 rounded-xl font-mono text-xs sm:text-sm font-bold shadow-sm min-h-[44px]">
                  <span className="text-base">{ROTATING_ITEMS[rotatingIndex].icon}</span>
                  <span className="transition-all duration-300">
                    {ROTATING_ITEMS[rotatingIndex].type}
                  </span>
                </div>
                <span className="text-[#E1500A] font-mono font-bold text-xs sm:text-sm uppercase tracking-wider bg-[#E1500A]/10 px-3.5 py-2 rounded-xl border border-[#E1500A]/30 min-h-[44px] flex items-center">
                  {ROTATING_ITEMS[rotatingIndex].adjective}
                </span>
                <span className="text-xs sm:text-sm text-stone-600 dark:text-zinc-300 font-medium">
                  • Web propia + Bienvenida en misma estética
                </span>
              </div>

              {/* Mobile-Friendly Touch Chips List (Min-h 44px) */}
              <div className="pt-2 flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none text-xs sm:text-sm font-semibold">
                <span className="px-4 py-2.5 min-h-[44px] rounded-xl bg-stone-100 dark:bg-zinc-800/90 text-stone-800 dark:text-zinc-200 flex items-center gap-2 shrink-0 border border-stone-200/80 dark:border-white/10 shadow-xs">
                  🌲 Cabañas
                </span>
                <span className="px-4 py-2.5 min-h-[44px] rounded-xl bg-stone-100 dark:bg-zinc-800/90 text-stone-800 dark:text-zinc-200 flex items-center gap-2 shrink-0 border border-stone-200/80 dark:border-white/10 shadow-xs">
                  ⛺ Glampings
                </span>
                <span className="px-4 py-2.5 min-h-[44px] rounded-xl bg-stone-100 dark:bg-zinc-800/90 text-stone-800 dark:text-zinc-200 flex items-center gap-2 shrink-0 border border-stone-200/80 dark:border-white/10 shadow-xs">
                  🏢 Deptos
                </span>
                <span className="px-4 py-2.5 min-h-[44px] rounded-xl bg-stone-100 dark:bg-zinc-800/90 text-stone-800 dark:text-zinc-200 flex items-center gap-2 shrink-0 border border-stone-200/80 dark:border-white/10 shadow-xs">
                  🏡 Posadas
                </span>
              </div>
            </div>

            {/* Bottom Actions with Touch Target (44px min-h) */}
            <div className="pt-4 border-t border-stone-200/80 dark:border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 dark:text-zinc-400 font-mono">
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold">
                  3 Diseños Incluidos + 3 Signature
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDemo();
                }}
                className="min-h-[44px] px-6 py-3 rounded-xl bg-[#E1500A] hover:bg-[#C94305] text-white text-sm font-bold transition-all shadow-md shadow-[#E1500A]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Probar Demo en Vivo</span>
              </button>
            </div>
          </div>

          {/* Tile B: Metrics Block (4 Cols) */}
          <div
            onClick={() => setActiveModule('metrics')}
            className={`w-full lg:col-span-4 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 group active:scale-[0.99] ${cardBaseStyle}`}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-200/80 dark:border-white/10">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                MÉTRICAS / IMPACTO PROBADO
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#E1500A] shrink-0" />
            </div>

            <div className="my-auto py-4 sm:py-6 space-y-2.5">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 dark:text-white tracking-tight">
                +850
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-stone-800 dark:text-zinc-100">
                Cabañas y departamentos activos
              </h3>
              <p className="text-sm text-stone-600 dark:text-zinc-400 leading-relaxed font-normal">
                0 overbookings registrados • Setup inicial en menos de 15 minutos sin tarjetas ni contratos atados.
              </p>
            </div>

            <div className="pt-3.5 border-t border-stone-200/80 dark:border-white/10 flex items-center justify-between text-xs sm:text-sm text-stone-500 dark:text-zinc-400 font-mono">
              <span>Rendimiento probado</span>
              <span className="text-stone-900 dark:text-white font-bold group-hover:text-[#E1500A] transition-colors flex items-center gap-1">
                Ver detalle <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* ROW 2: ASYMMETRICAL PUZZLE (STACKED TILES + GIANT XENIA BENTO)             */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          
          {/* Left Column Stack: WhatsApp + Operaciones + Anti-Overbooking (6 Cols) */}
          <div className="w-full lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            
            {/* Tile C: WhatsApp */}
            <div
              onClick={() => setActiveModule('whatsapp')}
              className={`rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 group min-h-[180px] active:scale-[0.99] ${cardBaseStyle}`}
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-stone-200/80 dark:border-white/10">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                  AUTOMATIZACIÓN
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] shrink-0" />
              </div>

              <div className="my-auto py-2.5">
                <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white tracking-tight">
                  WhatsApp
                </h3>
                <p className="text-sm text-stone-600 dark:text-zinc-300 font-normal mt-1 leading-relaxed">
                  Ruta & Confort en 1 clic sin escribir a mano.
                </p>
              </div>

              <div className="pt-2.5 border-t border-stone-200/80 dark:border-white/10 flex items-center justify-between text-xs text-stone-500 dark:text-zinc-400 font-mono">
                <span>6 plantillas listas</span>
                <span className="text-stone-900 dark:text-white font-bold group-hover:text-[#E1500A] transition-colors">
                  Ver +
                </span>
              </div>
            </div>

            {/* Tile D: Operaciones / Housekeeping */}
            <div
              onClick={() => setActiveModule('housekeeping')}
              className={`rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 group min-h-[180px] active:scale-[0.99] ${cardBaseStyle}`}
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-stone-200/80 dark:border-white/10">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                  OPERACIONES
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
              </div>

              <div className="my-auto py-2.5">
                <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white tracking-tight">
                  Limpieza & Equipo
                </h3>
                <p className="text-sm text-stone-600 dark:text-zinc-300 font-normal mt-1 leading-relaxed">
                  Checklist móvil y semáforo de estado en tiempo real.
                </p>
              </div>

              <div className="pt-2.5 border-t border-stone-200/80 dark:border-white/10 flex items-center justify-between text-xs text-stone-500 dark:text-zinc-400 font-mono">
                <span>App de Mucamas</span>
                <span className="text-stone-900 dark:text-white font-bold group-hover:text-[#E1500A] transition-colors">
                  Ver +
                </span>
              </div>
            </div>

            {/* Tile F: Anti-Overbooking Banner */}
            <div
              onClick={() => setActiveModule('calendar')}
              className={`col-span-1 sm:col-span-2 rounded-2xl sm:rounded-3xl p-5 sm:p-7 flex flex-col justify-between cursor-pointer transition-all duration-300 group min-h-[170px] active:scale-[0.99] ${cardBaseStyle}`}
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-stone-200/80 dark:border-white/10">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#E1500A]" />
                  CALENDARIO MULTICANAL / RACK EN VIVO
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#E1500A] shrink-0" />
              </div>

              <div className="my-3 space-y-1.5">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
                  Anti-Overbooking
                </h3>
                <p className="text-sm sm:text-base text-stone-600 dark:text-zinc-300 font-normal leading-relaxed">
                  Airbnb, Booking.com y tu web oficial sincronizados en 3 segundos sin duplicados.
                </p>
              </div>

              <div className="pt-2.5 border-t border-stone-200/80 dark:border-white/10 flex items-center justify-between text-xs sm:text-sm text-stone-500 dark:text-zinc-400 font-mono">
                <span>0 Dobles Reservas</span>
                <span className="text-stone-900 dark:text-white font-bold group-hover:text-[#E1500A] transition-colors flex items-center gap-1">
                  Ver rack interactivo →
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Giant Vertical Bento / Xenia (6 Cols) */}
          <div
            onClick={() => setActiveModule('xenia')}
            className={`w-full lg:col-span-6 rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 group relative overflow-hidden min-h-[340px] active:scale-[0.99] ${cardBaseStyle}`}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-200/80 dark:border-white/10">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                COPILOTO INTELIGENTE / XENIA
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E1500A] animate-pulse shrink-0" />
                <span className="text-xs font-mono font-bold text-[#E1500A]">Copiloto 24/7</span>
              </div>
            </div>

            <div className="my-auto py-4 space-y-4">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[#E1500A]/80 shrink-0 shadow-md bg-stone-900">
                  <img
                    src={xeniaAvatarUrl || '/xenia.jpg'}
                    alt="Xenia"
                    className="w-full h-full object-cover object-top"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      if (!img.src.includes('moderno_plano')) {
                        img.src = '/moderno_plano_medio_corto,_perfil_editorial_de_alto_contraste.jpg';
                      } else if (!img.src.includes('xenia.jpeg')) {
                        img.src = '/xenia.jpeg';
                      }
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-stone-900 dark:text-white tracking-tight">
                    Xenia
                  </h2>
                  <p className="text-sm sm:text-base text-stone-600 dark:text-zinc-400 font-medium">
                    No vas a estar solo en la gestión.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-100/90 dark:bg-zinc-800/80 border border-stone-200/80 dark:border-white/10">
                <p className="text-sm sm:text-base font-normal text-stone-800 dark:text-zinc-200 leading-relaxed">
                  «Te asisto por audio o texto para cargar departamentos, sincronizar tarifas y responderle a tus huéspedes en español rioplatense.»
                </p>
              </div>
            </div>

            <div className="pt-3.5 border-t border-stone-200/80 dark:border-white/10 flex items-center justify-between text-xs sm:text-sm text-stone-500 dark:text-zinc-400 font-mono">
              <span>Voz & WhatsApp inteligente</span>
              <span className="text-stone-900 dark:text-white font-bold group-hover:text-[#E1500A] transition-colors flex items-center gap-1">
                Tocar para escuchar y explorar →
              </span>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* ROW 3: WEBSITE & BIENVENIDA (5 Cols) + CANALES (2 Cols) + PRICING (3 Cols) + ONBOARD (2) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5">
          
          {/* Tile G: Tu Web Oficial & Bienvenida Unificada (5 Cols) */}
          <div
            onClick={() => setActiveModule('website_signature')}
            className={`w-full lg:col-span-5 rounded-2xl sm:rounded-3xl p-5 sm:p-7 flex flex-col justify-between cursor-pointer transition-all duration-300 group min-h-[220px] active:scale-[0.99] border-2 border-[#E1500A]/30 dark:border-[#E1500A]/40 ${cardBaseStyle}`}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-200/80 dark:border-white/10">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E1500A] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#E1500A]" />
                TU WEB + BIENVENIDA AL HUÉSPED
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#E1500A]/10 text-[#E1500A] text-[10px] font-mono font-bold">
                Colección Esencial + Signature
              </span>
            </div>

            <div className="my-auto py-3 space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white tracking-tight">
                El huésped empieza a habitar el espacio antes de llegar
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-300 leading-relaxed font-normal">
                <strong className="text-stone-900 dark:text-white font-semibold">3 plantillas esenciales incluidas</strong> (Bay, Retrato, Urbano) listas para autocompletar + <strong className="text-amber-500 font-semibold">3 modelos Signature de autor</strong> con portal de bienvenida, Wi-Fi y check-in en la misma estética visual continua.
              </p>
            </div>

            <div className="pt-3 border-t border-stone-200/80 dark:border-white/10 flex items-center justify-between text-xs sm:text-sm text-stone-500 dark:text-zinc-400 font-mono">
              <span className="text-[#E1500A] font-bold">0% Comisión Directa</span>
              <span className="text-stone-900 dark:text-white font-bold group-hover:text-[#E1500A] transition-colors flex items-center gap-1">
                Ver 6 diseños y portal →
              </span>
            </div>
          </div>

          {/* Tile H: Canales Oficiales (2 Cols on Desktop) */}
          <div
            onClick={() => setActiveModule('channels')}
            className={`w-full lg:col-span-2 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 group min-h-[220px] active:scale-[0.99] ${cardBaseStyle}`}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-200/80 dark:border-white/10">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                CANALES
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            </div>

            <div className="my-auto space-y-2.5 py-2.5">
              <div className="flex items-center justify-between gap-1 text-xs font-mono">
                <span className="font-bold text-stone-800 dark:text-zinc-200">Airbnb</span>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              </div>
              <div className="flex items-center justify-between gap-1 text-xs font-mono">
                <span className="font-bold text-stone-800 dark:text-zinc-200">Booking.com</span>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
              </div>
              <div className="flex items-center justify-between gap-1 text-xs font-mono">
                <span className="font-bold text-stone-800 dark:text-zinc-200">MP / CBU</span>
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
              </div>
              <div className="flex items-center justify-between gap-1 text-xs font-mono">
                <span className="font-bold text-stone-800 dark:text-zinc-200">WhatsApp</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              </div>
            </div>

            <div className="pt-2.5 border-t border-stone-200/80 dark:border-white/10 text-center text-xs font-mono text-stone-500 dark:text-zinc-400">
              Sincronización Total
            </div>
          </div>

          {/* Tile I: Pricing ARS (3 Cols on Desktop) */}
          <div
            onClick={() => setActiveModule('pricing')}
            className={`w-full lg:col-span-3 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 group min-h-[220px] active:scale-[0.99] ${cardBaseStyle}`}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-200/80 dark:border-white/10">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                PLANES & TARIFAS / ARS
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#E1500A] shrink-0" />
            </div>

            <div className="my-auto py-2.5 space-y-1.5">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
                  $29.000
                </span>
                <span className="text-xs font-mono text-stone-500 dark:text-zinc-400 font-bold">
                  /mes (~$19 USD)
                </span>
              </div>
              <h4 className="text-base font-bold text-stone-800 dark:text-zinc-200">
                Esencial • Pro Escala • Luxury
              </h4>
              <p className="text-xs text-stone-600 dark:text-zinc-400 font-normal leading-relaxed">
                Desde cabañas familiares hasta lodges y bodegas de autor.
              </p>
            </div>

            <div className="pt-2.5 border-t border-stone-200/80 dark:border-white/10 flex items-center justify-between text-xs text-stone-500 dark:text-zinc-400 font-mono">
              <span>3 Planes simples</span>
              <span className="text-stone-900 dark:text-white font-bold group-hover:text-[#E1500A] transition-colors flex items-center gap-1">
                Ver calculadora →
              </span>
            </div>
          </div>

          {/* Tile J: Onboarding / Concierge (2 Cols on Desktop) */}
          <div
            onClick={() => setActiveModule('onboarding')}
            className={`w-full lg:col-span-2 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 group min-h-[220px] active:scale-[0.99] ${cardBaseStyle}`}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-200/80 dark:border-white/10">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                72 HORAS
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-stone-900 dark:bg-white shrink-0" />
            </div>

            <div className="my-auto py-2.5 space-y-1.5">
              <h3 className="text-lg font-extrabold text-stone-900 dark:text-white tracking-tight">
                Llave en Mano
              </h3>
              <p className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed font-normal">
                Carga completa de fotos y calendarios en 72hs.
              </p>
            </div>

            <div className="pt-2.5 border-t border-stone-200/80 dark:border-white/10 flex items-center justify-between text-xs text-stone-500 dark:text-zinc-400 font-mono">
              <span>Asistencia</span>
              <span className="text-stone-900 dark:text-white font-bold group-hover:text-[#E1500A] transition-colors">
                Ver →
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE DETAIL MODAL / DRAWER (OPENS ON BOX CLICK)                    */}
      {/* ========================================================================= */}
      {activeModule && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150 font-sans"
          onClick={() => setActiveModule(null)}
        >
          <div 
            className="bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200/80 dark:border-white/10 w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 md:p-10 shadow-2xl relative text-stone-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button with 44px touch target */}
            <button
              onClick={() => setActiveModule(null)}
              className="absolute top-5 right-5 w-11 h-11 min-h-[44px] min-w-[44px] rounded-2xl border border-stone-200/80 dark:border-zinc-700 text-stone-600 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* DETAIL: WEBSITE & SIGNATURE & BIENVENIDA */}
            {activeModule === 'website_signature' && (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E1500A] flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-500" />
                    COLECCIÓN ESENCIAL & SIGNATURE + BIENVENIDA AL HUÉSPED
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-black mt-1">
                    Tu Web Directa y Portal de Bienvenida en la Misma Estética
                  </h3>
                  <p className="text-stone-500 dark:text-zinc-400 text-xs sm:text-sm mt-1 font-mono">
                    «El huésped empieza a habitar el espacio antes de llegar.»
                  </p>
                </div>

                <p className="text-sm sm:text-base text-stone-600 dark:text-zinc-300 leading-relaxed font-normal">
                  Todas las reservas directas se cobran 100% a tu cuenta bancaria o Mercado Pago con 0% de comisión. El diseño de la web oficial y la guía digital que recibe el huésped comparten la misma tipografía, colores y sofisticación.
                </p>

                {/* 2 Catálogos de Diseños */}
                <div className="space-y-4">
                  <div className="p-4 sm:p-5 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        1. Colección Esencial (Incluida en tu Abono)
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                        AUTOCOMPLETABLE EN 15 MIN
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-700">
                        <strong className="block font-bold text-stone-900 dark:text-white">🏛️ Bay (Por Defecto)</strong>
                        <span className="text-stone-500 dark:text-zinc-400 text-[11px] block mt-0.5">Elegancia boutique clásica serif, fotos cálidas y buscador directo tradicional.</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-700">
                        <strong className="block font-bold text-stone-900 dark:text-white">🌲 Retrato (Opción 1)</strong>
                        <span className="text-stone-500 dark:text-zinc-400 text-[11px] block mt-0.5">Estética arquitectónica oscura (obsidian), suites panorámicas y barra flotante.</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-700">
                        <strong className="block font-bold text-stone-900 dark:text-white">🏙️ Urbano (Opción 2 - Bs. As.)</strong>
                        <span className="text-stone-500 dark:text-zinc-400 text-[11px] block mt-0.5">Lienzo con marco blanco curvo, foto de Buenos Aires y buscador cápsula.</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl border-2 border-amber-500/30 dark:border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Crown className="w-4 h-4 text-amber-500" />
                        2. Colección Signature (Diseño de Autor / Pago Único)
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                        ALTA GAMA BOUTIQUE
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-[#c5a880]/50">
                        <div className="flex items-center justify-between">
                          <strong className="block font-bold text-stone-900 dark:text-white">✨ AURA (Bento Grid)</strong>
                          <span className="text-[10px] font-mono font-bold text-[#c5a880]">$49 USD</span>
                        </div>
                        <span className="text-[#c5a880] text-[11px] font-mono block mt-0.5">Relais & Viñedos de Montaña</span>
                        <span className="text-stone-500 dark:text-zinc-400 text-[11px] block mt-1">Valle de Uco (Mendoza) • 6 tarjetas bento interactivas, 4 suites de viña, cava privada y spa de altura.</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-[#c5a880]/50">
                        <div className="flex items-center justify-between">
                          <strong className="block font-bold text-stone-900 dark:text-white">✨ AURA (Parallax)</strong>
                          <span className="text-[10px] font-mono font-bold text-[#c5a880]">$49 USD</span>
                        </div>
                        <span className="text-[#c5a880] text-[11px] font-mono block mt-0.5">Relais & Viñedos de Montaña</span>
                        <span className="text-stone-500 dark:text-zinc-400 text-[11px] block mt-1">Valle de Uco (Mendoza) • Scroll vertical cinemático, manifiesto arquitectónico a 1.200 msnm y catálogo de suites.</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-[#c5a880]/50">
                        <div className="flex items-center justify-between">
                          <strong className="block font-bold text-stone-900 dark:text-white">✨ AURA (Canvas)</strong>
                          <span className="text-[10px] font-mono font-bold text-[#c5a880]">$49 USD</span>
                        </div>
                        <span className="text-[#c5a880] text-[11px] font-mono block mt-0.5">Relais & Viñedos de Montaña</span>
                        <span className="text-stone-500 dark:text-zinc-400 text-[11px] block mt-1">Valle de Uco (Mendoza) • Canvas arquitectónico horizontal de 6 tarjetas panorámicas y reserva directa oficial.</span>
                      </div>
                    </div>
                  </div>

                  {/* Portal de Bienvenida Coordinado */}
                  <div className="p-4 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-stone-100 dark:bg-zinc-800/80 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#E1500A]/10 text-[#E1500A] flex items-center justify-center shrink-0">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                        Portal Digital de Bienvenida al Huésped
                      </h4>
                      <p className="text-xs text-stone-600 dark:text-zinc-300 mt-0.5 leading-relaxed">
                        Incluye mapa interactivo para llegar, clave Wi-Fi en 1 toque, instrucciones de electrodomésticos, check-in 24hs y recomendaciones gastronómicas. Se abre al escanear el QR en la cabaña o por enlace de WhatsApp.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-200/80 dark:border-zinc-800 flex flex-wrap justify-end gap-3">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenDemo();
                    }}
                    className="min-h-[44px] px-6 py-3 rounded-2xl bg-[#E1500A] text-white font-bold text-sm hover:bg-[#C94305] transition-colors cursor-pointer flex items-center gap-2 shadow-md shadow-[#E1500A]/20"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Ver Diseños en la Demo Interactiva</span>
                  </button>
                </div>
              </div>
            )}

            {/* DETAIL: HERO RESUMEN */}
            {activeModule === 'hero' && (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E1500A]">
                    01 / RESUMEN DEL SISTEMA
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-black mt-1">Loomi Suite: Gestión sin pesadez</h3>
                </div>

                <p className="text-sm sm:text-base text-stone-600 dark:text-zinc-300 leading-relaxed font-normal">
                  Reemplazá el cuaderno, las planillas y los mensajes desordenados con un software visual pensado para alojamientos de 4 a 30+ unidades. Todo conectado: reservas, limpieza, cobros, WhatsApp y tu propia web oficial con portal de bienvenida.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm font-mono text-center">
                  <div className="p-3.5 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 font-bold">🌲 Cabañas</div>
                  <div className="p-3.5 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 font-bold">⛺ Glampings</div>
                  <div className="p-3.5 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 font-bold">🏢 Deptos</div>
                  <div className="p-3.5 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 font-bold">🏡 Posadas</div>
                </div>

                <div className="pt-4 border-t border-stone-200/80 dark:border-zinc-800 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenDemo();
                    }}
                    className="min-h-[44px] px-6 py-3 rounded-2xl bg-[#E1500A] text-white font-bold text-sm hover:bg-[#C94305] transition-colors cursor-pointer flex items-center gap-2 shadow-md shadow-[#E1500A]/20"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Abrir Demo Interactiva</span>
                  </button>
                </div>
              </div>
            )}

            {/* DETAIL: XENIA */}
            {activeModule === 'xenia' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[#E1500A] shrink-0 bg-stone-900">
                    <img
                      src={xeniaAvatarUrl || '/xenia.jpg'}
                      alt="Xenia"
                      className="w-full h-full object-cover object-top"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        if (!img.src.includes('moderno_plano')) {
                          img.src = '/moderno_plano_medio_corto,_perfil_editorial_de_alto_contraste.jpg';
                        } else if (!img.src.includes('xenia.jpeg')) {
                          img.src = '/xenia.jpeg';
                        }
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E1500A]">
                      02 / COPILOTO INTELIGENTE
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black mt-0.5">Xenia: No vas a estar solo</h3>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-stone-600 dark:text-zinc-300 leading-relaxed font-normal">
                  Xenia es una asistente integrada que responde tus dudas operativas del día a día, te enseña a cargar departamentos, sincronizar con Airbnb y redacta mensajes sin tecnicismos en español rioplatense.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 text-xs">
                    <strong className="font-bold block text-sm mb-1 text-stone-900 dark:text-white">🎙️ Por Voz y Texto</strong>
                    <p className="text-stone-600 dark:text-zinc-300">Podés mandarle audios por WhatsApp o hablarle en el panel.</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 text-xs">
                    <strong className="font-bold block text-sm mb-1 text-stone-900 dark:text-white">✨ Sin Manuales</strong>
                    <p className="text-stone-600 dark:text-zinc-300">Te explica cómo configurar tarifas y bloquear fechas en un toque.</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 text-xs">
                    <strong className="font-bold block text-sm mb-1 text-stone-900 dark:text-white">🇦🇷 Cercanía Real</strong>
                    <p className="text-stone-600 dark:text-zinc-300">Entiende el vocabulario de cabañas, señas y rotación turística.</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-200/80 dark:border-zinc-800 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenDemo();
                    }}
                    className="min-h-[44px] px-6 py-3 rounded-2xl bg-[#E1500A] text-white font-bold text-sm hover:bg-[#C94305] transition-colors cursor-pointer shadow-md shadow-[#E1500A]/20"
                  >
                    Probar Copiloto en la Demo
                  </button>
                </div>
              </div>
            )}

            {/* DETAIL: CALENDAR */}
            {activeModule === 'calendar' && (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E1500A]">
                    03 / SINCRONIZACIÓN AUTOMÁTICA
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black mt-1">
                    Calendarios conectados: Chau al miedo a la doble reserva
                  </h3>
                </div>

                <p className="text-sm sm:text-base text-stone-600 dark:text-zinc-300 leading-relaxed font-normal">
                  Sincronizá Airbnb, Booking.com, Vrbo y tus reservas directas. Cuando entra una reserva en cualquier portal, las fechas se bloquean automáticamente en todos los demás en 3 segundos.
                </p>

                <div className="p-4 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 space-y-2 text-xs sm:text-sm font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Cabaña del Bosque</span>
                    <span className="text-[#E1500A] font-bold">Directo • 3 noches reservadas</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Domo Glamping</span>
                    <span className="text-stone-500">Booking.com (Bloqueado en Airbnb)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Depto 102</span>
                    <span className="text-stone-500">Airbnb (Bloqueado en Booking.com)</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-200/80 dark:border-zinc-800 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenDemo();
                    }}
                    className="min-h-[44px] px-6 py-3 rounded-2xl bg-[#E1500A] text-white font-bold text-sm hover:bg-[#C94305] transition-colors cursor-pointer shadow-md shadow-[#E1500A]/20"
                  >
                    Abrir Rack en Vivo
                  </button>
                </div>
              </div>
            )}

            {/* DETAIL: WHATSAPP */}
            {activeModule === 'whatsapp' && (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E1500A]">
                    04 / WHATSAPP AUTOMÁTICO
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black mt-1">
                    Desactivá reclamos antes de que nazcan
                  </h3>
                </div>

                <p className="text-sm sm:text-base text-stone-600 dark:text-zinc-300 leading-relaxed font-normal">
                  Envía la coordinación de ruta, clave Wi-Fi al llegar y control de confort a las 2 horas para solucionar cualquier detalle en privado antes de que se transforme en una mala reseña.
                </p>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 text-xs space-y-1">
                    <strong className="text-[#E1500A] font-bold text-sm block">1. Coordinación en Ruta</strong>
                    <p className="text-stone-600 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed">«Avísennos cuando estén a 40 minutos de llegar para esperarlos con el departamento templado.»</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 text-xs space-y-1">
                    <strong className="font-bold text-sm block text-stone-900 dark:text-white">2. Control de Confort (2hs Post-Ingreso)</strong>
                    <p className="text-stone-600 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed">«¿Encontraron todo impecable? Cualquier consulta nos avisan por acá.»</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-200/80 dark:border-zinc-800 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenDemo();
                    }}
                    className="min-h-[44px] px-6 py-3 rounded-2xl bg-[#E1500A] text-white font-bold text-sm hover:bg-[#C94305] transition-colors cursor-pointer shadow-md shadow-[#E1500A]/20"
                  >
                    Probar WhatsApp en la Demo
                  </button>
                </div>
              </div>
            )}

            {/* DETAIL: HOUSEKEEPING */}
            {activeModule === 'housekeeping' && (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E1500A]">
                    05 / MUCAMAS & OPERACIONES
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black mt-1">
                    Operaciones bajo control sin gritos ni confusiones
                  </h3>
                </div>

                <p className="text-sm sm:text-base text-stone-600 dark:text-zinc-300 leading-relaxed font-normal">
                  Tu equipo de limpieza tiene un acceso simple desde su propio celular sin usuario ni clave complicada. Ven qué unidades tocan hoy, marcan sábanas cambiadas y te avisan con 1 toque cuando la cabaña está lista para el próximo ingreso.
                </p>

                <div className="pt-4 border-t border-stone-200/80 dark:border-zinc-800 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenDemo();
                    }}
                    className="min-h-[44px] px-6 py-3 rounded-2xl bg-[#E1500A] text-white font-bold text-sm hover:bg-[#C94305] transition-colors cursor-pointer shadow-md shadow-[#E1500A]/20"
                  >
                    Ver Módulo de Limpieza
                  </button>
                </div>
              </div>
            )}

            {/* DETAIL: REVENUE */}
            {activeModule === 'revenue' && (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E1500A]">
                    06 / 0% COMISIÓN
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black mt-1">
                    Recuperá hasta un 18% que hoy se llevan las OTAs
                  </h3>
                </div>

                <p className="text-sm sm:text-base text-stone-600 dark:text-zinc-300 leading-relaxed font-normal">
                  Tu web oficial y motor de reservas directas te permite cobrar la seña del 50% por transferencia bancaria directa (CBU/CVU) o link de pago sin intermediarios.
                </p>

                <div className="pt-4 border-t border-stone-200/80 dark:border-zinc-800 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenDemo();
                    }}
                    className="min-h-[44px] px-6 py-3 rounded-2xl bg-[#E1500A] text-white font-bold text-sm hover:bg-[#C94305] transition-colors cursor-pointer shadow-md shadow-[#E1500A]/20"
                  >
                    Ver Motor de Reservas
                  </button>
                </div>
              </div>
            )}

            {/* DETAIL: PRICING */}
            {activeModule === 'pricing' && (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E1500A]">
                    07 / PLANES SIMPLES EN PESOS
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black mt-1">
                    Tarifas transparentes adaptadas a la escala de tu complejo
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map((p) => (
                    <div
                      key={p.id}
                      className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                        p.highlight
                          ? 'border-[#E1500A] bg-[#E1500A]/5 dark:bg-[#E1500A]/10 shadow-lg'
                          : 'border-stone-200/80 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono text-[#E1500A] uppercase tracking-wider">{p.badge}</span>
                          <span className="text-xs font-mono text-stone-500 font-bold">${p.usd} USD</span>
                        </div>
                        <h4 className="text-base font-extrabold text-stone-900 dark:text-white leading-tight">{p.name}</h4>
                        <div className="text-2xl font-black mt-1 text-stone-900 dark:text-white">
                          ${p.price.toLocaleString('es-AR')} <span className="text-xs font-normal opacity-70">/mes</span>
                        </div>
                        <p className="text-xs text-stone-600 dark:text-zinc-300 leading-relaxed pt-1 border-t border-stone-200/60 dark:border-white/10">
                          {p.description}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-stone-200/60 dark:border-white/10 text-xs">
                        {p.features?.map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-stone-700 dark:text-zinc-300 text-[11px]">
                            <Check className="w-3.5 h-3.5 text-[#E1500A] shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-stone-200/80 dark:border-zinc-800 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenContact('Planes y Tarifas Loomi Suite');
                    }}
                    className="min-h-[44px] px-6 py-3 rounded-2xl bg-[#E1500A] text-white font-bold text-sm hover:bg-[#C94305] transition-colors cursor-pointer shadow-md shadow-[#E1500A]/20"
                  >
                    Hablar con un Asesor
                  </button>
                </div>
              </div>
            )}

            {/* DETAIL: CHANNELS */}
            {activeModule === 'channels' && (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E1500A]">
                    08 / CANALES OFICIALES
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black mt-1">
                    Conexión bidireccional en tiempo real
                  </h3>
                </div>

                <p className="text-sm sm:text-base text-stone-600 dark:text-zinc-300 leading-relaxed font-normal">
                  Conectamos mediante enlaces iCal y APIs oficiales para que tu inventario esté sincronizado segundo a segundo con Airbnb, Booking.com, Vrbo, Google Vacation Rentals y tu propia web.
                </p>

                <div className="pt-4 border-t border-stone-200/80 dark:border-zinc-800 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenDemo();
                    }}
                    className="min-h-[44px] px-6 py-3 rounded-2xl bg-[#E1500A] text-white font-bold text-sm hover:bg-[#C94305] transition-colors cursor-pointer shadow-md shadow-[#E1500A]/20"
                  >
                    Probar Sincronización
                  </button>
                </div>
              </div>
            )}

            {/* DETAIL: ONBOARDING */}
            {activeModule === 'onboarding' && (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E1500A]">
                    09 / SERVICIO CONCIERGE
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black mt-1">
                    Servicio Llave en Mano en 72 horas
                  </h3>
                </div>

                <p className="text-sm sm:text-base text-stone-600 dark:text-zinc-300 leading-relaxed font-normal">
                  Si no disponés de tiempo para cargar fotos, registrar tus departamentos o vincular los enlaces iCal de Airbnb y Booking, nuestro equipo hace el 100% de la puesta en marcha inicial por vos.
                </p>

                <div className="p-4 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 text-xs sm:text-sm font-semibold space-y-2">
                  <p>✅ Configuración de todas tus unidades y fotos</p>
                  <p>✅ Enlace bidireccional de calendarios iCal</p>
                  <p>✅ Guía digital interactiva con tu clave Wi-Fi y mapa</p>
                  <p>✅ Capacitación inicial personalizada para vos y tu equipo</p>
                </div>

                <div className="pt-4 border-t border-stone-200/80 dark:border-zinc-800 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenContact('Servicio Concierge Onboarding Llave en Mano');
                    }}
                    className="min-h-[44px] px-6 py-3 rounded-2xl bg-[#E1500A] text-white font-bold text-sm hover:bg-[#C94305] transition-colors cursor-pointer shadow-md shadow-[#E1500A]/20"
                  >
                    Pedir Presupuesto Llave en Mano
                  </button>
                </div>
              </div>
            )}

            {/* DETAIL: METRICS */}
            {activeModule === 'metrics' && (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E1500A]">
                    METRICS & PROOF
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black mt-1">
                    Resultados reales en complejos activos
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 text-center">
                    <span className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white">+850</span>
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400 mt-1 font-bold">Cabañas y departamentos</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 text-center">
                    <span className="text-3xl sm:text-4xl font-black text-[#E1500A]">0</span>
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400 mt-1 font-bold">Dobles reservas</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 text-center">
                    <span className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white">15 min</span>
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400 mt-1 font-bold">Puesta en marcha promedio</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-200/80 dark:border-zinc-800 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenDemo();
                    }}
                    className="min-h-[44px] px-6 py-3 rounded-2xl bg-[#E1500A] text-white font-bold text-sm hover:bg-[#C94305] transition-colors cursor-pointer shadow-md shadow-[#E1500A]/20"
                  >
                    Probar el Sistema en Vivo
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
