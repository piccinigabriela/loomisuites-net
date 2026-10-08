import React from 'react';
import { Play } from 'lucide-react';

interface PricingProps {
  onOpenDemo: () => void;
  onOpenContact: (planName?: string) => void;
}

export const Pricing: React.FC<PricingProps> = ({ onOpenDemo, onOpenContact }) => {
  return (
    <section id="precios" className="py-14 sm:py-20 bg-[#F8F9FA] dark:bg-[#0E0F12] border-b border-gray-100 dark:border-zinc-800 transition-colors font-['Inter',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado Zen */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[10px] font-bold tracking-wider text-[#E67E22] uppercase bg-orange-50 dark:bg-orange-950/40 px-3 py-1 rounded-full border border-orange-200/50">
            Planes & Tarifas Transparentes
          </span>
          <h2 className="text-2xl sm:text-4xl font-light text-gray-900 dark:text-white tracking-tight mt-3">
            Inversión fija por <span className="font-semibold text-gray-800 dark:text-gray-100">complejo entero</span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-zinc-400 font-light leading-relaxed">
            Sin costos ocultos ni cobro por habitación. Sin comisiones sobre tus reservas.
          </p>
        </div>

        {/* SECCIÓN: PLANES Y TARIFAS TRANSPARENTES (COMPLEJO ENTERO) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          
          {/* PLAN 1: PROPIETARIO SIMPLE (Ideado para complejos de 4 o 5 cabañas sin personal) */}
          <div className="bg-white dark:bg-[#18191E] rounded-3xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.01)] border border-gray-100 dark:border-zinc-800/80 flex flex-col justify-between relative group hover:border-orange-200/50 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold tracking-wider text-orange-500 uppercase bg-orange-50 dark:bg-orange-950/40 px-2.5 py-1 rounded-md inline-block">
                  Plan Propietario
                </span>
                <span className="text-xs font-medium text-gray-400">Hasta 5 unidades</span>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-light text-gray-900 dark:text-white tracking-tight">
                  <span className="font-semibold text-gray-800 dark:text-gray-100">Loomi</span>
                </h3>
                <div className="pt-2">
                  <div className="text-4xl font-light text-gray-900 dark:text-white tracking-tight">
                    $45.000 <span className="text-xs text-gray-400 font-medium">/mes (Final ARS)</span>
                  </div>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                    Precio por todo el complejo • Sin costos por habitación
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-400 font-medium leading-relaxed pt-2">
                La herramienta esencial para dueños que gestionan todo de forma autónoma desde el celular.
              </p>

              {/* Lista de Funciones Incluidas (Modo Light) */}
              <ul className="space-y-2.5 text-xs font-medium text-gray-600 dark:text-zinc-300 pt-4 border-t border-gray-50 dark:border-zinc-800/60">
                <li className="flex items-center gap-2 text-gray-700 dark:text-zinc-200">
                  <span className="text-emerald-500 font-bold">✓</span> Calendario Rack (Modo Light optimizado para móvil)
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-zinc-200">
                  <span className="text-emerald-500 font-bold">✓</span> Gestión de Reservas Directas & iCal
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-zinc-200">
                  <span className="text-emerald-500 font-bold">✓</span> Reportes de Rendimiento Básicos
                </li>
                <li className="flex items-center gap-2 text-gray-400 dark:text-zinc-500 line-through font-light">
                  <span className="text-gray-300 dark:text-zinc-600">✕</span> Módulo Housekeeping (Mucamas/Mantenimiento)
                </li>
                <li className="flex items-center gap-2 text-gray-400 dark:text-zinc-500 line-through font-light">
                  <span className="text-gray-300 dark:text-zinc-600">✕</span> Modo Recepción Multiusuario
                </li>
              </ul>
            </div>

            <div className="pt-6 space-y-2">
              <button
                onClick={() => onOpenContact('Plan Loomi ($45.000/mes)')}
                className="w-full bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 font-bold py-3 rounded-xl text-xs transition-all cursor-pointer shadow-xs"
              >
                Comenzar Prueba de 15 días gratis
              </button>
              <button
                onClick={onOpenDemo}
                className="w-full py-2 text-xs text-gray-400 hover:text-[#E67E22] transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-light"
              >
                <Play className="w-3 h-3 text-[#E67E22] fill-[#E67E22]" />
                <span>Ver demo en vivo</span>
              </button>
            </div>
          </div>

          {/* PLAN 2: LOOMI SUITE (El plan máster ilimitado con Housekeeping y Recepción) */}
          <div className="bg-gradient-to-b from-white to-[#FDFBF9] dark:from-[#18191E] dark:to-[#1e1c19] rounded-3xl p-8 shadow-[0_4px_25px_rgba(0,0,0,0.015)] border-2 border-orange-200/60 dark:border-orange-900/60 flex flex-col justify-between relative">
            {/* Badge Destacado */}
            <div className="absolute -top-3 right-6">
              <span className="bg-[#E67E22] text-white text-[9px] font-bold tracking-widest px-3 py-1 rounded-full uppercase shadow-sm">
                Recomendado
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold tracking-wider text-orange-600 dark:text-orange-400 uppercase bg-orange-100/50 dark:bg-orange-950/50 px-2.5 py-1 rounded-md inline-block">
                  Plan Complejo
                </span>
                <span className="text-xs font-medium text-[#E67E22]">Unidades Ilimitadas</span>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-light text-gray-900 dark:text-white tracking-tight">
                  Loomi <span className="font-semibold text-gray-800 dark:text-gray-100">Suite</span>
                </h3>
                <div className="pt-2">
                  <div className="text-4xl font-light text-gray-900 dark:text-white tracking-tight">
                    $60.000 <span className="text-xs text-gray-400 font-medium">/mes (Final ARS)</span>
                  </div>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                    Precio fijo por todo el complejo • Todo incluido
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-400 font-medium leading-relaxed pt-2">
                La solución definitiva para complejos medianos y grandes que operan con personal de recepción y equipos de limpieza.
              </p>

              {/* Lista de Funciones Completas */}
              <ul className="space-y-2.5 text-xs font-medium text-gray-600 dark:text-zinc-300 pt-4 border-t border-gray-50 dark:border-zinc-800/60">
                <li className="flex items-center gap-2 text-gray-700 dark:text-zinc-200 font-semibold">
                  <span className="text-emerald-500 font-bold">✓</span> Todo lo del Plan Loomi e iCal avanzado
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-zinc-200">
                  <span className="text-emerald-500 font-bold">✓</span> Módulo Housekeeping Completo (Semáforo de Mucamas en vivo)
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-zinc-200">
                  <span className="text-emerald-500 font-bold">✓</span> Modo Recepción con Roles de Usuario Separados
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-zinc-200">
                  <span className="text-emerald-500 font-bold">✓</span> Asistente Xenia AI (Voz & Copiloto 24/7)
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-zinc-200">
                  <span className="text-emerald-500 font-bold">✓</span> 3 Modelos Web Oficiales + Portal de Bienvenida del Huésped
                </li>
              </ul>
            </div>

            <div className="pt-6 space-y-2">
              <button
                onClick={() => onOpenContact('Plan Loomi Suite ($60.000/mes)')}
                className="w-full bg-[#E67E22] text-white font-bold py-3 rounded-xl text-xs hover:bg-[#d35400] transition-all cursor-pointer shadow-md shadow-orange-500/10"
              >
                Activar Loomi Suite
              </button>
              <button
                onClick={onOpenDemo}
                className="w-full py-2 text-xs text-gray-400 hover:text-[#E67E22] transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-light"
              >
                <Play className="w-3 h-3 text-[#E67E22] fill-[#E67E22]" />
                <span>Ver demo en vivo</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
