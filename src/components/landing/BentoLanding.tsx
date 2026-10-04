import React, { useState } from 'react';
import {
  Play,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Users,
  Smartphone,
  ArrowRight,
  TrendingUp,
  CreditCard,
  BedDouble,
  Coins,
  Building2,
  Home,
  Tent,
  Layers,
  Check,
  QrCode,
  Wallet,
  AlertTriangle,
  Clock,
  KeyRound,
  Wine,
  Flower2,
  Globe,
  Volume2,
  X,
  ChevronRight,
  Maximize2,
  Camera,
  Upload,
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
  | 'pricing'
  | 'channels'
  | 'onboarding'
  | 'metrics';

export const BentoLanding: React.FC<BentoLandingProps> = ({
  onOpenDemo,
  onOpenContact,
  onOpenLogin,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';

  // Active module for the interactive reveal modal/drawer
  const [activeModule, setActiveModule] = useState<ModuleKey | null>(null);

  // Interactive state for ARS rate calculator
  const [nightRateInput, setNightRateInput] = useState<string>('60000');
  const numericRate = Number(nightRateInput.replace(/[^0-9]/g, '')) || 60000;

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
    }, 2500);
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

  const handleXeniaPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setStoredXeniaAvatar(dataUrl);
          setXeniaAvatarUrl(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const plans = [
    {
      id: 'plan-4-10',
      name: '4 a 10 Unidades',
      tag: 'Complejos Pequeños',
      price: 45000,
      highlight: false,
      badge: 'Entrada',
      description: 'Sistema integral completo para cabañas y alquileres independientes.',
    },
    {
      id: 'plan-10-20',
      name: '10 a 20 Unidades',
      tag: 'El más elegido',
      price: 60000,
      highlight: true,
      badge: 'MÁS ELEGIDO',
      description: 'Ideal para posadas, complejos medianos y aparts de rotación continua.',
    },
    {
      id: 'plan-20-30',
      name: '20 a 30 Unidades',
      tag: 'Operación Alta',
      price: 80000,
      highlight: false,
      badge: 'Alta Escala',
      description: 'Para administraciones profesionales con múltiples cabañas o sedes.',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#EAE8E3] dark:bg-[#0C0D0F] text-[#18181B] dark:text-[#EFECE5] transition-colors py-3 sm:py-4 px-2 sm:px-4 lg:px-6 font-sans select-none flex flex-col justify-center">
      <div className="max-w-7xl mx-auto w-full space-y-2.5 sm:space-y-3">

        {/* ========================================================================= */}
        {/* ROW 1: TOP ASYMMETRICAL HEADER (8 COLS HERO + 4 COLS 123 PROOF)           */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3">
          
          {/* Tile A: AaBbCc / Monumental Core Title (8 Cols) - Flat & Sharp */}
          <div
            onClick={() => setActiveModule('hero')}
            className="lg:col-span-8 bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none p-5 sm:p-7 border border-[#C8C4B7] dark:border-[#222328] flex flex-col justify-between cursor-pointer hover:border-[#18181B] dark:hover:border-white transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#C8C4B7] dark:border-[#222328]">
              <span className="text-[10px] sm:text-[11px] font-mono font-medium uppercase tracking-widest text-[#71717A] dark:text-[#8E8E93]">
                PMS & CANALES / LOOMI SUITE
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E1500A] animate-pulse shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-mono font-medium text-[#71717A] dark:text-[#8E8E93] group-hover:text-[#E1500A] transition-colors">
                  Descubrir +
                </span>
              </div>
            </div>

            <div className="my-2.5 sm:my-3 space-y-2.5">
              <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-normal tracking-tight text-[#18181B] dark:text-white leading-[1.08]">
                Software de gestión a la medida de tu alojamiento
              </h1>

              {/* Dynamic Rotator Line: Accommodation Types + Orange Keywords */}
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                <div className="inline-flex items-center gap-2 bg-[#18181B] dark:bg-white text-white dark:text-[#0C0D0F] px-2.5 py-1 font-mono text-xs font-medium tracking-tight border border-[#18181B] dark:border-white">
                  <span className="text-sm">{ROTATING_ITEMS[rotatingIndex].icon}</span>
                  <span className="transition-all duration-300">
                    {ROTATING_ITEMS[rotatingIndex].type}
                  </span>
                </div>
                <span className="text-[#E1500A] font-mono font-semibold text-xs uppercase tracking-wider bg-[#E1500A]/10 px-2.5 py-1 border border-[#E1500A]/30">
                  {ROTATING_ITEMS[rotatingIndex].adjective}
                </span>
                <span className="text-xs text-[#71717A] dark:text-[#A1A1AA] font-normal tracking-tight">
                  • De 4 a 30+ unidades sin comisiones
                </span>
              </div>

              {/* Subtle Horizontal Ticker List */}
              <div className="pt-1 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] font-mono text-[#71717A] dark:text-[#A1A1AA]">
                <span className="font-medium text-[#18181B] dark:text-white">🌲 Cabañas</span>
                <span className="text-[#E1500A] font-medium">• Simple</span>
                <span className="text-[#C8C4B7] dark:text-[#222328]">|</span>
                <span className="font-medium text-[#18181B] dark:text-white">⛺ Glampings</span>
                <span className="text-[#E1500A] font-medium">• Ágil</span>
                <span className="text-[#C8C4B7] dark:text-[#222328]">|</span>
                <span className="font-medium text-[#18181B] dark:text-white">🏢 Deptos</span>
                <span className="text-[#E1500A] font-medium">• Modular</span>
                <span className="text-[#C8C4B7] dark:text-[#222328]">|</span>
                <span className="font-medium text-[#18181B] dark:text-white">🏡 Posadas</span>
                <span className="text-[#E1500A] font-medium">• Directo</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#C8C4B7] dark:border-[#222328] flex items-center justify-between">
              <span className="text-[10px] sm:text-xs text-[#71717A] dark:text-[#8E8E93] font-mono">
                [ Tocar para ver resumen ]
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDemo();
                  }}
                  className="px-4 py-1.5 rounded-none bg-[#E1500A] hover:bg-[#C94305] text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Probar Demo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tile B: 123 / Metrics Block (4 Cols) - Flat & Sharp */}
          <div
            onClick={() => setActiveModule('metrics')}
            className="lg:col-span-4 bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none p-5 sm:p-7 border border-[#C8C4B7] dark:border-[#222328] flex flex-col justify-between cursor-pointer hover:border-[#18181B] dark:hover:border-white transition-all group"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#C8C4B7] dark:border-[#222328]">
              <span className="text-[10px] sm:text-[11px] font-mono font-medium uppercase tracking-widest text-[#71717A] dark:text-[#8E8E93]">
                MÉTRICAS / IMPACTO PROBADO
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#E1500A] shrink-0" />
            </div>

            <div className="my-auto py-2 space-y-1">
              <div className="text-4xl sm:text-5xl font-light text-[#18181B] dark:text-white tracking-tight">
                +850
              </div>
              <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] font-normal">
                Cabañas activas • 0 overbookings • 15 min setup
              </p>
            </div>

            <div className="pt-3 border-t border-[#C8C4B7] dark:border-[#222328] flex items-center justify-between text-xs text-[#71717A] dark:text-[#8E8E93] font-mono">
              <span>Rendimiento probado</span>
              <span className="text-[#18181B] dark:text-white font-medium group-hover:text-[#E1500A] transition-colors">
                Detalle →
              </span>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* ROW 2: ASYMMETRICAL PUZZLE (STACKED TILES + GIANT VERTICAL BENTO)         */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3">
          
          {/* Left Column Stack: WhatsApp + Mucamas + 16:9 Sync Rack */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            
            {/* Tile C: Module title / WhatsApp */}
            <div
              onClick={() => setActiveModule('whatsapp')}
              className="bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none p-5 sm:p-6 border border-[#C8C4B7] dark:border-[#222328] flex flex-col justify-between cursor-pointer hover:border-[#18181B] dark:hover:border-white transition-all group min-h-[160px] sm:min-h-[180px]"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#C8C4B7] dark:border-[#222328]">
                <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[#71717A] dark:text-[#8E8E93]">
                  AUTOMATIZACIÓN / WHATSAPP
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#E1500A] shrink-0" />
              </div>

              <div className="my-auto py-1">
                <h3 className="text-2xl sm:text-3xl font-normal text-[#18181B] dark:text-white tracking-tight">
                  WhatsApp
                </h3>
                <p className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] font-normal mt-0.5">
                  Ruta & Confort en 1 clic
                </p>
              </div>

              <div className="pt-2 border-t border-[#C8C4B7] dark:border-[#222328] flex items-center justify-between text-[11px] text-[#71717A] dark:text-[#8E8E93] font-mono">
                <span>6 plantillas</span>
                <span className="text-[#18181B] dark:text-white font-medium group-hover:text-[#E1500A] transition-colors">
                  Ver +
                </span>
              </div>
            </div>

            {/* Tile D: 9:16 / Housekeeping Operaciones */}
            <div
              onClick={() => setActiveModule('housekeeping')}
              className="bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none p-5 sm:p-6 border border-[#C8C4B7] dark:border-[#222328] flex flex-col justify-between cursor-pointer hover:border-[#18181B] dark:hover:border-white transition-all group min-h-[160px] sm:min-h-[180px]"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#C8C4B7] dark:border-[#222328]">
                <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[#71717A] dark:text-[#8E8E93]">
                  OPERACIONES / EQUIPO
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#18181B] dark:bg-white shrink-0" />
              </div>

              <div className="my-auto py-1">
                <h3 className="text-2xl sm:text-3xl font-normal text-[#18181B] dark:text-white tracking-tight">
                  Operaciones
                </h3>
                <p className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] font-normal mt-0.5">
                  Checklist móvil y puesta a punto
                </p>
              </div>

              <div className="pt-2 border-t border-[#C8C4B7] dark:border-[#222328] flex items-center justify-between text-[11px] text-[#71717A] dark:text-[#8E8E93] font-mono">
                <span>Semáforo de estado</span>
                <span className="text-[#18181B] dark:text-white font-medium group-hover:text-[#E1500A] transition-colors">
                  Ver +
                </span>
              </div>
            </div>

            {/* Tile F: Anti-Overbooking 16:9 Banner */}
            <div
              onClick={() => setActiveModule('calendar')}
              className="sm:col-span-2 bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none p-5 sm:p-6 border border-[#C8C4B7] dark:border-[#222328] flex flex-col justify-between cursor-pointer hover:border-[#18181B] dark:hover:border-white transition-all group min-h-[150px]"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#C8C4B7] dark:border-[#222328]">
                <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[#71717A] dark:text-[#8E8E93]">
                  CALENDARIO MULTICANAL / RACK EN VIVO
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#E1500A] shrink-0" />
              </div>

              <div className="my-2">
                <h3 className="text-2xl sm:text-4xl font-normal text-[#18181B] dark:text-white tracking-tight">
                  Anti-Overbooking
                </h3>
                <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] font-normal mt-0.5">
                  Airbnb, Booking y tu web sincronizados en 3 segundos.
                </p>
              </div>

              <div className="pt-2 border-t border-[#C8C4B7] dark:border-[#222328] flex items-center justify-between text-xs text-[#71717A] dark:text-[#8E8E93] font-mono">
                <span>0 Dobles Reservas</span>
                <span className="text-[#18181B] dark:text-white font-medium group-hover:text-[#E1500A] transition-colors">
                  Ver rack interactivo →
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Giant Vertical Bento / Xenia (6 Cols) */}
          <div
            onClick={() => setActiveModule('xenia')}
            className="lg:col-span-6 bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none p-6 sm:p-8 border border-[#C8C4B7] dark:border-[#222328] flex flex-col justify-between cursor-pointer hover:border-[#18181B] dark:hover:border-white transition-all group relative overflow-hidden min-h-[320px] sm:min-h-[360px]"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#C8C4B7] dark:border-[#222328]">
              <span className="text-[10px] sm:text-[11px] font-mono font-medium uppercase tracking-widest text-[#71717A] dark:text-[#8E8E93]">
                COPILOTO INTELIGENTE / XENIA
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E1500A] animate-pulse shrink-0" />
                <span className="text-xs font-mono font-medium text-[#E1500A]">Copiloto 24/7</span>
              </div>
            </div>

            <div className="my-auto py-4 space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-none overflow-hidden border border-[#18181B] dark:border-white shrink-0 shadow-none bg-[#1c1a18]">
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
                  <h2 className="text-3xl sm:text-5xl lg:text-6xl font-normal text-[#18181B] dark:text-white tracking-tight">
                    Xenia
                  </h2>
                  <p className="text-xs sm:text-sm text-[#71717A] dark:text-[#A1A1AA] font-normal">
                    No vas a estar solo en la gestión.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-none bg-transparent border border-[#C8C4B7] dark:border-[#222328]">
                <p className="text-xs sm:text-sm font-normal text-[#18181B] dark:text-[#EFECE5] leading-relaxed">
                  «Te asisto por audio o texto para cargar cabañas, sincronizar tarifas y responderle a tus huéspedes en español rioplatense.»
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#C8C4B7] dark:border-[#222328] flex items-center justify-between text-xs text-[#71717A] dark:text-[#8E8E93] font-mono">
              <span>Voz & WhatsApp inteligente</span>
              <span className="text-[#18181B] dark:text-white font-medium group-hover:text-[#E1500A] transition-colors">
                Tocar para escuchar y explorar →
              </span>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* ROW 3: REVENUE (3 Cols) + DOTS COLUMN (2 Cols) + PRICING (4 Cols) + OTA (3 Cols) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-2.5 sm:gap-3">
          
          {/* Tile G: 0% Comisión (3 Cols) */}
          <div
            onClick={() => setActiveModule('revenue')}
            className="lg:col-span-3 bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none p-5 sm:p-6 border border-[#C8C4B7] dark:border-[#222328] flex flex-col justify-between cursor-pointer hover:border-[#18181B] dark:hover:border-white transition-all group min-h-[200px]"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#C8C4B7] dark:border-[#222328]">
              <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[#71717A] dark:text-[#8E8E93]">
                RENTABILIDAD DIRECTA
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#E1500A] shrink-0" />
            </div>

            <div className="my-auto py-1">
              <div className="text-4xl sm:text-5xl font-light text-[#E1500A] tracking-tight">
                0%
              </div>
              <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] font-normal mt-1">
                Comisión directa: cobros a tu cuenta
              </p>
            </div>

            <div className="pt-2 border-t border-[#C8C4B7] dark:border-[#222328] flex items-center justify-between text-xs text-[#71717A] dark:text-[#8E8E93] font-mono">
              <span>+30% margen</span>
              <span className="text-[#18181B] dark:text-white font-medium group-hover:text-[#E1500A] transition-colors">
                Ver →
              </span>
            </div>
          </div>

          {/* Tile H: 123C Dots Column (2 Cols) */}
          <div
            onClick={() => setActiveModule('channels')}
            className="lg:col-span-2 bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none p-4 sm:p-5 border border-[#C8C4B7] dark:border-[#222328] flex flex-col justify-between cursor-pointer hover:border-[#18181B] dark:hover:border-white transition-all group min-h-[200px]"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#C8C4B7] dark:border-[#222328]">
              <span className="text-[9px] font-mono font-medium uppercase tracking-widest text-[#71717A] dark:text-[#8E8E93]">
                CANALES OFICIALES
              </span>
            </div>

            {/* 4 Geometric circles with labels */}
            <div className="my-auto space-y-2 py-1">
              <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
                <span className="truncate">Airbnb</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#18181B] dark:bg-white shrink-0" />
              </div>
              <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
                <span className="truncate">Booking</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#E1500A] shrink-0" />
              </div>
              <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
                <span className="truncate">MP / CBU</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#71717A] shrink-0" />
              </div>
              <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
                <span className="truncate">WhatsApp</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#18181B] dark:bg-white shrink-0" />
              </div>
            </div>

            <div className="pt-2 border-t border-[#C8C4B7] dark:border-[#222328] text-center text-[10px] font-mono text-[#71717A] dark:text-[#8E8E93]">
              Canales Conectados
            </div>
          </div>

          {/* Tile I: Pricing ARS (4 Cols) */}
          <div
            onClick={() => setActiveModule('pricing')}
            className="lg:col-span-4 bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none p-5 sm:p-6 border border-[#C8C4B7] dark:border-[#222328] flex flex-col justify-between cursor-pointer hover:border-[#18181B] dark:hover:border-white transition-all group min-h-[200px]"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#C8C4B7] dark:border-[#222328]">
              <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[#71717A] dark:text-[#8E8E93]">
                PLANES & TARIFAS / ARS
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#E1500A] shrink-0" />
            </div>

            <div className="my-auto py-1">
              <div className="text-3xl sm:text-4xl font-light text-[#18181B] dark:text-white tracking-tight">
                $45.000 <span className="text-xs font-normal text-[#71717A]">/mes</span>
              </div>
              <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] font-normal mt-1">
                Abono fijo en pesos • Ajuste IPC • Sin tarjeta
              </p>
            </div>

            <div className="pt-2 border-t border-[#C8C4B7] dark:border-[#222328] flex items-center justify-between text-xs text-[#71717A] dark:text-[#8E8E93] font-mono">
              <span>3 Planes simples</span>
              <span className="text-[#18181B] dark:text-white font-medium group-hover:text-[#E1500A] transition-colors">
                Ver calculadora →
              </span>
            </div>
          </div>

          {/* Tile J: Onboarding / Concierge (3 Cols) */}
          <div
            onClick={() => setActiveModule('onboarding')}
            className="lg:col-span-3 bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none p-5 sm:p-6 border border-[#C8C4B7] dark:border-[#222328] flex flex-col justify-between cursor-pointer hover:border-[#18181B] dark:hover:border-white transition-all group min-h-[200px]"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#C8C4B7] dark:border-[#222328]">
              <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[#71717A] dark:text-[#8E8E93]">
                PUESTA EN MARCHA / 72 HS
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#18181B] dark:bg-white shrink-0" />
            </div>

            <div className="my-auto py-1">
              <h3 className="text-2xl sm:text-3xl font-normal text-[#18181B] dark:text-white tracking-tight">
                Llave en Mano
              </h3>
              <p className="text-[11px] text-[#71717A] dark:text-[#A1A1AA] font-normal mt-0.5">
                Setup inicial completo en 72hs
              </p>
            </div>

            <div className="pt-2 border-t border-[#C8C4B7] dark:border-[#222328] flex items-center justify-between text-[11px] text-[#71717A] dark:text-[#8E8E93] font-mono">
              <span>Asistencia total</span>
              <span className="text-[#18181B] dark:text-white font-medium group-hover:text-[#E1500A] transition-colors">
                Consultar →
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE DETAIL MODAL / DRAWER (OPENS ON BOX CLICK)                    */}
      {/* ========================================================================= */}
      {activeModule && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-[#EAE8E3] dark:bg-[#0C0D0F] rounded-none border border-[#18181B] dark:border-white w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-10 shadow-2xl relative text-[#18181B] dark:text-white">
            
            {/* Close Button */}
            <button
              onClick={() => setActiveModule(null)}
              className="absolute top-6 right-6 p-2 rounded-none border border-[#18181B] dark:border-white text-[#18181B] dark:text-white hover:bg-[#18181B] hover:text-white dark:hover:bg-white dark:hover:text-[#18181B] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* DETAIL: HERO RESUMEN */}
            {activeModule === 'hero' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[#E1500A]">
                    01 / RESUMEN DEL SISTEMA
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-normal mt-1">Loomi Suite: Gestión sin pesadez</h3>
                </div>

                <p className="text-sm sm:text-base text-[#52525B] dark:text-[#A1A1AA] leading-relaxed font-normal">
                  Reemplazá el cuaderno, las planillas y los mensajes desordenados con un software visual pensado para alojamientos de 4 a 30+ unidades. Todo conectado: reservas, limpieza, cobros y WhatsApp.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-center">
                  <div className="p-3 border border-[#C8C4B7] dark:border-[#222328]">🌲 Cabañas</div>
                  <div className="p-3 border border-[#C8C4B7] dark:border-[#222328]">⛺ Glampings</div>
                  <div className="p-3 border border-[#C8C4B7] dark:border-[#222328]">🏢 Deptos</div>
                  <div className="p-3 border border-[#C8C4B7] dark:border-[#222328]">🏡 Posadas</div>
                </div>

                <div className="pt-4 border-t border-[#C8C4B7] dark:border-[#222328] flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenDemo();
                    }}
                    className="px-6 py-3 rounded-none bg-[#E1500A] text-white font-semibold text-xs hover:bg-[#C94305] transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Abrir Demo Interactiva</span>
                  </button>
                </div>
              </div>
            )}

            {/* DETAIL: XENIA */}
            {activeModule === 'xenia' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-none overflow-hidden border border-[#E1500A] shrink-0 bg-[#1c1a18]">
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
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[#E1500A]">
                        02 / COPILOTO INTELIGENTE
                      </span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-normal mt-0.5">Xenia: No vas a estar solo</h3>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-[#52525B] dark:text-[#A1A1AA] leading-relaxed font-normal">
                  Xenia es una asistente integrada que responde tus dudas operativas del día a día, te enseña a cargar cabañas, sincronizar con Airbnb y redacta mensajes sin tecnicismos en español rioplatense.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-none border border-[#C8C4B7] dark:border-[#222328] text-xs">
                    <strong className="font-semibold block text-sm mb-1">🎙️ Por Voz y Texto</strong>
                    <p className="text-[#52525B] dark:text-[#A1A1AA] font-normal">Podés mandarle audios por WhatsApp o hablarle en el panel.</p>
                  </div>
                  <div className="p-4 rounded-none border border-[#C8C4B7] dark:border-[#222328] text-xs">
                    <strong className="font-semibold block text-sm mb-1">✨ Sin Manuales</strong>
                    <p className="text-[#52525B] dark:text-[#A1A1AA] font-normal">Te explica cómo configurar tarifas y bloquear fechas en un toque.</p>
                  </div>
                  <div className="p-4 rounded-none border border-[#C8C4B7] dark:border-[#222328] text-xs">
                    <strong className="font-semibold block text-sm mb-1">🇦🇷 Cercanía Real</strong>
                    <p className="text-[#52525B] dark:text-[#A1A1AA] font-normal">Entiende el vocabulario de cabañas, señas y rotación turística.</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#C8C4B7] dark:border-[#222328] flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenDemo();
                    }}
                    className="px-6 py-3 rounded-none bg-[#E1500A] text-white font-semibold text-xs hover:bg-[#C94305] transition-colors cursor-pointer"
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
                  <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[#E1500A]">
                    03 / SINCRONIZACIÓN AUTOMÁTICA
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-normal mt-1">
                    Calendarios conectados: Chau al miedo a la doble reserva
                  </h3>
                </div>

                <p className="text-sm sm:text-base text-[#52525B] dark:text-[#A1A1AA] leading-relaxed font-normal">
                  Sincronizá Airbnb, Booking.com, Vrbo y tus reservas directas. Cuando entra una reserva en cualquier portal, las fechas se bloquean automáticamente en todos los demás en 3 segundos.
                </p>

                <div className="p-4 rounded-none border border-[#C8C4B7] dark:border-[#222328] space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span>Cabaña del Bosque</span>
                    <span className="text-[#E1500A]">Directo • 3 noches reservadas</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Domo Glamping</span>
                    <span>Booking.com (Bloqueado en Airbnb)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Depto 102</span>
                    <span>Airbnb (Bloqueado en Booking.com)</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#C8C4B7] dark:border-[#222328] flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenDemo();
                    }}
                    className="px-6 py-3 rounded-none bg-[#E1500A] text-white font-semibold text-xs hover:bg-[#C94305] transition-colors cursor-pointer"
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
                  <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[#E1500A]">
                    04 / WHATSAPP AUTOMÁTICO
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-normal mt-1">
                    Desactivá reclamos antes de que nazcan
                  </h3>
                </div>

                <p className="text-sm sm:text-base text-[#52525B] dark:text-[#A1A1AA] leading-relaxed font-normal">
                  Envía la coordinación de ruta, clave Wi-Fi al llegar y control de confort a las 2 horas para solucionar cualquier detalle en privado antes de que se transforme en una mala reseña.
                </p>

                <div className="space-y-2">
                  <div className="p-3.5 rounded-none border border-[#C8C4B7] dark:border-[#222328] text-xs space-y-1">
                    <strong className="text-[#E1500A] font-semibold block">1. Coordinación en Ruta</strong>
                    <p className="text-[#52525B] dark:text-[#A1A1AA] font-normal">«Avísennos cuando estén a 40 minutos de llegar para esperarlos con la cabaña templada.»</p>
                  </div>
                  <div className="p-3.5 rounded-none border border-[#C8C4B7] dark:border-[#222328] text-xs space-y-1">
                    <strong className="font-semibold block">2. Control de Confort (2hs Post-Ingreso)</strong>
                    <p className="text-[#52525B] dark:text-[#A1A1AA] font-normal">«¿Encontraron todo impecable? Cualquier consulta nos avisan por acá.»</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#C8C4B7] dark:border-[#222328] flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenDemo();
                    }}
                    className="px-6 py-3 rounded-none bg-[#E1500A] text-white font-semibold text-xs hover:bg-[#C94305] transition-colors cursor-pointer"
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
                  <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[#E1500A]">
                    05 / OPERACIONES & PUESTA A PUNTO
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-normal mt-1">
                    Tu staff sabe qué preparar hoy sin volverte loco
                  </h3>
                </div>

                <p className="text-sm sm:text-base text-[#52525B] dark:text-[#A1A1AA] leading-relaxed font-normal">
                  Tu equipo operativo tiene su propio enlace en el celular con el listado del día, horarios de recambio urgente y checklist con fotos para que cada cabaña esté impecable a tiempo.
                </p>

                <ul className="space-y-2 text-xs font-normal text-[#52525B] dark:text-[#A1A1AA]">
                  <li className="flex items-center gap-2">✅ Semáforo claro: Limpia, Sucia o En Inspección</li>
                  <li className="flex items-center gap-2">✅ Checklist de blancos, amenities y sanitización</li>
                  <li className="flex items-center gap-2">✅ Prioridades automáticas según horarios de check-in</li>
                </ul>

                <div className="pt-4 border-t border-[#C8C4B7] dark:border-[#222328] flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenDemo();
                    }}
                    className="px-6 py-3 rounded-none bg-[#E1500A] text-white font-semibold text-xs hover:bg-[#C94305] transition-colors cursor-pointer"
                  >
                    Ver Módulo Mucamas en Demo
                  </button>
                </div>
              </div>
            )}

            {/* DETAIL: REVENUE */}
            {activeModule === 'revenue' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[#E1500A]">
                    06 / RENTABILIDAD PURA
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-normal mt-1">
                    0% de comisión en reservas directas
                  </h3>
                </div>

                <p className="text-sm sm:text-base text-[#52525B] dark:text-[#A1A1AA] leading-relaxed font-normal">
                  Tus huéspedes escanean el QR en la cabaña o entran a tu link directo. Cobrás señas por Mercado Pago, Transferencia Bancaria (CBU) o PayPal sin pagar 15% a 20% a intermediarios.
                </p>

                <div className="p-4 rounded-none border border-[#C8C4B7] dark:border-[#222328] text-xs font-mono space-y-1">
                  <div className="flex justify-between">
                    <span>Cobros a tu cuenta:</span>
                    <strong className="text-[#E1500A]">Directo al 100%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Comisión de Loomi:</span>
                    <strong>$0</strong>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#C8C4B7] dark:border-[#222328] flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenDemo();
                    }}
                    className="px-6 py-3 rounded-none bg-[#E1500A] text-white font-semibold text-xs hover:bg-[#C94305] transition-colors cursor-pointer"
                  >
                    Probar Motor Directo en Demo
                  </button>
                </div>
              </div>
            )}

            {/* DETAIL: PRICING */}
            {activeModule === 'pricing' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[#E1500A]">
                    07 / PRECIOS CLAROS EN PESOS
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-normal mt-1">
                    Planes transparentes ajustados por IPC
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {plans.map((p) => (
                    <div key={p.id} className="p-4 rounded-none border border-[#C8C4B7] dark:border-[#222328] text-xs flex flex-col justify-between">
                      <div>
                        <strong className="font-semibold text-sm block">{p.name}</strong>
                        <span className="text-xl font-light text-[#E1500A] block my-2">
                          ${p.price.toLocaleString('es-AR')} <span className="text-xs text-[#71717A]">/mes</span>
                        </span>
                        <p className="text-[#52525B] dark:text-[#A1A1AA] font-normal">{p.description}</p>
                      </div>
                      <button
                        onClick={() => {
                          setActiveModule(null);
                          onOpenContact(`Plan ${p.name}`);
                        }}
                        className="mt-4 w-full py-2 rounded-none bg-[#18181B] text-white dark:bg-white dark:text-[#18181B] font-semibold text-xs cursor-pointer"
                      >
                        Consultar →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DETAIL: CHANNELS */}
            {activeModule === 'channels' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#E1500A]">
                    08 / CONECTIVIDAD
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black mt-1">
                    Canales integrados en un solo rack
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {['Airbnb', 'Booking.com', 'Vrbo / Expedia', 'TripAdvisor', 'WhatsApp Cloud', 'Mercado Pago', 'PayPal', 'Cerraduras PIN'].map((c, i) => (
                    <div key={i} className="p-3 border border-[#C8C4B7] dark:border-[#222328] font-bold text-center">
                      {c}
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-[#C8C4B7] dark:border-[#222328] flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenDemo();
                    }}
                    className="px-6 py-3 rounded-none bg-[#E1500A] text-white font-black text-xs hover:bg-[#C94305] transition-colors cursor-pointer"
                  >
                    Ver Sincronización en Demo
                  </button>
                </div>
              </div>
            )}

            {/* DETAIL: ONBOARDING */}
            {activeModule === 'onboarding' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#E1500A]">
                    09 / SERVICIO CONCIERGE
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black mt-1">
                    Servicio Llave en Mano en 72 horas
                  </h3>
                </div>

                <p className="text-sm sm:text-base text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">
                  Si no disponés de tiempo para cargar fotos, registrar tus cabañas o vincular los enlaces iCal de Airbnb y Booking, nuestro equipo hace el 100% de la puesta en marcha inicial por vos.
                </p>

                <div className="p-4 border border-[#C8C4B7] dark:border-[#222328] text-xs font-bold space-y-2">
                  <p>✅ Configuración de todas tus unidades y fotos</p>
                  <p>✅ Enlace bidireccional de calendarios iCal</p>
                  <p>✅ Guía digital interactiva con tu clave Wi-Fi y mapa</p>
                  <p>✅ Capacitación inicial personalizada para vos y tu equipo</p>
                </div>

                <div className="pt-4 border-t border-[#C8C4B7] dark:border-[#222328] flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenContact('Servicio Concierge Onboarding Llave en Mano');
                    }}
                    className="px-6 py-3 rounded-none bg-[#E1500A] text-white font-black text-xs hover:bg-[#C94305] transition-colors cursor-pointer"
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
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#E1500A]">
                    METRICS & PROOF
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black mt-1">
                    Resultados reales en complejos activos
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 border border-[#C8C4B7] dark:border-[#222328] text-center">
                    <span className="text-3xl font-black text-[#18181B] dark:text-white">+850</span>
                    <p className="text-xs text-[#71717A] mt-1 font-bold">Cabañas y departamentos</p>
                  </div>
                  <div className="p-4 border border-[#C8C4B7] dark:border-[#222328] text-center">
                    <span className="text-3xl font-black text-[#E1500A]">0</span>
                    <p className="text-xs text-[#71717A] mt-1 font-bold">Dobles reservas</p>
                  </div>
                  <div className="p-4 border border-[#C8C4B7] dark:border-[#222328] text-center">
                    <span className="text-3xl font-black text-[#18181B] dark:text-white">15 min</span>
                    <p className="text-xs text-[#71717A] mt-1 font-bold">Puesta en marcha promedio</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#C8C4B7] dark:border-[#222328] flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setActiveModule(null);
                      onOpenDemo();
                    }}
                    className="px-6 py-3 rounded-none bg-[#E1500A] text-white font-black text-xs hover:bg-[#C94305] transition-colors cursor-pointer"
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
