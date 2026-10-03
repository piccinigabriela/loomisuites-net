import React from 'react';
import { Play, CheckCircle2, ShieldCheck, ArrowRight, Sparkles, BellRing } from 'lucide-react';

interface HeroProps {
  onOpenDemo: () => void;
  onOpenContact: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenDemo, onOpenContact }) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-20 bg-[#EFECE5] dark:bg-[#1A1A1A] text-[#222222] dark:text-[#EFECE5] transition-colors">
      {/* Background soft ambient accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-25">
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-[#E1500A]/15 dark:bg-[#E1500A]/15 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-[#A3A3A3]/20 dark:bg-[#A3A3A3]/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto">
          {/* Trust pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFFFF] dark:bg-[#252525] border border-[#DCD8CE] dark:border-[#383838] text-[#222222] dark:text-[#EFECE5] text-xs font-bold mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#E1500A]" />
            <span>El software simple para Cabañas, Glampings, Posadas y Departamentos</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#222222] dark:text-[#FFFFFF] tracking-tight leading-[1.12]">
            El software simple para tu complejo, <span className="text-[#E1500A]">sin la pesadez de los sistemas hoteleros gigantes</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-[#666666] dark:text-[#A3A3A3] leading-relaxed max-w-2xl mx-auto font-normal">
            Hecho para alojamientos independientes de <strong>4 a 30+ unidades</strong>. Reemplaza el cuaderno o las planillas con un <strong>rack visual intuitivo</strong>: sincroniza Booking y Airbnb sin dobles reservas, organiza la limpieza en el celular y gestiona tus reservas directas de manera ágil.
          </p>

          {/* Accommodation Types Badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
            <span className="px-3.5 py-1.5 rounded-xl bg-[#FFFFFF] dark:bg-[#252525] border border-[#DCD8CE] dark:border-[#383838] text-[#222222] dark:text-[#EFECE5] text-xs font-bold">
              🌲 Complejos de cabañas
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-[#222222] dark:bg-[#E1500A] border border-[#222222] dark:border-[#E1500A] text-white text-xs font-extrabold shadow-xs">
              ⛺ Glampings & Domos
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-[#FFFFFF] dark:bg-[#252525] border border-[#DCD8CE] dark:border-[#383838] text-[#222222] dark:text-[#EFECE5] text-xs font-bold">
              🏢 Departamentos turísticos
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-[#FFFFFF] dark:bg-[#252525] border border-[#DCD8CE] dark:border-[#383838] text-[#222222] dark:text-[#EFECE5] text-xs font-bold">
              🏡 Posadas y lodges turísticos
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-[#FFFFFF] dark:bg-[#252525] border border-[#DCD8CE] dark:border-[#383838] text-[#222222] dark:text-[#EFECE5] text-xs font-bold">
              ☕ Bed & Breakfast (B&B)
            </span>
          </div>

          {/* Primary CTA buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              id="btn-hero-demo"
              onClick={onOpenDemo}
              className="w-full sm:w-auto flex items-center justify-center gap-3 text-base font-extrabold text-white bg-[#E1500A] hover:bg-[#C94305] active:scale-98 px-8 py-4 rounded-2xl shadow-xl shadow-[#E1500A]/30 transition-all cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
              </div>
              <span>Probar Demo Interactiva en Vivo</span>
              <ArrowRight className="w-4 h-4 text-white/90 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#preguntas-clave"
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-bold text-[#222222] dark:text-[#FFFFFF] hover:text-[#222222] dark:hover:text-white bg-[#FFFFFF] dark:bg-[#252525] hover:bg-[#F7F5F0] dark:hover:bg-[#2E2E2E] border border-[#DCD8CE] dark:border-[#383838] px-6 py-4 rounded-2xl transition-all cursor-pointer shadow-2xs"
            >
              ¿Qué hace y cuánto cuesta? (Ver las 4 respuestas)
            </a>
          </div>

          {/* Micro-guarantees */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-[#666666] dark:text-[#A3A3A3]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#E1500A]" />
              Prueba la demo sin tarjeta ni registro
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#E1500A]" />
              Datos ficticios interactivos en tu navegador
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#E1500A]" />
              Cero riesgo de sobreventa (Overbooking)
            </span>
          </div>
        </div>

        {/* Live Preview Teaser Card */}
        <div className="mt-12 lg:mt-16 max-w-5xl mx-auto">
          <div className="relative rounded-3xl bg-[#222222] dark:bg-[#141414] p-2 sm:p-3 shadow-2xl shadow-black/25 border border-[#383838] dark:border-[#383838]">
            {/* Window control dots and banner */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#333333] text-xs text-[#A3A3A3]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#E1500A] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#A3A3A3] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#5A9C65] inline-block" />
                <span className="ml-2 font-mono text-[11px] text-[#A3A3A3] hidden sm:inline">loomisuite.net/panel/demo</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#2A2A2A] text-[#EFECE5] border border-[#3D3D3D] text-[11px] font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E1500A] animate-ping"></span>
                  Sincronización Activa: 4 canales
                </span>
              </div>
            </div>

            {/* Simulated Live UI Preview */}
            <div className="bg-[#FFFFFF] dark:bg-[#1E1E1E] rounded-2xl p-4 sm:p-6 text-[#222222] dark:text-[#EFECE5] border border-[#DCD8CE] dark:border-[#2D2D2D]">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#DCD8CE] dark:border-[#2D2D2D]">
                <div>
                  <h3 className="text-lg font-black text-[#222222] dark:text-[#FFFFFF]">Rack de Cabañas y Habitaciones</h3>
                  <p className="text-xs text-[#666666] dark:text-[#A3A3A3]">Vista rápida de tus cabañas y habitaciones hoy en tiempo real</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenDemo}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E1500A] hover:bg-[#C94305] text-white text-xs font-black transition-colors cursor-pointer shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Abrir Demo Completa Interactiva
                  </button>
                </div>
              </div>

              {/* 4 Mini Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <div className="bg-[#EFECE5] dark:bg-[#252525] p-3.5 rounded-2xl border border-[#DCD8CE] dark:border-[#383838] shadow-2xs">
                  <span className="text-[11px] font-bold text-[#666666] dark:text-[#A3A3A3] uppercase tracking-wider block">Ingresos Este Mes</span>
                  <span className="text-xl font-black text-[#222222] dark:text-[#FFFFFF]">$3.840 USD</span>
                  <span className="text-[10px] text-[#222222] dark:text-[#EFECE5] font-semibold block mt-0.5">+24% vs mes anterior</span>
                </div>
                <div className="bg-[#EFECE5] dark:bg-[#252525] p-3.5 rounded-2xl border border-[#DCD8CE] dark:border-[#383838] shadow-2xs">
                  <span className="text-[11px] font-bold text-[#666666] dark:text-[#A3A3A3] uppercase tracking-wider block">Tasa de Ocupación</span>
                  <span className="text-xl font-black text-[#222222] dark:text-[#FFFFFF]">89,2%</span>
                  <span className="text-[10px] text-[#666666] dark:text-[#A3A3A3] block mt-0.5">26 de 29 noches ocupadas</span>
                </div>
                <div className="bg-[#EFECE5] dark:bg-[#252525] p-3.5 rounded-2xl border border-[#DCD8CE] dark:border-[#383838] shadow-2xs">
                  <span className="text-[11px] font-bold text-[#666666] dark:text-[#A3A3A3] uppercase tracking-wider block">Check-ins Hoy</span>
                  <span className="text-xl font-black text-[#E1500A]">2 Huéspedes</span>
                  <span className="text-[10px] text-[#666666] dark:text-[#A3A3A3] block mt-0.5">Códigos WhatsApp enviados</span>
                </div>
                <div className="bg-[#EFECE5] dark:bg-[#252525] p-3.5 rounded-2xl border border-[#DCD8CE] dark:border-[#383838] shadow-2xs">
                  <span className="text-[11px] font-bold text-[#666666] dark:text-[#A3A3A3] uppercase tracking-wider block">Tarifa Promedio Noche</span>
                  <span className="text-xl font-black text-[#222222] dark:text-[#FFFFFF]">$85 USD</span>
                  <span className="text-[10px] text-[#666666] dark:text-[#A3A3A3] font-medium block mt-0.5">ADR sobre noches vendidas</span>
                </div>
              </div>

              {/* Sample Upcoming Action Row */}
              <div className="mt-4 bg-[#EFECE5] dark:bg-[#252525] border border-[#DCD8CE] dark:border-[#383838] rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#222222] text-[#E1500A] flex items-center justify-center shrink-0">
                    <BellRing className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#222222] dark:text-[#FFFFFF]">Próximo Check-out: Claire Dupont (Booking.com) a las 11:00 hs</span>
                    <p className="text-[#666666] dark:text-[#A3A3A3] text-[11px]">Personal de limpieza notificado para Depto 102. Próximo ingreso a las 15:00 hs.</p>
                  </div>
                </div>
                <button
                  onClick={onOpenDemo}
                  className="text-xs font-extrabold text-[#222222] dark:text-[#EFECE5] bg-[#FFFFFF] dark:bg-[#1E1E1E] hover:bg-[#F7F5F0] dark:hover:bg-[#282828] px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0 border border-[#DCD8CE] dark:border-[#383838]"
                >
                  Interactuar en la Demo →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Proof Numbers Bar */}
        <div className="mt-16 border-y border-[#DCD8CE] dark:border-[#2D2D2D] py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-black text-[#222222] dark:text-[#FFFFFF]">+850</div>
            <div className="text-xs text-[#666666] dark:text-[#A3A3A3] mt-1 font-semibold">Cabañas y habitaciones activas</div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#E1500A]">0</div>
            <div className="text-xs text-[#666666] dark:text-[#A3A3A3] mt-1 font-semibold">Dobles reservas (overbookings)</div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#222222] dark:text-[#FFFFFF]">15 min</div>
            <div className="text-xs text-[#666666] dark:text-[#A3A3A3] mt-1 font-semibold">Puesta en marcha (Onboarding)</div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#E1500A]">+30%</div>
            <div className="text-xs text-[#666666] dark:text-[#A3A3A3] mt-1 font-semibold">Más margen con reservas directas</div>
          </div>
        </div>
      </div>
    </section>
  );
};

