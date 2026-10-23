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
  onOpenDemo: (tab?: string) => void;
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
      usd: 30,
      highlight: false,
      badge: 'PLAN PROPIETARIO • HASTA 5 U.',
      description: 'La herramienta perfecta para dueños que gestionan todo de forma autónoma desde el celular. Calendario modo light y reservas.',
      features: [
        'Calendario Rack (Modo Light optimizado para móvil)',
        'Gestión de Reservas Directas & iCal',
        'Reportes de Rendimiento Básicos',
        'Sin costos por habitación (precio por todo el complejo)',
        '2 usuarios',
      ],
    },
    {
      id: 'plan-suite',
      name: 'Loomi Suite',
      tag: 'Unidades Ilimitadas • Complejo Total',
      usd: 45,
      highlight: true,
      badge: 'RECOMENDADO • TODO INCLUIDO',
      description: 'La solución definitiva para complejos que operan con personal de recepción y equipos de limpieza. Ecosistema ilimitado.',
      features: [
        'Todo lo del Plan Loomi e iCal avanzado',
        'Módulo Housekeeping Completo (Semáforo de Limpieza en vivo)',
        'Modo Recepción con Roles de Usuario Separados',
        'Asistente Xenia AI (Voz & Copiloto 24/7)',
        'Portal de Bienvenida del Huésped',
        'Tu Web: disponibilidad, precios y pedidos por WhatsApp',
        'Usuarios para todo tu equipo: recepción, limpieza y administración',
      ],
    },
  ];

  // Zen soft card base styling: thin lines, soft borders, negative space Ma
  const cardBaseStyle = isDark
    ? 'bg-[#15161A] hover:bg-[#18191E] border border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:border-white/10 text-zinc-100'
    : 'bg-white hover:bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:border-orange-200/50 text-[#2D3748]';

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#F8F9FA] dark:bg-[#0E0F12] text-[#2D3748] dark:text-[#E2E8F0] transition-colors pt-4 sm:pt-6 md:pt-8 pb-16 sm:pb-24 px-3 sm:px-6 lg:px-8 font-sans select-none flex flex-col">
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
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#AD5410] dark:text-[#E67E22]" />
                PMS & CANALES • LOOMI SUITE
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E67E22] animate-pulse shrink-0" />
                <span className="text-xs font-semibold text-[#AD5410] dark:text-[#E67E22] group-hover:underline transition-colors">
                  Descubrir +
                </span>
              </div>
            </div>

            {/* Main Headline */}
            <div className="my-5 sm:my-6 space-y-4 sm:space-y-5">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-[1.18] text-gray-900 dark:text-white">
                Software de gestión. Todo tu complejo en una pantalla.
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-800 dark:text-zinc-300 font-normal">
                Web propia + Bienvenida al huésped
              </p>

              {/* Sutil Category Badges */}
              <div className="pt-2 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-medium">
                <span className="px-3.5 py-1.5 rounded-xl bg-gray-50 dark:bg-zinc-800/80 text-slate-800 dark:text-zinc-300 border border-gray-200 dark:border-white/5 shrink-0">
                  🌲 Cabañas & Bungalows
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-[#FDF3E7] text-[#E67E22] dark:bg-orange-950/40 dark:text-orange-300 border border-orange-100/60 dark:border-orange-900/30 shrink-0">
                  ⛺ Glampings & Domos
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-gray-50 dark:bg-zinc-800/80 text-slate-800 dark:text-zinc-300 border border-gray-200 dark:border-white/5 shrink-0">
                  🏢 Deptos Turísticos
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-gray-50 dark:bg-zinc-800/80 text-slate-800 dark:text-zinc-300 border border-gray-200 dark:border-white/5 shrink-0">
                  🏡 Posadas & Aparts
                </span>
              </div>
            </div>

            {/* Bottom Actions with Zen CTA */}
            <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-700 dark:text-zinc-400 font-medium">
                3 Plantillas Web Base ("Clara", "Tierra" y "Sombra") incluidas en Loomi Suite
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDemo();
                }}
                className="px-5 py-2.5 rounded-xl bg-[#B8520D] dark:bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
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
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-white/5">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-400">
                MÉTRICAS / IMPACTO
              </span>
              <span className="w-2 h-2 rounded-full bg-[#E67E22] shrink-0" />
            </div>

            <div className="my-auto py-4 sm:py-6 space-y-2">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extralight text-gray-900 dark:text-white tracking-tight">
                100% Control
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Gestión centralizada y sin sorpresas
              </h2>
              <p className="text-xs text-slate-800 dark:text-zinc-300 leading-relaxed font-normal">
                Tus calendarios sincronizados, tus cobros al día y el control total de tu complejo en una sola pantalla.
              </p>
            </div>

            <div className="pt-3.5 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-700 dark:text-zinc-400 font-medium">
              <span>Tranquilidad para el anfitrión</span>
              <span className="text-slate-900 dark:text-gray-200 font-semibold group-hover:text-[#E67E22] transition-colors flex items-center gap-1">
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
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-white/5">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-400">
                AUTOMATIZACIÓN
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            </div>

            <div className="my-auto py-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                WhatsApp
              </h2>
              <p className="text-xs text-slate-800 dark:text-zinc-300 font-normal mt-1 leading-relaxed">
                Ruta, bienvenida y cobro en 1 clic sin escribir a mano.
              </p>
            </div>

            <div className="pt-2.5 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-700 dark:text-zinc-400 font-medium">
              <span>3 plantillas web</span>
              <span className="text-slate-900 dark:text-gray-200 font-semibold group-hover:text-[#E67E22] transition-colors">
                Ver +
              </span>
            </div>
          </div>

          {/* Tile D: Operaciones / Housekeeping (3 Cols on Desktop) */}
          <div
            onClick={() => setActiveModule('housekeeping')}
            className={`w-full sm:col-span-1 lg:col-span-3 rounded-3xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 group min-h-[175px] active:scale-[0.99] ${cardBaseStyle}`}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-white/5">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-400">
                OPERACIONES
              </span>
              <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
            </div>

            <div className="my-auto py-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Limpieza & Equipo
              </h2>
              <p className="text-xs text-slate-800 dark:text-zinc-300 font-normal mt-1 leading-relaxed">
                Checklist móvil para limpieza y semáforo de estado en vivo.
              </p>
            </div>

            <div className="pt-2.5 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-700 dark:text-zinc-400 font-medium">
              <span>App de Limpieza</span>
              <span className="text-slate-900 dark:text-gray-200 font-semibold group-hover:text-[#E67E22] transition-colors">
                Ver +
              </span>
            </div>
          </div>

          {/* Tile E: Giant Vertical Bento Xenia AI (6 Cols x 2 Rows de Alto) */}
          <div
            onClick={() => setActiveModule('xenia')}
            className={`w-full sm:col-span-2 lg:col-span-6 lg:row-span-2 rounded-3xl p-6 sm:p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 group relative overflow-hidden min-h-[340px] active:scale-[0.99] ${cardBaseStyle}`}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-white/5">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-400">
                COPILOTO INTELIGENTE / XENIA AI
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E67E22] animate-pulse shrink-0" />
                <span className="text-xs font-semibold text-[#AD5410] dark:text-[#E67E22]">Activo 24/7</span>
              </div>
            </div>

            <div className="my-auto py-4 space-y-4">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-orange-100 dark:border-orange-950 shrink-0 shadow-xs bg-orange-50 dark:bg-zinc-800">
                  <img
                    src={xeniaAvatarUrl || '/xenia.jpg'}
                    alt="Xenia"
                    width={80}
                    height={80}
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
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-zinc-300 font-medium">
                    No vas a estar solo en la gestión.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-zinc-800/50 border border-gray-100 dark:border-white/5">
                <p className="text-xs sm:text-sm font-normal text-slate-800 dark:text-zinc-300 leading-relaxed">
                  «Te asisto por voz o texto para cargar departamentos, sincronizar tarifas y responder consultas operativas sin manuales pesados.»
                </p>
              </div>
            </div>

            <div className="pt-3.5 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-700 dark:text-zinc-400 font-medium">
              <span>Voz & WhatsApp inteligente</span>
              <span className="text-slate-900 dark:text-gray-200 font-semibold group-hover:text-[#E67E22] transition-colors flex items-center gap-1">
                Tocar para consultar →
              </span>
            </div>
          </div>

          {/* Tile F: Anti-Overbooking Banner (6 Cols) */}
          <div
            onClick={() => setActiveModule('calendar')}
            className={`w-full sm:col-span-2 lg:col-span-6 rounded-3xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 group min-h-[175px] active:scale-[0.99] ${cardBaseStyle}`}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-white/5">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#AD5410] dark:text-[#E67E22]" />
                RACK MULTICANAL
              </span>
              <span className="w-2 h-2 rounded-full bg-[#E67E22] shrink-0" />
            </div>

            <div className="my-2 space-y-1">
              <h2 className="text-xl sm:text-2xl font-light text-gray-900 dark:text-white tracking-tight">
                Anti-<span className="font-semibold text-gray-800 dark:text-gray-100">Overbooking</span>
              </h2>
              <p className="text-xs text-slate-800 dark:text-zinc-300 font-normal leading-relaxed">
                Airbnb, Booking.com y tus reservas directas en un solo calendario, con aviso si dos reservas se superponen.
              </p>
            </div>

            <div className="pt-2.5 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-700 dark:text-zinc-400 font-medium">
              <span>0 Errores de calendario</span>
              <span className="text-slate-900 dark:text-gray-200 font-semibold group-hover:text-[#E67E22] transition-colors flex items-center gap-1">
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
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-white/5">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#AD5410] dark:text-[#E67E22] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#AD5410] dark:text-[#E67E22]" />
                TU WEB + PORTAL DEL HUÉSPED
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#FDF3E7] dark:bg-orange-950/40 text-[#AD5410] dark:text-[#E67E22] text-[10px] font-semibold">
                Sin comisiones
              </span>
            </div>

            <div className="my-auto py-2.5 space-y-1.5">
              <h2 className="text-xl font-light text-gray-900 dark:text-white tracking-tight">
                El huésped habita el espacio <span className="font-semibold text-slate-900 dark:text-gray-100">antes de llegar</span>
              </h2>
              <p className="text-xs text-slate-800 dark:text-zinc-300 leading-relaxed font-normal">
                Tu web con fotos, precios y disponibilidad, y la guía del huésped con Wi-Fi y cómo llegar.
              </p>
            </div>

            <div className="pt-2.5 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-700 dark:text-zinc-400 font-medium">
              <span className="text-[#AD5410] dark:text-[#E67E22] font-semibold">0% Comisión Directa</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDemo('welcome-guide');
                }}
                className="text-slate-900 dark:text-gray-200 font-semibold group-hover:text-[#E67E22] transition-colors flex items-center gap-1 cursor-pointer"
              >
                Ver diseños →
              </button>
            </div>
          </div>

          {/* Tile H: Canales (2 Cols) */}
          <div
            onClick={() => setActiveModule('channels')}
            className={`w-full sm:col-span-1 lg:col-span-2 rounded-3xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 group min-h-[200px] active:scale-[0.99] ${cardBaseStyle}`}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-white/5">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-400">
                CANALES
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            </div>

            <div className="my-auto space-y-2 py-2">
              <div className="flex items-center justify-between gap-1 text-xs font-medium">
                <span className="text-slate-900 dark:text-zinc-300">Airbnb</span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              </div>
              <div className="flex items-center justify-between gap-1 text-xs font-medium">
                <span className="text-slate-900 dark:text-zinc-300">Booking.com</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
              </div>
              <div className="flex items-center justify-between gap-1 text-xs font-medium">
                <span className="text-slate-900 dark:text-zinc-300">MP / CBU</span>
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
              </div>
              <div className="flex items-center justify-between gap-1 text-xs font-medium">
                <span className="text-slate-900 dark:text-zinc-300">WhatsApp</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              </div>
            </div>

            <div className="pt-2.5 border-t border-gray-100 dark:border-white/5 text-center text-xs text-slate-700 dark:text-zinc-400 font-medium">
              Sincronización Total
            </div>
          </div>

          {/* Tile I: Pricing ARS (3 Cols) */}
          <div
            onClick={() => setActiveModule('pricing')}
            className={`w-full sm:col-span-1 lg:col-span-3 rounded-3xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 group min-h-[200px] active:scale-[0.99] ${cardBaseStyle}`}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-white/5">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-400">
                PLANES / ARS
              </span>
              <span className="w-2 h-2 rounded-full bg-[#E67E22] shrink-0" />
            </div>

            <div className="my-auto py-2 space-y-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
                  USD 30
                </span>
                <span className="text-xs text-slate-700 dark:text-zinc-400 font-medium">
                  /mes
                </span>
              </div>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-200">
                Loomi • Loomi Suite
              </h3>
              <p className="text-[11px] text-slate-800 dark:text-zinc-300 font-normal leading-relaxed">
                Sin comisiones por reserva ni cobro por habitación.
              </p>
            </div>

            <div className="pt-2.5 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-700 dark:text-zinc-400 font-medium">
              <span>2 Planes Fijos</span>
              <span className="text-slate-900 dark:text-gray-200 font-semibold group-hover:text-[#E67E22] transition-colors flex items-center gap-1">
                Ver planes →
              </span>
            </div>
          </div>

          {/* Tile J: Onboarding Llave en Mano (2 Cols) */}
          <div
            onClick={() => setActiveModule('onboarding')}
            className={`w-full sm:col-span-2 lg:col-span-2 rounded-3xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 group min-h-[200px] active:scale-[0.99] ${cardBaseStyle}`}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-white/5">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-400">
                MUDANZA
              </span>
              <span className="w-2 h-2 rounded-full bg-gray-900 dark:bg-white shrink-0" />
            </div>

            <div className="my-auto py-2 space-y-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Te mudamos nosotros
              </h2>
              <p className="text-xs text-slate-800 dark:text-zinc-300 leading-relaxed font-normal">
                Mandanos tu Excel, tu sistema anterior o fotos del cuaderno. Cargamos tus reservas por vos.
              </p>
            </div>

            <div className="pt-2.5 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-700 dark:text-zinc-400 font-medium">
              <span>Asistencia</span>
              <span className="text-slate-900 dark:text-gray-200 font-semibold group-hover:text-[#E67E22] transition-colors">
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
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-[#E67E22] hover:bg-orange-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* DETAIL: WEBSITE & MODELOS & BIENVENIDA */}
            {activeModule === 'website_models' && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#AD5410] dark:text-[#E67E22] flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#AD5410] dark:text-[#E67E22]" />
                    TU WEB · PORTAL DEL HUÉSPED
                  </span>
                  <h2 className="text-2xl font-light text-gray-900 dark:text-white">
                    Tu Web Directa y Portal de Bienvenida <span className="font-semibold">Unificados</span>
                  </h2>
                  <p className="text-xs text-slate-700 dark:text-zinc-300 font-medium">
                    «El huésped empieza a habitar el espacio antes de llegar.»
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed font-light">
                  El huésped elige fechas, ve qué está libre y cuánto sale, y te escribe por WhatsApp con el pedido armado. Vos confirmás y cobrás directo: sin comisiones. En español, inglés y portugués.
                </p>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-zinc-800/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        3 estilos incluidos
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 font-medium">
                        Diseños especiales a pedido
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5">
                        <strong className="block font-medium text-gray-800 dark:text-white">🌙 Noche</strong>
                        <span className="text-slate-700 dark:text-zinc-300 text-[11px] block mt-0.5 font-medium">Oscura y cálida, con tus fotos como protagonistas.</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5">
                        <strong className="block font-medium text-gray-800 dark:text-white">☀️ Día</strong>
                        <span className="text-slate-700 dark:text-zinc-300 text-[11px] block mt-0.5 font-medium">Luminosa, con fondo crema y mucho aire.</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5">
                        <strong className="block font-medium text-gray-800 dark:text-white">🌿 Clara</strong>
                        <span className="text-slate-700 dark:text-zinc-300 text-[11px] block mt-0.5 font-medium">Verde bosque y letra fina, serena y moderna.</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-orange-100/60 dark:border-orange-900/30 bg-[#FDF3E7]/40 dark:bg-orange-950/20 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F6D8C3] text-[#AD5410] dark:text-[#E67E22] flex items-center justify-center shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-gray-900 dark:text-white">
                        Portal Digital del Huésped
                      </h3>
                      <p className="text-[11px] text-slate-700 dark:text-zinc-300 font-medium mt-0.5">
                        Incluye mapa interactivo GPS, Wi-Fi en 1 toque y recomendaciones gastronómicas.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenDemo('welcome-guide');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#B8520D] dark:bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-medium transition-colors cursor-pointer"
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
                  <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#AD5410] dark:text-[#E67E22]">
                    01 / FILOSOFÍA DEL SISTEMA
                  </span>
                  <h2 className="text-2xl font-light text-gray-900 dark:text-white">
                    Loomi Suite: <span className="font-semibold">Gestión Simple & Sin Vueltas</span>
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed font-light">
                  Reemplazá cuadernos, planillas complejas y mensajes desordenados con una interfaz visual limpia pensada para alojamientos de 4 a 30+ unidades. Todo conectado: reservas, limpieza, cobros, WhatsApp y tu propia web.
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
                    className="px-5 py-2.5 rounded-xl bg-[#B8520D] dark:bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-medium transition-colors cursor-pointer flex items-center gap-2"
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
                      width={56}
                      height={56}
                      className="w-full h-full object-cover object-top"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#AD5410] dark:text-[#E67E22]">
                      02 / COPILOTO INTELIGENTE
                    </span>
                    <h2 className="text-xl font-light text-gray-900 dark:text-white">
                      Xenia: <span className="font-semibold">Copiloto Integrado</span>
                    </h2>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed font-light">
                  Xenia responde tus dudas operativas del día a día, te enseña a cargar departamentos, sincronizar con Airbnb y redacta respuestas para tus pasajeros en español rioplatense.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3.5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-zinc-800/50">
                    <strong className="font-semibold block mb-0.5">🎙️ Por Voz y Texto</strong>
                    <p className="text-slate-700 dark:text-zinc-300 font-medium text-[11px]">Consultale por audio o texto desde el móvil.</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-zinc-800/50">
                    <strong className="font-semibold block mb-0.5">✨ Sin Manuales</strong>
                    <p className="text-slate-700 dark:text-zinc-300 font-medium text-[11px]">Configura tarifas y bloquea fechas con 1 toque.</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-zinc-800/50">
                    <strong className="font-semibold block mb-0.5">🇦🇷 Cercanía Real</strong>
                    <p className="text-slate-700 dark:text-zinc-300 font-medium text-[11px]">Entiende la dinámica de señas y rotación turística.</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex justify-end">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenDemo();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#B8520D] dark:bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-medium transition-colors cursor-pointer"
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
                  <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#AD5410] dark:text-[#E67E22]">
                    03 / SINCRONIZACIÓN POR iCAL
                  </span>
                  <h2 className="text-2xl font-light text-gray-900 dark:text-white">
                    Rack Multicanal: <span className="font-semibold">un solo calendario</span>
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed font-light">
                  Sincronizá Airbnb, Booking.com y tus reservas directas por iCal. Loomi trae las reservas de los portales y les comparte tu calendario para que bloqueen las fechas ocupadas. Como en todo sistema iCal, cada portal se actualiza cada algunas horas: por eso Loomi te avisa si dos reservas se superponen.
                </p>

                <div className="p-3.5 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-zinc-800/50 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Cabaña del Bosque</span>
                    <span className="text-[#AD5410] dark:text-[#E67E22] font-semibold">Directo • 3 noches reservadas</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-zinc-400 font-medium">
                    <span>Domo Glamping</span>
                    <span>Booking.com (Bloqueado en Airbnb)</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-zinc-400 font-medium">
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
                    className="px-5 py-2.5 rounded-xl bg-[#B8520D] dark:bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-medium transition-colors cursor-pointer"
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
                  <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#AD5410] dark:text-[#E67E22]">
                    04 / WHATSAPP EN 1 TOQUE
                  </span>
                  <h2 className="text-2xl font-light text-gray-900 dark:text-white">
                    Desactivá reclamos <span className="font-semibold">antes de que nazcan</span>
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed font-light">
                  Loomi te deja listos los mensajes de coordinación de ruta, clave Wi-Fi al llegar y control de confort a las 2 horas. Los enviás con un toque y resolvés cualquier detalle en privado, antes de que se transforme en una mala reseña.
                </p>

                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-zinc-800/50 text-xs space-y-1">
                    <strong className="text-[#AD5410] dark:text-[#E67E22] font-medium block">1. Coordinación en Ruta</strong>
                    <p className="text-slate-700 dark:text-zinc-300 text-xs font-medium">«Avísennos cuando estén a 40 minutos de llegar para esperarlos con el departamento listo.»</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-zinc-800/50 text-xs space-y-1">
                    <strong className="font-medium text-gray-800 dark:text-white block">2. Control de Confort (2hs Post-Ingreso)</strong>
                    <p className="text-slate-700 dark:text-zinc-300 text-xs font-medium">«¿Encontraron todo impecable? Cualquier consulta nos avisan por acá.»</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex justify-end">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenDemo();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#B8520D] dark:bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-medium transition-colors cursor-pointer"
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
                  <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#AD5410] dark:text-[#E67E22]">
                    05 / LIMPIEZA & OPERACIONES
                  </span>
                  <h2 className="text-2xl font-light text-gray-900 dark:text-white">
                    Operaciones bajo control <span className="font-semibold">sin confusiones</span>
                  </h2>
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
                    className="px-5 py-2.5 rounded-xl bg-[#B8520D] dark:bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-medium transition-colors cursor-pointer"
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
                  <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#AD5410] dark:text-[#E67E22]">
                    06 / PLANES FIJOS POR COMPLEJO ENTERO
                  </span>
                  <h2 className="text-2xl font-light text-gray-900 dark:text-white">
                    Tarifas transparentes <span className="font-semibold">sin costo por habitación</span>
                  </h2>
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
                          <span className="text-[10px] font-medium text-[#AD5410] dark:text-[#E67E22] uppercase tracking-wider">{p.badge}</span>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{p.name}</h3>
                        <div className="text-2xl font-light text-gray-900 dark:text-white">
                          USD {p.usd} <span className="text-xs font-semibold text-slate-700 dark:text-zinc-400">/mes</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-zinc-300">
                          En pesos al dólar MEP del día, o por Payoneer con 10% de descuento
                        </p>
                        <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed pt-1.5 border-t border-gray-100 dark:border-white/5 font-medium">
                          {p.description}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-white/5 text-xs">
                        {p.features?.map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-gray-600 dark:text-zinc-300 text-xs font-light">
                            <Check className="w-3.5 h-3.5 text-[#AD5410] dark:text-[#E67E22] shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 text-xs">
                  {[
                    ['¿El precio es en pesos o en dólares?', 'El precio es en dólares. Lo pagás en pesos por transferencia, al dólar MEP del día, o en dólares por Payoneer con 10% de descuento.'],
                    ['¿Loomi emite facturas de AFIP / ARCA?', 'No. Loomi organiza reservas, cobros y equipo. Si facturás, seguís usando tu facturador de siempre.'],
                    ['¿Cuántos usuarios incluye?', 'El plan Loomi incluye 2 usuarios. Loomi Suite incluye los que necesite tu equipo: recepción, limpieza y administración.'],
                    ['¿Cómo es el soporte?', 'Por WhatsApp, de 8 a 22 hs (hora de Argentina), con una persona real que conoce el sistema.'],
                  ].map(([q, a]) => (
                    <div key={q} className="space-y-0.5">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{q}</h3>
                      <p className="text-slate-700 dark:text-zinc-300 font-medium leading-relaxed">{a}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex justify-end">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenContact('Planes y Tarifas (Loomi / Loomi Suite)');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#B8520D] dark:bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-medium transition-colors cursor-pointer"
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
                  <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#AD5410] dark:text-[#E67E22]">
                    07 / CANALES
                  </span>
                  <h2 className="text-2xl font-light text-gray-900 dark:text-white">
                    Conexión bidireccional <span className="font-semibold">y centralizada</span>
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed font-light">
                  Conectamos Airbnb, Booking.com y tu propia web mediante enlaces iCal, el método estándar que aceptan todos los portales. Loomi importa sus reservas y les comparte tu calendario, así ves todo en un solo lugar.
                </p>

                <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex justify-end">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenDemo();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#B8520D] dark:bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-medium transition-colors cursor-pointer"
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
                  <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#AD5410] dark:text-[#E67E22]">
                    08 / MUDANZA LLAVE EN MANO
                  </span>
                  <h2 className="text-2xl font-light text-gray-900 dark:text-white">
                    Tu mudanza, <span className="font-semibold">sin pelearte con planillas</span>
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-300 leading-relaxed font-light">
                  Importar un Excel suena fácil hasta que las columnas no coinciden, las fechas vienen en otro formato y la mitad de las reservas queda afuera. Por eso no te dejamos solo con un importador: mandanos lo que tengas —Excel, CSV, exportación de otro sistema o fotos del cuaderno— y nuestro equipo carga todo a mano y lo revisa con vos.
                </p>

                <div className="p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-zinc-800/40 text-xs font-light space-y-1.5">
                  <p>• Reservas futuras con huésped, fechas, unidad y seña</p>
                  <p>• Unidades, fotos y datos del complejo</p>
                  <p>• Conexión de calendarios de Airbnb y Booking</p>
                  <p>• Revisión final juntos antes de que empieces a operar</p>
                </div>

                <div className="p-3.5 rounded-xl border border-orange-100/80 dark:border-orange-950/40 bg-[#FDF3E7]/60 dark:bg-orange-950/20 text-xs font-semibold text-[#E67E22] dark:text-orange-300">
                  Servicio único · listo en 72 hs hábiles · se descuenta de tu primer mes si activás el plan
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex justify-end">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenContact('Mudanza Llave en Mano');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#B8520D] dark:bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    Quiero que me carguen mis reservas
                  </button>
                </div>
              </div>
            )}

            {/* DETAIL: METRICS */}
            {activeModule === 'metrics' && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#AD5410] dark:text-[#E67E22]">
                    09 / IMPACTO & RESULTADOS
                  </span>
                  <h2 className="text-2xl font-light text-gray-900 dark:text-white">
                    Resultados en complejos <span className="font-semibold">activos</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center">
                  <div className="p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-zinc-800/40">
                    <span className="text-3xl font-extralight text-gray-900 dark:text-white">100%</span>
                    <p className="text-xs text-slate-800 dark:text-zinc-400 mt-0.5 font-medium">Control centralizado</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-zinc-800/40">
                    <span className="text-3xl font-extralight text-[#AD5410] dark:text-[#E67E22]">0</span>
                    <p className="text-xs text-slate-800 dark:text-zinc-400 mt-0.5 font-medium">Dobles reservas</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-zinc-800/40">
                    <span className="text-3xl font-extralight text-gray-900 dark:text-white">15 min</span>
                    <p className="text-xs text-slate-800 dark:text-zinc-400 mt-0.5 font-medium">Puesta en marcha</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex justify-end">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenDemo();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#B8520D] dark:bg-[#E67E22] hover:bg-[#D35400] text-white text-xs font-medium transition-colors cursor-pointer"
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
