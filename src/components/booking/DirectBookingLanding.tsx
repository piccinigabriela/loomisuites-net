import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar as CalendarIcon,
  Users,
  Check,
  CreditCard,
  Percent,
  Sparkles,
  ArrowRight,
  ArrowLeft,
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
import { SignatureTriptychLanding } from './SignatureTriptychLanding';

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
  | 'triptych'
  | 'luxury-monograph-folio'
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
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string; subtitle: string; tag: string } | null>(null);

  // Custom photos for Corte delle Vette / AURA
  const [cortePhotos, setCortePhotos] = useState<{
    suite1: string;
    bathroom: string;
    suite2: string;
    terrace: string;
    pool: string;
    cellar: string;
    sunset: string;
    facade: string;
  }>({
    suite1: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1600&auto=format&fit=crop',
    bathroom: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1600&auto=format&fit=crop',
    suite2: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1600&auto=format&fit=crop',
    terrace: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1600&auto=format&fit=crop',
    pool: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1600&auto=format&fit=crop',
    cellar: 'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?q=80&w=1600&auto=format&fit=crop',
    sunset: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=1600&auto=format&fit=crop',
    facade: '/entrada.jpeg',
  });
  const [editingPhotoKey, setEditingPhotoKey] = useState<string | null>(null);
  const [photoEditInput, setPhotoEditInput] = useState<string>('');

  // Ref for Canvas horizontal scroll container
  const canvasScrollRef = useRef<HTMLDivElement>(null);

  const scrollCanvas = (direction: 'left' | 'right') => {
    if (canvasScrollRef.current) {
      const scrollAmount = direction === 'left' ? -480 : 480;
      canvasScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const selectedCabin = properties.find((p) => p.id === selectedCabinId) || properties[0];

  // State to toggle/collapse simulator toolbar for 100% clean live website view (default false for pure website look)
  const [showSimulatorBar, setShowSimulatorBar] = useState<boolean>(false);

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
  const isTriptych = selectedTemplate === 'triptych';
  const isSigFolio = selectedTemplate === 'luxury-monograph-folio' || selectedTemplate === 'luxury-bento-grid';
  const isSigAuraBento = isSigFolio;
  const isSigAuraParallax = selectedTemplate === 'luxury-editorial-parallax';
  const isSigAuraHorizontal = selectedTemplate === 'luxury-horizontal-architectural';
  const isSigAura = isSigFolio || isSigAuraParallax || isSigAuraHorizontal || isTriptych;
  const isSignature = isSigAura;

  return (
    <div className={`w-full transition-all duration-300 relative ${
      isTriptych
        ? 'bg-[#0E1015] text-[#EDE7DE]'
        : isSigAuraParallax
        ? 'bg-[#EDE6DC] text-[#1D1A16]'
        : isSigFolio
        ? 'bg-[#F4EFE6] text-[#1D1A16]'
        : isSigAura
        ? 'bg-[#0e0c09] text-[#EDE8DF]'
        : isRetrato
        ? 'bg-[#0c0e0d] text-[#EFECE6]'
        : isUrbano
        ? 'bg-[#FAF7F2] p-2 sm:p-5 text-stone-900'
        : 'bg-[#FAF8F5] text-stone-900'
    }`}>
      {/* ========================================================================= */}
      {/* SELECTOR FLOTANTE ELEGANTE DE MODELOS (DOCK FLOTANTE CON ACCESO DIRECTO)   */}
      {/* ========================================================================= */}
      <div className="fixed top-3 sm:top-4 right-3 sm:right-6 z-50 font-sans pointer-events-auto">
        {showSimulatorBar ? (
          <div className="bg-[#181614]/90 backdrop-blur-xl border border-[#c5a880]/40 rounded-2xl p-2 sm:p-2.5 shadow-2xl flex items-center gap-2 text-xs text-stone-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Esenciales */}
            <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setSelectedTemplate('bay')}
                className={`px-2 py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer ${
                  isBay ? 'bg-amber-600 text-white font-bold shadow-xs' : 'text-stone-400 hover:text-white'
                }`}
                title="Modelo Bay (Incluido)"
              >
                🏛️ Bay
              </button>
              <button
                onClick={() => setSelectedTemplate('retrato')}
                className={`px-2 py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer ${
                  isRetrato ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-stone-400 hover:text-white'
                }`}
                title="Modelo Retrato (Incluido)"
              >
                🌲 Retrato
              </button>
              <button
                onClick={() => setSelectedTemplate('urbano')}
                className={`px-2 py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer ${
                  isUrbano ? 'bg-amber-400 text-stone-950 font-bold shadow-xs' : 'text-stone-400 hover:text-white'
                }`}
                title="Modelo Urbano (Incluido)"
              >
                🏙️ Urbano
              </button>
            </div>

            <span className="text-stone-600 text-xs select-none">|</span>

            {/* Signature Models */}
            <div className="flex items-center gap-1 bg-[#0F1826] p-1 rounded-xl border border-[#2A4468]">
              <button
                onClick={() => setSelectedTemplate('triptych')}
                className={`px-2.5 py-1 text-[11px] rounded-lg transition-all cursor-pointer flex items-center gap-1 font-serif italic ${
                  isTriptych ? 'bg-[#E5DACD] text-stone-950 font-bold shadow-xs' : 'text-[#D8CEBE] hover:text-white'
                }`}
                title="Dirección de Autor: Tríptico 3 Bandas"
              >
                <Crown className={`w-3 h-3 ${isTriptych ? 'text-stone-900' : 'text-[#D8CEBE]'}`} />
                <span>3 Bandas</span>
              </button>

              <button
                onClick={() => setSelectedTemplate('luxury-editorial-parallax')}
                className={`px-2.5 py-1 text-[11px] rounded-lg transition-all cursor-pointer flex items-center gap-1 font-serif italic ${
                  isSigAuraParallax ? 'bg-[#E5DACD] text-stone-950 font-bold shadow-xs' : 'text-[#D8CEBE] hover:text-white'
                }`}
                title="Dirección de Autor: Parallax Mineral (Corte delle Vette)"
              >
                <Crown className={`w-3 h-3 ${isSigAuraParallax ? 'text-stone-900' : 'text-[#D8CEBE]'}`} />
                <span>Parallax</span>
              </button>

              <button
                onClick={() => setSelectedTemplate('luxury-horizontal-architectural')}
                className={`px-2.5 py-1 text-[11px] rounded-lg transition-all cursor-pointer flex items-center gap-1 font-serif italic ${
                  isSigAuraHorizontal ? 'bg-[#E5DACD] text-stone-950 font-bold shadow-xs' : 'text-[#D8CEBE] hover:text-white'
                }`}
                title="Dirección de Autor: Canvas Horizontal"
              >
                <Crown className={`w-3 h-3 ${isSigAuraHorizontal ? 'text-stone-900' : 'text-[#D8CEBE]'}`} />
                <span>Canvas</span>
              </button>

              <button
                onClick={() => setSelectedTemplate('luxury-monograph-folio')}
                className={`px-2.5 py-1 text-[11px] rounded-lg transition-all cursor-pointer flex items-center gap-1 font-serif italic ${
                  isSigFolio ? 'bg-[#E5DACD] text-stone-950 font-bold shadow-xs' : 'text-[#D8CEBE] hover:text-white'
                }`}
                title="Dirección de Autor: Folio Monograph"
              >
                <Crown className={`w-3 h-3 ${isSigFolio ? 'text-stone-900' : 'text-[#D8CEBE]'}`} />
                <span>Folio</span>
              </button>
            </div>

            {/* Minimize button */}
            <button
              onClick={() => setShowSimulatorBar(false)}
              className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
              title="Minimizar selector"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Compact Floating Badge to Switch Designs */
          <button
            onClick={() => setShowSimulatorBar(true)}
            className="px-3 py-1.5 rounded-full bg-black/80 hover:bg-black text-[#c5a880] border border-[#c5a880]/50 text-xs font-mono backdrop-blur-md shadow-xl flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
            title="Cambiar plantilla de diseño web"
          >
            <Palette className="w-3.5 h-3.5 text-[#c5a880]" />
            <span className="font-sans font-medium text-[11px] text-stone-200">
              Diseño: <strong className="text-[#c5a880] uppercase">{isTriptych ? '3 Bandas' : isSigAuraParallax ? 'Parallax' : isSigFolio ? 'Folio Zen' : isSigAuraHorizontal ? 'Canvas' : selectedTemplate}</strong>
            </span>
            <span className="text-[10px] text-stone-400 ml-0.5">▼</span>
          </button>
        )}
      </div>

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
      {/* MODAL GLOBAL: LIGHTBOX EXPANDIDO DE FOTOS DE ALTA RESOLUCIÓN              */}
      {/* ========================================================================= */}
      {lightboxImage && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-12 right-0 sm:top-2 sm:right-2 z-20 w-11 h-11 rounded-full bg-black/80 text-white hover:bg-stone-800 border border-white/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-full max-h-[75vh] rounded-2xl overflow-hidden border border-[#c5a880]/40 shadow-2xl bg-black">
              <img
                src={lightboxImage.src}
                alt={lightboxImage.title}
                className="w-full h-full max-h-[75vh] object-contain mx-auto"
              />
            </div>

            <div className="w-full bg-[#14110d]/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-[#c5a880]/30 flex flex-wrap items-center justify-between gap-3 text-white">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#c5a880] font-bold block">
                  {lightboxImage.tag}
                </span>
                <h3 className="text-lg sm:text-xl font-serif text-white">{lightboxImage.title}</h3>
                <p className="text-xs text-stone-300 font-light mt-0.5">{lightboxImage.subtitle}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setLightboxImage(null);
                    scrollToBooking();
                  }}
                  className="min-h-[40px] px-6 py-2 rounded-xl bg-[#c5a880] hover:bg-[#b8986d] text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  Consultar Disponibilidad
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL: PERSONALIZAR / CAMBIAR FOTO DE CORTE DELLE VETTE                   */}
      {/* ========================================================================= */}
      {editingPhotoKey && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-sans"
          onClick={() => setEditingPhotoKey(null)}
        >
          <div
            className="relative w-full max-w-lg bg-[#14110d] text-white border border-[#c5a880]/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setEditingPhotoKey(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-900 text-stone-400 hover:text-white flex items-center justify-center border border-stone-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#c5a880]">
                GALERÍA CORTE DELLE VETTE
              </span>
              <h3 className="text-xl font-serif mt-1">Reemplazar Fotografía del Espacio</h3>
              <p className="text-xs text-stone-300 mt-1">
                Ingresá la URL de tu imagen o cargá un archivo desde tu dispositivo para actualizar este cuadro.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-stone-400 block mb-1.5">Pegar URL de Imagen:</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={photoEditInput}
                  onChange={(e) => setPhotoEditInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              <div className="text-center text-xs text-stone-500 font-mono">— O bien —</div>

              <div>
                <label className="w-full flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-stone-700 hover:border-[#c5a880] bg-stone-950/60 cursor-pointer transition-colors text-xs text-stone-300">
                  <Upload className="w-5 h-5 text-[#c5a880] mb-1" />
                  <span>Subir imagen desde tu computadora / celular</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result && editingPhotoKey) {
                            setCortePhotos((prev) => ({
                              ...prev,
                              [editingPhotoKey]: event.target?.result as string,
                            }));
                            setEditingPhotoKey(null);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-800 flex justify-end gap-3">
              <button
                onClick={() => setEditingPhotoKey(null)}
                className="px-4 py-2 rounded-xl bg-stone-900 text-stone-300 text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (photoEditInput.trim() && editingPhotoKey) {
                    setCortePhotos((prev) => ({
                      ...prev,
                      [editingPhotoKey]: photoEditInput.trim(),
                    }));
                    setEditingPhotoKey(null);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-[#c5a880] hover:bg-[#b8986d] text-stone-950 font-bold text-xs"
              >
                Guardar Foto
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODELO SIGNATURE TRÍPTICO: 3 BANDAS (OPCIÓN 1 Y 2 CONMUTABLES)            */}
      {/* ========================================================================= */}
      {isTriptych && (
        <SignatureTriptychLanding
          properties={properties}
          onOpenBookingModal={() => setIsCalendarOpen(true)}
          onSelectProperty={(prop) => {
            setSelectedCabinId(prop.id);
            setIsCalendarOpen(true);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* MODELO SIGNATURE 2: CORTE DELLE VETTE — EDITORIAL PARALLAX VERTICAL ($49) */}
      {/* ========================================================================= */}
      {isSigAuraParallax && (
        <div className="relative min-h-screen bg-[#EDE6DC] text-[#1D1A16] font-sans antialiased overflow-x-hidden selection:bg-[#c5a880] selection:text-white">
          
          {/* ===================================================================== */}
          {/* 1. FIXED BACKGROUND: WARM MINERAL TONE + WINERY WALL + GIANT TYPE     */}
          {/* ===================================================================== */}
          <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none bg-[#EDE6DC]">
            
            {/* Subtle Winery Wall Texture Overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-multiply transition-opacity duration-700"
              style={{
                backgroundImage: `url(${cortePhotos.facade || '/entrada.jpeg'})`,
              }}
            />

            {/* Subtle Fine Grain / Architectural Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#8C6D46_1px,transparent_1px)] [background-size:36px_36px] opacity-15" />

            {/* Fixed Editorial Header Meta (Like the LEON reference) */}
            <div className="absolute top-14 sm:top-16 left-6 right-6 sm:left-12 sm:right-12 flex items-center justify-between text-[11px] sm:text-xs font-serif tracking-[0.25em] text-[#2C2720] uppercase border-b border-[#2C2720]/15 pb-3">
              <span className="font-bold tracking-[0.3em]">CORTE DELLE VETTE</span>
              <span className="hidden sm:inline font-mono text-[10px] tracking-widest text-[#735D43]">VALLE DE UCO • 1.200 MSNM</span>
              <span className="font-mono text-[10px] tracking-widest">©2024—2026</span>
            </div>

            {/* Central Giant Typographic Composition (Direct Reference from image.png) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-8 z-10 w-full max-w-5xl mx-auto pointer-events-none">
              {/* Bronze Mountain Ridge Graphic */}
              <div className="w-16 h-10 text-[#8C6D46] opacity-80 mb-2 flex items-center justify-center">
                <svg viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
                  <path d="M5 35 L30 10 L50 25 L75 5 L95 35" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M30 10 L45 35" strokeLinecap="round" opacity="0.4" />
                  <path d="M75 5 L85 35" strokeLinecap="round" opacity="0.4" />
                </svg>
              </div>

              {/* Huge Editorial Serif Title - Fluid scaling guarantees all letters (including C) are 100% visible */}
              <h1 className="text-[clamp(2.1rem,6vw,5.8rem)] font-serif tracking-[0.02em] uppercase text-[#191612] leading-[0.92] font-normal select-none text-center max-w-full overflow-visible break-normal px-2">
                <span className="block tracking-[0.05em] whitespace-nowrap">CORTE DELLE</span>
                <span className="block tracking-[0.03em] whitespace-nowrap">VETTE</span>
              </h1>

              {/* Subtitle Line */}
              <p className="mt-3 sm:mt-5 text-xs sm:text-sm md:text-base font-serif italic text-[#6B573F] tracking-wider max-w-xl px-4">
                Boutique Winery & Suites — Mendoza
              </p>
            </div>

            {/* Fixed Bottom Left Label */}
            <div className="absolute bottom-6 left-6 sm:left-12 text-[10px] sm:text-[11px] font-mono tracking-widest text-[#5C4D3C] uppercase">
              VINO DE ALTURA • ARQUITECTURA MINERAL
            </div>

            {/* Fixed Bottom Right Scroll Cue */}
            <div className="absolute bottom-6 right-6 sm:right-12 flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#735D43] uppercase">
              <span>Desplazar para explorar</span>
              <span className="animate-bounce">↓</span>
            </div>
          </div>

          {/* Top Control Bar (Customize background or photos) */}
          <div className="relative z-20 max-w-6xl mx-auto pt-4 px-6 flex justify-end">
            <button
              onClick={() => {
                setEditingPhotoKey('facade');
                setPhotoEditInput(cortePhotos.facade);
              }}
              className="px-3.5 py-1.5 rounded-full bg-white/70 hover:bg-white text-[#2C2720] border border-[#2C2720]/20 text-[11px] font-mono flex items-center gap-1.5 backdrop-blur-md transition-all shadow-sm cursor-pointer"
              title="Cambiar foto de fondo o pared de la bodega"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#8C6D46]" />
              <span>Cambiar Foto de Fondo / Bodega</span>
            </button>
          </div>

          {/* ===================================================================== */}
          {/* 2. FOREGROUND SCROLLABLE FLOW OF FLOATING PHOTO CUTOUTS (REFERENCE)   */}
          {/* ===================================================================== */}
          <div className="relative z-10 pt-[25vh] pb-44 px-4 sm:px-12 max-w-6xl mx-auto min-h-[220vh] pointer-events-none">
            
            {/* ORGANIC ASYMMETRIC FLOATING CUTOUTS OVER & AROUND THE GIANT TYPOGRAPHY */}
            {[
              {
                id: 'suite1',
                key: 'suite1',
                tag: '01 / MASTER SUITE',
                title: 'Master Suite King & Cordillera',
                subtitle: 'Hormigón visto y lino puro',
                img: cortePhotos.suite1,
                // Positioned top-right, floating
                layoutStyle: 'ml-auto mr-2 sm:mr-8 md:mr-16 mt-0 w-[200px] sm:w-[260px] md:w-[290px]',
                aspectRatio: 'aspect-[4/3]',
              },
              {
                id: 'bathroom',
                key: 'bathroom',
                tag: '02 / BAÑO MINERAL',
                title: 'Tina de Piedra Natural',
                subtitle: 'Ventanal panorámico al viñedo',
                img: cortePhotos.bathroom,
                // Positioned top-left, floating
                layoutStyle: 'mr-auto ml-2 sm:ml-6 md:ml-12 mt-12 sm:mt-16 w-[180px] sm:w-[230px] md:w-[260px]',
                aspectRatio: 'aspect-[3/4]',
              },
              {
                id: 'suite2',
                key: 'suite2',
                tag: '03 / SUITE DOBLE',
                title: 'Suite Doble Panorámica',
                subtitle: 'Balcón y maderas cálidas',
                img: cortePhotos.suite2,
                // Overlapping center-left
                layoutStyle: 'mr-auto ml-4 sm:ml-20 md:ml-28 mt-20 sm:mt-28 w-[210px] sm:w-[270px] md:w-[310px]',
                aspectRatio: 'aspect-[16/10]',
              },
              {
                id: 'terrace',
                key: 'terrace',
                tag: '04 / TERRAZA',
                title: 'Terraza Privada & Fogonero',
                subtitle: 'Piscina de inmersión exterior',
                img: cortePhotos.terrace,
                // Floating center-right
                layoutStyle: 'ml-auto mr-4 sm:mr-16 md:mr-24 mt-16 sm:mt-24 w-[190px] sm:w-[250px] md:w-[280px]',
                aspectRatio: 'aspect-[4/3]',
              },
              {
                id: 'pool',
                key: 'pool',
                tag: '05 / PISCINA',
                title: 'Piscina Infinita',
                subtitle: 'Reflejo de los picos nevados',
                img: cortePhotos.pool,
                // Bottom center-left
                layoutStyle: 'mr-auto ml-6 sm:ml-14 md:ml-20 mt-20 sm:mt-32 w-[220px] sm:w-[280px] md:w-[320px]',
                aspectRatio: 'aspect-[16/10]',
              },
              {
                id: 'cellar',
                key: 'cellar',
                tag: '06 / CAVA',
                title: 'Cava de Guarda & Roble',
                subtitle: 'Barricas y degustación íntima',
                img: cortePhotos.cellar,
                // Bottom center-right
                layoutStyle: 'ml-auto mr-2 sm:mr-10 md:mr-18 mt-16 sm:mt-24 w-[190px] sm:w-[240px] md:w-[270px]',
                aspectRatio: 'aspect-[3/4]',
              },
              {
                id: 'sunset',
                key: 'sunset',
                tag: '07 / SUNSET',
                title: 'Degustación al Atardecer',
                subtitle: 'Sommelier y cocina de fuegos',
                img: cortePhotos.sunset,
                // Bottom right
                layoutStyle: 'ml-auto mr-8 sm:mr-24 md:mr-36 mt-20 sm:mt-32 w-[210px] sm:w-[270px] md:w-[300px]',
                aspectRatio: 'aspect-[4/3]',
              },
            ].map((frame, idx) => (
              <div
                key={frame.id}
                className={`pointer-events-auto transition-all duration-500 hover:scale-105 hover:z-40 ${frame.layoutStyle}`}
              >
                {/* Pure Floating Photographic Cutout (Inspired by Leon Dupuis Reference) */}
                <div
                  onClick={() => setLightboxImage({ src: frame.img, title: frame.title, subtitle: frame.subtitle, tag: frame.tag })}
                  className="relative rounded-lg sm:rounded-xl overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.15)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.25)] border border-[#2C2720]/10 group cursor-pointer transition-all duration-500 bg-stone-200"
                >
                  <div className={`relative w-full ${frame.aspectRatio} overflow-hidden`}>
                    <img
                      src={frame.img}
                      alt={frame.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 select-none"
                    />

                    {/* Subtle Edit Photo trigger on hover for owner */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPhotoKey(frame.key);
                        setPhotoEditInput(frame.img);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white text-stone-800 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer"
                      title="Cambiar foto de este espacio"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#8C6D46]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Bottom Closing Manifesto Box */}
            <div className="pointer-events-auto pt-28 pb-12 max-w-xl mx-auto text-center space-y-4">
              <div className="p-8 rounded-2xl bg-white/85 backdrop-blur-md border border-[#2C2720]/20 shadow-xl space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#8C6D46] font-bold block">
                  CORTE DELLE VETTE • MENDOZA
                </span>
                <h3 className="text-2xl font-serif text-[#191612]">
                  Experiencia Enológica en la Cordillera
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed font-light">
                  15 suites esculpidas en hormigón, piedra y madera noble sobre el propio viñedo. Reservá de forma directa con 0% de comisión y atención personalizada.
                </p>

                <div className="pt-2 flex justify-center">
                  <button
                    onClick={scrollToBooking}
                    className="min-h-[44px] px-8 py-3 rounded-xl bg-[#2C2720] hover:bg-black text-[#EDE6DC] font-serif font-bold text-xs uppercase tracking-widest transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Ver Fechas & Reservar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Sticky Floating Reservation Capsule */}
          <div className="fixed bottom-4 left-4 right-4 z-40 max-w-xl mx-auto pointer-events-auto font-sans">
            <div className="p-3 sm:p-3.5 rounded-2xl bg-[#191612]/95 backdrop-blur-xl border border-[#8C6D46]/40 shadow-2xl flex items-center justify-between gap-3 text-white">
              <div
                onClick={() => setIsCalendarOpen(true)}
                className="flex-1 cursor-pointer truncate"
              >
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#c5a880] block font-bold truncate">
                  Corte delle Vette • Reserva Directa
                </span>
                <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 truncate">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                  {checkInDate} al {checkOutDate} ({nights} nts)
                </span>
              </div>

              <button
                onClick={scrollToBooking}
                className="min-h-[38px] px-5 py-2 rounded-xl bg-[#c5a880] hover:bg-[#b8986d] text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shrink-0 cursor-pointer"
              >
                Reservar
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODELO SIGNATURE 1: FOLIO ZEN ARQUITECTÓNICO & MONOGRAPH ($49 USD)        */}
      {/* ========================================================================= */}
      {isSigFolio && (
        <div className="py-8 px-4 sm:px-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 font-sans text-[#1E1B18]">
          
          {/* 1. TOP PANORAMIC ATMOSPHERIC BANNER (SOFT INSTALLATION / LANDSCAPE PROPOSAL) */}
          <div className="relative rounded-3xl overflow-hidden border border-[#8C7E6A]/25 bg-[#EBE4D8] shadow-xl min-h-[320px] sm:min-h-[380px] flex flex-col justify-between p-6 sm:p-10">
            {/* Background Misty Mountain & Branch Art Overlay */}
            <div className="absolute inset-0 z-0">
              <img
                src={cortePhotos.facade || '/entrada.jpeg'}
                alt="Corte delle Vette Monograph"
                className="w-full h-full object-cover opacity-25 mix-blend-multiply scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#EBE4D8] via-[#EBE4D8]/80 to-transparent" />
              {/* Fine Rain / Silk grain lines overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(#5C4D3C_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
            </div>

            {/* Top Subtle Meta */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[#2C2720]/15 pb-4 text-xs font-serif tracking-[0.25em] text-[#4A3F33] uppercase">
              <span className="font-bold">SOFT INSTALLATION & ARCHITECTURAL PROPOSAL</span>
              <span className="font-mono text-[11px] tracking-widest text-[#735D43]">VALLE DE UCO • 1.200 MSNM</span>
              <span className="font-mono text-[11px]">©2024—2026</span>
            </div>

            {/* Central Poetic Title with Architectural Mark */}
            <div className="relative z-10 py-6 max-w-3xl space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-serif text-[#3A4D42] tracking-[0.25em] uppercase font-bold border-r border-[#8C6D46]/40 pr-3">
                  ARQUITECTURA & TERROIR
                </span>
                <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#8C6D46] font-bold">
                  CORTE DELLE VETTE • MONOGRAPH
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif tracking-tight text-[#191612] leading-[1.05] uppercase">
                Arquitectura Mineral y el Eco de los Andes
              </h1>

              <p className="text-xs sm:text-sm text-[#5C4D3C] font-light leading-relaxed max-w-2xl font-serif italic">
                Quince exclusivas suites esculpidas en hormigón, piedra y madera noble sobre el propio viñedo. Una experiencia enológica y contemplativa donde la Cordillera marca el ritmo.
              </p>
            </div>

            {/* Bottom Proposal Action */}
            <div className="relative z-10 pt-4 border-t border-[#2C2720]/15 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[#3A4D42]">
                <Sparkles className="w-4 h-4 text-[#8C6D46]" />
                <span>15 Suites de Autor • Cava Subterránea • Tina Mineral</span>
              </div>

              <button
                onClick={scrollToBooking}
                className="min-h-[42px] px-7 py-2.5 rounded-xl bg-[#1C2A24] hover:bg-[#121D18] text-[#F4EFE6] font-serif font-bold text-xs uppercase tracking-widest transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                <span>Consultar Disponibilidad</span>
                <ArrowRight className="w-4 h-4 text-[#c5a880]" />
              </button>
            </div>
          </div>

          {/* 2. THE CORE FOLIO ARCHITECTURAL GRID (HANGING LINES + DEEP PINE SILK RIBBON) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Main Content: Vertical Hanging Columns (9 cols) */}
            <div className="lg:col-span-9 bg-[#FAF7F2] rounded-3xl p-6 sm:p-10 border border-[#8C7E6A]/20 shadow-lg space-y-8">
              
              {/* Hanging Lines Header Section (Exact Inspiration from Reference Image) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-2 pb-6 border-b border-[#2C2720]/10">
                
                {/* Column 1: DESIGN / 01 SUITES */}
                <div className="space-y-3 relative pl-3 border-l-2 border-[#1C2A24]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-widest text-[#8C6D46] uppercase block font-bold">
                      PROGETTO
                    </span>
                    <span className="text-xs font-serif text-[#1C2A24] font-bold uppercase tracking-widest">01</span>
                  </div>
                  <h4 className="text-sm font-serif font-bold text-[#191612]">
                    Master Suites
                  </h4>
                  <p className="text-[11px] text-stone-600 leading-relaxed font-light">
                    Hormigón mineral, lino puro y ventanales panorámicos hacia el viñedo.
                  </p>
                </div>

                {/* Column 2: STRUCTURE / 02 BAÑOS */}
                <div className="space-y-3 relative pl-3 border-l-2 border-[#5C4D3C]/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-widest text-[#8C6D46] uppercase block font-bold">
                      MATERIA
                    </span>
                    <span className="text-xs font-serif text-[#5C4D3C] font-bold uppercase tracking-widest">02</span>
                  </div>
                  <h4 className="text-sm font-serif font-bold text-[#191612]">
                    Baño Mineral
                  </h4>
                  <p className="text-[11px] text-stone-600 leading-relaxed font-light">
                    Tina de piedra natural esculpida con vista al Cordón del Plata.
                  </p>
                </div>

                {/* Column 3: REFLECTION / 03 CAVA */}
                <div className="space-y-3 relative pl-3 border-l-2 border-[#1C2A24]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-widest text-[#8C6D46] uppercase block font-bold">
                      ENOLOGÍA
                    </span>
                    <span className="text-xs font-serif text-[#1C2A24] font-bold uppercase tracking-widest">03</span>
                  </div>
                  <h4 className="text-sm font-serif font-bold text-[#191612]">
                    Cava & Roble
                  </h4>
                  <p className="text-[11px] text-stone-600 leading-relaxed font-light">
                    Guarda en barricas y degustación guiada por sommelier in-house.
                  </p>
                </div>

                {/* Column 4: HARMONY / 04 TERRAZA */}
                <div className="space-y-3 relative pl-3 border-l-2 border-[#5C4D3C]/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-widest text-[#8C6D46] uppercase block font-bold">
                      ARMONÍA
                    </span>
                    <span className="text-xs font-serif text-[#5C4D3C] font-bold uppercase tracking-widest">04</span>
                  </div>
                  <h4 className="text-sm font-serif font-bold text-[#191612]">
                    Fuego & Sunset
                  </h4>
                  <p className="text-[11px] text-stone-600 leading-relaxed font-light">
                    Terraza con fogonero, piscina infinita y cocina a las brasas.
                  </p>
                </div>

              </div>

              {/* Photo Showcase Gallery Cards (Clean High-Res Architectural Displays) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* Photo 1: Master Suite */}
                <div
                  onClick={() => setLightboxImage({ src: cortePhotos.suite1, title: 'Master Suite King & Cordillera', subtitle: 'Hormigón visto y lino puro', tag: '01 / MASTER SUITE' })}
                  className="group relative rounded-2xl overflow-hidden bg-stone-200 border border-[#2C2720]/15 shadow-md cursor-pointer aspect-[16/10]"
                >
                  <img
                    src={cortePhotos.suite1}
                    alt="Master Suite"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                    <span className="text-[9px] font-mono tracking-widest uppercase text-[#c5a880]">01 / SUITE KING</span>
                    <h5 className="text-sm font-serif font-bold">Master Suite & Terraza Privada</h5>
                    <p className="text-[10px] text-stone-300 font-light">Cama King dressed in linen, estufa a leña y vistas panorámicas.</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingPhotoKey('suite1');
                      setPhotoEditInput(cortePhotos.suite1);
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-white text-stone-900 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    title="Cambiar foto"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#8C6D46]" />
                  </button>
                </div>

                {/* Photo 2: Baño Mineral */}
                <div
                  onClick={() => setLightboxImage({ src: cortePhotos.bathroom, title: 'Tina de Piedra Natural', subtitle: 'Ventanal panorámico al viñedo', tag: '02 / BAÑO MINERAL' })}
                  className="group relative rounded-2xl overflow-hidden bg-stone-200 border border-[#2C2720]/15 shadow-md cursor-pointer aspect-[16/10]"
                >
                  <img
                    src={cortePhotos.bathroom}
                    alt="Baño Mineral"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                    <span className="text-[9px] font-mono tracking-widest uppercase text-[#c5a880]">02 / BAÑO MINERAL</span>
                    <h5 className="text-sm font-serif font-bold">Tina de Inmersión Esculpida</h5>
                    <p className="text-[10px] text-stone-300 font-light">Piedra volcánica, sales aromáticas de uva y luz natural.</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingPhotoKey('bathroom');
                      setPhotoEditInput(cortePhotos.bathroom);
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-white text-stone-900 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    title="Cambiar foto"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#8C6D46]" />
                  </button>
                </div>

                {/* Photo 3: Cava de Roble */}
                <div
                  onClick={() => setLightboxImage({ src: cortePhotos.cellar, title: 'Cava de Guarda & Roble', subtitle: 'Barricas y degustación íntima', tag: '03 / CAVA' })}
                  className="group relative rounded-2xl overflow-hidden bg-stone-200 border border-[#2C2720]/15 shadow-md cursor-pointer aspect-[16/10]"
                >
                  <img
                    src={cortePhotos.cellar}
                    alt="Cava de Roble"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                    <span className="text-[9px] font-mono tracking-widest uppercase text-[#c5a880]">03 / EXPERIENCIA ENOLÓGICA</span>
                    <h5 className="text-sm font-serif font-bold">Cava Subterránea & Cata Privada</h5>
                    <p className="text-[10px] text-stone-300 font-light">Barricas de roble francés y etiquetas históricas con sommelier.</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingPhotoKey('cellar');
                      setPhotoEditInput(cortePhotos.cellar);
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-white text-stone-900 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    title="Cambiar foto"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#8C6D46]" />
                  </button>
                </div>

                {/* Photo 4: Degustación Sunset */}
                <div
                  onClick={() => setLightboxImage({ src: cortePhotos.sunset, title: 'Degustación al Atardecer', subtitle: 'Sommelier y cocina de fuegos', tag: '04 / SUNSET' })}
                  className="group relative rounded-2xl overflow-hidden bg-stone-200 border border-[#2C2720]/15 shadow-md cursor-pointer aspect-[16/10]"
                >
                  <img
                    src={cortePhotos.sunset}
                    alt="Sunset Tasting"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                    <span className="text-[9px] font-mono tracking-widest uppercase text-[#c5a880]">04 / SUNSET TASTING</span>
                    <h5 className="text-sm font-serif font-bold">Atardecer Frente a la Cordillera</h5>
                    <p className="text-[10px] text-stone-300 font-light">Copa de vino de altura, cocina de fuegos y cielo estrellado.</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingPhotoKey('sunset');
                      setPhotoEditInput(cortePhotos.sunset);
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-white text-stone-900 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    title="Cambiar foto"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#8C6D46]" />
                  </button>
                </div>

              </div>

            </div>

            {/* Right Column: Deep Pine Emerald Silk Textured Ribbon (3 cols) */}
            <div className="lg:col-span-3 rounded-3xl bg-[#16241D] text-[#EDE6DC] p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl relative overflow-hidden border border-[#2C4236]">
              {/* Woven Silk Grain Texture */}
              <div className="absolute inset-0 bg-[radial-gradient(#2E4A3B_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

              <div className="relative z-10 space-y-6">
                {/* Vertical Ribbon Title: SOMMARIO / INDICE */}
                <div className="flex items-center justify-between border-b border-[#2C4236] pb-4">
                  <div>
                    <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#c5a880] block font-bold">
                      SOMMARIO
                    </span>
                    <h3 className="text-xl font-serif text-white mt-0.5">
                      Catálogo & Suites
                    </h3>
                  </div>
                  <span className="text-xs font-mono tracking-widest text-[#8EA898] uppercase font-bold">ÍNDICE</span>
                </div>

                {/* Vertical Content Index */}
                <div className="space-y-4 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-black/25 border border-[#2C4236] space-y-1">
                    <span className="text-[9px] text-[#c5a880] uppercase tracking-wider block">01 / Master Suite King</span>
                    <p className="text-[11px] text-stone-200 font-sans">1 Cama King • 2 a 3 pax • Tina Mineral</p>
                    <span className="text-xs font-serif font-bold text-white block pt-1">$180 USD / noche</span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/25 border border-[#2C4236] space-y-1">
                    <span className="text-[9px] text-[#c5a880] uppercase tracking-wider block">02 / Suite Doble Panorámica</span>
                    <p className="text-[11px] text-stone-200 font-sans">Terraza privada & fogonero exterior</p>
                    <span className="text-xs font-serif font-bold text-white block pt-1">$195 USD / noche</span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/25 border border-[#2C4236] space-y-1">
                    <span className="text-[9px] text-[#c5a880] uppercase tracking-wider block">03 / Experiencias Incluidas</span>
                    <p className="text-[11px] text-stone-300 font-sans">Cata de barricas, desayuno de viña y acceso a piscina infinita.</p>
                  </div>
                </div>
              </div>

              {/* Direct Booking Call to Action */}
              <div className="relative z-10 pt-4 border-t border-[#2C4236] space-y-3">
                <div
                  onClick={() => setIsCalendarOpen(true)}
                  className="p-3 rounded-xl bg-black/40 border border-[#2C4236] cursor-pointer hover:border-[#c5a880]/50 transition-colors text-left"
                >
                  <span className="text-[9px] font-mono text-[#c5a880] uppercase block">Fechas de Estadía:</span>
                  <span className="text-xs text-white font-bold flex items-center gap-1.5 mt-0.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#c5a880]" />
                    {checkInDate} al {checkOutDate} ({nights} nts)
                  </span>
                </div>

                <button
                  onClick={scrollToBooking}
                  className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-[#c5a880] hover:bg-[#b8986d] text-stone-950 font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#c5a880]/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Reservar Suite Directa</span>
                  <ArrowRight className="w-4 h-4" />
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
              {/* Desktop Scroll Navigation Arrows */}
              <div className="flex items-center gap-1 bg-stone-900/80 border border-stone-800 p-1 rounded-2xl">
                <button
                  onClick={() => scrollCanvas('left')}
                  className="w-10 h-10 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Deslizar hacia la izquierda"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollCanvas('right')}
                  className="w-10 h-10 rounded-xl bg-[#c5a880] hover:bg-[#b8986d] text-stone-950 flex items-center justify-center transition-colors cursor-pointer font-bold shadow-sm"
                  title="Deslizar hacia la derecha"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

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
          <div
            ref={canvasScrollRef}
            onWheel={(e) => {
              if (canvasScrollRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                canvasScrollRef.current.scrollLeft += e.deltaY;
              }
            }}
            className="py-10 px-4 sm:px-10 overflow-x-auto no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing"
          >
            <div className="flex gap-6 min-w-max pb-4">
              
              {/* Card 1: Master View / Cordillera Landscape */}
              <div className="w-[340px] sm:w-[460px] h-[520px] rounded-3xl overflow-hidden border border-[#c5a880]/30 bg-[#12100d] relative flex flex-col justify-between p-6 sm:p-8 shadow-2xl group shrink-0">
                <img
                  src={cortePhotos.facade}
                  alt="AURA Terroir Landscape"
                  className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
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
                    Arquitectura mineral en hormigón, piedra y madera noble integrada orgánicamente a la Cordillera.
                  </p>
                </div>

                <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#c5a880]">
                  <span>15 Suites Exclusivas</span>
                  <span className="font-bold">Deslizar →</span>
                </div>
              </div>

              {/* Card 2: Suite 01 Malbec Grand Reserve */}
              <div className="w-[340px] sm:w-[460px] h-[520px] rounded-3xl overflow-hidden border border-[#c5a880]/30 bg-[#12100d] relative flex flex-col justify-between p-6 sm:p-8 shadow-2xl group shrink-0">
                <img
                  src={cortePhotos.suite1}
                  alt="Suite Malbec Grand Reserve"
                  className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0c09] via-[#0e0c09]/50 to-transparent" />

                <div className="relative z-10 flex items-center justify-between border-b border-[#c5a880]/20 pb-3">
                  <span className="text-xs font-mono font-bold text-[#c5a880] uppercase tracking-widest">
                    02 / MASTER SUITE
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
                  src={cortePhotos.bathroom}
                  alt="Suite Cabernet Franc"
                  className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0c09] via-[#0e0c09]/50 to-transparent" />

                <div className="relative z-10 flex items-center justify-between border-b border-[#c5a880]/20 pb-3">
                  <span className="text-xs font-mono font-bold text-[#c5a880] uppercase tracking-widest">
                    03 / BAÑO MINERAL & TINA
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">SUITE 02</span>
                </div>

                <div className="relative z-10 space-y-3">
                  <h3 className="text-2xl sm:text-3xl font-serif text-white leading-tight">
                    Cabernet Franc Sanctuary
                  </h3>
                  <p className="text-xs text-stone-300 font-light leading-relaxed">
                    Ventanales de 6 metros al Cordón del Plata, tina de piedra natural esculpida, lino puro y cava privada in-room.
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
                <img
                  src={cortePhotos.cellar}
                  alt="Cava Subterránea"
                  className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0c09] via-[#0e0c09]/50 to-transparent" />

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
                    Acceso exclusivo para huéspedes a catas guiadas con sommelier in-house y selección de añadas históricas de barricas de roble.
                  </p>
                </div>

                <div className="relative z-10 pt-4 border-t border-white/10 text-xs font-mono text-[#c5a880] flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Incluido para Huéspedes de Corte delle Vette</span>
                </div>
              </div>

              {/* Card 5: Spa & Tina Nórdica */}
              <div className="w-[340px] sm:w-[460px] h-[520px] rounded-3xl overflow-hidden border border-[#c5a880]/30 bg-[#12100d] relative flex flex-col justify-between p-6 sm:p-8 shadow-2xl group shrink-0">
                <img
                  src={cortePhotos.pool}
                  alt="Piscina Infinita"
                  className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0c09] via-[#0e0c09]/50 to-transparent" />

                <div className="relative z-10 flex items-center justify-between border-b border-[#c5a880]/20 pb-3">
                  <span className="text-xs font-mono font-bold text-[#c5a880] uppercase tracking-widest">
                    05 / WELLNESS DE ALTURA
                  </span>
                  <Waves className="w-4 h-4 text-[#c5a880]" />
                </div>

                <div className="relative z-10 space-y-3">
                  <h3 className="text-2xl sm:text-3xl font-serif text-white leading-tight">
                    Piscina Infinita & Solárium de Viña
                  </h3>
                  <p className="text-xs text-stone-300 font-light leading-relaxed">
                    Sumersión frente a la Cordillera de los Andes bajo las estrellas más nítidas de Mendoza, con servicio de coctelería y descanso.
                  </p>
                </div>

                <div className="relative z-10 pt-4 border-t border-white/10 text-xs font-mono text-[#c5a880] flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Agua Templada & Vista a Viñedos</span>
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
