import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar as CalendarIcon,
  Users,
  Check,
  CreditCard,
  Percent,
  Sparkles,
  ArrowRight,
  MapPin,
  Wifi,
  Key,
  Palette,
  Building,
  X,
  Coffee,
  Sun,
  Home,
  Star,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  CheckCircle2,
  Crown,
  Flame,
  Waves,
  ShieldCheck,
  Compass,
  Smartphone,
  Eye,
  MessageCircle,
  Wine,
  Mountain,
  Layers,
} from 'lucide-react';
import { WelcomeGuideData, Property } from '../../types';
import { DateRangeCalendarPicker } from './DateRangeCalendarPicker';

interface DirectBookingLandingProps {
  guideData: WelcomeGuideData;
  properties: Property[];
  activeTemplate?: LandingTemplate;
  onSelectTemplate?: (template: LandingTemplate) => void;
}

export type LandingTemplate =
  | 'bay'
  | 'retrato'
  | 'urbano'
  | 'luxury-bento-grid'
  | 'luxury-editorial-parallax'
  | 'luxury-horizontal-architectural';

export const DirectBookingLanding: React.FC<DirectBookingLandingProps> = ({
  guideData,
  properties,
  activeTemplate,
  onSelectTemplate,
}) => {
  // Visual template state
  const [internalTemplate, setInternalTemplate] = useState<LandingTemplate>('luxury-editorial-parallax');
  const selectedTemplate = activeTemplate || internalTemplate;
  const setSelectedTemplate = (t: LandingTemplate) => {
    if (onSelectTemplate) {
      onSelectTemplate(t);
    } else {
      setInternalTemplate(t);
    }
  };

  // Dates state
  const [checkInDate, setCheckInDate] = useState<string>('2026-10-15');
  const [checkOutDate, setCheckOutDate] = useState<string>('2026-10-18');
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);

  // Selected apartment and guest counts
  const [selectedCabinId, setSelectedCabinId] = useState<string>(properties[0]?.id || 'cat-a');
  const [nights, setNights] = useState<number>(3);
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);
  const [showSelfOnboardExplain, setShowSelfOnboardExplain] = useState<boolean>(false);
  const [showSignatureModal, setShowSignatureModal] = useState<boolean>(false);
  const [activeFloatingDetail, setActiveFloatingDetail] = useState<'sommelier' | 'wellness' | 'terroir' | 'direct_perks' | null>(null);

  // Early Check-in & Late Check-out options
  const [earlyCheckIn, setEarlyCheckIn] = useState<boolean>(false);
  const [lateCheckOut, setLateCheckOut] = useState<boolean>(false);
  // Promo code
  const [promoCode, setPromoCode] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<number>(0);

  // Urbano Buenos Aires custom hero image state
  const [urbanoHeroImage, setUrbanoHeroImage] = useState<string>('/catalinas/edificio.jpg');
  const [showUrbanoImageModal, setShowUrbanoImageModal] = useState<boolean>(false);
  const [customImageUrlInput, setCustomImageUrlInput] = useState<string>('');

  const selectedCabin = properties.find((p) => p.id === selectedCabinId) || properties[0];

  // Helper to calculate nights between 2 dates
  const calculateNights = (inDate: string, outDate: string) => {
    if (!inDate || !outDate) return 3;
    const d1 = new Date(inDate + 'T00:00:00');
    const d2 = new Date(outDate + 'T00:00:00');
    const diffDays = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  };

  const handleDatesSelect = (newIn: string, newOut: string) => {
    setCheckInDate(newIn);
    setCheckOutDate(newOut);
    const n = calculateNights(newIn, newOut);
    setNights(n);
    setIsCalendarOpen(false);
  };

  const handleCheckInChange = (newIn: string) => {
    setCheckInDate(newIn);
    if (newIn >= checkOutDate) {
      const d = new Date(newIn + 'T00:00:00');
      d.setDate(d.getDate() + 3);
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const outStr = `${d.getFullYear()}-${m}-${day}`;
      setCheckOutDate(outStr);
      setNights(3);
    } else {
      setNights(calculateNights(newIn, checkOutDate));
    }
  };

  const handleCheckOutChange = (newOut: string) => {
    if (newOut > checkInDate) {
      setCheckOutDate(newOut);
      setNights(calculateNights(checkInDate, newOut));
    }
  };

  // Pricing math
  const pricePerNight = selectedCabin?.basePrice || 140;
  const rawTotal = pricePerNight * nights;

  // Early / Late fee
  const earlyFee = earlyCheckIn ? 25 : 0;
  const lateFee = lateCheckOut ? 25 : 0;
  const earlyLateTotal = earlyFee + lateFee;

  // Direct booking discount (default 15% off OTA price)
  const baseDiscountPercent = guideData.directBookingSettings?.directDiscountPercent || 15;
  const totalDiscountPercent = baseDiscountPercent + appliedPromo;
  const discountAmount = Math.round((rawTotal * totalDiscountPercent) / 100);

  const finalTotal = rawTotal + earlyLateTotal - discountAmount;
  const depositPercent = guideData.directBookingSettings?.depositPercentage || 50;
  const depositAmount = Math.round((finalTotal * depositPercent) / 100);
  const balanceOnArrival = finalTotal - depositAmount;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === 'DIRECTO' || code === 'AMIGO' || code === 'AURA') {
      setAppliedPromo(10);
    } else if (code === 'ESPECIAL20') {
      setAppliedPromo(5);
    } else {
      setAppliedPromo(0);
    }
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingConfirmed(true);
  };

  const scrollToBooking = () => {
    const el = document.getElementById('booking-engine-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUrbanoHeroImage(event.target.result as string);
          setShowUrbanoImageModal(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hola! Quiero confirmar mi reserva directa en AURA (Valle de Uco, Mendoza):\n` +
    `• Unidad: ${selectedCabin?.name || 'Suite de Viña'}\n` +
    `• Estadía: ${checkInDate} al ${checkOutDate} (${nights} noches, ${guestsCount} personas)\n` +
    `${earlyCheckIn ? '• Incluye Ingreso Temprano & Copa de Bienvenida\n' : ''}` +
    `${lateCheckOut ? '• Incluye Salida Extendida (Sunset Tasting)\n' : ''}` +
    `• Total con ${totalDiscountPercent}% descuento directo: $${finalTotal} USD\n` +
    `• Seña 50% ($${depositAmount} USD) a transferir a ${guideData.directBookingSettings?.bankAlias || 'AURA.MENDOZA'}\n` +
    `• Mi nombre: ${guestName || 'Huésped'} - Tel: ${guestPhone}`
  );

  // Template flags
  const isBay = selectedTemplate === 'bay';
  const isRetrato = selectedTemplate === 'retrato';
  const isUrbano = selectedTemplate === 'urbano';
  const isSigAuraBento = selectedTemplate === 'luxury-bento-grid';
  const isSigAuraParallax = selectedTemplate === 'luxury-editorial-parallax';
  const isSigAuraHorizontal = selectedTemplate === 'luxury-horizontal-architectural';
  const isSigAura = isSigAuraBento || isSigAuraParallax || isSigAuraHorizontal;
  const isSignature = isSigAura;

  return (
    <div className={`w-full transition-all duration-300 relative ${
      isSigAura
        ? 'bg-[#0e0c09] text-[#EDE8DF]'
        : isRetrato
        ? 'bg-[#0c0e0d] text-[#EFECE6]'
        : isUrbano
        ? 'bg-[#FAF7F2] p-2 sm:p-5 text-stone-900'
        : 'bg-[#FAF8F5] text-stone-900'
    }`}>
      {/* ========================================================================= */}
      {/* BARRA SUPERIOR DE SIMULACIÓN Y SELECTOR DE DISEÑO (ESENCIAL VS SIGNATURE) */}
      {/* ========================================================================= */}
      <div className="bg-[#18181B] px-4 py-2.5 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-300 font-sans rounded-t-xl sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
          <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          <div className="ml-2 sm:ml-3 px-3 py-1 rounded-full bg-stone-900 border border-stone-800 flex items-center gap-2 text-stone-200 font-mono text-[11px]">
            <span className="text-emerald-400 font-bold">🔒 https://</span>
            <span className="text-white font-bold">
              {isSigAura ? 'aura-valledeuco.com' : (guideData.directBookingSettings?.customDomain || 'tucomplejo.com.ar')}
            </span>
            <span className="text-stone-500 text-[10px] hidden md:inline">(Sitio Web Oficial)</span>
          </div>
        </div>

        {/* Selector de Modelos en Vivo: 2 Colecciones */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Grupo 1: Colección Esencial [Incluida] */}
          <div className="inline-flex rounded-lg bg-stone-900 p-0.5 border border-stone-700">
            <button
              onClick={() => setSelectedTemplate('bay')}
              className={`px-2.5 py-1.5 text-[11px] font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                isBay
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="Incluido en el abono general"
            >
              <span>🏛️ Bay</span>
              <span className="text-[9px] px-1 py-0.2 bg-amber-950 text-amber-300 rounded font-mono">INCLUIDO</span>
            </button>

            <button
              onClick={() => setSelectedTemplate('retrato')}
              className={`px-2.5 py-1.5 text-[11px] font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                isRetrato
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="Incluido en el abono general"
            >
              <span>🌲 Retrato</span>
              <span className="text-[9px] px-1 py-0.2 bg-stone-950 text-emerald-300 rounded font-mono">INCLUIDO</span>
            </button>

            <button
              onClick={() => setSelectedTemplate('urbano')}
              className={`px-2.5 py-1.5 text-[11px] font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                isUrbano
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="Incluido en el abono general"
            >
              <span>🏙️ Urbano</span>
              <span className="text-[9px] px-1 py-0.2 bg-amber-200 text-amber-950 rounded font-mono font-bold">BS. AS.</span>
            </button>
          </div>

          {/* Grupo 2: Colección Signature [De Autor / Exclusiva] */}
          <div className="inline-flex rounded-lg bg-stone-900 p-0.5 border border-[#c5a880]/60">
            <button
              onClick={() => setSelectedTemplate('luxury-bento-grid')}
              className={`px-2.5 py-1.5 text-[11px] font-bold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                isSigAuraBento
                  ? 'bg-[#c5a880] text-stone-950 font-black shadow-xs'
                  : 'text-[#c5a880] hover:text-amber-200'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>AURA Bento</span>
              <span className="text-[9px] px-1 py-0.2 bg-stone-950/80 text-amber-300 rounded font-mono font-bold">$49</span>
            </button>

            <button
              onClick={() => setSelectedTemplate('luxury-editorial-parallax')}
              className={`px-2.5 py-1.5 text-[11px] font-bold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                isSigAuraParallax
                  ? 'bg-[#c5a880] text-stone-950 font-black shadow-xs'
                  : 'text-[#c5a880] hover:text-amber-200'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>AURA Parallax</span>
              <span className="text-[9px] px-1 py-0.2 bg-stone-950/80 text-amber-300 rounded font-mono font-bold">$49</span>
            </button>

            <button
              onClick={() => setSelectedTemplate('luxury-horizontal-architectural')}
              className={`px-2.5 py-1.5 text-[11px] font-bold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                isSigAuraHorizontal
                  ? 'bg-[#c5a880] text-stone-950 font-black shadow-xs'
                  : 'text-[#c5a880] hover:text-amber-200'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>AURA Canvas</span>
              <span className="text-[9px] px-1 py-0.2 bg-stone-950/80 text-amber-300 rounded font-mono font-bold">$49</span>
            </button>
          </div>

          <button
            onClick={() => setShowSelfOnboardExplain(!showSelfOnboardExplain)}
            className="text-[11px] text-[#c5a880] hover:text-amber-300 font-medium hidden lg:inline-flex items-center gap-1 cursor-pointer ml-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{showSelfOnboardExplain ? 'Ocultar Catálogo' : 'Ver Catálogo Completo'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BANNER DISTINTIVO CUANDO SE NAVEGA UN MODELO SIGNATURE */}
      {/* ========================================================================= */}
      {isSignature && (
        <div className="bg-gradient-to-r from-[#211a12] via-[#14120e] to-[#211a12] p-3 sm:px-6 border-b border-[#c5a880]/40 text-xs text-[#f5ebd9] flex flex-wrap items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#c5a880] text-stone-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" />
              SIGNATURE ADDON • $49 USD
            </span>
            <span className="font-semibold text-[#f5ebd9]">
              {isSigAuraParallax
                ? 'AURA — Parallax Editorial (Valle de Uco, Mendoza)'
                : isSigAuraBento
                ? 'AURA — Luxury Bento Grid (Valle de Uco, Mendoza)'
                : isSigAuraHorizontal
                ? 'AURA — Canvas Arquitectónico Horizontal (Valle de Uco, Mendoza)'
                : 'Diseño Signature de Autor de Alta Gama'}
            </span>
            <span className="text-[#c5a880]/80 hidden md:inline text-[11px]">
              (Incluye portal de bienvenida móvil unificado en esta misma estética visual)
            </span>
          </div>

          <button
            onClick={() => setShowSignatureModal(true)}
            className="min-h-[36px] px-4 py-1.5 rounded-xl bg-[#c5a880] hover:bg-[#b8986d] text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#c5a880]/20 cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Desbloquear Addon AURA ($49 USD)</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL GLOBAL: SELECTOR DE CALENDARIO VISUAL DE FECHAS (REACT PORTAL) */}
      {/* ========================================================================= */}
      {isCalendarOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-sans"
          onClick={() => setIsCalendarOpen(false)}
        >
          <div
            className="relative w-full max-w-md shadow-2xl rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <DateRangeCalendarPicker
              checkIn={checkInDate}
              checkOut={checkOutDate}
              onChange={handleDatesSelect}
              onClose={() => setIsCalendarOpen(false)}
              accentColor={isSigAuraBento || isSigAuraParallax ? 'amber' : isUrbano ? 'amber' : isRetrato ? 'emerald' : 'amber'}
            />
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL: ACTIVACIÓN / CONSULTA COLECCIÓN SIGNATURE (AURA $49 USD) */}
      {/* ========================================================================= */}
      {showSignatureModal && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200 font-sans"
          onClick={() => setShowSignatureModal(false)}
        >
          <div
            className="relative w-full max-w-xl bg-[#0f0d0a] text-white border-2 border-[#c5a880]/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSignatureModal(false)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-stone-900 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-stone-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="px-3 py-1 rounded-full bg-[#c5a880]/20 text-[#c5a880] text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" />
                PREMIUM LUXURY ADDON • $49 USD
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif mt-2 tracking-wide text-[#FAF8F5]">
                AURA — Relais & Viñedos de Montaña
              </h3>
              <p className="text-xs sm:text-sm text-[#c5a880]/90 font-mono mt-1">
                Valle de Uco, Mendoza — Argentina • Formato Parallax Vertical & Bento Grid
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950/80 border border-[#c5a880]/30 space-y-2.5 text-xs text-stone-300 font-medium">
              <p className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#c5a880] shrink-0" />
                <span><strong>Diseño Parallax Editorial / Bento Grid:</strong> Presentación cinemática con scroll vertical inmersivo.</span>
              </p>
              <p className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#c5a880] shrink-0" />
                <span><strong>Portal de Bienvenida coordinado 1:1:</strong> Misma estética en el celular del huésped para que empiece a habitar el espacio antes de llegar.</span>
              </p>
              <p className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#c5a880] shrink-0" />
                <span><strong>Setup asistido:</strong> Curaduría de fotos y textos por el equipo de diseño.</span>
              </p>
              <p className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#c5a880] shrink-0" />
                <span><strong>Pago único de $49 USD:</strong> Activación definitiva para tu complejo sin costos recurrentes extra.</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent('Hola! Quiero activar el addon AURA ($49 USD) en Loomi Suite para mi complejo de viñedos/montaña.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-h-[44px] py-3 px-5 rounded-2xl bg-[#c5a880] hover:bg-[#b8986d] text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#c5a880]/20 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Activar AURA por WhatsApp ($49 USD)</span>
              </a>
              <button
                onClick={() => setShowSignatureModal(false)}
                className="min-h-[44px] py-3 px-5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-300 font-semibold text-xs border border-stone-800 cursor-pointer"
              >
                Cerrar Previsualización
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODELO SIGNATURE 2: AURA — EDITORIAL PARALLAX VERTICAL ($49 USD)          */}
      {/* ========================================================================= */}
      {isSigAuraParallax && (
        <div className="space-y-0 animate-in fade-in duration-500 font-sans">
          
          {/* PANEL PARALLAX 1: HERO MONUMENTAL INMERSIVO CON CUADROS FLOTANTES INTERACTIVOS */}
          <section className="relative min-h-[88vh] lg:min-h-[94vh] flex flex-col justify-between overflow-hidden bg-[#0a0907] text-[#FAF8F5]">
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src="/cabanas/cabana-terraza.jpg"
                alt="AURA Valle de Uco"
                className="w-full h-full object-cover opacity-50 scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0c09] via-[#0e0c09]/40 to-black/30" />
            </div>

            {/* Cuadro Flotante Interactivo 1: Sommelier & Cata (Top-Left) */}
            <div
              onClick={() => setActiveFloatingDetail('sommelier')}
              className="absolute top-20 sm:top-24 left-4 sm:left-10 z-20 p-3 sm:p-4 rounded-2xl bg-black/65 backdrop-blur-xl border border-[#c5a880]/50 shadow-2xl cursor-pointer hover:bg-black/85 hover:border-[#c5a880] hover:scale-105 transition-all duration-300 max-w-[230px] sm:max-w-[270px] group"
              title="Tocá para ver detalles de la cata"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-[#c5a880]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  Cata Sunset • 18:30hs
                </span>
                <span className="text-[10px] text-[#c5a880] font-mono group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
              <p className="text-xs text-stone-200 font-medium leading-snug group-hover:text-amber-200 transition-colors">
                🍷 Sommelier In-House y maridaje de Malbec centenario
              </p>
            </div>

            {/* Cuadro Flotante Interactivo 2: Tina Nórdica & Spa (Top-Right) */}
            <div
              onClick={() => setActiveFloatingDetail('wellness')}
              className="absolute top-36 sm:top-24 right-4 sm:right-10 z-20 p-3 sm:p-4 rounded-2xl bg-black/65 backdrop-blur-xl border border-[#c5a880]/50 shadow-2xl cursor-pointer hover:bg-black/85 hover:border-[#c5a880] hover:scale-105 transition-all duration-300 max-w-[230px] sm:max-w-[270px] group"
              title="Tocá para ver detalles de spa"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-amber-300">
                  <Flame className="w-3 h-3 text-amber-400" />
                  Tina Nórdica • 39°C
                </span>
                <span className="text-[10px] text-amber-300 font-mono group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
              <p className="text-xs text-stone-200 font-medium leading-snug group-hover:text-amber-200 transition-colors">
                ♨️ Baño caliente a leña bajo las estrellas de Mendoza
              </p>
            </div>

            {/* Cuadro Flotante Interactivo 3: Terroir & Altura (Bottom-Left Desktop) */}
            <div
              onClick={() => setActiveFloatingDetail('terroir')}
              className="hidden lg:block absolute bottom-24 left-10 z-20 p-3.5 rounded-2xl bg-black/65 backdrop-blur-xl border border-white/20 shadow-2xl cursor-pointer hover:bg-black/85 hover:border-[#c5a880]/60 hover:scale-105 transition-all duration-300 max-w-[250px] group"
            >
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-[#c5a880] mb-1">
                <Mountain className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>Terroir de Montaña</span>
              </div>
              <p className="text-xs text-stone-300 font-light leading-snug">
                ⛰️ 1.200 Msnm • Silencio absoluto y vistas a la Cordillera
              </p>
            </div>

            {/* Cuadro Flotante Interactivo 4: Beneficio Directo (Bottom-Right Desktop) */}
            <div
              onClick={() => setActiveFloatingDetail('direct_perks')}
              className="hidden lg:block absolute bottom-24 right-10 z-20 p-3.5 rounded-2xl bg-black/65 backdrop-blur-xl border border-[#c5a880]/50 shadow-2xl cursor-pointer hover:bg-black/85 hover:border-[#c5a880] hover:scale-105 transition-all duration-300 max-w-[250px] group"
            >
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-emerald-300 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Beneficio Directo</span>
              </div>
              <p className="text-xs text-stone-300 font-light leading-snug">
                ✨ Copa de bienvenida & Late check-out de cortesía
              </p>
            </div>

            {/* Top Bar Narrativa */}
            <div className="relative z-10 p-6 sm:p-10 max-w-7xl mx-auto w-full flex items-center justify-between border-b border-white/10">
              <span className="text-xs font-mono tracking-[0.3em] uppercase text-[#c5a880] font-bold">
                RELAIS & VIÑEDOS DE MONTAÑA • 1.200 MSNM
              </span>
              <span className="text-xs font-mono text-stone-300 hidden sm:inline">
                Valle de Uco, Mendoza
              </span>
            </div>

            {/* Titular Central Editorial */}
            <div className="relative z-10 p-6 sm:p-12 max-w-5xl mx-auto w-full text-center space-y-6 my-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#c5a880]/15 text-[#c5a880] border border-[#c5a880]/30 text-xs font-mono uppercase tracking-widest backdrop-blur-md">
                <Wine className="w-3.5 h-3.5" />
                <span>RESERVA DIRECTA DE AUTOR</span>
              </div>

              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-serif uppercase tracking-[0.2em] font-light text-[#FAF8F5] leading-none">
                AURA
              </h1>

              <p className="text-stone-300 max-w-2xl mx-auto font-light text-sm sm:text-lg leading-relaxed">
                El silencio de la Cordillera de los Andes, 4 suites de viña privadas y catas guiadas al atardecer.
              </p>

              {/* Cápsula Flotante de Reserva Cristal */}
              <div className="pt-6 max-w-3xl mx-auto">
                <div className="p-4 sm:p-6 rounded-3xl bg-black/60 backdrop-blur-xl border border-[#c5a880]/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div
                    onClick={() => setIsCalendarOpen(true)}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer text-left w-full sm:w-auto flex-1 transition-colors"
                  >
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#c5a880] block font-bold">
                      Estadía en AURA
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#c5a880]" />
                      {checkInDate} al {checkOutDate} ({nights} noches)
                    </span>
                  </div>

                  <button
                    onClick={scrollToBooking}
                    className="min-h-[44px] w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#c5a880] hover:bg-[#b8986d] text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#c5a880]/30 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Reservar Suite</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Scroll Cue */}
            <div className="relative z-10 p-6 text-center text-xs font-mono text-stone-400 flex items-center justify-center gap-2">
              <span>↓ Desplazá para explorar las 4 Suites & Experiencias de Viña</span>
            </div>
          </section>

          {/* MODAL / DRAWER FLOTANTE DE DETALLE INTERACTIVO */}
          {activeFloatingDetail && typeof document !== 'undefined' && createPortal(
            <div
              className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 font-sans"
              onClick={() => setActiveFloatingDetail(null)}
            >
              <div
                className="relative w-full max-w-lg bg-[#0f0d0a] text-white border-2 border-[#c5a880]/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setActiveFloatingDetail(null)}
                  className="absolute top-5 right-5 w-10 h-10 rounded-full bg-stone-900 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-stone-800"
                >
                  <X className="w-5 h-5" />
                </button>

                {activeFloatingDetail === 'sommelier' && (
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a880]/20 text-[#c5a880] text-xs font-mono font-bold uppercase">
                      <Wine className="w-4 h-4" />
                      EXPERIENCIA ENOLÓGICA • 18:30 HS
                    </div>
                    <h3 className="text-2xl font-serif text-[#FAF8F5]">Cata Sunset con Sommelier</h3>
                    <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light">
                      Cada atardecer, nuestro sommelier residente guía una degustación íntima de 3 etiquetas boutique del Valle de Uco, maridadas con quesos artesanales de la región y panes de masa madre.
                    </p>
                    <div className="p-4 rounded-2xl bg-stone-950/80 border border-[#c5a880]/30 space-y-2 text-xs font-mono text-[#c5a880]">
                      <div>✓ Incluida en estadías de 2 o más noches</div>
                      <div>✓ Copa de cristal Riedel & notas de cata personalizadas</div>
                    </div>
                  </div>
                )}

                {activeFloatingDetail === 'wellness' && (
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold uppercase">
                      <Flame className="w-4 h-4" />
                      RELAX A CIELO ABIERTO
                    </div>
                    <h3 className="text-2xl font-serif text-[#FAF8F5]">Tina Nórdica de Inmersión Caliente</h3>
                    <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light">
                      Construida en cedro y piedra volcánica, la tina se calienta con sarmientos de la propia poda de los viñedos a 39°C. Ideal para sumergirse al anochecer con vista a las constelaciones australes.
                    </p>
                    <div className="p-4 rounded-2xl bg-stone-950/80 border border-amber-500/30 space-y-2 text-xs font-mono text-amber-300">
                      <div>✓ Sesión privada por suite con toallones de algodón egipcio</div>
                      <div>✓ Aceites esenciales de lavanda y uva orgánica</div>
                    </div>
                  </div>
                )}

                {activeFloatingDetail === 'terroir' && (
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold uppercase">
                      <Mountain className="w-4 h-4" />
                      VALLE DE UCO • 1.200 MSNM
                    </div>
                    <h3 className="text-2xl font-serif text-[#FAF8F5]">El Terroir & la Cordillera</h3>
                    <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light">
                      La marcada amplitud térmica (hasta 20°C entre día y noche) y los suelos aluviales pedregosos otorgan a las uvas una concentración aromática única, reflejada en el entorno natural de AURA.
                    </p>
                  </div>
                )}

                {activeFloatingDetail === 'direct_perks' && (
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold uppercase">
                      <ShieldCheck className="w-4 h-4" />
                      VENTAJAS DE RESERVA DIRECTA
                    </div>
                    <h3 className="text-2xl font-serif text-[#FAF8F5]">0% Comisión & Beneficios VIP</h3>
                    <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light">
                      Al reservar directamente en la web oficial obtenés 15% de descuento sobre tarifas de OTAs, copa de bienvenida premium, late check-out de cortesía sujeto a disponibilidad y contacto directo con tu anfitrión.
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-stone-800 flex justify-end">
                  <button
                    onClick={() => setActiveFloatingDetail(null)}
                    className="px-6 py-2.5 rounded-xl bg-[#c5a880] text-stone-950 font-bold text-xs uppercase cursor-pointer"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* PANEL PARALLAX 2: MANIFIESTO DEL TERROIR & ARQUITECTURA */}
          <section className="py-24 px-6 sm:px-12 bg-[#12100d] text-[#EDE8DF] border-t border-[#c5a880]/20">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#c5a880] font-bold block">
                  01 / MANIFIESTO ARQUITECTÓNICO
                </span>
                <h2 className="text-3xl sm:text-5xl font-serif font-light text-white leading-tight">
                  La Materia y el Paisaje en Diálogo Continuo
                </h2>
                <p className="text-stone-300 text-sm leading-relaxed font-light">
                  AURA nace entre hileras de Malbec centenario en el Valle de Uco. Construidas con piedra local, adobe contemporáneo y madera de lenga, cada una de nuestras 4 suites está emplazada para garantizar privacidad absoluta y vistas ininterrumpidas a los picos nevados del Cordón del Plata.
                </p>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 text-center">
                  <div>
                    <span className="text-2xl sm:text-3xl font-serif text-[#c5a880]">4</span>
                    <p className="text-[10px] font-mono text-stone-400 mt-1 uppercase">Suites Únicas</p>
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-serif text-[#c5a880]">1.200</span>
                    <p className="text-[10px] font-mono text-stone-400 mt-1 uppercase">Msnm Altura</p>
                  </div>
                  <div>
                    <span className="text-2xl sm:text-3xl font-serif text-[#c5a880]">0%</span>
                    <p className="text-[10px] font-mono text-stone-400 mt-1 uppercase">Comisión Directa</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 h-[460px] rounded-3xl overflow-hidden border border-[#c5a880]/30 shadow-2xl relative">
                <img
                  src="/cabanas/deck-hamaca.jpg"
                  alt="Arquitectura AURA"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-black/70 backdrop-blur-md text-xs font-mono text-[#c5a880]">
                  «El huésped empieza a habitar el espacio antes de llegar.»
                </div>
              </div>
            </div>
          </section>

          {/* PANEL PARALLAX 3: LAS 4 SUITES DE VIÑA (VERTICAL SHOWCASE) */}
          <section className="py-24 px-6 sm:px-12 bg-[#0a0907] text-[#EDE8DF] border-t border-[#c5a880]/20">
            <div className="max-w-6xl mx-auto space-y-12">
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#c5a880] font-bold">
                  02 / COLECCIÓN DE SUITES
                </span>
                <h3 className="text-3xl sm:text-4xl font-serif font-light text-white">
                  4 Refugios Diseñados para la Contemplación
                </h3>
              </div>

              <div className="space-y-8">
                {[
                  {
                    name: 'Suite Malbec Gran Reserva',
                    desc: 'Deck panorámico hacia los viñedos, estufa a leña, tina nórdica exterior y cava personal en la habitación.',
                    img: '/cabanas/cabana-terraza.jpg',
                    cap: '2 Huéspedes',
                    highlight: 'Tina de Inmersión Caliente',
                  },
                  {
                    name: 'Suite Cordón del Plata',
                    desc: 'Orientación oeste para disfrutar del atardecer sobre los Andes, ventanales de piso a techo y lino egipcio.',
                    img: '/cabanas/deck-hamaca.jpg',
                    cap: '2 a 3 Huéspedes',
                    highlight: 'Atardecer Andino',
                  },
                  {
                    name: 'Suite Los Árboles',
                    desc: 'Enclavada entre sauces y arroyo de deshielo, máxima serenidad acústica y espacio para lectura y descanso.',
                    img: '/cabanas/sendero-noche.jpg',
                    cap: '2 Huéspedes',
                    highlight: 'Silencio Absoluto',
                  },
                  {
                    name: 'Master Suite Altamira',
                    desc: 'Nuestra unidad más amplia con living integrado, fogonero privado en la terraza y servicio de sommelier.',
                    img: '/cabanas/piscina.jpg',
                    cap: '4 Huéspedes',
                    highlight: 'Fogonero Privado',
                  },
                ].map((suite, idx) => (
                  <div
                    key={suite.name}
                    className="p-6 sm:p-8 rounded-3xl bg-[#14110d] border border-[#c5a880]/30 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
                  >
                    <div className="lg:col-span-5 h-64 lg:h-72 rounded-2xl overflow-hidden relative">
                      <img
                        src={suite.img}
                        alt={suite.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-xs text-[10px] font-mono text-[#c5a880] font-bold">
                        0{idx + 1} • {suite.cap}
                      </span>
                    </div>

                    <div className="lg:col-span-7 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-2xl font-serif text-[#FAF8F5]">{suite.name}</h4>
                        <span className="px-3 py-1 rounded-full bg-[#c5a880]/15 text-[#c5a880] text-xs font-mono font-bold">
                          {suite.highlight}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
                        {suite.desc}
                      </p>

                      <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                        <div className="text-xs font-mono text-stone-400">
                          Tarifa Directa Oficial: <strong className="text-white text-base font-serif">${pricePerNight} USD</strong> / noche
                        </div>

                        <button
                          onClick={scrollToBooking}
                          className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#c5a880] hover:bg-[#b8986d] text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Elegir Esta Suite
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* PANEL PARALLAX 4: EXPERIENCIAS & BIENVENIDA */}
          <section className="py-20 px-6 sm:px-12 bg-[#12100d] text-[#EDE8DF] border-t border-[#c5a880]/20">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                onClick={() => setActiveFloatingDetail('sommelier')}
                className="p-8 rounded-3xl bg-[#0e0c09] border border-[#c5a880]/30 hover:border-[#c5a880] space-y-3 cursor-pointer transition-all duration-300 hover:scale-[1.02] group shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <Wine className="w-8 h-8 text-[#c5a880] group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-mono text-[#c5a880] font-bold">Ver cata →</span>
                </div>
                <h4 className="text-xl font-serif text-white group-hover:text-amber-200 transition-colors">Cava Subterránea</h4>
                <p className="text-xs text-stone-300 leading-relaxed font-light">
                  Degustaciones privadas al caer el sol guiadas por nuestro sommelier in-house.
                </p>
              </div>

              <div
                onClick={() => setActiveFloatingDetail('wellness')}
                className="p-8 rounded-3xl bg-[#0e0c09] border border-[#c5a880]/30 hover:border-[#c5a880] space-y-3 cursor-pointer transition-all duration-300 hover:scale-[1.02] group shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <Waves className="w-8 h-8 text-[#c5a880] group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-mono text-[#c5a880] font-bold">Ver spa →</span>
                </div>
                <h4 className="text-xl font-serif text-white group-hover:text-amber-200 transition-colors">Spa & Tina Nórdica</h4>
                <p className="text-xs text-stone-300 leading-relaxed font-light">
                  Baño caliente a cielo abierto bajo las estrellas de Mendoza y masajes con uva.
                </p>
              </div>

              <div
                onClick={() => setActiveFloatingDetail('sommelier')}
                className="p-8 rounded-3xl bg-[#0e0c09] border border-[#c5a880]/30 hover:border-[#c5a880] space-y-3 cursor-pointer transition-all duration-300 hover:scale-[1.02] group shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <Flame className="w-8 h-8 text-[#c5a880] group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-mono text-[#c5a880] font-bold">Ver menú →</span>
                </div>
                <h4 className="text-xl font-serif text-white group-hover:text-amber-200 transition-colors">Cocina de Fuegos</h4>
                <p className="text-xs text-stone-300 leading-relaxed font-light">
                  Gastronomía a las brasas de sarmientos y desayunos de campo incluidos.
                </p>
              </div>
            </div>
          </section>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODELO SIGNATURE 1: AURA — LUXURY BENTO GRID ($49 USD)                    */}
      {/* ========================================================================= */}
      {isSigAuraBento && (
        <div className="py-8 px-4 sm:px-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300 font-sans">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8 rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-[#1a1611] to-[#0d0c0a] border border-[#c5a880]/30 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[380px] sm:min-h-[440px]">
              <div className="absolute inset-0 z-0">
                <img
                  src="/cabanas/cabana-terraza.jpg"
                  alt="AURA Valle de Uco"
                  className="w-full h-full object-cover opacity-30 scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0d0a] via-[#0f0d0a]/60 to-transparent" />
              </div>

              <div className="relative z-10 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#c5a880]/20 pb-3">
                  <span className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-[#c5a880] flex items-center gap-2">
                    <Wine className="w-3.5 h-3.5 text-[#c5a880]" />
                    RELAIS & VIÑEDOS DE MONTAÑA
                  </span>
                  <span className="text-[11px] font-mono text-stone-400">
                    Valle de Uco, Mendoza — Argentina
                  </span>
                </div>

                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif tracking-widest text-[#FAF8F5] leading-none uppercase pt-2">
                  AURA
                </h1>

                <p className="text-stone-300 text-sm sm:text-base font-light max-w-2xl leading-relaxed">
                  Una experiencia de hospitalidad inmersiva donde los viñedos de altura y el silencio de la Cordillera de los Andes marcan el ritmo de tu descanso.
                </p>
              </div>

              <div className="relative z-10 pt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#c5a880]/20 mt-6">
                <div className="flex items-center gap-2 text-xs font-mono text-[#c5a880]">
                  <Sparkles className="w-4 h-4" />
                  <span>4 Suites Exclusivas • Cava Privada • Spa de Altura</span>
                </div>

                <button
                  onClick={scrollToBooking}
                  className="min-h-[44px] px-7 py-3 rounded-2xl bg-[#c5a880] hover:bg-[#b8986d] text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#c5a880]/20 cursor-pointer flex items-center gap-2"
                >
                  <span>Reservar Estadía Directa</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 rounded-3xl p-6 sm:p-8 bg-[#14110d] border border-[#c5a880]/30 flex flex-col justify-between space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#c5a880]/20 pb-3">
                <span className="text-xs font-mono font-bold text-[#c5a880] uppercase tracking-wider">
                  01 / 4 SUITES DE VIÑA
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#c5a880]" />
              </div>

              <div className="space-y-2">
                <div className="text-3xl font-serif text-[#FAF8F5]">Deck & Fuego</div>
                <p className="text-xs text-stone-300 leading-relaxed font-light">
                  Amplios ventanales de piso a techo orientados hacia el Cordón del Plata, estufa nórdica a leña, lino egipcio y copa de Malbec de bienvenida.
                </p>
              </div>

              <div className="pt-3 border-t border-[#c5a880]/20 flex items-center justify-between text-xs font-mono text-stone-400">
                <span>Capacidad: 2 a 4 pax</span>
                <span className="text-[#c5a880] font-bold">Ver fotos →</span>
              </div>
            </div>

            <div className="lg:col-span-4 rounded-3xl p-6 sm:p-8 bg-[#14110d] border border-[#c5a880]/30 flex flex-col justify-between space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#c5a880]/20 pb-3">
                <span className="text-xs font-mono font-bold text-[#c5a880] uppercase tracking-wider">
                  02 / CAVA PRIVADA
                </span>
                <Wine className="w-4 h-4 text-[#c5a880]" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-serif text-[#FAF8F5]">Catas & Maridajes</h3>
                <p className="text-xs text-stone-300 leading-relaxed font-light">
                  Degustaciones guiadas por sommelier in-house al caer el sol, con selección de etiquetas boutique del Valle de Uco.
                </p>
              </div>

              <div className="pt-3 border-t border-[#c5a880]/20 text-xs font-mono text-[#c5a880]">
                Experiencia Exclusiva Huéspedes
              </div>
            </div>

            <div className="lg:col-span-4 rounded-3xl p-6 sm:p-8 bg-[#14110d] border border-[#c5a880]/30 flex flex-col justify-between space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#c5a880]/20 pb-3">
                <span className="text-xs font-mono font-bold text-[#c5a880] uppercase tracking-wider">
                  03 / WELLNESS & SPA
                </span>
                <Waves className="w-4 h-4 text-[#c5a880]" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-serif text-[#FAF8F5]">Tina Nórdica Exterior</h3>
                <p className="text-xs text-stone-300 leading-relaxed font-light">
                  Baño caliente a cielo abierto con vista a las estrellas de Mendoza y sesiones de masajes con extractos de uva.
                </p>
              </div>

              <div className="pt-3 border-t border-[#c5a880]/20 text-xs font-mono text-[#c5a880]">
                Calefaccionado a Leña
              </div>
            </div>

            <div className="lg:col-span-4 rounded-3xl p-6 sm:p-8 bg-[#14110d] border border-[#c5a880]/30 flex flex-col justify-between space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#c5a880]/20 pb-3">
                <span className="text-xs font-mono font-bold text-[#c5a880] uppercase tracking-wider">
                  04 / GASTRONOMÍA
                </span>
                <Flame className="w-4 h-4 text-[#c5a880]" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-serif text-[#FAF8F5]">Cocina de Fuegos</h3>
                <p className="text-xs text-stone-300 leading-relaxed font-light">
                  Menú por pasos a las brasas, panes de masa madre horneados en barro y desayunos de campo incluidos en tu estadía.
                </p>
              </div>

              <div className="pt-3 border-t border-[#c5a880]/20 text-xs font-mono text-[#c5a880]">
                Chef Ejecutivo AURA
              </div>
            </div>

            <div className="lg:col-span-12 rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#1c1710] via-[#120f0b] to-[#1c1710] border-2 border-[#c5a880]/50 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c5a880]/20 text-[#c5a880] font-mono text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  0% COMISIÓN • MEJOR TARIFA DIRECTA
                </div>
                <h3 className="text-2xl font-serif text-white">
                  Reserva Oficial con 15% de Ahorro Directo
                </h3>
                <p className="text-xs text-stone-300 max-w-xl font-light">
                  Confirmación inmediata de tu Suite en AURA con seña del 50% por transferencia bancaria directa (CBU) o Mercado Pago.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsCalendarOpen(true)}
                  className="min-h-[44px] px-5 py-3 rounded-2xl bg-stone-900 border border-stone-700 text-stone-200 hover:text-white text-xs font-mono cursor-pointer"
                >
                  📅 {checkInDate} al {checkOutDate} ({nights} noches)
                </button>
                <button
                  onClick={scrollToBooking}
                  className="min-h-[44px] px-8 py-3.5 rounded-2xl bg-[#c5a880] hover:bg-[#b8986d] text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#c5a880]/30 cursor-pointer"
                >
                  Ver Suites & Tarifas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODELO ESENCIAL 1: BAY                                                    */}
      {/* ========================================================================= */}
      {isBay && (
        <div className="space-y-0 animate-in fade-in duration-300 font-serif">
          <section className="relative min-h-[640px] lg:min-h-[720px] flex flex-col justify-between overflow-hidden bg-stone-950 text-white">
            <div className="absolute inset-0 z-0">
              <img
                src={selectedCabin?.imageUrl || '/catalinas/1dormA.jpg'}
                alt={guideData.propertyName}
                className="w-full h-full object-cover opacity-60 scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
            </div>

            <div className="relative z-10 p-6 sm:p-12 max-w-5xl mx-auto w-full text-center my-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs tracking-widest uppercase font-sans">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>RESERVAS OFICIALES SIN INTERMEDIARIOS</span>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif uppercase tracking-wider font-light text-white leading-tight">
                {guideData.propertyName || 'Casa Bay'}
              </h1>

              <p className="text-stone-300 max-w-2xl mx-auto font-sans font-light text-sm sm:text-base leading-relaxed">
                {guideData.tagline || 'Departamentos de categoría con equipamiento integral, acceso autónomo y atención personalizada.'}
              </p>

              <div className="pt-6 max-w-3xl mx-auto font-sans">
                <div className="p-4 sm:p-5 rounded-3xl bg-black/60 backdrop-blur-xl border border-white/15 shadow-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div
                    onClick={() => setIsCalendarOpen(true)}
                    className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 transition-colors cursor-pointer text-left border border-white/10"
                  >
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 block">Llegada / Salida</span>
                    <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                      <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
                      {checkInDate} → {checkOutDate}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/10 text-left border border-white/10">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 block">Huéspedes</span>
                    <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      {guestsCount} personas ({nights} noches)
                    </span>
                  </div>

                  <button
                    onClick={scrollToBooking}
                    className="min-h-[44px] py-3.5 px-6 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>Ver Tarifas</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODELO ESENCIAL 2: RETRATO                                                */}
      {/* ========================================================================= */}
      {isRetrato && (
        <div className="space-y-0 font-sans animate-in fade-in duration-300">
          <section className="relative min-h-[660px] lg:min-h-[740px] flex flex-col justify-between overflow-hidden bg-[#0c0e0d] text-[#EDE8DF]">
            <div className="absolute inset-0 z-0">
              <img
                src={selectedCabin?.imageUrl || '/catalinas/1dormC.jpg'}
                alt={guideData.propertyName}
                className="w-full h-full object-cover opacity-45 scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e0d] via-[#0c0e0d]/50 to-transparent" />
            </div>

            <div className="relative z-10 p-6 sm:p-14 max-w-5xl mx-auto w-full my-auto space-y-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase">
                  LA ARQUITECTURA SE ENCUENTRA CON EL SILENCIO
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-extralight tracking-tight text-white leading-tight">
                {guideData.propertyName || 'Retrato'}
              </h1>

              <p className="text-stone-400 max-w-xl text-sm sm:text-base font-light leading-relaxed">
                Espacios curados para vivir y trabajar con diseño sobrio y conexión natural.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  onClick={scrollToBooking}
                  className="min-h-[44px] px-8 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <span>Reservar Estadía</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsCalendarOpen(true)}
                  className="min-h-[44px] px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs border border-white/10 cursor-pointer"
                >
                  📅 Ver Fechas
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODELO ESENCIAL 3: URBANO BUENOS AIRES                                    */}
      {/* ========================================================================= */}
      {isUrbano && (
        <div className="space-y-0 font-sans animate-in fade-in duration-300">
          <section className="relative min-h-[640px] lg:min-h-[700px] flex flex-col justify-between overflow-hidden bg-white text-stone-900 rounded-[2.5rem] border-[8px] border-white shadow-2xl">
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src={urbanoHeroImage}
                alt="Buenos Aires Catalinas"
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </div>

            <div className="relative z-10 p-6 sm:p-12 max-w-5xl mx-auto w-full my-auto text-center space-y-5 text-white">
              <span className="px-4 py-1.5 rounded-full bg-amber-400 text-stone-950 font-mono font-black text-xs uppercase tracking-widest inline-block">
                BUENOS AIRES • ENCONTRÁ TU LUGAR
              </span>

              <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white">
                {guideData.propertyName || 'Urbano Buenos Aires'}
              </h1>

              <p className="text-stone-200 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
                Departamentos de alta gama en Catalinas y centro porteño para estadías ejecutivas y placer.
              </p>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={scrollToBooking}
                  className="min-h-[44px] px-8 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-amber-400/30 cursor-pointer"
                >
                  Reservar Ahora
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODELO SIGNATURE 3: AURA — HORIZONTAL ARCHITECTURAL CANVAS ($49 USD)      */}
      {/* ========================================================================= */}
      {isSigAuraHorizontal && (
        <div className="space-y-0 font-sans animate-in fade-in duration-500 bg-[#0a0907] text-[#EDE8DF]">
          {/* Top Canvas Header */}
          <div className="py-10 px-6 sm:px-12 max-w-7xl mx-auto border-b border-[#c5a880]/20 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#c5a880]/15 text-[#c5a880] border border-[#c5a880]/30 text-xs font-mono uppercase tracking-widest">
                <Crown className="w-3.5 h-3.5" />
                <span>HORIZONTAL ARCHITECTURAL CANVAS • 6 TARJETAS</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-serif font-light tracking-widest text-[#FAF8F5] uppercase">
                AURA
              </h1>
              <p className="text-xs sm:text-sm font-mono text-[#c5a880]/90">
                Relais & Viñedos de Montaña • Valle de Uco, Mendoza — Argentina
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div
                onClick={() => setIsCalendarOpen(true)}
                className="p-3 rounded-2xl bg-stone-900 border border-stone-800 text-left cursor-pointer hover:border-[#c5a880]/40 transition-colors"
              >
                <span className="text-[10px] font-mono text-[#c5a880] uppercase block font-bold">Fechas Seleccionadas</span>
                <span className="text-xs text-white font-bold flex items-center gap-1.5 mt-0.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#c5a880]" />
                  {checkInDate} al {checkOutDate} ({nights} n.)
                </span>
              </div>

              <button
                onClick={scrollToBooking}
                className="min-h-[44px] px-6 py-3 rounded-2xl bg-[#c5a880] hover:bg-[#b8986d] text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#c5a880]/20 cursor-pointer flex items-center gap-2"
              >
                <span>Reservar Suite</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Horizontal Scrollable Panoramic Canvas (6 Panoramic Architectural Cards) */}
          <div className="py-10 px-4 sm:px-10 overflow-x-auto no-scrollbar scroll-smooth">
            <div className="flex gap-6 min-w-max pb-4">
              
              {/* Card 1: Master View / Cordillera Landscape */}
              <div className="w-[340px] sm:w-[460px] h-[520px] rounded-3xl overflow-hidden border border-[#c5a880]/30 bg-[#12100d] relative flex flex-col justify-between p-6 sm:p-8 shadow-2xl group shrink-0">
                <img
                  src="/cabanas/cabana-terraza.jpg"
                  alt="AURA Terroir Landscape"
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0c09] via-[#0e0c09]/50 to-transparent" />
                
                <div className="relative z-10 flex items-center justify-between border-b border-[#c5a880]/20 pb-3">
                  <span className="text-xs font-mono font-bold text-[#c5a880] uppercase tracking-widest">
                    01 / PORTADA & PAISAJE
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#c5a880]/20 text-[#c5a880]">1.200 MSNM</span>
                </div>

                <div className="relative z-10 space-y-3">
                  <span className="text-xs font-mono text-[#c5a880] uppercase tracking-wider block">Valle de Uco • Mendoza</span>
                  <h3 className="text-2xl sm:text-3xl font-serif text-white leading-tight">
                    El Silencio de los Andes Entre Hileras de Malbec
                  </h3>
                  <p className="text-xs text-stone-300 font-light leading-relaxed">
                    Arquitectura minimalista en adobe, piedra y madera integrada orgánicamente a la Cordillera.
                  </p>
                </div>

                <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#c5a880]">
                  <span>4 Suites Exclusivas</span>
                  <span className="font-bold">Deslizar →</span>
                </div>
              </div>

              {/* Card 2: Suite 01 Malbec Grand Reserve */}
              <div className="w-[340px] sm:w-[460px] h-[520px] rounded-3xl overflow-hidden border border-[#c5a880]/30 bg-[#12100d] relative flex flex-col justify-between p-6 sm:p-8 shadow-2xl group shrink-0">
                <img
                  src="/cabanas/deck-hamaca.jpg"
                  alt="Suite Malbec Grand Reserve"
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0c09] via-[#0e0c09]/50 to-transparent" />

                <div className="relative z-10 flex items-center justify-between border-b border-[#c5a880]/20 pb-3">
                  <span className="text-xs font-mono font-bold text-[#c5a880] uppercase tracking-widest">
                    02 / SUITE DE VIÑA
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">SUITE 01</span>
                </div>

                <div className="relative z-10 space-y-3">
                  <h3 className="text-2xl sm:text-3xl font-serif text-white leading-tight">
                    Malbec Grand Reserve
                  </h3>
                  <p className="text-xs text-stone-300 font-light leading-relaxed">
                    Deck exterior suspendido sobre los viñedos, estufa nórdica a leña, copa de Malbec de bienvenida y telescopio astronómico.
                  </p>
                </div>

                <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-serif text-white">Tarifa: <strong>$180 USD</strong> / noche</span>
                  <button
                    onClick={scrollToBooking}
                    className="min-h-[38px] px-4 py-1.5 rounded-xl bg-[#c5a880] text-stone-950 font-bold text-xs uppercase cursor-pointer"
                  >
                    Seleccionar
                  </button>
                </div>
              </div>

              {/* Card 3: Suite 02 Cabernet Franc Sanctuary */}
              <div className="w-[340px] sm:w-[460px] h-[520px] rounded-3xl overflow-hidden border border-[#c5a880]/30 bg-[#12100d] relative flex flex-col justify-between p-6 sm:p-8 shadow-2xl group shrink-0">
                <img
                  src="/cabanas/cabana-interior.jpg"
                  alt="Suite Cabernet Franc"
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0c09] via-[#0e0c09]/50 to-transparent" />

                <div className="relative z-10 flex items-center justify-between border-b border-[#c5a880]/20 pb-3">
                  <span className="text-xs font-mono font-bold text-[#c5a880] uppercase tracking-widest">
                    03 / SUITE DE VIÑA
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">SUITE 02</span>
                </div>

                <div className="relative z-10 space-y-3">
                  <h3 className="text-2xl sm:text-3xl font-serif text-white leading-tight">
                    Cabernet Franc Sanctuary
                  </h3>
                  <p className="text-xs text-stone-300 font-light leading-relaxed">
                    Ventanales de 6 metros al Cordón del Plata, tina de piedra natural esculpida, lino egipcio 600 hilos y cava privada in-room.
                  </p>
                </div>

                <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-serif text-white">Tarifa: <strong>$195 USD</strong> / noche</span>
                  <button
                    onClick={scrollToBooking}
                    className="min-h-[38px] px-4 py-1.5 rounded-xl bg-[#c5a880] text-stone-950 font-bold text-xs uppercase cursor-pointer"
                  >
                    Seleccionar
                  </button>
                </div>
              </div>

              {/* Card 4: Cava Subterránea & Degustaciones */}
              <div className="w-[340px] sm:w-[460px] h-[520px] rounded-3xl overflow-hidden border border-[#c5a880]/30 bg-[#12100d] relative flex flex-col justify-between p-6 sm:p-8 shadow-2xl group shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1c160f] to-[#0a0907] opacity-90" />

                <div className="relative z-10 flex items-center justify-between border-b border-[#c5a880]/20 pb-3">
                  <span className="text-xs font-mono font-bold text-[#c5a880] uppercase tracking-widest">
                    04 / EXPERIENCIA ENOLÓGICA
                  </span>
                  <Wine className="w-4 h-4 text-[#c5a880]" />
                </div>

                <div className="relative z-10 space-y-3">
                  <h3 className="text-2xl sm:text-3xl font-serif text-white leading-tight">
                    Cava Subterránea & Maridaje Sunset
                  </h3>
                  <p className="text-xs text-stone-300 font-light leading-relaxed">
                    Acceso exclusivo para huéspedes a catas guiadas con sommelier in-house y selección de añadas históricas de bodegas boutique del Valle de Uco.
                  </p>
                </div>

                <div className="relative z-10 pt-4 border-t border-white/10 text-xs font-mono text-[#c5a880] flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Incluido para Huéspedes de AURA</span>
                </div>
              </div>

              {/* Card 5: Spa & Tina Nórdica */}
              <div className="w-[340px] sm:w-[460px] h-[520px] rounded-3xl overflow-hidden border border-[#c5a880]/30 bg-[#12100d] relative flex flex-col justify-between p-6 sm:p-8 shadow-2xl group shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#17140f] to-[#0a0907] opacity-90" />

                <div className="relative z-10 flex items-center justify-between border-b border-[#c5a880]/20 pb-3">
                  <span className="text-xs font-mono font-bold text-[#c5a880] uppercase tracking-widest">
                    05 / WELLNESS DE ALTURA
                  </span>
                  <Waves className="w-4 h-4 text-[#c5a880]" />
                </div>

                <div className="relative z-10 space-y-3">
                  <h3 className="text-2xl sm:text-3xl font-serif text-white leading-tight">
                    Tina Nórdica a Cielo Abierto
                  </h3>
                  <p className="text-xs text-stone-300 font-light leading-relaxed">
                    Sumersión en agua de deshielo calefaccionada a leña bajo las estrellas más nítidas de la Cordillera, con masajes de vinoterapia orgánica.
                  </p>
                </div>

                <div className="relative z-10 pt-4 border-t border-white/10 text-xs font-mono text-[#c5a880] flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Calefacción a Leña de Sarmientos</span>
                </div>
              </div>

              {/* Card 6: Reserva Directa Oficial & Concierge */}
              <div className="w-[340px] sm:w-[460px] h-[520px] rounded-3xl overflow-hidden border-2 border-[#c5a880] bg-gradient-to-br from-[#241c13] via-[#120f0b] to-[#241c13] relative flex flex-col justify-between p-6 sm:p-8 shadow-2xl shrink-0">
                <div className="flex items-center justify-between border-b border-[#c5a880]/40 pb-3">
                  <span className="text-xs font-mono font-black text-[#c5a880] uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#c5a880]" />
                    06 / RESERVA DIRECTA OFICIAL
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#c5a880] text-stone-950 font-bold">0% COMISIÓN</span>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl sm:text-3xl font-serif text-white leading-tight">
                    Garantía de Mejor Tarifa & Bienvenida Personalizada
                  </h3>
                  <p className="text-xs text-stone-300 font-light leading-relaxed">
                    Reservá directamente sin cargos de intermediarios. Recibí el portal móvil con clave Wi-Fi, mapa de acceso y atención de concierge in-house.
                  </p>
                </div>

                <div className="pt-4 border-t border-[#c5a880]/30 space-y-2">
                  <button
                    onClick={scrollToBooking}
                    className="w-full min-h-[44px] py-3.5 rounded-2xl bg-[#c5a880] hover:bg-[#b8986d] text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#c5a880]/30 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Completar Reserva Directa</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CATÁLOGO DE UNIDADES & MOTOR DE RESERVAS                                  */}
      {/* ========================================================================= */}
      <section id="booking-engine-section" className="py-16 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isSigAura ? 'text-[#c5a880]' : 'text-[#E1500A]'}`}>
              RESERVA DIRECTA OFICIAL
            </span>
            <h2 className="text-3xl font-black tracking-tight">
              {isSigAura ? 'Suites de Viña Disponibles en AURA' : 'Elegí tu unidad y calculá la tarifa al instante'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => {
              const isSelected = selectedCabinId === property.id;
              const discountedPrice = Math.round(property.basePrice * (1 - totalDiscountPercent / 100));

              return (
                <div
                  key={property.id}
                  onClick={() => setSelectedCabinId(property.id)}
                  className={`rounded-3xl overflow-hidden border p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                    isSelected
                      ? (isSigAura
                          ? 'bg-[#18140f] text-white border-[#c5a880] shadow-2xl ring-2 ring-[#c5a880]/30'
                          : 'bg-stone-900 text-white border-[#E1500A] shadow-2xl ring-2 ring-[#E1500A]/30')
                      : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-400'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="h-48 rounded-2xl overflow-hidden relative">
                      <img
                        src={property.imageUrl || '/catalinas/1dormA.jpg'}
                        alt={property.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-xs text-[10px] font-mono text-white font-bold">
                        {property.maxGuests} Huéspedes
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold">{property.name}</h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                        {property.bedrooms || 1} Dormitorio(s) • Climatización • Vista a Viñedos
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-stone-500 line-through">${property.basePrice}</span>
                      <div className={`text-xl font-black ${isSigAura ? 'text-[#c5a880]' : 'text-[#E1500A]'}`}>
                        ${discountedPrice} <span className="text-xs font-normal text-stone-400">USD/noche</span>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${
                      isSelected
                        ? (isSigAura ? 'bg-[#c5a880] text-stone-950 font-black' : 'bg-[#E1500A] text-white')
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                    }`}>
                      {isSelected ? 'Seleccionada' : 'Elegir'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumen de Reserva Directa */}
          <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-stone-900 text-white border border-stone-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div>
                <span className={`text-xs font-mono uppercase font-bold ${isSigAura ? 'text-[#c5a880]' : 'text-amber-400'}`}>
                  Resumen de Estadía
                </span>
                <h4 className="text-lg font-bold">{selectedCabin?.name}</h4>
              </div>
              <span className="text-xs font-mono text-stone-400">
                {nights} noches • {guestsCount} huéspedes
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-stone-300">
                <span>{nights} noches x ${pricePerNight} USD</span>
                <span>${rawTotal} USD</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Descuento Reserva Directa ({totalDiscountPercent}%)</span>
                <span>-${discountAmount} USD</span>
              </div>
              <div className="flex justify-between text-stone-300 pt-2 border-t border-stone-800 text-base font-bold text-white">
                <span>Total Final</span>
                <span className={isSigAura ? 'text-[#c5a880]' : 'text-[#E1500A]'}>${finalTotal} USD</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-800/80 text-stone-300 text-[11px] flex justify-between">
                <span>Seña 50% para confirmar:</span>
                <span className="font-bold text-white">${depositAmount} USD</span>
              </div>
            </div>

            {!bookingConfirmed ? (
              <form onSubmit={handleBook} className="space-y-3 pt-2">
                <input
                  type="text"
                  required
                  placeholder="Nombre y Apellido"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full text-xs px-4 py-3 rounded-xl border border-stone-700 bg-stone-800 text-white placeholder-stone-500"
                />
                <input
                  type="tel"
                  required
                  placeholder="WhatsApp / Teléfono Móvil"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full text-xs px-4 py-3 rounded-xl border border-stone-700 bg-stone-800 text-white placeholder-stone-500"
                />
                <button
                  type="submit"
                  className={`w-full min-h-[44px] py-3.5 rounded-2xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isSigAura
                      ? 'bg-[#c5a880] hover:bg-[#b8986d] text-stone-950 shadow-[#c5a880]/30'
                      : 'bg-[#E1500A] hover:bg-[#C94305] text-white shadow-[#E1500A]/30'
                  }`}
                >
                  <span>Solicitar Reserva Directa</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-center space-y-3">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-sm text-white">¡Solicitud Lista para Enviar!</h4>
                <p className="text-xs text-stone-300">
                  Tocá el botón abajo para abrir WhatsApp con todos los datos y recibir el alias bancario:
                </p>
                <a
                  href={`https://wa.me/?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold rounded-xl text-xs transition-colors shadow-md"
                >
                  📲 Enviar por WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pie de página */}
      <footer className="py-12 px-6 sm:px-12 text-center text-xs border-t bg-stone-950 border-stone-800 text-stone-400">
        <div className="max-w-4xl mx-auto space-y-3">
          <span className="font-bold text-sm text-white tracking-widest uppercase">
            {isSigAura ? 'AURA — Relais & Viñedos de Montaña' : guideData.propertyName}
          </span>
          <p className="text-stone-400 text-xs">
            Reservas directas sin intermediarios • {isSigAura ? 'Valle de Uco, Mendoza — Argentina' : (guideData.locationAddress || 'Buenos Aires, Argentina')}
          </p>
          <div className="text-[11px] text-stone-500">
            Desarrollado con Loomi Suite PMS & Motor de Reservas Directas
          </div>
        </div>
      </footer>
    </div>
  );
};
