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
  FileText
} from 'lucide-react';
import { WelcomeGuideData, AttractionItem, DiningItem } from '../../types';

interface GuestWelcomePortalProps {
  guideData: WelcomeGuideData;
  isMobilePreview?: boolean;
  guestName?: string;
  unitName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  pinCode?: string;
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
    id: 'jacuzzi',
    name: 'Jacuzzi / Hidromasaje',
    icon: 'Waves',
    subtitle: 'Instrucciones para activar los jets y mantener el agua caliente',
    steps: [
      'Llenar la tina hasta cubrir todos los jets de agua (mínimo 5 cm por encima de las boquillas) antes de presionar cualquier botón.',
      'Presionar el pulsador neumático plateado para encender las bombas de hidromasaje.',
      'Girar la perilla de aire superior para regular la intensidad de las burbujas.',
      'Al terminar, presionar nuevamente el pulsador para apagar y dejar desagotar abriendo el tapón giratorio.'
    ],
    tips: '⚠️ Nunca encender el hidromasaje en seco, ya que puede dañar el motor.'
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
      'Podés transmitir desde tu celular seleccionando el dispositivo "' + 'Cabaña TV' + '" en tu app de streaming favorita.'
    ],
    tips: '🔒 Podés iniciar sesión con tus propias cuentas y recordá cerrarlas el día de tu check-out.'
  },
  {
    id: 'cocina',
    name: 'Cocina & Anafe Eléctrico',
    icon: 'Flame',
    subtitle: 'Encendido seguro y uso de electrodomésticos',
    steps: [
      'Anafe Vitrocerámico: Mantener presionado el botón táctil de encendido durante 2 segundos para desbloquear.',
      'Seleccionar la hornalla deseada y regular la potencia con los botones + / - del 1 al 9.',
      'Pava eléctrica & Tostadora: Conectadas sobre la mesada principal, con corte automático al hervir.',
      'La heladera cuenta con selector de temperatura interior en nivel 3 para frío estándar.'
    ],
    tips: '✨ Utilizar solo recipientes aptos de fondo plano para no rayar la superficie de vidrio.'
  },
  {
    id: 'parrilla',
    name: 'Parrilla & Asador',
    icon: 'Flame',
    subtitle: 'Kit de asado, leña y sector de fuego',
    steps: [
      'Los utensilios de asador (pinza, pala, atizador y tabla) se encuentran en el cajón inferior bajo la mesada exterior.',
      'Iniciar el fuego en el quemador lateral con astillas finas antes de pasar las brasas debajo de la parrilla.',
      'La altura del emparrillado se regula mediante la manivela frontal con traba de seguridad.',
      'Al terminar el asado, esparcir las cenizas y verificar que las brasas queden apagadas.'
    ],
    tips: '🪵 Disponemos de bolsas de leña dura de quebracho en recepción si necesitás recarga.'
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
    name: 'Late Check-out (Hasta las 17:00 hs)',
    priceUSD: 20,
    description: 'Extendé tu estadía para aprovechar la tarde, la piscina o ducharte antes de tu vuelo.',
    category: 'confort',
    icon: 'Clock'
  },
  {
    id: 'desayuno_artesanal',
    name: 'Desayuno Campestre en la Unidad',
    priceUSD: 10,
    description: 'Canasta con panes de masa madre, mermeladas regionales, frutas frescas, café y jugo natural.',
    category: 'gastronomia',
    icon: 'Coffee'
  },
  {
    id: 'leña_asador',
    name: 'Bolsa de Leña Dura + Carbón & Kit Fuego',
    priceUSD: 8,
    description: 'Bolsa de 10 kg de leña seleccionada de quebracho, iniciador ecológico y fósforos largos.',
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
    description: 'Botella de vino Malbec Reserva maridada con selección de quesos de campo, frutos secos y fiambres.',
    category: 'gastronomia',
    icon: 'Utensils'
  }
];

