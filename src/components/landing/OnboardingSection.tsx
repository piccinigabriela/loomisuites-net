import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Smartphone,
  Calendar,
  KeyRound,
  ShieldCheck,
  MessageSquare,
  Play,
  Zap,
} from 'lucide-react';

interface OnboardingSectionProps {
  onOpenDemo: () => void;
  onOpenContact: () => void;
}

export const OnboardingSection: React.FC<OnboardingSectionProps> = ({
  onOpenDemo,
  onOpenContact,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      step: 1,
      time: '3 minutos',
      title: 'Carga de Cabañas y Habitaciones',
      subtitle: 'Configuración visual sin tecnicismos',
      description:
        'Nombras tus cabañas, habitaciones de B&B o posada (ej: "Cabaña 1 El Alerce", "Hab. 101 Jardín"), defines la capacidad de huéspedes y la tarifa base por noche. Sin menús confusos ni 50 opciones hoteleras innecesarias.',
      details: [
        'Nombre o número de la unidad y fotos',
        'Capacidad máxima y camas disponibles',
        'Precio base por noche y tarifa de limpieza opcional',
        'Datos del WiFi y tipo de acceso (llave física o cerradura digital)',
      ],
      badge: 'Paso 1',
    },
    {
      step: 2,
      time: '5 minutos',
      title: 'Sincronización con Booking y Airbnb',
      subtitle: 'Migración instantánea sin perder reservas',
      description:
        'Si ya tienes reservas tomadas en Airbnb o Booking, solo copias el enlace de calendario (iCal) de cada canal y lo pegas en Loomi Suite. En segundos se importan todas tus reservas futuras y las fechas se bloquean en simultáneo.',
      details: [
        'Cero riesgo de sobreventa (overbooking) desde el primer minuto',
        'Sincronización bidireccional automática cada pocos minutos',
        'Puedes cargar a mano en un clic las reservas que ya tenías anotadas en tu cuaderno o Excel',
      ],
      badge: 'Paso 2',
    },
    {
      step: 3,
      time: '4 minutos',
      title: 'Motor de Reservas Directas y WhatsApp',
      subtitle: 'Cobro de señas y mensajes listos para enviar',
      description:
        'Obtienes tu enlace personalizado de reserva directa para compartir en Instagram, Google Maps o WhatsApp. Tus huéspedes pueden elegir fechas y señar directo a tu cuenta sin intermediarios del 18%.',
      details: [
        'Link web propio para enviar a huéspedes que te contactan por redes',
        'Plantillas de WhatsApp con datos de llegada, WiFi y check-in listas con un clic',
        'Acceso móvil para el personal de limpieza con su lista de tareas del día',
      ],
      badge: 'Paso 3',
    },
  ];

  return (
    <section id="onboarding" className="py-20 bg-zinc-900 text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-96 bg-rose-950/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold mb-3 border border-rose-500/30">
            <Zap className="w-3.5 h-3.5 text-rose-400" />
            <span>Puesta en Marcha en 15 Minutos</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            ¿Cómo es el Onboarding de este modelo?
          </h2>
          <p className="mt-3 text-base text-zinc-300 leading-relaxed">
            Sin semanas de capacitación, sin cursos complicados y sin técnicos instalando servidores. Así de rápido y transparente pasas del cuaderno o Excel a operar con Loomi Suite:
          </p>
        </div>

        {/* Step Navigation Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {steps.map((s) => (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
                activeStep === s.step
                  ? 'bg-zinc-800 border-rose-500 shadow-lg shadow-rose-900/20'
                  : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700 text-zinc-400'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                    activeStep === s.step
                      ? 'bg-rose-500 text-white'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {s.badge}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                  <Clock className="w-3 h-3 text-rose-400" />
                  {s.time}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">{s.title}</h3>
              <p className="text-xs text-zinc-400 line-clamp-2">{s.subtitle}</p>
            </button>
          ))}
        </div>

        {/* Active Step Detailed Card */}
        {steps.map(
          (s) =>
            activeStep === s.step && (
              <div
                key={s.step}
                className="bg-zinc-800/90 rounded-2xl p-6 sm:p-8 border border-zinc-700 shadow-xl"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-zinc-700/80">
                  <div>
                    <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
                      <span>Paso {s.step} de 3</span>
                      <span>•</span>
                      <span>{s.time} estimado</span>
                    </div>
                    <h3 className="text-2xl font-extrabold text-white">{s.title}</h3>
                    <p className="text-sm text-zinc-300 mt-2 max-w-2xl leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={onOpenDemo}
                      className="flex items-center gap-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Ver esto en la Demo</span>
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {s.details.map((detail, idx) => (
                    <div
                      key={idx}
                      className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-700/60 flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-zinc-200 leading-relaxed">{detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
        )}

        {/* Comparison: Why this is NOT an agency/heavy enterprise software */}
        <div className="mt-14 bg-zinc-800/40 rounded-2xl p-6 sm:p-8 border border-zinc-800">
          <h4 className="text-base font-bold text-white text-center mb-6">
            Diferencia en Onboarding: Sistemas Tradicionales vs. Loomi Suite
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-red-950/20 border border-red-900/40 p-5 rounded-xl">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider block mb-2">
                ❌ Sistemas Tradicionales o de Inmobiliarias
              </span>
              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 shrink-0 font-bold">•</span>
                  <span>Cobran costos de "implementación" o "capacitación inicial" de cientos de dólares.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 shrink-0 font-bold">•</span>
                  <span>Diseñados para inmobiliarias de 300 unidades o cadenas de 500 habitaciones con 100 botones que jamás vas a usar.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 shrink-0 font-bold">•</span>
                  <span>Tardan de 2 a 4 semanas en quedar operativos y exigen leer manuales interminables.</span>
                </li>
              </ul>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-900/40 p-5 rounded-xl">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-2">
                ✅ Modelo Loomi Suite
              </span>
              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 shrink-0 font-bold">•</span>
                  <span><strong>Autogestionable en 15 minutos:</strong> Te registras, cargas tus cabañas y ya estás sincronizando.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 shrink-0 font-bold">•</span>
                  <span><strong>Migración Concierge 100% Bonificada:</strong> ¿Tenés un Excel histórico con reservas? Nos lo envías y nuestro equipo te lo deja cargado en 24 hs sin costo.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 shrink-0 font-bold">•</span>
                  <span><strong>Sin permanencia ni comisiones:</strong> No pagas porcentaje sobre tus reservas directas y cancelas cuando quieras.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Concierge VIP Highlight Card */}
          <div className="mt-8 bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-amber-950/40 border border-emerald-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Garantía de Migración Cero Estrés
              </div>
              <h4 className="text-base font-bold text-white">
                ¿Te da pereza o miedo pasar tu planilla de reservas actual?
              </h4>
              <p className="text-xs text-zinc-300 max-w-2xl">
                Envíanos tu archivo (Excel, CSV o fotos de tu agenda) por WhatsApp. Nosotros estructuramos y cargamos tus reservas pasadas y futuras en menos de 24 hs hábiles. <strong>100% bonificado para nuevos usuarios.</strong>
              </p>
            </div>
            <button
              onClick={onOpenContact}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-emerald-950/50 flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Pedir Migración Asistida</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onOpenContact}
              className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>¿Tenés dudas sobre cómo migrar tu alojamiento? Habla con nosotros por WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
