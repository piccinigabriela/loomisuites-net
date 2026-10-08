import React, { useState } from 'react';
import {
  HelpCircle,
  Building2,
  Calendar,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Play,
  Smartphone,
  CreditCard,
  Clock,
  Home,
  Layers,
  Zap,
  Users,
  Coins,
  TrendingUp,
  Check,
  KeyRound,
  Coffee,
  PlusCircle,
  Flower2,
  Wine,
  Globe,
  Tent,
  BedDouble,
} from 'lucide-react';

interface QuestionsHubProps {
  onOpenDemo: () => void;
  onOpenContact: (planOrTopic?: string) => void;
}

type QuestionId = 'que-hacemos' | 'es-para-vos' | 'que-resuelve' | 'precios';

export const QuestionsHub: React.FC<QuestionsHubProps> = ({ onOpenDemo, onOpenContact }) => {
  const [activeQuestion, setActiveQuestion] = useState<QuestionId>('que-hacemos');

  const selectQuestion = (q: QuestionId) => {
    setActiveQuestion(q);
    // On mobile or smaller screens, smoothly scroll directly to the answer box so the user sees it immediately
    const answerEl = document.getElementById('respuesta-detalle');
    if (answerEl) {
      const yOffset = -80; // Account for fixed navbar
      const y = answerEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };
  const [selectedPropertyProfile, setSelectedPropertyProfile] = useState<'cabanas' | 'deptos' | 'posadas' | 'glamping'>('deptos');

  // All plans include the exact SAME 100% complete system features
  const commonFeatures = [
    'Sincronización instantánea Airbnb, Booking y portales',
    'Calendario único centralizado en tiempo real',
    'Asistente Xenia IA para WhatsApp 24/7 (check-in, wifi, dudas)',
    'Módulo móvil para personal de limpieza con checklist',
    'Motor propio para reservas y cobros directos',
    'Guía digital interactiva de bienvenida para huéspedes',
    'Reportes de cobros, señas y liquidaciones para dueños',
    'Acompañamiento humano en la puesta en marcha'
  ];

  const [userNightRateArs, setUserNightRateArs] = useState<number | string>(60000); // Default $60.000 ARS/night

  const plans = [
    {
      id: 'plan-simple',
      name: 'Loomi',
      range: 'Hasta 5 unidades • Complejo entero',
      priceMonthly: 45000,
      description: 'Enfocado en dueños de 4 o 5 cabañas sin personal. Calendario modo light y reservas.',
      popular: false,
      badge: 'Plan Propietario',
      includedFeatures: [
        'Calendario Rack (Modo Light optimizado para móvil)',
        'Gestión de Reservas Directas & iCal',
        'Reportes de Rendimiento Básicos',
        'Precio fijo por complejo entero (sin cobro por habitación)',
      ],
      excludedFeatures: [
        'Módulo Housekeeping (Mucamas / Mantenimiento)',
        'Modo Recepción Multiusuario',
      ]
    },
    {
      id: 'plan-suite',
      name: 'Loomi Suite',
      range: 'Unidades Ilimitadas • Complejo entero',
      priceMonthly: 60000,
      description: 'Todo el ecosistema ilimitado para complejos con recepción y equipos de limpieza.',
      popular: true,
      badge: 'Recomendado',
      includedFeatures: [
        'Todo lo del Plan Loomi e iCal avanzado',
        'Módulo Housekeeping Completo (Semáforo de Mucamas en vivo)',
        'Modo Recepción con Roles de Usuario Separados',
        'Asistente Xenia AI (Voz & Copiloto 24/7)',
        'Web propia con Portal de Bienvenida del Huésped',
      ],
      excludedFeatures: []
    }
  ];

  return (
    <section id="preguntas-clave" className="py-12 md:py-20 bg-[#EFECE5] dark:bg-[#1A1A1A] border-y border-[#DCD8CE] dark:border-[#2D2D2D] text-[#222222] dark:text-[#EFECE5] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header: Direct & Honest to the Lead */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFFFF] dark:bg-[#252525] border border-[#DCD8CE] dark:border-[#383838] text-[#222222] dark:text-[#EFECE5] text-xs font-bold mb-3 shadow-2xs">
            <HelpCircle className="w-3.5 h-3.5 text-[#E1500A]" />
            <span>Respuestas claras y al grano</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#222222] dark:text-[#FFFFFF] tracking-tight">
            Todo lo que querés saber antes de decidir
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#666666] dark:text-[#A3A3A3]">
            Sin rodeos, sin planillas eternas y con precios a la vista en pesos. Elegí la pregunta que tenés en mente:
          </p>
        </div>

        {/* 4 Cards Grid - Directed to the Lead */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          {/* Card 1: ¿Qué hacemos? */}
          <button
            onClick={() => selectQuestion('que-hacemos')}
            className={`text-left p-6 rounded-[24px] border transition-all cursor-pointer relative flex flex-col justify-between ${
              activeQuestion === 'que-hacemos'
                ? 'bg-white dark:bg-[#222222] border-[#E1500A] shadow-xl shadow-[#E1500A]/10 ring-2 ring-[#E1500A]/20'
                : 'bg-white/90 dark:bg-[#222222]/90 border-[#DCD8CE] dark:border-[#383838] hover:border-[#E1500A]/60 hover:bg-white dark:hover:bg-[#222222]'
            }`}
          >
            <div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base mb-3 transition-colors ${
                activeQuestion === 'que-hacemos'
                  ? 'bg-[#E1500A] text-white'
                  : 'bg-[#222222] text-[#EFECE5]'
              }`}>
                1
              </div>
              <h3 className="text-base font-extrabold text-[#222222] dark:text-[#FFFFFF]">
                ¿Qué hacemos?
              </h3>
              <p className="text-xs text-[#666666] dark:text-[#A3A3A3] mt-1.5 leading-relaxed">
                Centralizamos tus reservas, cobros, limpieza y WhatsApp en un solo lugar fácil de usar.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-black text-[#E1500A]">
              <span>{activeQuestion === 'que-hacemos' ? 'Viendo detalle' : 'Ver respuesta'}</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </button>

          {/* Card 2: ¿Esto es para vos? */}
          <button
            onClick={() => selectQuestion('es-para-vos')}
            className={`text-left p-6 rounded-[24px] border transition-all cursor-pointer relative flex flex-col justify-between ${
              activeQuestion === 'es-para-vos'
                ? 'bg-white dark:bg-[#222222] border-[#222222] dark:border-[#E1500A] shadow-xl shadow-black/10 ring-2 ring-[#222222]/20 dark:ring-[#E1500A]/20'
                : 'bg-white/90 dark:bg-[#222222]/90 border-[#DCD8CE] dark:border-[#383838] hover:border-[#222222]/60 hover:bg-white dark:hover:bg-[#222222]'
            }`}
          >
            <div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base mb-3 transition-colors ${
                activeQuestion === 'es-para-vos'
                  ? 'bg-[#222222] text-[#EFECE5] dark:bg-[#E1500A] dark:text-white'
                  : 'bg-[#EFECE5] text-[#222222] dark:bg-[#333333] dark:text-[#EFECE5]'
              }`}>
                2
              </div>
              <h3 className="text-base font-extrabold text-[#222222] dark:text-[#FFFFFF]">
                ¿Esto es para vos?
              </h3>
              <p className="text-xs text-[#666666] dark:text-[#A3A3A3] mt-1.5 leading-relaxed">
                Si administrás desde 4 hasta 30+ cabañas o departamentos y querés orden real.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-black text-[#222222] dark:text-[#EFECE5]">
              <span>{activeQuestion === 'es-para-vos' ? 'Viendo detalle' : 'Ver respuesta'}</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </button>

          {/* Card 3: ¿Qué problema te resuelve? */}
          <button
            onClick={() => selectQuestion('que-resuelve')}
            className={`text-left p-6 rounded-[24px] border transition-all cursor-pointer relative flex flex-col justify-between ${
              activeQuestion === 'que-resuelve'
                ? 'bg-white dark:bg-[#222222] border-[#E1500A] shadow-xl shadow-[#E1500A]/10 ring-2 ring-[#E1500A]/20'
                : 'bg-white/90 dark:bg-[#222222]/90 border-[#DCD8CE] dark:border-[#383838] hover:border-[#E1500A]/60 hover:bg-white dark:hover:bg-[#222222]'
            }`}
          >
            <div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base mb-3 transition-colors ${
                activeQuestion === 'que-resuelve'
                  ? 'bg-[#E1500A] text-white'
                  : 'bg-[#222222] text-[#EFECE5]'
              }`}>
                3
              </div>
              <h3 className="text-base font-extrabold text-[#222222] dark:text-[#FFFFFF]">
                ¿Qué problema te resuelve?
              </h3>
              <p className="text-xs text-[#666666] dark:text-[#A3A3A3] mt-1.5 leading-relaxed">
                Cero dobles reservas, menos mensajes a medianoche y control de limpieza automático.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-black text-[#E1500A]">
              <span>{activeQuestion === 'que-resuelve' ? 'Viendo detalle' : 'Ver respuesta'}</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </button>

          {/* Card 4: Precios */}
          <button
            onClick={() => selectQuestion('precios')}
            className={`text-left p-6 rounded-[24px] border transition-all cursor-pointer relative flex flex-col justify-between ${
              activeQuestion === 'precios'
                ? 'bg-white dark:bg-[#222222] border-[#E1500A] shadow-xl shadow-[#E1500A]/10 ring-2 ring-[#E1500A]/20'
                : 'bg-white/90 dark:bg-[#222222]/90 border-[#DCD8CE] dark:border-[#383838] hover:border-[#E1500A]/60 hover:bg-white dark:hover:bg-[#222222]'
            }`}
          >
            <div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base mb-3 transition-colors ${
                activeQuestion === 'precios'
                  ? 'bg-[#E1500A] text-white'
                  : 'bg-[#222222] text-[#EFECE5]'
              }`}>
                $
              </div>
              <h3 className="text-base font-extrabold text-[#222222] dark:text-[#FFFFFF]">
                Precios
              </h3>
              <p className="text-xs text-[#666666] dark:text-[#A3A3A3] mt-1.5 leading-relaxed">
                Desde $45.000 ARS/mes. Sin poner tarjeta para empezar. Pagos por Transferencia Bancaria directa o PayPal.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-black text-[#E1500A]">
              <span>{activeQuestion === 'precios' ? 'Viendo tarifas' : 'Ver precios exactos'}</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </button>

        </div>

        {/* Dynamic Detailed Answer Box */}
        <div id="respuesta-detalle" className="bg-white dark:bg-[#222222] rounded-[32px] border-2 border-[#18181B]/10 dark:border-[#383838] shadow-2xl overflow-hidden scroll-mt-24 transition-colors">
          
          {/* ============================================================ */}
          {/* 1. ¿QUÉ HACEMOS? */}
          {/* ============================================================ */}
          {activeQuestion === 'que-hacemos' && (
            <div className="p-6 sm:p-10">
              <div className="flex flex-col lg:flex-row gap-8 lg:items-center justify-between border-b border-[#DCD8CE] dark:border-[#333333] pb-8">
                <div className="max-w-2xl">
                  <span className="text-xs font-black uppercase tracking-widest text-[#E1500A]">
                    Pregunta 1 de 4
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#18181B] dark:text-[#FFFFFF] mt-1 tracking-tight">
                    ¿Qué hacemos en Loomi?
                  </h3>
                  <p className="text-[#666666] dark:text-[#A3A3A3] text-base sm:text-lg mt-3 leading-relaxed">
                    Te damos un <strong>sistema simple, visual y moderno</strong> para que gestiones tus alquileres temporarios desde el celular o la computadora. Reemplaza el cuaderno, los mensajes cruzados de WhatsApp y las planillas de Excel que te hacen perder tiempo.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={onOpenDemo}
                    className="inline-flex items-center justify-center gap-2 bg-[#E1500A] hover:bg-[#C94305] text-white font-black px-6 py-3.5 rounded-2xl shadow-xl shadow-[#E1500A]/25 transition-all cursor-pointer active:scale-98"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Probar Demo en Vivo</span>
                  </button>
                </div>
              </div>

              {/* The 4 core tools */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="p-5 rounded-2xl bg-[#EFECE5] dark:bg-[#1A1A1A] border-2 border-[#DCD8CE] dark:border-[#333333] flex gap-4 items-start shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-[#18181B] text-[#E1500A] flex items-center justify-center shrink-0 font-bold">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-[#18181B] dark:text-[#FFFFFF] text-base">
                      1. Calendario unificado de reservas
                    </h4>
                    <p className="text-sm text-[#666666] dark:text-[#A3A3A3] mt-1 leading-relaxed">
                      Ves en una sola pantalla todas tus propiedades: quién entra hoy, quién sale y qué días están disponibles. Cargás reservas telefónicas o directas en 5 segundos.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#EFECE5] dark:bg-[#1A1A1A] border-2 border-[#DCD8CE] dark:border-[#333333] flex gap-4 items-start shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-[#18181B] text-[#E1500A] flex items-center justify-center shrink-0 font-bold">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-[#18181B] dark:text-[#FFFFFF] text-base">
                      2. Sincronización automática con Airbnb, Booking, Vrbo y Portales iCal
                    </h4>
                    <p className="text-sm text-[#666666] dark:text-[#A3A3A3] mt-1 leading-relaxed">
                      Si te reservan por Booking o Airbnb, en el mismo instante se bloquean las fechas en Vrbo, TripAdvisor, cualquier portal iCal y en tu motor directo. Cero riesgo de sobreventa (overbooking).
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#EFECE5] dark:bg-[#1A1A1A] border-2 border-[#DCD8CE] dark:border-[#333333] flex gap-4 items-start shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-[#18181B] text-[#E1500A] flex items-center justify-center shrink-0 font-bold">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-[#18181B] dark:text-[#FFFFFF] text-base">
                      3. Asistente con Inteligencia Artificial (Xenia)
                    </h4>
                    <p className="text-sm text-[#666666] dark:text-[#A3A3A3] mt-1 leading-relaxed">
                      Atiende consultas frecuentes por WhatsApp las 24 hs (clave de Wi-Fi, ubicación, horarios, reglas) para que no tengas que estar pendiente del teléfono de noche.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#EFECE5] dark:bg-[#1A1A1A] border-2 border-[#DCD8CE] dark:border-[#333333] flex gap-4 items-start shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-[#18181B] text-[#E1500A] flex items-center justify-center shrink-0 font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-[#18181B] dark:text-[#FFFFFF] text-base">
                      4. Módulo de limpieza y mucamas en el celular
                    </h4>
                    <p className="text-sm text-[#666666] dark:text-[#A3A3A3] mt-1 leading-relaxed">
                      Cada vez que un huésped se va, tu personal de limpieza recibe la orden de trabajo con el checklist de control (sábanas, toallas, reposición) para tener todo listo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 2. ¿ESTO ES PARA VOS? */}
          {/* ============================================================ */}
          {activeQuestion === 'es-para-vos' && (
            <div className="p-6 sm:p-10">
              <div className="max-w-2xl mb-8">
                <span className="text-xs font-black uppercase tracking-widest text-[#E1500A]">
                  Pregunta 2 de 4
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#18181B] dark:text-[#FFFFFF] mt-1 tracking-tight">
                  ¿Esto es para vos?
                </h3>
                <p className="text-[#666666] dark:text-[#A3A3A3] text-base sm:text-lg mt-3 leading-relaxed">
                  Loomi está pensado para <strong>anfitriones, dueños y administradores que manejan desde 4 propiedades en adelante</strong>. A partir de esa cantidad, la cabeza ya no da abasto para coordinar fechas, limpieza y mensajes manualmente.
                </p>
              </div>

              {/* Interactive Profile Selector */}
              <div className="bg-[#EFECE5] dark:bg-[#1A1A1A] p-4 rounded-2xl border-2 border-[#DCD8CE] dark:border-[#333333] mb-6">
                <p className="text-xs font-black text-[#18181B] dark:text-[#FFFFFF] uppercase tracking-wider mb-3">
                  Tocá tu tipo de alojamiento para ver cómo te ayuda:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button
                    onClick={() => setSelectedPropertyProfile('deptos')}
                    className={`p-3.5 rounded-xl text-left border-2 transition-all cursor-pointer flex items-center gap-3 ${
                      selectedPropertyProfile === 'deptos'
                        ? 'bg-white dark:bg-[#252525] border-[#E1500A] shadow-md text-[#18181B] dark:text-[#FFFFFF]'
                        : 'bg-white/70 dark:bg-[#222222] border-[#DCD8CE] dark:border-[#383838] text-[#666666] dark:text-[#A3A3A3] hover:bg-white'
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-[#E1500A] shrink-0" />
                    <div>
                      <p className="text-sm font-black">Departamentos</p>
                      <p className="text-xs text-[#666666] dark:text-[#A3A3A3]">De 4 a 30+ unidades</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedPropertyProfile('cabanas')}
                    className={`p-3.5 rounded-xl text-left border-2 transition-all cursor-pointer flex items-center gap-3 ${
                      selectedPropertyProfile === 'cabanas'
                        ? 'bg-white dark:bg-[#252525] border-[#E1500A] shadow-md text-[#18181B] dark:text-[#FFFFFF]'
                        : 'bg-white/70 dark:bg-[#222222] border-[#DCD8CE] dark:border-[#383838] text-[#666666] dark:text-[#A3A3A3] hover:bg-white'
                    }`}
                  >
                    <Home className="w-5 h-5 text-[#E1500A] shrink-0" />
                    <div>
                      <p className="text-sm font-black">Cabañas & Lodges</p>
                      <p className="text-xs text-[#666666] dark:text-[#A3A3A3]">En sierras, campo o lago</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedPropertyProfile('glamping')}
                    className={`p-3.5 rounded-xl text-left border-2 transition-all cursor-pointer flex items-center gap-3 ${
                      selectedPropertyProfile === 'glamping'
                        ? 'bg-white dark:bg-[#252525] border-[#E1500A] shadow-md text-[#18181B] dark:text-[#FFFFFF]'
                        : 'bg-white/70 dark:bg-[#222222] border-[#DCD8CE] dark:border-[#383838] text-[#666666] dark:text-[#A3A3A3] hover:bg-white'
                    }`}
                  >
                    <Tent className="w-5 h-5 text-[#E1500A] shrink-0" />
                    <div>
                      <p className="text-sm font-black">Glampings & Domos</p>
                      <p className="text-xs text-[#666666] dark:text-[#A3A3A3]">Tiendas, domos & pods</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedPropertyProfile('posadas')}
                    className={`p-3.5 rounded-xl text-left border-2 transition-all cursor-pointer flex items-center gap-3 ${
                      selectedPropertyProfile === 'posadas'
                        ? 'bg-white dark:bg-[#252525] border-[#E1500A] shadow-md text-[#18181B] dark:text-[#FFFFFF]'
                        : 'bg-white/70 dark:bg-[#222222] border-[#DCD8CE] dark:border-[#383838] text-[#666666] dark:text-[#A3A3A3] hover:bg-white'
                    }`}
                  >
                    <Layers className="w-5 h-5 text-[#E1500A] shrink-0" />
                    <div>
                      <p className="text-sm font-black">Posadas & Aparts</p>
                      <p className="text-xs text-[#666666] dark:text-[#A3A3A3]">Con desayuno y recepción</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Profile response content */}
              <div className="p-6 rounded-2xl bg-[#EFECE5] dark:bg-[#1A1A1A] border-2 border-[#DCD8CE] dark:border-[#333333]">
                {selectedPropertyProfile === 'deptos' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[#18181B] dark:text-[#FFFFFF] font-black text-lg">
                      <Building2 className="w-5 h-5 text-[#E1500A]" />
                      <span>Si administrás Departamentos (como Catalinas Apartamentos):</span>
                    </div>
                    <p className="text-sm text-[#444444] dark:text-[#CCCCCC] leading-relaxed">
                      Tu mayor dolor suele ser la <strong>coordinación a distancia</strong>: entregar llaves tradicionales o coordinar llegada sin esperas infinitas, evitar que te reserven dos veces la misma noche mientras estás en la calle, y liquidar mensualmente a cada propietario con claridad.
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-[#18181B] dark:text-[#EFECE5]">
                      <li className="flex items-center gap-2">✅ Coordinación de llegada con entrega de llaves o lockbox</li>
                      <li className="flex items-center gap-2">✅ Reportes para liquidar a los dueños de cada depto</li>
                      <li className="flex items-center gap-2">✅ Tu propio link para reservas directas sin pagar comisiones</li>
                      <li className="flex items-center gap-2">✅ Aviso automático a la persona de limpieza en cada check-out</li>
                    </ul>
                  </div>
                )}

                {selectedPropertyProfile === 'cabanas' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[#18181B] dark:text-[#FFFFFF] font-black text-lg">
                      <Home className="w-5 h-5 text-[#E1500A]" />
                      <span>Si tenés Cabañas o Lodge de Montaña / Naturaleza:</span>
                    </div>
                    <p className="text-sm text-[#444444] dark:text-[#CCCCCC] leading-relaxed">
                      Tus huéspedes vienen por la ruta, no tienen señal y te cuesta calcular a qué hora llegan. Con Loomi <strong>no necesitás cambiar ninguna cerradura ni gastar en aparatos raros</strong>: funciona 100% con tu llave física tradicional. Les mandás la guía interactiva con GPS y recomendaciones antes de llegar, y vos ves de un vistazo qué cabañas están libres o listas para entregar.
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-[#18181B] dark:text-[#EFECE5]">
                      <li className="flex items-center gap-2">✅ 100% compatible con tus llaves físicas de siempre</li>
                      <li className="flex items-center gap-2">✅ Mapa de llegada por ruta y recomendaciones locales</li>
                      <li className="flex items-center gap-2">✅ Estado visual de cabañas ocupadas vs. listas</li>
                      <li className="flex items-center gap-2">✅ Control de señas y depósitos por transferencia bancaria</li>
                    </ul>
                  </div>
                )}

                {selectedPropertyProfile === 'glamping' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[#18181B] dark:text-[#FFFFFF] font-black text-lg">
                      <Tent className="w-5 h-5 text-[#E1500A]" />
                      <span>Si gestionás un Glamping, Domos Geodésicos o Ecoalojamiento:</span>
                    </div>
                    <p className="text-sm text-[#444444] dark:text-[#CCCCCC] leading-relaxed">
                      Los glampings tienen una magia única y una operativa dispersa en la naturaleza: tus huéspedes necesitan indicaciones claras para llegar, cómo encender la salamandra o usar el jacuzzi nórdico, y vos necesitás coordinar leña, desayunos y limpieza sin volverte loco por WhatsApp.
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-[#18181B] dark:text-[#EFECE5]">
                      <li className="flex items-center gap-2">✅ Guía digital con instrucciones de estufa, jacuzzi, fogón y entorno</li>
                      <li className="flex items-center gap-2">✅ Mapa GPS de acceso exacto antes de que pierdan señal en la ruta</li>
                      <li className="flex items-center gap-2">✅ Control de unidades dispersas (Domo 1, Domo 2, Safari Tent)</li>
                      <li className="flex items-center gap-2">✅ Coordinación de extras: canastas de desayuno, leña y cenas</li>
                    </ul>
                  </div>
                )}

                {selectedPropertyProfile === 'posadas' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[#18181B] dark:text-[#FFFFFF] font-black text-lg">
                      <Layers className="w-5 h-5 text-[#E1500A]" />
                      <span>Si gestionás una Posada, Apart Hotel o Bed & Breakfast:</span>
                    </div>
                    <p className="text-sm text-[#444444] dark:text-[#CCCCCC] leading-relaxed">
                      El personal rota de turno y necesitan que la información no quede en un papel que alguien pierde. Loomi permite que recepción, mucamas y administración vean en tiempo real quién pagó, quién llega tarde y qué habitación necesita toallas nuevas.
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-[#18181B] dark:text-[#EFECE5]">
                      <li className="flex items-center gap-2">✅ Saldo y estado de cuenta por habitación en vivo</li>
                      <li className="flex items-center gap-2">✅ Turnos de mucama y notas internas del equipo</li>
                      <li className="flex items-center gap-2">✅ Compatible con llaves físicas o tarjetas de acceso</li>
                      <li className="flex items-center gap-2">✅ Accesible desde cualquier celular o tablet</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 3. ¿QUÉ PROBLEMA TE RESUELVE? */}
          {/* ============================================================ */}
          {activeQuestion === 'que-resuelve' && (
            <div className="p-6 sm:p-10">
              <div className="max-w-2xl mb-8">
                <span className="text-xs font-black uppercase tracking-widest text-[#E1500A]">
                  Pregunta 3 de 4
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#18181B] dark:text-[#FFFFFF] mt-1 tracking-tight">
                  ¿Qué problema te resuelve en el día a día?
                </h3>
                <p className="text-[#666666] dark:text-[#A3A3A3] text-base sm:text-lg mt-3 leading-relaxed">
                  No te llenamos de funciones que nunca vas a usar. Resolvemos exactamente los 4 dolores que te roban tiempo y tranquilidad:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Dolor 1 */}
                <div className="p-5 rounded-2xl border-2 border-[#DCD8CE] dark:border-[#333333] bg-[#EFECE5] dark:bg-[#1A1A1A]">
                  <div className="flex items-center gap-2 text-[#E1500A] font-black text-xs mb-2 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>EL PROBLEMA ACTUAL</span>
                  </div>
                  <h4 className="font-black text-[#18181B] dark:text-[#FFFFFF] text-base mb-2">
                    El miedo constante a la doble reserva (Overbooking)
                  </h4>
                  <p className="text-xs text-[#666666] dark:text-[#A3A3A3] mb-4">
                    Te reservan por Booking mientras estabas durmiendo o almorzando, y ya se lo habías prometido a un conocido por WhatsApp.
                  </p>
                  <div className="pt-3 border-t border-[#DCD8CE] dark:border-[#333333] flex items-start gap-2 text-[#18181B] dark:text-[#FFFFFF] bg-white dark:bg-[#252525] p-3.5 rounded-xl border border-[#DCD8CE] dark:border-[#383838]">
                    <CheckCircle2 className="w-4 h-4 text-[#E1500A] shrink-0 mt-0.5" />
                    <p className="text-xs font-medium">
                      <strong>Lo que resuelve Loomi:</strong> Sincronización instantánea. Entra una reserva y se cierran las fechas en los demás portales en el acto.
                    </p>
                  </div>
                </div>

                {/* Dolor 2 */}
                <div className="p-5 rounded-2xl border-2 border-[#DCD8CE] dark:border-[#333333] bg-[#EFECE5] dark:bg-[#1A1A1A]">
                  <div className="flex items-center gap-2 text-[#E1500A] font-black text-xs mb-2 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>EL PROBLEMA ACTUAL</span>
                  </div>
                  <h4 className="font-black text-[#18181B] dark:text-[#FFFFFF] text-base mb-2">
                    Vivir atado a WhatsApp contestando siempre lo mismo
                  </h4>
                  <p className="text-xs text-[#666666] dark:text-[#A3A3A3] mb-4">
                    "¿Cuál era la clave de Wi-Fi?", "¿A qué hora es el check-in?", "¿Hay secador de pelo?", "¿Cómo llego?".
                  </p>
                  <div className="pt-3 border-t border-[#DCD8CE] dark:border-[#333333] flex items-start gap-2 text-[#18181B] dark:text-[#FFFFFF] bg-white dark:bg-[#252525] p-3.5 rounded-xl border border-[#DCD8CE] dark:border-[#383838]">
                    <CheckCircle2 className="w-4 h-4 text-[#E1500A] shrink-0 mt-0.5" />
                    <p className="text-xs font-medium">
                      <strong>Lo que resuelve Loomi:</strong> Xenia IA responde las dudas recurrentes por vos y manda la Guía Digital antes de que lleguen.
                    </p>
                  </div>
                </div>

                {/* Dolor 3 */}
                <div className="p-5 rounded-2xl border-2 border-[#DCD8CE] dark:border-[#333333] bg-[#EFECE5] dark:bg-[#1A1A1A]">
                  <div className="flex items-center gap-2 text-[#E1500A] font-black text-xs mb-2 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>EL PROBLEMA ACTUAL</span>
                  </div>
                  <h4 className="font-black text-[#18181B] dark:text-[#FFFFFF] text-base mb-2">
                    Tener que llamar y perseguir a la gente de limpieza
                  </h4>
                  <p className="text-xs text-[#666666] dark:text-[#A3A3A3] mb-4">
                    Tener que acordarte de avisar quién sale, a qué hora entra el siguiente y revisar si cambiaron las sábanas y toallas.
                  </p>
                  <div className="pt-3 border-t border-[#DCD8CE] dark:border-[#333333] flex items-start gap-2 text-[#18181B] dark:text-[#FFFFFF] bg-white dark:bg-[#252525] p-3.5 rounded-xl border border-[#DCD8CE] dark:border-[#383838]">
                    <CheckCircle2 className="w-4 h-4 text-[#E1500A] shrink-0 mt-0.5" />
                    <p className="text-xs font-medium">
                      <strong>Lo que resuelve Loomi:</strong> Cada salida genera automáticamente la tarea en el celular de la mucama con checklist de control.
                    </p>
                  </div>
                </div>

                {/* Dolor 4 */}
                <div className="p-5 rounded-2xl border-2 border-[#DCD8CE] dark:border-[#333333] bg-[#EFECE5] dark:bg-[#1A1A1A]">
                  <div className="flex items-center gap-2 text-[#E1500A] font-black text-xs mb-2 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>EL PROBLEMA ACTUAL</span>
                  </div>
                  <h4 className="font-black text-[#18181B] dark:text-[#FFFFFF] text-base mb-2">
                    Dejarle el 15% al 20% de comisión a los portales
                  </h4>
                  <p className="text-xs text-[#666666] dark:text-[#A3A3A3] mb-4">
                    Huéspedes que ya te conocen o te recomiendan terminan pagando de más o dejándole la comisión a intermediarios.
                  </p>
                  <div className="pt-3 border-t border-[#DCD8CE] dark:border-[#333333] flex items-start gap-2 text-[#18181B] dark:text-[#FFFFFF] bg-white dark:bg-[#252525] p-3.5 rounded-xl border border-[#DCD8CE] dark:border-[#383838]">
                    <CheckCircle2 className="w-4 h-4 text-[#E1500A] shrink-0 mt-0.5" />
                    <p className="text-xs font-medium">
                      <strong>Lo que resuelve Loomi:</strong> Tenés tu propio link de reservas directas para cobrar el 100% de la noche sin comisiones.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 4. PRECIOS (EN PESOS ARGENTINOS, AJUSTE POR IPC Y SUSCRIPCIONES) */}
          {/* ============================================================ */}
          {activeQuestion === 'precios' && (
            <div className="p-6 sm:p-10">
              
              {/* Header */}
              <div className="max-w-3xl mb-8 border-b border-[#DCD8CE] dark:border-[#333333] pb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181B] text-white text-xs font-bold mb-3">
                  <Coins className="w-3.5 h-3.5 text-[#E1500A]" />
                  <span>En pesos argentinos • Ajuste por IPC • Facturación transparente</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#18181B] dark:text-[#FFFFFF] tracking-tight">
                  Precios transparentes en pesos argentinos
                </h3>
                <p className="text-[#666666] dark:text-[#A3A3A3] text-sm sm:text-base mt-2 leading-relaxed">
                  Sabemos que en Argentina cansa ver precios en dólares que cambian con cada corrida cambiaria. 
                  En Loomi <strong>pagás en pesos</strong>, con <strong>ajuste previsible por IPC (inflación)</strong> y sin recargos de tarjeta en moneda extranjera.
                </p>

                {/* Explicit reassurance: No credit card to start + Payment methods */}
                <div className="mt-4 p-4 rounded-2xl bg-[#EFECE5] dark:bg-[#1A1A1A] border-2 border-[#DCD8CE] dark:border-[#333333] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#18181B] text-[#E1500A] flex items-center justify-center shrink-0 mt-0.5">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#18181B] dark:text-[#FFFFFF] uppercase tracking-wide">
                        ¡No necesitás poner ninguna tarjeta para comenzar!
                      </p>
                      <p className="text-xs text-[#666666] dark:text-[#A3A3A3] mt-0.5">
                        Probás la plataforma gratis y sin compromiso. Cuando decidas activarlo, pagás directamente mediante <strong>Transferencia Bancaria directa (CBU/CVU o Alias)</strong>, o mediante <strong>PayPal</strong> para clientes y cuentas del exterior.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Perspective Interactive Box: ¿Qué porcentaje de 1 noche representa? */}
                <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-[#252525] border-2 border-[#18181B]/15 dark:border-[#383838] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                  <div className="text-left space-y-0.5">
                    <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#18181B] dark:text-[#FFFFFF]">
                      <BedDouble className="w-4 h-4 text-[#E1500A]" />
                      <span>Ponelo en perspectiva: ¿Cuánto cobrás por noche en tu alojamiento?</span>
                    </div>
                    <p className="text-[11px] text-[#666666] dark:text-[#A3A3A3]">
                      Ingresá tu tarifa promedio para ver qué porcentaje de <strong>una sola noche</strong> paga todo tu abono mensual:
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 bg-[#EFECE5] dark:bg-[#1A1A1A] px-3.5 py-2 rounded-xl border border-[#DCD8CE] dark:border-[#333333] shadow-2xs">
                    <span className="text-xs font-black text-[#18181B] dark:text-white">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={userNightRateArs}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setUserNightRateArs(val);
                      }}
                      placeholder="60000"
                      className="w-24 text-sm font-black text-[#18181B] dark:text-white bg-transparent outline-none focus:ring-0 text-center"
                    />
                    <span className="text-[11px] font-bold text-[#666666] dark:text-[#A3A3A3]">ARS / noche</span>
                  </div>
                </div>

                <div className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-[#18181B] dark:text-[#EFECE5] bg-[#EFECE5] dark:bg-[#1A1A1A] px-3.5 py-1.5 rounded-xl border border-[#DCD8CE] dark:border-[#333333]">
                  <CheckCircle2 className="w-4 h-4 text-[#E1500A]" />
                  <span>Mismo sistema 100% integral para todos: no te recortamos ninguna función según el plan.</span>
                </div>
              </div>

              {/* 2 Explicit Pricing Cards (Sin cobrar por habitación) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {plans.map((plan) => {
                  const numericRate = typeof userNightRateArs === 'number' ? userNightRateArs : (Number(userNightRateArs) || 1);
                  const safeRate = numericRate > 0 ? numericRate : 1;
                  const percentageOfNight = Math.round((plan.priceMonthly / safeRate) * 100);
                  const nightFraction = (plan.priceMonthly / safeRate).toFixed(1);

                  return (
                    <div
                      key={plan.id}
                      className={`rounded-3xl p-6 sm:p-8 border-2 transition-all flex flex-col justify-between relative ${
                        plan.popular
                          ? 'bg-white dark:bg-[#252525] border-[#E1500A] shadow-xl shadow-[#E1500A]/15 ring-2 ring-[#E1500A]/20'
                          : 'bg-[#EFECE5] dark:bg-[#1A1A1A] border-[#DCD8CE] dark:border-[#333333]'
                      }`}
                    >
                      {plan.popular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E1500A] text-white text-[11px] font-black tracking-widest uppercase px-4 py-1 rounded-full shadow-md flex items-center gap-1 z-10">
                          <Sparkles className="w-3 h-3" />
                          {plan.badge}
                        </span>
                      )}

                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-black text-[#18181B] dark:text-[#FFFFFF] text-2xl">{plan.name}</h4>
                        </div>
                        <span className="inline-block text-xs font-bold text-[#E1500A] mt-0.5">
                          {plan.range}
                        </span>
                        <p className="text-xs text-[#666666] dark:text-[#A3A3A3] mt-2 min-h-[32px]">{plan.description}</p>

                        {/* Price display in ARS */}
                        <div className="mt-5 pb-4 border-b border-[#DCD8CE] dark:border-[#333333]">
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-[#18181B] dark:text-[#FFFFFF]">
                              ${plan.priceMonthly.toLocaleString('es-AR')}
                            </span>
                            <span className="text-xs font-bold text-[#666666] dark:text-[#A3A3A3]">/ mes (Final ARS)</span>
                          </div>
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                            Precio fijo por todo el complejo • Sin costos por habitación
                          </p>
                        </div>

                        {/* Night Fraction Dynamic Badge */}
                        <div className="mt-3 p-3 rounded-2xl bg-white dark:bg-[#1E1E1E] border border-[#DCD8CE] dark:border-[#333333] text-xs">
                          <div className="flex items-center justify-between font-bold text-[#18181B] dark:text-[#FFFFFF]">
                            <span className="flex items-center gap-1 text-[11px]">
                              <BedDouble className="w-3.5 h-3.5 text-[#E1500A]" />
                              ¿Cuánto de 1 noche es?
                            </span>
                            <span className="text-xs font-black bg-[#18181B] text-white px-2 py-0.5 rounded-lg">
                              {percentageOfNight}% de 1 noche
                            </span>
                          </div>
                          <p className="text-[10.5px] text-[#555555] dark:text-[#BBBBBB] mt-1 leading-tight">
                            {percentageOfNight <= 100 ? (
                              <>¡Con <strong>menos de 1 noche vendida al mes</strong> ({nightFraction} noches) ya cubrís el 100% del software!</>
                            ) : (
                              <>Se amortiza con solo <strong>{nightFraction} noches vendidas</strong> en todo el mes.</>
                            )}
                          </p>
                        </div>

                        {/* Features List */}
                        <div className="mt-5">
                          <p className="text-[11px] font-black uppercase tracking-wider text-[#18181B] dark:text-[#FFFFFF] mb-3">
                            Funciones incluidas:
                          </p>
                          <ul className="space-y-2 text-xs text-[#444444] dark:text-[#CCCCCC]">
                            {plan.includedFeatures?.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#E1500A] shrink-0 mt-0.5" />
                                <span>{feature}</span>
                              </li>
                            ))}
                            {plan.excludedFeatures?.map((excluded, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-gray-400 line-through">
                                <span className="text-gray-300 font-bold">✕</span>
                                <span>{excluded}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <div className="mt-8 pt-4 border-t border-[#DCD8CE] dark:border-[#333333]">
                        <button
                          onClick={() => onOpenContact(`Consulta por Plan ${plan.name} ($${plan.priceMonthly.toLocaleString('es-AR')})`)}
                          className={`w-full py-3.5 rounded-2xl font-black text-xs transition-all cursor-pointer text-center active:scale-98 ${
                            plan.popular
                              ? 'bg-[#E1500A] hover:bg-[#C94305] text-white shadow-xl shadow-[#E1500A]/30'
                              : 'bg-[#18181B] hover:bg-black text-white'
                          }`}
                        >
                          Empezar con {plan.name}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* +30 Properties Custom Plan Banner */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#18181B] text-white mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-[#27272A] shadow-xl">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#EFECE5] text-xs font-bold mb-2">
                    <Building2 className="w-3.5 h-3.5 text-[#E1500A]" />
                    <span>¿Tenés más de 30 propiedades o varias sedes?</span>
                  </div>
                  <h4 className="text-xl font-black text-white">
                    Plan Personalizado (+30 Unidades)
                  </h4>
                  <p className="text-[#A3A3A3] text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                    Para complejos grandes, administraciones inmobiliarias multisede y posadas con alta rotación. Coordinamos migración asistida de tus reservas y tarifa adaptada a tu escala.
                  </p>
                </div>
                <button
                  onClick={() => onOpenContact('Plan Personalizado (+30 propiedades)')}
                  className="shrink-0 bg-[#E1500A] hover:bg-[#C94305] text-white font-black px-6 py-3 rounded-2xl text-xs transition-all cursor-pointer shadow-lg shadow-[#E1500A]/30 active:scale-98"
                >
                  Consultar plan a medida
                </button>
              </div>

              {/* Modular Add-ons (Módulos Opcionales: solo si los usás) */}
              <div className="mb-8 p-6 rounded-3xl bg-white dark:bg-[#252525] border-2 border-[#DCD8CE] dark:border-[#383838] shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-[#DCD8CE] dark:border-[#333333]">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFECE5] dark:bg-[#1A1A1A] text-[#18181B] dark:text-[#FFFFFF] text-xs font-black mb-1">
                      <PlusCircle className="w-3.5 h-3.5 text-[#E1500A]" />
                      <span>Módulos Opcionales (Add-ons)</span>
                    </div>
                    <h4 className="text-base font-black text-[#18181B] dark:text-[#FFFFFF]">
                      ¿Necesitás algo específico? Solo pagás lo que usás
                    </h4>
                    <p className="text-xs text-[#666666] dark:text-[#A3A3A3]">
                      El plan base cubre el 100% de la gestión diaria con llave tradicional. Si tu propiedad tiene servicios extra, podés sumar estos módulos opcionales:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  {/* Modulo 1: Cerraduras Electrónicas */}
                  <div className="p-4 rounded-2xl border-2 border-[#DCD8CE] dark:border-[#383838] bg-[#EFECE5] dark:bg-[#1A1A1A] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[#18181B] dark:text-[#FFFFFF] font-black text-sm mb-1">
                        <KeyRound className="w-4 h-4 text-[#E1500A]" />
                        <span>Cerraduras Digitales & PIN</span>
                      </div>
                      <p className="text-xs text-[#666666] dark:text-[#A3A3A3] leading-relaxed">
                        Para anfitriones con cerraduras inteligentes (Tuya, TTLock, Yale). Genera y envía automáticamente el PIN de acceso dinámico por WhatsApp que caduca al check-out.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#DCD8CE] dark:border-[#333333] flex items-center justify-between text-xs">
                      <span className="font-bold text-[#666666] dark:text-[#A3A3A3]">Módulo adicional</span>
                      <button
                        onClick={() => onOpenContact('Consulta por Módulo Cerraduras Digitales')}
                        className="font-black text-[#E1500A] hover:underline cursor-pointer"
                      >
                        Consultar →
                      </button>
                    </div>
                  </div>

                  {/* Modulo 2: Frigobar, Desayunos y Extras */}
                  <div className="p-4 rounded-2xl border-2 border-[#DCD8CE] dark:border-[#383838] bg-[#EFECE5] dark:bg-[#1A1A1A] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[#18181B] dark:text-[#FFFFFF] font-black text-sm mb-1">
                        <Wine className="w-4 h-4 text-[#E1500A]" />
                        <span>Frigobar & Extras</span>
                      </div>
                      <p className="text-xs text-[#666666] dark:text-[#A3A3A3] leading-relaxed">
                        Control de bebidas, snacks, desayunos o amenities especiales. El personal carga consumos para cobrar todo junto al check-out.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#DCD8CE] dark:border-[#333333] flex items-center justify-between text-xs">
                      <span className="font-bold text-[#666666] dark:text-[#A3A3A3]">Módulo adicional</span>
                      <button
                        onClick={() => onOpenContact('Consulta por Módulo Frigobar y Consumos')}
                        className="font-black text-[#E1500A] hover:underline cursor-pointer"
                      >
                        Consultar →
                      </button>
                    </div>
                  </div>

                  {/* Modulo 3: Spa, Masajes y Alquileres */}
                  <div className="p-4 rounded-2xl border-2 border-[#DCD8CE] dark:border-[#383838] bg-[#EFECE5] dark:bg-[#1A1A1A] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[#18181B] dark:text-[#FFFFFF] font-black text-sm mb-1">
                        <Flower2 className="w-4 h-4 text-[#E1500A]" />
                        <span>Spa & Turnos</span>
                      </div>
                      <p className="text-xs text-[#666666] dark:text-[#A3A3A3] leading-relaxed">
                        Agenda de turnos para sauna, masajes, piscina climatizada, bicicletas o excursiones sin superponer horarios entre huéspedes.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#DCD8CE] dark:border-[#333333] flex items-center justify-between text-xs">
                      <span className="font-bold text-[#666666] dark:text-[#A3A3A3]">Módulo adicional</span>
                      <button
                        onClick={() => onOpenContact('Consulta por Módulo Spa y Turnos')}
                        className="font-black text-[#E1500A] hover:underline cursor-pointer"
                      >
                        Consultar →
                      </button>
                    </div>
                  </div>

                  {/* Modulo 4: Dominio Propio */}
                  <div className="p-4 rounded-2xl border-2 border-[#DCD8CE] dark:border-[#383838] bg-[#EFECE5] dark:bg-[#1A1A1A] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[#18181B] dark:text-[#FFFFFF] font-black text-sm mb-1">
                        <Globe className="w-4 h-4 text-[#E1500A]" />
                        <span>Dominio Propio</span>
                      </div>
                      <p className="text-xs text-[#666666] dark:text-[#A3A3A3] leading-relaxed">
                        Tu motor directo bajo tu dominio (ej: <code>reservas.tucabana.com</code>). El costo de registro del dominio corre por el cliente; Loomi configura DNS y SSL gratis.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#DCD8CE] dark:border-[#333333] flex items-center justify-between text-xs">
                      <span className="font-bold text-[#666666] dark:text-[#A3A3A3]">Costo del dominio</span>
                      <button
                        onClick={() => onOpenContact('Consulta por Dominio Propio Adicional')}
                        className="font-black text-[#E1500A] hover:underline cursor-pointer"
                      >
                        Vincular →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Onboarding Concierge Callout */}
              <div className="mb-8 p-6 sm:p-8 rounded-3xl border-2 border-[#E1500A]/30 bg-[#EFECE5] dark:bg-[#1A1A1A] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-[#18181B] text-[#E1500A] flex items-center justify-center shrink-0 border border-[#27272A] shadow-md font-bold">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-white bg-[#E1500A] px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                      Servicio Concierge
                    </span>
                    <h3 className="text-lg font-black text-[#18181B] dark:text-[#FFFFFF] mt-1.5">
                      ¿No tenés tiempo? Hacemos el Onboarding por vos (Servicio Llave en Mano)
                    </h3>
                    <p className="text-xs text-[#666666] dark:text-[#A3A3A3] mt-1 leading-relaxed max-w-2xl">
                      Si no querés encargarte de cargar las fotos, registrar las cabañas, o configurar las claves iCal de tus plataformas de alquiler, nuestro equipo lo hace por vos. Nos das tus enlaces de Airbnb/Booking, fotos del complejo y nos encargamos de todo el setup inicial en 72 horas. <strong>Tarifa única personalizada según la cantidad de unidades de tu complejo.</strong> ¡Listo para usar con soporte inicial personalizado!
                    </p>
                  </div>
                </div>
                <div className="text-center md:text-right shrink-0 w-full md:w-auto">
                  <div className="text-xl font-black text-[#E1500A]">
                    A Cotizar
                  </div>
                  <div className="text-[10px] text-[#666666] dark:text-[#A3A3A3] font-medium mt-0.5">Pago único proporcional</div>
                  <button
                    onClick={() => onOpenContact('Servicio Concierge Onboarding Llave en Mano (Presupuesto)')}
                    className="mt-3 w-full md:w-auto px-5 py-2.5 bg-[#18181B] hover:bg-black text-white text-xs font-black rounded-xl shadow-md cursor-pointer transition-all active:scale-98"
                  >
                    Consultar Puesta en Marcha
                  </button>
                </div>
              </div>

              {/* Payment Methods & Guarantees Box */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#252525] border-2 border-[#DCD8CE] dark:border-[#383838]">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-[#DCD8CE] dark:border-[#333333] mb-5">
                  <div>
                    <h5 className="font-black text-[#18181B] dark:text-[#FFFFFF] text-sm">
                      Cómo se abona tu suscripción y cómo cobrás a tus huéspedes:
                    </h5>
                    <p className="text-xs text-[#666666] dark:text-[#A3A3A3] mt-0.5">
                      Transparencia total en ambos flujos de pago:
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EFECE5] dark:bg-[#1A1A1A] border border-[#DCD8CE] dark:border-[#333333] text-[#18181B] dark:text-[#FFFFFF] text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-[#E1500A]"></span>
                      Tu Plan: Transferencia CBU / PayPal
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EFECE5] dark:bg-[#1A1A1A] border border-[#DCD8CE] dark:border-[#333333] text-[#18181B] dark:text-[#FFFFFF] text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-[#E1500A]"></span>
                      Tus Huéspedes: Mercado Pago, PayPal & CBU
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 p-4 rounded-2xl bg-[#EFECE5] dark:bg-[#1A1A1A] border border-[#DCD8CE] dark:border-[#333333] text-xs">
                  <div>
                    <span className="text-[10px] font-black text-[#E1500A] uppercase tracking-wider">Tu Suscripción mensual a Loomi</span>
                    <p className="font-black text-[#18181B] dark:text-[#FFFFFF] text-xs mt-0.5">Transferencia Bancaria Directa o PayPal</p>
                    <p className="text-[#666666] dark:text-[#A3A3A3] text-[11px] mt-1 leading-relaxed">
                      Abonás tu plan por transferencia directa a nuestra cuenta bancaria en Argentina (CBU/CVU o Alias) o por PayPal para el exterior. No requerimos tarjeta de crédito para iniciar.
                    </p>
                  </div>
                  <div className="md:border-l md:border-[#DCD8CE] dark:md:border-[#333333] md:pl-4">
                    <span className="text-[10px] font-black text-[#E1500A] uppercase tracking-wider">Tus Cobros a Huéspedes (Reservas directas)</span>
                    <p className="font-black text-[#18181B] dark:text-[#FFFFFF] text-xs mt-0.5">Mercado Pago, PayPal o CBU propio</p>
                    <p className="text-[#666666] dark:text-[#A3A3A3] text-[11px] mt-1 leading-relaxed">
                      Tus huéspedes te pagan directo a tu cuenta: integrás tu cuenta de <strong>Mercado Pago</strong> (link de pago o QR), <strong>PayPal</strong> para extranjeros o tu CBU bancario. Loomi no toca tus cobros.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="flex items-start gap-2.5">
                    <CreditCard className="w-4 h-4 text-[#E1500A] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-[#18181B] dark:text-[#FFFFFF]">Sin tarjeta para arrancar</p>
                      <p className="text-[#666666] dark:text-[#A3A3A3] text-[11px] mt-0.5">Probás la demo interactiva al instante sin cargar datos bancarios.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <TrendingUp className="w-4 h-4 text-[#E1500A] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-[#18181B] dark:text-[#FFFFFF]">Ajuste por IPC</p>
                      <p className="text-[#666666] dark:text-[#A3A3A3] text-[11px] mt-0.5">Precios claros y previsibles en moneda nacional.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#E1500A] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-[#18181B] dark:text-[#FFFFFF]">Cobros directos a tu cuenta</p>
                      <p className="text-[#666666] dark:text-[#A3A3A3] text-[11px] mt-0.5">Tus huéspedes abonan en tus cuentas configuradas (Mercado Pago, PayPal o CBU).</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-[#E1500A] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-[#18181B] dark:text-[#FFFFFF]">Sin permanencia</p>
                      <p className="text-[#666666] dark:text-[#A3A3A3] text-[11px] mt-0.5">Pausás o cancelás cuando quieras directamente desde tu cuenta.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </section>
  );
};
