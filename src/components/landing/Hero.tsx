import React from 'react';
import { Play, CheckCircle2, ShieldCheck, ArrowRight, Sparkles, BellRing } from 'lucide-react';

interface HeroProps {
  onOpenDemo: () => void;
  onOpenContact: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenDemo, onOpenContact }) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 bg-[#fbf9f5] dark:bg-[#141414] text-[#1c1b18] dark:text-[#f4f2ee] transition-colors">
      {/* Background soft ambient accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-30">
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-[#d88d5e]/30 dark:bg-[#c46d45]/10 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-[#78b37e]/20 dark:bg-[#4f7858]/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto">
          {/* Trust pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f4eee7] dark:bg-[#28201a] border border-[#e4d6c9] dark:border-[#48372b] text-[#9c512a] dark:text-[#d88d5e] text-xs font-bold mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#c46d45] dark:text-[#d88d5e]" />
            <span>El PMS ágil para Cabañas, Glampings, Domos, Posadas y Departamentos</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1c1b18] dark:text-[#ffffff] tracking-tight leading-[1.12]">
            El software simple para tus cabañas, glampings y departamentos, <span className="text-[#c46d45] dark:text-[#d88d5e]">sin la pesadez de los sistemas hoteleros gigantes</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-[#66625a] dark:text-[#a8a5a0] leading-relaxed max-w-2xl mx-auto font-normal">
            Hecho para alojamientos independientes de <strong>4 a 30+ unidades</strong>. Reemplaza el cuaderno o el Excel con un <strong>rack visual intuitivo</strong>: sincroniza Booking y Airbnb sin dobles reservas, organiza la limpieza y extras de tus unidades y gestiona tus reservas directas de manera ágil.
          </p>

          {/* Accommodation Types Badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-xl bg-[#edeae2] dark:bg-[#202020] border border-[#ded9cd] dark:border-[#333] text-[#3c3933] dark:text-[#d8d5cf] text-xs font-semibold">
              🌲 Complejos de cabañas
            </span>
            <span className="px-3 py-1 rounded-xl bg-[#f8efe6] dark:bg-[#2a2017] border border-[#e2cfbd] dark:border-[#4a3625] text-[#9c512a] dark:text-[#d88d5e] text-xs font-bold">
              ⛺ Glampings & Domos
            </span>
            <span className="px-3 py-1 rounded-xl bg-[#edeae2] dark:bg-[#202020] border border-[#ded9cd] dark:border-[#333] text-[#3c3933] dark:text-[#d8d5cf] text-xs font-semibold">
              🏢 Departamentos turísticos
            </span>
            <span className="px-3 py-1 rounded-xl bg-[#edeae2] dark:bg-[#202020] border border-[#ded9cd] dark:border-[#333] text-[#3c3933] dark:text-[#d8d5cf] text-xs font-semibold">
              🏡 Posadas y lodges turísticos
            </span>
            <span className="px-3 py-1 rounded-xl bg-[#edeae2] dark:bg-[#202020] border border-[#ded9cd] dark:border-[#333] text-[#3c3933] dark:text-[#d8d5cf] text-xs font-semibold">
              ☕ Bed & Breakfast (B&B)
            </span>
          </div>

          {/* Primary CTA buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              id="btn-hero-demo"
              onClick={onOpenDemo}
              className="w-full sm:w-auto flex items-center justify-center gap-3 text-base font-bold text-white bg-[#c46d45] hover:bg-[#b85e35] active:scale-98 px-8 py-4 rounded-xl shadow-lg shadow-[#c46d45]/25 transition-all cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
              </div>
              <span>Probar Demo Interactiva en Vivo</span>
              <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#preguntas-clave"
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-semibold text-[#3c3933] dark:text-[#d8d5cf] hover:text-[#1c1b18] dark:hover:text-white bg-white dark:bg-[#202020] hover:bg-[#f3f0ea] dark:hover:bg-[#2a2a2a] border border-[#ded9cd] dark:border-[#3a3a3a] px-6 py-4 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              ¿Qué hace y cuánto cuesta? (Ver las 4 respuestas)
            </a>
          </div>

          {/* Micro-guarantees */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-[#78746c] dark:text-[#8e8c87]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#4f7858] dark:text-[#78b37e]" />
              Prueba la demo sin tarjeta ni registro
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#4f7858] dark:text-[#78b37e]" />
              Datos ficticios interactivos en tu navegador
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#4f7858] dark:text-[#78b37e]" />
              Cero riesgo de sobreventa (Overbooking)
            </span>
          </div>
        </div>

        {/* Live Preview Teaser Card */}
        <div className="mt-12 lg:mt-16 max-w-5xl mx-auto">
          <div className="relative rounded-2xl bg-[#1c1a18] dark:bg-[#1a1a1a] p-2 sm:p-3 shadow-2xl shadow-black/25 border border-[#383028] dark:border-[#333]">
            {/* Window control dots and banner */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#2d251f] dark:border-[#2a2a2a] text-xs text-[#a8a49e]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#d88d5e] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#d9ab6a] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#78b37e] inline-block" />
                <span className="ml-2 font-mono text-[11px] text-[#8e8a83] hidden sm:inline">loomisuite.net/panel/demo</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#202d20] text-[#a4cca8] border border-[#344836] text-[11px] font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#82ba8f] animate-ping"></span>
                  Sincronización Activa: 4 canales
                </span>
              </div>
            </div>

            {/* Simulated Live UI Preview */}
            <div className="bg-[#f8f6f2] dark:bg-[#141414] rounded-xl p-4 sm:p-6 text-[#2c2a26] dark:text-[#e4e1dc] border border-[#e5e1d8] dark:border-[#282828]">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#e5e1d8] dark:border-[#282828]">
                <div>
                  <h3 className="text-lg font-bold text-[#1c1b18] dark:text-[#f4f2ee]">Rack de Cabañas y Habitaciones</h3>
                  <p className="text-xs text-[#78746c] dark:text-[#8e8c87]">Vista rápida de tus cabañas y habitaciones hoy en tiempo real</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenDemo}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#c46d45] hover:bg-[#b85e35] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Abrir Demo Completa Interactiva
                  </button>
                </div>
              </div>

              {/* 4 Mini Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <div className="bg-white dark:bg-[#1c1c1c] p-3 rounded-xl border border-[#e6e2d8] dark:border-[#2e2e2e] shadow-2xs">
                  <span className="text-[11px] font-bold text-[#78746c] dark:text-[#8e8c87] uppercase tracking-wider block">Ingresos Este Mes</span>
                  <span className="text-xl font-extrabold text-[#1c1b18] dark:text-[#f4f2ee]">$3.840 USD</span>
                  <span className="text-[10px] text-[#4f7858] dark:text-[#78b37e] font-semibold block mt-0.5">+24% vs mes anterior</span>
                </div>
                <div className="bg-white dark:bg-[#1c1c1c] p-3 rounded-xl border border-[#e6e2d8] dark:border-[#2e2e2e] shadow-2xs">
                  <span className="text-[11px] font-bold text-[#78746c] dark:text-[#8e8c87] uppercase tracking-wider block">Tasa de Ocupación</span>
                  <span className="text-xl font-extrabold text-[#1c1b18] dark:text-[#f4f2ee]">89,2%</span>
                  <span className="text-[10px] text-[#78746c] dark:text-[#8e8c87] block mt-0.5">26 de 29 noches ocupadas</span>
                </div>
                <div className="bg-white dark:bg-[#1c1c1c] p-3 rounded-xl border border-[#e6e2d8] dark:border-[#2e2e2e] shadow-2xs">
                  <span className="text-[11px] font-bold text-[#78746c] dark:text-[#8e8c87] uppercase tracking-wider block">Check-ins Hoy</span>
                  <span className="text-xl font-extrabold text-[#c46d45] dark:text-[#d88d5e]">2 Huéspedes</span>
                  <span className="text-[10px] text-[#78746c] dark:text-[#8e8c87] block mt-0.5">Códigos WhatsApp enviados</span>
                </div>
                <div className="bg-white dark:bg-[#1c1c1c] p-3 rounded-xl border border-[#e6e2d8] dark:border-[#2e2e2e] shadow-2xs">
                  <span className="text-[11px] font-bold text-[#78746c] dark:text-[#8e8c87] uppercase tracking-wider block">Tarifa Promedio Noche</span>
                  <span className="text-xl font-extrabold text-[#3a6878] dark:text-[#76aab8]">$85 USD</span>
                  <span className="text-[10px] text-[#78746c] dark:text-[#8e8c87] font-medium block mt-0.5">ADR sobre noches vendidas</span>
                </div>
              </div>

              {/* Sample Upcoming Action Row */}
              <div className="mt-4 bg-[#fbf5eb] dark:bg-[#252019] border border-[#ecd9be] dark:border-[#4d3d2c] rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#d99143] text-white flex items-center justify-center shrink-0">
                    <BellRing className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#7d4812] dark:text-[#e4a86b]">Próximo Check-out: Claire Dupont (Booking.com) a las 11:00 hs</span>
                    <p className="text-[#8e5c26] dark:text-[#c49a6c] text-[11px]">Personal de limpieza notificado para Depto 102. Próximo ingreso a las 15:00 hs.</p>
                  </div>
                </div>
                <button
                  onClick={onOpenDemo}
                  className="text-xs font-bold text-[#7d4812] dark:text-[#f4eeea] bg-[#fae8cb] dark:bg-[#3a2c1e] hover:bg-[#f5deb8] dark:hover:bg-[#4a3a2a] px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 border border-[#ecd9be] dark:border-[#5a432e]"
                >
                  Interactuar en la Demo →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Proof Numbers Bar */}
        <div className="mt-16 border-y border-[#ded9cd] dark:border-[#2a2a2a] py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-extrabold text-[#1c1b18] dark:text-[#f4f2ee]">+850</div>
            <div className="text-xs text-[#78746c] dark:text-[#8e8c87] mt-1 font-medium">Cabañas y habitaciones activas</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#c46d45] dark:text-[#d88d5e]">0</div>
            <div className="text-xs text-[#78746c] dark:text-[#8e8c87] mt-1 font-medium">Dobles reservas (overbookings)</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#1c1b18] dark:text-[#f4f2ee]">15 min</div>
            <div className="text-xs text-[#78746c] dark:text-[#8e8c87] mt-1 font-medium">Puesta en marcha (Onboarding)</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#4f7858] dark:text-[#78b37e]">+30%</div>
            <div className="text-xs text-[#78746c] dark:text-[#8e8c87] mt-1 font-medium">Más margen con reservas directas</div>
          </div>
        </div>
      </div>
    </section>
  );
};

