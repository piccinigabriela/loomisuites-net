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

interface DirectBookingLandingProps {
  guideData: WelcomeGuideData;
  properties: Property[];
  activeTemplate?: LandingTemplate;
  onSelectTemplate?: (template: LandingTemplate) => void;
  onBackToPanel?: () => void;
}

export type LandingTemplate =
  | 'clara'
  | 'tierra'
  | 'sombra'
  | 'dos-aguas'
  | 'corte-vette'
  | 'medano-blanco'
  | 'bay'
  | 'retrato'
  | 'urbano';

export const DirectBookingLanding: React.FC<DirectBookingLandingProps> = ({
  guideData,
  properties,
  activeTemplate,
  onSelectTemplate,
  onBackToPanel,
}) => {
  // Safe exit handler to return back to panel without getting trapped
  const handleBackToPanel = () => {
    if (onBackToPanel) {
      onBackToPanel();
    } else {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('tab');
        url.searchParams.delete('view');
        url.searchParams.set('tab', 'overview');
        window.history.pushState({}, '', url.toString());
        window.dispatchEvent(new PopStateEvent('popstate'));
      } catch {
        window.location.href = '/?tab=overview';
      }
    }
  };
  // Visual template state (3 Modelos Oficiales de Loomi Suite)
  const [internalTemplate, setInternalTemplate] = useState<LandingTemplate>('dos-aguas');
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

  // Custom photos for Corte delle Vette
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
    `• Total con ${totalDiscountPercent}% descuento directo: USD ${finalTotal}\n` +
    `• Seña 50% (USD ${depositAmount}) a transferir a ${guideData.directBookingSettings?.bankAlias || 'AURA.MENDOZA'}\n` +
    `• Mi nombre: ${guestName || 'Huésped'} - Tel: ${guestPhone}`
  );

  // Template flags: 3 plantillas oficiales de Loomi Suite ("Clara", "Tierra", "Sombra")
  const isClara = selectedTemplate === 'clara' || selectedTemplate === 'dos-aguas' || selectedTemplate === 'retrato';
  const isTierra = selectedTemplate === 'tierra' || selectedTemplate === 'corte-vette' || (selectedTemplate as string) === 'triptych';
  const isSombra = selectedTemplate === 'sombra' || selectedTemplate === 'medano-blanco' || selectedTemplate === 'bay' || selectedTemplate === 'urbano';

  // Aliases for layout compatibility
  const isDosAguas = isClara;
  const isCorteVette = isTierra;
  const isMedanoBlanco = isSombra;

  return (
    <div className={`w-full transition-all duration-300 relative ${
      isCorteVette
        ? 'bg-[#EDE6DC] text-[#1D1A16]'
        : isDosAguas
        ? 'bg-[#0c0e0d] text-[#EFECE6]'
        : 'bg-[#FAF8F5] text-stone-900'
    }`}>
      {/* ========================================================================= */}
      {/* BOTÓN FLOTANTE FIJO DE SALIDA: VOLVER AL PANEL (SIEMPRE VISIBLE)          */}
      {/* ========================================================================= */}
      <div className="fixed top-14 sm:top-20 left-3 sm:left-6 z-30 font-sans pointer-events-auto">
        <button
          onClick={handleBackToPanel}
          className="bg-stone-900/95 hover:bg-black text-white px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold shadow-2xl border border-white/15 flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition-all hover:scale-105 active:scale-95 group"
          title="Volver al Panel de Control de Loomi Suite"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#E67E22] group-hover:-translate-x-0.5 transition-transform" />
          <span>Volver al Panel</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SELECTOR FLOTANTE ELEGANTE DE MODELOS (DOCK FLOTANTE DEBAJO DE BARRA TOP)  */}
      {/* ========================================================================= */}
      <div className="fixed top-14 sm:top-20 right-3 sm:right-6 z-30 font-sans pointer-events-auto flex items-center gap-2">
        {showSimulatorBar ? (
          <div className="bg-[#181614]/95 backdrop-blur-xl border border-stone-700/70 rounded-2xl p-2 sm:p-2.5 shadow-2xl flex items-center gap-2 text-xs text-stone-200 animate-in fade-in zoom-in-95 duration-200">
            <span className="text-[10px] font-mono text-stone-400 uppercase px-1 hidden sm:inline">Plantillas Base:</span>
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setSelectedTemplate('clara')}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  isClara ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-stone-300 hover:text-white'
                }`}
                title="Plantilla 1: Clara • Estructuras limpias, luz franca y geometría noble"
              >
                <span>☀️ Clara</span>
                <span className="text-[9px] opacity-75 font-light hidden md:inline">(Luz franca)</span>
              </button>
              <button
                onClick={() => setSelectedTemplate('tierra')}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  isTierra ? 'bg-[#9E3D31] text-white font-bold shadow-xs' : 'text-stone-300 hover:text-white'
                }`}
                title="Plantilla 2: Tierra • Texturas nobles, maderas, revoques cálidos e imperfección natural"
              >
                <span>🪵 Tierra</span>
                <span className="text-[9px] opacity-75 font-light hidden md:inline">(Maderas)</span>
              </button>
              <button
                onClick={() => setSelectedTemplate('sombra')}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSombra ? 'bg-amber-600 text-white font-bold shadow-xs' : 'text-stone-300 hover:text-white'
                }`}
                title="Plantilla 3: Sombra • Atmósfera íntima, maderas oscuras y penumbra elegante"
              >
                <span>🌑 Sombra</span>
                <span className="text-[9px] opacity-75 font-light hidden md:inline">(Íntima)</span>
              </button>
            </div>

            {/* Minimize button */}
            <button
              onClick={() => setShowSimulatorBar(false)}
              className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
              title="Minimizar selector"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Compact Floating Badge to Switch Designs */
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSimulatorBar(true)}
              className="px-3.5 py-2 rounded-full bg-black/90 hover:bg-black text-[#E67E22] border border-[#E67E22]/40 text-xs font-mono backdrop-blur-md shadow-xl flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
              title="Cambiar plantilla web base"
            >
              <Palette className="w-3.5 h-3.5 text-[#E67E22]" />
              <span className="font-sans font-medium text-[11px] text-white">
                {isClara ? '☀️ Clara' : isTierra ? '🪵 Tierra' : '🌑 Sombra'}
              </span>
              <span className="text-[10px] text-stone-300 ml-0.5">▼</span>
            </button>
          </div>
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
              accentColor={isCorteVette ? 'amber' : isDosAguas ? 'emerald' : 'amber'}
            />
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
      {/* MODELO 2: CORTE DELLE VETTE — BODEGA LODGE & SUITES                       */}
      {/* ========================================================================= */}
      {isCorteVette && (
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
      {/* MODELO 2: MÉDANO BLANCO (POSADA COSTERA)                                  */}
      {/* ========================================================================= */}
      {isMedanoBlanco && (
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
                <span>POSADA COSTERA • RESERVAS DIRECTAS OFICIALES</span>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif uppercase tracking-wider font-light text-white leading-tight">
                {guideData.propertyName || 'Médano Blanco'}
              </h1>

              <p className="text-stone-300 max-w-2xl mx-auto font-sans font-light text-sm sm:text-base leading-relaxed">
                {guideData.tagline || 'Suites luminosas frente al mar y dunas costeras con equipamiento integral, acceso autónomo y calidez boutique.'}
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
      {/* MODELO 3: REFUGIO DOS AGUAS (GLAMPING BOSQUE)                             */}
      {/* ========================================================================= */}
      {isDosAguas && (
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
                  GLAMPING & DOMOS EN EL BOSQUE • NATURALEZA VIRGEN
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-extralight tracking-tight text-white leading-tight">
                {guideData.propertyName || 'Refugio Dos Aguas'}
              </h1>

              <p className="text-stone-400 max-w-xl text-sm sm:text-base font-light leading-relaxed">
                Eco-cabañas y suites integradas entre el bosque nativo y arroyos de montaña para reconectar con diseño sobrio y silencio.
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
      {/* CATÁLOGO DE UNIDADES & MOTOR DE RESERVAS                                  */}
      {/* ========================================================================= */}
      <section id="booking-engine-section" className="py-16 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isCorteVette ? 'text-[#c5a880]' : isDosAguas ? 'text-emerald-500' : 'text-[#E1500A]'}`}>
              RESERVA DIRECTA OFICIAL
            </span>
            <h2 className="text-3xl font-black tracking-tight">
              {isCorteVette ? 'Suites de Viña & Bodega Lodge Disponibles' : isDosAguas ? 'Cabañas & Domos Disponibles en el Bosque' : 'Suites y Habitaciones Disponibles'}
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
                      ? (isCorteVette
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
                      <div className={`text-xl font-black ${isCorteVette ? 'text-[#c5a880]' : isDosAguas ? 'text-emerald-500' : 'text-[#E1500A]'}`}>
                        ${discountedPrice} <span className="text-xs font-normal text-stone-400">USD/noche</span>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${
                      isSelected
                        ? (isCorteVette ? 'bg-[#c5a880] text-stone-950 font-black' : 'bg-[#E1500A] text-white')
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
                <span className={`text-xs font-mono uppercase font-bold ${isCorteVette ? 'text-[#c5a880]' : 'text-amber-400'}`}>
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
                <span className={isCorteVette ? 'text-[#c5a880]' : isDosAguas ? 'text-emerald-500' : 'text-[#E1500A]'}>${finalTotal} USD</span>
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
                    isCorteVette
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
            {isCorteVette ? 'Corte delle Vette — Bodega Lodge & Suites' : isDosAguas ? 'Refugio Dos Aguas — Glamping & Bosque' : 'Médano Blanco — Posada Costera'}
          </span>
          <p className="text-stone-400 text-xs">
            Reservas directas sin intermediarios • {isCorteVette ? 'Valle de Uco, Mendoza — Argentina' : (guideData.locationAddress || 'Buenos Aires, Argentina')}
          </p>
          <div className="text-[11px] text-stone-500">
            Desarrollado con Loomi Suite PMS & Motor de Reservas Directas
          </div>
        </div>
      </footer>
    </div>
  );
};
