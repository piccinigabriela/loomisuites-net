import React, { useState, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  MessageCircle,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Play,
  ArrowRight,
  Check,
  RefreshCw,
  QrCode,
  Wallet,
} from 'lucide-react';

interface FeaturesCarouselProps {
  onOpenDemo: () => void;
  onOpenContact: (topic?: string) => void;
}

interface SlideItem {
  id: string;
  category: string;
  badge: string;
  title: string;
  subtitle: string;
  highlights: string[];
  mockupType: 'xenia' | 'calendar' | 'whatsapp' | 'housekeeping' | 'guide';
}

export const FeaturesCarousel: React.FC<FeaturesCarouselProps> = ({ onOpenDemo, onOpenContact }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const slides: SlideItem[] = [
    {
      id: 'xenia',
      category: 'ACOMPAÑAMIENTO HUMANO & TECNOLOGÍA',
      badge: 'Tu Copiloto Día a Día',
      title: 'No vas a estar solo: Xenia te guía en cada paso',
      subtitle:
        'Una asistente integrada con lenguaje cercano que responde tus dudas operativas, te enseña a configurar tu alojamiento y redacta mensajes para tus huéspedes sin tecnicismos.',
      highlights: [
        'Responde en español rioplatense al instante',
        'Te asiste en la carga de reservas y tarifas',
        'Consejos prácticos de hospitalidad real',
      ],
      mockupType: 'xenia',
    },
    {
      id: 'calendar',
      category: 'SINCRONIZACIÓN OFICIAL EN TIEMPO REAL',
      badge: 'Cero Overbooking',
      title: 'Calendarios conectados: Chau al miedo a la doble reserva',
      subtitle:
        'Sincronizá Airbnb, Booking.com, Vrbo y tus reservas directas. Cuando entra una reserva en cualquier portal, las fechas se bloquean automáticamente en todos los demás en 3 segundos.',
      highlights: [
        'Conexión iCal bidireccional incluida sin costos extras',
        'Rack visual interactivo de cabañas y departamentos',
        'Arrastrá reservas y cambiá fechas en un toque',
      ],
      mockupType: 'calendar',
    },
    {
      id: 'whatsapp',
      category: 'COMUNICACIÓN DIRECTA & BLINDAJE',
      badge: 'Contacto en 1 Clic',
      title: 'WhatsApp automático: Desactivá quejas antes de que nazcan',
      subtitle:
        'Coordinación de ruta en viajes largos, clave de Wi-Fi al llegar y control de confort a las 2 horas para solucionar cualquier detalle en privado antes de que se transforme en una mala reseña.',
      highlights: [
        '6 plantillas inteligentes que se rellenan solas',
        'Coordinación en ruta con ubicación en tiempo real',
        'Blindaje de 5 estrellas cuidando la estadía',
      ],
      mockupType: 'whatsapp',
    },
    {
      id: 'housekeeping',
      category: 'OPERACIONES & EQUIPO DE LIMPIEZA',
      badge: 'Enlace Móvil sin Claves',
      title: 'Mucamas organizadas: Tu equipo sabe qué preparar hoy',
      subtitle:
        'Tu personal de limpieza tiene su propio enlace en el celular con el listado del día, horarios de recambio urgente y checklist con fotos para que cada cabaña esté impecable a tiempo.',
      highlights: [
        'Semáforo claro: Limpia, Sucia o En Inspección',
        'Checklist de blancos, amenities y sanitización',
        'Prioridades automáticas según horarios de check-in',
      ],
      mockupType: 'housekeeping',
    },
    {
      id: 'guide',
      category: 'EXPERIENCIA DEL HUÉSPED & INGRESOS',
      badge: '0% Comisiones Directas',
      title: 'Guía digital sin apps y cobros directos en tu cuenta',
      subtitle:
        'Tus huéspedes escanean el QR en la cabaña para ver la clave Wi-Fi, mapa de cómo llegar, rotiserías y paseos. Cobrá señas por transferencia o Mercado Pago sin pagar comisiones a intermediarios.',
      highlights: [
        'Cero descargas: abre directo en cualquier celular',
        'Caja diaria y rendición mensual transparente',
        'Abono fijo accesible en pesos ajustado por IPC',
      ],
      mockupType: 'guide',
    },
  ];

  const totalSlides = slides.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) nextSlide();
    else if (distance < -50) prevSlide();
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const current = slides[currentSlide];

  return (
    <section className="py-12 md:py-20 bg-[#EFECE5] dark:bg-[#1A1A1A] text-[#222222] dark:text-[#EFECE5] border-y border-[#DCD8CE] dark:border-[#2D2D2D] transition-colors overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFFFF] dark:bg-[#252525] text-[#222222] dark:text-[#EFECE5] text-xs font-bold tracking-wider uppercase mb-3 border border-[#DCD8CE] dark:border-[#383838]">
            <Sparkles className="w-3.5 h-3.5 text-[#E1500A]" />
            <span>Todo tu complejo en 5 soluciones simples</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#222222] dark:text-[#FFFFFF] tracking-tight leading-tight">
            Diseñado para que gestionar tu alojamiento sea ágil, moderno y sin estrés
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#666666] dark:text-[#A3A3A3]">
            Deslizá para descubrir cómo resolvemos cada dolor operativo del día a día.
          </p>
        </div>

        {/* Carousel Showcase Card Container */}
        <div
          className="relative bg-[#FFFFFF] dark:bg-[#222222] rounded-[32px] p-5 sm:p-8 md:p-10 shadow-xl shadow-black/5 border border-[#DCD8CE] dark:border-[#383838] transition-all"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Category Kicker & Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#DCD8CE] dark:border-[#333333]">
            <span className="text-xs font-black tracking-widest text-[#E1500A] uppercase">
              {current.category}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#222222] dark:bg-[#333333] text-white text-xs font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#E1500A] inline-block animate-pulse" />
              {current.badge}
            </span>
          </div>

          {/* Visual Showcase Screen Frame */}
          <div className="my-6 md:my-8 bg-[#EFECE5] dark:bg-[#141414] rounded-[24px] p-4 sm:p-6 border border-[#DCD8CE] dark:border-[#2D2D2D] min-h-[300px] sm:min-h-[360px] flex items-center justify-center">
            {/* Slide 1: Xenia Copilot Showcase */}
            {current.mockupType === 'xenia' && (
              <div className="w-full max-w-lg mx-auto space-y-4">
                <div className="flex items-center gap-3.5 bg-white dark:bg-[#252525] p-4 rounded-2xl border border-[#DCD8CE] dark:border-[#383838] shadow-xs">
                  <div className="w-13 h-13 rounded-full overflow-hidden border-2 border-[#E1500A] shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=140&q=80"
                      alt="Xenia Asistente"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-[#222222] dark:text-[#FFFFFF] flex items-center gap-2">
                      <span>Xenia</span>
                      <span className="text-[10px] font-extrabold bg-[#222222] text-[#EFECE5] px-2 py-0.5 rounded-full">
                        🇦🇷 En línea para ayudarte
                      </span>
                    </h4>
                    <p className="text-xs text-[#666666] dark:text-[#A3A3A3]">Copiloto inteligente de Loomi Suite</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#252525] p-4 sm:p-5 rounded-2xl border border-[#DCD8CE] dark:border-[#383838] shadow-xs space-y-3">
                  <p className="text-xs sm:text-sm text-[#222222] dark:text-[#EFECE5] leading-relaxed">
                    «¡Hola! No te preocupes si nunca usaste un sistema. Yo te enseño a cargar tus cabañas, sincronizar con Airbnb y coordinar tus llegadas en menos de cinco minutos.»
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#DCD8CE] dark:border-[#333333] text-[11px] text-[#666666] dark:text-[#A3A3A3] font-semibold">
                    <span className="inline-flex items-center gap-1">🎙️ Podés hablarle por voz</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">✨ Respuestas paso a paso</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">❤️ Siempre con vos</span>
                  </div>
                </div>
              </div>
            )}

            {/* Slide 2: Central Calendar Rack */}
            {current.mockupType === 'calendar' && (
              <div className="w-full max-w-xl mx-auto space-y-3">
                <div className="flex items-center justify-between text-xs text-[#666666] dark:text-[#A3A3A3] px-1 font-bold">
                  <span className="text-[#222222] dark:text-[#FFFFFF]">Rack de Ocupación en Tiempo Real</span>
                  <span className="text-[#222222] dark:text-[#EFECE5] flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin text-[#E1500A]" /> Airbnb & Booking Conectados
                  </span>
                </div>

                {/* Calendar Rack Grid Simulation */}
                <div className="bg-white dark:bg-[#252525] rounded-2xl border border-[#DCD8CE] dark:border-[#383838] p-3 shadow-xs space-y-2.5 font-sans">
                  {/* Row 1: Cabaña 1 */}
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-[11px] font-extrabold text-[#222222] dark:text-[#FFFFFF] truncate">
                      Cabaña del Bosque
                    </span>
                    <div className="flex-1 h-7 rounded-lg bg-[#E1500A] text-white flex items-center px-2.5 text-[11px] font-bold shadow-2xs">
                      🏡 Martín Soria (Directo • $90.000)
                    </div>
                  </div>

                  {/* Row 2: Cabaña 2 */}
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-[11px] font-extrabold text-[#222222] dark:text-[#FFFFFF] truncate">
                      Cabaña del Río
                    </span>
                    <div className="flex-1 h-7 rounded-lg bg-[#222222] text-white flex items-center px-2.5 text-[11px] font-bold shadow-2xs">
                      🔵 Booking.com (Sincronizado iCal)
                    </div>
                  </div>

                  {/* Row 3: Domo Glamping */}
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-[11px] font-extrabold text-[#222222] dark:text-[#FFFFFF] truncate">
                      Domo Las Sierras
                    </span>
                    <div className="flex-1 h-7 rounded-lg bg-[#E1500A] text-white flex items-center px-2.5 text-[11px] font-extrabold shadow-2xs">
                      🔴 Airbnb (Confirmado • Check-in hoy)
                    </div>
                  </div>
                </div>

                <p className="text-center text-[11px] text-[#666666] dark:text-[#A3A3A3] font-medium">
                  👉 Si entra una reserva en Airbnb, el Domo se bloquea en Booking y en tu web en 3 segundos.
                </p>
              </div>
            )}

            {/* Slide 3: WhatsApp Pre Check-in */}
            {current.mockupType === 'whatsapp' && (
              <div className="w-full max-w-md mx-auto space-y-3 font-sans">
                <div className="bg-[#222222] text-[#FFFFFF] p-3.5 rounded-t-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#E1500A] text-white flex items-center justify-center font-bold">
                      W
                    </div>
                    <span className="font-bold">WhatsApp Huésped • Cabañas Catalinas</span>
                  </div>
                  <span className="text-[10px] bg-[#E1500A] text-white px-2 py-0.5 rounded font-black">Envío en 1 Clic</span>
                </div>

                <div className="bg-[#EFECE5] dark:bg-[#252525] p-4 rounded-b-2xl space-y-3 text-xs border border-[#DCD8CE] dark:border-[#383838]">
                  <div className="bg-white dark:bg-[#1E1E1E] text-[#222222] dark:text-[#EFECE5] p-3 rounded-xl rounded-tr-none shadow-2xs leading-relaxed border border-[#DCD8CE] dark:border-[#333333]">
                    <p className="font-extrabold mb-1 text-[#E1500A]">🚗 Coordinación en Ruta:</p>
                    <p>
                      «¡Hola Laura! Esperamos que tengan un lindo viaje hacia Cabañas Catalinas. Avísennos cuando estén a unos 40 minutos de llegar así les esperamos con las luces prendidas y la cabaña templada.»
                    </p>
                  </div>

                  <div className="bg-white dark:bg-[#1E1E1E] text-[#222222] dark:text-[#EFECE5] p-3 rounded-xl rounded-tl-none shadow-2xs leading-relaxed border border-[#DCD8CE] dark:border-[#333333]">
                    <p className="font-extrabold mb-1 text-[#222222] dark:text-[#FFFFFF]">🛡️ Control de Confort (2hs Post-Ingreso):</p>
                    <p>
                      «Esperamos que ya estén acomodados y descansando. Les escribo para consultarles si encontraron todo impecable y si necesitan algo en especial.»
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Slide 4: Housekeeping Checklist */}
            {current.mockupType === 'housekeeping' && (
              <div className="w-full max-w-md mx-auto space-y-3 font-sans">
                <div className="bg-white dark:bg-[#252525] p-4 rounded-2xl border border-[#DCD8CE] dark:border-[#383838] shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black text-[#E1500A] uppercase tracking-wider block">
                        Agenda del Personal • Hoy
                      </span>
                      <h4 className="text-sm font-extrabold text-[#222222] dark:text-[#FFFFFF]">
                        Cabaña 3 • Recambio Prioritario
                      </h4>
                    </div>
                    <span className="text-[11px] font-extrabold bg-[#222222] text-[#EFECE5] px-2.5 py-1 rounded-full">
                      Sale 10:30 • Entra 14:00
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-[#222222] dark:text-[#E8ECF2]">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-[#EFECE5] dark:bg-[#1A1A1A]">
                      <Check className="w-4 h-4 text-[#E1500A]" />
                      <span>Cambio de ropa blanca y toallas limpias</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-[#EFECE5] dark:bg-[#1A1A1A]">
                      <Check className="w-4 h-4 text-[#E1500A]" />
                      <span>Sanitización de baños y amenities</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-[#EFECE5] dark:bg-[#1A1A1A]">
                      <div className="w-4 h-4 rounded border border-[#E1500A] flex items-center justify-center text-[10px] font-bold text-[#E1500A]">
                        ...
                      </div>
                      <span>Verificación de cerradura y foto final</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Slide 5: Welcome Guide & Direct Earnings */}
            {current.mockupType === 'guide' && (
              <div className="w-full max-w-md mx-auto space-y-3 font-sans">
                <div className="bg-white dark:bg-[#252525] p-4 rounded-2xl border border-[#DCD8CE] dark:border-[#383838] shadow-xs space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#222222] text-[#E1500A] flex items-center justify-center">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-[#222222] dark:text-[#FFFFFF]">
                        Guía Digital en el Celular del Huésped
                      </h4>
                      <p className="text-xs text-[#666666] dark:text-[#A3A3A3]">Cero descargas: abre directo por QR o WhatsApp</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#EFECE5] dark:bg-[#1A1A1A] border border-[#DCD8CE] dark:border-[#333333]">
                      <span className="text-[10px] text-[#666666] dark:text-[#A3A3A3] block">Red Wi-Fi</span>
                      <strong className="text-xs text-[#222222] dark:text-[#FFFFFF]">Catalinas_5G</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#EFECE5] dark:bg-[#1A1A1A] border border-[#DCD8CE] dark:border-[#333333]">
                      <span className="text-[10px] text-[#666666] dark:text-[#A3A3A3] block">Clave Wi-Fi</span>
                      <strong className="text-xs text-[#222222] dark:text-[#FFFFFF]">Vacaciones2026</strong>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#222222] text-[#FFFFFF] text-xs flex items-center justify-between">
                    <span className="font-extrabold flex items-center gap-1.5 text-white">
                      <Wallet className="w-4 h-4 text-[#E1500A]" /> Cobros 100% Directos:
                    </span>
                    <span className="text-xs font-black text-[#E1500A]">0% de comisión</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Slide Description & Value Pitch */}
          <div className="space-y-4">
            <h3 className="text-xl sm:text-2xl font-black text-[#222222] dark:text-[#FFFFFF]">
              {current.title}
            </h3>
            <p className="text-sm sm:text-base text-[#666666] dark:text-[#A3A3A3] leading-relaxed">
              {current.subtitle}
            </p>

            {/* Quick check tags */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {current.highlights.map((h, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EFECE5] dark:bg-[#282828] border border-[#DCD8CE] dark:border-[#383838] text-xs font-bold text-[#222222] dark:text-[#EFECE5]"
                >
                  <Check className="w-3.5 h-3.5 text-[#E1500A]" />
                  <span>{h}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Controls: Prev / Next + Dots Navigation */}
          <div className="mt-8 pt-6 border-t border-[#DCD8CE] dark:border-[#333333] flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Arrows & Slide Dots */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Diapositiva anterior"
                className="w-10 h-10 rounded-full bg-[#EFECE5] hover:bg-[#DCD8CE] dark:bg-[#282828] dark:hover:bg-[#333333] text-[#222222] dark:text-[#FFFFFF] border border-[#DCD8CE] dark:border-[#383838] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Progress Dots */}
              <div className="flex items-center gap-1.5 px-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Ir a la diapositiva ${idx + 1}`}
                    className={`h-2 transition-all rounded-full cursor-pointer ${
                      currentSlide === idx
                        ? 'w-8 bg-[#E1500A]'
                        : 'w-2 bg-[#DCD8CE] dark:bg-[#383838] hover:bg-[#E1500A]'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={nextSlide}
                aria-label="Siguiente diapositiva"
                className="w-10 h-10 rounded-full bg-[#EFECE5] hover:bg-[#DCD8CE] dark:bg-[#282828] dark:hover:bg-[#333333] text-[#222222] dark:text-[#FFFFFF] border border-[#DCD8CE] dark:border-[#383838] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Helper Hint */}
            <span className="text-xs text-[#666666] dark:text-[#A3A3A3] font-medium hidden sm:inline">
              ← Deslizá o tocá las flechas para ver las 5 soluciones →
            </span>

            {/* Direct CTA */}
            <button
              onClick={onOpenDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#E1500A] hover:bg-[#C94305] text-white text-xs font-black transition-all shadow-md shadow-[#E1500A]/25 cursor-pointer active:scale-98"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Probar Demo en Vivo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Value Card */}
        <div className="mt-6 bg-[#FFFFFF] dark:bg-[#222222] rounded-3xl p-5 border border-[#DCD8CE] dark:border-[#383838] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EFECE5] dark:bg-[#1A1A1A] border border-[#DCD8CE] dark:border-[#383838] flex items-center justify-center text-lg shrink-0 text-[#E1500A]">
              🔑
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-[#222222] dark:text-[#FFFFFF]">
                Abono fijo en pesos argentinos (ARS) con ajuste por IPC
              </h4>
              <p className="text-xs text-[#666666] dark:text-[#A3A3A3]">
                Desde $45.000 / mes para 4 a 10 unidades. Se paga con media noche de alquiler al mes.
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenContact('Plan de precios')}
            className="text-xs font-extrabold text-[#E1500A] hover:text-[#C94305] underline underline-offset-4 cursor-pointer"
          >
            Consultar por tu complejo →
          </button>
        </div>
      </div>
    </section>
  );
};
