import React, { useState } from 'react';
import {
  MapPin,
  Wifi,
  Navigation,
  ExternalLink,
  Car,
  Compass,
  Utensils,
  ShieldAlert,
  Phone,
  Flame,
  Waves,
  Clock,
  Check,
  Copy,
  Info,
  Sparkles,
  ChevronRight,
  Share2,
  Home,
  Store,
  ShoppingCart,
  QrCode,
  X,
  Tv,
  Thermometer,
  Coffee,
  HelpCircle,
  AlertTriangle,
  Plus,
  Minus,
  MessageCircle,
  Search,
  Key,
  Trash2,
  HeartHandshake,
  FileText,
  Palette,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { WelcomeGuideData, AttractionItem, DiningItem } from '../../types';

export type PortalTheme =
  | 'clara'
  | 'tierra'
  | 'sombra'
  | 'dos-aguas'
  | 'corte-vette'
  | 'medano-blanco'
  | 'bay'
  | 'retrato'
  | 'urbano';

interface GuestWelcomePortalProps {
  guideData: WelcomeGuideData;
  isMobilePreview?: boolean;
  isPublicView?: boolean;
  guestName?: string;
  unitName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  pinCode?: string;
  template?: PortalTheme;
  onSelectTemplate?: (template: PortalTheme) => void;
  onBackToPanel?: () => void;
}

// Pre-defined appliance guides
interface ApplianceGuide {
  id: string;
  name: string;
  icon: string;
  subtitle: string;
  steps: string[];
  tips: string;
}

const APPLIANCE_GUIDES: ApplianceGuide[] = [
  {
    id: 'cafetera',
    name: 'Cafetera Nespresso & Té de Cortesía',
    icon: 'Coffee',
    subtitle: 'Instrucciones para preparar espresso y selección de infusiones',
    steps: [
      'Verificar que el depósito de agua posterior se encuentre lleno con agua filtrada.',
      'Levantar la palanca superior, insertar la cápsula de cortesía y bajar la palanca con firmeza.',
      'Colocar tu taza en la base y presionar el botón de taza corta (Espresso) o taza larga (Lungo).',
      'Al terminar la extracción, levantar nuevamente la palanca para expulsar la cápsula al contenedor interno.'
    ],
    tips: '☕ En la bandeja de cortesía tenés cápsulas de bienvenida, té en hebras y azúcar/edulcorante.'
  },
  {
    id: 'clima',
    name: 'Climatización & Termostato',
    icon: 'Thermometer',
    subtitle: 'Aire Acondicionado Frío/Calor y Calefacción',
    steps: [
      'Utilizar el control remoto blanco ubicado en el soporte junto a la puerta del dormitorio.',
      'Modo Verano: Seleccionar "COOL" (ícono de copo de nieve) y fijar entre 23°C y 25°C para confort óptimo.',
      'Modo Invierno: Seleccionar "HEAT" (ícono de sol) y fijar en 22°C (el ventilador demorará 2-3 min en arrancar aire caliente).',
      'Cerrar bien puertas y ventanales mientras el equipo esté encendido para conservar la temperatura.'
    ],
    tips: '💡 Mantener los filtros libres y apagar las unidades si salís de paseo durante el día.'
  },
  {
    id: 'smarttv',
    name: 'Smart TV & Streaming',
    icon: 'Tv',
    subtitle: 'Netflix, YouTube, TV por Cable y Cast',
    steps: [
      'Encender el televisor con el botón rojo del control remoto principal.',
      'Presionar el botón "HOME" para acceder al menú de aplicaciones.',
      'La unidad cuenta con Netflix y YouTube con cuenta precargada para huéspedes.',
      'Podés transmitir desde tu celular seleccionando el dispositivo "Smart TV Cabaña" en tu app de streaming favorita.'
    ],
    tips: '🔒 Podés iniciar sesión con tus propias cuentas y recordá cerrarlas el día de tu check-out.'
  },
  {
    id: 'cocina',
    name: 'Cocina & Anafe Eléctrico Vitrocerámico',
    icon: 'Flame',
    subtitle: 'Encendido seguro y uso de electrodomésticos',
    steps: [
      'Anafe Vitrocerámico: Mantener presionado el botón táctil de encendido durante 2 segundos para desbloquear.',
      'Seleccionar la hornalla deseada y regular la potencia con los botones + / - del 1 al 9.',
      'Pava eléctrica & Tostadora: Conectadas sobre la mesada principal, con corte automático al hervir.',
      'La heladera cuenta con selector de temperatura interior en nivel 3 para frío estándar.'
    ],
    tips: '✨ Utilizar solo recipientes aptos de fondo plano para no rayar la superficie de vidrio.'
  }
];

// In-stay addon service store items
interface InStayService {
  id: string;
  name: string;
  priceUSD: number;
  description: string;
  category: 'confort' | 'gastronomia' | 'relax';
  icon: string;
}

const IN_STAY_SERVICES: InStayService[] = [
  {
    id: 'late_checkout',
    name: 'Salida Extendida / Late Check-out (Hasta las 17:00 hs)',
    priceUSD: 20,
    description: 'Extendé tu estadía para aprovechar la tarde o descansar antes de tu viaje.',
    category: 'confort',
    icon: 'Clock'
  },
  {
    id: 'desayuno_artesanal',
    name: 'Canasta de Desayuno Misionero',
    priceUSD: 12,
    description: 'Canasta con chipitas caseras de almidón calientes, mermeladas regionales de la selva, café y jugo natural.',
    category: 'gastronomia',
    icon: 'Coffee'
  },
  {
    id: 'lena_carbon',
    name: 'Bolsa de Leña Seca & Carbón para Parrilla',
    priceUSD: 5,
    description: 'Leña dura seleccionada y carbón listo junto al parrillero de tu cabaña.',
    category: 'confort',
    icon: 'Flame'
  },
  {
    id: 'limpieza_extra',
    name: 'Servicio de Mucama & Cambio de Blancos',
    priceUSD: 18,
    description: 'Limpieza profunda de la cabaña, cambio completo de sábanas, toallones y reposición de amenities.',
    category: 'confort',
    icon: 'Sparkles'
  },
  {
    id: 'vino_tabla',
    name: 'Vino Reserva de la Casa + Tabla Gourmet',
    priceUSD: 24,
    description: 'Botella de vino Malbec Reserva maridada con selección de quesos, frutos secos y fiambres.',
    category: 'gastronomia',
    icon: 'Utensils'
  }
];

export const GuestWelcomePortal: React.FC<GuestWelcomePortalProps> = ({
  guideData,
  isMobilePreview = false,
  isPublicView = false,
  guestName: propGuestName,
  unitName: propUnitName,
  checkInDate: propCheckInDate,
  checkOutDate: propCheckOutDate,
  pinCode: propPinCode,
  template: propTemplate,
  onSelectTemplate,
  onBackToPanel,
}) => {
  // Theme state: 'dos-aguas' (default), 'corte-vette', 'medano-blanco'
  const [internalTemplate, setInternalTemplate] = useState<PortalTheme>('dos-aguas');
  const activeTemplate = propTemplate || internalTemplate;

  const handleSetTemplate = (t: PortalTheme) => {
    if (onSelectTemplate) {
      onSelectTemplate(t);
    } else {
      setInternalTemplate(t);
    }
  };

  // Extract URL parameters if present (e.g., ?huesped=Lucas&unidad=Depto%20D&pin=1234)
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const effectiveGuestName = propGuestName || urlParams?.get('huesped') || urlParams?.get('guest') || '';
  const effectiveUnitName = propUnitName || urlParams?.get('unidad') || urlParams?.get('depto') || urlParams?.get('unit') || '';
  const effectivePinCode = propPinCode || urlParams?.get('pin') || '';
  const effectiveCheckIn = propCheckInDate || urlParams?.get('llegada') || '';
  const effectiveCheckOut = propCheckOutDate || urlParams?.get('salida') || '';

  const [activeTab, setActiveTab] = useState<'llegar' | 'estadia' | 'recomendaciones' | 'tienda' | 'manuales'>('llegar');
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [copiedNetwork, setCopiedNetwork] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'todos' | 'atracciones' | 'gastronomia' | 'servicios'>('todos');

  // Modals state
  const [wifiModalOpen, setWifiModalOpen] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState<AttractionItem | null>(null);
  const [selectedDining, setSelectedDining] = useState<DiningItem | null>(null);
  const [selectedAppliance, setSelectedAppliance] = useState<ApplianceGuide | null>(null);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [storeModalOpen, setStoreModalOpen] = useState(false);

  // Store cart state
  const [cart, setCart] = useState<{ [serviceId: string]: number }>({});
  const [orderSent, setOrderSent] = useState(false);

  const copyWifiPassword = () => {
    navigator.clipboard.writeText(guideData.wifiPassword);
    setCopiedWifi(true);
    setTimeout(() => setCopiedWifi(false), 2000);
  };

  const copyWifiNetwork = () => {
    navigator.clipboard.writeText(guideData.wifiNetwork);
    setCopiedNetwork(true);
    setTimeout(() => setCopiedNetwork(false), 2000);
  };

  const addToCart = (serviceId: string) => {
    setCart((prev) => ({
      ...prev,
      [serviceId]: (prev[serviceId] || 0) + 1,
    }));
  };

  const removeFromCart = (serviceId: string) => {
    setCart((prev) => {
      const current = prev[serviceId] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[serviceId];
        return next;
      }
      return { ...prev, [serviceId]: current - 1 };
    });
  };

  const cartTotalUSD = Object.entries(cart).reduce((total, [id, qty]) => {
    const item = IN_STAY_SERVICES.find((s) => s.id === id);
    return total + (item ? item.priceUSD * qty : 0);
  }, 0);

  const cartItemsCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const sendOrderViaWhatsApp = () => {
    const lines = Object.entries(cart).map(([id, qty]) => {
      const item = IN_STAY_SERVICES.find((s) => s.id === id);
      return `• ${item?.name} x${qty} ($${(item?.priceUSD || 0) * qty} USD)`;
    });

    const msg = encodeURIComponent(
      `Hola ${guideData.hostName}! Quiero solicitar los siguientes servicios para mi estadía en ${guideData.propertyName} (${effectiveUnitName || 'Mi Unidad'}):\n\n` +
      lines.join('\n') +
      `\n\nTotal estimado: $${cartTotalUSD} USD\nHuésped: ${effectiveGuestName || 'Huésped'}`
    );

    window.open(`https://wa.me/${guideData.hostPhone.replace(/\D/g, '')}?text=${msg}`, '_blank');
    setOrderSent(true);
    setTimeout(() => {
      setCart({});
      setStoreModalOpen(false);
      setOrderSent(false);
    }, 2000);
  };

  // Filtered recommendations
  const filteredAttractions = guideData.attractions.filter((att) => {
    const matchesSearch =
      att.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      att.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      att.tips.toLowerCase().includes(searchTerm.toLowerCase());
    return (selectedCategory === 'todos' || selectedCategory === 'atracciones') && matchesSearch;
  });

  const filteredDining = guideData.dining.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.address.toLowerCase().includes(searchTerm.toLowerCase());
    return (selectedCategory === 'todos' || selectedCategory === 'gastronomia' || selectedCategory === 'servicios') && matchesSearch;
  });

  // QR Code generator URL for Wi-Fi direct connection
  const wifiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    `WIFI:S:${guideData.wifiNetwork};T:WPA;P:${guideData.wifiPassword};;`
  )}`;

  // =========================================================================
  // THEME STYLING CONFIGURATION (3 MODELOS: "Clara", "Tierra", "Sombra")
  // =========================================================================
  const isClara = activeTemplate === 'clara' || activeTemplate === 'dos-aguas' || activeTemplate === 'retrato';
  const isTierra = activeTemplate === 'tierra' || activeTemplate === 'corte-vette' || (activeTemplate as string) === 'triptych';
  const isSombra = activeTemplate === 'sombra' || activeTemplate === 'medano-blanco' || activeTemplate === 'bay' || activeTemplate === 'urbano';

  const isDosAguas = isClara;
  const isCorteVette = isTierra;
  const isMedanoBlanco = isSombra;

  const theme = {
    wrapper: isCorteVette
      ? 'bg-[#0e0c09] text-[#EDE8DF] font-sans'
      : isDosAguas
      ? 'bg-[#0c0e0d] text-[#EDE8DF] font-sans'
      : 'bg-[#FAF8F5] text-stone-900 font-sans',
    
    mobileBorder: isCorteVette
      ? 'border-2 border-[#c5a880]/50 rounded-3xl shadow-2xl bg-[#0e0c09]'
      : isDosAguas
      ? 'border-stone-800 rounded-3xl shadow-2xl bg-[#0c0e0d]'
      : 'border-stone-200 rounded-3xl shadow-xl bg-[#FAF8F5]',

    headerBg: isCorteVette
      ? 'bg-[#14110d] border-b border-[#c5a880]/20 text-[#EDE8DF]'
      : isDosAguas
      ? 'bg-[#121413] border-b border-stone-800 text-[#EDE8DF]'
      : 'bg-[#24211e] border-b border-stone-700 text-[#FAF8F5]',

    headerTitle: isCorteVette
      ? 'font-serif font-light tracking-widest text-[#f5ebd9] uppercase'
      : isDosAguas
      ? 'font-sans font-light tracking-tight text-white'
      : 'font-serif font-light tracking-wider uppercase text-white',

    headerSubtitle: isCorteVette
      ? 'text-[#c5a880] font-mono text-xs'
      : isDosAguas
      ? 'text-stone-400 font-light'
      : 'text-stone-300 font-sans font-light',

    headerTag: isCorteVette
      ? 'bg-[#261f17] text-[#c5a880] border-[#c5a880]/40 font-mono text-[10px]'
      : isDosAguas
      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40 font-mono text-[10px]'
      : 'bg-amber-950/80 text-amber-300 border-amber-800/50 font-mono text-[10px]',

    accentText: isCorteVette
      ? 'text-[#c5a880]'
      : isDosAguas
      ? 'text-emerald-400'
      : 'text-amber-700',

    accentBg: isCorteVette
      ? 'bg-[#c5a880] text-stone-950 font-bold'
      : isDosAguas
      ? 'bg-emerald-600'
      : 'bg-amber-600',

    accentBadge: isCorteVette
      ? 'bg-[#261f17] text-[#c5a880] border border-[#c5a880]/40 font-mono'
      : isDosAguas
      ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/40'
      : 'bg-amber-50 text-amber-900 border border-amber-200 font-medium',

    cardBg: isCorteVette
      ? 'bg-[#15120e] border-stone-800 text-stone-200'
      : isDosAguas
      ? 'bg-[#151716] border-stone-800 text-stone-200'
      : 'bg-white border-stone-200 text-stone-900 shadow-sm',

    cardInnerBg: isCorteVette
      ? 'bg-[#0d0b08] border-stone-800 text-stone-200 hover:bg-[#1a1611]'
      : isDosAguas
      ? 'bg-[#0c0e0d] border-stone-800 text-stone-200 hover:bg-[#181b19]'
      : 'bg-[#FAF8F5] border-stone-200 text-stone-900 hover:bg-stone-100',

    tabActive: isCorteVette
      ? 'bg-[#c5a880] text-stone-950 font-bold shadow-xs'
      : isDosAguas
      ? 'bg-emerald-600 text-white shadow-xs'
      : 'bg-amber-600 text-white shadow-xs font-bold',

    tabInactive: isCorteVette
      ? 'text-stone-400 hover:text-[#c5a880]'
      : isDosAguas
      ? 'text-stone-400 hover:text-white'
      : 'text-stone-600 hover:text-stone-900',

    navBarBg: isCorteVette
      ? 'bg-[#14110d] border-b border-stone-800'
      : isDosAguas
      ? 'bg-[#121413] border-b border-stone-800'
      : 'bg-[#FAF8F5] border-b border-stone-200',

    bannerGreeting: isCorteVette
      ? 'bg-gradient-to-r from-[#2a2218] via-[#15120e] to-[#15120e] border-l-4 border-l-[#c5a880] border-y border-r border-stone-800'
      : isDosAguas
      ? 'bg-gradient-to-r from-emerald-950/50 via-[#151716] to-[#151716] border-l-4 border-l-emerald-500 border-y border-r border-stone-800'
      : 'bg-gradient-to-r from-amber-500/20 via-white to-white border-l-4 border-l-amber-600 border-y border-r border-stone-200 shadow-sm',

    btnPrimary: isCorteVette
      ? 'bg-[#c5a880] hover:bg-[#b8986d] text-stone-950 font-bold shadow-sm'
      : isDosAguas
      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
      : 'bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-sm',

    heroPhoto: isCorteVette
      ? '/cabanas/cabana-terraza.jpg'
      : isDosAguas
      ? '/cabanas/deck-hamaca.jpg'
      : '/cabanas/cabana-hamaca.jpg',
  };

  return (
    <div className="space-y-4">
      {/* Botón flotante al ver en Pantalla Completa para que el usuario nunca quede atrapado (Oculto en vista pública para huéspedes) */}
      {!isPublicView && !isMobilePreview && onBackToPanel && (
        <div className="fixed top-16 sm:top-20 left-3 sm:left-6 z-30 font-sans pointer-events-auto">
          <button
            onClick={onBackToPanel}
            className="bg-stone-900/95 hover:bg-black text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-2xl border border-white/15 flex items-center gap-2 backdrop-blur-md cursor-pointer transition-all hover:scale-105 active:scale-95 group"
            title="Volver al Panel de Control de Loomi Suite"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#E67E22] group-hover:-translate-x-0.5 transition-transform" />
            <span>← Volver al Panel</span>
          </button>
        </div>
      )}

      {/* Selector Coherente de Estilo Visual para la Guía (Oculto en vista pública del huésped) */}
      {!isPublicView && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900 text-white p-3 sm:px-4 rounded-xl text-xs font-sans border border-stone-800 shadow-sm">
          <div className="flex items-center gap-2.5">
            {onBackToPanel && (
              <button
                onClick={onBackToPanel}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 border border-stone-700 shadow-xs"
                title="Volver a la vista del panel"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#E67E22]" />
                <span>← Volver al Panel</span>
              </button>
            )}
            <Palette className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-bold">Estética Visual Coherente:</span>
            <span className="text-stone-300 text-[11px] hidden md:inline">
              (La guía adapta tipografía, colores y ambientación al diseño que elegiste en Tu Web)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-stone-950 border border-stone-800">
            <button
              onClick={() => handleSetTemplate('clara')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                isClara ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
              title="Plantilla 1: Clara • Estructuras limpias, luz franca y geometría noble"
            >
              <span>☀️ Clara</span>
              <span className="text-[10px] font-normal opacity-70 hidden sm:inline">(Luz franca)</span>
            </button>
            <button
              onClick={() => handleSetTemplate('tierra')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                isTierra ? 'bg-[#9E3D31] text-white shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
              title="Plantilla 2: Tierra • Texturas nobles, maderas, revoques cálidos e imperfección natural"
            >
              <span>🪵 Tierra</span>
              <span className="text-[10px] font-normal opacity-70 hidden sm:inline">(Maderas)</span>
            </button>
            <button
              onClick={() => handleSetTemplate('sombra')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                isSombra ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
              title="Plantilla 3: Sombra • Atmósfera íntima, maderas oscuras y penumbra elegante"
            >
              <span>🌑 Sombra</span>
              <span className="text-[10px] font-normal opacity-70 hidden sm:inline">(Íntima)</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Portal Container */}
      <div
        className={`mx-auto ${theme.wrapper} antialiased transition-all duration-300 ${
          isMobilePreview
            ? `max-w-[420px] ${theme.mobileBorder} overflow-hidden border`
            : `max-w-4xl rounded-2xl shadow-xl border ${isDosAguas || isCorteVette ? 'border-stone-800' : 'border-stone-200'}`
        }`}
      >
        {/* Hero Header */}
        <div className={`relative ${theme.headerBg} p-5 sm:p-6 overflow-hidden`}>
          {/* Background Ambient Image */}
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
            <img
              src={theme.heroPhoto}
              alt={guideData.propertyName}
              className="w-full h-full object-cover scale-105"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${
              isDosAguas
                ? 'from-[#121413] via-[#121413]/80 to-black/60'
                : isCorteVette
                ? 'from-[#14110d] via-[#14110d]/85 to-black/70'
                : 'from-[#24211e] via-[#24211e]/85 to-black/70'
            }`} />
          </div>

          <div className="relative z-10">
            {/* Top Live Bar */}
            <div className="flex items-center justify-between text-xs font-mono mb-2.5">
              <span className={`flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] ${
                isDosAguas ? 'text-emerald-400' : isCorteVette ? 'text-[#c5a880]' : 'text-amber-300'
              }`}>
                <Compass className="w-3.5 h-3.5" />
                Guía del Huésped • App Digital
              </span>
              <span className={`px-2 py-0.5 rounded-full border ${theme.headerTag}`}>
                {guideData.propertyName || 'Mi complejo'}
              </span>
            </div>

            {/* Personalized VIP Greeting Banner */}
            {(effectiveGuestName || effectiveUnitName) && (
              <div className={`mb-4 p-3.5 ${theme.bannerGreeting} rounded-xl animate-in fade-in duration-300`}>
                <div className={`flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider ${theme.accentText}`}>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Estadía Personalizada</span>
                  {effectiveUnitName && (
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-md ${theme.accentBg}`}>
                      {effectiveUnitName}
                    </span>
                  )}
                </div>
                <div className="text-base sm:text-lg font-black mt-1">
                  ¡Hola {effectiveGuestName || 'Huésped'}! Te damos la bienvenida a tu estadía
                </div>
                {(effectiveCheckIn || effectivePinCode) && (
                  <div className={`flex flex-wrap items-center gap-3 mt-2 pt-2 border-t text-xs ${
                    isDosAguas || isCorteVette ? 'border-stone-800' : 'border-stone-200'
                  }`}>
                    {effectiveCheckIn && (
                      <span className="text-xs">
                        📅 Check-in: <strong>{effectiveCheckIn}</strong>
                      </span>
                    )}
                    {effectiveCheckOut && (
                      <span className="text-xs">
                        🏁 Check-out: <strong>{effectiveCheckOut}</strong>
                      </span>
                    )}
                    {effectivePinCode && (
                      <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-xs ${theme.accentBadge}`}>
                        🔑 PIN Cerradura: {effectivePinCode}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            <h1 className={`text-2xl sm:text-3xl ${theme.headerTitle}`}>
              {guideData.propertyName}
            </h1>
            <p className={`text-xs sm:text-sm mt-1 font-normal leading-relaxed ${theme.headerSubtitle}`}>
              {guideData.tagline || 'Disfrutá de una experiencia confortable con atención personalizada.'}
            </p>

            {/* Quick Host Action Bar */}
            <div className={`mt-4 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border ${theme.cardBg}`}>
              <div className="flex items-center gap-2.5 text-xs">
                <div className={`w-8 h-8 rounded-xl ${theme.accentBg} text-white flex items-center justify-center font-bold text-sm shadow-xs`}>
                  {guideData.hostName[0]}
                </div>
                <div>
                  <div className="font-bold text-xs">Anfitrión: {guideData.hostName}</div>
                  <div className="text-[10px] opacity-70">Atención directa y soporte</div>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                <a
                  href={`https://wa.me/${guideData.hostPhone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(
                    guideData.hostName
                  )},%20estoy%20alojado%20en%20${encodeURIComponent(guideData.propertyName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold text-xs transition-colors cursor-pointer rounded-xl shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp</span>
                </a>
                <button
                  onClick={() => setEmergencyModalOpen(true)}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${theme.cardInnerBg}`}
                  title="Números de Emergencia y Asistencia"
                >
                  <Phone className={`w-3.5 h-3.5 ${theme.accentText}`} />
                </button>
              </div>
            </div>

            {/* Special Announcement Banner */}
            {guideData.specialAnnouncement && (
              <div className={`mt-3 p-3 rounded-xl border text-xs flex items-start gap-2 ${theme.accentBadge}`}>
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-medium">{guideData.specialAnnouncement}</p>
              </div>
            )}

            {/* WiFi Quick Interactive Box */}
            <div className={`mt-4 p-3.5 rounded-2xl border space-y-3 ${theme.cardBg}`}>
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider ${theme.accentText}`}>
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Conexión Wi-Fi de Alta Velocidad</span>
                </div>
                <button
                  onClick={() => setWifiModalOpen(true)}
                  className={`text-[10px] font-bold hover:underline flex items-center gap-1 cursor-pointer ${theme.accentText}`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Ver Código QR</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={copyWifiNetwork}
                  className={`p-2.5 text-left rounded-xl border transition-colors cursor-pointer group ${theme.cardInnerBg}`}
                >
                  <span className="text-[9px] uppercase tracking-wider font-mono block opacity-60">
                    Red Wi-Fi
                  </span>
                  <span className="text-xs font-bold block mt-0.5 truncate">
                    {guideData.wifiNetwork}
                  </span>
                  <span className={`text-[9px] mt-1 block font-medium ${theme.accentText}`}>
                    {copiedNetwork ? '✓ Nombre copiado' : 'Tocar para copiar'}
                  </span>
                </button>

                <button
                  onClick={copyWifiPassword}
                  className={`p-2.5 text-left rounded-xl border transition-colors cursor-pointer group ${theme.cardInnerBg}`}
                >
                  <span className="text-[9px] uppercase tracking-wider font-mono block opacity-60">
                    Contraseña
                  </span>
                  <span className="text-xs font-mono font-bold block mt-0.5 truncate">
                    {guideData.wifiPassword}
                  </span>
                  <span className={`text-[9px] mt-1 block font-medium ${theme.accentText}`}>
                    {copiedWifi ? '✓ Clave copiada' : 'Tocar para copiar'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className={`${theme.navBarBg} px-3 py-2 flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none font-medium`}>
          <button
            onClick={() => setActiveTab('llegar')}
            className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 text-xs ${
              activeTab === 'llegar' ? theme.tabActive : theme.tabInactive
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Cómo Llegar</span>
          </button>

          <button
            onClick={() => setActiveTab('estadia')}
            className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 text-xs ${
              activeTab === 'estadia' ? theme.tabActive : theme.tabInactive
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Tu Estadía & Normas</span>
          </button>

          <button
            onClick={() => setActiveTab('recomendaciones')}
            className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 text-xs ${
              activeTab === 'recomendaciones' ? theme.tabActive : theme.tabInactive
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Paseos & Restaurantes</span>
          </button>

          <button
            onClick={() => setActiveTab('tienda')}
            className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 text-xs ${
              activeTab === 'tienda' ? theme.tabActive : theme.tabInactive
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Tienda & Extras</span>
            {cartItemsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                {cartItemsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('manuales')}
            className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 text-xs ${
              activeTab === 'manuales' ? theme.tabActive : theme.tabInactive
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Manuales de Uso</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: CÓMO LLEGAR & UBICACIÓN */}
          {activeTab === 'llegar' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Address Card */}
              <div className={`p-4 rounded-2xl border space-y-3 ${theme.cardBg}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block mb-0.5 ${theme.accentText}`}>
                      Dirección de la Propiedad
                    </span>
                    <h3 className="text-sm font-bold">{guideData.locationAddress}</h3>
                  </div>
                  <a
                    href={guideData.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer shrink-0 ${theme.btnPrimary}`}
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>GPS Maps</span>
                  </a>
                </div>

                <div className="pt-2 border-t border-stone-200 dark:border-stone-800 text-xs flex flex-wrap items-center gap-4 opacity-80">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Ingreso Check-in: 14:00 hs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Salida Check-out: {guideData.checkoutHour}</span>
                  </div>
                </div>
              </div>

              {/* Transportation Options List */}
              <div className="space-y-2.5">
                <h4 className={`text-xs font-bold uppercase tracking-wider font-mono ${theme.accentText}`}>
                  🚗 Medios de Transporte & Accesos
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {guideData.transportation.map((trans) => (
                    <div
                      key={trans.id}
                      className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${theme.cardBg}`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Car className={`w-4 h-4 ${theme.accentText}`} />
                          <span className="font-bold text-xs">{trans.title}</span>
                          {trans.estimatedCost && (
                            <span className="text-[10px] font-mono opacity-70">
                              ({trans.estimatedCost})
                            </span>
                          )}
                        </div>
                        <p className="text-xs opacity-80 leading-relaxed max-w-xl">
                          {trans.description}
                        </p>
                      </div>

                      {trans.contactPhone && (
                        <a
                          href={`tel:${trans.contactPhone}`}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 ${theme.cardInnerBg}`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Llamar {trans.contactPhone}</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TU ESTADÍA & NORMAS */}
          {activeTab === 'estadia' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* House Rules Overview */}
              <div className={`p-4 rounded-2xl border space-y-4 ${theme.cardBg}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <ShieldAlert className={`w-4 h-4 ${theme.accentText}`} />
                    <span>Normas de Convivencia y Cuidado</span>
                  </h3>
                  <button
                    onClick={() => setRulesModalOpen(true)}
                    className={`text-xs font-bold hover:underline cursor-pointer ${theme.accentText}`}
                  >
                    Ver detalle
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {guideData.rules.map((rule, idx) => (
                    <div key={idx} className={`p-3 rounded-xl border flex items-start gap-2.5 ${theme.cardInnerBg}`}>
                      <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${theme.accentText}`} />
                      <div>
                        <span className="font-bold block">{rule.title}</span>
                        <p className="opacity-80 text-[11px] mt-0.5 leading-relaxed">{rule.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pool & Schedules */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className={`p-4 rounded-2xl border space-y-2 ${theme.cardBg}`}>
                  <div className="flex items-center gap-2 font-bold">
                    <Waves className={`w-4 h-4 ${theme.accentText}`} />
                    <span>Piscina & Áreas Comunes</span>
                  </div>
                  <p className="opacity-80 text-xs">
                    Horario habilitado: <strong>{guideData.poolHours}</strong>. Uso exclusivo para huéspedes alojados.
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border space-y-2 ${theme.cardBg}`}>
                  <div className="flex items-center gap-2 font-bold">
                    <Clock className={`w-4 h-4 ${theme.accentText}`} />
                    <span>Horario de Salida (Check-out)</span>
                  </div>
                  <p className="opacity-80 text-xs">
                    El horario límite de entrega de la unidad es a las <strong>{guideData.checkoutHour}</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RECOMENDACIONES & RESTAURANTES */}
          {activeTab === 'recomendaciones' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 w-full ${theme.cardBg}`}>
                  <Search className="w-4 h-4 opacity-50" />
                  <input
                    type="text"
                    placeholder="Buscar restaurantes, paseos o delivery..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent text-xs w-full outline-none"
                  />
                </div>

                <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  {(['todos', 'gastronomia', 'atracciones'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer shrink-0 ${
                        selectedCategory === cat ? theme.tabActive : theme.tabInactive
                      }`}
                    >
                      {cat === 'todos' ? 'Todos' : cat === 'gastronomia' ? 'Restaurantes' : 'Paseos'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recommendations Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {filteredDining.map((din) => (
                  <div
                    key={din.id}
                    onClick={() => setSelectedDining(din)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between ${theme.cardBg}`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="font-bold text-sm">{din.name}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${theme.accentBadge}`}>
                          {din.priceRange}
                        </span>
                      </div>
                      <p className={`text-xs font-semibold mb-2 ${theme.accentText}`}>
                        {din.specialty}
                      </p>
                      <p className="text-[11px] opacity-75 line-clamp-2">
                        📍 {din.address}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-200 dark:border-stone-800 text-[11px] font-bold">
                      <span className="flex items-center gap-1 opacity-70">
                        <Utensils className="w-3.5 h-3.5" />
                        {din.hasDelivery ? 'Con Delivery a la unidad' : 'Comer en el lugar'}
                      </span>
                      <span className={`hover:underline flex items-center gap-1 ${theme.accentText}`}>
                        Ver más <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}

                {filteredAttractions.map((att) => (
                  <div
                    key={att.id}
                    onClick={() => setSelectedAttraction(att)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between ${theme.cardBg}`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="font-bold text-sm">{att.title}</span>
                        <span className="text-[10px] font-mono opacity-70">
                          ⏱️ {att.distanceMinutes} min
                        </span>
                      </div>
                      <p className="text-xs opacity-80 line-clamp-2 mb-2">
                        {att.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-200 dark:border-stone-800 text-[11px] font-bold">
                      <span className={`flex items-center gap-1 ${theme.accentText}`}>
                        <Sparkles className="w-3.5 h-3.5" />
                        Consejo de anfitrión
                      </span>
                      <span className={`hover:underline flex items-center gap-1 ${theme.accentText}`}>
                        Detalles <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TIENDA & EXTRAS DURANTE LA ESTADÍA */}
          {activeTab === 'tienda' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <ShoppingCart className={`w-4 h-4 ${theme.accentText}`} />
                    <span>Servicios Opcionales & Despensa</span>
                  </h3>
                  <p className="text-xs opacity-75">
                    Pedí extras directo a tu unidad y abonás con tu anfitrión por transferencia o efectivo.
                  </p>
                </div>

                {cartItemsCount > 0 && (
                  <button
                    onClick={() => setStoreModalOpen(true)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${theme.btnPrimary}`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Ver Carrito (${cartTotalUSD} USD)</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {IN_STAY_SERVICES.map((serv) => {
                  const qty = cart[serv.id] || 0;
                  return (
                    <div
                      key={serv.id}
                      className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${theme.cardBg}`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="font-bold text-sm">{serv.name}</span>
                          <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${theme.accentBadge}`}>
                            USD {serv.priceUSD}
                          </span>
                        </div>
                        <p className="text-xs opacity-75 leading-relaxed">
                          {serv.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-stone-200 dark:border-stone-800">
                        <span className="text-[10px] font-mono opacity-60 uppercase">
                          Entrega en la unidad
                        </span>

                        {qty === 0 ? (
                          <button
                            onClick={() => addToCart(serv.id)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer ${theme.btnPrimary}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Agregar</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => removeFromCart(serv.id)}
                              className={`w-7 h-7 rounded-lg border flex items-center justify-center cursor-pointer ${theme.cardInnerBg}`}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-bold text-xs px-1">{qty}</span>
                            <button
                              onClick={() => addToCart(serv.id)}
                              className={`w-7 h-7 rounded-lg border flex items-center justify-center cursor-pointer ${theme.cardInnerBg}`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: MANUALES DE USO */}
          {activeTab === 'manuales' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <HelpCircle className={`w-4 h-4 ${theme.accentText}`} />
                  <span>Guías Paso a Paso de Equipamiento</span>
                </h3>
                <p className="text-xs opacity-75">
                  Instrucciones ilustradas para el correcto uso de electrodomésticos y servicios de la unidad.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {APPLIANCE_GUIDES.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => setSelectedAppliance(app)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between space-y-3 ${theme.cardBg}`}
                  >
                    <div>
                      <h4 className="font-bold text-sm mb-1">{app.name}</h4>
                      <p className="text-xs opacity-75 line-clamp-2 leading-relaxed">
                        {app.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-stone-200 dark:border-stone-800 text-[11px] font-bold">
                      <span className="opacity-60">{app.steps.length} pasos sencillos</span>
                      <span className={`hover:underline flex items-center gap-1 ${theme.accentText}`}>
                        Ver manual <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 text-center text-[11px] opacity-70 border-t ${
          isDosAguas || isCorteVette ? 'border-stone-800' : 'border-stone-200'
        }`}>
          <span>{guideData.propertyName} • Guía Interactiva del Huésped</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* POPUP MODAL 1: WIFI QR CODE */}
      {/* ========================================================================= */}
      {wifiModalOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
          <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border text-center space-y-4 ${theme.cardBg}`}>
            <div className="flex items-center justify-between border-b pb-3 border-stone-200 dark:border-stone-800">
              <span className="font-bold text-sm flex items-center gap-2">
                <Wifi className={`w-4 h-4 ${theme.accentText}`} />
                Conectar a Wi-Fi
              </span>
              <button
                onClick={() => setWifiModalOpen(false)}
                className="p-1 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs opacity-80">
              Escaneá este código QR con la cámara de tu celular para conectarte automáticamente sin escribir la clave:
            </p>

            <div className="p-3 bg-white rounded-2xl inline-block shadow-inner mx-auto">
              <img src={wifiQrUrl} alt="WiFi QR" className="w-48 h-48 mx-auto" />
            </div>

            <div className="space-y-2 text-left text-xs">
              <div className={`p-3 rounded-xl border flex items-center justify-between ${theme.cardInnerBg}`}>
                <div>
                  <span className="text-[10px] opacity-60 block uppercase font-mono">Red</span>
                  <span className="font-bold">{guideData.wifiNetwork}</span>
                </div>
                <button
                  onClick={copyWifiNetwork}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${theme.btnPrimary}`}
                >
                  {copiedNetwork ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>

              <div className={`p-3 rounded-xl border flex items-center justify-between ${theme.cardInnerBg}`}>
                <div>
                  <span className="text-[10px] opacity-60 block uppercase font-mono">Contraseña</span>
                  <span className="font-mono font-bold">{guideData.wifiPassword}</span>
                </div>
                <button
                  onClick={copyWifiPassword}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${theme.btnPrimary}`}
                >
                  {copiedWifi ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POPUP MODAL 2: DETALLE DE ATRACCIÓN / EXCURSIÓN */}
      {/* ========================================================================= */}
      {selectedAttraction && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border space-y-4 ${theme.cardBg}`}>
            <div className="flex items-center justify-between border-b pb-3 border-stone-200 dark:border-stone-800">
              <span className="font-bold text-sm flex items-center gap-2">
                <Compass className={`w-4 h-4 ${theme.accentText}`} />
                Paseo Recomendado
              </span>
              <button
                onClick={() => setSelectedAttraction(null)}
                className="p-1 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold">{selectedAttraction.title}</h3>
              <span className="text-xs opacity-70 block mt-0.5">
                ⏱️ A {selectedAttraction.distanceMinutes} minutos de la propiedad
              </span>
            </div>

            <p className="text-xs opacity-80 leading-relaxed">
              {selectedAttraction.description}
            </p>

            <div className={`p-3 rounded-xl border space-y-1 ${theme.accentBadge}`}>
              <div className="flex items-center gap-1 text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Consejo del Anfitrión</span>
              </div>
              <p className="text-xs leading-relaxed">{selectedAttraction.tips}</p>
            </div>

            <div className="pt-2 flex gap-2">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  selectedAttraction.title + ' ' + guideData.propertyName
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${theme.btnPrimary}`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Abrir en GPS</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POPUP MODAL 3: DETALLE DE RESTAURANTE / GASTRONOMÍA */}
      {/* ========================================================================= */}
      {selectedDining && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border space-y-4 ${theme.cardBg}`}>
            <div className="flex items-center justify-between border-b pb-3 border-stone-200 dark:border-stone-800">
              <span className="font-bold text-sm flex items-center gap-2">
                <Utensils className={`w-4 h-4 ${theme.accentText}`} />
                Restaurante Recomendado
              </span>
              <button
                onClick={() => setSelectedDining(null)}
                className="p-1 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold">{selectedDining.name}</h3>
                <p className={`text-xs font-bold mt-0.5 ${theme.accentText}`}>
                  {selectedDining.specialty}
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-xs font-mono ${theme.accentBadge}`}>
                {selectedDining.priceRange}
              </span>
            </div>

            <div className="text-xs space-y-1 opacity-80">
              <p>📍 Dirección: <strong>{selectedDining.address}</strong></p>
              <p>🛵 Delivery: <strong>{selectedDining.hasDelivery ? 'Disponible a la unidad' : 'Comer en el lugar'}</strong></p>
            </div>

            <div className="pt-2 flex gap-2">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  selectedDining.name + ' ' + selectedDining.address
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${theme.btnPrimary}`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Cómo Llegar</span>
              </a>

              {selectedDining.phone && (
                <a
                  href={`tel:${selectedDining.phone}`}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border ${theme.cardInnerBg}`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Llamar</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POPUP MODAL 4: DETALLE DE MANUAL DE ELECTRODOMÉSTICO */}
      {/* ========================================================================= */}
      {selectedAppliance && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border space-y-4 max-h-[90vh] overflow-y-auto ${theme.cardBg}`}>
            <div className="flex items-center justify-between border-b pb-3 border-stone-200 dark:border-stone-800">
              <span className="font-bold text-sm flex items-center gap-2">
                <HelpCircle className={`w-4 h-4 ${theme.accentText}`} />
                Manual de Uso
              </span>
              <button
                onClick={() => setSelectedAppliance(null)}
                className="p-1 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold">{selectedAppliance.name}</h3>
              <p className="text-xs opacity-75 mt-0.5">{selectedAppliance.subtitle}</p>
            </div>

            <div className="space-y-2.5 text-xs">
              <span className={`text-[10px] uppercase font-bold tracking-wider block ${theme.accentText}`}>
                Pasos para operar:
              </span>
              {selectedAppliance.steps.map((step, idx) => (
                <div key={idx} className={`p-3 rounded-xl border flex items-start gap-2.5 ${theme.cardInnerBg}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${theme.accentBg}`}>
                    {idx + 1}
                  </span>
                  <p className="leading-relaxed opacity-90">{step}</p>
                </div>
              ))}
            </div>

            <div className={`p-3 rounded-xl border text-xs leading-relaxed ${theme.accentBadge}`}>
              {selectedAppliance.tips}
            </div>

            <button
              onClick={() => setSelectedAppliance(null)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold cursor-pointer ${theme.btnPrimary}`}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POPUP MODAL 5: REGLAS DE LA CASA */}
      {/* ========================================================================= */}
      {rulesModalOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border space-y-4 max-h-[90vh] overflow-y-auto ${theme.cardBg}`}>
            <div className="flex items-center justify-between border-b pb-3 border-stone-200 dark:border-stone-800">
              <span className="font-bold text-sm flex items-center gap-2">
                <ShieldAlert className={`w-4 h-4 ${theme.accentText}`} />
                Normas de Convivencia
              </span>
              <button
                onClick={() => setRulesModalOpen(false)}
                className="p-1 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {guideData.rules.map((rule, idx) => (
                <div key={idx} className={`p-3.5 rounded-xl border space-y-1 ${theme.cardInnerBg}`}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className={`w-4 h-4 ${theme.accentText}`} />
                    <span>{rule.title}</span>
                  </div>
                  <p className="opacity-80 text-xs leading-relaxed">{rule.description}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setRulesModalOpen(false)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold cursor-pointer ${theme.btnPrimary}`}
            >
              Aceptar & Cerrar
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POPUP MODAL 6: CARRITO DE TIENDA */}
      {/* ========================================================================= */}
      {storeModalOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border space-y-4 ${theme.cardBg}`}>
            <div className="flex items-center justify-between border-b pb-3 border-stone-200 dark:border-stone-800">
              <span className="font-bold text-sm flex items-center gap-2">
                <ShoppingCart className={`w-4 h-4 ${theme.accentText}`} />
                Tu Carrito de Extras
              </span>
              <button
                onClick={() => setStoreModalOpen(false)}
                className="p-1 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {Object.keys(cart).length === 0 ? (
              <p className="text-xs opacity-70 py-6 text-center">Tu carrito está vacío.</p>
            ) : (
              <div className="space-y-3 text-xs">
                {Object.entries(cart).map(([id, qty]) => {
                  const item = IN_STAY_SERVICES.find((s) => s.id === id);
                  if (!item) return null;
                  return (
                    <div key={id} className={`p-3 rounded-xl border flex items-center justify-between ${theme.cardInnerBg}`}>
                      <div>
                        <span className="font-bold block">{item.name}</span>
                        <span className="opacity-70 text-[11px]">${item.priceUSD} USD c/u</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeFromCart(id)}
                          className="w-6 h-6 rounded-md bg-stone-200 dark:bg-stone-800 flex items-center justify-center cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold px-1">{qty}</span>
                        <button
                          onClick={() => addToCart(id)}
                          className="w-6 h-6 rounded-md bg-stone-200 dark:bg-stone-800 flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between font-bold text-sm">
                  <span>Total a Coordinar:</span>
                  <span className={theme.accentText}>${cartTotalUSD} USD</span>
                </div>

                <button
                  onClick={sendOrderViaWhatsApp}
                  className="w-full py-3 bg-[#25D366] hover:bg-[#20ba59] text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Enviar Pedido por WhatsApp</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POPUP MODAL 7: EMERGENCIAS Y ASISTENCIA */}
      {/* ========================================================================= */}
      {emergencyModalOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
          <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border space-y-4 ${theme.cardBg}`}>
            <div className="flex items-center justify-between border-b pb-3 border-stone-200 dark:border-stone-800">
              <span className="font-bold text-sm flex items-center gap-2 text-rose-500">
                <Phone className="w-4 h-4" />
                Asistencia & Emergencias
              </span>
              <button
                onClick={() => setEmergencyModalOpen(false)}
                className="p-1 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <a
                href={`tel:${guideData.hostPhone}`}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${theme.cardInnerBg}`}
              >
                <div>
                  <span className="font-bold block">Anfitrión / Recepción</span>
                  <span className="opacity-70 text-[11px]">{guideData.hostPhone}</span>
                </div>
                <Phone className="w-4 h-4 text-emerald-500" />
              </a>

              <a
                href="tel:911"
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${theme.cardInnerBg}`}
              >
                <div>
                  <span className="font-bold block text-rose-500">Policía / Emergencias</span>
                  <span className="opacity-70 text-[11px]">Línea 911</span>
                </div>
                <Phone className="w-4 h-4 text-rose-500" />
              </a>

              <a
                href="tel:107"
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${theme.cardInnerBg}`}
              >
                <div>
                  <span className="font-bold block text-rose-500">Ambulancia / SAME</span>
                  <span className="opacity-70 text-[11px]">Línea 107</span>
                </div>
                <Phone className="w-4 h-4 text-rose-500" />
              </a>
            </div>

            <button
              onClick={() => setEmergencyModalOpen(false)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold cursor-pointer ${theme.btnPrimary}`}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