export const GuestWelcomePortal: React.FC<GuestWelcomePortalProps> = ({
  guideData,
  isMobilePreview = false,
  guestName: propGuestName,
  unitName: propUnitName,
  checkInDate: propCheckInDate,
  checkOutDate: propCheckOutDate,
  pinCode: propPinCode,
}) => {
  // Extract URL parameters if present (e.g., ?huesped=Lucas&unidad=Depto%20D&pin=4821)
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
    setTimeout(() => setCopiedWifi(false), 2500);
  };

  const copyWifiNetwork = () => {
    navigator.clipboard.writeText(guideData.wifiNetwork);
    setCopiedNetwork(true);
    setTimeout(() => setCopiedNetwork(false), 2500);
  };

  const updateCartQuantity = (serviceId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[serviceId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[serviceId];
        return copy;
      }
      return { ...prev, [serviceId]: next };
    });
  };

  const totalCartAmount = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = IN_STAY_SERVICES.find((s) => s.id === id);
    return sum + (item ? item.priceUSD * qty : 0);
  }, 0);

  const totalCartCount = Object.values(cart).reduce((sum, q) => sum + q, 0);

  const handleSendOrderWhatsApp = () => {
    const itemsList = Object.entries(cart)
      .map(([id, qty]) => {
        const item = IN_STAY_SERVICES.find((s) => s.id === id);
        return item ? `• ${qty}x ${item.name} ($${item.priceUSD * qty} USD)` : '';
      })
      .filter(Boolean)
      .join('%0A');

    const message = `Hola ${encodeURIComponent(guideData.hostName)}, estoy alojado/a en *${encodeURIComponent(
      guideData.propertyName
    )}* y me gustaría solicitar los siguientes servicios:%0A%0A${itemsList}%0A%0A*Total estimado:* $${totalCartAmount} USD.%0A¿Podrían confirmarme la entrega? ¡Muchas gracias!`;

    const cleanPhone = guideData.hostPhone.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(url, '_blank');
    setOrderSent(true);
    setTimeout(() => setOrderSent(false), 4000);
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

  return (
    <div
      className={`mx-auto bg-[#0C0D0F] text-[#EFECE5] font-sans antialiased ${
        isMobilePreview
          ? 'max-w-[420px] rounded-none sm:rounded-3xl shadow-2xl overflow-hidden border border-[#222328]'
          : 'max-w-4xl rounded-none shadow-xl border border-[#222328]'
      }`}
    >
      {/* Hero Header */}
      <div className="relative bg-[#141518] p-5 sm:p-6 border-b border-[#222328] overflow-hidden">
        {/* Background Ambient Image */}
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
          <img
            src={
              guideData.propertyName.toLowerCase().includes('cabaña') ||
              guideData.propertyName.toLowerCase().includes('wood')
                ? '/cabanas/cabana-terraza.jpg'
                : 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
            }
            alt={guideData.propertyName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141518] via-[#141518]/90 to-[#0C0D0F]" />
        </div>

        <div className="relative z-10">
          {/* Top Live Bar */}
          <div className="flex items-center justify-between text-xs font-mono mb-2.5">
            <span className="flex items-center gap-1.5 text-[#E1500A] font-bold uppercase tracking-wider text-[11px]">
              <Compass className="w-3.5 h-3.5" />
              Guía del Huésped • App Digital
            </span>
            <span className="bg-[#E1500A]/15 text-[#E1500A] px-2 py-0.5 rounded-none border border-[#E1500A]/30 text-[10px] font-bold uppercase tracking-wider">
              En Línea
            </span>
          </div>

          {/* Personalized VIP Greeting Banner (when sent from a reservation) */}
          {(effectiveGuestName || effectiveUnitName) && (
            <div className="mb-4 p-3.5 bg-gradient-to-r from-[#E1500A]/20 via-[#18181B] to-[#18181B] border-l-4 border-l-[#E1500A] border-y border-r border-[#222328] rounded-none animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-[#FFA27B] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#E1500A]" />
                <span>Estadía Personalizada</span>
                {effectiveUnitName && (
                  <span className="bg-[#E1500A] text-white px-2 py-0.5 text-[9px] font-black uppercase">
                    {effectiveUnitName}
                  </span>
                )}
              </div>
              <div className="text-base sm:text-lg font-black text-white mt-1">
                ¡Hola {effectiveGuestName || 'Huésped'}! Te damos la bienvenida a tu estadía
              </div>
              {(effectiveCheckIn || effectivePinCode) && (
                <div className="flex flex-wrap items-center gap-3 mt-2 pt-2 border-t border-[#222328] text-xs">
                  {effectiveCheckIn && (
                    <span className="text-[#A1A1AA] font-mono text-[11px]">
                      📅 Check-in: <strong className="text-white">{effectiveCheckIn}</strong>
                    </span>
                  )}
                  {effectiveCheckOut && (
                    <span className="text-[#A1A1AA] font-mono text-[11px]">
                      🏁 Check-out: <strong className="text-white">{effectiveCheckOut}</strong>
                    </span>
                  )}
                  {effectivePinCode && (
                    <span className="text-emerald-400 font-mono text-[11px] bg-emerald-950/50 px-2 py-0.5 border border-emerald-800/40">
                      🔑 PIN Cerradura: <strong className="text-white">{effectivePinCode}</strong>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
            {guideData.propertyName}
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1 font-normal leading-relaxed">
            {guideData.tagline}
          </p>

          {/* Quick Host Action Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-3 bg-[#18181B] rounded-none border border-[#222328]">
            <div className="flex items-center gap-2.5 text-xs">
              <div className="w-8 h-8 rounded-none bg-[#E1500A] text-white flex items-center justify-center font-bold text-sm">
                {guideData.hostName[0]}
              </div>
              <div>
                <div className="font-bold text-white text-xs">Anfitrión: {guideData.hostName}</div>
                <div className="text-[10px] text-[#A1A1AA]">Atención directa y soporte</div>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              <a
                href={`https://wa.me/${guideData.hostPhone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(
                  guideData.hostName
                )},%20estoy%20alojado%20en%20${encodeURIComponent(guideData.propertyName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold text-xs transition-colors cursor-pointer rounded-none"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>WhatsApp</span>
              </a>
              <button
                onClick={() => setEmergencyModalOpen(true)}
                className="p-1.5 bg-[#222328] hover:bg-[#2a2b32] text-[#EFECE5] transition-colors cursor-pointer rounded-none"
                title="Números de Emergencia y Asistencia"
              >
                <Phone className="w-3.5 h-3.5 text-[#E1500A]" />
              </button>
            </div>
          </div>

          {/* Special Announcement Banner */}
          {guideData.specialAnnouncement && (
            <div className="mt-3 p-3 bg-[#E1500A]/10 border border-[#E1500A]/30 rounded-none text-xs text-[#FFA27B] flex items-start gap-2">
              <Info className="w-4 h-4 text-[#E1500A] shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">{guideData.specialAnnouncement}</p>
            </div>
          )}

          {/* WiFi Quick Interactive Box */}
          <div className="mt-4 p-3.5 bg-[#18181B] rounded-none border border-[#222328] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#E1500A] uppercase tracking-wider">
                <Wifi className="w-3.5 h-3.5 text-[#E1500A]" />
                <span>Conexión Wi-Fi de Alta Velocidad</span>
              </div>
              <button
                onClick={() => setWifiModalOpen(true)}
                className="text-[10px] font-bold text-[#E1500A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Abrir Código QR</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={copyWifiNetwork}
                className="p-2.5 bg-[#0C0D0F] hover:bg-[#141518] text-left rounded-none border border-[#222328] transition-colors cursor-pointer group"
              >
                <span className="text-[9px] text-[#A1A1AA] uppercase tracking-wider font-mono block">
                  Red Wi-Fi
                </span>
                <span className="text-xs font-bold text-white block mt-0.5 truncate group-hover:text-[#E1500A]">
                  {guideData.wifiNetwork}
                </span>
                <span className="text-[9px] text-[#A1A1AA] mt-1 block">
                  {copiedNetwork ? '✓ Nombre copiado' : 'Tocar para copiar'}
                </span>
              </button>

              <button
                onClick={copyWifiPassword}
                className="p-2.5 bg-[#0C0D0F] hover:bg-[#141518] text-left rounded-none border border-[#222328] transition-colors cursor-pointer group"
              >
                <span className="text-[9px] text-[#A1A1AA] uppercase tracking-wider font-mono block">
                  Contraseña
                </span>
                <span className="text-xs font-mono font-bold text-[#EFECE5] block mt-0.5 truncate group-hover:text-[#E1500A]">
                  {guideData.wifiPassword}
                </span>
                <span className="text-[9px] text-[#A1A1AA] mt-1 block">
                  {copiedWifi ? '✓ Clave copiada' : 'Tocar para copiar'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="sticky top-0 z-30 bg-[#0C0D0F]/95 backdrop-blur-md px-3 sm:px-4 py-2 border-b border-[#222328] flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
        <button
          onClick={() => setActiveTab('llegar')}
          className={`px-3.5 py-2 font-bold uppercase tracking-wider text-[11px] transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 rounded-none ${
            activeTab === 'llegar'
              ? 'bg-[#E1500A] text-white shadow-xs'
              : 'bg-[#18181B] text-[#A1A1AA] hover:text-white border border-[#222328]'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Cómo Llegar</span>
        </button>

        <button
          onClick={() => setActiveTab('estadia')}
          className={`px-3.5 py-2 font-bold uppercase tracking-wider text-[11px] transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 rounded-none ${
            activeTab === 'estadia'
              ? 'bg-[#E1500A] text-white shadow-xs'
              : 'bg-[#18181B] text-[#A1A1AA] hover:text-white border border-[#222328]'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Tu Estadía</span>
        </button>

        <button
          onClick={() => setActiveTab('recomendaciones')}
          className={`px-3.5 py-2 font-bold uppercase tracking-wider text-[11px] transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 rounded-none ${
            activeTab === 'recomendaciones'
              ? 'bg-[#E1500A] text-white shadow-xs'
              : 'bg-[#18181B] text-[#A1A1AA] hover:text-white border border-[#222328]'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Guía Local</span>
        </button>

        <button
          onClick={() => setActiveTab('tienda')}
          className={`px-3.5 py-2 font-bold uppercase tracking-wider text-[11px] transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 rounded-none relative ${
            activeTab === 'tienda'
              ? 'bg-[#E1500A] text-white shadow-xs'
              : 'bg-[#18181B] text-[#A1A1AA] hover:text-white border border-[#222328]'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Tienda & Extras</span>
          {totalCartCount > 0 && (
            <span className="w-4 h-4 bg-emerald-500 text-black text-[9px] font-black rounded-full flex items-center justify-center ml-1">
              {totalCartCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('manuales')}
          className={`px-3.5 py-2 font-bold uppercase tracking-wider text-[11px] transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 rounded-none ${
            activeTab === 'manuales'
              ? 'bg-[#E1500A] text-white shadow-xs'
              : 'bg-[#18181B] text-[#A1A1AA] hover:text-white border border-[#222328]'
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          <span>Manuales</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* ========================================================================= */}
        {/* TAB 1: CÓMO LLEGAR */}
        {/* ========================================================================= */}
        {activeTab === 'llegar' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Exact Location Card */}
            <div className="p-4 bg-[#141518] rounded-none border border-[#222328] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#E1500A] uppercase tracking-wider">
                  Ubicación & Coordenadas
                </span>
                <a
                  href={guideData.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#E1500A] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Abrir en Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-[#EFECE5] font-medium leading-relaxed">
                {guideData.locationAddress}
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(guideData.locationAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#18181B] hover:bg-[#222328] text-white text-xs font-bold border border-[#222328] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#E1500A]" />
                  <span>Iniciar GPS en Celular</span>
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(guideData.locationAddress);
                    alert('Dirección copiada al portapapeles');
                  }}
                  className="px-3 py-1.5 bg-[#18181B] hover:bg-[#222328] text-[#A1A1AA] hover:text-white text-xs font-bold border border-[#222328] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Dirección</span>
                </button>
              </div>
            </div>

            {/* Transport Options */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Car className="w-4 h-4 text-[#E1500A]" />
                <span>Opciones de Llegada & Traslados</span>
              </h3>

              <div className="grid grid-cols-1 gap-2.5">
                {guideData.transportation.map((trans) => (
                  <div
                    key={trans.id}
                    className="p-4 bg-[#141518] hover:bg-[#18181B] rounded-none border border-[#222328] transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-white flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#E1500A]" />
                        <span>{trans.title}</span>
                      </h4>
                      {trans.estimatedCost && (
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 border border-emerald-800/40">
                          {trans.estimatedCost}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#A1A1AA] leading-relaxed">
                      {trans.description}
                    </p>
                    {trans.actionUrl && (
                      <div className="pt-1">
                        <a
                          href={trans.actionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#18181B] hover:bg-[#E1500A] hover:text-white text-[#EFECE5] border border-[#222328] text-xs font-bold transition-all cursor-pointer"
                        >
                          <span>{trans.actionLabel || 'Ver Detalle / Contacto'}</span>
                          <ChevronRight className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TU ESTADÍA & REGLAS */}
        {/* ========================================================================= */}
        {activeTab === 'estadia' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Quick Stat Tiles */}
            <div className="grid grid-cols-2 gap-2.5 text-xs font-sans">
              <div className="p-3.5 bg-[#141518] rounded-none border border-[#222328]">
                <div className="flex items-center gap-1.5 text-[#E1500A] font-bold text-[11px] uppercase tracking-wider mb-1 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Horario Salida</span>
                </div>
                <div className="font-mono font-black text-white text-lg">{guideData.checkoutHour}</div>
                <div className="text-[10px] text-[#A1A1AA] mt-0.5">Check-out de la unidad</div>
              </div>

              <div className="p-3.5 bg-[#141518] rounded-none border border-[#222328]">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px] uppercase tracking-wider mb-1 font-mono">
                  <Waves className="w-3.5 h-3.5" />
                  <span>Áreas Comunes</span>
                </div>
                <div className="font-mono font-black text-white text-lg">{guideData.poolHours}</div>
                <div className="text-[10px] text-[#A1A1AA] mt-0.5">Piscina & Solárium</div>
              </div>
            </div>

            {/* Direct Host Actions Bento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => setRulesModalOpen(true)}
                className="p-4 bg-[#141518] hover:bg-[#18181B] text-left border border-[#222328] transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                  <span className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#E1500A]" />
                    <span>Normas de Convivencia</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#A1A1AA] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                  Ruido nocturno, mascotas, cuidado del predio y recolección de residuos.
                </p>
              </button>

              <button
                onClick={() => setEmergencyModalOpen(true)}
                className="p-4 bg-[#141518] hover:bg-[#18181B] text-left border border-[#222328] transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#E1500A]" />
                    <span>Contactos & Urgencias</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#A1A1AA] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                  Hospital cercano, farmacias de turno, policía y cerrajero local.
                </p>
              </button>
            </div>

            {/* Rules Preview Box */}
            <div className="p-4 bg-[#141518] rounded-none border border-[#222328] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#E1500A]" />
                  <span>Resumen de Normas de la Casa</span>
                </h4>
                <button
                  onClick={() => setRulesModalOpen(true)}
                  className="text-[11px] font-bold text-[#E1500A] hover:underline cursor-pointer"
                >
                  Ver todas
                </button>
              </div>

              <div className="space-y-2">
                {guideData.rules.slice(0, 3).map((rule, idx) => (
                  <div key={idx} className="p-3 bg-[#0C0D0F] border border-[#222328] text-xs">
                    <h5 className="font-bold text-white mb-0.5">{rule.title}</h5>
                    <p className="text-[#A1A1AA] leading-relaxed text-[11px]">{rule.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: GUÍA LOCAL & RECOMENDACIONES (INTERACTIVE POPUPS) */}
        {/* ========================================================================= */}
        {activeTab === 'recomendaciones' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Search & Filter Bar */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar restaurantes, bodegas, paseos, supermercados..."
                  className="w-full pl-9 pr-4 py-2.5 bg-[#141518] border border-[#222328] text-white text-xs focus:outline-hidden focus:border-[#E1500A] rounded-none"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#A1A1AA] hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] font-mono">
                <button
                  onClick={() => setSelectedCategory('todos')}
                  className={`px-3 py-1 font-bold rounded-none cursor-pointer uppercase transition-colors ${
                    selectedCategory === 'todos'
                      ? 'bg-[#E1500A] text-white'
                      : 'bg-[#18181B] text-[#A1A1AA] hover:text-white border border-[#222328]'
                  }`}
                >
                  Todos ({guideData.attractions.length + guideData.dining.length})
                </button>
                <button
                  onClick={() => setSelectedCategory('atracciones')}
                  className={`px-3 py-1 font-bold rounded-none cursor-pointer uppercase transition-colors ${
                    selectedCategory === 'atracciones'
                      ? 'bg-[#E1500A] text-white'
                      : 'bg-[#18181B] text-[#A1A1AA] hover:text-white border border-[#222328]'
                  }`}
                >
                  Atracciones & Paseos ({guideData.attractions.length})
                </button>
                <button
                  onClick={() => setSelectedCategory('gastronomia')}
                  className={`px-3 py-1 font-bold rounded-none cursor-pointer uppercase transition-colors ${
                    selectedCategory === 'gastronomia'
                      ? 'bg-[#E1500A] text-white'
                      : 'bg-[#18181B] text-[#A1A1AA] hover:text-white border border-[#222328]'
                  }`}
                >
                  Gastronomía ({guideData.dining.length})
                </button>
              </div>
            </div>

            {/* Attractions List */}
            {filteredAttractions.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#E1500A]" />
                  <span>Puntos de Interés & Excursiones</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredAttractions.map((att) => (
                    <div
                      key={att.id}
                      onClick={() => setSelectedAttraction(att)}
                      className="p-4 bg-[#141518] hover:bg-[#18181B] border border-[#222328] hover:border-[#E1500A]/50 transition-all cursor-pointer rounded-none space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-white group-hover:text-[#FFA27B] transition-colors">
                            {att.title}
                          </h4>
                          <span className="text-[10px] font-mono text-[#A1A1AA] flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-[#E1500A]" />
                            A {att.distanceMinutes} min de tu cabaña
                          </span>
                        </div>
                        <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase bg-[#222328] text-[#EFECE5]">
                          Ver Ficha
                        </span>
                      </div>
                      <p className="text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed">
                        {att.description}
                      </p>
                      <div className="p-2 bg-[#0C0D0F] border border-[#222328] text-[10px] text-[#FFA27B] truncate flex items-center gap-1">
                        <Sparkles className="w-3 h-3 shrink-0 text-[#E1500A]" />
                        <span className="truncate">{att.tips}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dining / Supplies List */}
            {filteredDining.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-[#E1500A]" />
                  <span>Gastronomía & Proveeduría</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredDining.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedDining(item)}
                      className="p-4 bg-[#141518] hover:bg-[#18181B] border border-[#222328] hover:border-[#E1500A]/50 transition-all cursor-pointer rounded-none space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-white group-hover:text-[#FFA27B] transition-colors">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-[#A1A1AA] mt-0.5">{item.specialty}</p>
                        </div>
                        <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 border border-emerald-800/40">
                          {item.priceRange}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#A1A1AA] pt-2 border-t border-[#222328]">
                        <span className="flex items-center gap-1 truncate text-[10px]">
                          <MapPin className="w-3 h-3 text-[#E1500A] shrink-0" />
                          {item.address}
                        </span>
                        <span className="text-[10px] font-bold text-[#E1500A] shrink-0 uppercase tracking-wider">
                          Detalles & GPS →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: TIENDA & SERVICIOS EXTRAS (IN-STAY STORE) */}
        {/* ========================================================================= */}
        {activeTab === 'tienda' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header Description */}
            <div className="p-4 bg-[#141518] border border-[#222328] rounded-none">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E1500A] uppercase tracking-wider mb-1">
                <Store className="w-4 h-4" />
                <span>Tienda de Servicios & Comodidades en la Unidad</span>
              </div>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Seleccioná los servicios extras que deseás durante tu estadía. Los pedidos se envían directamente por WhatsApp a la administración para coordinar la entrega en tu cabaña.
              </p>
            </div>

            {/* Service Items List */}
            <div className="space-y-2.5">
              {IN_STAY_SERVICES.map((srv) => {
                const qty = cart[srv.id] || 0;
                return (
                  <div
                    key={srv.id}
                    className={`p-4 bg-[#141518] rounded-none border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      qty > 0 ? 'border-[#E1500A] bg-[#18181B]' : 'border-[#222328]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{srv.name}</span>
                        <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 border border-emerald-800/40">
                          ${srv.priceUSD} USD
                        </span>
                      </div>
                      <p className="text-xs text-[#A1A1AA] leading-relaxed max-w-xl">
                        {srv.description}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {qty > 0 ? (
                        <div className="flex items-center gap-2 bg-[#0C0D0F] border border-[#222328] p-1">
                          <button
                            onClick={() => updateCartQuantity(srv.id, -1)}
                            className="w-7 h-7 bg-[#18181B] hover:bg-[#222328] text-white flex items-center justify-center font-bold text-xs cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono font-bold text-xs w-6 text-center text-white">
                            {qty}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(srv.id, 1)}
                            className="w-7 h-7 bg-[#18181B] hover:bg-[#222328] text-white flex items-center justify-center font-bold text-xs cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => updateCartQuantity(srv.id, 1)}
                          className="px-3.5 py-2 bg-[#18181B] hover:bg-[#E1500A] hover:text-white text-[#EFECE5] text-xs font-bold uppercase tracking-wider font-mono border border-[#222328] flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Agregar</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary Floating Bar */}
            {totalCartCount > 0 && (
              <div className="sticky bottom-4 z-20 p-4 bg-[#18181B] border-2 border-[#E1500A] shadow-2xl rounded-none flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
                <div>
                  <div className="text-[10px] font-mono font-bold text-[#E1500A] uppercase tracking-wider">
                    Resumen del Pedido ({totalCartCount} {totalCartCount === 1 ? 'ítem' : 'ítems'})
                  </div>
                  <div className="text-base font-black text-white font-mono">
                    Total a abonar: ${totalCartAmount} USD
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setCart({})}
                    className="px-3 py-2 bg-[#0C0D0F] hover:bg-[#222328] text-[#A1A1AA] text-xs font-bold border border-[#222328] cursor-pointer"
                  >
                    Vaciar
                  </button>
                  <button
                    onClick={handleSendOrderWhatsApp}
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer rounded-none"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>{orderSent ? '¡Enviando pedido...!' : 'Pedir por WhatsApp'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: MANUALES DE LA CASA (APPLIANCE GUIDES) */}
        {/* ========================================================================= */}
        {activeTab === 'manuales' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 bg-[#141518] border border-[#222328] rounded-none">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E1500A] uppercase tracking-wider mb-1">
                <Tv className="w-4 h-4" />
                <span>Manual Digital de Equipamiento & Electrodomésticos</span>
              </div>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Guías rápidas ilustradas paso a paso para el uso correcto del hidromasaje, aire acondicionado, smart TV, anafe y parrilla.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {APPLIANCE_GUIDES.map((app) => (
                <div
                  key={app.id}
                  onClick={() => setSelectedAppliance(app)}
                  className="p-4 bg-[#141518] hover:bg-[#18181B] border border-[#222328] hover:border-[#E1500A]/50 transition-all cursor-pointer rounded-none space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-white group-hover:text-[#FFA27B] transition-colors flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#E1500A]" />
                      <span>{app.name}</span>
                    </h4>
                    <span className="text-[10px] font-mono text-[#E1500A] font-bold uppercase">
                      Ver Guía →
                    </span>
                  </div>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed">
                    {app.subtitle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="p-4 text-center border-t border-[#222328] bg-[#0C0D0F] text-[10px] font-mono text-[#A1A1AA]">
        <p>{guideData.propertyName} • Guía Digital de Huéspedes</p>
        <p className="text-[#71717A] mt-0.5">Desarrollado con Loomi Suite Architecture</p>
      </div>

      {/* ========================================================================= */}
      {/* POPUP MODAL 1: QR & DETALLE WIFI */}
      {/* ========================================================================= */}
      {wifiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#141518] w-full max-w-sm rounded-none shadow-2xl border border-[#222328] overflow-hidden font-sans">
            <div className="p-4 bg-[#18181B] border-b border-[#222328] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-[#E1500A]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                  Escanear Código QR Wi-Fi
                </h3>
              </div>
              <button
                onClick={() => setWifiModalOpen(false)}
                className="p-1 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 text-center space-y-4">
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Apuntá con la cámara de tu celular a este código para conectarte automáticamente a la red Wi-Fi sin escribir la clave.
              </p>

              {/* QR Image Container */}
              <div className="p-3 bg-white inline-block border-2 border-[#222328] shadow-md">
                <img
                  src={wifiQrUrl}
                  alt={`QR WiFi ${guideData.wifiNetwork}`}
                  className="w-48 h-48 mx-auto"
                />
              </div>

              <div className="space-y-2 text-left pt-2">
                <div className="p-2.5 bg-[#0C0D0F] border border-[#222328] flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-[#A1A1AA] block uppercase">Red</span>
                    <span className="text-xs font-bold text-white">{guideData.wifiNetwork}</span>
                  </div>
                  <button
                    onClick={copyWifiNetwork}
                    className="px-2.5 py-1 bg-[#18181B] hover:bg-[#222328] text-[10px] font-bold text-[#E1500A] border border-[#222328] cursor-pointer"
                  >
                    {copiedNetwork ? '✓ Copiado' : 'Copiar'}
                  </button>
                </div>

                <div className="p-2.5 bg-[#0C0D0F] border border-[#222328] flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-[#A1A1AA] block uppercase">Clave</span>
                    <span className="text-xs font-mono font-bold text-[#EFECE5]">{guideData.wifiPassword}</span>
                  </div>
                  <button
                    onClick={copyWifiPassword}
                    className="px-2.5 py-1 bg-[#18181B] hover:bg-[#222328] text-[10px] font-bold text-[#E1500A] border border-[#222328] cursor-pointer"
                  >
                    {copiedWifi ? '✓ Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setWifiModalOpen(false)}
                className="w-full py-2 bg-[#E1500A] hover:bg-[#c94507] text-white text-xs font-bold uppercase tracking-wider font-mono cursor-pointer rounded-none"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POPUP MODAL 2: DETALLE DE ATRACCIÓN / EXCURSIÓN */}
      {/* ========================================================================= */}
      {selectedAttraction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#141518] w-full max-w-md rounded-none shadow-2xl border border-[#222328] overflow-hidden font-sans">
            <div className="p-4 bg-[#18181B] border-b border-[#222328] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#E1500A]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                  Detalle del Lugar Recomendado
                </h3>
              </div>
              <button
                onClick={() => setSelectedAttraction(null)}
                className="p-1 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <h2 className="text-lg font-black text-white">{selectedAttraction.title}</h2>
                <div className="flex items-center gap-2 text-xs text-[#A1A1AA] mt-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-[#E1500A]" />
                  <span>A {selectedAttraction.distanceMinutes} minutos de distancia</span>
                </div>
              </div>

              <p className="text-xs text-[#EFECE5] leading-relaxed">
                {selectedAttraction.description}
              </p>

              {/* Insider Tip Box */}
              <div className="p-3 bg-[#E1500A]/10 border border-[#E1500A]/30 rounded-none space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#FFA27B] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#E1500A]" />
                  <span>Consejo del Anfitrión ({guideData.hostName})</span>
                </div>
                <p className="text-xs text-[#FFA27B] leading-relaxed">
                  {selectedAttraction.tips}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    selectedAttraction.title + ' ' + guideData.propertyName
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-[#E1500A] hover:bg-[#c94507] text-white text-xs font-bold uppercase tracking-wider font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Abrir en GPS</span>
                </a>

                <button
                  onClick={() => {
                    const shareText = `Te recomiendo visitar *${selectedAttraction.title}* en nuestra estadía: ${selectedAttraction.tips}`;
                    if (navigator.share) {
                      navigator.share({ title: selectedAttraction.title, text: shareText });
                    } else {
                      navigator.clipboard.writeText(shareText);
                      alert('Recomendación copiada para compartir');
                    }
                  }}
                  className="px-4 py-2.5 bg-[#18181B] hover:bg-[#222328] text-white text-xs font-bold uppercase tracking-wider font-mono border border-[#222328] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Compartir Lugar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POPUP MODAL 3: DETALLE DE GASTRONOMÍA / PROVEEDURÍA */}
      {/* ========================================================================= */}
      {selectedDining && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#141518] w-full max-w-md rounded-none shadow-2xl border border-[#222328] overflow-hidden font-sans">
            <div className="p-4 bg-[#18181B] border-b border-[#222328] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-[#E1500A]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                  Gastronomía & Abastecimiento
                </h3>
              </div>
              <button
                onClick={() => setSelectedDining(null)}
                className="p-1 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-black text-white">{selectedDining.name}</h2>
                  <p className="text-xs text-[#E1500A] font-bold mt-0.5">{selectedDining.specialty}</p>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 border border-emerald-800/40">
                  Rango: {selectedDining.priceRange}
                </span>
              </div>

              <div className="p-3 bg-[#0C0D0F] border border-[#222328] space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#EFECE5]">
                  <MapPin className="w-3.5 h-3.5 text-[#E1500A] shrink-0" />
                  <span>{selectedDining.address}</span>
                </div>
                {selectedDining.hasDelivery && (
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Posee servicio de entrega / Delivery a la cabaña</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {selectedDining.phone && (
                  <a
                    href={`https://wa.me/${selectedDining.phone.replace(
                      /\D/g,
                      ''
                    )}?text=Hola,%20quería%20consultar%20por%20menú%20o%20reserva%20para%20huéspedes%20de%20${encodeURIComponent(
                      guideData.propertyName
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-black text-xs font-black uppercase tracking-wider font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Contactar / Pedir por WhatsApp</span>
                  </a>
                )}

                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    selectedDining.name + ' ' + selectedDining.address
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-[#18181B] hover:bg-[#222328] text-white text-xs font-bold uppercase tracking-wider font-mono border border-[#222328] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#E1500A]" />
                  <span>Cómo Llegar en Google Maps</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POPUP MODAL 4: DETALLE DE MANUAL DE ELECTRODOMÉSTICO */}
      {/* ========================================================================= */}
      {selectedAppliance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#141518] w-full max-w-md rounded-none shadow-2xl border border-[#222328] overflow-hidden font-sans">
            <div className="p-4 bg-[#18181B] border-b border-[#222328] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-[#E1500A]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                  Manual de Uso
                </h3>
              </div>
              <button
                onClick={() => setSelectedAppliance(null)}
                className="p-1 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <h2 className="text-lg font-black text-white">{selectedAppliance.name}</h2>
                <p className="text-xs text-[#A1A1AA] mt-0.5">{selectedAppliance.subtitle}</p>
              </div>

              {/* Step by Step list */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-mono font-bold text-[#E1500A] uppercase tracking-wider block">
                  Instrucciones Paso a Paso
                </span>
                {selectedAppliance.steps.map((step, idx) => (
                  <div key={idx} className="p-3 bg-[#0C0D0F] border border-[#222328] text-xs flex items-start gap-2.5">
                    <span className="w-5 h-5 bg-[#E1500A] text-white flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                      {idx + 1}
                    </span>
                    <p className="text-[#EFECE5] leading-relaxed text-[11px]">{step}</p>
                  </div>
                ))}
              </div>

              {/* Important Tip Box */}
              <div className="p-3 bg-[#18181B] border border-[#222328] text-xs text-[#FFA27B] leading-relaxed">
                {selectedAppliance.tips}
              </div>

              <button
                onClick={() => setSelectedAppliance(null)}
                className="w-full py-2 bg-[#E1500A] hover:bg-[#c94507] text-white text-xs font-bold uppercase tracking-wider font-mono cursor-pointer rounded-none"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POPUP MODAL 5: TODAS LAS NORMAS DE CONVIVENCIA */}
      {/* ========================================================================= */}
      {rulesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#141518] w-full max-w-lg rounded-none shadow-2xl border border-[#222328] overflow-hidden font-sans max-h-[90vh] flex flex-col">
            <div className="p-4 bg-[#18181B] border-b border-[#222328] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#E1500A]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                  Normas & Convivencia
                </h3>
              </div>
              <button
                onClick={() => setRulesModalOpen(false)}
                className="p-1 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 overflow-y-auto">
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Agradecemos respetar las pautas del complejo para garantizar el descanso y la armonía de todos los huéspedes.
              </p>

              <div className="space-y-2.5">
                {guideData.rules.map((rule, idx) => (
                  <div key={idx} className="p-3.5 bg-[#0C0D0F] border border-[#222328] space-y-1">
                    <h4 className="font-bold text-white text-xs flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#E1500A]" />
                      <span>{rule.title}</span>
                    </h4>
                    <p className="text-xs text-[#A1A1AA] leading-relaxed">{rule.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-[#18181B] border-t border-[#222328] shrink-0">
              <button
                onClick={() => setRulesModalOpen(false)}
                className="w-full py-2 bg-[#E1500A] hover:bg-[#c94507] text-white text-xs font-bold uppercase tracking-wider font-mono cursor-pointer rounded-none"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POPUP MODAL 6: CONTACTOS DE ASISTENCIA & EMERGENCIAS */}
      {/* ========================================================================= */}
      {emergencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#141518] w-full max-w-md rounded-none shadow-2xl border border-[#222328] overflow-hidden font-sans">
            <div className="p-4 bg-[#18181B] border-b border-[#222328] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#E1500A]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                  Asistencia & Números Útiles
                </h3>
              </div>
              <button
                onClick={() => setEmergencyModalOpen(false)}
                className="p-1 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {/* Host Contact */}
              <div className="p-3.5 bg-[#0C0D0F] border border-[#222328] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#E1500A] font-bold uppercase block">
                    Anfitrión / Administración
                  </span>
                  <span className="font-bold text-xs text-white block mt-0.5">{guideData.hostName}</span>
                  <span className="font-mono text-xs text-[#A1A1AA]">{guideData.hostPhone}</span>
                </div>
                <a
                  href={`tel:${guideData.hostPhone.replace(/\D/g, '')}`}
                  className="px-3 py-1.5 bg-[#25D366] text-black font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Llamar</span>
                </a>
              </div>

              {/* Public Safety / Emergency contacts */}
              <div className="p-3.5 bg-[#0C0D0F] border border-[#222328] space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-[#222328]">
                  <span className="font-bold text-white">Emergencias Médicas / Hospital</span>
                  <a href="tel:107" className="font-mono font-bold text-[#E1500A] hover:underline">
                    107 (Guardia)
                  </a>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#222328]">
                  <span className="font-bold text-white">Policía Local</span>
                  <a href="tel:911" className="font-mono font-bold text-[#E1500A] hover:underline">
                    911
                  </a>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#222328]">
                  <span className="font-bold text-white">Bomberos Voluntarios</span>
                  <a href="tel:100" className="font-mono font-bold text-[#E1500A] hover:underline">
                    100
                  </a>
                </div>
              </div>

              <button
                onClick={() => setEmergencyModalOpen(false)}
                className="w-full py-2 bg-[#18181B] hover:bg-[#222328] text-white text-xs font-bold uppercase tracking-wider font-mono border border-[#222328] cursor-pointer rounded-none"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
