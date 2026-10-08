import React, { useState } from 'react';
import {
  Play,
  Sparkles,
  Calendar,
  ChevronRight,
  X,
  Globe,
  Crown,
  Smartphone,
  CheckCircle2,
  Check,
  MessageCircle,
  Sparkle,
  ArrowRight,
  ShieldCheck,
  Send,
} from 'lucide-react';
import {
  getStoredXeniaAvatar,
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
  | 'website_models'
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

  // Active module for interactive clean modal
  const [activeModule, setActiveModule] = useState<ModuleKey | null>(null);

  // Dynamic rotating accommodation types
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
    }, 2800);
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
      id: 'plan-simple',
      name: 'Loomi',
      tag: 'Hasta 5 unidades • Dueños sin personal',
      price: 45000,
      usd: 30,
      highlight: false,
      badge: 'PLAN PROPIETARIO • HASTA 5 U.',
      description: 'La herramienta perfecta para dueños que gestionan todo de forma autónoma desde el celular. Calendario modo light y reservas.',
      features: [
        'Calendario Rack (Modo Light optimizado para móvil)',
        'Gestión de Reservas Directas & iCal',
        'Reportes de Rendimiento Básicos',
        'Sin costos por habitación (precio por todo el complejo)',
      ],
    },
    {
      id: 'plan-suite',
      name: 'Loomi Suite',
      tag: 'Unidades Ilimitadas • Complejo Total',
      price: 60000,
      usd: 40,
      highlight: true,
      badge: 'RECOMENDADO • TODO INCLUIDO',
      description: 'La solución definitiva para complejos que operan con personal de recepción y equipos de limpieza. Ecosistema ilimitado.',
      features: [
        'Todo lo del Plan Loomi e iCal avanzado',
        'Módulo Housekeeping Completo (Semáforo de Mucamas en vivo)',
        'Modo Recepción con Roles de Usuario Separados',
        'Asistente Xenia AI (Voz & Copiloto 24/7)',
        'Web propia con Portal de Bienvenida del Huésped',
      ],
    },
  ];

  // Zen soft card base styling: thin lines, soft borders, negative space Ma
  const cardBaseStyle = isDark
    ? 'bg-[#15161A] hover:bg-[#18191E] border border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:border-white/10 text-zinc-100'
    : 'bg-white hover:bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:border-orange-200/50 text-[#2D3748]';

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#F8F9FA] dark:bg-[#0E0F12] text-[#2D3748] dark:text-[#E2E8F0] transition-colors py-4 sm:py-6 md:py-8 px-3 sm:px-6 lg:px-8 font-sans select-none flex flex-col justify-center">
      <div className="max-w-7xl mx-auto w-full space-y-4 sm:space-y-5">

        {/* ========================================================================= */}
        {/* ROW 1: TOP ASYMMETRICAL HEADER (HERO 8 COLS + METRICS 4 COLS)             */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          
          {/* Tile A: Monumental Core Title (Hero Card) */}
          <div
            onClick={() => setActiveModule('hero')}
            className={`w-full lg:col-span-8 rounded-3xl p-6 sm:p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 group relative overflow-hidden active:scale-[0.99] ${cardBaseStyle}`}
          >
            {/* Top Badge & Sutil Indicator */}
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-50 dark:border-white/5">
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-gray-400 dark:text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E67E22]" />
                PMS & CANALES • LOOMI SUITE
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E67E22] animate-pulse shrink-0" />
                <span className="text-xs font-medium text-[#E67E22] group-hover:underline transition-colors">
                  Descubrir +
                </span>
              </div>
            </div>

            {/* Main Headline */}
            <div className="my-5 sm:my-6 space-y-4 sm:space-y-5">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-[1.18] text-gray-900 dark:text-white">
                Software de gestión <br className="hidden sm:inline" />
                <span className="font-normal text-gray-700 dark:text-gray-200">a la medida de tu alojamiento</span>
              </h1>

              {/* Dynamic Rotator Line: Accommodation Types + Orange Keywords */}
              <div className="flex items-center gap-2.5 flex-wrap pt-1 text-xs sm:text-sm">
                <div className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3.5 py-1.5 rounded-xl font-medium shadow-xs">
                  <span>{ROTATING_ITEMS[rotatingIndex].icon}</span>
                  <span className="transition-all duration-300">
                    {ROTATING_ITEMS[rotatingIndex].type}
                  </span>
                </div>
                <span className="text-[#E67E22] font-semibold uppercase tracking-wider bg-orange-50 dark:bg-orange-950/40 px-3 py-1.5 rounded-xl border border-orange-100/60 dark:border-orange-900/30">
                  {ROTATING_ITEMS[rotatingIndex].adjective}
                </span>
                <span className="text-gray-400 dark:text-zinc-400 font-light">
                  • Web propia + Bienvenida en misma estética
                </span>
              </div>

              {/* Sutil Category Badges */}
              <div className="pt-2 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-medium">
                <span className="px-3.5 py-1.5 rounded-xl bg-gray-50 dark:bg-zinc-800/80 text-gray-600 dark:text-zinc-300 border border-gray-100 dark:border-white/5 shrink-0">
                  🌲 Glampings & Bungalows
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-[#FDF3E7] text-[#E67E22] dark:bg-orange-950/40 dark:text-orange-300 border border-orange-100/60 dark:border-orange-900/30 shrink-0">
                  ⛺ Domos & Lodges
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-gray-50 dark:bg-zinc-800/80 text-gray-600 dark:text-zinc-300 border border-gray-100 dark:border-white/5 shrink-0">
                  🏢 Deptos Turísticos
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-gray-50 dark:bg-zinc-800/80 text-gray-600 dark:text-zinc-300 border border-gray-100 dark:border-white/5 shrink-0">
                  🏡 Posadas & Aparts
                </span>
              </div>
            </div>

            {/* Bottom Actions with Zen CTA */}
            <div className="pt-4 border-t border-gray-50 dark:border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <span className="text-xs text-gray-400 dark:text-zinc-400 font-light">
                3 Modelos Web Oficiales incluidos en Loomi Suite
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDemo();
                }}
                className="px-5 py-2.5 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-medium transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Probar Demo en Vivo</span>
              </button>
            </div>
          </div>

          {/* Tile B: Metrics Block (4 Cols) */}
          <div
            onClick={() => setActiveModule('metrics')}
            className={`w-full lg:col-span-4 rounded-3xl p-6 sm:p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 group active:scale-[0.99] ${cardBaseStyle}`}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-50 dark:border-white/5">
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-gray-400 dark:text-zinc-400">
                MÉTRICAS / IMPACTO
              </span>
              <span className="w-2 h-2 rounded-full bg-[#E67E22] shrink-0" />
            </div>

            <div className="my-auto py-4 sm:py-6 space-y-2">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-extralight text-gray-900 dark:text-white tracking-tight">
                +850
              </div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-zinc-100">
                Cabañas y unidades activas
              </h3>
              <p className="text-xs text-gray-400 dark:text-zinc-400 leading-relaxed font-light">
                0 overbookings registrados • Puesta en marcha en 15 minutos sin tarjetas ni contratos atados.
              </p>
            </div>

            <div className="pt-3.5 border-t border-gray-50 dark:border-white/5 flex items-center justify-between text-xs text-gray-400 dark:text-zinc-400 font-light">
              <span>Rendimiento probado</span>
              <span className="text-gray-700 dark:text-gray-200 font-medium group-hover:text-[#E67E22] transition-colors flex items-center gap-1">
                Ver detalle <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* ROW 2: ASYMMETRICAL PUZZLE (WHATSAPP + LIMPIEZA + OVERBOOKING + XENIA 2X)  */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5">
          
          {/* Tile C: WhatsApp (3 Cols on Desktop) */}
          <div
            onClick={() => setActiveModule('whatsapp')}
            className={`w-full sm:col-span-1 lg:col-span-3 rounded-3xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 group min-h-[175px] active:scale-[0.99] ${cardBaseStyle}`}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-50 dark:border-white/5">
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-gray-400 dark:text-zinc-400">
                AUTOMATIZACIÓN
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            </div>

            <div className="my-auto py-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white tracking-tight">
                WhatsApp
              </h3>
              <p className="text-xs text-gray-400 dark:text-zinc-400 font-light mt-1 leading-relaxed">
                Ruta, bienvenida y cobro en 1 clic sin escribir a mano.
              </p>
            </div>

            <div className="pt-2.5 border-t border-gray-50 dark:border-white/5 flex items-center justify-between text-xs text-gray-400 dark:text-zinc-400 font-light">
              <span>3 modelos web</span>
              <span className="text-gray-700 dark:text-gray-200 font-medium group-hover:text-[#E67E22] transition-colors">
                Ver +
              </span>
            </div>
          </div>

          {/* Tile D: Operaciones / Housekeeping (3 Cols on Desktop) */}
          <div
            onClick={() => setActiveModule('housekeeping')}
            className={`w-full sm:col-span-1 lg:col-span-3 rounded-3xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 group min-h-[175px] active:scale-[0.99] ${cardBaseStyle}`}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-50 dark:border-white/5">
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-gray-400 dark:text-zinc-400">
                OPERACIONES
              </span>
              <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
            </div>

            <div className="my-auto py-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white tracking-tight">
                Limpieza & Equipo
              </h3>
              <p className="text-xs text-gray-400 dark:text-zinc-400 font-light mt-1 leading-relaxed">
                Checklist móvil para mucamas y semáforo de estado en vivo.
              </p>
            </div>

            <div className="pt-2.5 border-t border-gray-50 dark:border-white/5 flex items-center justify-between text-xs text-gray-400 dark:text-zinc-400 font-light">
              <span>App de Mucamas</span>
              <span className="text-gray-700 dark:text-gray-200 font-medium group-hover:text-[#E67E22] transition-colors">
                Ver +
              </span>
            </div>
          </div>

          {/* Tile E: Giant Vertical Bento Xenia AI (6 Cols x 2 Rows de Alto) */}
          <div
            onClick={() => setActiveModule('xenia')}
            className={`w-full sm:col-span-2 lg:col-span-6 lg:row-span-2 rounded-3xl p-6 sm:p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 group relative overflow-hidden min-h-[340px] active:scale-[0.99] ${cardBaseStyle}`}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-50 dark:border-white/5">
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-gray-400 dark:text-zinc-400">
                COPILOTO INTELIGENTE / XENIA AI
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E67E22] animate-pulse shrink-0" />
                <span className="text-xs font-medium text-[#E67E22]">Activo 24/7</span>
              </div>
            </div>

            <div className="my-auto py-4 space-y-4">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-orange-100 dark:border-orange-950 shrink-0 shadow-xs bg-orange-50 dark:bg-zinc-800">
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
                  <h2 className="text-2xl sm:text-3xl font-light text-gray-900 dark:text-white tracking-tight">
                    Xenia
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-400 dark:text-zinc-400 font-light">
                    No vas a estar solo en la gestión.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-zinc-800/50 border border-gray-100 dark:border-white/5">
                <p className="text-xs sm:text-sm font-light text-gray-600 dark:text-zinc-300 leading-relaxed">
                  «Te asisto por voz o texto para cargar departamentos, sincronizar tarifas y responder consultas operativas sin manuales pesados.»
                </p>
              </div>
            </div>

            <div className="pt-3.5 border-t border-gray-50 dark:border-white/5 flex items-center justify-between text-xs text-gray-400 dark:text-zinc-400 font-light">
              <span>Voz & WhatsApp inteligente</span>
              <span className="text-gray-700 dark:text-gray-200 font-medium group-hover:text-[#E67E22] transition-colors flex items-center gap-1">
                Tocar para consultar →
              </span>
            </div>
          </div>

          {/* Tile F: Anti-Overbooking Banner (6 Cols) */}
          <div
            onClick={() => setActiveModule('calendar')}
            className={`w-full sm:col-span-2 lg:col-span-6 rounded-3xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 group min-h-[175px] active:scale-[0.99] ${cardBaseStyle}`}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-50 dark:border-white/5">
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-gray-400 dark:text-zinc-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#E67E22]" />
                RACK MULTICANAL EN TIEMPO REAL
              </span>
              <span className="w-2 h-2 rounded-full bg-[#E67E22] shrink-0" />
            </div>

            <div className="my-2 space-y-1">
              <h3 className="text-xl sm:text-2xl font-light text-gray-900 dark:text-white tracking-tight">
                Anti-<span className="font-semibold text-gray-800 dark:text-gray-100">Overbooking</span>
              </h3>
              <p className="text-xs text-gray-400 dark:text-zinc-400 font-light leading-relaxed">
                Airbnb, Booking.com y tu web oficial sincronizados en 3 segundos sin dobles reservas.
              </p>
            </div>

            <div className="pt-2.5 border-t border-gray-50 dark:border-white/5 flex items-center justify-between text-xs text-gray-400 dark:text-zinc-400 font-light">
              <span>0 Errores de calendario</span>
              <span className="text-gray-700 dark:text-gray-200 font-medium group-hover:text-[#E67E22] transition-colors flex items-center gap-1">
                Ver rack interactivo →
              </span>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* ROW 3: WEBSITE & BIENVENIDA (5 Cols) + CANALES (2) + PRICING (3) + ONBOARD (2) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5">
          
          {/* Tile G: Tu Web Oficial & Bienvenida Unificada (5 Cols) */}
          <div
            onClick={() => setActiveModule('website_models')}
            className={`w-full sm:col-span-2 lg:col-span-5 rounded-3xl p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 group min-h-[200px] active:scale-[0.99] border-2 border-orange-100/70 dark:border-orange-950/40 ${cardBaseStyle}`}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-50 dark:border-white/5">
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#E67E22] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#E67E22]" />
                TU WEB + PORTAL DEL HUÉSPED
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#FDF3E7] dark:bg-orange-950/40 text-[#E67E22] text-[10px] font-medium">
                3 Modelos Web Oficiales
              </span>
            </div>

            <div className="my-auto py-2.5 space-y-1.5">
              <h3 className="text-xl font-light text-gray-900 dark:text-white tracking-tight">
                El huésped habita el espacio <span className="font-semibold text-gray-800 dark:text-gray-100">antes de llegar</span>
              </h3>
              <p className="text-xs text-gray-400 dark:text-zinc-400 leading-relaxed font-light">
                3 modelos web de autor incluidos (Refugio Dos Aguas, Corte delle Vette y Médano Blanco) con clave Wi-Fi y guía interactiva continua.
              </p>
            </div>

            <div className="pt-2.5 border-t border-gray-50 dark:border-white/5 flex items-center justify-between text-xs text-gray-400 dark:text-zinc-400 font-light">
              <span className="text-[#E67E22] font-medium">0% Comisión Directa</span>
              <span className="text-gray-700 dark:text-gray-200 font-medium group-hover:text-[#E67E22] transition-colors flex items-center gap-1">
                Ver diseños →
              </span>
            </div>
          </div>

          {/* Tile H: Canales Oficiales (2 Cols) */}
          <div
            onClick={() => setActiveModule('channels')}
            className={`w-full sm:col-span-1 lg:col-span-2 rounded-3xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 group min-h-[200px] active:scale-[0.99] ${cardBaseStyle}`}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-50 dark:border-white/5">
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-gray-400 dark:text-zinc-400">
                CANALES
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            </div>

            <div className="my-auto space-y-2 py-2">
              <div className="flex items-center justify-between gap-1 text-xs font-light">
                <span className="text-gray-600 dark:text-zinc-300">Airbnb</span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              </div>
              <div className="flex items-center justify-between gap-1 text-xs font-light">
                <span className="text-gray-600 dark:text-zinc-300">Booking.com</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
              </div>
              <div className="flex items-center justify-between gap-1 text-xs font-light">
                <span className="text-gray-600 dark:text-zinc-300">MP / CBU</span>
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
              </div>
              <div className="flex items-center justify-between gap-1 text-xs font-light">
                <span className="text-gray-600 dark:text-zinc-300">WhatsApp</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              </div>
            </div>

            <div className="pt-2.5 border-t border-gray-50 dark:border-white/5 text-center text-xs text-gray-400 dark:text-zinc-400 font-light">
              Sincronización Total
            </div>
          </div>

          {/* Tile I: Pricing ARS (3 Cols) */}
          <div
            onClick={() => setActiveModule('pricing')}
            className={`w-full sm:col-span-1 lg:col-span-3 rounded-3xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 group min-h-[200px] active:scale-[0.99] ${cardBaseStyle}`}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-50 dark:border-white/5">
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-gray-400 dark:text-zinc-400">
                PLANES / ARS
              </span>
              <span className="w-2 h-2 rounded-full bg-[#E67E22] shrink-0" />
            </div>

            <div className="my-auto py-2 space-y-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-light text-gray-900 dark:text-white tracking-tight">
                  $45.000
                </span>
                <span className="text-xs text-gray-400 dark:text-zinc-400 font-light">
                  /mes (~$30 USD)
                </span>
              </div>
              <h4 className="text-xs font-medium text-gray-700 dark:text-zinc-200">
                Loomi • Loomi Suite
              </h4>
              <p className="text-[11px] text-gray-400 dark:text-zinc-400 font-light leading-relaxed">
                Sin comisiones por reserva ni cobro por habitación.
              </p>
            </div>

            <div className="pt-2.5 border-t border-gray-50 dark:border-white/5 flex items-center justify-between text-xs text-gray-400 dark:text-zinc-400 font-light">
              <span>2 Planes Fijos</span>
              <span className="text-gray-700 dark:text-gray-200 font-medium group-hover:text-[#E67E22] transition-colors flex items-center gap-1">
                Ver planes →
              </span>
            </div>
          </div>

          {/* Tile J: Onboarding Llave en Mano (2 Cols) */}
          <div
            onClick={() => setActiveModule('onboarding')}
            className={`w-full sm:col-span-2 lg:col-span-2 rounded-3xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 group min-h-[200px] active:scale-[0.99] ${cardBaseStyle}`}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-50 dark:border-white/5">
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-gray-400 dark:text-zinc-400">
                72 HORAS
              </span>
              <span className="w-2 h-2 rounded-full bg-gray-900 dark:bg-white shrink-0" />
            </div>

            <div className="my-auto py-2 space-y-1">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white tracking-tight">
                Llave en Mano
              </h3>
              <p className="text-xs text-gray-400 dark:text-zinc-400 leading-relaxed font-light">
                Carga inicial de fotos y calendarios iCal en 72hs.
              </p>
            </div>

            <div className="pt-2.5 border-t border-gray-50 dark:border-white/5 flex items-center justify-between text-xs text-gray-400 dark:text-zinc-400 font-light">
              <span>Asistencia</span>
              <span className="text-gray-700 dark:text-gray-200 font-medium group-hover:text-[#E67E22] transition-colors">
                Ver →
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* VENTANAS DE PRESTACIONES / MODALES LIMPIOS CON BACKDROP-BLUR-SM            */}
      {/* ========================================================================= */}
      {activeModule && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setActiveModule(null)}
        >
          <div 
            className="bg-white dark:bg-[#16171B] rounded-3xl border border-gray-100 dark:border-white/10 w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative text-gray-800 dark:text-gray-100 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón Cerrar Sutil (Líneas delgadas) */}
            <button
              onClick={() => setActiveModule(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-[#E67E22] hover:bg-orange-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* DETAIL: WEBSITE & MODELOS & BIENVENIDA */}
            {activeModule === 'website_models' && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#E67E22] flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#E67E22]" />
                    3 MODELOS WEB OFICIALES & PORTAL DEL HUÉSPED
                  </span>
                  <h3 className="text-2xl font-light text-gray-900 dark:text-white">
                    Tu Web Directa y Portal de Bienvenida <span className="font-semibold">Unificados</span>
                  </h3>
                  <p className="text-xs text-gray-400 font-light">
                    «El huésped empieza a habitar el espacio antes de llegar.»
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed font-light">
                  Cobrá el 100% a tu propia cuenta con 0% de comisión. Tu web oficial y el portal del huésped comparten la misma tipografía, estética y calidez visual.
                </p>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-zinc-800/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        3 Modelos Web Oficiales (Incluidos en Loomi Suite)
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 font-medium">
                        Listos en 15 min
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5">
                        <strong className="block font-medium text-gray-800 dark:text-white">🌲 Refugio Dos Aguas</strong>
                        <span className="text-gray-400 text-[11px] block mt-0.5 font-light">Glamping & Bosque. Estética obsidian, calidez y suites panorámicas.</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5">
                        <strong className="block font-medium text-gray-800 dark:text-white">🍷 Corte delle Vette</strong>
                        <span className="text-gray-400 text-[11px] block mt-0.5 font-light">Bodega Lodge. Arquitectura mineral entre viñedos y cordillera.</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5">
                        <strong className="block font-medium text-gray-800 dark:text-white">🌊 Médano Blanco</strong>
                        <span className="text-gray-400 text-[11px] block mt-0.5 font-light">Posada Costera. Suites luminosas frente al mar, dunas y brisa.</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-orange-100/60 dark:border-orange-900/30 bg-[#FDF3E7]/40 dark:bg-orange-950/20 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F6D8C3] text-[#E67E22] flex items-center justify-center shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-900 dark:text-white">
                        Portal Digital del Huésped
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-300 font-light mt-0.5">
                        Incluye mapa interactivo GPS, Wi-Fi en 1 toque y recomendaciones gastronómicas.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenDemo();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    Ver Diseños en la Demo
                  </button>
                </div>
              </div>
            )}

            {/* DETAIL: HERO */}
            {activeModule === 'hero' && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#E67E22]">
                    01 / FILOSOFÍA DEL SISTEMA
                  </span>
                  <h3 className="text-2xl font-light text-gray-900 dark:text-white">
                    Loomi Suite: <span className="font-semibold">Gestión Zen & Ágil</span>
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed font-light">
                  Reemplazá cuadernos, planillas complejas y mensajes desordenados con una interfaz visual limpia pensada para alojamientos de 4 a 30+ unidades. Todo conectado: reservas, limpieza, cobros, WhatsApp y tu propia web oficial.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-medium text-center">
                  <div className="p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-zinc-800">🌲 Cabañas</div>
                  <div className="p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-zinc-800">⛺ Glampings</div>
                  <div className="p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-zinc-800">🏢 Deptos</div>
                  <div className="p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-zinc-800">🏡 Posadas</div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex justify-end">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenDemo();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-medium transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Abrir Demo Interactiva</span>
                  </button>
                </div>
              </div>
            )}

            {/* DETAIL: XENIA */}
            {activeModule === 'xenia' && (
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-orange-200 shrink-0 bg-orange-50">
                    <img
                      src={xeniaAvatarUrl || '/xenia.jpg'}
                      alt="Xenia"
                      className="w-full h-full object-cover object-top"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#E67E22]">
                      02 / COPILOTO INTELIGENTE
                    </span>
                    <h3 className="text-xl font-light text-gray-900 dark:text-white">
                      Xenia: <span className="font-semibold">Copiloto Integrado</span>
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed font-light">
                  Xenia responde tus dudas operativas del día a día, te enseña a cargar departamentos, sincronizar con Airbnb y redacta respuestas para tus pasajeros en español rioplatense.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3.5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-zinc-800/50">
                    <strong className="font-semibold block mb-0.5">🎙️ Por Voz y Texto</strong>
                    <p className="text-gray-400 font-light text-[11px]">Consultale por audio o texto desde el móvil.</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-zinc-800/50">
                    <strong className="font-semibold block mb-0.5">✨ Sin Manuales</strong>
                    <p className="text-gray-400 font-light text-[11px]">Configura tarifas y bloquea fechas con 1 toque.</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-zinc-800/50">
                    <strong className="font-semibold block mb-0.5">🇦🇷 Cercanía Real</strong>
                    <p className="text-gray-400 font-light text-[11px]">Entiende la dinámica de señas y rotación turística.</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex justify-end">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenDemo();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    Probar Copiloto en la Demo
                  </button>
                </div>
              </div>
            )}

            {/* DETAIL: CALENDAR */}
            {activeModule === 'calendar' && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#E67E22]">
                    03 / SINCRONIZACIÓN AUTOMÁTICA
                  </span>
                  <h3 className="text-2xl font-light text-gray-900 dark:text-white">
                    Rack Multicanal: <span className="font-semibold">0 Dobles Reservas</span>
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed font-light">
                  Sincronizá Airbnb, Booking.com y tus reservas directas. Cuando entra una reserva en cualquier portal, las fechas se bloquean automáticamente en todos los demás en 3 segundos.
                </p>

                <div className="p-3.5 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-zinc-800/50 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Cabaña del Bosque</span>
                    <span className="text-[#E67E22] font-semibold">Directo • 3 noches reservadas</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Domo Glamping</span>
                    <span>Booking.com (Bloqueado en Airbnb)</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Depto 102</span>
                    <span>Airbnb (Bloqueado en Booking.com)</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex justify-end">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenDemo();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    Abrir Rack en Vivo
                  </button>
                </div>
              </div>
            )}

            {/* DETAIL: WHATSAPP */}
            {activeModule === 'whatsapp' && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#E67E22]">
                    04 / WHATSAPP AUTOMÁTICO
                  </span>
                  <h3 className="text-2xl font-light text-gray-900 dark:text-white">
                    Desactivá reclamos <span className="font-semibold">antes de que nazcan</span>
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed font-light">
                  Envía la coordinación de ruta, clave Wi-Fi al llegar y control de confort a las 2 horas para solucionar cualquier detalle en privado antes de que se transforme en una mala reseña.
                </p>

                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-zinc-800/50 text-xs space-y-1">
                    <strong className="text-[#E67E22] font-medium block">1. Coordinación en Ruta</strong>
                    <p className="text-gray-500 dark:text-zinc-300 text-xs font-light">«Avísennos cuando estén a 40 minutos de llegar para esperarlos con el departamento listo.»</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-zinc-800/50 text-xs space-y-1">
                    <strong className="font-medium text-gray-800 dark:text-white block">2. Control de Confort (2hs Post-Ingreso)</strong>
                    <p className="text-gray-500 dark:text-zinc-300 text-xs font-light">«¿Encontraron todo impecable? Cualquier consulta nos avisan por acá.»</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex justify-end">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenDemo();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    Probar WhatsApp en la Demo
                  </button>
                </div>
              </div>
            )}

            {/* DETAIL: HOUSEKEEPING */}
            {activeModule === 'housekeeping' && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#E67E22]">
                    05 / MUCAMAS & OPERACIONES
                  </span>
                  <h3 className="text-2xl font-light text-gray-900 dark:text-white">
                    Operaciones bajo control <span className="font-semibold">sin confusiones</span>
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed font-light">
                  Tu equipo de limpieza tiene un acceso simple desde su propio celular sin usuario ni clave complicada. Ven qué unidades tocan hoy, marcan sábanas cambiadas y te avisan con 1 toque cuando la cabaña está lista para el próximo ingreso.
                </p>

                <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex justify-end">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenDemo();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    Ver Módulo de Limpieza
                  </button>
                </div>
              </div>
            )}

            {/* DETAIL: PRICING */}
            {activeModule === 'pricing' && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#E67E22]">
                    06 / PLANES FIJOS POR COMPLEJO ENTERO
                  </span>
                  <h3 className="text-2xl font-light text-gray-900 dark:text-white">
                    Tarifas transparentes <span className="font-semibold">sin costo por habitación</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plans.map((p) => (
                    <div
                      key={p.id}
                      className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                        p.highlight
                          ? 'border-orange-200 bg-orange-50/40 dark:bg-orange-950/20 shadow-sm'
                          : 'border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-zinc-800/40'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium text-[#E67E22] uppercase tracking-wider">{p.badge}</span>
                          <span className="text-xs font-mono text-gray-400 font-medium">${p.usd} USD</span>
                        </div>
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white">{p.name}</h4>
                        <div className="text-2xl font-light text-gray-900 dark:text-white">
                          ${p.price.toLocaleString('es-AR')} <span className="text-xs font-light text-gray-400">/mes (Final ARS)</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed pt-1.5 border-t border-gray-100 dark:border-white/5 font-light">
                          {p.description}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-white/5 text-xs">
                        {p.features?.map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-gray-600 dark:text-zinc-300 text-xs font-light">
                            <Check className="w-3.5 h-3.5 text-[#E67E22] shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex justify-end">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenContact('Planes y Tarifas (Loomi / Loomi Suite)');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    Hablar con un Asesor
                  </button>
                </div>
              </div>
            )}

            {/* DETAIL: CHANNELS */}
            {activeModule === 'channels' && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#E67E22]">
                    07 / CANALES OFICIALES
                  </span>
                  <h3 className="text-2xl font-light text-gray-900 dark:text-white">
                    Conexión bidireccional <span className="font-semibold">en tiempo real</span>
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed font-light">
                  Conectamos mediante enlaces iCal y sincronización oficial para que tu inventario esté coordinado segundo a segundo con Airbnb, Booking.com y tu propia web sin riesgo de doble cobro.
                </p>

                <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex justify-end">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenDemo();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    Probar Sincronización
                  </button>
                </div>
              </div>
            )}

            {/* DETAIL: ONBOARDING */}
            {activeModule === 'onboarding' && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#E67E22]">
                    08 / ASISTENCIA CONCIERGE
                  </span>
                  <h3 className="text-2xl font-light text-gray-900 dark:text-white">
                    Servicio Llave en Mano <span className="font-semibold">en 72 horas</span>
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed font-light">
                  Si no disponés de tiempo para cargar fotos, registrar tus unidades o vincular los enlaces iCal de Airbnb y Booking, nuestro equipo hace el 100% de la configuración inicial por vos.
                </p>

                <div className="p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-zinc-800/40 text-xs font-light space-y-1.5">
                  <p>• Configuración de todas tus unidades y fotos</p>
                  <p>• Enlace bidireccional de calendarios iCal</p>
                  <p>• Guía digital interactiva con clave Wi-Fi y mapa</p>
                  <p>• Capacitación personalizada para vos y tu equipo</p>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex justify-end">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenContact('Servicio Concierge Onboarding Llave en Mano');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    Pedir Presupuesto Llave en Mano
                  </button>
                </div>
              </div>
            )}

            {/* DETAIL: METRICS */}
            {activeModule === 'metrics' && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#E67E22]">
                    09 / IMPACTO & RESULTADOS
                  </span>
                  <h3 className="text-2xl font-light text-gray-900 dark:text-white">
                    Resultados en complejos <span className="font-semibold">activos</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center">
                  <div className="p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-zinc-800/40">
                    <span className="text-3xl font-extralight text-gray-900 dark:text-white">+850</span>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 font-light">Unidades activas</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-zinc-800/40">
                    <span className="text-3xl font-extralight text-[#E67E22]">0</span>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 font-light">Dobles reservas</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-zinc-800/40">
                    <span className="text-3xl font-extralight text-gray-900 dark:text-white">15 min</span>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 font-light">Puesta en marcha</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex justify-end">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenDemo();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-medium transition-colors cursor-pointer"
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
