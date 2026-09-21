import React from 'react';
import { Play, CheckCircle2, ShieldCheck, ArrowRight, Calendar, Sparkles, BellRing, Smartphone } from 'lucide-react';

interface HeroProps {
  onOpenDemo: () => void;
  onOpenContact: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenDemo, onOpenContact }) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 bg-gradient-to-b from-white via-zinc-50/50 to-white">
      {/* Background soft ambient accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40">
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-rose-200/50 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-amber-100/50 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto">
          {/* Trust pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>El PMS ágil para Complejos de Cabañas, B&B, Hostales y Posadas</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-900 tracking-tight leading-[1.12]">
            El software simple para tus cabañas y habitaciones, <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-red-600 to-rose-700">sin la pesadez de los sistemas hoteleros gigantes</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-zinc-600 leading-relaxed max-w-2xl mx-auto font-normal">
            Hecho para alojamientos independientes de <strong>4 a 30+ unidades</strong>. Reemplaza el cuaderno o el Excel con un <strong>rack visual intuitivo</strong>: sincroniza Booking y Airbnb sin dobles reservas, organiza la limpieza por cabaña/habitación y cobra reservas directas por WhatsApp sin pagar 18% de comisiones.
          </p>

          {/* Accommodation Types Badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
            <span className="px-3 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-semibold">
              🌲 Complejos de cabañas
            </span>
            <span className="px-3 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-semibold">
              ☕ Bed & Breakfast (B&B)
            </span>
            <span className="px-3 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-semibold">
              🛏️ Hostales independientes
            </span>
            <span className="px-3 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-semibold">
              🏡 Posadas y lodges turísticos
            </span>
          </div>

          {/* Primary CTA buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              id="btn-hero-demo"
              onClick={onOpenDemo}
              className="w-full sm:w-auto flex items-center justify-center gap-3 text-base font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-98 px-8 py-4 rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
              </div>
              <span>Probar Demo Interactiva en Vivo</span>
              <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#preguntas-clave"
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-semibold text-zinc-700 hover:text-zinc-900 bg-white hover:bg-zinc-100 border border-zinc-300 px-6 py-4 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              ¿Qué hace y cuánto cuesta? (Ver las 4 respuestas)
            </a>
          </div>

          {/* Micro-guarantees */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-zinc-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Prueba la demo sin tarjeta ni registro
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Datos ficticios interactivos en tu navegador
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Cero riesgo de sobreventa (Overbooking)
            </span>
          </div>
        </div>

        {/* Live Preview Teaser Card */}
        <div className="mt-12 lg:mt-16 max-w-5xl mx-auto">
          <div className="relative rounded-2xl bg-zinc-900 p-2 sm:p-3 shadow-2xl shadow-zinc-900/20 border border-zinc-800">
            {/* Window control dots and banner */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 font-mono text-[11px] text-zinc-400 hidden sm:inline">loomisuite.com/panel/demo</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Sincronización Activa: 4 canales
                </span>
              </div>
            </div>

            {/* Simulated Live UI Preview */}
            <div className="bg-zinc-50 rounded-xl p-4 sm:p-6 text-zinc-800">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">Rack de Cabañas y Habitaciones</h3>
                  <p className="text-xs text-zinc-500">Vista rápida de tus cabañas y habitaciones hoy en tiempo real</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenDemo}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Abrir Demo Completa Interactiva
                  </button>
                </div>
              </div>

              {/* 4 Mini Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
                  <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">Ingresos Este Mes</span>
                  <span className="text-xl font-extrabold text-zinc-900">$3.840 USD</span>
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">+24% vs mes anterior</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
                  <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">Tasa de Ocupación</span>
                  <span className="text-xl font-extrabold text-zinc-900">89,2%</span>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">26 de 29 noches ocupadas</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
                  <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">Check-ins Hoy</span>
                  <span className="text-xl font-extrabold text-rose-600">2 Huéspedes</span>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">Códigos WhatsApp enviados</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
                  <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">Tarifa Promedio Noche</span>
                  <span className="text-xl font-extrabold text-indigo-600">$85 USD</span>
                  <span className="text-[10px] text-zinc-500 font-medium block mt-0.5">ADR sobre noches vendidas</span>
                </div>
              </div>

              {/* Sample Upcoming Action Row */}
              <div className="mt-4 bg-amber-50/80 border border-amber-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <BellRing className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-amber-900">Próximo Check-out: Claire Dupont (Booking.com) a las 11:00 hs</span>
                    <p className="text-amber-800 text-[11px]">Personal de limpieza notificado para Cabaña 2 (Los Bananos). Próximo ingreso a las 15:00 hs.</p>
                  </div>
                </div>
                <button
                  onClick={onOpenDemo}
                  className="text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Interactuar en la Demo →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Proof Numbers Bar */}
        <div className="mt-16 border-y border-zinc-200/80 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-extrabold text-zinc-900 font-['Outfit']">+850</div>
            <div className="text-xs text-zinc-500 mt-1 font-medium">Cabañas y habitaciones activas</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-rose-600 font-['Outfit']">0</div>
            <div className="text-xs text-zinc-500 mt-1 font-medium">Dobles reservas (overbookings)</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-zinc-900 font-['Outfit']">15 min</div>
            <div className="text-xs text-zinc-500 mt-1 font-medium">Puesta en marcha (Onboarding)</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-600 font-['Outfit']">+30%</div>
            <div className="text-xs text-zinc-500 mt-1 font-medium">Más margen con reservas directas</div>
          </div>
        </div>
      </div>
    </section>
  );
};
